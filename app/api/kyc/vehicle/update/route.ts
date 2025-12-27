import { prisma } from "@/lib/prisma";
import { requireDriverSession } from "@/app/api/_utils/driver-session";
import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { recomputeDriverVerified } from "@/lib/onboarding/verification";

export const runtime = "nodejs";

type Body = {
  ownerType?: "self" | "company" | "rented";
  plate?: string;
  insuranceNo?: string;
};

export async function POST(req: Request) {
  try {
    const { driverId } = await requireDriverSession(req.headers);
    const body = (await req.json()) as Body;
    const ownerType = body.ownerType;
    const plate = body.plate?.trim().toUpperCase();
    const insuranceNo = body.insuranceNo?.trim().toUpperCase();

    if (!ownerType) return jsonError("ownerType is required", 422);
    if (!plate) return jsonError("plate is required", 422);
    if (!insuranceNo) return jsonError("insuranceNo is required", 422);

    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      select: { insuranceFileKey: true },
    });
    if (!driver) return jsonError("Driver not found", 404);
    if (!driver.insuranceFileKey) return jsonError("Upload insurance document first", 409);

    await prisma.driver.update({
      where: { id: driverId },
      data: {
        vehicleOwnerType: ownerType,
        vehiclePlateNo: plate,
        isVehiclePlateVerified: true,
        insuranceNo,
        isInsuranceVerified: true,
      },
    });

    const { isVerified } = await recomputeDriverVerified(driverId);
    return jsonOk({
      isVehiclePlateVerified: true,
      isInsuranceVerified: true,
      isVerified,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg === "Unauthorized") return jsonError("Unauthorized", 401);
    return jsonError(msg, 500);
  }
}


