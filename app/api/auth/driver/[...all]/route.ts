import { driverAuth } from "@/lib/auth-driver";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest } from "next/server";

const handler = toNextJsHandler(driverAuth);

export async function POST(request: NextRequest) {
  const url = request.url;
  const path = new URL(url).pathname;
  
  // Log OTP-related requests
  if (path.includes('phone-number')) {
    try {
      const body = await request.clone().json().catch(() => ({}));
      console.log(`[Better Auth] ${path} request:`, {
        phoneNumber: body.phoneNumber,
        codeLength: body.code?.length,
        hasCode: !!body.code,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.log(`[Better Auth] ${path} request (body parse failed):`, error);
    }
  }

  try {
    const response = await handler.POST(request);
    
    // Log response for OTP verification
    if (path.includes('phone-number/verify')) {
      const status = response.status;
      if (status !== 200) {
        try {
          const responseClone = response.clone();
          const errorData = await responseClone.json().catch(() => ({}));
          console.error(`[Better Auth] OTP verification failed:`, {
            status,
            path,
            error: errorData,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error(`[Better Auth] OTP verification failed (status ${status}):`, error);
        }
      } else {
        console.log(`[Better Auth] OTP verification succeeded:`, {
          path,
          timestamp: new Date().toISOString(),
        });
      }
    }
    
    return response;
  } catch (error) {
    console.error(`[Better Auth] Handler error for ${path}:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}

export async function GET(request: NextRequest) {
  return handler.GET(request);
}


