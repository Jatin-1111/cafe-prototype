"use client";

import { useEffect, useId, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Bottom sheet used by every step of the table flow.
 *
 * A real dialog: it takes focus on open, keeps Tab inside itself, closes on
 * Escape, and hands focus back to whatever opened it. Without that, a keyboard
 * or screen-reader user who opens the options sheet is stranded behind it —
 * the page underneath is still there, still tabbable, and silent.
 */
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
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const subtitleId = useId();

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const node = panel.current;
    node?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !node) return;

      const stops = [...node.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null,
      );
      if (!stops.length) return;

      const first = stops[0];
      const last = stops[stops.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !node.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    // The page behind must not scroll under the sheet on a phone.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      opener?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* rounded-none matters: this is a full-bleed button, and the global
          control radius would otherwise round the scrim into an ellipse. */}
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 rounded-none bg-ink/45 backdrop-blur-[2px]"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitle ? subtitleId : undefined}
        className="relative w-full max-w-md bg-paper rounded-t-[28px] sm:rounded-[28px] sm:mb-6 border border-line shadow-[0_-18px_60px_-20px] shadow-ink/35 max-h-[88dvh] sm:max-h-[82dvh] flex flex-col overflow-hidden"
      >
        <div className="flex items-start justify-between gap-4 px-4 py-4 border-b border-line">
          <div>
            <h2 id={titleId} className="font-display text-xl leading-tight tracking-tight">
              {title}
            </h2>
            {subtitle ? (
              <p id={subtitleId} className="mt-1 text-xs text-muted">
                {subtitle}
              </p>
            ) : null}
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
