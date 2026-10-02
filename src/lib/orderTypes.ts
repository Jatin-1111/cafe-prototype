/* ============================================================
   Order types and pure helpers.

   Deliberately free of both the browser and the database, so the
   client store, the API routes and the Mongo repository can all
   share one definition of what an order is.
   ============================================================ */

/**
 * Service state of an order. The guest-facing stepper collapses the last two.
 * `cancelled` sits outside the flow: an order can only reach it from `new`,
 * within the guest's short window to change their mind.
 */
export type OrderStatus =
  | "new"
  | "preparing"
  | "ready"
  | "served"
  | "paid"
  | "cancelled"
  | "refunded";

export type PaymentMethod = "upi" | "card" | "cash";

export type OrderType = "table" | "takeaway";

/** Lanes the counter works through, in order. */
export const STATUS_FLOW: OrderStatus[] = ["new", "preparing", "ready", "served", "paid"];

/** Everything the kitchen board advances with one button. */
export const KITCHEN_FLOW: OrderStatus[] = ["new", "preparing", "ready"];

/**
 * The lanes an "advance" tap can walk. Stops at `served` deliberately: money is
 * recorded by settling, never by one more tap.
 */
export const SERVICE_FLOW: OrderStatus[] = ["new", "preparing", "ready", "served"];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "New",
  preparing: "Preparing",
  ready: "Ready",
  served: "To settle",
  paid: "Closed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

/** What the button that advances an order should say, per status. */
export const STATUS_ACTION: Record<OrderStatus, string | null> = {
  new: "Start preparing",
  preparing: "Mark ready",
  ready: "Hand to table",
  served: null, // settled with a payment method instead
  paid: null,
  cancelled: null,
  refunded: null,
};

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  upi: "UPI",
  card: "Card",
  cash: "Cash",
};

/** Stages the guest sees. `served` and `paid` both land on the last one. */
export const GUEST_STAGES: { key: OrderStatus; label: string; copy: string }[] = [
  { key: "new", label: "Sent", copy: "On the counter screen. Someone picks it up in a moment." },
  { key: "preparing", label: "Preparing", copy: "Being made now. Coffee first, plates as they come." },
  { key: "ready", label: "Ready", copy: "On the pass. It is walking over to you." },
  { key: "served", label: "At the table", copy: "All yours. Settle up whenever you are ready." },
];

/** Same four stages, worded for someone waiting at the counter rather than a table. */
export function guestStagesFor(orderType: OrderType) {
  if (orderType !== "takeaway") return GUEST_STAGES;
  return GUEST_STAGES.map((stage) => {
    if (stage.key === "ready") {
      return { ...stage, label: "Bagged", copy: "Bagged and waiting at the counter for you." };
    }
    if (stage.key === "served") {
      return { ...stage, label: "Collected", copy: "Yours. Settle up whenever you are ready." };
    }
    return stage;
  });
}

export type OrderLine = {
  itemId: string;
  name: string;
  /** Unit price with the chosen options applied. */
  price: number;
  /** The item's own price, so a receipt can show what the extras added. */
  base?: number;
  qty: number;
  options?: Record<string, string>;
  /** A note on this line alone: "no onion in the burger" without touching the pizza. */
  note?: string;
};

export type Guest = { name?: string; phone?: string };

export type Order = {
  id: string;
  code: string;
  table: string;
  orderType: OrderType;
  guest?: Guest;
  lines: OrderLine[];
  total: number;
  status: OrderStatus;
  placedAt: number;
  updatedAt: number;
  note?: string;
  /** Guest tapped "ask for the bill": the counter sees it flagged. */
  billRequested?: boolean;
  paidAt?: number;
  paymentMethod?: PaymentMethod;
  /** When the kitchen expects this at the pass. Set once, at placement. */
  readyBy?: number;
  /** Added for takeaway packing, applied once per order. */
  packing?: number;
  /**
   * The guest said they have paid by UPI. The counter still confirms it ,
   * there is no gateway here, and a tap that closes a bill on its own is a
   * hole a cafe would notice on day one.
   */
  paymentClaimedAt?: number;
  claimedMethod?: PaymentMethod;
  cancelledAt?: number;
  /** Who pulled it: the guest inside their window, or the counter voiding it. */
  cancelledBy?: "guest" | "counter";
  refundedAt?: number;
};

/** How long a guest has to pull an order back after sending it. */
export const CANCEL_WINDOW_MS = 120_000;

export function cancellableUntil(order: Order): number {
  return order.placedAt + CANCEL_WINDOW_MS;
}

export function canCancel(order: Order, now: number): boolean {
  return order.status === "new" && now > 0 && now < cancellableUntil(order);
}

/**
 * Wording for the wait. Deliberately vague near the end: a countdown that
 * hits zero and keeps going is worse than no countdown at all.
 */
export function etaCopy(order: Order, now: number): string | null {
  if (!order.readyBy || !now) return null;
  if (order.status === "ready" || order.status === "served" || order.status === "paid") return null;
  if (order.status === "cancelled" || order.status === "refunded") return null;

  const minutes = Math.round((order.readyBy - now) / 60_000);
  if (minutes <= 0) return "Any moment now";
  if (minutes === 1) return "About a minute";
  return `About ${minutes} minutes`;
}

/** GST is baked into the shelf price: the receipt shows what was included. */
export const GST_RATE = 0.05;

export function taxBreakdown(total: number) {
  const base = Math.round(total / (1 + GST_RATE));
  const gst = total - base;
  const cgst = Math.round(gst / 2);
  return { base, gst, cgst, sgst: gst - cgst };
}

export function cartTotal(lines: OrderLine[]) {
  return lines.reduce((sum, l) => sum + l.price * l.qty, 0);
}

/** What the extras on a whole order came to, for the receipt. */
export function extrasTotal(lines: OrderLine[]) {
  return lines.reduce((sum, l) => sum + ((l.price - (l.base ?? l.price)) * l.qty), 0);
}

/** Splitting a bill evenly, with the stray rupees landing on the first share. */
export function splitEvenly(total: number, ways: number): number[] {
  const safe = Math.max(1, Math.min(12, Math.floor(ways)));
  const each = Math.floor(total / safe);
  const shares = Array.from({ length: safe }, () => each);
  shares[0] += total - each * safe;
  return shares;
}

export function cartCount(lines: OrderLine[]) {
  return lines.reduce((sum, l) => sum + l.qty, 0);
}

/** How far along the guest-facing stepper this order is. */
export function guestStage(status: OrderStatus) {
  if (status === "paid") return GUEST_STAGES.length - 1;
  if (status === "cancelled" || status === "refunded") return -1;
  return GUEST_STAGES.findIndex((s) => s.key === status);
}

/** An order the counter still has to do something about. */
export function isOpen(order: Order): boolean {
  return (
    order.status !== "paid" && order.status !== "cancelled" && order.status !== "refunded"
  );
}

/** Settled money. A refund takes the order back out of the day's takings. */
export function countsAsTakings(order: Order): boolean {
  return order.status === "paid";
}

/**
 * A cafe's day does not end at midnight: this one closes at 11:30pm and the
 * last tickets land after that. Everything from 5am counts as one service day,
 * so "taken today" still reads correctly at closing time.
 */
export const SERVICE_DAY_STARTS_AT_HOUR = 5;

export function startOfServiceDay(now: number): number {
  const d = new Date(now);
  d.setHours(SERVICE_DAY_STARTS_AT_HOUR, 0, 0, 0);
  const start = d.getTime();
  return start > now ? start - 24 * 60 * 60 * 1000 : start;
}

export function isFromToday(order: Order, now: number): boolean {
  return now > 0 && order.placedAt >= startOfServiceDay(now);
}

/** A status change the counter can still make. Used to guard against two staff colliding. */
export function isSettled(status: OrderStatus): boolean {
  return status === "paid" || status === "cancelled" || status === "refunded";
}

export function elapsed(from: number, now: number) {
  const seconds = Math.max(0, Math.floor((now - from) / 1000));
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
  }
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

export function clockTime(at: number) {
  return new Date(at).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** What the server hands back on every read and every write. */
export type ServerState = { orders: Order[]; soldOut: string[] };
