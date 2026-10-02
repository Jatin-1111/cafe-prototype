import Link from "next/link";
import { cafe } from "@/data/cafe";
import { formatINR, menu, signatures } from "@/data/menu";
import { shots } from "@/data/media";
import { scanLink } from "@/lib/tableAuth";
import { Photo } from "@/components/Photo";
import { StarIcon } from "@/components/Icon";
import { FauxQR } from "@/components/FauxQR";
import { ReserveForm } from "@/components/ReserveForm";

const counterBoard = [
  { name: "Thick Cold Coffee", price: 239 },
  { name: "Peri Peri Fries", price: 263 },
  { name: "Margherita", price: 349 },
  { name: "Alfredo Pasta", price: 399 },
  { name: "Hot Brownie", price: 279 },
];

const signatureShots = [shots.pizza, shots.sliders, shots.panini, shots.burger];

const steps = [
  {
    title: "Scan",
    body: "Every table has its own code on the stand. No app, no download, no sign-up.",
  },
  {
    title: "Order",
    body: "The menu knows which table you are at. Add what you want, send it to the counter.",
  },
  {
    title: "Watch it come",
    body: "The screen tracks your order from the counter to the pass to your table.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="terrazzo bg-sand border-b border-line">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-24">
          <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-16 items-center">
            <div>
              {/* No wordmark here: the sticky header carries the name on every
                  screen, and repeating it under itself is what made the old hero
                  read as a duplicate. */}
              <p className="flex items-center gap-3">
                <span aria-hidden className="h-px w-8 bg-brand/50" />
                <span className="eyebrow">
                  Est. {cafe.established} · {cafe.sector}, {cafe.city}
                </span>
              </p>

              {/* States what you get and where. The cafe's own line, "a cosy
                  corner for every craving", sits below as the tagline it is. */}
              <h1 className="mt-7 font-display text-[clamp(2.5rem,6vw,4rem)] leading-[1.05] text-ink text-balance">
                Pizza, pasta and coffee,{" "}
                <span className="italic text-brand">one floor above Sector 35</span>
              </h1>

              <div className="mt-8 max-w-[46ch]">
                <p className="text-lg text-ink-2 leading-relaxed">
                  {cafe.tagline}. Arched niches, jade velvet and speckled terrazzo, open
                  every day from {cafe.hours[0].open} to {cafe.hours[0].close}.
                </p>
              </div>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/menu"
                  className="inline-flex items-center h-12 px-8 rounded-[6px] bg-brand text-cream font-medium tracking-wide hover:bg-brand-deep transition-colors"
                >
                  See the menu
                </Link>
                <Link
                  href="/#reserve"
                  className="inline-flex items-center h-12 px-8 rounded-[6px] border border-ink/25 text-ink font-medium tracking-wide hover:border-ink hover:bg-ink hover:text-cream transition-colors"
                >
                  Reserve a table
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                {cafe.acclaim.rating ? (
                  <span className="inline-flex items-center gap-2">
                    {/* One star, not five: a row of five filled stars beside a
                        4.4 is the kind of small dishonesty people notice. */}
                    <StarIcon className="w-4 h-4 text-brand" />
                    <span className="tnum font-medium text-ink">{cafe.acclaim.rating}</span>
                    <span className="text-muted">
                      from {cafe.acclaim.reviews.toLocaleString("en-IN")} reviews on{" "}
                      {cafe.acclaim.source}
                    </span>
                  </span>
                ) : null}
                <span className="text-muted">
                  Open today {cafe.hours[0].open} to {cafe.hours[0].close}
                </span>
              </div>
            </div>

            {/* Counter price board: the thing hanging behind the till in every old cafe */}
            <div className="lg:justify-self-end w-full max-w-sm">
              <div className="arch-top bg-brand text-cream shadow-[0_28px_70px_-30px] shadow-brand/70">
                <div className="px-7 pt-14 pb-5 text-center">
                  <p className="eyebrow text-brass-soft">On the counter today</p>
                  <p className="wordmark text-sm mt-3 leading-none text-cream">The regulars</p>
                  <div className="mt-5 mx-auto w-10 h-px bg-cream/30" />
                </div>
                <ul className="px-7 pb-2 space-y-3.5">
                  {counterBoard.map((row) => (
                    <li key={row.name} className="flex items-baseline gap-3 text-[15px]">
                      <span className="shrink-0">{row.name}</span>
                      <span
                        aria-hidden
                        className="flex-1 border-b border-dotted border-cream/30 translate-y-[-3px]"
                      />
                      <span className="tnum shrink-0 text-brass-soft font-semibold">
                        {formatINR(row.price)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="px-7 pb-7">
                  <p className="text-xs text-cream/60 leading-relaxed border-t border-cream/15 pt-4">
                    Prices include taxes. Everything is served all day.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- The room ---------------- */}
      <section className="border-b border-line">
        <Photo
          shot={shots.room}
          priority
          sizes="100vw"
          aspect={null}
          className="h-[46vh] min-h-[280px] sm:h-[58vh] sm:max-h-[560px]"
        />
      </section>

      {/* ---------------- Story ---------------- */}
      <section id="story" className="scroll-mt-28 bg-paper">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-28">
          <div className="grid gap-14 lg:grid-cols-[0.85fr_1fr] lg:gap-20">
            <div>
              <p className="eyebrow">The room</p>
              <h2 className="mt-4 font-display text-4xl sm:text-5xl leading-[0.95] tracking-tight">
                Built around
                <br />
                <span className="italic text-brand">a row of arches</span>
              </h2>
              <Photo
                shot={shots.counter}
                sizes="(min-width: 1024px) 42vw, 92vw"
                arch
                className="mt-8"
              />
              <ul className="mt-10 space-y-0 border-t border-line">
                {cafe.notes.map((note) => (
                  <li
                    key={note}
                    className="flex gap-4 py-4 border-b border-line text-sm text-ink-2"
                  >
                    <span aria-hidden className="text-brass font-bold">
                      ·
                    </span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6 text-[17px] leading-relaxed text-ink-2 max-w-[62ch]">
              {cafe.story.body.map((para, index) => (
                <p key={index} className={index === 0 ? "text-ink text-xl leading-relaxed" : ""}>
                  {para}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Signatures ---------------- */}
      <section className="bg-cream border-y border-line">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">What people come back for</p>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl leading-tight">
                Four things
              </h2>
            </div>
            <Link
              href="/menu"
              className="text-sm font-semibold text-brand hover:text-ink transition-colors underline underline-offset-4"
            >
              Full menu, {menu.length} items
            </Link>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {signatures.map((item, index) => (
              <article key={item.id} className="flex flex-col">
                <Photo
                  shot={signatureShots[index]}
                  sizes="(min-width: 1024px) 22vw, (min-width: 640px) 44vw, 88vw"
                  arch
                  className="mb-6"
                />
                <h3 className="font-display text-lg leading-tight tracking-tight">
                  {item.name}
                </h3>
                <p className="mt-3 text-sm text-muted leading-relaxed flex-1">
                  {item.note ?? item.description}
                </p>
                <p className="mt-5 tnum font-semibold text-brand">{formatINR(item.price)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- QR ordering ---------------- */}
      <section className="bg-ink text-sand">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-24">
          <div className="grid gap-14 lg:grid-cols-[1fr_0.8fr] lg:gap-20 items-center">
            <div>
              <p className="eyebrow text-brass">Order from your table</p>
              <h2 className="mt-4 font-display text-4xl sm:text-5xl leading-[0.95] tracking-tight">
                Nobody likes
                <br />
                <span className="italic text-brass-soft">catching an eye</span>
              </h2>
              <p className="mt-6 text-sand/70 text-lg max-w-[52ch] leading-relaxed">
                Point a phone at the code on the table. The menu opens knowing where you are
                sitting, and the counter sees the order the moment you send it.
              </p>

              <ol className="mt-10 grid gap-px bg-sand/15 border border-sand/15 sm:grid-cols-3">
                {steps.map((step, index) => (
                  <li key={step.title} className="bg-ink p-5">
                    <span className="eyebrow text-brass tnum">0{index + 1}</span>
                    <h3 className="mt-2 font-semibold text-sand">{step.title}</h3>
                    <p className="mt-2 text-sm text-sand/60 leading-relaxed">{step.body}</p>
                  </li>
                ))}
              </ol>

              <Link
                href={scanLink("07")}
                className="mt-10 inline-flex items-center h-12 px-8 rounded-[6px] bg-brass text-ink font-medium tracking-wide hover:bg-brass-soft transition-colors"
              >
                Try it on table 07
              </Link>
            </div>

            <div className="lg:justify-self-end">
              <div className="bg-sand rounded-card p-6 border-[6px] border-brass w-fit mx-auto">
                <FauxQR seed="refections-table-07" className="w-44 h-44 text-ink" />
                <p className="mt-4 text-center eyebrow text-ink">Table 07</p>
              </div>
              <p className="mt-4 text-center text-xs text-sand/45 max-w-[26ch] mx-auto">
                Decorative in the prototype. The demo link opens the same screen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Visit ---------------- */}
      <section id="visit" className="scroll-mt-28 plaster bg-sand border-b border-line">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-24">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="eyebrow">Visit</p>
              <h2 className="mt-4 font-display text-4xl sm:text-5xl leading-[1.02]">Sector 35C</h2>
              <address className="mt-6 not-italic text-lg text-ink-2 leading-relaxed">
                {cafe.address.line1}
                <br />
                {cafe.address.line2}
                <br />
                <span className="text-muted">{cafe.address.landmark}</span>
              </address>
              <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                <a
                  href={`tel:${cafe.phone.replace(/\s/g, "")}`}
                  className="font-medium text-brand hover:text-ink transition-colors"
                >
                  {cafe.phone}
                </a>
                <a
                  href={`mailto:${cafe.email}`}
                  className="font-medium text-brand hover:text-ink transition-colors"
                >
                  {cafe.email}
                </a>
                <a
                  href={cafe.address.maps}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-brand hover:text-ink transition-colors underline underline-offset-4"
                >
                  Open in Maps
                </a>
              </div>

              <p className="eyebrow mt-12">Hours</p>
              <table className="mt-4 w-full border-t border-line">
                <tbody>
                  {cafe.hours.map((slot) => (
                    <tr key={slot.days} className="border-b border-line">
                      <th scope="row" className="text-left py-4 font-medium text-ink">
                        {slot.days}
                      </th>
                      <td className="py-4 text-right tnum text-ink-2">
                        {slot.open} to {slot.close}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-4 text-sm text-muted">
                The kitchen closes forty-five minutes before the room does.
              </p>
            </div>

            <div className="lg:pt-10">
              <Photo
                shot={shots.arch}
                sizes="(min-width: 1024px) 46vw, 92vw"
                arch
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Reserve ---------------- */}
      <section id="reserve" className="scroll-mt-28 bg-paper">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1fr] lg:gap-20">
            <div>
              <p className="eyebrow">Reserve</p>
              <h2 className="mt-4 font-display text-4xl leading-[1.08]">
                Hold me
                <br />
                <span className="italic text-brand">a table</span>
              </h2>
              <p className="mt-6 text-ink-2 leading-relaxed max-w-[38ch]">
                We hold a few tables back for walk-ins, always. The rest can be booked from here,
                up to two weeks ahead.
              </p>
            </div>
            <ReserveForm />
          </div>
        </div>
      </section>

    </>
  );
}
