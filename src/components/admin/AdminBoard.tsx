"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cafe } from "@/data/cafe";
import { categories, formatINR, itemsIn, menu } from "@/data/menu";
import {
  advanceOrder,
  clockTime,
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

/** Lanes the counter works, left to right. `paid` is closed out below the board. */
const LANES: OrderStatus[] = ["new", "preparing", "ready", "served"];

const laneBar: Record<OrderStatus, string> = {
  new: "bg-status-new",
  preparing: "bg-status-prep",
  ready: "bg-status-ready",
  served: "bg-ink",
  paid: "bg-status-done",
  cancelled: "bg-muted",
};

/** Minutes after which a ticket in this lane needs attention. */
const laneWarnAfter: Partial<Record<OrderStatus, number>> = {
  new: 3,
  preparing: 12,
  ready: 4,
  served: 25,
};

const PAYMENT_ORDER: PaymentMethod[] = ["cash", "card", "upi"];

export function AdminBoard() {
  const mounted = useMounted();
  const orders = useOrders();
  const soldOut = useSoldOut();
  const now = useNow();
  const { online, loaded } = useConnection();

  const [menuOpen, setMenuOpen] = useState(false);
  const [closedOpen, setClosedOpen] = useState(false);

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
        .filter((order) => order.status === "paid" || order.status === "cancelled")
        .sort((a, b) => (b.paidAt ?? b.updatedAt) - (a.paidAt ?? a.updatedAt)),
    [orders],
  );

  const stats = useMemo(() => {
    const open = orders.filter(isOpen);
    const paid = orders.filter((order) => order.status === "paid");
    return {
      open: open.length,
      kitchen: orders.filter((order) => order.status === "preparing").length,
      bills: orders.filter((order) => order.billRequested).length,
      covers: new Set(
        orders.filter((o) => o.orderType === "table" && o.status !== "cancelled").map((o) => o.table),
      ).size,
      items: orders
        .filter((order) => order.status !== "cancelled")
        .reduce((sum, order) => sum + order.lines.reduce((n, line) => n + line.qty, 0), 0),
      taken: paid.reduce((sum, order) => sum + order.total, 0),
      outstanding: open.reduce((sum, order) => sum + order.total, 0),
    };
  }, [orders]);

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
              {mounted && now ? clockTime(now) : "—"}
            </span>
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
                        <Ticket key={order.id} order={order} now={now} />
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
                <span aria-hidden className="text-muted">
                  {closedOpen ? "▲" : "▼"}
                </span>
              </button>

              {closedOpen ? (
                <ul className="mt-4 rounded-card border border-line divide-y divide-line-soft overflow-hidden">
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
                            ? "Cancelled"
                            : order.paymentMethod
                              ? PAYMENT_LABEL[order.paymentMethod]
                              : "—"}
                        </span>
                        <span className="tnum text-xs text-muted w-16 text-right">
                          {order.paidAt ? clockTime(order.paidAt) : "—"}
                        </span>
                        <span
                          className={`tnum font-semibold w-20 text-right ${
                            order.status === "cancelled" ? "text-muted line-through" : ""
                          }`}
                        >
                          {formatINR(order.total)}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              ) : null}
            </section>
          </>
        )}
      </div>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-4 flex flex-wrap gap-x-6 gap-y-2 items-center justify-between text-xs text-muted">
          <p>
            Prototype. Orders live in this browser and sync across tabs — open the{" "}
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

function Ticket({ order, now }: { order: Order; now: number }) {
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
    <article
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
            {now ? elapsed(order.placedAt, now) : "—"}
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
            <span className="ml-auto rounded-full text-[10px] font-semibold uppercase tracking-[0.1em] bg-brand text-cream px-2.5 py-0.5">
              Bill asked for
            </span>
          ) : null}
        </div>
      ) : null}

      <ul className="px-3 py-2.5 space-y-1.5">
        {order.lines.map((line, index) => (
          <li key={index} className="flex gap-2.5 text-sm leading-snug">
            <span className="tnum font-bold text-brand w-6 shrink-0">{line.qty}×</span>
            <span className="min-w-0">
              {line.name}
              {line.options ? (
                <span className="block text-xs text-muted">
                  {Object.values(line.options).join(" · ")}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>

      {order.note ? (
        <p className="mx-3 mb-2.5 rounded-sm border-l-2 border-brass bg-brass/10 px-2.5 py-1.5 text-xs text-ink-2">
          {order.note}
        </p>
      ) : null}

      <div className="px-3 py-2.5 border-t border-line-soft">
        {settling ? (
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="eyebrow">Settle</span>
              <span className="tnum text-sm font-semibold">{formatINR(order.total)}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {PAYMENT_ORDER.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => markPaid(order.id, method)}
                  className="h-8 border border-ink text-[11px] font-bold uppercase tracking-[0.06em] hover:bg-ink hover:text-sand transition-colors"
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
                onClick={() => advanceOrder(order.id)}
                className="h-8 px-3 bg-ink text-sand text-[11px] font-bold uppercase tracking-[0.1em] hover:bg-brand transition-colors"
              >
                {action}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </article>
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
                        className={`w-full flex items-center gap-2 rounded-full px-3 py-1.5 text-left text-xs border transition-colors ${
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
