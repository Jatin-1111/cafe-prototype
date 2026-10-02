# Photography brief: Refections Cafe

Eight pictures. Every slot on the site is currently filled with one of the cafe's own published
photographs, cropped to fit. **Nothing here is AI-generated and nothing should be.** A made-up
picture of a real room is the one thing an owner spots instantly, and once he does he stops
trusting everything else on the page.

This is the brief for shooting them properly, which is worth doing: the published ones were taken
for a delivery listing, not for a website, and it shows at full width.

## Dropping a photo in

Save it into `public/photos/` under the filename below, keep the aspect ratio, and set `ready: true`
on the matching entry in [`src/data/media.ts`](../src/data/media.ts). Each entry also carries a
`brief` field saying what to point the camera at, so the shot list and the code cannot drift apart.

## The shots

| # | File | Size | Ratio | Where it lands |
|---|---|---|---|---|
| 1 | `room.jpg` | 2400 × 1350 | 16:9 | Full-width band under the home hero |
| 2 | `counter.jpg` | 1800 × 900 | 2:1 | Story section |
| 3 | `arch.jpg` | 1200 × 1500 | 4:5 | Visit section |
| 4 | `tables.jpg` | 1600 × 1200 | 4:3 | Menu page panel |
| 5 | `pizza.jpg` | 1200 × 1200 | 1:1 | Signatures row |
| 6 | `sliders.jpg` | 1200 × 1200 | 1:1 | Signatures row |
| 7 | `panini.jpg` | 1200 × 1200 | 1:1 | Signatures row |
| 8 | `burger.jpg` | 1200 × 1200 | 1:1 | Signatures row |

**1. The room.** Wide, from the doorway at seated eye level. The run of booths with the terracotta
mural behind and the capsule window on the left. Empty of people. Keep the top and bottom eighth
clear of anything important: the layout crops this to roughly 3:1 on a laptop.

**2. The counter.** Square on to the wall so the row of backlit terracotta niches runs across the
frame. Wide enough that the arches are the subject, not the glassware. The frame is arch-masked at
the top, so leave headroom.

**3. The arch.** Vertical. One niche with the botanical wallpaper, the rose banquette under it, a
cane chair in front.

**4. The tables.** The marble tops on the terrazzo with the floral chairs, jade banquette beyond.
Waist height, slight angle.

**5–8. The four dishes.** These sit side by side in one row, so they have to match each other more
than anything else here. Same table, same light from the same side, same camera height (about 40
degrees above the tabletop, not flat overhead), shot in one sitting. The frames are arch-masked, so
nothing important in the top corners.

## Practical notes

- **Late morning, by the windows, no flash.** The room is lit for the camera already; a flash kills
  the warmth that makes it look like itself.
- **Compress before committing.** Under 300 KB each. JPEG, not PNG: a photograph saved as PNG is
  roughly five times the size for no visible gain.
- **Regenerate the blur placeholders** after replacing a file. Each entry carries a twelve-pixel
  inline version so a slot is never blank while the real file loads.
- **No stock.** If a shot cannot be taken, leave the slot empty rather than filling it with a
  stand-in. The placeholder states plainly that a photograph is pending, which is honest; a stock
  photo of someone else's cafe is not.

## If you re-skin this for another cafe

Everything cafe-specific lives in four files: [`globals.css`](../src/app/globals.css) (palette,
type, shape), [`cafe.ts`](../src/data/cafe.ts) (name, address, hours, the rating and its source),
[`menu.ts`](../src/data/menu.ts) and this manifest. Note that `menu.ts` is now the source of truth
for money, not display copy: the server prices every order from it, so a wrong price there is a
wrong price charged.
