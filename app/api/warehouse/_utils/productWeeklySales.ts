import { prisma } from "@/lib/prisma";

let cached: boolean | null = null;
let inFlight: Promise<boolean> | null = null;

/**
 * Returns true if the database has the `products.average_weekly_sales` column.
 * This allows the codebase to be deployed without migrations and still not crash,
 * while giving a clear error when trying to write weekly sales before `db push`.
 */
export async function hasAverageWeeklySalesColumn(): Promise<boolean> {
  if (cached !== null) return cached;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const rows = await prisma.$queryRaw<
        Array<{ exists: boolean }>
      >`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'products'
            AND column_name = 'average_weekly_sales'
        ) AS "exists"
      `;
      const exists = Boolean(rows[0]?.exists);
      cached = exists;
      return exists;
    } catch {
      // If we cannot check, assume missing to avoid selecting a non-existent column.
      cached = false;
      return false;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

