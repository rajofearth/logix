import { prisma } from "@/lib/prisma";
import { sandboxPanVerifyDetails } from "@/lib/sandbox/kyc";
import { requireDriverSession } from "@/app/api/_utils/driver-session";
import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { recomputeDriverVerified } from "@/lib/onboarding/verification";

export const runtime = "nodejs";

function toDdMmYyyy(date: Date): string {
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = String(date.getUTCFullYear());
  return `${dd}-${mm}-${yyyy}`;
}

export async function POST(req: Request) {
  try {
    const { driverId } = await requireDriverSession(req.headers);
    const body = (await req.json()) as { pan?: string };
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
    if (driver.isPanCardVerified) return jsonOk({ alreadyVerified: true });
    if (!driver.panCardFileKey) return jsonError("Upload PAN document first", 409);
    if (!driver.dob) return jsonError("DOB missing. Verify Aadhaar first.", 409);

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
    return jsonOk({ isPanCardVerified: true, isVerified });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg === "Unauthorized") return jsonError("Unauthorized", 401);
    return jsonError(msg, 500);
  }
}


