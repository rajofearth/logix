import { driverAuth } from "@/lib/auth-driver";

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


