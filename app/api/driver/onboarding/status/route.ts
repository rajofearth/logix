import { prisma } from "@/lib/prisma";
import { requireDriverSession } from "@/app/api/_utils/driver-session";
import { jsonError, jsonOk } from "@/app/api/_utils/json";

export const runtime = "nodejs";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

function computeNextStep(d: {
  phoneNumberVerified: boolean;
  isAadharVerified: boolean;
  isPanCardVerified: boolean;
  isDriverLicenseVerified: boolean;
  isVehiclePlateVerified: boolean;
  isInsuranceVerified: boolean;
}): Step {
  if (!d.phoneNumberVerified) return 2;
  if (!d.isAadharVerified || !d.isPanCardVerified) return 3;
  if (!d.isDriverLicenseVerified) return 4;
  if (!d.isVehiclePlateVerified || !d.isInsuranceVerified) return 5;
  return 6;
}

export async function GET(req: Request) {
  try {
    const { driverId } = await requireDriverSession(req.headers);

    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      select: {
        id: true,
        name: true,
        dob: true,
        phoneNumber: true,
        phoneNumberVerified: true,
        aadharNo: true,
        isAadharVerified: true,
        aadharCardFileKey: true,
        panCardNo: true,
        isPanCardVerified: true,
        panCardFileKey: true,
        driverLicenseNo: true,
        isDriverLicenseVerified: true,
        driverLicenseFileKey: true,
        vehicleOwnerType: true,
        vehiclePlateNo: true,
        isVehiclePlateVerified: true,
        insuranceNo: true,
        isInsuranceVerified: true,
        insuranceFileKey: true,
        verifiedDriver: { select: { isVerified: true } },
      },
    });

    if (!driver) return jsonError("Driver not found", 404);

    const nextStep = computeNextStep(driver);
    return jsonOk({
      driver,
      nextStep,
      isAccountVerified: driver.verifiedDriver?.isVerified ?? false,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg === "Unauthorized") return jsonError("Unauthorized", 401);
    return jsonError(msg, 500);
  }
}


