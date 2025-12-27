import { prisma } from "@/lib/prisma";
import { sandboxAadhaarVerifyOtp } from "@/lib/sandbox/kyc";
import { requireDriverSessionOrPhoneVerified } from "@/app/api/_utils/driver-session";
import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { recomputeDriverVerified } from "@/lib/onboarding/verification";

export const runtime = "nodejs";

function parseDdMmYyyy(dateStr: string): Date | null {
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(dateStr);
  if (!m) return null;
  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  const d = new Date(Date.UTC(yyyy, mm - 1, dd));
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { otp?: string; phoneNumber?: string };
    
    // Use lenient auth - allows phone verification fallback for onboarding
    const { driverId } = await requireDriverSessionOrPhoneVerified(
      req.headers,
      body.phoneNumber
    );
    const otp = body.otp?.trim();
    if (!otp) return jsonError("otp is required", 422);

    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      select: {
        aadharNo: true,
        aadhaarOtpReferenceId: true,
        isAadharVerified: true,
      },
    });
    if (!driver) return jsonError("Driver not found", 404);
    if (driver.isAadharVerified) return jsonOk({ alreadyVerified: true });
    if (!driver.aadhaarOtpReferenceId) {
      return jsonError("Aadhaar OTP not generated. Call generate-otp first.", 409);
    }

    const resp = await sandboxAadhaarVerifyOtp({
      referenceId: driver.aadhaarOtpReferenceId,
      otp,
    });
    if (!("data" in resp)) return jsonError("Sandbox error", 502);

    const name = resp.data.name?.trim();
    const dobStr = resp.data.date_of_birth?.trim();
    const dob = dobStr ? parseDdMmYyyy(dobStr) : null;

    await prisma.driver.update({
      where: { id: driverId },
      data: {
        isAadharVerified: true,
        // clear reference once verified
        aadhaarOtpReferenceId: null,
        aadhaarOtpGeneratedAt: null,
        ...(name ? { name } : {}),
        ...(dob ? { dob } : {}),
      },
    });

    const { isVerified } = await recomputeDriverVerified(driverId);
    return jsonOk({ isAadharVerified: true, isVerified });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg === "Unauthorized") return jsonError("Unauthorized", 401);
    return jsonError(msg, 500);
  }
}


