type Props = {
  /** Height of the band in pixels. Also sets the tile size, so squares stay square. */
  size?: number;
  tone?: "ink" | "teal";
  className?: string;
};

/**
 * The checkerboard band. Reserved for real boundaries — the top of the page,
 * the end of a section — never used as filler between paragraphs.
 */
export function CheckerRule({ size = 10, tone = "ink", className = "" }: Props) {
  return (
    <div
      aria-hidden
      className={`${tone === "teal" ? "checker-teal" : "checker"} w-full ${className}`}
      style={{ height: size, ["--checker-size" as string]: `${size}px` }}
    />
  );
}
