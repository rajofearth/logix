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

export async function POST(req: Request) {
    try {
        const { driverId } = await requireDriverSession(req.headers);

        // Parse the multipart form data
        const form = await req.formData();
        const capturedImage = form.get("capturedImage");
        const metadata = form.get("metadata");

        if (!capturedImage) {
            return jsonError("capturedImage is required", 422);
        }

        if (!metadata) {
            return jsonError("metadata is required", 422);
        }

        // Parse metadata JSON
        let body: PackageVerificationBody;
        try {
            body = JSON.parse(metadata.toString()) as PackageVerificationBody;
        } catch {
            return jsonError("Invalid metadata JSON", 422);
        }

        const { jobId, phase, damagePercentage, anomalyDetected, threshold, heatmapImage } = body;

        if (!jobId || !phase) {
            return jsonError("jobId and phase are required", 422);
        }

        if (!["pickup", "delivery"].includes(phase)) {
            return jsonError("phase must be 'pickup' or 'delivery'", 422);
        }

        // Verify job ownership
        const job = await prisma.job.findUnique({
            where: { id: jobId },
            select: { id: true, driverId: true, status: true },
        });

        if (!job) {
            return jsonError("Job not found", 404);
        }

        if (job.driverId !== driverId) {
            return jsonError("Job does not belong to this driver", 403);
        }

        // Check if verification already exists for this phase
        const existingVerification = await prisma.packageVerification.findFirst({
            where: { jobId, phase },
        });

        if (existingVerification) {
            return jsonError(`Verification for ${phase} phase already exists`, 400);
        }

        // Convert captured image to File
        let capturedImageFile: File;
        if (capturedImage instanceof File) {
            capturedImageFile = capturedImage;
        } else if (typeof capturedImage === "object" && "stream" in capturedImage) {
            const blob = capturedImage as Blob;
            const fileWithName = blob as Blob & { name?: string };
            const fileName = fileWithName.name || `package_${phase}_${Date.now()}.jpg`;
            capturedImageFile = new File([blob], fileName, { type: blob.type || "image/jpeg" });
        } else {
            return jsonError("capturedImage must be a File or Blob", 422);
        }

        // Upload captured image
        const capturedUploadResult = await utapi.uploadFiles([capturedImageFile]);
        const capturedResult = capturedUploadResult[0];
        if (!capturedResult || capturedResult.error || !capturedResult.data) {
            return jsonError(capturedResult?.error?.message ?? "Captured image upload failed", 502);
        }

        // Upload heatmap image if provided
        let heatmapImageUrl: string | null = null;
        let heatmapImageKey: string | null = null;

        if (heatmapImage && heatmapImage.startsWith("data:image")) {
            try {
                // Convert base64 to File
                const base64Data = heatmapImage.split(",")[1];
                const buffer = Buffer.from(base64Data, "base64");
                const heatmapFile = new File(
                    [buffer],
                    `heatmap_${phase}_${Date.now()}.png`,
                    { type: "image/png" }
                );

                const heatmapUploadResult = await utapi.uploadFiles([heatmapFile]);
                const heatmapResult = heatmapUploadResult[0];
                if (heatmapResult && !heatmapResult.error && heatmapResult.data) {
                    heatmapImageUrl = heatmapResult.data.ufsUrl;
                    heatmapImageKey = heatmapResult.data.key;
                }
            } catch (e) {
                // Log but don't fail if heatmap upload fails
                console.error("Heatmap upload error:", e);
            }
        }

        // Determine if verification passed (damage below threshold for pickup)
        const damageThreshold = 30; // 30% threshold for pickup
        const passed = phase === "pickup" ? damagePercentage <= damageThreshold : true;

        // Create verification record
        const verification = await prisma.packageVerification.create({
            data: {
                jobId,
                phase,
                capturedImageUrl: capturedResult.data.ufsUrl,
                capturedImageKey: capturedResult.data.key,
                damagePercentage,
                anomalyDetected,
                threshold,
                heatmapImageUrl,
                heatmapImageKey,
                passed,
            },
        });

        // Fire-and-forget admin notification (do not block driver flow)
        try {
            await notify.packageVerificationSubmitted({
                jobId,
                phase,
                passed,
                damagePercentage,
            });
        } catch (e) {
            console.error("[Notifications] packageVerificationSubmitted notify error:", e);
        }

        return jsonOk({
            success: true,
            verificationId: verification.id,
            passed,
            damagePercentage,
        });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        if (msg === "Unauthorized") return jsonError("Unauthorized", 401);
        console.error("[API] Package verification error:", e);
        return jsonError(msg, 500);
    }
}
