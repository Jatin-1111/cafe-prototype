import Link from "next/link";
import { cafe } from "@/data/cafe";
import { CheckerRule } from "@/components/CheckerRule";

export function SiteFooter() {
  return (
    <footer className="mt-auto">
      <CheckerRule size={8} />
      <div className="bg-ink text-bone">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-14">
          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <p className="font-display text-2xl leading-none">{cafe.name.toUpperCase()}</p>
              <p className="mt-3 text-sm text-bone/70 max-w-[28ch]">
                {cafe.tagline}. Est. {cafe.established}, {cafe.city}.
              </p>
            </div>

            <div>
              <p className="eyebrow text-bone/50">Find us</p>
              <address className="mt-3 not-italic text-sm text-bone/80 leading-relaxed">
                {cafe.address.line1}
                <br />
                {cafe.address.line2}
              </address>
              <a
                href={`tel:${cafe.phone.replace(/\s/g, "")}`}
                className="mt-3 inline-block text-sm text-gold-soft hover:text-gold transition-colors"
              >
                {cafe.phone}
              </a>
            </div>

            <div>
              <p className="eyebrow text-bone/50">Hours</p>
              <ul className="mt-3 space-y-1.5 text-sm text-bone/80">
                {cafe.hours.map((slot) => (
                  <li key={slot.days} className="flex justify-between gap-4 max-w-[30ch]">
                    <span>{slot.days}</span>
                    <span className="tnum text-bone/60">
                      {slot.open}–{slot.close}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-bone/15 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-bone/45">
              Prototype build. {cafe.instagram}
            </p>
            <div className="flex gap-5 text-xs">
              <Link href="/demo" className="text-gold-soft hover:text-gold transition-colors">
                Walk the prototype
              </Link>
              <Link href="/t/07" className="text-bone/60 hover:text-gold transition-colors">
                Table ordering
              </Link>
              <Link href="/admin" className="text-bone/60 hover:text-gold transition-colors">
                Counter board
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
