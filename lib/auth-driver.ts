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
            // Send SMS with the actual OTP code using Twilio Messaging API
            const message = await client.messages.create({
              body: `Your verification code is: ${code}`,
              from: process.env.TWILIO_PHONE_NUMBER || '+1234567890', // You'll need to set this
              to: phoneNumber,
            });

            console.log(`[SMS] OTP sent to ${phoneNumber}. Message SID: ${message.sid}`);
          } else {
            // Fallback: log to console for development
            console.log(`[DEV] OTP for ${phoneNumber}: ${code}`);
            console.warn("Twilio not configured. OTP logged to console instead of SMS.");
          }
        } catch (error) {
          console.error(`[SMS] Failed to send OTP to ${phoneNumber}:`, error);
          throw new Error("Failed to send SMS verification code");
        }
      },
      otpLength: 6,
      expiresIn: 300, // 5 minutes
    }),
  ],
});


