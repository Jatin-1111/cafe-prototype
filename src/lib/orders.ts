import { menuById } from "@/data/menu";
import {
  type Guest,
  type Order,
  type OrderLine,
  type OrderStatus,
  type OrderType,
  type PaymentMethod,
  type ServerState,
  STATUS_FLOW,
} from "@/lib/orderTypes";

/* ============================================================
   The browser's view of the order state.

   Orders and the sold-out list live in MongoDB and are reached
   through /api — so a guest's phone and the counter laptop are
   genuinely looking at the same data, which localStorage alone
   could never do.

   The cart is the exception and stays on the device: it is an
   unsent draft, it belongs to one phone, and keeping it local means
   adding an item is instant and survives a dropped connection.
   ============================================================ */

export * from "@/lib/orderTypes";

type Carts = Record<string, OrderLine[]>;

type Snapshot = {
  orders: Order[];
  carts: Carts;
  soldOut: string[];
  /** False when the last attempt to reach the server failed. */
  online: boolean;
  /** True once the first server read has come back. */
  loaded: boolean;
};

const CART_KEY = "refections.carts.v1";
const CHANNEL = "refections-sync";
const POLL_MS = 2500;

const EMPTY: Snapshot = { orders: [], carts: {}, soldOut: [], online: true, loaded: false };

let state: Snapshot = EMPTY;
let started = false;
let timer: number | null = null;
let channel: BroadcastChannel | null = null;
const listeners = new Set<() => void>();

/** Keys from earlier iterations of the prototype, cleared so they do not linger. */
const STALE_KEYS = [
  "kahani.orders.v1",
  "kahani.carts.v1",
  "kahani.orders.v2",
  "kahani.carts.v2",
  "kahani.orders.v3",
  "kahani.carts.v3",
  "kahani.soldout.v3",
  "refections.orders.v1",
  "refections.soldout.v1",
];

function isBrowser() {
  return typeof window !== "undefined";
}

function emit() {
  for (const listener of listeners) listener();
}

function setState(next: Snapshot) {
  state = next;
  emit();
}

/* ------------------------------------------------------------
   Cart — local to this device
   ------------------------------------------------------------ */

function readCarts(): Carts {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) ?? "null");
    return raw && typeof raw === "object" ? (raw as Carts) : {};
  } catch {
    return {};
  }
}

function writeCarts(carts: Carts, broadcast = true) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(carts));
  } catch {
    /* private mode or full storage — the cart still works in memory */
  }
  if (broadcast) channel?.postMessage("carts");
}

/* ------------------------------------------------------------
   Server state
   ------------------------------------------------------------ */

/** Replaces server-owned fields, leaving the local cart alone. */
function apply(data: ServerState) {
  const sameOrders = JSON.stringify(data.orders) === JSON.stringify(state.orders);
  const sameSoldOut = JSON.stringify(data.soldOut) === JSON.stringify(state.soldOut);
  if (sameOrders && sameSoldOut && state.online && state.loaded) return;

  setState({
    ...state,
    orders: sameOrders ? state.orders : data.orders,
    soldOut: sameSoldOut ? state.soldOut : data.soldOut,
    online: true,
    loaded: true,
  });
}

async function pull(): Promise<void> {
  try {
    const response = await fetch("/api/state", { cache: "no-store" });
    if (!response.ok) throw new Error(String(response.status));
    apply((await response.json()) as ServerState);
  } catch {
    if (state.online) setState({ ...state, online: false });
  }
}

async function send(action: Record<string, unknown>): Promise<{ ok: boolean; order?: Order }> {
  try {
    const response = await fetch("/api/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(action),
    });
    const data = (await response.json()) as {
      state?: ServerState;
      order?: Order;
      error?: string;
    };
    if (data.state) apply(data.state);
    if (!response.ok) {
      console.warn("[orders]", action.type, data.error ?? response.status);
      return { ok: false };
    }
    channel?.postMessage("orders");
    return { ok: true, order: data.order };
  } catch {
    setState({ ...state, online: false });
    return { ok: false };
  }
}

function startPolling() {
  if (timer !== null || !isBrowser()) return;
  timer = window.setInterval(() => {
    if (document.visibilityState === "visible") void pull();
  }, POLL_MS);
}

function stopPolling() {
  if (timer === null) return;
  window.clearInterval(timer);
  timer = null;
}

function start() {
  if (started || !isBrowser()) return;
  started = true;

  try {
    for (const key of STALE_KEYS) localStorage.removeItem(key);
  } catch {
    /* nothing to clean up */
  }

  state = { ...state, carts: readCarts() };

  channel = "BroadcastChannel" in window ? new BroadcastChannel(CHANNEL) : null;
  channel?.addEventListener("message", (event) => {
    // Another tab on this device changed something. Carts are local, so read
    // them straight back; orders need a pull. Changes made on *other* devices
    // arrive on the next poll instead.
    if (event.data === "carts") setState({ ...state, carts: readCarts() });
    else void pull();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void pull();
  });

  void pull();
}

export function subscribe(listener: () => void) {
  start();
  listeners.add(listener);
  startPolling();

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) stopPolling();
  };
}

export function getSnapshot(): Snapshot {
  start();
  return state;
}

export function getServerSnapshot(): Snapshot {
  return EMPTY;
}

/* ------------------------------------------------------------
   Cart actions — instant, local
   ------------------------------------------------------------ */

function sameLine(a: OrderLine, b: OrderLine) {
  return (
    a.itemId === b.itemId && JSON.stringify(a.options ?? {}) === JSON.stringify(b.options ?? {})
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

  const carts = { ...state.carts, [table]: next };
  writeCarts(carts);
  setState({ ...state, carts });
}

export function setLineQty(table: string, index: number, qty: number) {
  const current = state.carts[table] ?? [];
  const next = current.map((l, i) => (i === index ? { ...l, qty } : l)).filter((l) => l.qty > 0);

  const carts = { ...state.carts, [table]: next };
  writeCarts(carts);
  setState({ ...state, carts });
}

export function clearCart(table: string) {
  const carts = { ...state.carts, [table]: [] };
  writeCarts(carts);
  setState({ ...state, carts });
}

/* ------------------------------------------------------------
   Order actions — these go to the server
   ------------------------------------------------------------ */

export async function placeOrder(
  table: string,
  details: { note?: string; guest?: Guest; orderType?: OrderType } = {},
): Promise<Order | null> {
  const lines = state.carts[table] ?? [];
  if (!lines.length) return null;

  const result = await send({
    type: "place",
    table,
    lines,
    orderType: details.orderType,
    guest: details.guest,
    note: details.note,
  });

  if (!result.ok || !result.order) return null;

  clearCart(table);
  return result.order;
}

/**
 * Counter actions update locally first so the board responds to a tap
 * instantly, then reconcile with whatever the server comes back with.
 */
function optimistic(id: string, change: (order: Order) => Order) {
  setState({
    ...state,
    orders: state.orders.map((order) => (order.id === id ? change(order) : order)),
  });
}

export async function advanceOrder(id: string) {
  optimistic(id, (order) => {
    const at = STATUS_FLOW.indexOf(order.status);
    return {
      ...order,
      status: STATUS_FLOW[Math.min(at + 1, STATUS_FLOW.length - 1)],
      updatedAt: Date.now(),
    };
  });
  await send({ type: "advance", id });
}

export async function setOrderStatus(id: string, status: OrderStatus) {
  optimistic(id, (order) => ({ ...order, status, updatedAt: Date.now() }));
  await send({ type: "status", id, status });
}

export async function requestBill(id: string) {
  optimistic(id, (order) => ({ ...order, billRequested: true, updatedAt: Date.now() }));
  await send({ type: "bill", id });
}

export async function markPaid(id: string, method: PaymentMethod) {
  const now = Date.now();
  optimistic(id, (order) => ({
    ...order,
    status: "paid",
    paymentMethod: method,
    paidAt: now,
    updatedAt: now,
    billRequested: false,
  }));
  await send({ type: "pay", id, method });
}

export async function toggleSoldOut(itemId: string) {
  const soldOut = state.soldOut.includes(itemId)
    ? state.soldOut.filter((id) => id !== itemId)
    : [...state.soldOut, itemId];
  setState({ ...state, soldOut });
  await send({ type: "soldOut", itemId });
}

export async function resetDemo() {
  await send({ type: "reset" });
}
