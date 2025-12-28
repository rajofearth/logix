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
  if (typeof val === "number") return val;
  if (typeof val === "string") return Number(val);
  if (typeof val === "object" && val !== null && "toNumber" in val) {
    const fn = (val as { toNumber?: unknown }).toNumber;
    if (typeof fn === "function") return (fn as () => number)();
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


