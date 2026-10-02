import { menuById, type MenuItem } from "@/data/menu";
import type {
  Guest,
  Order,
  OrderLine,
  OrderStatus,
  OrderType,
  PaymentMethod,
} from "@/lib/orderTypes";

/* ============================================================
   Demo seed. Used once when the orders collection is empty, and
   again whenever someone presses "Reset demo", so the counter
   board is never a sad empty screen in front of a client.
   ============================================================ */

/**
 * Returns null for an id the menu no longer has. Seed data drifts whenever the
 * menu is re-skinned for a new cafe, and a stale id must never be able to throw
 * on first load: that took the whole app down once already.
 */
function line(itemId: string, qty: number, options?: Record<string, string>): OrderLine | null {
  const item: MenuItem | undefined = menuById.get(itemId);
  if (!item) {
    console.warn(`[seed] menu item "${itemId}" no longer exists, dropped from the demo data`);
    return null;
  }
  return { itemId, name: item.name, price: item.price, qty, options };
}

function lines(...entries: (OrderLine | null)[]): OrderLine[] {
  return entries.filter((l): l is OrderLine => l !== null);
}

/** Something is always off the board by the evening rush. */
export const SEED_SOLD_OUT = ["m-bbq-chicken-pizza"];

type Draft = {
  table: string;
  lines: OrderLine[];
  status: OrderStatus;
  ago: number;
  note?: string;
  guest?: Guest;
  orderType?: OrderType;
  billRequested?: boolean;
  paymentMethod?: PaymentMethod;
};

export function seedOrders(now: number): Order[] {
  const min = 60_000;

  const drafts: Draft[] = [
    {
      table: "11",
      lines: lines(line("m-cold-coffee", 2), line("m-peri-fries", 1), line("m-garlic-bread", 1)),
      status: "new",
      ago: 1.5 * min,
      guest: { name: "Ritika" },
    },
    {
      table: "03",
      lines: lines(
        line("m-margherita", 1, { Base: "Thin crust" }),
        line("m-cappuccino", 2, { Milk: "Full cream" }),
      ),
      status: "preparing",
      ago: 6 * min,
      note: "One cappuccino without sugar, please",
      guest: { name: "Gurpreet" },
    },
    {
      table: "07",
      lines: lines(
        line("m-alfredo", 1, { Pasta: "Penne", Add: "Chicken" }),
        line("m-virgin-mojito", 1, { Flavour: "Green apple" }),
      ),
      status: "preparing",
      ago: 11 * min,
    },
    {
      table: "TA",
      lines: lines(line("m-cold-brew", 2, { Milk: "Black" })),
      status: "ready",
      ago: 4 * min,
      orderType: "takeaway",
      guest: { name: "Simran", phone: "+91 98450 11223" },
    },
    {
      table: "02",
      lines: lines(line("m-brownie", 2), line("m-latte", 2, { Milk: "Oat", Sugar: "Less" })),
      status: "served",
      ago: 22 * min,
      billRequested: true,
      guest: { name: "Jaskaran" },
    },
    {
      table: "06",
      lines: lines(
        line("m-farmhouse", 1, { Base: "Cheese burst" }),
        line("m-chilli-paneer", 1, { Style: "Dry" }),
      ),
      status: "served",
      ago: 34 * min,
    },
    {
      table: "09",
      lines: lines(line("m-tiramisu", 1), line("m-masala-chai", 2, { Strength: "Kadak" })),
      status: "paid",
      ago: 52 * min,
      paymentMethod: "upi",
    },
    {
      table: "05",
      lines: lines(line("m-panini", 2, { Filling: "Chicken" }), line("m-classic-fries", 1)),
      status: "paid",
      ago: 68 * min,
      paymentMethod: "card",
    },
  ];

  return drafts.map((draft, index) => {
    const total = draft.lines.reduce((sum, l) => sum + l.price * l.qty, 0);
    return {
      id: `seed-${index}`,
      code: `K-${2205 + index}`,
      table: draft.table,
      orderType: draft.orderType ?? "table",
      guest: draft.guest,
      lines: draft.lines,
      total,
      status: draft.status,
      placedAt: now - draft.ago,
      updatedAt: now - draft.ago / 2,
      note: draft.note,
      billRequested: draft.billRequested,
      paidAt: draft.status === "paid" ? now - draft.ago / 3 : undefined,
      paymentMethod: draft.paymentMethod,
    };
  });
}
