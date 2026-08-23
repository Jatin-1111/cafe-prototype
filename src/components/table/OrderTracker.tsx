"use client";

import Link from "next/link";
import { useState } from "react";
import { cafe } from "@/data/cafe";
import { formatINR } from "@/data/menu";
import {
  clockTime,
  elapsed,
  guestStage,
  guestStagesFor,
  markPaid,
  PAYMENT_LABEL,
  requestBill,
  taxBreakdown,
  type Order,
} from "@/lib/orders";
import { useMounted, useNow, useOrder } from "@/lib/useStore";
import { CheckerRule } from "@/components/CheckerRule";
import { FauxQR } from "@/components/FauxQR";
import { Sheet } from "@/components/table/Sheet";

export function OrderTracker({ table, id }: { table: string; id: string }) {
  const mounted = useMounted();
  const order = useOrder(id);
  const now = useNow();
  const [payOpen, setPayOpen] = useState(false);

  if (!mounted) {
    return (
      <Shell table={table}>
        <p className="px-4 py-16 text-center text-sm text-muted">Fetching your order…</p>
      </Shell>
    );
  }

  if (!order) {
    return (
      <Shell table={table}>
        <div className="px-4 py-16 text-center">
          <p className="font-display text-2xl tracking-tight">ORDER NOT FOUND</p>
          <p className="mt-3 text-sm text-muted max-w-[34ch] mx-auto leading-relaxed">
            This prototype keeps orders in the browser, so a fresh browser will not have it.
            Place a new one and it will show up here.
          </p>
          <Link
            href={`/t/${table}`}
            className="mt-8 inline-flex items-center h-12 px-7 bg-ink text-bone text-xs font-bold uppercase tracking-[0.14em] hover:bg-brand transition-colors"
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

  const stages = guestStagesFor(order.orderType);
  const stage = guestStage(order.status);
  const current = stages[stage];
  const settled = order.status === "served";
  const takeaway = order.orderType === "takeaway";

  return (
    <Shell table={table}>
      <div className="px-4 pt-8 pb-6 text-center border-b border-line">
        <p className="eyebrow">
          Order {order.code}
          {order.orderType === "takeaway" ? " · Takeaway" : ""}
        </p>
        <h1 className="mt-3 font-display text-3xl leading-none tracking-tight text-brand">
          {current.label.toUpperCase()}
        </h1>
        <p className="mt-3 text-sm text-ink-2 max-w-[36ch] mx-auto leading-relaxed">
          {current.copy}
        </p>
        <p className="mt-4 tnum text-[11px] uppercase tracking-[0.14em] text-muted">
          Placed {clockTime(order.placedAt)}
          {now ? ` · ${elapsed(order.placedAt, now)} ago` : ""}
        </p>
      </div>

      {/* Stepper */}
      <ol className="grid grid-cols-4 gap-px bg-line border-b border-line">
        {stages.map((step, index) => {
          const done = index <= stage;
          return (
            <li
              key={step.key}
              className={`px-2 py-3 text-center ${
                done ? "bg-brand text-cream" : "bg-paper text-muted"
              }`}
              aria-current={index === stage ? "step" : undefined}
            >
              <span className="block tnum text-[10px] font-bold opacity-70">0{index + 1}</span>
              <span className="block mt-1 text-[10px] uppercase tracking-[0.1em] font-bold">
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>

      <Lines order={order} />

      {order.note ? (
        <div className="mx-4 mt-4 border-l-4 border-gold bg-cream px-4 py-3">
          <p className="eyebrow">Your note</p>
          <p className="mt-1.5 text-sm text-ink-2">{order.note}</p>
        </div>
      ) : null}

      <div className="px-4 py-5 mt-4 bg-cream border-y border-line flex items-baseline justify-between">
        <span className="eyebrow">Total · GST included</span>
        <span className="tnum font-display text-2xl">{formatINR(order.total)}</span>
      </div>

      {/* ---------- Settle ---------- */}
      <div className="px-4 py-6">
        {settled ? (
          order.billRequested ? (
            <div className="border-2 border-brand bg-brand/5 px-4 py-5 text-center">
              <p className="eyebrow text-brand">Bill on its way</p>
              <p className="mt-2 text-sm text-ink-2 leading-relaxed max-w-[34ch] mx-auto">
                {takeaway
                  ? "Bring it to the till — card and cash both work."
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
                className="w-full py-4 bg-clay text-cream font-bold uppercase tracking-[0.14em] text-xs hover:bg-ink transition-colors"
              >
                Pay now · {formatINR(order.total)}
              </button>
              <button
                type="button"
                onClick={() => requestBill(order.id)}
                className="w-full py-4 border-2 border-ink text-xs font-bold uppercase tracking-[0.14em] hover:bg-ink hover:text-bone transition-colors"
              >
                Ask for the bill
              </button>
            </div>
          )
        ) : (
          <p className="text-center text-[11px] text-muted leading-relaxed">
            You can settle up once everything has
            {takeaway ? " been handed over." : " reached the table."}
          </p>
        )}

        <Link
          href={`/t/${table}`}
          className="mt-6 w-full inline-flex items-center justify-center h-12 border border-line text-xs font-bold uppercase tracking-[0.14em] text-ink-2 hover:border-ink hover:text-ink transition-colors"
        >
          Order something else
        </Link>
        <p className="mt-4 text-[11px] text-muted text-center leading-relaxed">
          This screen updates on its own. Leave it open, or come back to it from the menu.
        </p>
      </div>

      {payOpen ? (
        <PaySheet
          order={order}
          onClose={() => setPayOpen(false)}
          onPaid={() => {
            markPaid(order.id, "upi");
            setPayOpen(false);
          }}
        />
      ) : null}
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
        <div className="mx-auto w-fit bg-bone border-4 border-ink p-4">
          <FauxQR seed={`pay-${order.code}`} className="w-40 h-40 text-ink" />
        </div>
        <p className="mt-4 eyebrow">{cafe.fullName}</p>
        <p className="mt-1 tnum font-display text-3xl">{formatINR(order.total)}</p>
        <p className="mt-4 text-xs text-muted max-w-[32ch] mx-auto leading-relaxed">
          Scan with any UPI app. In this prototype nothing is charged — the button below just
          marks the order settled.
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
          {confirming ? "Confirming…" : "I have paid"}
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
        <p className="mt-4 tnum text-[11px] uppercase tracking-[0.14em] text-muted">
          {order.code} · {order.orderType === "takeaway" ? "Takeaway" : `Table ${order.table}`}
          {order.guest?.name ? ` · ${order.guest.name}` : ""}
        </p>
      </div>

      <Lines order={order} />

      <dl className="px-4 py-5 space-y-2 border-b-2 border-dashed border-line text-sm">
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
            {order.paymentMethod ? PAYMENT_LABEL[order.paymentMethod] : "—"}
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
            Filter refills are free until noon, and the corner table is always first-come.
          </p>
        </div>
        <Link
          href={`/t/${order.table}`}
          className="mt-4 w-full inline-flex items-center justify-center h-12 border-2 border-ink text-xs font-bold uppercase tracking-[0.14em] hover:bg-ink hover:text-bone transition-colors"
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
    <div className="min-h-dvh bg-bone flex flex-col">
      <div className="w-full max-w-md mx-auto flex-1 bg-paper border-x border-line min-h-dvh">
        <CheckerRule size={8} />
        <div className="px-4 pt-3 flex items-center justify-between">
          <span className="inline-flex items-center h-6 px-2.5 bg-brand text-cream text-[10px] font-bold uppercase tracking-[0.14em]">
            {label}
          </span>
          <Link href="/" className="font-display text-base leading-none tracking-tight">
            KAHANI
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
