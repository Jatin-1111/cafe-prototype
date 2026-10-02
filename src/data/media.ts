/* ============================================================
   Photography manifest — Refections Cafe
   ------------------------------------------------------------
   One entry per shot the site expects. Save the file into
   /public/photos under the `file` name below, flip `ready` to true,
   and <Photo> swaps the placeholder for a real next/image. Until
   then the layout reserves the exact aspect ratio, so nothing shifts.

   The `prompt` on each entry is the generation brief, kept beside
   the slot it fills so the two cannot drift apart. See
   docs/photography-brief.md for how to run them.

   Fastest route for a client pitch: use the cafe's own photographs
   with their permission. These prompts exist so the mock can be
   filled in before that conversation happens.
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
  /** A twelve-pixel version of the file, inlined so the slot is never blank. */
  blur?: string;
  /** Shown on the placeholder plate so a reviewer knows what belongs here. */
  caption: string;
  prompt: string;
};

/* ------------------------------------------------------------
   Every slot below is filled with one of the cafe's own published
   photographs, cropped to the slot. The prompts are kept only as a
   brief for re-shooting or for skinning this app to another cafe.
   ------------------------------------------------------------ */

/**
 * Appended to every prompt. Identical wording across a set is what makes
 * separate generations read as one shoot by one photographer.
 */
export const HOUSE_STYLE =
  "TECHNICAL: Full-frame camera, fast prime, bright airy editorial finish. Soft natural daylight " +
  "with warm tungsten mixed in, gentle contrast, highlights allowed to bloom slightly. " +
  "Clean colour, lightly lifted blacks, no heavy grain, no HDR, no harsh flash. " +
  "PALETTE: the frame should sit in terracotta (#BC5228), jade green (#1F6B56), blush rose " +
  "(#DFA7A2), warm sand plaster (#F1E2D0) and brass (#C08A4A). Warm throughout, nothing cold, " +
  "nothing grey. " +
  "EXCLUDE: no text of any kind, no lettering, no signage copy, no menu boards with words, " +
  "no brand logos, no watermarks, no visible faces, no posed models, no chalkboard art, " +
  "no exposed-filament Edison bulbs, no dark moody grading, no cold blue shadows.";

/** Repeated in all four dish prompts so the row of squares matches. */
const DISH_SET =
  "SET (identical across every dish shot): the same white marble café table with soft grey " +
  "veining and a thin brass edge. The same soft daylight entering from camera-left at roughly 30 " +
  "degrees, late morning, with a warm bounce filling the shadows. Same camera height: 40 degrees " +
  "above the table, not flat overhead. Same 50mm equivalent at f/2.8, focus on the front edge of " +
  "the food, background falling away softly. Background: a blurred suggestion of warm sand " +
  "plaster wall and the cane back of a chair, occupying the top fifth of the frame only. Food " +
  "fills roughly 60% of the frame, centred, with breathing room on all four sides so a square " +
  "crop never clips it.";

const ROOM_PROMPT =
  "Wide editorial interior of a first-floor Chandigarh cafe: capsule-arched windows, taupe " +
  "button-tufted booths, rattan pendant lamps, a terracotta geometric mural, and arched niches " +
  "lined with sage-and-blush botanical wallpaper. Empty of people, soft daylight. Keep the top and " +
  "bottom eighth free of anything essential — the layout crops this to a wide band. " +
  HOUSE_STYLE;

const COUNTER_PROMPT =
  "The back wall of the cafe counter: a row of soft organic arch niches cut into warm sand " +
  "plaster, painted deep terracotta inside and warmly backlit, each holding stemmed glassware on a " +
  "brass shelf. A dark fluted-tile bar front below, brass mesh ceiling above. " +
  HOUSE_STYLE;

const ARCH_PROMPT =
  "Vertical: a single tall arched niche in warm sand plaster, lined with sage and blush botanical " +
  "wallpaper and holding a brass-framed arched mirror, above a dusty rose velvet banquette with " +
  "cane-backed teak chairs and a white marble table. " +
  HOUSE_STYLE;

const TABLES_PROMPT =
  "A row of white marble cafe tables with brass edges and blush floral upholstered chairs, " +
  "standing on speckled terrazzo, with a curved jade-green velvet banquette and potted palms " +
  "beyond. Soft daylight, empty of people. " +
  HOUSE_STYLE;

const DISH_PROMPT = DISH_SET + " " + HOUSE_STYLE;

export const shots = {
  room: {
    id: "room",
    file: "room.jpg",
    blur: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABUOEBIQDRUSERIYFhUZHzQiHx0dH0AuMCY0TENQT0tDSUhUXnlmVFlyWkhJaY9qcnyAh4iHUWWUn5ODnXmEh4L/2wBDARYYGB8cHz4iIj6CVklWgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoL/wAARCAAHAAwDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDSu72MzOEUnpz0BrIf7S7kjAH86KKzaVzVbH//2Q==",
    ready: true,
    alt: "The main room — capsule windows, tufted booths, rattan pendants and a terracotta mural on the far wall",
    width: 1080,
    height: 608,
    caption: "The room · wide",
    prompt: ROOM_PROMPT,
  },

  counter: {
    id: "counter",
    file: "counter.jpg",
    blur: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABUOEBIQDRUSERIYFhUZHzQiHx0dH0AuMCY0TENQT0tDSUhUXnlmVFlyWkhJaY9qcnyAh4iHUWWUn5ODnXmEh4L/2wBDARYYGB8cHz4iIj6CVklWgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoL/wAARCAAGAAwDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwCGG6kbaOARx060MryMWYjNFFYtWNVruf/Z",
    ready: true,
    alt: "The counter wall — a row of backlit terracotta arch niches holding glassware above the bar",
    width: 900,
    height: 450,
    caption: "The counter · arch niches",
    prompt: COUNTER_PROMPT,
  },

  arch: {
    id: "arch",
    file: "arch.jpg",
    blur: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABUOEBIQDRUSERIYFhUZHzQiHx0dH0AuMCY0TENQT0tDSUhUXnlmVFlyWkhJaY9qcnyAh4iHUWWUn5ODnXmEh4L/2wBDARYYGB8cHz4iIj6CVklWgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoL/wAARCAAMAAoDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwCzLcuhgLkhiPmJH16/pVNri43HMbdfWq0btPGPNO4dQOwNWBbxEZ2D865m0dKR/9k=",
    ready: true,
    alt: "An arched niche lined with botanical wallpaper above a rose velvet banquette and cane chairs",
    width: 576,
    height: 720,
    caption: "The arches · vertical",
    prompt: ARCH_PROMPT,
  },

  tables: {
    id: "tables",
    file: "tables.jpg",
    blur: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABUOEBIQDRUSERIYFhUZHzQiHx0dH0AuMCY0TENQT0tDSUhUXnlmVFlyWkhJaY9qcnyAh4iHUWWUn5ODnXmEh4L/2wBDARYYGB8cHz4iIj6CVklWgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoL/wAARCAAJAAwDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwB1zFcW+F6uDk4HQU6JfMQGXzC3Tg1d/wCWsn+6Kgfr+FZNKLNNZI//2Q==",
    ready: true,
    alt: "Marble tables with floral upholstered chairs on speckled terrazzo, jade banquette beyond",
    width: 960,
    height: 720,
    caption: "The tables · terrazzo",
    prompt: TABLES_PROMPT,
  },

  /* ---------- Signature dishes, square crops ---------- */

  pizza: {
    id: "pizza",
    file: "pizza.jpg",
    blur: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABUOEBIQDRUSERIYFhUZHzQiHx0dH0AuMCY0TENQT0tDSUhUXnlmVFlyWkhJaY9qcnyAh4iHUWWUn5ODnXmEh4L/2wBDARYYGB8cHz4iIj6CVklWgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoL/wAARCAAMAAwDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDRWQbWeOGJI1wSFGTioZoZ2fOQMjoGIFZpnlhYojnCnApDcSnHzdOBWLua2P/Z",
    ready: true,
    alt: "A farmhouse pizza on a wooden board, cut into slices, on a marble table",
    width: 720,
    height: 720,
    caption: "Farmhouse Pizza",
    prompt: DISH_PROMPT,
  },

  sliders: {
    id: "sliders",
    file: "sliders.jpg",
    blur: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABUOEBIQDRUSERIYFhUZHzQiHx0dH0AuMCY0TENQT0tDSUhUXnlmVFlyWkhJaY9qcnyAh4iHUWWUn5ODnXmEh4L/2wBDARYYGB8cHz4iIj6CVklWgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoL/wAARCAAMAAwDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDONswfaWTr1qHym9VH1atm+gW2nSOJmAY85qyNOtsDcrMSOpY1gkzWSjfQ/9k=",
    ready: true,
    alt: "Three tricolour sliders with potato wedges on a wooden board against jade velvet",
    width: 720,
    height: 720,
    caption: "Tricolour Sliders",
    prompt: DISH_PROMPT,
  },

  panini: {
    id: "panini",
    file: "panini.jpg",
    blur: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABUOEBIQDRUSERIYFhUZHzQiHx0dH0AuMCY0TENQT0tDSUhUXnlmVFlyWkhJaY9qcnyAh4iHUWWUn5ODnXmEh4L/2wBDARYYGB8cHz4iIj6CVklWgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoL/wAARCAAMAAwDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwC1bRi3YxebvQL8rr0NLJa28rl2MpLdxjH8qymPleSo+ZdvRqIp3UHGOtc2sZNxN5WcUmj/2Q==",
    ready: true,
    alt: "A grilled vegetable panini on a wooden board with a dip, beside branded packaging",
    width: 720,
    height: 720,
    caption: "Grilled Veg Panini",
    prompt: DISH_PROMPT,
  },

  burger: {
    id: "burger",
    file: "burger.jpg",
    blur: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABUOEBIQDRUSERIYFhUZHzQiHx0dH0AuMCY0TENQT0tDSUhUXnlmVFlyWkhJaY9qcnyAh4iHUWWUn5ODnXmEh4L/2wBDARYYGB8cHz4iIj6CVklWgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoL/wAARCAAMAAwDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDQii2R/uIcMxKsxYEtUTaZk52tH/sjGKotISzkgElxyfxpYJG2sASAGwBmueMmnudEqcWtUf/Z",
    ready: true,
    alt: "A crispy chicken burger with melted cheese and slaw, branded fries tin behind",
    width: 720,
    height: 720,
    caption: "Crispy Chicken Burger",
    prompt: DISH_PROMPT,
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
