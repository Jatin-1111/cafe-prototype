/* ============================================================
   The few icons this app needs, drawn rather than typed.

   Glyphs like ✕, ⌕ and ▲ were standing in for icons. They are not
   emoji, but they are typography pressed into a job it is bad at:
   they inherit the text font, so they land at a different weight
   and baseline on every device, and ⌕ is missing from plenty of
   system fonts entirely.
   ============================================================ */

type Props = { className?: string };

const base = {
  viewBox: "0 0 16 16",
  fill: "none" as const,
  stroke: "currentColor" as const,
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function CloseIcon({ className = "w-4 h-4" }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

export function SearchIcon({ className = "w-4 h-4" }: Props) {
  return (
    <svg {...base} className={className}>
      <circle cx="7" cy="7" r="4.25" />
      <path d="M10.2 10.2L14 14" />
    </svg>
  );
}

export function ChevronDownIcon({ className = "w-4 h-4" }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M4 6.5l4 4 4-4" />
    </svg>
  );
}

export function ChevronRightIcon({ className = "w-4 h-4" }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M6.5 4l4 4-4 4" />
    </svg>
  );
}

export function MinusIcon({ className = "w-4 h-4" }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M3.5 8h9" />
    </svg>
  );
}

export function PlusIcon({ className = "w-4 h-4" }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M8 3.5v9M3.5 8h9" />
    </svg>
  );
}

/** Filled, because a rating mark reads as a solid shape at small sizes. */
export function StarIcon({ className = "w-4 h-4" }: Props) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
      <path d="M8 1.6l1.95 3.95 4.36.63-3.15 3.07.74 4.34L8 11.54l-3.9 2.05.74-4.34L1.69 6.18l4.36-.63z" />
    </svg>
  );
}
