import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { isKnownTable } from "@/lib/tables";
import { TABLE_COOKIE, sessionOwnsTable } from "@/lib/tableAuth";
import { OrderTracker } from "@/components/table/OrderTracker";
import { WrongTable } from "@/components/table/WrongTable";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false },
};

export default async function OrderPage({ params }: PageProps<"/t/[table]/order/[id]">) {
  const { table, id } = await params;

  if (!isKnownTable(table)) notFound();

  const bound = (await cookies()).get(TABLE_COOKIE)?.value;
  if (!sessionOwnsTable(bound, table)) {
    return <WrongTable table={table} boundTo={bound && isKnownTable(bound) ? bound : undefined} />;
  }

  return <OrderTracker table={table} id={id} />;
}
