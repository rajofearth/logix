import { requireDriverSessionOrPhoneVerified } from "@/app/api/_utils/driver-session";
import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { recomputeDriverVerified } from "@/lib/onboarding/verification";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * Makes all existing sessions for the driver permanent (10 years expiration).
 * This ensures the user stays logged in after completing onboarding.
 */
async function makeSessionsPermanent(driverId: string): Promise<void> {
  // Set expiration to 10 years from now (effectively permanent)
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 10);
  
  // Update all active sessions for this driver to be permanent
  await prisma.session.updateMany({
    where: { 
      userId: driverId,
      expiresAt: { gt: new Date() }, // Only update non-expired sessions
    },
    data: {
      expiresAt,
    },
  });
}

export async function POST(req: Request) {
  try {
    let body: { phoneNumber?: string } = {};
    try {
      body = (await req.json()) as { phoneNumber?: string };
    } catch {
      // Body might be empty, that's okay
    }
    
    // Use lenient auth - allows phone verification fallback for onboarding
    const { driverId } = await requireDriverSessionOrPhoneVerified(
      req.headers,
      body.phoneNumber,
    );
    const { isVerified } = await recomputeDriverVerified(driverId);
    if (!isVerified) {
      return jsonError("Account not fully verified yet.", 409);
    }

    // Make all sessions permanent after successful verification
    await makeSessionsPermanent(driverId);

    // Update VerifiedDriver with completion timestamp (only if not already set)
    await prisma.verifiedDriver.update({
      where: { driverId },
      data: {
        completedAt: new Date(),
      },
    });

    return jsonOk({ isVerified: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[Onboarding finalize] Error:", e);
    if (msg === "Unauthorized" || msg.includes("Unauthorized")) return jsonError("Unauthorized", 401);
    return jsonError(msg, 500);
  }
}


