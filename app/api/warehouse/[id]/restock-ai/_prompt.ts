export type RestockScope = "floor" | "warehouse";

export type RestockInventoryRow = {
  product: string;
  currentStock: number;
  category: string;
  currentPrice?: number;
  averageWeeklySales?: number | null;
};

export type RestockPromptInput = {
  warehouseName: string;
  scope: RestockScope;
  floorName?: string;
  sectionLabel?: string;
  rows: RestockInventoryRow[];
};

function fmtNumber(n: number): string {
  return Number.isFinite(n) ? String(Math.trunc(n)) : "0";
}

export function buildRestockPrompt(input: RestockPromptInput): string {
  const scopeLine =
    input.scope === "warehouse"
      ? `Scope: Entire warehouse`
      : `Scope: Floor "${input.floorName ?? "Unknown"}"`;
  const sectionLine = input.sectionLabel ? `Section: ${input.sectionLabel}` : null;

  const header = [
    `Predict restock needs for NEXT WEEK. Warehouse: ${input.warehouseName}, ${scopeLine}${sectionLine ? `, ${sectionLine}` : ""}`,
    "",
    "| Product | Current Stock | Average Weekly Sales |",
    "|---|---:|---:|",
  ].join("\n");

  const tableRows =
    input.rows.length === 0
      ? ["| (none) | 0 | ? |"]
      : input.rows.map((r) => {
          const weekly =
            r.averageWeeklySales == null ? "?" : fmtNumber(r.averageWeeklySales);
          return `| ${r.product} | ${fmtNumber(r.currentStock)} | ${weekly} |`;
        });

  const contextLines = [
    "",
    "Logic (assume 2-week lead-time, 1-week safety stock):",
    "- Calculate required stock: (weekly_sales × 2) + (weekly_sales × 1) = weekly_sales × 3",
    "- If current_stock >= (weekly_sales × 3): NO restock needed (sufficient for lead-time + safety)",
    "- If current_stock < weekly_sales: URGENT (will run out before next week)",
    "- If current_stock < (weekly_sales × 3) AND weekly_sales > 0: RECOMMEND restock",
    "- If weekly_sales = 0 or very low AND stock is high: NO restock (no demand)",
    "- Estimate weekly sales if '?' shown, use provided values otherwise",
    "",
    "CRITICAL RULES:",
    "- ALL products listed in 'Urgent low stock items' MUST also appear in 'Recommended restocks'",
    "- Product names must match EXACTLY from the table above (same spelling, capitalization, spacing)",
    "- Do not modify product names (e.g., 'RedBull' stays 'RedBull', not 'Red Bull')",
    "",
    "Order quantity formula: (weekly_sales × 3) - current_stock",
    "- If result <= 0: DO NOT order (already have enough)",
    "- Round up to nearest 10",
    "- Example: weekly_sales=290, current=340 → (290×3)-340 = 530 units",
    "",
    "Output format:",
    "Urgent low stock items: None OR ProductA, ProductB",
    "",
    "Recommended restocks:",
    "- ProductName: order N units (current: C, weekly sales: W)",
    "",
    "Summary: restock X products, total order quantity T units.",
  ];

  return [header, ...tableRows, ...contextLines].join("\n");
}

