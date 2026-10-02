import "server-only";

import type { Collection } from "mongodb";
import { menuById, prepMinutesFor, unitPrice } from "@/data/menu";
import { cafe } from "@/data/cafe";
import { getDb } from "@/lib/db";
import { SEED_SOLD_OUT, seedOrders } from "@/lib/seed";
import {
  CANCEL_WINDOW_MS,
  SERVICE_FLOW,
  cartTotal,
  isSettled,
  type Guest,
  type Order,
  type OrderLine,
  type OrderStatus,
  type OrderType,
  type PaymentMethod,
  type ServerState,
} from "@/lib/orderTypes";

/* ============================================================
   Every read and write of the shared order state.

   The browser never talks to Mongo directly — it goes through the
   route handlers in /api, which call into here. That keeps the
   connection string on the server and means a phone and the counter
   laptop are genuinely looking at the same data.
   ============================================================ */

/** Stored shape: the Order, with its id doubling as the Mongo _id. */
type OrderDoc = Order & { _id: string };

const META_ID = "state";
type MetaDoc = { _id: string; soldOut: string[]; codeSeq: number };

async function orders(): Promise<Collection<OrderDoc>> {
  return (await getDb()).collection<OrderDoc>("orders");
}

async function meta(): Promise<Collection<MetaDoc>> {
  return (await getDb()).collection<MetaDoc>("meta");
}

/** First run on an empty database lands the demo data so nothing looks broken. */
async function ensureSeeded(): Promise<void> {
  const col = await orders();
  if ((await col.estimatedDocumentCount()) > 0) return;

  const seeded = seedOrders(Date.now());
  if (seeded.length) {
    await col.insertMany(seeded.map((order) => ({ ...order, _id: order.id })));
  }
  await (await meta()).updateOne(
    { _id: META_ID },
    { $setOnInsert: { soldOut: SEED_SOLD_OUT, codeSeq: 2205 + seeded.length } },
    { upsert: true },
  );
}

export async function getState(): Promise<ServerState> {
  await ensureSeeded();

  const [rows, state] = await Promise.all([
    (await orders())
      .find({}, { projection: { _id: 0 } })
      .sort({ placedAt: -1 })
      .limit(300)
      .toArray(),
    (await meta()).findOne({ _id: META_ID }),
  ]);

  return { orders: rows as Order[], soldOut: state?.soldOut ?? [] };
}

/**
 * When the kitchen should have this at the pass. The slowest item sets the
 * floor; everything already in the kitchen pushes it out a little, so a guest
 * ordering into a rush is told the truth rather than the best case.
 */
function estimateReadyBy(lines: OrderLine[], now: number, queueAhead: number): number {
  const slowest = lines.reduce((max, line) => {
    const item = menuById.get(line.itemId);
    return item ? Math.max(max, prepMinutesFor(item)) : max;
  }, 4);
  const queuePenalty = Math.min(10, Math.floor(queueAhead / 2) * 2);
  return now + (slowest + queuePenalty) * 60_000;
}

/** Order numbers come from a counter so two phones can never collide on one. */
async function nextCode(): Promise<string> {
  const result = await (await meta()).findOneAndUpdate(
    { _id: META_ID },
    { $inc: { codeSeq: 1 }, $setOnInsert: { soldOut: [] } },
    { upsert: true, returnDocument: "after" },
  );
  return `K-${result?.codeSeq ?? Date.now() % 10000}`;
}

/**
 * Rebuilds every line from the menu, keeping only what the guest is entitled to
 * choose: the item, the quantity, the options and a note. Names and prices come
 * from the server's own copy of the menu, so a crafted request cannot order a
 * one-rupee pizza.
 */
function priceLines(incoming: OrderLine[], soldOut: string[]): OrderLine[] {
  const lines: OrderLine[] = [];

  for (const line of incoming) {
    const item = menuById.get(line.itemId);
    if (!item || soldOut.includes(line.itemId)) continue;

    const qty = Math.max(1, Math.min(50, Math.floor(line.qty)));

    // Drop any option the menu does not actually offer.
    const chosen: Record<string, string> = {};
    for (const group of item.options ?? []) {
      const picked = line.options?.[group.label];
      if (picked && group.choices.some((choice) => choice.name === picked)) {
        chosen[group.label] = picked;
      }
    }

    lines.push({
      itemId: item.id,
      name: item.name,
      base: item.price,
      price: unitPrice(item, chosen),
      qty,
      options: Object.keys(chosen).length ? chosen : undefined,
      note: line.note?.trim().slice(0, 140) || undefined,
    });
  }

  return lines;
}

export async function placeOrder(input: {
  table: string;
  lines: OrderLine[];
  orderType?: OrderType;
  guest?: Guest;
  note?: string;
}): Promise<Order | null> {
  if (!input.lines.length) return null;

  const { soldOut } = await getState();
  const lines = priceLines(input.lines, soldOut);
  if (!lines.length) return null;

  const now = Date.now();
  const kitchenLoad = (await getState()).orders.filter(
    (o) => o.status === "new" || o.status === "preparing",
  ).length;

  const orderType = input.orderType ?? "table";
  const packing = orderType === "takeaway" ? cafe.packingCharge : 0;

  const order: Order = {
    id: `o-${now}-${Math.round(Math.random() * 9973)}`,
    code: await nextCode(),
    table: input.table,
    orderType,
    guest: input.guest?.name || input.guest?.phone ? input.guest : undefined,
    lines,
    total: cartTotal(lines) + packing,
    packing: packing || undefined,
    status: "new",
    placedAt: now,
    updatedAt: now,
    note: input.note?.trim() || undefined,
    readyBy: estimateReadyBy(lines, now, kitchenLoad),
  };

  await (await orders()).insertOne({ ...order, _id: order.id });
  return order;
}

export type WriteResult = { ok: boolean; reason?: string };

/**
 * Moves an order one lane along the flow.
 *
 * `from` is the status the caller believed it was in. The update only matches
 * while that is still true, so two people tapping the same ticket on two
 * devices cannot double-advance it — the second one is told instead.
 */
export async function advanceOrder(id: string, from?: OrderStatus): Promise<WriteResult> {
  const col = await orders();
  const current = await col.findOne({ _id: id }, { projection: { status: 1 } });
  if (!current) return { ok: false, reason: "That ticket is no longer on the board." };
  if (isSettled(current.status)) return { ok: false, reason: "That ticket is already closed." };

  // Advancing walks the service lanes only. "paid" is reachable solely through
  // markPaid, which records how the money arrived — otherwise one extra tap
  // closes a bill with no payment method against it.
  const at = SERVICE_FLOW.indexOf(current.status);
  if (at === -1 || at === SERVICE_FLOW.length - 1) {
    return { ok: false, reason: "Settle this one with a payment method." };
  }
  const to = SERVICE_FLOW[at + 1];

  const result = await col.updateOne(
    { _id: id, ...(from ? { status: from } : {}) },
    { $set: { status: to, updatedAt: Date.now() } },
  );
  if (result.matchedCount === 0) {
    return { ok: false, reason: "Someone else moved this ticket first." };
  }
  return { ok: true };
}

export async function setOrderStatus(
  id: string,
  status: OrderStatus,
  from?: OrderStatus,
): Promise<WriteResult> {
  const result = await (await orders()).updateOne(
    { _id: id, ...(from ? { status: from } : {}) },
    { $set: { status, updatedAt: Date.now() } },
  );
  if (result.matchedCount === 0) {
    return { ok: false, reason: "Someone else moved this ticket first." };
  }
  return { ok: true };
}

/**
 * The guest saying they have sent the money. It does not close the bill — the
 * counter confirms against their own UPI notification, which is how a cafe
 * without a gateway actually works, and keeps "I have paid" from being a
 * button that settles a tab.
 */
export async function claimPayment(id: string, method: PaymentMethod): Promise<WriteResult> {
  const result = await (await orders()).updateOne(
    { _id: id, status: { $nin: ["paid", "cancelled", "refunded"] } },
    {
      $set: {
        paymentClaimedAt: Date.now(),
        claimedMethod: method,
        billRequested: false,
        updatedAt: Date.now(),
      },
    },
  );
  if (result.matchedCount === 0) return { ok: false, reason: "That ticket is already settled." };
  return { ok: true };
}

/** The counter pulling a ticket at any point before it is settled. */
export async function voidOrder(id: string): Promise<WriteResult> {
  const col = await orders();
  const current = await col.findOne({ _id: id }, { projection: { status: 1 } });
  if (!current) return { ok: false, reason: "That ticket is no longer on the board." };
  if (current.status === "paid") {
    return { ok: false, reason: "That one is paid — refund it instead." };
  }
  if (isSettled(current.status)) return { ok: false, reason: "That ticket is already closed." };

  const now = Date.now();
  await col.updateOne(
    { _id: id },
    { $set: { status: "cancelled" as OrderStatus, cancelledAt: now, cancelledBy: "counter", updatedAt: now } },
  );
  return { ok: true };
}

/**
 * Money back after payment. Flags the order and takes it out of the day's
 * takings — it does not reach the payment provider, which is a real
 * integration and not something to fake.
 */
export async function refundOrder(id: string): Promise<WriteResult> {
  const now = Date.now();
  const result = await (await orders()).updateOne(
    { _id: id, status: "paid" },
    { $set: { status: "refunded" as OrderStatus, refundedAt: now, updatedAt: now } },
  );
  if (result.matchedCount === 0) {
    return { ok: false, reason: "Only a paid ticket can be refunded." };
  }
  return { ok: true };
}

/** Edit the lines on a ticket that has not been settled, recomputing the total. */
export async function updateOrderLines(id: string, lines: OrderLine[]): Promise<WriteResult> {
  const col = await orders();
  const current = await col.findOne({ _id: id }, { projection: { status: 1 } });
  if (!current) return { ok: false, reason: "That ticket is no longer on the board." };
  if (isSettled(current.status)) {
    return { ok: false, reason: "That ticket is already closed." };
  }

  const { soldOut } = await getState();
  const clean = priceLines(
    lines.filter((line) => line.qty > 0),
    // A counter edit may keep an item that has since gone off the board.
    soldOut.filter((itemId) => !lines.some((line) => line.itemId === itemId)),
  );
  if (!clean.length) {
    return { ok: false, reason: "An order needs at least one item — void it instead." };
  }

  const existing = await col.findOne({ _id: id }, { projection: { packing: 1 } });
  const packing = existing?.packing ?? 0;

  await col.updateOne(
    { _id: id },
    { $set: { lines: clean, total: cartTotal(clean) + packing, updatedAt: Date.now() } },
  );
  return { ok: true };
}

/** Guest asked for the bill. Flags the ticket on the counter board. */
export async function requestBill(id: string): Promise<void> {
  await (await orders()).updateOne(
    { _id: id },
    { $set: { billRequested: true, updatedAt: Date.now() } },
  );
}

export async function markPaid(id: string, method: PaymentMethod): Promise<WriteResult> {
  const now = Date.now();
  const result = await (await orders()).updateOne(
    { _id: id, status: { $nin: ["paid", "cancelled", "refunded"] } },
    {
      $set: {
        status: "paid" as OrderStatus,
        paymentMethod: method,
        paidAt: now,
        updatedAt: now,
        billRequested: false,
        paymentClaimedAt: undefined,
      },
    },
  );
  if (result.matchedCount === 0) {
    return { ok: false, reason: "That ticket was already settled." };
  }
  return { ok: true };
}

/**
 * The guest pulling an order back. Only from `new`, only inside the window —
 * both checked here rather than in the browser, since the browser's clock and
 * its idea of the status are both things a guest could lean on.
 */
export async function cancelOrder(id: string): Promise<{ ok: boolean; reason?: string }> {
  const col = await orders();
  const current = await col.findOne({ _id: id }, { projection: { status: 1, placedAt: 1 } });
  if (!current) return { ok: false, reason: "That order is no longer here." };

  if (current.status !== "new") {
    return { ok: false, reason: "The kitchen has already started this one." };
  }
  if (Date.now() - current.placedAt > CANCEL_WINDOW_MS) {
    return { ok: false, reason: "Too late to cancel from here — ask the counter." };
  }

  await col.updateOne(
    { _id: id, status: "new" },
    { $set: { status: "cancelled", cancelledAt: Date.now(), updatedAt: Date.now() } },
  );
  return { ok: true };
}

export async function toggleSoldOut(itemId: string): Promise<void> {
  const col = await meta();
  const state = await col.findOne({ _id: META_ID });
  const soldOut = state?.soldOut ?? [];
  const next = soldOut.includes(itemId)
    ? soldOut.filter((id) => id !== itemId)
    : [...soldOut, itemId];

  await col.updateOne({ _id: META_ID }, { $set: { soldOut: next } }, { upsert: true });
}

/** Wipes everything and re-seeds. Behind the demo reset control. */
export async function resetDemo(): Promise<void> {
  const col = await orders();
  await col.deleteMany({});

  const seeded = seedOrders(Date.now());
  if (seeded.length) {
    await col.insertMany(seeded.map((order) => ({ ...order, _id: order.id })));
  }
  await (await meta()).updateOne(
    { _id: META_ID },
    { $set: { soldOut: SEED_SOLD_OUT, codeSeq: 2205 + seeded.length } },
    { upsert: true },
  );
}
