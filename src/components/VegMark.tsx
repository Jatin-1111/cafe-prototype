/** The FSSAI veg / non-veg mark. Small, but its absence is the first thing an Indian diner notices. */
export function VegMark({ veg, className = "" }: { veg: boolean; className?: string }) {
  const color = veg ? "#1E7A3C" : "#8A2116";
  return (
    <span
      className={`inline-grid place-items-center shrink-0 ${className}`}
      style={{ width: 14, height: 14, border: `1.5px solid ${color}` }}
      role="img"
      aria-label={veg ? "Vegetarian" : "Contains meat or egg"}
      title={veg ? "Vegetarian" : "Contains meat or egg"}
    >
      <span style={{ width: 6, height: 6, borderRadius: 999, background: color }} />
    </span>
  );
}
