import Link from "next/link";
import { cafe } from "@/data/cafe";
import { CheckerRule } from "@/components/CheckerRule";

const nav = [
  { href: "/menu", label: "Menu" },
  { href: "/#story", label: "Story" },
  { href: "/#visit", label: "Visit" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40">
      <CheckerRule size={8} />
      <div className="bg-paper/95 backdrop-blur border-b border-line">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex items-center justify-between gap-4 h-16 sm:h-20">
            <Link
              href="/"
              className="font-display text-xl sm:text-2xl leading-none tracking-tight text-ink shrink-0"
            >
              {cafe.name.toUpperCase()}
            </Link>

            <nav className="flex items-center gap-6 sm:gap-8">
              {nav.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-ink-2 hover:text-brand transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/#reserve"
                className="hidden sm:inline-flex items-center bg-brand text-cream px-4 h-10 text-sm font-semibold tracking-wide hover:bg-brand-deep transition-colors"
              >
                Reserve
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
