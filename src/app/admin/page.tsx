import type { Metadata } from "next";
import { AdminBoard } from "@/components/admin/AdminBoard";

export const metadata: Metadata = {
  title: "Counter",
  robots: { index: false },
};

export default function AdminPage() {
  return <AdminBoard />;
}
