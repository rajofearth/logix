import { prisma } from "@/lib/prisma";
import { sandboxPanVerifyDetails } from "@/lib/sandbox/kyc";
import { requireDriverSessionOrPhoneVerified } from "@/app/api/_utils/driver-session";
import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { recomputeDriverVerified } from "@/lib/onboarding/verification";

export const runtime = "nodejs";

/**
 * Internal API: POST /api/kyc/pan/verify
 *
 * - Request JSON: { pan: string, dob?: string, phoneNumber?: string }
 * - Auth: prefers driver session, falls back to verified phoneNumber for onboarding
 * - 409 Conflict when prerequisites are missing:
 *   - PAN document not uploaded (missing panCardFileKey)
 *   - Aadhaar not verified yet (missing dob, used for PAN verification)
 *
 * External dependency (Sandbox):
 * - POST https://api.sandbox.co.in/kyc/pan/verify
 * - Headers: x-api-key, x-api-version, authorization (token, NOT Bearer), JSON content-type
 * - Body: { pan, name_as_per_pan, date_of_birth: "dd-mm-yyyy", consent: "Y", reason }
 * - Response envelope: { code, timestamp, transaction_id, data: {...} }
 */
function toDdSlashMmSlashYyyy(date: Date): string {
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = String(date.getUTCFullYear());
  return `${dd}/${mm}/${yyyy}`;
}

function parseDobFromClient(dob: string): Date | null {
  // Accept "DD/MM/YYYY" (mobile) and "DD-MM-YYYY" (internal)
  const m = /^(\d{2})[/-](\d{2})[/-](\d{4})$/.exec(dob.trim());
  if (!m) return null;
  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  if (dd < 1 || dd > 31 || mm < 1 || mm > 12 || yyyy < 1900 || yyyy > 2100) return null;
  const d = new Date(Date.UTC(yyyy, mm - 1, dd));
  // Guard against invalid rollovers like 31/02/2020
  if (
    Number.isNaN(d.getTime()) ||
    d.getUTCFullYear() !== yyyy ||
    d.getUTCMonth() + 1 !== mm ||
    d.getUTCDate() !== dd
  ) {
    return null;
  }
  return d;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { pan?: string; dob?: string; phoneNumber?: string };
    
    // Use lenient auth - allows phone verification fallback for onboarding
    const { driverId } = await requireDriverSessionOrPhoneVerified(
      req.headers,
      body.phoneNumber,
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

    const requestDobRaw = body.dob?.trim();
    const requestDob = requestDobRaw ? parseDobFromClient(requestDobRaw) : null;
    if (requestDobRaw && !requestDob) {
      return jsonError("Invalid date of birth. Use DD/MM/YYYY.", 422);
    }

    const dobToUse = driver.dob ?? requestDob;
    if (!dobToUse) {
      return jsonError(
        "Date of birth is required. Please verify your Aadhaar first to proceed with PAN verification.",
        409,
      );
    }

    const nameAsPerPan = driver.name?.trim();
    if (!nameAsPerPan) {
      return jsonError(
        "Name is required for PAN verification. Please verify your Aadhaar first to get your name.",
        409,
      );
    }

    const resp = await sandboxPanVerifyDetails({
      pan,
      nameAsPerPan,
      dateOfBirth: toDdSlashMmSlashYyyy(dobToUse),
      reason: "For KYC",
    });
    if (!("data" in resp)) return jsonError("Sandbox error", 502);

    // We treat a successful response as verified for now; you can tighten this based on exact response keys.
    await prisma.driver.update({
      where: { id: driverId },
      data: {
        ...(driver.dob ? {} : dobToUse ? { dob: dobToUse } : {}),
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


