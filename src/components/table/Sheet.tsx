"use client";

/** Bottom sheet used by every step of the table flow. */
export function Sheet({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/50"
      />
      <div className="relative w-full max-w-md bg-paper border-t-4 border-ink max-h-[88dvh] flex flex-col">
        <div className="flex items-start justify-between gap-4 px-4 py-4 border-b border-line">
          <div>
            <h2 className="font-display text-xl leading-tight tracking-tight">{title}</h2>
            {subtitle ? <p className="mt-1 text-xs text-muted">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-8 h-8 grid place-items-center border border-line text-ink hover:bg-ink hover:text-bone transition-colors"
          >
            <span aria-hidden>✕</span>
            <span className="sr-only">Close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
