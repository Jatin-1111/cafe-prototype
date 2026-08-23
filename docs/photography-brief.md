# Photography brief — Kahani Coffee House, Sector 9, Chandigarh

Eight shots. Generate them anywhere (ChatGPT, Midjourney, Gemini), save each into `public/photos/`
under the **exact filename** below, then flip `ready` to `true` on the matching entry in
[`src/data/media.ts`](../src/data/media.ts). The slots already reserve the right aspect ratio, so
nothing on the page moves when the files land.

## Dropping a photo in

```ts
// src/data/media.ts
room: {
  id: "room",
  file: "room.png",
  ready: true,   // <- flip this
  alt: "...",
```

That is the only code change. The filename is already in the manifest.

## The world these photos live in

A café in the ground floor of a **1960s Chandigarh sector house** — Le Corbusier's city, so:
board-marked raw concrete, brise-soleil grids, brick jaali screens, cream lime plaster, terrazzo
floors in cream and charcoal, teak-and-cane chairs in the Pierre Jeanneret manner. Not Bombay
Irani, not colonial bungalow, not Scandinavian minimal. The cafe's backstory is that it was built
around twenty-two Jeanneret chairs bought at a government surplus auction, which is a real
Chandigarh phenomenon and the reason this vernacular is worth leaning into.

## Two blocks to paste into every prompt

Both live in `media.ts` as `HOUSE_STYLE` and `DISH_SET` so the code and the brief cannot drift.

**`HOUSE_STYLE` — append to all eight:**

> TECHNICAL: Shot on a full-frame camera with a fast prime, Kodak Portra 400 colour rendition —
> warm mid-tones, cool shadows, gentle highlight roll-off, fine visible grain. Natural available
> light only; no flash, no reflector fill, no colour gels, no HDR. Contrast held slightly flat so
> the highlights never clip. Saturation restrained.
> PALETTE: the frame should sit in deep teal (#1E5D59), mustard (#D9A123), oxblood (#7A2E2A), bone
> and cream (#EFE7D4), with charcoal accents. Nothing neon, nothing pastel, no blue-grey cast.
> EXCLUDE: no text of any kind, no lettering, no signage copy, no menu boards with words, no brand
> logos, no watermarks, no captions, no visible faces, no posed models, no plastic chairs, no fairy
> lights, no exposed-filament Edison bulbs, no chalkboard art, no succulents in tin cans, no
> marble-and-gold styling clichés, no over-propped flat lay.

**`DISH_SET` — append to the four dish shots as well:**

> SET (identical across every dish shot): the same 80cm round white Makrana marble café table, faint
> grey veining and two small honest chips at the edge. The same window light entering from
> camera-left at roughly 30 degrees, mid-morning, soft-edged shadows falling to camera-right. Same
> camera height: 40 degrees above the table, not flat overhead. Same 50mm equivalent at f/2.8, focus
> on the front edge of the food, background falling away softly. Background: a blurred suggestion of
> cream lime-plaster wall and one teak chair back, occupying the top fifth of the frame only. Food
> fills roughly 60% of the frame, centred, with breathing room on all four sides so a square crop
> never clips it.

The four dish squares sit **side by side in one row**, so they have to match each other far more
tightly than anything else here. Generate all four in a single conversation, in order, and tell the
model to keep the table, light direction and camera height identical to the previous image.

## The shots

| # | Filename | Size | Ratio | Where it appears |
|---|---|---|---|---|
| 1 | `room.png` | 2400 × 1350 | 16:9 | Full-width band under the home hero |
| 2 | `roasting.png` | 1800 × 1200 | 3:2 | Story section, left column |
| 3 | `exterior.png` | 1200 × 1500 | 4:5 | Visit section, above the hours |
| 4 | `marble-code.png` | 1600 × 1200 | 4:3 | Menu page, table-ordering panel |
| 5 | `cold-brew.png` | 1200 × 1200 | 1:1 | Signatures row |
| 6 | `doodh-patti.png` | 1200 × 1200 | 1:1 | Signatures row |
| 7 | `bhurji.png` | 1200 × 1200 | 1:1 | Signatures row |
| 8 | `basque.png` | 1200 × 1200 | 1:1 | Signatures row |

---

### 1 — `room.png` · the room

> SHOT: Editorial interior photograph, 24mm wide lens at f/4, camera at eye level standing just
> inside the doorway, looking the length of the room. Verticals kept straight, no tilt.
> SUBJECT: a small independent café occupying the ground floor of a 1960s Chandigarh sector house,
> built in the Le Corbusier idiom.
> ARCHITECTURE: board-marked exposed concrete lintels and beams left raw; a whitewashed brick jaali
> screen along the left wall casting diamond-shaped shadows across the floor; a terrazzo floor in
> cream and charcoal squares, worn smooth and slightly uneven; teak-framed windows with slim steel
> casements; a deep concrete brise-soleil visible outside the glass.
> FURNITURE: low teak-and-cane armchairs in the Pierre Jeanneret manner, round white marble café
> tables, a long teak service counter on the right with a brass-trimmed edge and a stack of clay
> kulhads on it. A slow four-blade ceiling fan.
> COLOUR IN THE ROOM: deep teal painted dado to waist height, bone lime plaster above, two mustard
> seat cushions, one worn oxblood rug in the middle distance.
> LIGHT: 4pm February sun, low and raking in from camera-left through the jaali, throwing hard-edged
> parallelograms of light onto the terrazzo; dust suspended in the beams; every electric light
> switched off.
> COMPOSITION: the room reads deep, counter on the right third, empty tables running through the
> centre. Completely empty of people. Keep the central horizontal third of the frame uncluttered and
> keep the top and bottom eighth free of anything essential — the web layout crops this to a wide
> letterbox band.

**The crop warning is real, not boilerplate.** I measured the rendered slot: on a 1280px desktop the
band is 1265 × 418, about **3:1**, so roughly the top and bottom eighth of a 16:9 file gets cut.
Anything you care about — the light on the floor, the counter — must sit in the middle band.

This is the most important image on the site; it carries the entire first impression. Ask for four
variants and pick the one where the jaali shadows on the terrazzo are doing the most work.

### 2 — `roasting.png` · the roaster

> SHOT: Documentary detail photograph, 35mm at f/2, camera a little above waist height and close in,
> three-quarter angle to the machine.
> SUBJECT: a small vintage 12kg drum coffee roaster in the back room of a Chandigarh café, caught
> mid-roast. Cast-iron body in chipped dark green enamel, brass temperature gauges with needles
> mid-sweep, a brass trier pulled halfway out.
> DETAIL: beans visible tumbling behind the drum's glass window, colour caught mid-transition from
> pale green to cinnamon brown; a steel scoop of just-roasted beans resting on the cooling tray,
> still throwing off heat; two jute sacks slumped against the wall behind, chalk-marked with numbers
> only, no words; a battered logbook and a pencil on the ledge.
> LIGHT: mixed — hard afternoon daylight from a high window at camera-right, one warm tungsten bulb
> above the drum, the two colour temperatures allowed to disagree. Chaff dust hanging in the air,
> catching the daylight.
> COMPOSITION: drum window on the left third and in sharpest focus, gauges catching a highlight, the
> room falling into soft shadow behind. Hands may enter the frame at the trier, sleeves rolled, but
> no face and no torso.

### 3 — `exterior.png` · Sector 9 at dusk

> SHOT: Architectural exterior photograph, vertical portrait orientation, 35mm at f/4, camera at
> standing height from across the street, verticals corrected.
> SUBJECT: the front of a 1960s Chandigarh sector house converted into a café — flat-roofed, two
> storeys, textbook Chandigarh modernism.
> ARCHITECTURE: a deep concrete brise-soleil grid across the upper floor casting a shadow lattice;
> bare board-marked concrete columns; cream lime-plaster infill walls streaked by monsoons; a
> red-oxide veranda floor and three shallow steps; teak-framed glazing with slim steel casements; a
> plain rectangular metal signboard mounted beside the door, completely blank with no lettering,
> painted deep teal.
> SETTING: a wide, quiet, tree-lined sector street; a low boundary wall with a bare concrete gate
> post; an amaltas tree overhead in leaf; two terracotta pots of tulsi on the steps; a single bicycle
> leaning on the wall. Empty street, no traffic, no people.
> LIGHT: fifteen minutes after sunset — the sky a deep even blue, the last warm light gone from the
> walls, and the café's warm interior light spilling out through the glazing and through the
> brise-soleil grid, pooling on the red-oxide veranda and the steps. Interior warm at about 2700K
> against the cool blue exterior; let the two temperatures contrast.
> COMPOSITION: building fills the lower two thirds, sky the upper third, doorway roughly on the left
> third with the brightest light.

**Hold the line on the blank signboard.** Every generator will try to paint a café name onto it, and
an invented name in the photo is worse than no name — the cafe is fictional and the client's name
goes there. If it comes back with lettering, regenerate rather than accept it.

### 4 — `marble-code.png` · the table code

> SHOT: Close product-in-situ photograph, 50mm at f/2, camera 35 degrees above the tabletop, shallow
> depth of field.
> SUBJECT: a small brass table stand, about 12cm tall, holding a square card printed with an abstract
> black-and-white block pattern of solid squares. The pattern must read as pure geometry — absolutely
> no readable characters, letters, numbers or logo, and not a real scannable code.
> SURFACE AND PROPS: a worn white Makrana marble café tabletop with faint grey veining and one
> chipped edge. Beside the stand: an unglazed clay kulhad of milky chai with a skin just forming, a
> small steel sugar pot with a steel spoon, and a single brass teaspoon. Nothing else on the table.
> BACKGROUND: the cream-and-charcoal terrazzo floor and a teak chair leg visible far below and well
> out of focus.
> LIGHT: soft daylight from camera-left through a jaali screen, so a faint diamond shadow pattern
> falls across the marble on the right of the frame.
> COMPOSITION: brass stand sharp and on the left third, kulhad softer on the right, generous empty
> marble in the lower right corner.

A generated QR will never scan, so keep the pattern abstract. If you later want a working code on
the real site, that's a print job, not a photo job.

### 5 — `cold-brew.png`

> DISH: black cold brew coffee, deep mahogany and completely clear, in a heavy short straight-sided
> glass tumbler over one large hand-cut clear ice cube. Beads of condensation running down the
> outside of the glass and a small ring of water on the marble. A tiny copper jug of milk sits behind
> and to the right, well out of focus. No straw, no garnish, no mint.

*+ `DISH_SET` + `HOUSE_STYLE`*

### 6 — `doodh-patti.png`

> DISH: an unglazed terracotta kulhad of doodh patti chai — no water, all milk, boiled down to the
> colour of old teak — filled almost to the rim with a skin just beginning to form and one drip down
> the outside of the clay. It sits on a chipped white enamel saucer. Beside it, on a small steel
> plate, a soft split pav bun spread thickly with white butter, the butter still ridged from the
> knife and beginning to soften at the edges. A steel spoon rests on the marble. Well-used crockery,
> honest and unstyled, nothing arranged too neatly.

*+ `DISH_SET` + `HOUSE_STYLE`*

### 7 — `bhurji.png`

> DISH: anda bhurji — Indian soft-scrambled eggs, loose and glossy, still visibly moist, in large
> soft curds rather than dry crumbs — piled generously over two thick slices of well-toasted
> sourdough on a rustic cream ceramic plate. Flecked through with finely chopped green chilli, red
> onion and plenty of fresh coriander leaf; a light dusting of red chilli powder on one side. A wedge
> of lime and a steel fork on the plate. The toast should be visibly charred at the ridges and the
> eggs should slump slightly over the edge.

*+ `DISH_SET` + `HOUSE_STYLE`*

Watch for dry, yellow, American-diner scrambled eggs — that's the default failure here. The words
doing the work are *loose*, *glossy*, *large soft curds*, *slump*.

### 8 — `basque.png`

> DISH: a single wedge of Basque burnt cheesecake, cut so the profile faces the camera. The top
> deeply caramelised to a near-black mahogany with a blistered, cracked, collapsed surface; the sides
> pleated where the parchment held it; the centre pale, custardy and just barely set, slumping very
> slightly at the cut face. Made with dark jaggery, so the crumb reads amber rather than yellow. On a
> small cream ceramic plate, with a thin pool of dark jaggery syrup at the base of the slice and a
> cake fork alongside. Served at room temperature — no condensation, no cream, no berries, no icing
> sugar, no mint sprig.

*+ `DISH_SET` + `HOUSE_STYLE`*

---

## Before you commit them

- **Compress.** Under 300 KB each; these load on phone connections in a café. `squoosh.app`, or
  `npx @squoosh/cli --mozjpeg auto public/photos/*.png`.
- **Check the room band's crop on mobile and desktop** — it is centre-cropped to roughly 3:1 on a
  laptop and taller on a phone, so the safe area differs.
- **Reject any readable text.** Signboards, jute sacks, cups, menu cards — generators sneak lettering
  in everywhere. The cafe is fictional and the client's own name will go in these places, so a
  hallucinated word reads as a mistake to anyone looking closely.
- **Reject faces.** A recognisable invented person in a client demo raises questions you don't want
  to answer in a pitch meeting.

## If you swap in a real client

Everything a client-specific rebuild touches is in three files: [`src/data/cafe.ts`](../src/data/cafe.ts)
(name, address, hours, story), [`src/data/menu.ts`](../src/data/menu.ts) (their actual menu), and this
manifest. Change the sector, the street trees, and the dishes in the prompts to match the real place
and the same eight-shot structure still holds.
