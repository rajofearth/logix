import { requireDriverSessionOrPhoneVerified } from "@/app/api/_utils/driver-session";
import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { recomputeDriverVerified } from "@/lib/onboarding/verification";

export const runtime = "nodejs";

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
    return jsonOk({ isVerified: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg === "Unauthorized") return jsonError("Unauthorized", 401);
    return jsonError(msg, 500);
  }
}


