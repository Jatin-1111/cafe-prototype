"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cafe } from "@/data/cafe";
import { categories, formatINR, itemsIn, menu } from "@/data/menu";
import {
  advanceOrder,
  clockTime,
  countsAsTakings,
  isFromToday,
  isSettled,
  refundOrder,
  setOrderStatus,
  updateOrderLines,
  voidOrder,
  type OrderLine,
  type Outcome,
  elapsed,
  markPaid,
  PAYMENT_LABEL,
  resetDemo,
  STATUS_ACTION,
  STATUS_LABEL,
  isOpen,
  toggleSoldOut,
  type Order,
  type OrderStatus,
  type PaymentMethod,
} from "@/lib/orders";
import { useConnection, useMounted, useNow, useOrders, useSoldOut } from "@/lib/useStore";
import {
  playNewTicketChime,
  setSoundEnabled,
  soundEnabled,
  soundEnabledOnServer,
  subscribeSound,
} from "@/lib/counterAlert";
import { printKot } from "@/lib/printKot";
import { ChevronDownIcon, MinusIcon, PlusIcon } from "@/components/Icon";
import { DURATION, EASE, notice as noticeMotion, transition } from "@/lib/motion";

/** Lanes the counter works, left to right. `paid` is closed out below the board. */
const LANES: OrderStatus[] = ["new", "preparing", "ready", "served"];

const laneBar: Record<OrderStatus, string> = {
  new: "bg-status-new",
  preparing: "bg-status-prep",
  ready: "bg-status-ready",
  served: "bg-ink",
  paid: "bg-status-done",
  cancelled: "bg-muted",
  refunded: "bg-muted",
};

/** Minutes after which a ticket in this lane needs attention. */
const laneWarnAfter: Partial<Record<OrderStatus, number>> = {
  new: 3,
  preparing: 12,
  ready: 4,
  served: 25,
};

const PAYMENT_ORDER: PaymentMethod[] = ["cash", "card", "upi"];

/**
 * Chimes and badges the tab when a ticket the counter has not seen arrives.
 * A board that updates silently is a board a busy counter misses.
 */
function useNewTicketAlert(orders: Order[], mounted: boolean) {
  const seen = useRef<Set<string> | null>(null);
  const [unseen, setUnseen] = useState(0);

  useEffect(() => {
    if (!mounted) return;
    const incoming = orders.filter((order) => order.status === "new");

    // First pass only learns what is already there: no chime on page load.
    if (seen.current === null) {
      seen.current = new Set(incoming.map((order) => order.id));
      return;
    }

    const fresh = incoming.filter((order) => !seen.current!.has(order.id));
    for (const order of incoming) seen.current.add(order.id);
    if (!fresh.length) return;

    playNewTicketChime();
    if (document.visibilityState !== "visible") {
      setUnseen((count) => count + fresh.length);
    }
  }, [orders, mounted]);

  useEffect(() => {
    const clear = () => {
      if (document.visibilityState === "visible") setUnseen(0);
    };
    document.addEventListener("visibilitychange", clear);
    return () => document.removeEventListener("visibilitychange", clear);
  }, []);

  useEffect(() => {
    const base = "Counter · Refections";
    document.title = unseen > 0 ? `(${unseen}) ● ${base}` : base;
    return () => {
      document.title = base;
    };
  }, [unseen]);
}

export function AdminBoard() {
  const mounted = useMounted();
  const orders = useOrders();
  const soldOut = useSoldOut();
  const now = useNow();
  const { online, loaded } = useConnection();

  const [menuOpen, setMenuOpen] = useState(false);
  const [closedOpen, setClosedOpen] = useState(false);
  const sound = useSyncExternalStore(subscribeSound, soundEnabled, soundEnabledOnServer);
  const [notice, setNotice] = useState<string | null>(null);
  /**
   * Advancing moves a ticket to another lane, which unmounts and remounts it,
   * so the offer to undo has to live here, above the lanes, or it vanishes the
   * instant it becomes useful.
   */
  const [undo, setUndo] = useState<{ id: string; to: OrderStatus } | null>(null);

  useEffect(() => {
    if (!undo) return;
    const timer = window.setTimeout(() => setUndo(null), 12000);
    return () => window.clearTimeout(timer);
  }, [undo]);

  useNewTicketAlert(orders, mounted);

  /** Surfaces a refusal from the server: usually another device got there first. */
  async function run(work: Promise<Outcome>) {
    const result = await work;
    if (!result.ok && result.reason) {
      setNotice(result.reason);
      window.setTimeout(() => setNotice(null), 4000);
    }
  }

  const lanes = useMemo(
    () =>
      LANES.map((status) => ({
        status,
        orders: orders
          .filter((order) => order.status === status)
          .sort((a, b) => {
            // Guests waiting on a bill jump the queue in the settle lane.
            if (status === "served" && Boolean(a.billRequested) !== Boolean(b.billRequested)) {
              return a.billRequested ? -1 : 1;
            }
            return a.placedAt - b.placedAt;
          }),
      })),
    [orders],
  );

  const closed = useMemo(
    () =>
      orders
        .filter(
          (order) =>
            isFromToday(order, now) &&
            (order.status === "paid" ||
              order.status === "cancelled" ||
              order.status === "refunded"),
        )
        .sort((a, b) => (b.paidAt ?? b.updatedAt) - (a.paidAt ?? a.updatedAt)),
    [orders, now],
  );

  const stats = useMemo(() => {
    // Everything but "open" is a figure for today, not for everything the
    // database has ever held: otherwise the takings are wrong on day two.
    const today = orders.filter((order) => isFromToday(order, now));
    const open = orders.filter(isOpen);
    const paid = today.filter(countsAsTakings);
    return {
      open: open.length,
      kitchen: orders.filter((order) => order.status === "preparing").length,
      bills: orders.filter((order) => order.billRequested).length,
      covers: new Set(
        today
          .filter((o) => o.orderType === "table" && o.status !== "cancelled")
          .map((o) => o.table),
      ).size,
      items: today
        .filter((order) => order.status !== "cancelled" && order.status !== "refunded")
        .reduce((sum, order) => sum + order.lines.reduce((n, line) => n + line.qty, 0), 0),
      taken: paid.reduce((sum, order) => sum + order.total, 0),
      outstanding: open.reduce((sum, order) => sum + order.total, 0),
    };
  }, [orders, now]);

  return (
    <div className="min-h-dvh bg-paper flex flex-col">
      {/* ---------- Bar ---------- */}
      <header className="sticky top-0 z-30 bg-paper border-b border-line">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-3 min-w-0">
            <Link href="/" className="wordmark text-sm leading-none shrink-0">
              {cafe.name.toUpperCase()}
            </Link>
            <span className="eyebrow truncate">Counter · {cafe.address.line1}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span
              className={`hidden sm:flex items-center gap-2 text-xs ${
                online ? "text-muted" : "text-status-new font-semibold"
              }`}
              role="status"
            >
              <span
                aria-hidden
                className={`w-1.5 h-1.5 rounded-full ${
                  online ? "bg-status-ready animate-pulse" : "bg-status-new"
                }`}
              />
              {online ? (loaded ? "Live" : "Connecting…") : "Offline"}
            </span>
            <span className="tnum text-sm text-ink-2 hidden sm:inline">
              {mounted && now ? clockTime(now) : "·"}
            </span>
            <button
              type="button"
              onClick={() => setSoundEnabled(!sound)}
              aria-pressed={sound}
              title={sound ? "Chime on for new tickets" : "Chime off"}
              className={`h-8 px-3 border text-xs font-semibold transition-colors ${
                sound
                  ? "border-status-ready text-status-ready"
                  : "border-line text-muted hover:border-ink hover:text-ink"
              }`}
            >
              {sound ? "Sound on" : "Sound off"}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              className={`h-8 px-3 border text-xs font-semibold transition-colors ${
                soldOut.length
                  ? "border-status-new text-status-new"
                  : "border-line text-ink-2 hover:border-ink hover:text-ink"
              }`}
            >
              Menu
              {soldOut.length ? ` · ${soldOut.length} off` : ""}
            </button>
            <button
              type="button"
              onClick={resetDemo}
              className="h-8 px-3 border border-line text-xs font-semibold text-ink-2 hover:border-ink hover:text-ink transition-colors"
            >
              Reset demo
            </button>
          </div>
        </div>

        {/* A refusal from the server pushes the board down by a row. Growing the
            strip rather than inserting it keeps the lanes from jumping under a
            cursor that is already on its way to a button. */}
        <AnimatePresence>
          {notice ? (
            <motion.div {...noticeMotion} className="overflow-hidden">
              <p
                role="status"
                className="border-t border-status-new/40 bg-status-new/10 px-4 sm:px-6 py-2 text-xs font-semibold text-status-new"
              >
                {notice}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {menuOpen ? <Availability soldOut={soldOut} onClose={() => setMenuOpen(false)} /> : null}
      </header>

      {/* ---------- Summary ---------- */}
      <section className="border-b border-line bg-cream/60">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-4">
          <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-line border border-line">
            <Stat label="Open orders" value={stats.open} accent />
            <Stat label="In the kitchen" value={stats.kitchen} />
            <Stat label="Bills asked for" value={stats.bills} warn={stats.bills > 0} />
            <Stat label="Tables seated" value={stats.covers} />
            <Stat label="Unsettled" value={formatINR(stats.outstanding)} />
            <Stat label="Taken today" value={formatINR(stats.taken)} />
          </dl>
        </div>
      </section>

      {/* ---------- Board ---------- */}
      <div className="flex-1 mx-auto max-w-[1400px] w-full px-4 sm:px-6 py-6">
        {!mounted ? (
          <p className="py-20 text-center text-sm text-muted">Connecting to the counter…</p>
        ) : (
          <>
            <div className="grid gap-5 lg:grid-cols-4">
              {lanes.map((lane) => (
                <section key={lane.status} className="min-w-0">
                  <header className="flex items-center gap-3 pb-2.5 border-b-2 border-ink">
                    <span aria-hidden className={`w-2.5 h-2.5 ${laneBar[lane.status]}`} />
                    <h2 className="text-sm font-bold uppercase tracking-[0.12em]">
                      {STATUS_LABEL[lane.status]}
                    </h2>
                    <span className="ml-auto tnum text-sm text-muted">{lane.orders.length}</span>
                  </header>

                  <div className="mt-3 flex flex-col gap-3">
                    {lane.orders.length === 0 ? (
                      <p className="rounded-card border border-dashed border-line px-3 py-8 text-center text-xs text-muted">
                        Nothing here
                      </p>
                    ) : (
                      lane.orders.map((order) => (
                        <Ticket
                          key={order.id}
                          order={order}
                          now={now}
                          run={run}
                          undoTo={undo?.id === order.id ? undo.to : null}
                          onAdvance={(from) => setUndo({ id: order.id, to: from })}
                          onUndone={() => setUndo(null)}
                        />
                      ))
                    )}
                  </div>
                </section>
              ))}
            </div>

            {/* ---------- Closed ---------- */}
            <section className="mt-8 border-t border-line pt-5">
              <button
                type="button"
                onClick={() => setClosedOpen((open) => !open)}
                aria-expanded={closedOpen}
                className="flex items-center gap-3 rounded-none text-sm font-bold uppercase tracking-[0.12em] text-ink-2 hover:text-ink transition-colors"
              >
                <span aria-hidden className={`w-2.5 h-2.5 ${laneBar.paid}`} />
                Closed today
                <span className="tnum text-muted">{closed.length}</span>
                <ChevronDownIcon
                  className={`w-4 h-4 text-muted transition-transform ${
                    closedOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {closedOpen ? (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: DURATION.base, ease: EASE }}
                    className="mt-4 rounded-card border border-line divide-y divide-line-soft overflow-hidden"
                  >
                    {closed.length === 0 ? (
                      <li className="px-3 py-6 text-center text-xs text-muted">
                        Nothing settled yet
                      </li>
                    ) : (
                      closed.map((order) => (
                        <li
                          key={order.id}
                          className="px-3 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
                        >
                          <span className="tnum font-bold">{order.code}</span>
                          <span className="text-xs text-muted">
                            {order.orderType === "takeaway" ? "Takeaway" : `Table ${order.table}`}
                            {order.guest?.name ? ` · ${order.guest.name}` : ""}
                          </span>
                          <span className="ml-auto text-xs text-muted">
                            {order.status === "cancelled"
                              ? order.cancelledBy === "counter"
                                ? "Voided"
                                : "Cancelled"
                              : order.status === "refunded"
                                ? "Refunded"
                                : order.paymentMethod
                                  ? PAYMENT_LABEL[order.paymentMethod]
                                  : "·"}
                          </span>
                          <span className="tnum text-xs text-muted w-16 text-right">
                            {order.paidAt ? clockTime(order.paidAt) : "·"}
                          </span>
                          <span
                            className={`tnum font-semibold w-20 text-right ${
                              order.status === "cancelled" || order.status === "refunded"
                                ? "text-muted line-through"
                                : ""
                            }`}
                          >
                            {formatINR(order.total)}
                          </span>
                        </li>
                      ))
                    )}
                  </motion.ul>
                ) : null}
              </AnimatePresence>
            </section>
          </>
        )}
      </div>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-4 flex flex-wrap gap-x-6 gap-y-2 items-center justify-between text-xs text-muted">
          <p>
            Prototype. Orders sync across every device. Open the{" "}
            <Link href="/demo" className="text-brand font-semibold hover:underline">
              demo hub
            </Link>{" "}
            in another window and send one.
          </p>
          <p>{cafe.tables} tables on the floor</p>
        </div>
      </footer>
    </div>
  );
}

/* ============================================================ */

function Stat({
  label,
  value,
  accent = false,
  warn = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="bg-paper px-4 py-3">
      <dt className="eyebrow">{label}</dt>
      <dd
        className={`mt-1 tnum text-2xl font-semibold leading-none ${
          warn ? "text-status-new" : accent ? "text-brand" : "text-ink"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function Ticket({
  order,
  now,
  run,
  undoTo,
  onAdvance,
  onUndone,
}: {
  order: Order;
  now: number;
  run: (work: Promise<Outcome>) => Promise<void>;
  undoTo: OrderStatus | null;
  onAdvance: (from: OrderStatus) => void;
  onUndone: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<OrderLine[]>(order.lines);
  const [confirmVoid, setConfirmVoid] = useState(false);

  const action =
    order.orderType === "takeaway" && order.status === "ready"
      ? "Hand over"
      : STATUS_ACTION[order.status];
  const warnAfter = laneWarnAfter[order.status];
  const minutes = now ? (now - order.placedAt) / 60000 : 0;
  const late = warnAfter !== undefined && minutes > warnAfter;
  const veryLate = warnAfter !== undefined && minutes > warnAfter * 2;
  const settling = order.status === "served";

  return (
    <motion.article
      /*
       * layoutId, not layout. Advancing a ticket unmounts it from one lane and
       * mounts it in the next, so there is no shared element for a plain layout
       * animation to follow. Matching ids let the card travel to where it
       * landed, which is the whole question someone at the counter is asking
       * after they tap: where did that one go?
       *
       * layout="position" keeps it to the journey. Animating the box as well
       * would stretch the text inside it while a ticket changes height between
       * lanes, and a smeared order number is worse than no animation.
       */
      layoutId={order.id}
      layout="position"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.base, ease: EASE }}
      className={`bg-paper rounded-card overflow-hidden border border-line border-l-4 ${
        order.billRequested
          ? "border-l-brand"
          : veryLate
            ? "border-l-status-new"
            : late
              ? "border-l-status-prep"
              : "border-l-line"
      }`}
    >
      <div className="px-3 py-2.5 flex items-center justify-between gap-2 border-b border-line-soft">
        <div className="min-w-0">
          <span className="tnum text-sm font-bold">{order.code}</span>
          <span className="ml-2 text-xs text-muted">
            {order.orderType === "takeaway" ? "Takeaway" : `Table ${order.table}`}
          </span>
        </div>
        <span className="flex items-baseline gap-2 shrink-0">
          {order.readyBy && order.status !== "served" ? (
            <span
              className={`tnum text-[11px] ${
                now && now > order.readyBy ? "text-status-new font-semibold" : "text-muted"
              }`}
              title="Time quoted to the guest"
            >
              due {clockTime(order.readyBy)}
            </span>
          ) : null}
          <span
            className={`tnum text-xs font-semibold ${
              veryLate ? "text-status-new" : late ? "text-[#8a6410]" : "text-muted"
            }`}
          >
            {now ? elapsed(order.placedAt, now) : "·"}
          </span>
        </span>
      </div>

      {order.guest?.name || order.billRequested ? (
        <div className="px-3 pt-2 flex flex-wrap items-center gap-2">
          {order.guest?.name ? (
            <span className="text-xs font-semibold text-ink-2">{order.guest.name}</span>
          ) : null}
          {order.guest?.phone ? (
            <span className="tnum text-xs text-muted">{order.guest.phone}</span>
          ) : null}
          {order.billRequested ? (
            <span className="ml-auto rounded-[6px] text-[10px] font-semibold uppercase tracking-[0.1em] bg-brand text-cream px-2.5 py-0.5">
              Bill asked for
            </span>
          ) : null}
        </div>
      ) : null}

      <ul className="px-3 py-2.5 space-y-1.5">
        {(editing ? draft : order.lines).map((line, index) => (
          <li key={index} className="flex gap-2.5 text-sm leading-snug items-start">
            {editing ? (
              <span className="flex items-center shrink-0 rounded-[6px] border border-line overflow-hidden">
                <button
                  type="button"
                  aria-label={`One less ${line.name}`}
                  onClick={() =>
                    setDraft((lines) =>
                      lines.map((l, i) => (i === index ? { ...l, qty: l.qty - 1 } : l)),
                    )
                  }
                  className="w-6 h-6 grid place-items-center text-ink hover:bg-sand"
                >
                  <MinusIcon className="w-3.5 h-3.5" />
                </button>
                <span className="tnum w-5 text-center text-xs font-bold">{line.qty}</span>
                <button
                  type="button"
                  aria-label={`One more ${line.name}`}
                  onClick={() =>
                    setDraft((lines) =>
                      lines.map((l, i) => (i === index ? { ...l, qty: l.qty + 1 } : l)),
                    )
                  }
                  className="w-6 h-6 grid place-items-center text-ink hover:bg-sand"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                </button>
              </span>
            ) : (
              <span className="tnum font-bold text-brand w-6 shrink-0">{line.qty}×</span>
            )}
            <span
              className={`min-w-0 ${editing && line.qty <= 0 ? "line-through text-muted" : ""}`}
            >
              {line.name}
              {line.options ? (
                <span className="block text-xs text-muted">
                  {Object.values(line.options).join(" · ")}
                </span>
              ) : null}
              {line.note ? (
                <span className="block text-xs font-semibold text-brand">{line.note}</span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>

      {editing ? (
        <div className="mx-3 mb-2.5 flex gap-1.5">
          <button
            type="button"
            onClick={async () => {
              await run(updateOrderLines(order.id, draft));
              setEditing(false);
            }}
            className="flex-1 h-8 rounded-[6px] bg-ink text-cream text-[11px] font-semibold uppercase tracking-[0.1em] hover:bg-brand transition-colors"
          >
            Save changes
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft(order.lines);
              setEditing(false);
            }}
            className="h-8 px-3 rounded-[6px] border border-line text-[11px] font-semibold uppercase tracking-[0.1em] text-muted hover:border-ink hover:text-ink transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : null}

      {order.note ? (
        <p className="mx-3 mb-2.5 rounded-sm border-l-2 border-brass bg-brass/10 px-2.5 py-1.5 text-xs text-ink-2">
          {order.note}
        </p>
      ) : null}

      <div className="px-3 py-2.5 border-t border-line-soft">
        {settling ? (
          <>
            {order.paymentClaimedAt && order.claimedMethod ? (
              <div className="mb-2 rounded-sm border border-brand/50 bg-brand/5 px-2.5 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-brand">
                  Guest says paid by {PAYMENT_LABEL[order.claimedMethod]}
                </p>
                <p className="mt-0.5 text-[11px] text-muted">
                  Check your notification, then confirm below.
                </p>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="eyebrow">{order.paymentClaimedAt ? "Confirm" : "Settle"}</span>
              <span className="tnum text-sm font-semibold">{formatINR(order.total)}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {PAYMENT_ORDER.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => void run(markPaid(order.id, method))}
                  className="h-8 rounded-[6px] border border-ink text-[11px] font-semibold uppercase tracking-[0.06em] hover:bg-ink hover:text-cream transition-colors"
                >
                  {PAYMENT_LABEL[method]}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <span className="tnum text-xs text-muted">{formatINR(order.total)}</span>
            {action ? (
              <button
                type="button"
                onClick={() => {
                  onAdvance(order.status);
                  void run(advanceOrder(order.id));
                }}
                className="h-8 px-3 rounded-[6px] bg-ink text-cream text-[11px] font-semibold uppercase tracking-[0.1em] hover:bg-brand transition-colors"
              >
                {action}
              </button>
            ) : null}
          </div>
        )}

        {/* Undo, edit, void, print: the things a counter needs when something
            goes wrong, which is most shifts. */}
        <div className="mt-2.5 pt-2 border-t border-line-soft flex flex-wrap items-center gap-x-3 gap-y-1">
          <AnimatePresence>
            {undoTo ? (
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={transition}
                onClick={async () => {
                  await run(setOrderStatus(order.id, undoTo));
                  onUndone();
                }}
                className="text-[11px] font-semibold uppercase tracking-[0.08em] text-brand underline underline-offset-2"
              >
                Undo
              </motion.button>
            ) : null}
          </AnimatePresence>

          {!isSettled(order.status) ? (
            <button
              type="button"
              onClick={() => {
                setDraft(order.lines);
                setEditing((on) => !on);
              }}
              className="text-[11px] uppercase tracking-[0.08em] text-muted hover:text-ink transition-colors"
            >
              {editing ? "Editing" : "Edit"}
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => printKot(order)}
            className="text-[11px] uppercase tracking-[0.08em] text-muted hover:text-ink transition-colors"
          >
            Print
          </button>

          {order.status === "paid" ? (
            <button
              type="button"
              onClick={() => void run(refundOrder(order.id))}
              className="ml-auto text-[11px] uppercase tracking-[0.08em] text-status-new hover:underline"
            >
              Refund
            </button>
          ) : !isSettled(order.status) ? (
            confirmVoid ? (
              <span className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await run(voidOrder(order.id));
                    setConfirmVoid(false);
                  }}
                  className="text-[11px] font-semibold uppercase tracking-[0.08em] text-status-new"
                >
                  Void it
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmVoid(false)}
                  className="text-[11px] uppercase tracking-[0.08em] text-muted"
                >
                  Keep
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmVoid(true)}
                className="ml-auto text-[11px] uppercase tracking-[0.08em] text-muted hover:text-status-new transition-colors"
              >
                Void
              </button>
            )
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}

/** Take an item off the board when the kitchen runs out. */
function Availability({ soldOut, onClose }: { soldOut: string[]; onClose: () => void }) {
  return (
    <div className="border-t border-line bg-cream/60">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.12em]">Today&rsquo;s board</h2>
            <p className="mt-1 text-xs text-muted">
              Tap an item to take it off. Guests see it greyed out and cannot add it.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 h-8 px-3 border border-line text-xs font-semibold text-ink-2 hover:border-ink hover:text-ink transition-colors"
          >
            Done
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <div key={category.id}>
              <p className="eyebrow pb-2 border-b border-line">{category.name}</p>
              <ul className="mt-2 flex flex-col gap-1">
                {itemsIn(category.id).map((item) => {
                  const off = soldOut.includes(item.id);
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => toggleSoldOut(item.id)}
                        aria-pressed={off}
                        className={`w-full flex items-center gap-2 rounded-[6px] px-3 py-1.5 text-left text-xs border transition-colors ${
                          off
                            ? "border-status-new bg-status-new/5 text-status-new line-through"
                            : "border-transparent text-ink-2 hover:border-line hover:bg-paper"
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`w-2 h-2 shrink-0 ${off ? "bg-status-new" : "bg-status-ready"}`}
                        />
                        <span className="truncate">{item.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-muted">
          {soldOut.length === 0
            ? `All ${menu.length} items on the board.`
            : `${soldOut.length} of ${menu.length} items off the board.`}
        </p>
      </div>
    </div>
  );
}
