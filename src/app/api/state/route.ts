import { NextResponse } from "next/server";
import { getState } from "@/lib/ordersRepo";

/** Never cached: the counter board is polling this for live tickets. */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const state = await getState();
    return NextResponse.json(state, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[api/state]", error);
    return NextResponse.json(
      { error: "Could not reach the order database." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
