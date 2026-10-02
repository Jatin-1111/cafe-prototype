import Link from "next/link";
import { cafe } from "@/data/cafe";
import { tableLabel } from "@/lib/tables";
import { ArcadeRule } from "@/components/ArcadeRule";

/**
 * Shown when a browser reaches a table it has not scanned into: a typed URL,
 * a shared link, a stale session. Deliberately not a dead end: the demo needs
 * a way back, and a real guest needs to know what to do next.
 */
export function WrongTable({ table, boundTo }: { table: string; boundTo?: string }) {
  return (
    <div className="min-h-dvh bg-sand flex flex-col">
      <div className="w-full max-w-md mx-auto flex-1 bg-paper border-x border-line min-h-dvh">
        <ArcadeRule size={20} />
        <div className="px-4 pt-3 flex items-center justify-between">
          <span className="inline-flex items-center h-6 px-3 rounded-[6px] border border-line text-muted text-xs font-semibold uppercase tracking-[0.12em]">
            Not scanned in
          </span>
          <Link href="/" className="wordmark text-sm leading-none">
            {cafe.name.toUpperCase()}
          </Link>
        </div>

        <div className="px-5 py-14 text-center">
          <p className="eyebrow">{tableLabel(table)}</p>
          <h1 className="mt-4 font-display text-2xl leading-tight tracking-tight">
            SCAN THE CODE
            <br />
            ON YOUR TABLE
          </h1>
          <p className="mt-5 text-sm text-ink-2 leading-relaxed max-w-[34ch] mx-auto">
            {boundTo
              ? `This browser is sitting at ${tableLabel(boundTo).toLowerCase()}. To order for ${tableLabel(
                  table,
                ).toLowerCase()}, scan the code standing on it.`
              : "Ordering is tied to the code on the table, so an order always reaches the right one. Point a camera at the brass stand and the menu opens itself."}
          </p>

          {boundTo ? (
            <Link
              href={`/t/${boundTo}`}
              className="mt-8 inline-flex items-center h-12 px-8 rounded-[6px] bg-ink text-cream text-xs font-semibold uppercase tracking-[0.14em] hover:bg-brand transition-colors"
            >
              Back to {tableLabel(boundTo).toLowerCase()}
            </Link>
          ) : null}

          <div className="mt-12 pt-6 border-t border-line">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Prototype</p>
            <p className="mt-2 text-xs text-muted leading-relaxed max-w-[32ch] mx-auto">
              There is no camera here, so the demo hub stands in for the printed codes.
            </p>
            <Link
              href="/demo"
              className="mt-4 inline-flex items-center h-11 px-6 rounded-[6px] border border-ink/30 text-xs font-semibold uppercase tracking-[0.14em] hover:bg-ink hover:text-cream hover:border-ink transition-colors"
            >
              Open the demo hub
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
