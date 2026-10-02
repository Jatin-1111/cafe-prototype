import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { isKnownTable } from "@/lib/tables";
import { TABLE_COOKIE, sessionOwnsTable } from "@/lib/tableAuth";
import {
  advanceOrder,
  cancelOrder,
  getState,
  markPaid,
  placeOrder,
  requestBill,
  resetDemo,
  setOrderStatus,
  toggleSoldOut,
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
  | { type: "advance"; id: string }
  | { type: "status"; id: string; status: OrderStatus }
  | { type: "bill"; id: string }
  | { type: "cancel"; id: string }
  | { type: "pay"; id: string; method: PaymentMethod }
  | { type: "soldOut"; itemId: string }
  | { type: "reset" };

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
        await advanceOrder(action.id);
        break;
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
        await setOrderStatus(action.id, action.status);
        break;
      case "bill":
        await requestBill(action.id);
        break;
      case "pay":
        await markPaid(action.id, action.method);
        break;
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
