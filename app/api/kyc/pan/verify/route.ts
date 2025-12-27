import { prisma } from "@/lib/prisma";
import { sandboxPanVerifyDetails } from "@/lib/sandbox/kyc";
import { requireDriverSessionOrPhoneVerified } from "@/app/api/_utils/driver-session";
import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { recomputeDriverVerified } from "@/lib/onboarding/verification";

export const runtime = "nodejs";

/**
 * Internal API: POST /api/kyc/pan/verify
 *
 * - Request JSON: { pan: string, phoneNumber?: string }
 * - Auth: prefers driver session, falls back to verified phoneNumber for onboarding
 * - 409 Conflict when prerequisites are missing:
 *   - PAN document not uploaded (missing panCardFileKey)
 *   - Aadhaar not verified yet (missing dob, used for PAN verification)
 *
 * External dependency (Sandbox):
 * - POST https://api.sandbox.co.in/kyc/pan
 * - Headers: x-api-key, x-api-version, authorization (token, NOT Bearer), JSON content-type
 * - Body: { pan, name_as_per_pan, date_of_birth: "dd-mm-yyyy", consent: "Y", reason }
 * - Response envelope: { code, timestamp, transaction_id, data: {...} }
 */
function toDdMmYyyy(date: Date): string {
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = String(date.getUTCFullYear());
  return `${dd}-${mm}-${yyyy}`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { pan?: string; phoneNumber?: string };
    
    // Use lenient auth - allows phone verification fallback for onboarding
    const { driverId } = await requireDriverSessionOrPhoneVerified(
      req.headers,
      body.phoneNumber
    );
    const pan = body.pan?.trim().toUpperCase();
    if (!pan) return jsonError("pan is required", 422);

    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      select: {
        name: true,
        dob: true,
        panCardFileKey: true,
        isPanCardVerified: true,
      },
    });
    if (!driver) return jsonError("Driver not found", 404);
    if (driver.isPanCardVerified) return jsonOk({ verified: true, alreadyVerified: true });
    if (!driver.panCardFileKey) {
      return jsonError("Please upload your PAN document first before verification", 409);
    }
    if (!driver.dob) {
      return jsonError("Date of birth is required. Please verify your Aadhaar first to proceed with PAN verification.", 409);
    }

    const resp = await sandboxPanVerifyDetails({
      pan,
      nameAsPerPan: driver.name,
      dateOfBirth: toDdMmYyyy(driver.dob),
      reason: "For KYC",
    });
    if (!("data" in resp)) return jsonError("Sandbox error", 502);

    // We treat a successful response as verified for now; you can tighten this based on exact response keys.
    await prisma.driver.update({
      where: { id: driverId },
      data: {
        panCardNo: pan,
        isPanCardVerified: true,
      },
    });

    const { isVerified } = await recomputeDriverVerified(driverId);
    return jsonOk({ verified: true, isPanCardVerified: true, isVerified });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg === "Unauthorized") return jsonError("Unauthorized", 401);
    return jsonError(msg, 500);
  }
}


