import { prisma } from "@/lib/prisma";
import { requireDriverSessionOrPhoneVerified } from "@/app/api/_utils/driver-session";
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
    // Extract phone number from query params for lenient auth
    const url = new URL(req.url);
    const phoneNumber = url.searchParams.get("phoneNumber") || undefined;
    
    // Use lenient auth - allows phone verification fallback for onboarding
    const { driverId } = await requireDriverSessionOrPhoneVerified(
      req.headers,
      phoneNumber
    );

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
        // Safely include verifiedDriver relation (may not exist for all drivers)
        verifiedDriver: { 
          select: { isVerified: true } 
        },
      },
    });

    if (!driver) return jsonError("Driver not found", 404);

    const nextStep = computeNextStep(driver);
    
    // Compute isVerified from individual flags if verifiedDriver relation doesn't exist
    // This matches the logic in recomputeDriverVerified
    const isVerifiedFromFlags = 
      driver.phoneNumberVerified &&
      driver.isAadharVerified &&
      driver.isPanCardVerified &&
      driver.isDriverLicenseVerified &&
      driver.isVehiclePlateVerified &&
      driver.isInsuranceVerified;
    
    // Use verifiedDriver relation if available, otherwise compute from flags
    const isVerified = driver.verifiedDriver?.isVerified ?? isVerifiedFromFlags;
    
    return jsonOk({
      step: nextStep,
      phoneNumberVerified: driver.phoneNumberVerified,
      aadhaarVerified: driver.isAadharVerified,
      panVerified: driver.isPanCardVerified,
      driverLicenseVerified: driver.isDriverLicenseVerified,
      vehicleVerified: driver.isVehiclePlateVerified && driver.isInsuranceVerified,
      isVerified,
      // Include driver data for reference
      driver: {
        phoneNumber: driver.phoneNumber,
        aadharNo: driver.aadharNo,
        panCardNo: driver.panCardNo,
        driverLicenseNo: driver.driverLicenseNo,
        vehiclePlateNo: driver.vehiclePlateNo,
        insuranceNo: driver.insuranceNo,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg === "Unauthorized") return jsonError("Unauthorized", 401);
    return jsonError(msg, 500);
  }
}


