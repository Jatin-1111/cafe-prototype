"use client";

import Link from "next/link";
import { cafe } from "@/data/cafe";
import { formatINR } from "@/data/menu";
import { resetDemo, STATUS_LABEL } from "@/lib/orders";
import { useMounted, useOrders } from "@/lib/useStore";
import { ArcadeRule } from "@/components/ArcadeRule";
import { FauxQR } from "@/components/FauxQR";
import { ChevronRightIcon } from "@/components/Icon";

const tables = Array.from({ length: cafe.tables }, (_, i) => String(i + 1).padStart(2, "0"));

const walkthrough = [
  {
    step: "Scan in",
    body: "Pick a table below. That is what the brass-framed code on the marble does.",
  },
  {
    step: "Order",
    body: "Add a couple of things, choose staying or going, leave a name, send it.",
  },
  {
    step: "Work the counter",
    body: "Open the counter board in a second window. Move the ticket along the lanes.",
  },
  {
    step: "Settle",
    body: "Once it is at the table, pay by UPI from the phone or take cash on the board.",
  },
];

export function DemoHub({ scanLinks }: { scanLinks: Record<string, string> }) {
  const mounted = useMounted();
  const orders = useOrders();

  const byTable = new Map<string, { count: number; label: string; total: number }>();
  for (const order of orders) {
    if (order.status === "paid") continue;
    const existing = byTable.get(order.table);
    byTable.set(order.table, {
      count: (existing?.count ?? 0) + 1,
      label: order.billRequested ? "Bill asked for" : STATUS_LABEL[order.status],
      total: (existing?.total ?? 0) + order.total,
    });
  }

  return (
    <div className="min-h-dvh bg-paper flex flex-col">
      <ArcadeRule size={20} />

      <div className="mx-auto max-w-5xl w-full px-5 sm:px-8 py-12 sm:py-16 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="eyebrow">Walk the prototype</p>
            <h1 className="mt-4 font-display text-[clamp(2.25rem,7vw,3.5rem)] leading-[0.92] tracking-tight">
              THREE SCREENS,
              <br />
              ONE ORDER
            </h1>
            <p className="mt-5 max-w-[54ch] text-ink-2 leading-relaxed">
              The guest&rsquo;s phone, the counter board, and the public site are the same data.
              Open two of them side by side and the order moves between them as you work it.
            </p>
          </div>
          <Link
            href="/"
            className="shrink-0 wordmark text-base leading-none hover:text-brand transition-colors"
          >
            {cafe.name.toUpperCase()}
          </Link>
        </div>

        <ol className="mt-10 grid gap-px bg-line border border-line sm:grid-cols-2 lg:grid-cols-4">
          {walkthrough.map((item, index) => (
            <li key={item.step} className="bg-paper p-5">
              <span className="eyebrow tnum text-brand">0{index + 1}</span>
              <h2 className="mt-2 font-semibold">{item.step}</h2>
              <p className="mt-2 text-sm text-muted leading-relaxed">{item.body}</p>
            </li>
          ))}
        </ol>

        {/* ---------- Floor ---------- */}
        <section className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-4 pb-3 border-b-2 border-ink">
            <h2 className="font-display text-2xl tracking-tight">THE FLOOR</h2>
            <p className="text-sm text-muted">
              {mounted
                ? `${byTable.size} of ${cafe.tables + 1} spots have something running`
                : "Loading the floor…"}
            </p>
          </div>

          <ul className="mt-5 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {tables.map((table) => {
              const running = mounted ? byTable.get(table) : undefined;
              return (
                <li key={table}>
                  <Link
                    href={scanLinks[table]}
                    className={`block rounded-card border-2 p-3 transition-colors ${
                      running
                        ? "border-brand bg-brand/5 hover:bg-brand/10"
                        : "border-line hover:border-ink"
                    }`}
                  >
                    <span className="font-display text-2xl leading-none tnum">{table}</span>
                    <span className="mt-2 block text-[11px] uppercase tracking-[0.1em] font-bold text-brand min-h-[1.1em]">
                      {running ? running.label : ""}
                    </span>
                    <span className="mt-0.5 block tnum text-xs text-muted">
                      {running ? formatINR(running.total) : "Free"}
                    </span>
                  </Link>
                </li>
              );
            })}

            <li>
              <Link
                href={scanLinks.TA}
                className="block rounded-card border-2 border-brass bg-brass/10 p-3 h-full hover:bg-brass/20 transition-colors"
              >
                <span className="font-display text-2xl leading-none">TA</span>
                <span className="mt-2 block text-[11px] uppercase tracking-[0.1em] font-bold text-ink min-h-[1.1em]">
                  Takeaway
                </span>
                <span className="mt-0.5 block text-xs text-muted">Counter pickup</span>
              </Link>
            </li>
          </ul>
        </section>

        {/* ---------- Surfaces ---------- */}
        <section className="mt-14 grid gap-5 lg:grid-cols-3">
          <SurfaceCard
            href={scanLinks["07"]}
            eyebrow="Guest · phone"
            title="TABLE SCREEN"
            body="The menu, a cart, a kitchen note, and the tracker that follows the order to the table."
          />
          <SurfaceCard
            href="/admin"
            eyebrow="Staff · counter"
            title="ORDER BOARD"
            body="Four lanes, ageing timers, bill requests flagged, and the day's takings. Items can be pulled off the board here."
          />
          <SurfaceCard
            href="/"
            eyebrow="Public · anyone"
            title="THE WEBSITE"
            body="Story, full menu, hours, and a reservation request. The part that gets found on a search."
          />
        </section>

        {/* ---------- QR + reset ---------- */}
        <section className="mt-14 rounded-card border border-line bg-cream p-6 sm:p-8 flex flex-wrap items-center gap-8 justify-between">
          <div className="flex items-center gap-6">
            <div className="bg-paper rounded-card border-4 border-ink p-3 shrink-0">
              <FauxQR seed="refections-table-07" className="w-24 h-24 text-ink" />
            </div>
            <div>
              <p className="eyebrow">On the marble</p>
              <p className="mt-2 font-display text-xl leading-tight tracking-tight">
                ONE CODE PER TABLE
              </p>
              <p className="mt-2 text-sm text-muted max-w-[38ch] leading-relaxed">
                The artwork is decorative, but the links above are not: each carries that
                table&rsquo;s signed key. Typing another table&rsquo;s address gets you nowhere,
                which is why an order always reaches the right marble.
              </p>
            </div>
          </div>

          <div className="sm:text-right">
            <button
              type="button"
              onClick={resetDemo}
              className="h-11 px-6 border-2 border-ink text-xs font-bold uppercase tracking-[0.12em] hover:bg-ink hover:text-sand transition-colors"
            >
              Reset the demo
            </button>
            <p className="mt-3 text-xs text-muted max-w-[30ch]">
              Puts back the eight seeded orders and clears anything you sent.
            </p>
          </div>
        </section>
      </div>

      <ArcadeRule size={26} tone="jade" />
    </div>
  );
}

function SurfaceCard({
  href,
  eyebrow,
  title,
  body,
}: {
  href: string;
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-card border border-line bg-paper p-6 hover:border-ink transition-colors flex flex-col"
    >
      <span className="eyebrow">{eyebrow}</span>
      <span className="mt-3 font-display text-xl leading-tight tracking-tight group-hover:text-brand transition-colors">
        {title}
      </span>
      <span className="mt-3 text-sm text-muted leading-relaxed flex-1">{body}</span>
      <span className="mt-5 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] text-brand">
        Open
        <ChevronRightIcon className="w-3.5 h-3.5" />
      </span>
    </Link>
  );
}
