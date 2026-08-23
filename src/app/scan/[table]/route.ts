import { NextResponse, type NextRequest } from "next/server";
import { isKnownTable } from "@/lib/tables";
import { TABLE_COOKIE, TABLE_COOKIE_MAX_AGE, verifyTableKey } from "@/lib/tableAuth";

/**
 * What a table's QR code points at. Verifies the code's key, then binds this
 * browser to that table with an httpOnly cookie and hands over to the menu.
 *
 * Every failure hands over to /t/[table] without a cookie, and that page
 * decides what the guest sees — an unknown table 404s, a known table without
 * a valid code gets the "scan the code on your table" screen.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/scan/[table]">) {
  const { table } = await ctx.params;
  const destination = new URL(`/t/${encodeURIComponent(table)}`, request.url);

  if (!isKnownTable(table) || !verifyTableKey(table, request.nextUrl.searchParams.get("k"))) {
    return NextResponse.redirect(destination);
  }

  const response = NextResponse.redirect(destination);
  response.cookies.set(TABLE_COOKIE, table, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: TABLE_COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
