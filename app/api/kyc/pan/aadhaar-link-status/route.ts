import { prisma } from "@/lib/prisma";
import { sandboxPanAadhaarLinkStatus } from "@/lib/sandbox/kyc";
import { requireDriverSessionOrPhoneVerified } from "@/app/api/_utils/driver-session";
import { jsonError, jsonOk } from "@/app/api/_utils/json";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { phoneNumber?: string };
    
    // Use lenient auth - allows phone verification fallback for onboarding
    const { driverId } = await requireDriverSessionOrPhoneVerified(
      req.headers,
      body.phoneNumber
    );

    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      select: {
        panCardNo: true,
        aadharNo: true,
      },
    });
    if (!driver) return jsonError("Driver not found", 404);
    if (!driver.panCardNo) return jsonError("PAN missing", 409);
    if (!driver.aadharNo) return jsonError("Aadhaar missing", 409);

    const resp = await sandboxPanAadhaarLinkStatus({
      pan: driver.panCardNo,
      aadhaarNumber: driver.aadharNo,
      reason: "For KYC",
    });

    if (!("data" in resp)) return jsonError("Sandbox error", 502);
    const status =
      resp.data.pan_status ??
      resp.data.aadhaar_seeding_status ??
      resp.data.message ??
      "unknown";

    await prisma.driver.update({
      where: { id: driverId },
      data: {
        panAadhaarLinkStatus: String(status),
        panAadhaarLinkCheckedAt: new Date(),
      },
    });

    return jsonOk({ panAadhaarLinkStatus: String(status) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg === "Unauthorized") return jsonError("Unauthorized", 401);
    return jsonError(msg, 500);
  }
}


