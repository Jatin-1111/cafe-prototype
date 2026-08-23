import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { isKnownTable } from "@/lib/tables";
import { TABLE_COOKIE, sessionOwnsTable } from "@/lib/tableAuth";
import { TableScreen } from "@/components/table/TableScreen";
import { WrongTable } from "@/components/table/WrongTable";

export const metadata: Metadata = {
  title: "Order from your table",
  robots: { index: false },
};

export default async function TablePage({ params }: PageProps<"/t/[table]">) {
  const { table } = await params;

  // A table that does not exist on the floor is a 404, not a permission problem.
  if (!isKnownTable(table)) notFound();

  const bound = (await cookies()).get(TABLE_COOKIE)?.value;
  if (!sessionOwnsTable(bound, table)) {
    return <WrongTable table={table} boundTo={bound && isKnownTable(bound) ? bound : undefined} />;
  }

  return <TableScreen table={table} />;
}
