import { prisma } from "@/lib/prisma";
import { requireDriverSession } from "@/app/api/_utils/driver-session";
import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { requireFormFile, utapi } from "../_utils";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { driverId } = await requireDriverSession(req.headers);
    const file = await requireFormFile(req);

    const result = await utapi.uploadFiles([file]);
    const uploadResult = result[0];
    if (!uploadResult || uploadResult.error || !uploadResult.data) {
      return jsonError(uploadResult?.error?.message ?? "Upload failed", 502);
    }
    const uploaded = uploadResult.data;

    await prisma.driver.update({
      where: { id: driverId },
      data: { panCardFile: uploaded.url, panCardFileKey: uploaded.key },
    });

    return jsonOk({ url: uploaded.url, fileKey: uploaded.key });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg === "Unauthorized") return jsonError("Unauthorized", 401);
    return jsonError(msg, 500);
  }
}


