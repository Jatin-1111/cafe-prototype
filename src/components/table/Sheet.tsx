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
      {/* rounded-none matters: this is a full-bleed button, and the global
          control radius would otherwise round the scrim into an ellipse. */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 rounded-none bg-ink/45 backdrop-blur-[2px]"
      />
      <div className="relative w-full max-w-md bg-paper rounded-t-[28px] sm:rounded-[28px] sm:mb-6 border border-line shadow-[0_-18px_60px_-20px] shadow-ink/35 max-h-[88dvh] sm:max-h-[82dvh] flex flex-col overflow-hidden">
        <div className="flex items-start justify-between gap-4 px-4 py-4 border-b border-line">
          <div>
            <h2 className="font-display text-xl leading-tight tracking-tight">{title}</h2>
            {subtitle ? <p className="mt-1 text-xs text-muted">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-8 h-8 grid place-items-center border border-line text-ink hover:bg-ink hover:text-sand transition-colors"
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
