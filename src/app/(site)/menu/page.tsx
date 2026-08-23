import type { Metadata } from "next";
import Link from "next/link";
import { categories, formatINR, itemsIn, menu, type MenuTag } from "@/data/menu";
import { shots } from "@/data/media";
import { CheckerRule } from "@/components/CheckerRule";
import { Photo } from "@/components/Photo";
import { VegMark } from "@/components/VegMark";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Single-estate coffee, kulhad doodh patti, all-day plates and a bakery that sells out by five. Full menu for Kahani Coffee House, Sector 9, Chandigarh.",
};

const tagLabel: Record<MenuTag, string> = {
  bestseller: "House favourite",
  new: "New",
  seasonal: "While it lasts",
  "contains-nuts": "Contains nuts",
  spicy: "Hot",
};

const tagTone: Record<MenuTag, string> = {
  bestseller: "border-gold text-ink bg-gold/20",
  new: "border-brand text-brand bg-brand/5",
  seasonal: "border-line text-muted bg-transparent",
  "contains-nuts": "border-line text-muted bg-transparent",
  spicy: "border-clay text-clay bg-clay/5",
};

export default function MenuPage() {
  return (
    <>
      <section className="grain bg-bone border-b border-line">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 py-14 sm:py-20">
          <p className="eyebrow">The board</p>
          <h1 className="mt-4 font-display text-[clamp(2.75rem,9vw,5rem)] leading-[0.9] tracking-tight">
            THE MENU
          </h1>
          <p className="mt-6 max-w-[54ch] text-lg text-ink-2 leading-relaxed">
            Twenty-one things. The coffee rotates with the roast, the bakery runs out, and the
            keema stops when the pot does. Everything else is here all day.
          </p>

          <nav className="mt-10 flex flex-wrap gap-2" aria-label="Menu sections">
            {categories.map((category) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="inline-flex items-center h-10 px-4 border border-ink text-sm font-semibold hover:bg-ink hover:text-bone transition-colors"
              >
                {category.name}
                <span className="ml-2 tnum text-xs text-muted">{itemsIn(category.id).length}</span>
              </a>
            ))}
          </nav>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-5 sm:px-8 py-14 sm:py-20">
        {categories.map((category, index) => (
          <section
            key={category.id}
            id={category.id}
            className={`scroll-mt-28 ${index > 0 ? "mt-16 sm:mt-20" : ""}`}
          >
            <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pb-5 border-b-2 border-ink">
              <h2 className="font-display text-3xl sm:text-4xl tracking-tight">
                {category.name.toUpperCase()}
              </h2>
              <p className="text-sm text-muted">{category.blurb}</p>
            </header>

            <ul>
              {itemsIn(category.id).map((item) => (
                <li
                  key={item.id}
                  className="grid grid-cols-[auto_1fr_auto] gap-x-4 gap-y-2 items-baseline py-6 border-b border-line"
                >
                  <VegMark veg={item.veg} className="translate-y-1" />

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                      <h3 className="font-display text-lg sm:text-xl leading-tight tracking-tight">
                        {item.name}
                      </h3>
                      {item.tags?.map((tag) => (
                        <span
                          key={tag}
                          className={`text-[10px] uppercase tracking-[0.14em] font-semibold px-2 py-0.5 border ${tagTone[tag]}`}
                        >
                          {tagLabel[tag]}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-ink-2">{item.description}</p>
                    {item.note ? (
                      <p className="mt-2 text-sm text-muted leading-relaxed max-w-[62ch]">
                        {item.note}
                      </p>
                    ) : null}
                  </div>

                  <p className="tnum font-display text-lg text-brand">{formatINR(item.price)}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <div className="mt-16 border border-line bg-cream grid sm:grid-cols-[1fr_auto] items-center gap-8 p-8 sm:p-10">
          <Photo
            shot={shots.marbleCode}
            sizes="(min-width: 640px) 40vw, 88vw"
            className="sm:order-2 w-full sm:w-64"
          />
          <div className="sm:order-1">
            <p className="eyebrow">Sitting with us right now?</p>
            <p className="mt-2 font-display text-2xl tracking-tight">
              ORDER FROM THE TABLE
            </p>
            <p className="mt-2 text-sm text-muted max-w-[44ch]">
              Scan the code by the sugar. {menu.length} items, same prices, no waiting to catch
              anyone&rsquo;s eye.
            </p>
            <Link
              href="/t/07"
              className="mt-6 inline-flex items-center h-12 px-7 bg-brand text-cream font-semibold tracking-wide hover:bg-brand-deep transition-colors"
            >
              Open table 07
            </Link>
          </div>
        </div>
      </div>

      <CheckerRule size={10} tone="teal" />
    </>
  );
}
