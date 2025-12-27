import { prisma } from "@/lib/prisma";
import { requireDriverSessionOrPhoneVerified } from "@/app/api/_utils/driver-session";
import { jsonError, jsonOk } from "@/app/api/_utils/json";

export const runtime = "nodejs";

/**
 * POST /api/driver/update-name
 * Update driver's name
 * - Request JSON: { name: string, phoneNumber?: string }
 * - Auth: prefers driver session, falls back to verified phoneNumber for onboarding
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { name?: string; phoneNumber?: string };
    
    // Use lenient auth - allows phone verification fallback for onboarding
    const { driverId } = await requireDriverSessionOrPhoneVerified(
      req.headers,
      body.phoneNumber
    );
    
    const name = body.name?.trim();
    if (!name) {
      return jsonError("name is required", 422);
    }
    
    // Validate name length (reasonable limits)
    if (name.length < 2) {
      return jsonError("Name must be at least 2 characters", 422);
    }
    if (name.length > 100) {
      return jsonError("Name must be at most 100 characters", 422);
    }

    await prisma.driver.update({
      where: { id: driverId },
      data: { name },
    });

    return jsonOk({ name, updated: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg === "Unauthorized") return jsonError("Unauthorized", 401);
    return jsonError(msg, 500);
  }
}

