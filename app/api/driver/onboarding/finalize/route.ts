import { requireDriverSession } from "@/app/api/_utils/driver-session";
import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { recomputeDriverVerified } from "@/lib/onboarding/verification";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { driverId } = await requireDriverSession(req.headers);
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


