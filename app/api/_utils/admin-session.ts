import { auth } from "@/lib/auth";

export async function requireAdminSession(headers: Headers): Promise<{
  adminUserId: string;
}> {
  const session = await auth.api.getSession({ headers });
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return { adminUserId: session.user.id };
}


