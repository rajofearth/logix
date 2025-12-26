import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";

export const driverAuth = betterAuth({
  advanced: {
    cookiePrefix: "driver-auth",
    database: {
      generateId: () => randomUUID(),
    },
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    modelName: "Driver",
  },
  session: {
    modelName: "Session",
  },
  account: {
    modelName: "Account",
  },
  verification: {
    modelName: "Verification",
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
});


