import "server-only";

import type { Collection } from "mongodb";
import { getDb } from "@/lib/db";
import { SEED_SOLD_OUT, seedOrders } from "@/lib/seed";
import {
  STATUS_FLOW,
  cartTotal,
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

/** Order numbers come from a counter so two phones can never collide on one. */
async function nextCode(): Promise<string> {
  const result = await (await meta()).findOneAndUpdate(
    { _id: META_ID },
    { $inc: { codeSeq: 1 }, $setOnInsert: { soldOut: [] } },
    { upsert: true, returnDocument: "after" },
  );
  return `K-${result?.codeSeq ?? Date.now() % 10000}`;
}

export async function placeOrder(input: {
  table: string;
  lines: OrderLine[];
  orderType?: OrderType;
  guest?: Guest;
  note?: string;
}): Promise<Order | null> {
  if (!input.lines.length) return null;

  // An item taken off the board while the guest was browsing must not get through.
  const { soldOut } = await getState();
  const lines = input.lines.filter((line) => !soldOut.includes(line.itemId));
  if (!lines.length) return null;

  const now = Date.now();
  const order: Order = {
    id: `o-${now}-${Math.round(Math.random() * 9973)}`,
    code: await nextCode(),
    table: input.table,
    orderType: input.orderType ?? "table",
    guest: input.guest?.name || input.guest?.phone ? input.guest : undefined,
    lines,
    total: cartTotal(lines),
    status: "new",
    placedAt: now,
    updatedAt: now,
    note: input.note?.trim() || undefined,
  };

  await (await orders()).insertOne({ ...order, _id: order.id });
  return order;
}

/** Moves an order one lane along the flow. */
export async function advanceOrder(id: string): Promise<void> {
  const col = await orders();
  const current = await col.findOne({ _id: id }, { projection: { status: 1 } });
  if (!current) return;

  const at = STATUS_FLOW.indexOf(current.status);
  const to = STATUS_FLOW[Math.min(at + 1, STATUS_FLOW.length - 1)];
  await col.updateOne({ _id: id }, { $set: { status: to, updatedAt: Date.now() } });
}

export async function setOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await (await orders()).updateOne({ _id: id }, { $set: { status, updatedAt: Date.now() } });
}

/** Guest asked for the bill. Flags the ticket on the counter board. */
export async function requestBill(id: string): Promise<void> {
  await (await orders()).updateOne(
    { _id: id },
    { $set: { billRequested: true, updatedAt: Date.now() } },
  );
}

export async function markPaid(id: string, method: PaymentMethod): Promise<void> {
  const now = Date.now();
  await (await orders()).updateOne(
    { _id: id },
    {
      $set: {
        status: "paid" as OrderStatus,
        paymentMethod: method,
        paidAt: now,
        updatedAt: now,
        billRequested: false,
      },
    },
  );
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
