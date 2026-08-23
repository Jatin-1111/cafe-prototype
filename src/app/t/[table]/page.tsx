import type { Metadata } from "next";
import { TableScreen } from "@/components/table/TableScreen";

export const metadata: Metadata = {
  title: "Order from your table",
  robots: { index: false },
};

export default async function TablePage({ params }: PageProps<"/t/[table]">) {
  const { table } = await params;
  return <TableScreen table={table} />;
}
