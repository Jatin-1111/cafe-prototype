"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cafe } from "@/data/cafe";
import {
  categories,
  formatINR,
  itemsIn,
  menuById,
  type CategoryId,
  type MenuItem,
} from "@/data/menu";
import {
  addToCart,
  cartCount,
  cartTotal,
  clockTime,
  placeOrder,
  setLineQty,
  STATUS_LABEL,
  type OrderType,
} from "@/lib/orders";
import { useCart, useMounted, useOrders, useSoldOut } from "@/lib/useStore";
import { VegMark } from "@/components/VegMark";
import { CheckerRule } from "@/components/CheckerRule";
import { Sheet } from "@/components/table/Sheet";

export function TableScreen({ table }: { table: string }) {
  const router = useRouter();
  const mounted = useMounted();
  const lines = useCart(table);
  const orders = useOrders();
  const soldOut = useSoldOut();

  const [active, setActive] = useState<CategoryId>("brew");
  const [optionFor, setOptionFor] = useState<MenuItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  // Captured once, when the guest scans in — not a ticking clock.
  const [scannedAt] = useState(() => Date.now());

  const count = cartCount(lines);
  const total = cartTotal(lines);
  const spotLabel = table === "TA" ? "Takeaway" : `Table ${table}`;

  const openOrders = useMemo(
    () => orders.filter((order) => order.table === table && order.status !== "paid"),
    [orders, table],
  );

  function add(item: MenuItem, options?: Record<string, string>) {
    addToCart(table, item.id, options);
    setFlash(item.id);
    window.setTimeout(() => setFlash((current) => (current === item.id ? null : current)), 700);
  }

  return (
    <div className="min-h-dvh bg-bone flex flex-col">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col bg-paper border-x border-line min-h-dvh">
        {/* ---------- Header ---------- */}
        <header className="sticky top-0 z-30 bg-paper">
          <CheckerRule size={8} />
          <div className="px-4 pt-3 flex items-center justify-between gap-3">
            <span className="inline-flex items-center h-6 px-2.5 bg-brand text-cream text-[10px] font-bold uppercase tracking-[0.14em]">
              {spotLabel}
            </span>
            <span className="text-[10px] uppercase tracking-[0.14em] text-muted">
              {mounted ? `Scanned ${clockTime(scannedAt)}` : "Scanned"}
            </span>
          </div>

          <div className="px-4 pt-4 pb-3 text-center">
            <p className="text-[9px] uppercase tracking-[0.22em] text-muted">
              Est. {cafe.established} · {cafe.city}
            </p>
            <p className="font-display text-2xl mt-1.5 leading-none tracking-tight">
              {cafe.name.toUpperCase()}
            </p>
          </div>

          <nav
            className="flex gap-5 px-4 border-b border-line overflow-x-auto"
            aria-label="Menu sections"
          >
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActive(category.id)}
                aria-current={active === category.id}
                className={`shrink-0 pb-2.5 text-[11px] uppercase tracking-[0.12em] font-semibold border-b-2 -mb-px transition-colors ${
                  active === category.id
                    ? "text-ink border-gold"
                    : "text-muted border-transparent hover:text-ink"
                }`}
              >
                {category.name}
              </button>
            ))}
          </nav>
        </header>

        {/* ---------- Orders already running at this table ---------- */}
        {mounted && openOrders.length > 0 ? (
          <div className="px-4 pt-4">
            {openOrders.map((order) => (
              <Link
                key={order.id}
                href={`/t/${table}/order/${order.id}`}
                className="flex items-center justify-between gap-3 border border-brand bg-brand/5 px-3 py-2.5 mb-2 hover:bg-brand/10 transition-colors"
              >
                <span className="text-xs">
                  <span className="font-semibold text-brand">{order.code}</span>
                  <span className="text-muted">
                    {" · "}
                    {order.lines.length} {order.lines.length === 1 ? "item" : "items"}
                  </span>
                </span>
                <span className="text-[10px] uppercase tracking-[0.14em] font-bold text-brand">
                  {order.billRequested ? "Bill coming" : STATUS_LABEL[order.status]} →
                </span>
              </Link>
            ))}
          </div>
        ) : null}

        {/* ---------- Items ---------- */}
        <ul className="px-4 flex-1" style={{ paddingBottom: count > 0 ? 96 : 32 }}>
          <li className="pt-5 pb-3">
            <p className="text-xs text-muted">
              {categories.find((category) => category.id === active)?.blurb}
            </p>
          </li>

          {itemsIn(active).map((item) => {
            const out = mounted && soldOut.includes(item.id);
            return (
              <li key={item.id} className="flex gap-3 items-start py-3.5 border-b border-line">
                <div className={`min-w-0 flex-1 ${out ? "opacity-45" : ""}`}>
                  <div className="flex items-center gap-2">
                    <VegMark veg={item.veg} />
                    <h3 className="font-semibold text-[15px] leading-snug truncate">
                      {item.name}
                    </h3>
                  </div>
                  <p className="mt-1 text-xs text-muted leading-relaxed">{item.description}</p>
                  <p className="mt-1.5 tnum text-sm font-semibold text-brand">
                    {formatINR(item.price)}
                  </p>
                </div>

                {out ? (
                  <span className="shrink-0 mt-1 h-9 px-3 grid place-items-center border-2 border-line text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
                    Sold out
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => (item.options ? setOptionFor(item) : add(item))}
                    className={`shrink-0 mt-1 h-9 px-4 border-2 border-ink text-xs font-bold uppercase tracking-[0.1em] transition-colors ${
                      flash === item.id
                        ? "bg-brand border-brand text-cream"
                        : "bg-paper text-ink hover:bg-ink hover:text-bone"
                    }`}
                  >
                    {flash === item.id ? "Added" : "Add"}
                  </button>
                )}
              </li>
            );
          })}

          <li className="py-8 text-center">
            <p className="text-[11px] text-muted leading-relaxed">
              Anything off-menu, ask the counter.
              <br />
              Prices include GST.
            </p>
          </li>
        </ul>

        {/* ---------- Cart bar ---------- */}
        {mounted && count > 0 ? (
          <div className="sticky bottom-0 z-30 px-3 pb-3 pt-2 bg-gradient-to-t from-paper via-paper to-transparent">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="w-full flex items-center justify-between gap-4 bg-clay text-cream px-4 h-14 font-semibold hover:bg-ink transition-colors"
            >
              <span className="tnum text-sm">
                {count} {count === 1 ? "item" : "items"} · {formatINR(total)}
              </span>
              <span className="text-[11px] uppercase tracking-[0.16em] font-bold">
                Review order
              </span>
            </button>
          </div>
        ) : null}
      </div>

      {optionFor ? (
        <OptionSheet
          // Keyed so the sheet remounts per item — otherwise the previous
          // item's choices survive into the new one.
          key={optionFor.id}
          item={optionFor}
          onClose={() => setOptionFor(null)}
          onAdd={(options) => {
            add(optionFor, options);
            setOptionFor(null);
          }}
        />
      ) : null}

      {cartOpen ? (
        <CheckoutSheet
          table={table}
          spotLabel={spotLabel}
          onClose={() => setCartOpen(false)}
          onSent={(orderId) => {
            setCartOpen(false);
            router.push(`/t/${table}/order/${orderId}`);
          }}
        />
      ) : null}
    </div>
  );
}

/* ============================================================
   Sheets
   ============================================================ */

function OptionSheet({
  item,
  onClose,
  onAdd,
}: {
  item: MenuItem;
  onClose: () => void;
  onAdd: (options: Record<string, string>) => void;
}) {
  const [picked, setPicked] = useState<Record<string, string>>(() =>
    Object.fromEntries((item.options ?? []).map((group) => [group.label, group.choices[0]])),
  );

  return (
    <Sheet title={item.name} subtitle={item.description} onClose={onClose}>
      <div className="px-4 py-5 overflow-y-auto space-y-6">
        {item.options?.map((group) => (
          <fieldset key={group.label}>
            <legend className="eyebrow mb-3">{group.label}</legend>
            <div className="grid gap-2">
              {group.choices.map((choice) => {
                const on = picked[group.label] === choice;
                return (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => setPicked((prev) => ({ ...prev, [group.label]: choice }))}
                    className={`flex items-center gap-3 h-12 px-3 border text-sm text-left transition-colors ${
                      on
                        ? "border-brand bg-brand/5 text-ink font-semibold"
                        : "border-line text-ink-2"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`w-3.5 h-3.5 border-2 shrink-0 ${
                        on ? "border-brand bg-brand" : "border-line"
                      }`}
                    />
                    {choice}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="px-4 py-4 border-t border-line">
        <button
          type="button"
          onClick={() => onAdd(picked)}
          className="w-full py-4 bg-ink text-bone font-bold uppercase tracking-[0.14em] text-xs hover:bg-brand transition-colors"
        >
          Add · {formatINR(item.price)}
        </button>
      </div>
    </Sheet>
  );
}

/**
 * Cart plus the two things the counter actually needs to run the order:
 * a name to call out, and whether it is staying or going.
 */
function CheckoutSheet({
  table,
  spotLabel,
  onClose,
  onSent,
}: {
  table: string;
  spotLabel: string;
  onClose: () => void;
  onSent: (orderId: string) => void;
}) {
  const lines = useCart(table);
  const [note, setNote] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderType, setOrderType] = useState<OrderType>(table === "TA" ? "takeaway" : "table");
  const [sending, setSending] = useState(false);

  const total = cartTotal(lines);
  const needsPhone = orderType === "takeaway";
  const canSend = lines.length > 0 && name.trim().length > 0 && (!needsPhone || phone.trim().length >= 6);

  function send() {
    if (!canSend || sending) return;
    setSending(true);
    const order = placeOrder(table, {
      note,
      orderType,
      guest: { name: name.trim(), phone: phone.trim() || undefined },
    });
    if (order) {
      onSent(order.id);
    } else {
      setSending(false);
    }
  }

  return (
    <Sheet
      title="Your order"
      subtitle={`${spotLabel} · goes straight to the counter`}
      onClose={onClose}
    >
      <div className="overflow-y-auto flex-1">
        <ul className="px-4">
          {lines.map((line, index) => {
            const item = menuById.get(line.itemId);
            return (
              <li key={`${line.itemId}-${index}`} className="flex gap-3 py-4 border-b border-line">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {item ? <VegMark veg={item.veg} /> : null}
                    <p className="font-semibold text-sm truncate">{line.name}</p>
                  </div>
                  {line.options ? (
                    <p className="mt-1 text-xs text-muted">
                      {Object.entries(line.options)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(" · ")}
                    </p>
                  ) : null}
                  <p className="mt-1 tnum text-xs text-muted">{formatINR(line.price)} each</p>
                </div>

                <div className="flex items-center shrink-0 self-start border border-line">
                  <button
                    type="button"
                    onClick={() => setLineQty(table, index, line.qty - 1)}
                    className="w-9 h-9 grid place-items-center text-ink hover:bg-bone transition-colors"
                    aria-label={`One less ${line.name}`}
                  >
                    –
                  </button>
                  <span className="w-8 text-center tnum text-sm font-bold">{line.qty}</span>
                  <button
                    type="button"
                    onClick={() => setLineQty(table, index, line.qty + 1)}
                    className="w-9 h-9 grid place-items-center text-ink hover:bg-bone transition-colors"
                    aria-label={`One more ${line.name}`}
                  >
                    +
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="px-4 py-5 space-y-5 border-t border-line bg-cream/50">
          <fieldset>
            <legend className="eyebrow mb-2">Staying or going</legend>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { key: "table", label: "At my table" },
                  { key: "takeaway", label: "Takeaway" },
                ] as const
              ).map((choice) => {
                const on = orderType === choice.key;
                return (
                  <button
                    key={choice.key}
                    type="button"
                    onClick={() => setOrderType(choice.key)}
                    className={`h-11 text-xs font-bold uppercase tracking-[0.1em] border-2 transition-colors ${
                      on
                        ? "border-brand bg-brand text-cream"
                        : "border-line text-ink-2 hover:border-ink"
                    }`}
                  >
                    {choice.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label htmlFor="guest-name" className="eyebrow block mb-2">
              Name to call out
            </label>
            <input
              id="guest-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="First name is plenty"
              autoComplete="given-name"
              className="w-full h-12 px-3 bg-paper border border-line text-sm focus:border-brand focus:outline-none"
            />
          </div>

          {needsPhone ? (
            <div>
              <label htmlFor="guest-phone" className="eyebrow block mb-2">
                Phone — we message when it is bagged
              </label>
              <input
                id="guest-phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+91"
                autoComplete="tel"
                className="w-full h-12 px-3 bg-paper border border-line text-sm focus:border-brand focus:outline-none"
              />
            </div>
          ) : null}

          <div>
            <label htmlFor="order-note" className="eyebrow block mb-2">
              Note for the kitchen
            </label>
            <textarea
              id="order-note"
              rows={2}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Less sugar, one to go, no onion…"
              className="w-full p-3 bg-paper border border-line text-sm focus:border-brand focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-4 border-t border-line bg-paper">
        <div className="flex items-baseline justify-between mb-3">
          <span className="eyebrow">Total · GST included</span>
          <span className="tnum font-display text-2xl text-ink">{formatINR(total)}</span>
        </div>
        <button
          type="button"
          onClick={send}
          disabled={!canSend || sending}
          className="w-full py-4 bg-clay text-cream font-bold uppercase tracking-[0.14em] text-xs hover:bg-ink transition-colors disabled:opacity-40 disabled:hover:bg-clay"
        >
          {sending ? "Sending…" : "Send to the counter"}
        </button>
        <p className="mt-3 text-[11px] text-muted text-center">
          {canSend
            ? "Settle up from this screen or at the till, whichever you prefer."
            : needsPhone
              ? "Add a name and phone number to send this."
              : "Add a name so the counter knows whose order this is."}
        </p>
      </div>
    </Sheet>
  );
}
