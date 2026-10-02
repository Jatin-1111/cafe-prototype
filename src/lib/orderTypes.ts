/* ============================================================
   Order types and pure helpers.

   Deliberately free of both the browser and the database, so the
   client store, the API routes and the Mongo repository can all
   share one definition of what an order is.
   ============================================================ */

/** Service state of an order. The guest-facing stepper collapses the last two. */
export type OrderStatus = "new" | "preparing" | "ready" | "served" | "paid";

export type PaymentMethod = "upi" | "card" | "cash";

export type OrderType = "table" | "takeaway";

/** Lanes the counter works through, in order. */
export const STATUS_FLOW: OrderStatus[] = ["new", "preparing", "ready", "served", "paid"];

/** Everything the kitchen board advances with one button. */
export const KITCHEN_FLOW: OrderStatus[] = ["new", "preparing", "ready"];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "New",
  preparing: "Preparing",
  ready: "Ready",
  served: "To settle",
  paid: "Closed",
};

/** What the button that advances an order should say, per status. */
export const STATUS_ACTION: Record<OrderStatus, string | null> = {
  new: "Start preparing",
  preparing: "Mark ready",
  ready: "Hand to table",
  served: null, // settled with a payment method instead
  paid: null,
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
  price: number;
  qty: number;
  options?: Record<string, string>;
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
  /** Guest tapped "ask for the bill" — the counter sees it flagged. */
  billRequested?: boolean;
  paidAt?: number;
  paymentMethod?: PaymentMethod;
};

/** GST is baked into the shelf price — the receipt shows what was included. */
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

export function cartCount(lines: OrderLine[]) {
  return lines.reduce((sum, l) => sum + l.qty, 0);
}

/** How far along the guest-facing stepper this order is. */
export function guestStage(status: OrderStatus) {
  return status === "paid"
    ? GUEST_STAGES.length - 1
    : GUEST_STAGES.findIndex((s) => s.key === status);
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
