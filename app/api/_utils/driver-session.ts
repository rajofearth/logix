import { driverAuth } from "@/lib/auth-driver";
import { prisma } from "@/lib/prisma";

export async function requireDriverSession(headers: Headers): Promise<{
  driverId: string;
  phoneNumberVerified?: boolean;
}> {
  const session = await driverAuth.api.getSession({ headers });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return {
    driverId: session.user.id,
    // better-auth user shape can vary by config; we only read optional fields
    phoneNumberVerified: (session.user as { phoneNumberVerified?: boolean }).phoneNumberVerified,
  };
}

/**
 * More lenient auth for onboarding endpoints.
 * Tries normal session first, then falls back to phone verification if session expired.
 * This allows users to resume onboarding even if their session expired, as long as their phone is verified.
 */
export async function requireDriverSessionOrPhoneVerified(
  headers: Headers,
  phoneNumber?: string
): Promise<{ driverId: string; phoneNumberVerified: boolean }> {
  // Try normal session first
  try {
    const session = await driverAuth.api.getSession({ headers });
    if (session?.user?.id) {
      return {
        driverId: session.user.id,
        phoneNumberVerified: (session.user as { phoneNumberVerified?: boolean }).phoneNumberVerified ?? false,
      };
    }
  } catch (e) {
    // Session invalid, try phone verification fallback
    console.log("[Auth] Session invalid, trying phone verification fallback");
  }

  // If no session, check phone verification
  if (!phoneNumber) {
    throw new Error("Unauthorized - session expired and no phone number provided");
  }

  // Normalize phone number (ensure it starts with +)
  const normalizedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber}`;

  const driver = await prisma.driver.findUnique({
    where: { phoneNumber: normalizedPhone },
    select: { id: true, phoneNumberVerified: true },
  });

  if (!driver) {
    throw new Error("Unauthorized - driver not found with provided phone number");
  }

  if (!driver.phoneNumberVerified) {
    throw new Error("Unauthorized - phone number not verified");
  }

  console.log(`[Auth] Phone verification successful for driver ${driver.id}`);

  return {
    driverId: driver.id,
    phoneNumberVerified: true,
  };
}


