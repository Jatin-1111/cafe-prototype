import { menuById, type MenuItem } from "@/data/menu";

/* ============================================================
   Order store
   ------------------------------------------------------------
   A prototype-scale store: everything lives in localStorage and
   is broadcast to other tabs, so an order placed on a phone shows
   up on the admin board on a laptop with no backend involved.
   Swapping this file for real API calls is the only change needed
   to put this on a server.
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
  {
    key: "new",
    label: "Sent",
    copy: "On the counter screen. Someone picks it up in a moment.",
  },
  {
    key: "preparing",
    label: "Preparing",
    copy: "Being made now. Coffee first, plates as they come.",
  },
  {
    key: "ready",
    label: "Ready",
    copy: "On the pass. It is walking over to you.",
  },
  {
    key: "served",
    label: "At the table",
    copy: "All yours. Settle up whenever you are ready.",
  },
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

const ORDERS_KEY = "refections.orders.v1";
const CART_KEY = "refections.carts.v1";
const SOLD_OUT_KEY = "refections.soldout.v1";
const CHANNEL = "refections-sync";

type Carts = Record<string, OrderLine[]>;

type Snapshot = { orders: Order[]; carts: Carts; soldOut: string[] };

const EMPTY: Snapshot = { orders: [], carts: {}, soldOut: [] };

let state: Snapshot = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();
let channel: BroadcastChannel | null = null;

/** GST is baked into the shelf price — the receipt shows what was included. */
export const GST_RATE = 0.05;

export function taxBreakdown(total: number) {
  const base = Math.round(total / (1 + GST_RATE));
  const gst = total - base;
  const cgst = Math.round(gst / 2);
  return { base, gst, cgst, sgst: gst - cgst };
}

function isBrowser() {
  return typeof window !== "undefined";
}

function emit() {
  for (const listener of listeners) listener();
}

function persist(broadcast = true) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(state.orders));
    localStorage.setItem(CART_KEY, JSON.stringify(state.carts));
    localStorage.setItem(SOLD_OUT_KEY, JSON.stringify(state.soldOut));
  } catch {
    /* storage full or blocked — the prototype keeps working in memory */
  }
  if (broadcast) channel?.postMessage("changed");
}

function readStorage(): Snapshot {
  try {
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) ?? "null");
    const carts = JSON.parse(localStorage.getItem(CART_KEY) ?? "null");
    const soldOut = JSON.parse(localStorage.getItem(SOLD_OUT_KEY) ?? "null");
    return {
      orders: Array.isArray(orders) ? (orders as Order[]) : [],
      carts: carts && typeof carts === "object" ? (carts as Carts) : {},
      soldOut: Array.isArray(soldOut) ? (soldOut as string[]) : [],
    };
  } catch {
    return { orders: [], carts: {}, soldOut: [] };
  }
}

function setState(next: Snapshot, broadcast = true) {
  state = next;
  persist(broadcast);
  emit();
}

/* ------------------------------------------------------------
   Seed data — so the counter board is never a sad empty screen
   ------------------------------------------------------------ */

function line(itemId: string, qty: number, options?: Record<string, string>): OrderLine {
  const item = menuById.get(itemId) as MenuItem;
  return { itemId, name: item.name, price: item.price, qty, options };
}

/** Something is always off the board by the evening rush. */
const SEED_SOLD_OUT = ["m-bbq-chicken-pizza"];

function seedOrders(now: number): Order[] {
  const min = 60_000;

  const drafts: Array<{
    table: string;
    lines: OrderLine[];
    status: OrderStatus;
    ago: number;
    note?: string;
    guest?: Guest;
    orderType?: OrderType;
    billRequested?: boolean;
    paymentMethod?: PaymentMethod;
  }> = [
    {
      table: "11",
      lines: [
        line("m-cold-coffee", 2),
        line("m-peri-fries", 1),
        line("m-garlic-bread", 1),
      ],
      status: "new",
      ago: 1.5 * min,
      guest: { name: "Ritika" },
    },
    {
      table: "03",
      lines: [
        line("m-margherita", 1, { Base: "Thin crust" }),
        line("m-cappuccino", 2, { Milk: "Full cream" }),
      ],
      status: "preparing",
      ago: 6 * min,
      note: "One cappuccino without sugar, please",
      guest: { name: "Gurpreet" },
    },
    {
      table: "07",
      lines: [
        line("m-alfredo", 1, { Pasta: "Penne", Add: "Chicken" }),
        line("m-virgin-mojito", 1, { Flavour: "Green apple" }),
      ],
      status: "preparing",
      ago: 11 * min,
    },
    {
      table: "TA",
      lines: [line("m-cold-brew", 2, { Milk: "Black" })],
      status: "ready",
      ago: 4 * min,
      orderType: "takeaway",
      guest: { name: "Simran", phone: "+91 98450 11223" },
    },
    {
      table: "02",
      lines: [line("m-brownie", 2), line("m-latte", 2, { Milk: "Oat", Sugar: "Less" })],
      status: "served",
      ago: 22 * min,
      billRequested: true,
      guest: { name: "Jaskaran" },
    },
    {
      table: "06",
      lines: [
        line("m-farmhouse", 1, { Base: "Cheese burst" }),
        line("m-chilli-paneer", 1, { Style: "Dry" }),
      ],
      status: "served",
      ago: 34 * min,
    },
    {
      table: "09",
      lines: [line("m-tiramisu", 1), line("m-masala-chai", 2, { Strength: "Kadak" })],
      status: "paid",
      ago: 52 * min,
      paymentMethod: "upi",
    },
    {
      table: "05",
      lines: [line("m-club-sandwich", 2, { Filling: "Chicken" }), line("m-classic-fries", 1)],
      status: "paid",
      ago: 68 * min,
      paymentMethod: "card",
    },
  ];

  return drafts.map((draft, index) => {
    const total = draft.lines.reduce((sum, l) => sum + l.price * l.qty, 0);
    return {
      id: `seed-${index}`,
      code: `K-${2205 + index}`,
      table: draft.table,
      orderType: draft.orderType ?? "table",
      guest: draft.guest,
      lines: draft.lines,
      total,
      status: draft.status,
      placedAt: now - draft.ago,
      updatedAt: now - draft.ago / 2,
      note: draft.note,
      billRequested: draft.billRequested,
      paidAt: draft.status === "paid" ? now - draft.ago / 3 : undefined,
      paymentMethod: draft.paymentMethod,
    };
  });
}

/* ------------------------------------------------------------
   Wiring
   ------------------------------------------------------------ */

/** Keys from earlier iterations of the prototype, cleared so they do not linger. */
const STALE_KEYS = [
  "kahani.orders.v1",
  "kahani.carts.v1",
  "kahani.orders.v2",
  "kahani.carts.v2",
  "kahani.orders.v3",
  "kahani.carts.v3",
  "kahani.soldout.v3",
];

function hydrate() {
  if (hydrated || !isBrowser()) return;
  hydrated = true;

  try {
    for (const key of STALE_KEYS) localStorage.removeItem(key);
  } catch {
    /* nothing to clean up */
  }

  const stored = readStorage();
  state = stored.orders.length
    ? stored
    : { orders: seedOrders(Date.now()), carts: stored.carts, soldOut: SEED_SOLD_OUT };
  if (!stored.orders.length) persist(false);

  channel = "BroadcastChannel" in window ? new BroadcastChannel(CHANNEL) : null;
  channel?.addEventListener("message", () => {
    state = readStorage();
    emit();
  });

  window.addEventListener("storage", (event) => {
    if (event.key === ORDERS_KEY || event.key === CART_KEY || event.key === SOLD_OUT_KEY) {
      state = readStorage();
      emit();
    }
  });
}

export function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): Snapshot {
  hydrate();
  return state;
}

export function getServerSnapshot(): Snapshot {
  return EMPTY;
}

/* ------------------------------------------------------------
   Availability
   ------------------------------------------------------------ */

export function toggleSoldOut(itemId: string) {
  const soldOut = state.soldOut.includes(itemId)
    ? state.soldOut.filter((id) => id !== itemId)
    : [...state.soldOut, itemId];
  setState({ ...state, soldOut });
}

/* ------------------------------------------------------------
   Cart actions
   ------------------------------------------------------------ */

function sameLine(a: OrderLine, b: OrderLine) {
  return (
    a.itemId === b.itemId &&
    JSON.stringify(a.options ?? {}) === JSON.stringify(b.options ?? {})
  );
}

export function addToCart(table: string, itemId: string, options?: Record<string, string>) {
  const item = menuById.get(itemId);
  if (!item || state.soldOut.includes(itemId)) return;

  const incoming: OrderLine = { itemId, name: item.name, price: item.price, qty: 1, options };
  const current = state.carts[table] ?? [];
  const existing = current.find((l) => sameLine(l, incoming));

  const next = existing
    ? current.map((l) => (sameLine(l, incoming) ? { ...l, qty: l.qty + 1 } : l))
    : [...current, incoming];

  setState({ ...state, carts: { ...state.carts, [table]: next } });
}

export function setLineQty(table: string, index: number, qty: number) {
  const current = state.carts[table] ?? [];
  const next = current
    .map((l, i) => (i === index ? { ...l, qty } : l))
    .filter((l) => l.qty > 0);
  setState({ ...state, carts: { ...state.carts, [table]: next } });
}

export function clearCart(table: string) {
  setState({ ...state, carts: { ...state.carts, [table]: [] } });
}

export function cartTotal(lines: OrderLine[]) {
  return lines.reduce((sum, l) => sum + l.price * l.qty, 0);
}

export function cartCount(lines: OrderLine[]) {
  return lines.reduce((sum, l) => sum + l.qty, 0);
}

/* ------------------------------------------------------------
   Order actions
   ------------------------------------------------------------ */

function nextCode(orders: Order[]) {
  const highest = orders.reduce((max, order) => {
    const n = Number.parseInt(order.code.replace("K-", ""), 10);
    return Number.isFinite(n) && n > max ? n : max;
  }, 2200);
  return `K-${highest + 1}`;
}

export function placeOrder(
  table: string,
  details: { note?: string; guest?: Guest; orderType?: OrderType } = {},
): Order | null {
  const lines = state.carts[table] ?? [];
  if (!lines.length) return null;

  const now = Date.now();
  const order: Order = {
    id: `o-${now}-${state.orders.length}`,
    code: nextCode(state.orders),
    table,
    orderType: details.orderType ?? "table",
    guest: details.guest?.name || details.guest?.phone ? details.guest : undefined,
    lines,
    total: cartTotal(lines),
    status: "new",
    placedAt: now,
    updatedAt: now,
    note: details.note?.trim() || undefined,
  };

  setState({
    ...state,
    orders: [order, ...state.orders],
    carts: { ...state.carts, [table]: [] },
  });

  return order;
}

function patch(id: string, change: (order: Order) => Order) {
  setState({
    ...state,
    orders: state.orders.map((order) => (order.id === id ? change(order) : order)),
  });
}

/** Moves an order one lane along the kitchen flow. */
export function advanceOrder(id: string) {
  patch(id, (order) => {
    const at = STATUS_FLOW.indexOf(order.status);
    const to = STATUS_FLOW[Math.min(at + 1, STATUS_FLOW.length - 1)];
    return { ...order, status: to, updatedAt: Date.now() };
  });
}

export function setOrderStatus(id: string, status: OrderStatus) {
  patch(id, (order) => ({ ...order, status, updatedAt: Date.now() }));
}

/** Guest asked for the bill. Flags the ticket on the counter board. */
export function requestBill(id: string) {
  patch(id, (order) => ({ ...order, billRequested: true, updatedAt: Date.now() }));
}

export function markPaid(id: string, method: PaymentMethod) {
  const now = Date.now();
  patch(id, (order) => ({
    ...order,
    status: "paid",
    paymentMethod: method,
    paidAt: now,
    updatedAt: now,
    billRequested: false,
  }));
}

/** Wipes everything and re-seeds. Used by the demo reset control. */
export function resetDemo() {
  setState({ orders: seedOrders(Date.now()), carts: {}, soldOut: SEED_SOLD_OUT });
}

/* ------------------------------------------------------------
   Derived helpers
   ------------------------------------------------------------ */

/** How far along the guest-facing stepper this order is. */
export function guestStage(status: OrderStatus) {
  return status === "paid" ? GUEST_STAGES.length - 1 : GUEST_STAGES.findIndex((s) => s.key === status);
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
