import { prisma } from "@/lib/prisma";
import { sandboxAadhaarGenerateOtp } from "@/lib/sandbox/kyc";
import { requireDriverSessionOrPhoneVerified } from "@/app/api/_utils/driver-session";
import { jsonError, jsonOk } from "@/app/api/_utils/json";
import type { SandboxSuccess } from "@/lib/sandbox/types";
import type { AadhaarGenerateOtpResponseData } from "@/lib/sandbox/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { aadhaarNumber?: string; phoneNumber?: string };
    
    // Use lenient auth - allows phone verification fallback for onboarding
    const { driverId } = await requireDriverSessionOrPhoneVerified(
      req.headers,
      body.phoneNumber
    );

    const aadhaarNumber = body.aadhaarNumber?.trim();
    if (!aadhaarNumber) return jsonError("aadhaarNumber is required", 422);

    // Require Aadhaar doc upload before OTP (keeps flow consistent)
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      select: { aadharCardFileKey: true, isAadharVerified: true },
    });
    if (!driver) return jsonError("Driver not found", 404);
    if (driver.isAadharVerified) return jsonOk({ alreadyVerified: true });
    if (!driver.aadharCardFileKey) return jsonError("Upload Aadhaar document first", 409);

    console.log("[Generate OTP] Calling sandbox API with aadhaarNumber:", aadhaarNumber.replace(/\d(?=\d{4})/g, '*'));
    
    let resp;
    try {
      resp = await sandboxAadhaarGenerateOtp({
        aadhaarNumber,
        reason: "For KYC of the Individual",
      });
      console.log("[Generate OTP] Sandbox response received:", {
        hasData: "data" in resp,
        hasMessage: "message" in resp,
        responseKeys: Object.keys(resp),
        fullResponse: JSON.stringify(resp, null, 2),
      });
    } catch (sandboxError) {
      console.error("[Generate OTP] Sandbox API call failed:", sandboxError);
      const errorMsg = sandboxError instanceof Error ? sandboxError.message : String(sandboxError);
      return jsonError(`Sandbox API error: ${errorMsg}`, 502);
    }

    // Check if response is an error (has message but no data)
    if ("message" in resp && !("data" in resp)) {
      console.error("[Generate OTP] Sandbox error response:", JSON.stringify(resp, null, 2));
      const errorMsg = typeof resp.message === "string" ? resp.message : "Unknown sandbox error";
      return jsonError(`Sandbox error: ${errorMsg}`, 502);
    }
    
    if (!("data" in resp)) {
      console.error("[Generate OTP] Unexpected response structure:", JSON.stringify(resp, null, 2));
      return jsonError("Unexpected response structure from sandbox", 502);
    }
    
    // Type guard: resp is now SandboxSuccess<AadhaarGenerateOtpResponseData>
    const successResp = resp as SandboxSuccess<AadhaarGenerateOtpResponseData>;
    const referenceId = successResp.data.reference_id;
    if (referenceId === undefined || referenceId === null) {
      console.error("[Generate OTP] Missing reference_id in response:", JSON.stringify(successResp.data, null, 2));
      return jsonError("Invalid response from sandbox - missing reference_id", 502);
    }

    const referenceIdStr = String(referenceId);
    console.log("[Generate OTP] Updating driver with referenceId:", referenceIdStr);

    try {
      await prisma.driver.update({
        where: { id: driverId },
        data: {
          aadharNo: aadhaarNumber,
          aadhaarOtpReferenceId: referenceIdStr,
          aadhaarOtpGeneratedAt: new Date(),
        },
      });
      console.log("[Generate OTP] Successfully updated driver:", driverId);
    } catch (dbError) {
      console.error("[Generate OTP] Database update failed:", dbError);
      const dbErrorMsg = dbError instanceof Error ? dbError.message : String(dbError);
      return jsonError(`Failed to update driver: ${dbErrorMsg}`, 500);
    }

    console.log("[Generate OTP] Successfully generated OTP for driver:", driverId);
    return jsonOk({ referenceId: referenceIdStr });
  } catch (e) {
    console.error("[Generate OTP] Error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    const stack = e instanceof Error ? e.stack : undefined;
    console.error("[Generate OTP] Error stack:", stack);
    
    if (msg === "Unauthorized" || msg.includes("Unauthorized")) {
      return jsonError("Unauthorized", 401);
    }
    
    // Return more detailed error for debugging
    return jsonError(
      `Failed to generate OTP: ${msg}${stack ? ` - ${stack.substring(0, 200)}` : ""}`,
      500
    );
  }
}


