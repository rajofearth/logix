import { prisma } from "@/lib/prisma";
import { requireDriverSessionOrPhoneVerified } from "@/app/api/_utils/driver-session";
import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { utapi } from "../_utils";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // Extract phone number and file from form data
    const form = await req.formData();
    const phoneNumber = form.get("phoneNumber")?.toString();
    const file = form.get("file");
    
    if (!file) {
      return jsonError("file is required", 422);
    }
    
    // Handle File (browser) format
    let fileObj: File;
    if (file instanceof File) {
      fileObj = file;
    } else if (typeof file === "object" && "stream" in file) {
      // Handle Blob or other file-like objects (React Native)
      const blob = file as Blob;
      const fileWithName = blob as Blob & { name?: string };
      const fileName = fileWithName.name || "upload";
      fileObj = new File([blob], fileName, { type: blob.type || "application/octet-stream" });
    } else {
      return jsonError("file must be a File or Blob", 422);
    }
    
    // Use lenient auth - allows phone verification fallback for onboarding
    const { driverId } = await requireDriverSessionOrPhoneVerified(
      req.headers,
      phoneNumber
    );

    const result = await utapi.uploadFiles([fileObj]);
    const uploadResult = result[0];
    if (!uploadResult || uploadResult.error || !uploadResult.data) {
      return jsonError(uploadResult?.error?.message ?? "Upload failed", 502);
    }
    const uploaded = uploadResult.data;

    await prisma.driver.update({
      where: { id: driverId },
      data: { driverLicenseFile: uploaded.url, driverLicenseFileKey: uploaded.key },
    });

    return jsonOk({ url: uploaded.url, fileKey: uploaded.key });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg === "Unauthorized") return jsonError("Unauthorized", 401);
    return jsonError(msg, 500);
  }
}


