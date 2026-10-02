/**
 * The guest's name, remembered on the device between rounds.
 *
 * Typing your name again for a second coffee is small, and it is exactly the
 * kind of small that makes table ordering feel like paperwork.
 */

const KEY = "refections.guest.v1";

export type RememberedGuest = { name?: string; phone?: string };

export function recallGuest(): RememberedGuest {
  if (typeof window === "undefined") return {};
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "null");
    return raw && typeof raw === "object" ? (raw as RememberedGuest) : {};
  } catch {
    return {};
  }
}

export function rememberGuest(guest: RememberedGuest): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(guest));
  } catch {
    /* private mode: they will simply type it again */
  }
}
