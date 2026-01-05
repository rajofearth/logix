import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { requireDriverSession } from "@/app/api/_utils/driver-session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type JobStatus = "pending" | "in_progress" | "completed" | "cancelled";

type HistoryJobDto = {
    id: string;
    title: string;
    status: JobStatus;
    pickupAddress: string;
    dropAddress: string;
    distanceMeters: number;
    completedAt: string | null;
    // Earnings are calculated based on distance (placeholder logic)
    earnings: number;
};

type HistorySummary = {
    completedCount: number;
    cancelledCount: number;
    totalEarnings: number;
    rating: number;
};

type HistoryResponseDto = {
    summary: HistorySummary;
    jobs: HistoryJobDto[];
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

// Simple earnings calculation based on distance (₹10 per km)
function calculateEarnings(distanceMeters: number, status: string): number {
    if (status !== 'completed') return 0;
    return Math.round((distanceMeters / 1000) * 10);
}

/**
 * GET /api/driver/jobs/history
 * Returns completed and cancelled jobs for the driver
 */
export async function GET(req: Request) {
    try {
        const { driverId } = await requireDriverSession(req.headers);

        // Get URL params for pagination
        const url = new URL(req.url);
        const limit = parseInt(url.searchParams.get('limit') || '50', 10);
        const offset = parseInt(url.searchParams.get('offset') || '0', 10);

        const jobs = await prisma.job.findMany({
            where: {
                driverId,
                status: { in: ['completed', 'cancelled'] },
            },
            orderBy: { updatedAt: 'desc' },
            take: limit,
            skip: offset,
            select: {
                id: true,
                title: true,
                status: true,
                pickupAddress: true,
                dropAddress: true,
                distanceMeters: true,
                updatedAt: true,
            },
        });

        // Get summary stats
        const stats = await prisma.job.groupBy({
            by: ['status'],
            where: {
                driverId,
                status: { in: ['completed', 'cancelled'] },
            },
            _count: { id: true },
            _sum: { distanceMeters: true },
        });

        let completedCount = 0;
        let cancelledCount = 0;
        let totalDistanceMeters = 0;

        for (const stat of stats) {
            if (stat.status === 'completed') {
                completedCount = stat._count.id;
                totalDistanceMeters = stat._sum.distanceMeters || 0;
            } else if (stat.status === 'cancelled') {
                cancelledCount = stat._count.id;
            }
        }

        const totalEarnings = calculateEarnings(totalDistanceMeters, 'completed');

        const jobDtos: HistoryJobDto[] = jobs.map(j => ({
            id: j.id,
            title: j.title,
            status: j.status as JobStatus,
            pickupAddress: j.pickupAddress,
            dropAddress: j.dropAddress,
            distanceMeters: j.distanceMeters,
            completedAt: j.status === 'completed' ? j.updatedAt.toISOString() : null,
            earnings: calculateEarnings(j.distanceMeters, j.status),
        }));

        const response: HistoryResponseDto = {
            summary: {
                completedCount,
                cancelledCount,
                totalEarnings,
                rating: 4.8, // Placeholder rating
            },
            jobs: jobDtos,
        };

        return jsonOk(response);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        if (msg === "Unauthorized") return jsonError("Unauthorized", 401);
        return jsonError(msg, 500);
    }
}
