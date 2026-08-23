/* ============================================================
   Photography manifest
   ------------------------------------------------------------
   One entry per shot the site expects. Save the file into
   /public/photos under the `file` name below, flip `ready` to true,
   and <Photo> swaps the placeholder for a real next/image. Until
   then the layout reserves the exact aspect ratio, so nothing shifts.

   The `prompt` on each entry is the generation brief, kept beside
   the slot it fills so the two cannot drift apart. See
   docs/photography-brief.md for how to run them.
   ============================================================ */

export type Shot = {
  id: string;
  /** Filename expected in /public/photos. */
  file: string;
  /** Flip to true once the file is actually sitting in /public/photos. */
  ready?: boolean;
  alt: string;
  /** Intended pixel size of the delivered file. */
  width: number;
  height: number;
  /** Shown on the placeholder plate so a reviewer knows what belongs here. */
  caption: string;
  prompt: string;
};

/**
 * Appended to every prompt. Identical wording across the set is what makes
 * eight separate generations read as one shoot by one photographer.
 */
export const HOUSE_STYLE =
  "TECHNICAL: Shot on a full-frame camera with a fast prime, Kodak Portra 400 colour rendition — " +
  "warm mid-tones, cool shadows, gentle highlight roll-off, fine visible grain. " +
  "Natural available light only; no flash, no reflector fill, no colour gels, no HDR. " +
  "Contrast held slightly flat so the highlights never clip. Saturation restrained. " +
  "PALETTE: the frame should sit in deep teal (#1E5D59), mustard (#D9A123), oxblood (#7A2E2A), " +
  "bone and cream (#EFE7D4), with charcoal accents. Nothing neon, nothing pastel, no blue-grey " +
  "cast. " +
  "EXCLUDE: no text of any kind, no lettering, no signage copy, no menu boards with words, " +
  "no brand logos, no watermarks, no captions, no visible faces, no posed models, " +
  "no plastic chairs, no fairy lights, no exposed-filament Edison bulbs, no chalkboard art, " +
  "no succulents in tin cans, no marble-and-gold styling clichés, no over-propped flat lay.";

/** Repeated in all four dish prompts so the row of squares matches. */
export const DISH_SET =
  "SET (identical across every dish shot): the same 80cm round white Makrana marble café table, " +
  "faint grey veining and two small honest chips at the edge. The same window light entering from " +
  "camera-left at roughly 30 degrees, mid-morning, soft-edged shadows falling to camera-right. " +
  "Same camera height: 40 degrees above the table, not flat overhead. Same 50mm equivalent at f/2.8, " +
  "focus on the front edge of the food, background falling away softly. " +
  "Background: a blurred suggestion of cream lime-plaster wall and one teak chair back, " +
  "occupying the top fifth of the frame only. Food fills roughly 60% of the frame, centred, " +
  "with breathing room on all four sides so a square crop never clips it.";

export const shots = {
  room: {
    id: "room",
    file: "room.png",
    ready: true,
    alt: "The main room at Kahani — terrazzo floor, marble tables and cane-backed teak chairs in late afternoon light",
    width: 2400,
    height: 1350,
    caption: "The room · wide, late afternoon",
    prompt:
      "SHOT: Editorial interior photograph, 24mm wide lens at f/4, camera at eye level standing just " +
      "inside the doorway, looking the length of the room. Verticals kept straight, no tilt. " +
      "SUBJECT: a small independent café occupying the ground floor of a 1960s Chandigarh sector " +
      "house, built in the Le Corbusier idiom. " +
      "ARCHITECTURE: board-marked exposed concrete lintels and beams left raw; a whitewashed brick " +
      "jaali screen along the left wall casting diamond-shaped shadows across the floor; a terrazzo " +
      "floor in cream and charcoal squares, worn smooth and slightly uneven; teak-framed windows " +
      "with slim steel casements; a deep concrete brise-soleil visible outside the glass. " +
      "FURNITURE: low teak-and-cane armchairs in the Pierre Jeanneret manner, round white marble " +
      "café tables, a long teak service counter on the right with a brass-trimmed edge and a stack " +
      "of clay kulhads on it. A slow four-blade ceiling fan. " +
      "COLOUR IN THE ROOM: deep teal painted dado to waist height, bone lime plaster above, two " +
      "mustard seat cushions, one worn oxblood rug in the middle distance. " +
      "LIGHT: 4pm February sun, low and raking in from camera-left through the jaali, throwing " +
      "hard-edged parallelograms of light onto the terrazzo; dust suspended in the beams; every " +
      "electric light switched off. " +
      "COMPOSITION: the room reads deep, counter on the right third, empty tables running through " +
      "the centre. Completely empty of people. Keep the central horizontal third of the frame " +
      "uncluttered and keep the top and bottom eighth free of anything essential — the web layout " +
      "crops this to a wide letterbox band. " +
      HOUSE_STYLE,
  },

  roasting: {
    id: "roasting",
    file: "roasting.png",
    ready: true,
    alt: "A small drum coffee roaster mid-batch, beans tumbling behind the glass",
    width: 1800,
    height: 1200,
    caption: "The roaster · Tuesday batch",
    prompt:
      "SHOT: Documentary detail photograph, 35mm at f/2, camera a little above waist height and " +
      "close in, three-quarter angle to the machine. " +
      "SUBJECT: a small vintage 12kg drum coffee roaster in the back room of a Chandigarh café, " +
      "caught mid-roast. Cast-iron body in chipped dark green enamel, brass temperature gauges " +
      "with needles mid-sweep, a brass trier pulled halfway out. " +
      "DETAIL: beans visible tumbling behind the drum's glass window, colour caught mid-transition " +
      "from pale green to cinnamon brown; a steel scoop of just-roasted beans resting on the " +
      "cooling tray, still throwing off heat; two jute sacks slumped against the wall behind, " +
      "chalk-marked with numbers only, no words; a battered logbook and a pencil on the ledge. " +
      "LIGHT: mixed — hard afternoon daylight from a high window at camera-right, one warm tungsten " +
      "bulb above the drum, the two colour temperatures allowed to disagree. Chaff dust hanging in " +
      "the air, catching the daylight. " +
      "COMPOSITION: drum window on the left third and in sharpest focus, gauges catching a " +
      "highlight, the room falling into soft shadow behind. Hands may enter the frame at the trier, " +
      "sleeves rolled, but no face and no torso. " +
      HOUSE_STYLE,
  },

  exterior: {
    id: "exterior",
    file: "exterior.png",
    ready: true,
    alt: "The Sector 9 house at dusk, warm light spilling through the concrete screen onto the veranda",
    width: 1200,
    height: 1500,
    caption: "Sector 9 · dusk, vertical",
    prompt:
      "SHOT: Architectural exterior photograph, vertical portrait orientation, 35mm at f/4, camera " +
      "at standing height from across the street, verticals corrected. " +
      "SUBJECT: the front of a 1960s Chandigarh sector house converted into a café — flat-roofed, " +
      "two storeys, textbook Chandigarh modernism. " +
      "ARCHITECTURE: a deep concrete brise-soleil grid across the upper floor casting a shadow " +
      "lattice; bare board-marked concrete columns; cream lime-plaster infill walls streaked by " +
      "monsoons; a red-oxide veranda floor and three shallow steps; teak-framed glazing with slim " +
      "steel casements; a plain rectangular metal signboard mounted beside the door, completely " +
      "blank with no lettering, painted deep teal. " +
      "SETTING: a wide, quiet, tree-lined sector street; a low boundary wall with a bare concrete " +
      "gate post; an amaltas tree overhead in leaf; two terracotta pots of tulsi on the steps; a " +
      "single bicycle leaning on the wall. Empty street, no traffic, no people. " +
      "LIGHT: fifteen minutes after sunset — the sky a deep even blue, the last warm light gone " +
      "from the walls, and the café's warm interior light spilling out through the glazing and " +
      "through the brise-soleil grid, pooling on the red-oxide veranda and the steps. Interior " +
      "warm at about 2700K against the cool blue exterior; let the two temperatures contrast. " +
      "COMPOSITION: building fills the lower two thirds, sky the upper third, doorway roughly on " +
      "the left third with the brightest light. " +
      HOUSE_STYLE,
  },

  marbleCode: {
    id: "marbleCode",
    file: "marble-code.png",
    ready: true,
    alt: "A brass-framed table code standing on a marble tabletop beside a clay cup of chai",
    width: 1600,
    height: 1200,
    caption: "The table code · on marble",
    prompt:
      "SHOT: Close product-in-situ photograph, 50mm at f/2, camera 35 degrees above the tabletop, " +
      "shallow depth of field. " +
      "SUBJECT: a small brass table stand, about 12cm tall, holding a square card printed with an " +
      "abstract black-and-white block pattern of solid squares. The pattern must read as pure " +
      "geometry — absolutely no readable characters, letters, numbers or logo, and not a real " +
      "scannable code. " +
      "SURFACE AND PROPS: a worn white Makrana marble café tabletop with faint grey veining and one " +
      "chipped edge. Beside the stand: an unglazed clay kulhad of milky chai with a skin just " +
      "forming, a small steel sugar pot with a steel spoon, and a single brass teaspoon. Nothing " +
      "else on the table. " +
      "BACKGROUND: the cream-and-charcoal terrazzo floor and a teak chair leg visible far below and " +
      "well out of focus. " +
      "LIGHT: soft daylight from camera-left through a jaali screen, so a faint diamond shadow " +
      "pattern falls across the marble on the right of the frame. " +
      "COMPOSITION: brass stand sharp and on the left third, kulhad softer on the right, generous " +
      "empty marble in the lower right corner. " +
      HOUSE_STYLE,
  },

  /* ---------- Signature dishes, square crops, one matched set ---------- */

  coldBrew: {
    id: "coldBrew",
    file: "cold-brew.png",
    ready: true,
    alt: "Cold brew coffee over a single large ice cube in a heavy glass",
    width: 1200,
    height: 1200,
    caption: "Malabar Cold Brew",
    prompt:
      "DISH: black cold brew coffee, deep mahogany and completely clear, in a heavy short " +
      "straight-sided glass tumbler over one large hand-cut clear ice cube. Beads of condensation " +
      "running down the outside of the glass and a small ring of water on the marble. A tiny copper " +
      "jug of milk sits behind and to the right, well out of focus. No straw, no garnish, no mint. " +
      DISH_SET +
      " " +
      HOUSE_STYLE,
  },

  doodhPatti: {
    id: "doodhPatti",
    file: "doodh-patti.png",
    ready: true,
    alt: "Kulhad doodh patti chai with a buttered bun on a steel plate",
    width: 1200,
    height: 1200,
    caption: "Kulhad Doodh Patti & Bun Makkhan",
    prompt:
      "DISH: an unglazed terracotta kulhad of doodh patti chai — no water, all milk, boiled down to " +
      "the colour of old teak — filled almost to the rim with a skin just beginning to form and one " +
      "drip down the outside of the clay. It sits on a chipped white enamel saucer. Beside it, on a " +
      "small steel plate, a soft split pav bun spread thickly with white butter, the butter still " +
      "ridged from the knife and beginning to soften at the edges. A steel spoon rests on the " +
      "marble. Well-used crockery, honest and unstyled, nothing arranged too neatly. " +
      DISH_SET +
      " " +
      HOUSE_STYLE,
  },

  bhurji: {
    id: "bhurji",
    file: "bhurji.png",
    ready: true,
    alt: "Soft-scrambled anda bhurji piled on toasted sourdough",
    width: 1200,
    height: 1200,
    caption: "Anda Bhurji on Sourdough",
    prompt:
      "DISH: anda bhurji — Indian soft-scrambled eggs, loose and glossy, still visibly moist, in " +
      "large soft curds rather than dry crumbs — piled generously over two thick slices of " +
      "well-toasted sourdough on a rustic cream ceramic plate. Flecked through with finely chopped " +
      "green chilli, red onion and plenty of fresh coriander leaf; a light dusting of red chilli " +
      "powder on one side. A wedge of lime and a steel fork on the plate. The toast should be " +
      "visibly charred at the ridges and the eggs should slump slightly over the edge. " +
      DISH_SET +
      " " +
      HOUSE_STYLE,
  },

  basque: {
    id: "basque",
    file: "basque.png",
    ready: true,
    alt: "A slice of dark-topped gur Basque cheesecake, cut so the soft centre shows",
    width: 1200,
    height: 1200,
    caption: "Gur Basque Cheesecake",
    prompt:
      "DISH: a single wedge of Basque burnt cheesecake, cut so the profile faces the camera. The top " +
      "deeply caramelised to a near-black mahogany with a blistered, cracked, collapsed surface; " +
      "the sides pleated where the parchment held it; the centre pale, custardy and just barely " +
      "set, slumping very slightly at the cut face. Made with dark jaggery, so the crumb reads " +
      "amber rather than yellow. On a small cream ceramic plate, with a thin pool of dark jaggery " +
      "syrup at the base of the slice and a cake fork alongside. Served at room temperature — no " +
      "condensation, no cream, no berries, no icing sugar, no mint sprig. " +
      DISH_SET +
      " " +
      HOUSE_STYLE,
  },
} satisfies Record<string, Shot>;

export type ShotKey = keyof typeof shots;

export const allShots = Object.values(shots) as Shot[];

/** Public path for a shot's file. */
export function shotSrc(shot: Shot) {
  return `/photos/${shot.file}`;
}

/** How many shots are still waiting on a file. */
export const pendingShots = allShots.filter((shot) => !shot.ready);
