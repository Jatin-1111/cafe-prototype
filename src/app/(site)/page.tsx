import Link from "next/link";
import { cafe } from "@/data/cafe";
import { formatINR, signatures } from "@/data/menu";
import { shots } from "@/data/media";
import { scanLink } from "@/lib/tableAuth";
import { CheckerRule } from "@/components/CheckerRule";
import { Photo } from "@/components/Photo";
import { FauxQR } from "@/components/FauxQR";
import { ReserveForm } from "@/components/ReserveForm";

const counterBoard = [
  { name: "Steel Tumbler Filter", price: 140 },
  { name: "Kulhad Doodh Patti", price: 90 },
  { name: "Bun Makkhan", price: 120 },
  { name: "Anda Bhurji", price: 380 },
  { name: "Pinni Cake", price: 160 },
];

const signatureShots = [shots.coldBrew, shots.doodhPatti, shots.bhurji, shots.basque];

const steps = [
  {
    title: "Scan",
    body: "Every table has a brass-framed code. No app, no download, no sign-up.",
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
      <section className="grain bg-bone border-b border-line">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-24">
          <div className="grid gap-14 lg:grid-cols-[1.15fr_1fr] lg:gap-20 items-center">
            <div>
              <p className="eyebrow">
                Est. {cafe.established} · {cafe.sector}, {cafe.city}
              </p>

              <h1 className="mt-5 font-display text-[clamp(3rem,11vw,6.5rem)] leading-[0.86] tracking-tight text-ink">
                KAHANI
                <span className="block text-brand">COFFEE</span>
                <span className="block">HOUSE</span>
              </h1>

              <div className="mt-8 max-w-[46ch]">
                <p className="text-lg text-ink-2 leading-relaxed">
                  {cafe.story.lead} Terrazzo underfoot, a loud ceiling fan, and coffee we
                  roast ourselves every Tuesday.
                </p>
              </div>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/menu"
                  className="inline-flex items-center h-12 px-7 bg-ink text-bone font-semibold tracking-wide hover:bg-brand transition-colors"
                >
                  See the menu
                </Link>
                <Link
                  href="/#reserve"
                  className="inline-flex items-center h-12 px-7 border border-ink text-ink font-semibold tracking-wide hover:bg-ink hover:text-bone transition-colors"
                >
                  Reserve a table
                </Link>
              </div>

              <p className="mt-8 text-sm text-muted">
                Open today {cafe.hours[0].open} – {cafe.hours[0].close}
                <span className="mx-2 text-line">|</span>
                {cafe.notes[0]}
              </p>
            </div>

            {/* Counter price board — the thing hanging behind the till in every old cafe */}
            <div className="lg:justify-self-end w-full max-w-sm">
              <div className="bg-brand text-cream border-[6px] border-ink shadow-[10px_10px_0_0] shadow-ink/15">
                <div className="px-6 pt-6 pb-4 text-center border-b border-dashed border-cream/25">
                  <p className="eyebrow text-gold-soft">Today at the counter</p>
                  <p className="font-display text-2xl mt-2 leading-none">STANDING ORDER</p>
                </div>
                <ul className="px-6 py-5 space-y-3.5">
                  {counterBoard.map((row) => (
                    <li key={row.name} className="flex items-baseline gap-3 text-[15px]">
                      <span className="shrink-0">{row.name}</span>
                      <span
                        aria-hidden
                        className="flex-1 border-b border-dotted border-cream/30 translate-y-[-3px]"
                      />
                      <span className="tnum shrink-0 text-gold-soft font-semibold">
                        {formatINR(row.price)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="px-6 pb-6">
                  <p className="text-xs text-cream/60 leading-relaxed border-t border-cream/15 pt-4">
                    Prices include taxes. The board changes when the roast does.
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
                A chair came
                <br />
                up for auction
              </h2>
              <Photo
                shot={shots.roasting}
                sizes="(min-width: 1024px) 42vw, 92vw"
                className="mt-8"
              />
              <ul className="mt-10 space-y-0 border-t border-line">
                {cafe.notes.map((note) => (
                  <li
                    key={note}
                    className="flex gap-4 py-4 border-b border-line text-sm text-ink-2"
                  >
                    <span aria-hidden className="text-gold font-bold">
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
              <h2 className="mt-3 font-display text-3xl sm:text-4xl tracking-tight">
                FOUR THINGS
              </h2>
            </div>
            <Link
              href="/menu"
              className="text-sm font-semibold text-brand hover:text-ink transition-colors underline underline-offset-4"
            >
              Full menu — 21 items
            </Link>
          </div>

          <div className="mt-10 grid gap-px bg-line border border-line sm:grid-cols-2 lg:grid-cols-4">
            {signatures.map((item, index) => (
              <article key={item.id} className="bg-paper p-6 flex flex-col">
                <Photo
                  shot={signatureShots[index]}
                  sizes="(min-width: 1024px) 22vw, (min-width: 640px) 44vw, 88vw"
                  className="-mx-6 -mt-6 mb-6 border-x-0 border-t-0"
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
      <section className="bg-ink text-bone">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-24">
          <div className="grid gap-14 lg:grid-cols-[1fr_0.8fr] lg:gap-20 items-center">
            <div>
              <p className="eyebrow text-gold">Order from your table</p>
              <h2 className="mt-4 font-display text-4xl sm:text-5xl leading-[0.95] tracking-tight">
                NOBODY LIKES
                <br />
                CATCHING AN EYE
              </h2>
              <p className="mt-6 text-bone/70 text-lg max-w-[52ch] leading-relaxed">
                Point a phone at the code on the table. The menu opens knowing where you are
                sitting, and the counter sees the order the moment you send it.
              </p>

              <ol className="mt-10 grid gap-px bg-bone/15 border border-bone/15 sm:grid-cols-3">
                {steps.map((step, index) => (
                  <li key={step.title} className="bg-ink p-5">
                    <span className="eyebrow text-gold tnum">0{index + 1}</span>
                    <h3 className="mt-2 font-semibold text-bone">{step.title}</h3>
                    <p className="mt-2 text-sm text-bone/60 leading-relaxed">{step.body}</p>
                  </li>
                ))}
              </ol>

              <Link
                href={scanLink("07")}
                className="mt-10 inline-flex items-center h-12 px-7 bg-gold text-ink font-semibold tracking-wide hover:bg-gold-soft transition-colors"
              >
                Try it — table 07
              </Link>
            </div>

            <div className="lg:justify-self-end">
              <div className="bg-bone p-6 border-[6px] border-gold w-fit mx-auto">
                <FauxQR seed="kahani-table-07" className="w-44 h-44 text-ink" />
                <p className="mt-4 text-center eyebrow text-ink">Table 07</p>
              </div>
              <p className="mt-4 text-center text-xs text-bone/45 max-w-[26ch] mx-auto">
                Decorative in the prototype — the demo link opens the same screen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Visit ---------------- */}
      <section id="visit" className="scroll-mt-28 grain bg-bone border-b border-line">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-24">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="eyebrow">Visit</p>
              <h2 className="mt-4 font-display text-4xl sm:text-5xl leading-[0.95] tracking-tight">
                SECTOR NINE
              </h2>
              <address className="mt-6 not-italic text-lg text-ink-2 leading-relaxed">
                {cafe.address.line1}
                <br />
                {cafe.address.line2}
              </address>
              <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                <a
                  href={`tel:${cafe.phone.replace(/\s/g, "")}`}
                  className="font-semibold text-brand hover:text-ink transition-colors"
                >
                  {cafe.phone}
                </a>
                <a
                  href={`mailto:${cafe.email}`}
                  className="font-semibold text-brand hover:text-ink transition-colors"
                >
                  {cafe.email}
                </a>
                <a
                  href={cafe.address.maps}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-brand hover:text-ink transition-colors underline underline-offset-4"
                >
                  Open in Maps
                </a>
              </div>
            </div>

            <div>
              <Photo
                shot={shots.exterior}
                sizes="(min-width: 1024px) 46vw, 92vw"
                className="mb-10 max-h-[560px]"
              />
              <p className="eyebrow">Hours</p>
              <table className="mt-4 w-full border-t border-line">
                <tbody>
                  {cafe.hours.map((slot) => (
                    <tr key={slot.days} className="border-b border-line">
                      <th scope="row" className="text-left py-4 font-medium text-ink">
                        {slot.days}
                      </th>
                      <td className="py-4 text-right tnum text-ink-2">
                        {slot.open} — {slot.close}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-4 text-sm text-muted">
                The kitchen closes forty-five minutes before the room does.
              </p>
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
              <h2 className="mt-4 font-display text-4xl leading-[0.95] tracking-tight">
                HOLD ME
                <br />A TABLE
              </h2>
              <p className="mt-6 text-ink-2 leading-relaxed max-w-[38ch]">
                We keep six tables back for walk-ins, always. The rest can be booked from here,
                up to two weeks ahead.
              </p>
            </div>
            <ReserveForm />
          </div>
        </div>
      </section>

      <CheckerRule size={10} tone="teal" />
    </>
  );
}
