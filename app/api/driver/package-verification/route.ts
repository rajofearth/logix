import { prisma } from "@/lib/prisma";
import { requireDriverSession } from "@/app/api/_utils/driver-session";
import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { utapi } from "../uploads/_utils";
import { notify } from "@/lib/notifications/notify";

export const runtime = "nodejs";

interface PackageVerificationBody {
    jobId: string;
    phase: "pickup" | "delivery";
    damagePercentage: number;
    anomalyDetected: boolean;
    threshold: number;
    heatmapImage?: string; // base64 data URL
}

interface ReactNativeFile {
    uri: string;
    type: string;
    name: string;
}

/**
 * Type guard to check if FormDataEntryValue is a File
 * Uses property checks instead of instanceof to avoid TypeScript errors with union types
 */
function isFile(value: FormDataEntryValue): value is File {
    if (typeof value === "string") return false;
    return (
        typeof value === "object" &&
        value !== null &&
        "name" in value &&
        "size" in value &&
        "type" in value &&
        "lastModified" in value
    );
}

/**
 * Checks if a value is a Blob-like object (but not a File)
 * Returns boolean instead of type predicate since Blob is not part of FormDataEntryValue union
 */
function isBlobLike(value: unknown): value is Blob {
    if (typeof value !== "object" || value === null) return false;
    return (
        "size" in value &&
        "type" in value &&
        "arrayBuffer" in value &&
        !("name" in value && "lastModified" in value) // Not a File
    );
}

/**
 * Converts a file from FormData to a File object that uploadthing can handle.
 * Handles both browser File objects, Blobs (from React Native or server-side), and React Native file objects (with uri property).
 */
async function convertToFile(
    fileInput: FormDataEntryValue,
    phase: "pickup" | "delivery",
    fieldName: string
): Promise<File> {
    // Reject strings (FormDataEntryValue can be File | string)
    if (typeof fileInput === "string") {
        throw new Error(`${fieldName} cannot be a string. Expected File or Blob.`);
    }

    // Browser File object (already a File)
    if (isFile(fileInput)) {
        console.log(`[PackageVerification] ${fieldName}: Browser File detected, name: ${fileInput.name}, size: ${fileInput.size}, type: ${fileInput.type}`);
        return fileInput;
    }

    // Handle Blob objects (from React Native FormData or server-side)
    // Note: FormDataEntryValue is File | string, but in practice we may receive Blob-like objects
    // Cast to unknown first to allow the type guard to work properly
    if (isBlobLike(fileInput as unknown)) {
        const blob = fileInput as unknown as Blob;
        const fileName = (blob as Blob & { name?: string }).name || `package_${phase}_${Date.now()}.jpg`;
        const fileType = blob.type || "image/jpeg";
        
        console.log(`[PackageVerification] ${fieldName}: Blob detected, converting to File, name: ${fileName}, size: ${blob.size}, type: ${fileType}`);
        return new File([blob], fileName, { type: fileType });
    }

    // React Native file format: { uri: string, type: string, name: string }
    // This shouldn't normally happen as React Native FormData should serialize it, but handle it as fallback
    if (typeof fileInput === "object" && fileInput !== null && "uri" in fileInput) {
        const rnFile = fileInput as unknown as ReactNativeFile;
        console.log(`[PackageVerification] ${fieldName}: React Native file object detected (unexpected), uri: ${rnFile.uri}`);

        try {
            // Try to fetch the file from the URI (might fail if it's a local file path)
            const response = await fetch(rnFile.uri);
            if (!response.ok) {
                throw new Error(`Failed to fetch file from URI: ${response.status} ${response.statusText}`);
            }

            const blob = await response.blob();
            const fileName = rnFile.name || `package_${phase}_${Date.now()}.jpg`;
            const fileType = rnFile.type || blob.type || "image/jpeg";

            console.log(`[PackageVerification] ${fieldName}: Converted React Native file object to File, name: ${fileName}, type: ${fileType}`);
            return new File([blob], fileName, { type: fileType });
        } catch (error) {
            console.error(`[PackageVerification] ${fieldName}: Error converting React Native file object:`, error);
            throw new Error(`Failed to convert React Native file: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }

    // Handle objects that might be Blob-like (has stream or arrayBuffer method)
    if (typeof fileInput === "object" && fileInput !== null) {
        // Check if it's a Blob-like object (has stream or arrayBuffer)
        if ("stream" in fileInput || "arrayBuffer" in fileInput || "text" in fileInput) {
            const blob = fileInput as Blob;
            const fileWithName = blob as Blob & { name?: string };
            const fileName = fileWithName.name || `package_${phase}_${Date.now()}.jpg`;
            const fileType = blob.type || "image/jpeg";

            console.log(`[PackageVerification] ${fieldName}: Blob-like object detected, converting to File, name: ${fileName}, type: ${fileType}`);
            return new File([blob], fileName, { type: fileType });
        }
    }

    // Type-safe checks for error logging (avoid instanceof on union types)
    const isObject = typeof fileInput === "object" && fileInput !== null;
    const isFileCheck = isObject && "name" in fileInput && "size" in fileInput && "type" in fileInput;
    const isBlobCheck = isObject && "size" in fileInput && "type" in fileInput;
    
    console.error(`[PackageVerification] ${fieldName}: Unsupported file format:`, {
        type: typeof fileInput,
        isFile: isFileCheck,
        isBlob: isBlobCheck,
        hasUri: isObject && "uri" in fileInput,
        hasStream: isObject && "stream" in fileInput,
    });

    throw new Error(`Unsupported file format for ${fieldName}. Expected File, Blob, or file-like object. Received: ${typeof fileInput}`);
}

/**
 * Validates the package verification metadata
 */
function validateMetadata(body: PackageVerificationBody): { valid: boolean; error?: string } {
    if (!body.jobId || typeof body.jobId !== "string") {
        return { valid: false, error: "jobId is required and must be a string" };
    }

    if (!body.phase || !["pickup", "delivery"].includes(body.phase)) {
        return { valid: false, error: "phase must be 'pickup' or 'delivery'" };
    }

    if (typeof body.damagePercentage !== "number" || isNaN(body.damagePercentage)) {
        return { valid: false, error: "damagePercentage must be a valid number" };
    }

    if (body.damagePercentage < 0 || body.damagePercentage > 100) {
        return { valid: false, error: "damagePercentage must be between 0 and 100" };
    }

    if (typeof body.anomalyDetected !== "boolean") {
        return { valid: false, error: "anomalyDetected must be a boolean" };
    }

    if (typeof body.threshold !== "number" || isNaN(body.threshold)) {
        return { valid: false, error: "threshold must be a valid number" };
    }

    if (body.threshold < 0 || body.threshold > 1) {
        return { valid: false, error: "threshold must be between 0 and 1" };
    }

    return { valid: true };
}

export async function POST(req: Request) {
    try {
        console.log("[PackageVerification] Starting package verification request");
        const { driverId } = await requireDriverSession(req.headers);
        console.log("[PackageVerification] Driver authenticated:", driverId);

        // Parse the multipart form data
        const form = await req.formData();
        const capturedImage = form.get("capturedImage");
        const metadata = form.get("metadata");

        if (!capturedImage) {
            console.error("[PackageVerification] Missing capturedImage in form data");
            return jsonError("capturedImage is required", 422);
        }

        if (!metadata) {
            console.error("[PackageVerification] Missing metadata in form data");
            return jsonError("metadata is required", 422);
        }

        // Parse metadata JSON
        let body: PackageVerificationBody;
        try {
            const metadataString = metadata.toString();
            console.log("[PackageVerification] Parsing metadata:", metadataString.substring(0, 200));
            body = JSON.parse(metadataString) as PackageVerificationBody;
        } catch (parseError) {
            console.error("[PackageVerification] Failed to parse metadata JSON:", parseError);
            return jsonError("Invalid metadata JSON", 422);
        }

        const { jobId, phase, damagePercentage, anomalyDetected, threshold, heatmapImage } = body;

        // Validate metadata
        const validation = validateMetadata(body);
        if (!validation.valid) {
            console.error("[PackageVerification] Metadata validation failed:", validation.error);
            return jsonError(validation.error || "Invalid metadata", 422);
        }

        console.log("[PackageVerification] Metadata validated:", {
            jobId,
            phase,
            damagePercentage,
            anomalyDetected,
            threshold,
            hasHeatmap: !!heatmapImage,
        });

        // Verify job ownership
        console.log("[PackageVerification] Verifying job ownership for jobId:", jobId);
        const job = await prisma.job.findUnique({
            where: { id: jobId },
            select: { id: true, driverId: true, status: true },
        });

        if (!job) {
            console.error("[PackageVerification] Job not found:", jobId);
            return jsonError("Job not found", 404);
        }

        if (job.driverId !== driverId) {
            console.error("[PackageVerification] Job ownership mismatch. Job driverId:", job.driverId, "Request driverId:", driverId);
            return jsonError("Job does not belong to this driver", 403);
        }

        console.log("[PackageVerification] Job ownership verified");

        // Check if verification already exists for this phase
        const existingVerification = await prisma.packageVerification.findFirst({
            where: { jobId, phase },
        });

        if (existingVerification) {
            console.log("[PackageVerification] Existing verification found, will update:", existingVerification.id);
        } else {
            console.log("[PackageVerification] No existing verification, will create new");
        }

        // Convert captured image to File
        console.log("[PackageVerification] Converting captured image to File");
        let capturedImageFile: File;
        try {
            capturedImageFile = await convertToFile(capturedImage, phase, "capturedImage");
        } catch (conversionError) {
            console.error("[PackageVerification] Failed to convert captured image:", conversionError);
            return jsonError(
                conversionError instanceof Error ? conversionError.message : "Failed to process captured image",
                422
            );
        }

        // Upload captured image
        console.log("[PackageVerification] Uploading captured image to uploadthing");
        let capturedResult;
        try {
            const capturedUploadResult = await utapi.uploadFiles([capturedImageFile]);
            capturedResult = capturedUploadResult[0];
            
            if (!capturedResult || capturedResult.error || !capturedResult.data) {
                const errorMsg = capturedResult?.error?.message ?? "Captured image upload failed";
                console.error("[PackageVerification] Captured image upload failed:", errorMsg, capturedResult?.error);
                return jsonError(errorMsg, 502);
            }

            console.log("[PackageVerification] Captured image uploaded successfully:", {
                key: capturedResult.data.key,
                url: capturedResult.data.ufsUrl,
            });
        } catch (uploadError) {
            console.error("[PackageVerification] Exception during captured image upload:", uploadError);
            return jsonError(
                uploadError instanceof Error ? uploadError.message : "Failed to upload captured image",
                502
            );
        }

        // Upload heatmap image if provided
        let heatmapImageUrl: string | null = null;
        let heatmapImageKey: string | null = null;

        if (heatmapImage && heatmapImage.startsWith("data:image")) {
            console.log("[PackageVerification] Heatmap image provided, uploading");
            try {
                // Convert base64 to File
                const base64Data = heatmapImage.split(",")[1];
                if (!base64Data) {
                    throw new Error("Invalid base64 data URL format");
                }

                const buffer = Buffer.from(base64Data, "base64");
                const heatmapFile = new File(
                    [buffer],
                    `heatmap_${phase}_${Date.now()}.png`,
                    { type: "image/png" }
                );

                console.log("[PackageVerification] Uploading heatmap image to uploadthing");
                const heatmapUploadResult = await utapi.uploadFiles([heatmapFile]);
                const heatmapResult = heatmapUploadResult[0];
                
                if (heatmapResult && !heatmapResult.error && heatmapResult.data) {
                    heatmapImageUrl = heatmapResult.data.ufsUrl;
                    heatmapImageKey = heatmapResult.data.key;
                    console.log("[PackageVerification] Heatmap image uploaded successfully:", {
                        key: heatmapImageKey,
                        url: heatmapImageUrl,
                    });
                } else {
                    console.warn("[PackageVerification] Heatmap upload returned error:", heatmapResult?.error);
                }
            } catch (e) {
                // Log but don't fail if heatmap upload fails (it's optional)
                console.error("[PackageVerification] Heatmap upload error (non-fatal):", e);
            }
        } else {
            console.log("[PackageVerification] No heatmap image provided");
        }

        // Determine if verification passed (damage below threshold for pickup)
        const damageThreshold = 30; // 30% threshold for pickup
        const passed = phase === "pickup" ? damagePercentage <= damageThreshold : true;

        console.log("[PackageVerification] Verification result:", {
            phase,
            damagePercentage,
            damageThreshold,
            passed,
            anomalyDetected,
            threshold,
        });

        let verification;

        // Prepare data for database save
        const verificationData = {
            capturedImageUrl: capturedResult.data.ufsUrl,
            capturedImageKey: capturedResult.data.key,
            damagePercentage,
            anomalyDetected,
            threshold,
            heatmapImageUrl,
            heatmapImageKey,
            passed,
        };

        console.log("[PackageVerification] Saving verification data to database:", {
            ...verificationData,
            jobId,
            phase,
        });

        try {
            if (existingVerification) {
                // Delete old images from storage (fire-and-forget)
                const keysToDelete = [
                    existingVerification.capturedImageKey,
                    existingVerification.heatmapImageKey,
                ].filter((key): key is string => Boolean(key));

                if (keysToDelete.length > 0) {
                    console.log("[PackageVerification] Deleting old images:", keysToDelete);
                    utapi.deleteFiles(keysToDelete).catch((deleteError) => {
                        console.error("[PackageVerification] Error deleting old images (non-fatal):", deleteError);
                    });
                }

                // Update existing verification
                console.log("[PackageVerification] Updating existing verification:", existingVerification.id);
                verification = await prisma.packageVerification.update({
                    where: { id: existingVerification.id },
                    data: {
                        ...verificationData,
                    },
                });
                console.log("[PackageVerification] Verification updated successfully:", verification.id);
            } else {
                // Create new verification record
                console.log("[PackageVerification] Creating new verification record");
                verification = await prisma.packageVerification.create({
                    data: {
                        jobId,
                        phase,
                        ...verificationData,
                    },
                });
                console.log("[PackageVerification] Verification created successfully:", verification.id);
            }
        } catch (dbError) {
            console.error("[PackageVerification] Database save failed:", dbError);
            // Try to clean up uploaded images if database save fails
            try {
                const keysToCleanup = [capturedResult.data.key, heatmapImageKey].filter(
                    (key): key is string => Boolean(key)
                );
                if (keysToCleanup.length > 0) {
                    console.log("[PackageVerification] Cleaning up uploaded images due to DB error");
                    await utapi.deleteFiles(keysToCleanup);
                }
            } catch (cleanupError) {
                console.error("[PackageVerification] Cleanup failed:", cleanupError);
            }
            throw new Error(`Failed to save verification to database: ${dbError instanceof Error ? dbError.message : "Unknown error"}`);
        }

        // Fire-and-forget admin notification (do not block driver flow)
        try {
            console.log("[PackageVerification] Sending notification");
            await notify.packageVerificationSubmitted({
                jobId,
                phase,
                passed,
                damagePercentage,
            });
            console.log("[PackageVerification] Notification sent successfully");
        } catch (e) {
            console.error("[PackageVerification] Notification error (non-fatal):", e);
        }

        console.log("[PackageVerification] Request completed successfully:", {
            verificationId: verification.id,
            passed,
            damagePercentage,
        });

        return jsonOk({
            success: true,
            verificationId: verification.id,
            passed,
            damagePercentage,
        });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        console.error("[PackageVerification] Request failed:", {
            error: msg,
            stack: e instanceof Error ? e.stack : undefined,
        });
        
        if (msg === "Unauthorized") {
            return jsonError("Unauthorized", 401);
        }
        
        return jsonError(msg, 500);
    }
}
