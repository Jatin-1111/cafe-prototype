import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { isKnownTable, TABLES } from "@/lib/tables";

/* ============================================================
   Table codes
   ------------------------------------------------------------
   A table number on its own is guessable, so `/t/07` must not be
   enough to order onto table 7. Each table's printed QR carries a
   short key derived from the table number and a server-side secret:

     /scan/07?k=Xq8x3Ab9Zt

   The scan route checks the key, then binds the browser to that
   table with an httpOnly cookie. After that the guest can move
   around the app freely, but they cannot reach another table
   without physically scanning the code sitting on it: which is
   exactly the rule the room already enforces.
   ============================================================ */

/** Cookie that binds a browser session to one table. */
export const TABLE_COOKIE = "refections_table";

/** A guest's session lasts a long sitting, not a whole day. */
export const TABLE_COOKIE_MAX_AGE = 60 * 60 * 4;

function secret(): string {
  const fromEnv = process.env.TABLE_SECRET;
  if (fromEnv && fromEnv.length >= 16) return fromEnv;

  if (process.env.NODE_ENV === "production" && !fromEnv) {
    // Loud in production, because the fallback below is public knowledge.
    console.warn(
      "[tableAuth] TABLE_SECRET is not set. Table codes are using the shared demo secret.",
    );
  }
  return "refections-prototype-demo-secret-do-not-ship";
}

/** Short, URL-safe key for a table's printed code. */
export function signTable(table: string): string {
  return createHmac("sha256", secret()).update(`table:${table}`).digest("base64url").slice(0, 12);
}

export function verifyTableKey(table: string, key: string | null | undefined): boolean {
  if (!key) return false;

  const expected = Buffer.from(signTable(table));
  const given = Buffer.from(key);
  if (expected.length !== given.length) return false;

  return timingSafeEqual(expected, given);
}

/** The URL a table's QR code should encode. */
export function scanLink(table: string): string {
  return `/scan/${table}?k=${signTable(table)}`;
}

/** Every table's scan link: used by the demo hub to stand in for the printed codes. */
export function allScanLinks(): Record<string, string> {
  return Object.fromEntries(TABLES.map((table) => [table, scanLink(table)]));
}

/**
 * True when this browser is allowed to act as `table`.
 * `cookieValue` comes from the request; anything else is refused.
 */
export function sessionOwnsTable(cookieValue: string | undefined, table: string): boolean {
  return Boolean(cookieValue) && isKnownTable(table) && cookieValue === table;
}
