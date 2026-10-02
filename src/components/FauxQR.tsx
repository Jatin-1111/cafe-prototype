/**
 * A decorative QR-shaped mark. Deterministic from the seed so server and client
 * render the same squares: it is artwork, not a scannable code.
 */
export function FauxQR({
  seed = "refections",
  size = 21,
  className = "",
}: {
  seed?: string;
  size?: number;
  className?: string;
}) {
  const cells: boolean[] = [];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;

  for (let i = 0; i < size * size; i++) {
    hash = (hash * 1103515245 + 12345) >>> 0;
    cells.push(((hash >>> 16) & 1) === 1);
  }

  const inFinder = (x: number, y: number) => {
    const corner = (cx: number, cy: number) =>
      x >= cx && x < cx + 7 && y >= cy && y < cy + 7;
    return corner(0, 0) || corner(size - 7, 0) || corner(0, size - 7);
  };

  const finderOn = (x: number, y: number) => {
    const local = (cx: number, cy: number) => {
      const lx = x - cx;
      const ly = y - cy;
      const edge = lx === 0 || ly === 0 || lx === 6 || ly === 6;
      const core = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
      return edge || core;
    };
    if (x < 7 && y < 7) return local(0, 0);
    if (x >= size - 7 && y < 7) return local(size - 7, 0);
    if (x < 7 && y >= size - 7) return local(0, size - 7);
    return false;
  };

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      role="img"
      aria-label="Table QR code"
      shapeRendering="crispEdges"
    >
      <rect width={size} height={size} fill="currentColor" opacity="0" />
      {cells.map((on, index) => {
        const x = index % size;
        const y = Math.floor(index / size);
        const filled = inFinder(x, y) ? finderOn(x, y) : on;
        if (!filled) return null;
        return <rect key={index} x={x} y={y} width="1" height="1" fill="currentColor" />;
      })}
    </svg>
  );
}
