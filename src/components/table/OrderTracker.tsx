"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cafe } from "@/data/cafe";
import { formatINR } from "@/data/menu";
import {
  CANCEL_WINDOW_MS,
  canCancel,
  cancelOrder,
  clockTime,
  etaCopy,
  elapsed,
  guestStage,
  guestStagesFor,
  claimPayment,
  extrasTotal,
  PAYMENT_LABEL,
  splitEvenly,
  requestBill,
  taxBreakdown,
  type Order,
} from "@/lib/orders";
import { useConnection, useMounted, useNow, useOrder } from "@/lib/useStore";
import type { OrderStatus } from "@/lib/orderTypes";
import { ArcadeRule } from "@/components/ArcadeRule";
import { FauxQR } from "@/components/FauxQR";
import { Sheet } from "@/components/table/Sheet";
import { MinusIcon, PlusIcon } from "@/components/Icon";
import { swap, transition, EASE, DURATION } from "@/lib/motion";

/**
 * Buzzes and marks the tab the moment an order is ready. A guest's phone is
 * locked in their pocket by then, so a status that only changes on screen is a
 * status nobody sees.
 */
function useReadyAlert(status: OrderStatus | undefined) {
  const previous = useRef<OrderStatus | undefined>(undefined);

  useEffect(() => {
    const was = previous.current;
    previous.current = status;
    if (status !== "ready" || was === undefined || was === "ready") return;

    navigator.vibrate?.([180, 90, 180]);

    const original = document.title;
    document.title = "Ready to collect";
    const restore = () => {
      if (document.visibilityState === "visible") document.title = original;
    };
    document.addEventListener("visibilitychange", restore);
    return () => {
      document.removeEventListener("visibilitychange", restore);
      document.title = original;
    };
  }, [status]);
}

export function OrderTracker({ table, id }: { table: string; id: string }) {
  const mounted = useMounted();
  const order = useOrder(id);
  const now = useNow();
  const { loaded } = useConnection();
  const [payOpen, setPayOpen] = useState(false);
  const [cancelNote, setCancelNote] = useState<string | null>(null);
  const [ways, setWays] = useState(1);

  useReadyAlert(order?.status);

  if (!mounted || !order) {
    // Shaped like the real thing, so the page does not lurch when it arrives.
    // Only call it missing once a read has actually come back empty.
    const missing = mounted && loaded && !order;
    if (!missing) {
      return (
        <Shell table={table}>
          <div className="animate-pulse" aria-hidden>
            <div className="px-4 pt-8 pb-6 text-center border-b border-line">
              <div className="mx-auto h-3 w-24 rounded-[6px] bg-sand-deep" />
              <div className="mx-auto mt-4 h-8 w-40 rounded-[6px] bg-sand-deep" />
              <div className="mx-auto mt-4 h-3 w-56 rounded-[6px] bg-sand" />
              <div className="mx-auto mt-5 h-8 w-44 rounded-[6px] bg-sand" />
            </div>
            <div className="grid grid-cols-4 gap-px bg-line border-b border-line">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-paper" />
              ))}
            </div>
            <div className="px-4">
              {[0, 1].map((i) => (
                <div key={i} className="flex gap-3 py-4 border-b border-line">
                  <div className="h-3 w-7 rounded-[6px] bg-sand-deep" />
                  <div className="h-3 flex-1 rounded-[6px] bg-sand" />
                </div>
              ))}
            </div>
          </div>
          <p className="sr-only" role="status">
            Loading your order
          </p>
        </Shell>
      );
    }
  }

  if (!order) {
    return (
      <Shell table={table}>
        <div className="px-4 py-16 text-center">
          <p className="font-display text-2xl tracking-tight">ORDER NOT FOUND</p>
          <p className="mt-3 text-sm text-muted max-w-[34ch] mx-auto leading-relaxed">
            This prototype keeps orders in the browser, so a fresh browser will not have it. Place a
            new one and it will show up here.
          </p>
          <Link
            href={`/t/${table}`}
            className="mt-8 inline-flex items-center h-12 px-8 rounded-[6px] bg-ink text-cream text-xs font-semibold uppercase tracking-[0.14em] hover:bg-brand transition-colors"
          >
            Back to the menu
          </Link>
        </div>
      </Shell>
    );
  }

  if (order.status === "paid") {
    return (
      <Shell table={table}>
        <Receipt order={order} />
      </Shell>
    );
  }

  if (order.status === "cancelled") {
    return (
      <Shell table={table}>
        <div className="px-5 py-16 text-center">
          <p className="eyebrow">Order {order.code}</p>
          <h1 className="mt-4 font-display text-3xl leading-tight">Cancelled</h1>
          <p className="mt-4 text-sm text-ink-2 max-w-[32ch] mx-auto leading-relaxed">
            Nothing was sent to the kitchen and there is nothing to pay.
          </p>
          <Link
            href={`/t/${table}`}
            className="mt-8 inline-flex items-center h-12 px-8 rounded-[6px] bg-ink text-cream text-xs font-semibold uppercase tracking-[0.14em] hover:bg-brand transition-colors"
          >
            Order again
          </Link>
        </div>
      </Shell>
    );
  }

  const stages = guestStagesFor(order.orderType);
  const stage = guestStage(order.status);
  const current = stages[stage];
  const settled = order.status === "served";
  const takeaway = order.orderType === "takeaway";
  const eta = etaCopy(order, now);
  const cancellable = canCancel(order, now);
  const cancelSecondsLeft = Math.max(
    0,
    Math.ceil((order.placedAt + CANCEL_WINDOW_MS - now) / 1000),
  );

  return (
    <Shell table={table}>
      <div className="px-4 pt-8 pb-6 text-center border-b border-line">
        {/* The one screen whose whole job is telling you something changed. */}
        <p className="sr-only" role="status" aria-live="polite">
          Order {order.code}: {current.label}. {current.copy}
        </p>
        <p className="eyebrow">
          Order {order.code}
          {order.orderType === "takeaway" ? " · Takeaway" : ""}
        </p>
        {/* This heading is the entire point of the screen, and it changes while
            the phone is face down on the table. Swapping it with a crossfade
            means a guest who glances back sees that something moved, instead of
            wondering whether it always said that. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={order.status} {...swap}>
            <h1 className="mt-3 font-display text-3xl leading-none tracking-tight text-brand">
              {current.label.toUpperCase()}
            </h1>
            <p className="mt-3 text-sm text-ink-2 max-w-[36ch] mx-auto leading-relaxed">
              {current.copy}
            </p>
          </motion.div>
        </AnimatePresence>
        <AnimatePresence>
          {eta ? (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={transition}
              className="mt-5 inline-flex items-center gap-2 rounded-[6px] border border-brand/35 bg-brand/5 px-4 py-1.5"
            >
              <span className="text-sm font-semibold text-brand">{eta}</span>
              {order.readyBy ? (
                <span className="tnum text-xs text-muted">· by {clockTime(order.readyBy)}</span>
              ) : null}
            </motion.p>
          ) : null}
        </AnimatePresence>

        <p className="mt-4 tnum text-xs uppercase tracking-[0.14em] text-muted">
          Placed {clockTime(order.placedAt)}
          {now ? ` · ${elapsed(order.placedAt, now)} ago` : ""}
        </p>
      </div>

      {/* Stepper */}
      <ol className="grid grid-cols-4 gap-px bg-line border-b border-line">
        {stages.map((step, index) => {
          const done = index <= stage;
          return (
            <motion.li
              key={step.key}
              /* The colour is animated rather than swapped so the step you are
                 on fills in, which is a smaller signal than the heading but
                 points at the same change. */
              initial={false}
              animate={{
                backgroundColor: done ? "var(--color-brand)" : "var(--color-paper)",
                color: done ? "var(--color-cream)" : "var(--color-muted)",
              }}
              transition={{
                duration: DURATION.slow,
                ease: EASE,
                delay: done ? index * 0.05 : 0,
              }}
              className="px-2 py-3 text-center"
              aria-current={index === stage ? "step" : undefined}
            >
              <span className="block tnum text-[11px] font-bold opacity-70">0{index + 1}</span>
              <span className="block mt-1 text-[11px] uppercase tracking-[0.1em] font-bold">
                {step.label}
              </span>
            </motion.li>
          );
        })}
      </ol>

      <Lines order={order} />

      {order.note ? (
        <div className="mx-4 mt-4 rounded-card border-l-4 border-brass bg-cream px-4 py-3">
          <p className="eyebrow">Your note</p>
          <p className="mt-1.5 text-sm text-ink-2">{order.note}</p>
        </div>
      ) : null}

      <div className="px-4 py-5 mt-4 bg-cream border-y border-line">
        <div className="flex items-baseline justify-between">
          <span className="eyebrow">Total · GST included</span>
          <span className="tnum font-display text-2xl">{formatINR(order.total)}</span>
        </div>
        {order.packing ? (
          <p className="mt-1 tnum text-xs text-muted text-right">
            includes {formatINR(order.packing)} packing
          </p>
        ) : null}

        {settled ? (
          <div className="mt-4 pt-4 border-t border-line flex items-center justify-between gap-3">
            <span className="eyebrow">Split</span>
            <span className="flex items-center gap-3">
              <span className="flex items-center rounded-[6px] border border-line overflow-hidden">
                <button
                  type="button"
                  aria-label="Fewer people"
                  onClick={() => setWays((n) => Math.max(1, n - 1))}
                  className="w-8 h-8 grid place-items-center hover:bg-sand"
                >
                  <MinusIcon className="w-3.5 h-3.5" />
                </button>
                <span className="tnum w-8 text-center text-sm font-bold">{ways}</span>
                <button
                  type="button"
                  aria-label="More people"
                  onClick={() => setWays((n) => Math.min(12, n + 1))}
                  className="w-8 h-8 grid place-items-center hover:bg-sand"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                </button>
              </span>
              <span className="tnum text-sm font-semibold text-brand">
                {ways === 1 ? "·" : `${formatINR(splitEvenly(order.total, ways)[1])} each`}
              </span>
            </span>
          </div>
        ) : null}
      </div>

      {/* ---------- Settle ---------- */}
      <div className="px-4 py-6">
        {settled && order.paymentClaimedAt ? (
          <div className="rounded-card border border-brand/40 bg-brand/5 px-4 py-5 text-center">
            <p className="eyebrow text-brand">Waiting for the counter</p>
            <p className="mt-2 text-sm text-ink-2 leading-relaxed max-w-[34ch] mx-auto">
              You said you have sent {formatINR(order.total)}. The counter confirms it against their
              own notification, then this closes.
            </p>
          </div>
        ) : settled ? (
          order.billRequested ? (
            <div className="rounded-card border border-brand/40 bg-brand/5 px-4 py-5 text-center">
              <p className="eyebrow text-brand">Bill on its way</p>
              <p className="mt-2 text-sm text-ink-2 leading-relaxed max-w-[34ch] mx-auto">
                {takeaway
                  ? "Bring it to the till. Card and cash both work."
                  : "Someone is bringing it over. Card and cash both work at the table."}
              </p>
              <button
                type="button"
                onClick={() => setPayOpen(true)}
                className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-brand underline underline-offset-4 hover:text-ink transition-colors"
              >
                Pay by UPI instead
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setPayOpen(true)}
                className="w-full py-4 bg-wine text-cream font-bold uppercase tracking-[0.14em] text-xs hover:bg-ink transition-colors"
              >
                Pay now · {formatINR(order.total)}
              </button>
              <button
                type="button"
                onClick={() => requestBill(order.id)}
                className="w-full py-4 border-2 border-ink text-xs font-bold uppercase tracking-[0.14em] hover:bg-ink hover:text-sand transition-colors"
              >
                Ask for the bill
              </button>
            </div>
          )
        ) : (
          <p className="text-center text-xs text-muted leading-relaxed">
            You can settle up once everything has
            {takeaway ? " been handed over." : " reached the table."}
          </p>
        )}

        {cancellable ? (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={async () => {
                const ok = await cancelOrder(order.id);
                if (!ok) setCancelNote("Too late. The kitchen has it, so ask the counter.");
              }}
              className="text-xs font-semibold uppercase tracking-[0.12em] text-wine underline underline-offset-4 hover:text-ink transition-colors"
            >
              Cancel this order
            </button>
            <p className="mt-2 tnum text-xs text-muted">
              {cancelSecondsLeft}s left to change your mind
            </p>
          </div>
        ) : null}

        {cancelNote ? <p className="mt-4 text-xs text-center text-wine">{cancelNote}</p> : null}

        <Link
          href={`/t/${table}`}
          className="mt-6 w-full inline-flex items-center justify-center h-12 rounded-[6px] border border-line text-xs font-semibold uppercase tracking-[0.14em] text-ink-2 hover:border-ink hover:text-ink transition-colors"
        >
          Order something else
        </Link>
        <p className="mt-4 text-xs text-muted text-center leading-relaxed">
          This screen updates on its own. Leave it open, or come back to it from the menu.
        </p>
      </div>

      <AnimatePresence>
        {payOpen ? (
          <PaySheet
            order={order}
            onClose={() => setPayOpen(false)}
            onPaid={() => {
              void claimPayment(order.id, "upi");
              setPayOpen(false);
            }}
          />
        ) : null}
      </AnimatePresence>
    </Shell>
  );
}

/* ============================================================ */

function Lines({ order }: { order: Order }) {
  return (
    <ul className="px-4">
      {order.lines.map((line, index) => (
        <li key={index} className="flex gap-3 py-4 border-b border-line">
          <span className="tnum text-sm font-bold text-brand w-7 shrink-0">{line.qty}×</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{line.name}</p>
            {line.options ? (
              <p className="mt-1 text-xs text-muted">
                {Object.entries(line.options)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(" · ")}
              </p>
            ) : null}
            {line.note ? <p className="mt-1 text-xs text-brand">{line.note}</p> : null}
          </div>
          <span className="tnum text-sm text-ink-2">{formatINR(line.price * line.qty)}</span>
        </li>
      ))}
    </ul>
  );
}

function PaySheet({
  order,
  onClose,
  onPaid,
}: {
  order: Order;
  onClose: () => void;
  onPaid: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <Sheet
      title="Pay by UPI"
      subtitle={`${order.code} · ${formatINR(order.total)}`}
      onClose={onClose}
    >
      <div className="px-4 py-6 overflow-y-auto text-center">
        <div className="mx-auto w-fit bg-sand border-4 border-ink p-4">
          <FauxQR seed={`pay-${order.code}`} className="w-40 h-40 text-ink" />
        </div>
        <p className="mt-4 eyebrow">{cafe.fullName}</p>
        <p className="mt-1 tnum font-display text-3xl">{formatINR(order.total)}</p>
        <p className="mt-4 text-xs text-muted max-w-[32ch] mx-auto leading-relaxed">
          Scan with any UPI app. In this prototype nothing is charged. The button below just marks
          the order settled.
        </p>
      </div>

      <div className="px-4 py-4 border-t border-line bg-cream">
        <button
          type="button"
          onClick={() => {
            setConfirming(true);
            onPaid();
          }}
          disabled={confirming}
          className="w-full py-4 bg-brand text-cream font-bold uppercase tracking-[0.14em] text-xs hover:bg-brand-deep transition-colors disabled:opacity-50"
        >
          {confirming ? "Telling the counter…" : "I have sent it"}
        </button>
      </div>
    </Sheet>
  );
}

function Receipt({ order }: { order: Order }) {
  const tax = taxBreakdown(order.total);

  return (
    <>
      <div className="px-4 pt-8 pb-6 text-center border-b-2 border-dashed border-line">
        <p className="eyebrow text-brand">Paid · thank you</p>
        <h1 className="mt-3 font-display text-2xl leading-tight tracking-tight">
          {cafe.fullName.toUpperCase()}
        </h1>
        <p className="mt-2 text-xs text-muted">
          {cafe.address.line1}, {cafe.address.line2}
        </p>
        <p className="mt-4 tnum text-xs uppercase tracking-[0.14em] text-muted">
          {order.code} · {order.orderType === "takeaway" ? "Takeaway" : `Table ${order.table}`}
          {order.guest?.name ? ` · ${order.guest.name}` : ""}
        </p>
      </div>

      <Lines order={order} />

      <dl className="px-4 py-5 space-y-2 border-b-2 border-dashed border-line text-sm">
        {extrasTotal(order.lines) > 0 ? (
          <div className="flex justify-between">
            <dt className="text-muted">Extras and upgrades</dt>
            <dd className="tnum text-ink-2">{formatINR(extrasTotal(order.lines))}</dd>
          </div>
        ) : null}
        {order.packing ? (
          <div className="flex justify-between">
            <dt className="text-muted">Packing</dt>
            <dd className="tnum text-ink-2">{formatINR(order.packing)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between">
          <dt className="text-muted">Net of tax</dt>
          <dd className="tnum text-ink-2">{formatINR(tax.base)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">CGST 2.5%</dt>
          <dd className="tnum text-ink-2">{formatINR(tax.cgst)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">SGST 2.5%</dt>
          <dd className="tnum text-ink-2">{formatINR(tax.sgst)}</dd>
        </div>
        <div className="flex justify-between items-baseline pt-3 border-t border-line">
          <dt className="eyebrow">Paid</dt>
          <dd className="tnum font-display text-2xl">{formatINR(order.total)}</dd>
        </div>
      </dl>

      <div className="px-4 py-5">
        <dl className="grid grid-cols-2 gap-y-2 text-xs">
          <dt className="text-muted">Method</dt>
          <dd className="text-right font-semibold">
            {order.paymentMethod ? PAYMENT_LABEL[order.paymentMethod] : "·"}
          </dd>
          <dt className="text-muted">Settled</dt>
          <dd className="tnum text-right">
            {order.paidAt ? clockTime(order.paidAt) : clockTime(order.updatedAt)}
          </dd>
          <dt className="text-muted">Placed</dt>
          <dd className="tnum text-right">{clockTime(order.placedAt)}</dd>
        </dl>
      </div>

      <div className="px-4 pb-10">
        <div className="border border-line bg-cream px-4 py-5 text-center">
          <p className="font-display text-lg leading-tight tracking-tight">COME BACK SOON</p>
          <p className="mt-2 text-xs text-muted leading-relaxed max-w-[32ch] mx-auto">
            The jade booth seats six, and the Wi-Fi is on the house all day.
          </p>
        </div>
        <Link
          href={`/t/${order.table}`}
          className="mt-4 w-full inline-flex items-center justify-center h-12 rounded-[6px] border border-ink/30 text-xs font-semibold uppercase tracking-[0.14em] hover:bg-ink hover:text-cream hover:border-ink transition-colors"
        >
          Start a new order
        </Link>
      </div>
    </>
  );
}

function Shell({ table, children }: { table: string; children: React.ReactNode }) {
  const label = table === "TA" ? "Takeaway" : `Table ${table}`;
  return (
    <div className="min-h-dvh bg-sand flex flex-col">
      <div className="w-full max-w-md mx-auto flex-1 bg-paper border-x border-line min-h-dvh">
        <ArcadeRule size={20} />
        <div className="px-4 pt-3 flex items-center justify-between">
          <span className="inline-flex items-center h-6 px-3 rounded-[6px] bg-brand text-cream text-xs font-semibold uppercase tracking-[0.12em]">
            {label}
          </span>
          <Link href="/" className="wordmark text-sm leading-none">
            {cafe.name.toUpperCase()}
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
