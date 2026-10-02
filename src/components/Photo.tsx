import Image from "next/image";
import { shotSrc, type Shot } from "@/data/media";

type Props = {
  shot: Shot;
  /** Tailwind classes for the box. */
  className?: string;
  /** `next/image` sizes hint. Pass one whenever the box is not full width. */
  sizes?: string;
  priority?: boolean;
  /**
   * By default the box holds the shot's aspect ratio so nothing shifts when the
   * file lands. Pass null when the caller sets an explicit height instead.
   */
  aspect?: string | null;
  /** Arch-topped frame — the shape every niche and window in the room takes. */
  arch?: boolean;
};

/**
 * A photography slot. Renders the real image once the shot is marked ready in
 * the manifest, and a plate naming the missing shot until then — either way the
 * box occupies the same space, so dropping files in never reflows the page.
 */
export function Photo({ shot, className = "", sizes, priority, aspect, arch }: Props) {
  const style =
    aspect === null ? undefined : { aspectRatio: aspect ?? `${shot.width} / ${shot.height}` };
  const shape = arch ? "arch-top" : "rounded-card overflow-hidden";

  if (shot.ready) {
    return (
      <div className={`relative bg-sand ${shape} ${className}`} style={style}>
        <Image
          src={shotSrc(shot)}
          alt={shot.alt}
          fill
          sizes={sizes ?? "100vw"}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative grid place-items-center bg-sand-deep/50 border border-dashed border-ink/15 ${shape} ${className}`}
      style={style}
      role="img"
      aria-label={`Photograph pending: ${shot.alt}`}
    >
      <div className="text-center px-5 py-6">
        <p className="eyebrow">Photograph</p>
        <p className="mt-2 font-display text-sm sm:text-base leading-tight text-ink-2">
          {shot.caption}
        </p>
        <p className="mt-2 tnum text-[10px] uppercase tracking-[0.14em] text-muted">
          {shot.width} × {shot.height} · {shot.id}
        </p>
      </div>
    </div>
  );
}
