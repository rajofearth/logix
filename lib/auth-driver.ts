import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { phoneNumber } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  console.warn("Twilio credentials not configured. Using console logging for OTP.");
}

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export const driverAuth = betterAuth({
  basePath: "/api/auth/driver",
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
  plugins: [
    phoneNumber({
      async sendOTP({ phoneNumber, code }, request) {
        try {
          if (client && accountSid) {
            const message = await client.messages.create({
              body: `Your Logix verification code is: ${code}`,
              from: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
              to: phoneNumber,
            });
            console.log(`[SMS] OTP sent to ${phoneNumber}. Message SID: ${message.sid}`);
          } else {
            console.log(`[DEV] OTP for ${phoneNumber}: ${code}`);
            console.warn("Twilio not configured. OTP logged to console instead of SMS.");
          }
        } catch (error) {
          console.error(`[SMS] Failed to send OTP to ${phoneNumber}:`, error);
          // Don't throw - let the OTP flow continue even if SMS fails
        }
      },
      signUpOnVerification: {
        getTempEmail: (phoneNumber) => {
          return `${phoneNumber.replace(/\D/g, '')}@driver.logix.temp`;
        },
        getTempName: (phoneNumber) => {
          return `Driver ${phoneNumber.slice(-4)}`;
        },
      },
      otpLength: 6,
      expiresIn: 120, // 2 minutes
      allowedAttempts: 5, // Increase from default 3 to prevent 403 during testing
    }),
  ],
});


