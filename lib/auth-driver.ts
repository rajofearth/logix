import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { expo } from "@better-auth/expo"
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
  trustedOrigins: ["loctracker://"], // Use the specific scheme for the mobile app
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
    // Make driver sessions long-lived (max allowed by cookie spec: 400 days) and auto-refreshed.
    // Values are in seconds.
    expiresIn: 60 * 60 * 24 * 400, // 400 days (max cookie Max-Age allowed)
    updateAge: 60 * 60 * 24, // refresh expiry after 1 day of use
  },
  account: {
    modelName: "Account",
  },
  verification: {
    modelName: "Verification",
  },
  plugins: [
    expo(),
    phoneNumber({
      async sendOTP({ phoneNumber, code }, request) {
        console.log(`[Better Auth] sendOTP called:`, {
          phoneNumber,
          codeLength: code.length,
          timestamp: new Date().toISOString(),
        });
        
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
      expiresIn: 60, // 1 minute - short for testing, increase for production
      allowedAttempts: 10, // High limit for testing
    }),
  ],
});


