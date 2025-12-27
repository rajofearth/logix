import { prisma } from "@/lib/prisma";
import { requireDriverSessionOrPhoneVerified } from "@/app/api/_utils/driver-session";
import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { recomputeDriverVerified } from "@/lib/onboarding/verification";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    let body: { drivingLicenseNo?: string; phoneNumber?: string } = {};
    try {
      body = (await req.json()) as { drivingLicenseNo?: string; phoneNumber?: string };
    } catch (e) {
      return jsonError("Invalid JSON body", 400);
    }
    
    // Use lenient auth - allows phone verification fallback for onboarding
    const { driverId } = await requireDriverSessionOrPhoneVerified(
      req.headers,
      body.phoneNumber,
    );
    const drivingLicenseNo = body.drivingLicenseNo?.trim()?.toUpperCase();
    if (!drivingLicenseNo) return jsonError("drivingLicenseNo is required", 422);

    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      select: { driverLicenseFileKey: true },
    });
    if (!driver) return jsonError("Driver not found", 404);
    if (!driver.driverLicenseFileKey) return jsonError("Upload driving license document first", 409);

    await prisma.driver.update({
      where: { id: driverId },
      data: {
        driverLicenseNo: drivingLicenseNo,
        isDriverLicenseVerified: true,
      },
    });

    const { isVerified } = await recomputeDriverVerified(driverId);
    return jsonOk({ isDriverLicenseVerified: true, isVerified });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[DL fake-verify] Error:", e);
    if (msg === "Unauthorized" || msg.includes("Unauthorized")) return jsonError("Unauthorized", 401);
    return jsonError(msg, 500);
  }
}


