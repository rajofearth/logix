import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { requireDriverSession } from "@/app/api/_utils/driver-session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type DriverJobDto = {
  id: string;
  title: string;
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
  // Safe handling for Prisma Decimal or other objects
  if (typeof val === "object") {
    // Try .toNumber() if available
    if ("toNumber" in val && typeof (val as any).toNumber === "function") {
      return (val as any).toNumber();
    }
    // Fallback to string conversion
    return Number(String(val));
  }
  return Number(val);
}

export async function GET(req: Request) {
  try {
    await requireDriverSession(req.headers);

    const jobs = await prisma.job.findMany({
      orderBy: { pickupAt: "asc" },
      select: {
        id: true,
        title: true,
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

    console.log('[API] Found jobs:', jobs.length);
    if (jobs.length > 0) {
      console.log('[API] First job raw lat/lng:', {
        lat: jobs[0].pickupLat,
        type: typeof jobs[0].pickupLat,
        converted: decimalToNumber(jobs[0].pickupLat)
      });
    }

    const dto: DriverJobDto[] = jobs.map((j) => ({
      id: j.id,
      title: j.title,
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


