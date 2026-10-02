/* ============================================================
   One clock for everything that moves.

   Motion here is meant to explain, never to perform. It earns its
   place in exactly three jobs: showing where a thing came from
   (sheets, the cart bar), showing that something changed on a screen
   you are not staring at (the order status, the counter board), and
   taking the hard edge off a reveal.

   So the numbers are deliberately small. Nothing travels further
   than 12px, nothing runs longer than 0.4s, and nothing overshoots:
   a bounce is a flourish, and a flourish on a bill is a tell.
   ============================================================ */

/** Decelerating, no overshoot. The curve of something being set down. */
export const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

/** Accelerating. Only for things leaving, which should not linger. */
export const EASE_IN: [number, number, number, number] = [0.4, 0, 1, 1];

export const DURATION = {
  /** A state swap on something already in view. */
  fast: 0.16,
  /** The default. Enough to read as movement, short enough to ignore. */
  base: 0.24,
  /** Panels and reveals, which travel further. */
  slow: 0.36,
} as const;

export const transition = { duration: DURATION.base, ease: EASE };
export const transitionSlow = { duration: DURATION.slow, ease: EASE };
export const transitionFast = { duration: DURATION.fast, ease: EASE };

/* ---------- Named parts, so two sheets never drift apart ---------- */

/** The scrim behind a sheet. Fades only: it has no edge to travel from. */
export const scrim = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: DURATION.base, ease: EASE },
};

/** The sheet itself, rising off the bottom edge it is anchored to. */
export const panel = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: DURATION.fast, ease: EASE_IN },
  },
  transition: { duration: DURATION.slow, ease: EASE },
};

/** A bar that lives against the bottom of the screen. */
export const dockedBar = {
  initial: { y: "100%", opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: {
    y: "100%",
    opacity: 0,
    transition: { duration: DURATION.fast, ease: EASE_IN },
  },
  transition: { duration: DURATION.base, ease: EASE },
};

/** A strip that drops out of a header: a warning, an undo, a notice. */
export const notice = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: "auto" },
  exit: { opacity: 0, height: 0 },
  transition: { duration: DURATION.base, ease: EASE },
};

/** A card arriving in a list it was not in a moment ago. */
export const card = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATION.base, ease: EASE },
};

/** Text replacing other text in the same spot. Crossfade, no travel. */
export const swap = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: DURATION.base, ease: EASE },
};
