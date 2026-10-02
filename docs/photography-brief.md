# Photography brief — Refections Cafe, Sector 35C, Chandigarh

Eight shots. Save each into `public/photos/` under the **exact filename** below, then flip `ready`
to `true` on the matching entry in [`src/data/media.ts`](../src/data/media.ts). The slots already
reserve the right aspect ratio, so nothing on the page moves when the files land.

> **Fastest route for the pitch:** ask Refections for their own photographs, or use the ones already
> on their Instagram and delivery listings with their permission. These prompts exist so the mock
> can be filled before that conversation happens — generated images of a real cafe's interior should
> not be presented as photographs of it.

## Dropping a photo in

```ts
// src/data/media.ts
room: {
  id: "room",
  file: "room.jpg",
  ready: true,   // <- flip this
```

## The room these photos live in

A first-floor cafe above the Sector 35 market. The defining features, all visible in their
published photos:

- **Arched plaster niches** in warm sand, painted terracotta inside and backlit
- **Dusty rose and jade velvet** button-tufted banquettes
- **Botanical wallpaper** — sage palm leaves with blush blooms
- **Speckled terrazzo** on the floor and the half-wall
- **Brass** mesh ceiling, mirror frames, table edges
- **Cane-backed teak chairs**, white marble tables, feathered white pendants

Warm and bright throughout. Nothing moody, nothing cold, nothing grey.

## Two blocks to paste into every prompt

Both live in `media.ts` as `HOUSE_STYLE` and `DISH_SET` so the code and the brief cannot drift.

**`HOUSE_STYLE` — append to all eight:**

> TECHNICAL: Full-frame camera, fast prime, bright airy editorial finish. Soft natural daylight with
> warm tungsten mixed in, gentle contrast, highlights allowed to bloom slightly. Clean colour,
> lightly lifted blacks, no heavy grain, no HDR, no harsh flash.
> PALETTE: the frame should sit in terracotta (#BC5228), jade green (#1F6B56), blush rose (#DFA7A2),
> warm sand plaster (#F1E2D0) and brass (#C08A4A). Warm throughout, nothing cold, nothing grey.
> EXCLUDE: no text of any kind, no lettering, no signage copy, no menu boards with words, no brand
> logos, no watermarks, no visible faces, no posed models, no chalkboard art, no exposed-filament
> Edison bulbs, no dark moody grading, no cold blue shadows.

**`DISH_SET` — append to the four dish shots as well:**

> SET (identical across every dish shot): the same white marble café table with soft grey veining
> and a thin brass edge. The same soft daylight entering from camera-left at roughly 30 degrees,
> late morning, with a warm bounce filling the shadows. Same camera height: 40 degrees above the
> table, not flat overhead. Same 50mm equivalent at f/2.8, focus on the front edge of the food,
> background falling away softly. Background: a blurred suggestion of warm sand plaster wall and the
> cane back of a chair, occupying the top fifth of the frame only. Food fills roughly 60% of the
> frame, centred, with breathing room on all four sides so a square crop never clips it.

The four dish squares sit **side by side in one row**, so they must match each other far more
tightly than anything else. Generate all four in a single conversation, in order, telling the model
to keep the table, light direction and camera height identical to the previous image.

## The shots

| # | Filename | Size | Ratio | Where it appears |
|---|---|---|---|---|
| 1 | `room.jpg` | 2400 × 1350 | 16:9 | Full-width band under the home hero |
| 2 | `counter.jpg` | 1800 × 1200 | 3:2 | Story section, left column |
| 3 | `booth.jpg` | 1200 × 1500 | 4:5 | Visit section, above the hours |
| 4 | `marble-code.jpg` | 1600 × 1200 | 4:3 | Menu page, table-ordering panel |
| 5 | `cold-coffee.jpg` | 1200 × 1200 | 1:1 | Signatures row |
| 6 | `peri-fries.jpg` | 1200 × 1200 | 1:1 | Signatures row |
| 7 | `margherita.jpg` | 1200 × 1200 | 1:1 | Signatures row |
| 8 | `brownie.jpg` | 1200 × 1200 | 1:1 | Signatures row |

The full prompt for each sits on its entry in [`media.ts`](../src/data/media.ts) — that is the
single source, so they cannot fall out of step with the slots they fill.

**Two crops worth knowing about.** The room band renders roughly **3:1 on a laptop**, so the top and
bottom eighth of a 16:9 file is cut — keep anything important in the middle band. Shots 1–3 and 5–8
are rendered in **arch-topped frames**, matching the niches in the room, so the top corners of every
one of those images is masked away. Nothing essential should sit in the upper corners.

## Before you commit them

- **Compress.** Under 300 KB each. `squoosh.app`, or `npx @squoosh/cli --mozjpeg auto public/photos/*.jpg`.
  Prefer JPEG or WebP over PNG — a photograph saved as PNG is roughly five times larger for no visible gain.
- **Reject any readable text.** The signboard, the cups, the menu cards. A hallucinated word in a
  photo of a real cafe is the kind of detail that loses a room's trust.
- **Reject faces.** A recognisable invented person in a client demo raises questions you do not want
  to answer in a pitch meeting.

## If you re-skin this for another cafe

Everything brand-specific lives in four files: [`globals.css`](../src/app/globals.css) (palette,
type, shape, motifs), [`cafe.ts`](../src/data/cafe.ts) (name, address, hours, story),
[`menu.ts`](../src/data/menu.ts) and this manifest. Nothing in the ordering flow, the counter board
or the table-code security knows which cafe it is serving.
