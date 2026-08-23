import type { Metadata } from "next";
import { OrderTracker } from "@/components/table/OrderTracker";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false },
};

export default async function OrderPage({ params }: PageProps<"/t/[table]/order/[id]">) {
  const { table, id } = await params;
  return <OrderTracker table={table} id={id} />;
}
