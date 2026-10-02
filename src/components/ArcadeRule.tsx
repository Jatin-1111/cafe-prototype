type Props = {
  /** Height of the band in pixels; also the arch width, so the arches stay round. */
  size?: number;
  tone?: "brand" | "jade" | "ink" | "brass" | "blush";
  className?: string;
};

const tones: Record<NonNullable<Props["tone"]>, string> = {
  brand: "text-brand",
  jade: "text-jade",
  ink: "text-ink",
  brass: "text-brass",
  blush: "text-blush",
};

/**
 * A band of arches, lifted from the niche wall behind the counter.
 * Marks a real boundary — the top of a page, the end of a section —
 * and is never used as decoration between paragraphs.
 */
export function ArcadeRule({ size = 22, tone = "brand", className = "" }: Props) {
  return (
    <div
      aria-hidden
      className={`arcade w-full ${tones[tone]} ${className}`}
      style={{ ["--arch" as string]: `${size}px` }}
    />
  );
}
