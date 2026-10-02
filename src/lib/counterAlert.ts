"use client";

/* ============================================================
   The counter's new-ticket chime.

   A browser will not play audio until the page has had a real
   click, so the board carries a sound toggle: the tap that turns
   it on is also the gesture that unlocks playback. The tone is
   synthesised rather than loaded, so there is no asset to ship and
   nothing to 404 on a cafe's patchy wifi.
   ============================================================ */

const PREF_KEY = "refections.counterSound.v1";

let context: AudioContext | null = null;

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

function ensureContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
  if (!Ctor) return null;
  context ??= new Ctor();
  return context;
}

const listeners = new Set<() => void>();

/** Subscribe/getSnapshot pair, so the toggle reads through useSyncExternalStore
 *  rather than a setState inside an effect. */
export function subscribeSound(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function soundEnabledOnServer(): boolean {
  return false;
}

export function soundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(PREF_KEY) === "on";
  } catch {
    return false;
  }
}

/** Called from the toggle's click, so the same gesture unlocks audio. */
export function setSoundEnabled(on: boolean): void {
  try {
    localStorage.setItem(PREF_KEY, on ? "on" : "off");
  } catch {
    /* preference simply will not persist */
  }
  if (on) void ensureContext()?.resume();
  for (const listener of listeners) listener();
}

/** Two short notes: audible across a counter, not alarming in a quiet room. */
export function playNewTicketChime(): void {
  if (!soundEnabled()) return;
  const ctx = ensureContext();
  if (!ctx) return;
  void ctx.resume();

  const now = ctx.currentTime;
  for (const [index, frequency] of [880, 1318.5].entries()) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const at = now + index * 0.14;

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, at);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.14, at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.26);

    osc.connect(gain).connect(ctx.destination);
    osc.start(at);
    osc.stop(at + 0.3);
  }
}
