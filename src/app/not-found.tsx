import Link from "next/link";
import { ArcadeRule } from "@/components/ArcadeRule";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-paper flex flex-col">
      <ArcadeRule size={20} />
      <div className="flex-1 grid place-items-center px-5 py-20">
        <div className="text-center max-w-md">
          <p className="eyebrow">Nothing here</p>
          <h1 className="mt-4 font-display text-[clamp(2.5rem,10vw,4.5rem)] leading-none tracking-tight">
            404
          </h1>
          <p className="mt-6 text-ink-2 leading-relaxed">
            No such page. And if you were after a table, that one is not on our floor.
          </p>
          <div className="mt-9 flex flex-wrap gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center h-12 px-8 rounded-[6px] bg-ink text-cream text-xs font-semibold uppercase tracking-[0.14em] hover:bg-brand transition-colors"
            >
              Back to the front
            </Link>
            <Link
              href="/menu"
              className="inline-flex items-center h-12 px-8 rounded-[6px] border border-ink/30 text-xs font-semibold uppercase tracking-[0.14em] hover:bg-ink hover:text-cream hover:border-ink transition-colors"
            >
              See the menu
            </Link>
          </div>
        </div>
      </div>
      <ArcadeRule size={26} tone="jade" />
    </div>
  );
}
