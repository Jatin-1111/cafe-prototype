import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { isKnownTable } from "@/lib/tables";
import { TABLE_COOKIE, sessionOwnsTable } from "@/lib/tableAuth";
import {
  advanceOrder,
  cancelOrder,
  claimPayment,
  getState,
  markPaid,
  placeOrder,
  refundOrder,
  requestBill,
  resetDemo,
  setOrderStatus,
  toggleSoldOut,
  updateOrderLines,
  voidOrder,
} from "@/lib/ordersRepo";
import type { Guest, OrderLine, OrderStatus, OrderType, PaymentMethod } from "@/lib/orderTypes";

export const dynamic = "force-dynamic";

/* ============================================================
   Every write the app makes, behind one endpoint.

   Each action replies with the whole state afterwards, so the
   caller that made the change is immediately consistent and does
   not have to wait for its next poll.
   ============================================================ */

type Action =
  | { type: "place"; table: string; lines: OrderLine[]; orderType?: OrderType; guest?: Guest; note?: string }
  | { type: "advance"; id: string; from?: OrderStatus }
  | { type: "status"; id: string; status: OrderStatus; from?: OrderStatus }
  | { type: "void"; id: string }
  | { type: "refund"; id: string }
  | { type: "editLines"; id: string; lines: OrderLine[] }
  | { type: "bill"; id: string }
  | { type: "cancel"; id: string }
  | { type: "pay"; id: string; method: PaymentMethod }
  | { type: "claim"; id: string; method: PaymentMethod }
  | { type: "soldOut"; itemId: string }
  | { type: "reset" };

/**
 * Writes that can lose a race reply 409 with the reason and the current state,
 * so the caller can correct itself and say what happened rather than silently
 * disagreeing with the other device.
 */
async function settle(work: Promise<{ ok: boolean; reason?: string }>) {
  const result = await work;
  const state = await getState();
  if (!result.ok) {
    return NextResponse.json({ error: result.reason, state }, { status: 409 });
  }
  return NextResponse.json({ state });
}

export async function POST(request: NextRequest) {
  let action: Action;
  try {
    action = (await request.json()) as Action;
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  try {
    switch (action.type) {
      case "place": {
        // Placing an order onto a table requires having scanned that table's
        // code — the same rule the page guard enforces, re-checked here so the
        // endpoint cannot be used to order onto someone else's bill.
        const bound = (await cookies()).get(TABLE_COOKIE)?.value;
        if (!isKnownTable(action.table) || !sessionOwnsTable(bound, action.table)) {
          return NextResponse.json(
            { error: "Scan the code on your table before ordering." },
            { status: 403 },
          );
        }
        const order = await placeOrder({
          table: action.table,
          lines: action.lines,
          orderType: action.orderType,
          guest: action.guest,
          note: action.note,
        });
        if (!order) {
          return NextResponse.json(
            { error: "Nothing left to order — those items just came off the board." },
            { status: 409 },
          );
        }
        return NextResponse.json({ order, state: await getState() });
      }

      case "advance":
        return await settle(advanceOrder(action.id, action.from));
      case "void":
        return await settle(voidOrder(action.id));
      case "refund":
        return await settle(refundOrder(action.id));
      case "editLines":
        return await settle(updateOrderLines(action.id, action.lines));
      case "cancel": {
        const result = await cancelOrder(action.id);
        if (!result.ok) {
          return NextResponse.json(
            { error: result.reason, state: await getState() },
            { status: 409 },
          );
        }
        break;
      }
      case "status":
        return await settle(setOrderStatus(action.id, action.status, action.from));
      case "bill":
        await requestBill(action.id);
        break;
      case "pay":
        return await settle(markPaid(action.id, action.method));
      case "claim":
        return await settle(claimPayment(action.id, action.method));
      case "soldOut":
        await toggleSoldOut(action.itemId);
        break;
      case "reset":
        await resetDemo();
        break;
      default:
        return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }

    return NextResponse.json({ state: await getState() });
  } catch (error) {
    console.error("[api/actions]", action.type, error);
    return NextResponse.json({ error: "Could not reach the order database." }, { status: 503 });
  }
}
