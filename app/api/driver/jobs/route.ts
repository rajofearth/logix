import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { requireDriverSession } from "@/app/api/_utils/driver-session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type JobStatus = "pending" | "in_progress" | "completed" | "cancelled";

type DriverJobDto = {
  id: string;
  title: string;
  status: JobStatus;
  weightKg: number;
  pickup: {
    address: string;
    lat: number;
    lng: number;
    at: string;
  };
  drop: {
    address: string;
    lat: number;
    lng: number;
    windowStartAt: string;
    windowEndAt: string;
  };
  distanceMeters: number;
};

function decimalToNumber(val: unknown): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return val;
  if (typeof val === "string") return Number(val);
  if (typeof val === "object") {
    const objWithToNumber = val as { toNumber?: () => number };
    if ("toNumber" in val && typeof objWithToNumber.toNumber === "function") {
      return objWithToNumber.toNumber();
    }
    return Number(String(val));
  }
  return Number(val);
}

/**
 * GET /api/driver/jobs
 * Returns jobs assigned to the authenticated driver
 * Only returns pending and in_progress jobs (not completed/cancelled)
 */
export async function GET(req: Request) {
  try {
    const { driverId } = await requireDriverSession(req.headers);

    const jobs = await prisma.job.findMany({
      where: {
        driverId,
        status: { in: ["pending", "in_progress"] },
      },
      orderBy: { pickupAt: "asc" },
      select: {
        id: true,
        title: true,
        status: true,
        weightKg: true,
        pickupAddress: true,
        pickupLat: true,
        pickupLng: true,
        dropAddress: true,
        dropLat: true,
        dropLng: true,
        pickupAt: true,
        dropWindowStartAt: true,
        dropWindowEndAt: true,
        distanceMeters: true,
      },
    });

    const dto: DriverJobDto[] = jobs.map((j) => ({
      id: j.id,
      title: j.title,
      status: j.status as JobStatus,
      weightKg: j.weightKg,
      pickup: {
        address: j.pickupAddress,
        lat: decimalToNumber(j.pickupLat),
        lng: decimalToNumber(j.pickupLng),
        at: j.pickupAt.toISOString(),
      },
      drop: {
        address: j.dropAddress,
        lat: decimalToNumber(j.dropLat),
        lng: decimalToNumber(j.dropLng),
        windowStartAt: j.dropWindowStartAt.toISOString(),
        windowEndAt: j.dropWindowEndAt.toISOString(),
      },
      distanceMeters: j.distanceMeters,
    }));

    return jsonOk(dto);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg === "Unauthorized") return jsonError("Unauthorized", 401);
    return jsonError(msg, 500);
  }
}
