import { prisma } from "@/lib/prisma";
import { sandboxAadhaarGenerateOtp } from "@/lib/sandbox/kyc";
import { requireDriverSession } from "@/app/api/_utils/driver-session";
import { jsonError, jsonOk } from "@/app/api/_utils/json";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { driverId } = await requireDriverSession(req.headers);
    const body = (await req.json()) as { aadhaarNumber?: string };

    const aadhaarNumber = body.aadhaarNumber?.trim();
    if (!aadhaarNumber) return jsonError("aadhaarNumber is required", 422);

    // Require Aadhaar doc upload before OTP (keeps flow consistent)
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      select: { aadharCardFileKey: true, isAadharVerified: true },
    });
    if (!driver) return jsonError("Driver not found", 404);
    if (driver.isAadharVerified) return jsonOk({ alreadyVerified: true });
    if (!driver.aadharCardFileKey) return jsonError("Upload Aadhaar document first", 409);

    const resp = await sandboxAadhaarGenerateOtp({
      aadhaarNumber,
      reason: "For KYC of the Individual",
    });

    if (!("data" in resp)) return jsonError("Sandbox error", 502);
    const referenceId = String(resp.data.reference_id);

    await prisma.driver.update({
      where: { id: driverId },
      data: {
        aadharNo: aadhaarNumber,
        aadhaarOtpReferenceId: referenceId,
        aadhaarOtpGeneratedAt: new Date(),
      },
    });

    return jsonOk({ referenceId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg === "Unauthorized") return jsonError("Unauthorized", 401);
    return jsonError(msg, 500);
  }
}


