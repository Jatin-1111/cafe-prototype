import type { Metadata } from "next";
import { allScanLinks } from "@/lib/tableAuth";
import { DemoHub } from "@/components/DemoHub";

export const metadata: Metadata = {
  title: "Walk the prototype",
  description:
    "Entry point for the Kahani prototype — pick a table, send an order, and work it through the counter board.",
  robots: { index: false },
};

export default function DemoPage() {
  // Stands in for the printed codes: each link carries that table's signed key.
  return <DemoHub scanLinks={allScanLinks()} />;
}
