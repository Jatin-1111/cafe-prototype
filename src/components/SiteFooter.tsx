import Link from "next/link";
import { cafe } from "@/data/cafe";
import { scanLink } from "@/lib/tableAuth";
import { ArcadeRule } from "@/components/ArcadeRule";

export function SiteFooter() {
  return (
    <footer className="mt-auto">
      <ArcadeRule size={20} />
      <div className="bg-ink text-sand">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-14">
          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <p className="wordmark text-xl leading-none">{cafe.name.toUpperCase()}</p>
              <p className="mt-3 text-sm text-sand/70 max-w-[28ch]">
                {cafe.tagline}. Est. {cafe.established}, {cafe.city}.
              </p>
            </div>

            <div>
              <p className="eyebrow text-sand/50">Find us</p>
              <address className="mt-3 not-italic text-sm text-sand/80 leading-relaxed">
                {cafe.address.line1}
                <br />
                {cafe.address.line2}
              </address>
              <a
                href={`tel:${cafe.phone.replace(/\s/g, "")}`}
                className="mt-3 inline-block text-sm text-brass-soft hover:text-brass transition-colors"
              >
                {cafe.phone}
              </a>
            </div>

            <div>
              <p className="eyebrow text-sand/50">Hours</p>
              <ul className="mt-3 space-y-3 text-sm text-sand/80">
                {cafe.hours.map((slot) => (
                  <li key={slot.days}>
                    <span className="block">{slot.days}</span>
                    <span className="tnum text-sand/55 whitespace-nowrap">
                      {slot.open} to {slot.close}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-sand/15 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-sand/45">
              Prototype build. {cafe.instagram}
            </p>
            <div className="flex gap-5 text-xs">
              <Link href="/demo" className="text-brass-soft hover:text-brass transition-colors">
                Walk the prototype
              </Link>
              <Link href={scanLink("07")} className="text-sand/60 hover:text-brass transition-colors">
                Table ordering
              </Link>
              <Link href="/admin" className="text-sand/60 hover:text-brass transition-colors">
                Counter board
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
