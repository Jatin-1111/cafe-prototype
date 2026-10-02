"use client";

import { MotionConfig, motion } from "motion/react";
import { EASE, DURATION } from "@/lib/motion";

/**
 * Wraps the app so every animation below it honours the operating
 * system's "reduce motion" switch.
 *
 * `reducedMotion="user"` is not the same as switching animation off: it
 * keeps fades, which carry meaning, and drops travel and scaling, which
 * are the parts that make some people ill. The CSS block in globals.css
 * covers transitions written in Tailwind; this covers the ones driven
 * from JavaScript, which that block cannot reach.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/**
 * Fades a block in the first time it is scrolled to, once, and never again.
 *
 * Deliberately dull: 10px of travel over a third of a second. No parallax,
 * no sliding in from the side, nothing that moves while you are reading it.
 * The point is to soften the arrival of a section, not to announce it.
 *
 * The viewport settings are the part that matters, and they are set to fire
 * early on purpose. An observer tuned to wait until a block is properly on
 * screen will, on a tall block, leave a reader looking at an empty column for
 * a moment: measured at 189px of a photo on screen and still at zero opacity.
 * So the root is extended a tenth of a screen past the fold and any sliver
 * counts, which means a block has started fading before anyone can see it.
 *
 * `data-reveal` exists so the no-JS rule in the document head can find these
 * and force them visible. Without it a reader with scripts off gets blank
 * space where the page should be.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      data-reveal
      className={className}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: "some", margin: "0px 0px 10% 0px" }}
      transition={{ duration: DURATION.slow, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
