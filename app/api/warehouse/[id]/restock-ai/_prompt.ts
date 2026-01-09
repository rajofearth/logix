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
    "You are an expert inventory manager for a grocery store.",
    "",
    "Warehouse context:",
    `- Warehouse: ${input.warehouseName}`,
    `- ${scopeLine}`,
    ...(sectionLine ? [`- ${sectionLine}`] : []),
    "",
    "Current inventory:",
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
    "If Average Weekly Sales is shown as '?' in the table, estimate an integer weekly sales value for that product. If a number is provided, use it as-is.",
    "",
    "Hard constraints:",
    "- Only mention products that appear in the inventory table. Do not invent new products.",
    "- In output lines, the (current: <C>) value must match the Current Stock from the table.",
    "",
    "Context (use stock signals; do not use price):",
    ...input.rows.map((r) => {
      const weekly =
        r.averageWeeklySales == null ? ", averageWeeklySales=?" : `, averageWeeklySales=${fmtNumber(r.averageWeeklySales)}`;
      return `- ${r.product}: category=${r.category}, currentStock=${fmtNumber(r.currentStock)}${weekly}`;
    }),
    "",
    "Provide recommendations:",
    "- List products that are low on stock (current stock < weekly sales) as urgent.",
    "- Suggest restocking for products where current stock <= 3 * weekly sales.",
    "- Recommended order quantity: enough to reach 4 weeks of stock, rounded up to nearest 10, minimum one week's sales.",
    "- Provide a summary of total units to order.",
    "",
    "Output format (strict; output only these sections; replace all placeholders with real values; do not output angle brackets):",
    "Urgent low stock items: None",
    "OR",
    "Urgent low stock items: ProductA, ProductB",
    "",
    "Recommended restocks:",
    "- ProductName: order N units (current: C, weekly sales: W)",
    "",
    "Summary: restock X products, total order quantity T units.",
  ];

  return [header, ...tableRows, ...contextLines].join("\n");
}

