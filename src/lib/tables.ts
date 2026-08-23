import { cafe } from "@/data/cafe";

/** Every spot an order can belong to: the numbered tables plus the takeaway counter. */
export const TAKEAWAY = "TA";

export const TABLES: string[] = [
  ...Array.from({ length: cafe.tables }, (_, i) => String(i + 1).padStart(2, "0")),
  TAKEAWAY,
];

const TABLE_SET = new Set(TABLES);

/** Guards against `/t/99`, `/t/../admin` and anything else typed into the bar. */
export function isKnownTable(value: string): boolean {
  return TABLE_SET.has(value);
}

export function tableLabel(table: string): string {
  return table === TAKEAWAY ? "Takeaway" : `Table ${table}`;
}
