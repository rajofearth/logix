import { prisma } from "@/lib/prisma";

export async function recomputeDriverVerified(driverId: string): Promise<{
  isVerified: boolean;
}> {
  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
    select: {
      phoneNumberVerified: true,
      isAadharVerified: true,
      isPanCardVerified: true,
      isDriverLicenseVerified: true,
      isVehiclePlateVerified: true,
      isInsuranceVerified: true,
    },
  });

  if (!driver) {
    throw new Error("Driver not found.");
  }

  const isVerified =
    driver.phoneNumberVerified &&
    driver.isAadharVerified &&
    driver.isPanCardVerified &&
    driver.isDriverLicenseVerified &&
    driver.isVehiclePlateVerified &&
    driver.isInsuranceVerified;

  await prisma.verifiedDriver.upsert({
    where: { driverId },
    create: { driverId, isVerified },
    update: { 
      isVerified,
      // Don't update completedAt here - only set it explicitly in finalize route
    },
  });

  return { isVerified };
}


