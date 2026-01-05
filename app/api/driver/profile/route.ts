import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { requireDriverSession } from "@/app/api/_utils/driver-session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type DriverProfileDto = {
    id: string;
    name: string;
    phoneNumber: string | null;
    email: string;
    photoUrl: string | null;
    // Verification status
    verification: {
        phone: boolean;
        aadhaar: boolean;
        pan: boolean;
        driverLicense: boolean;
        vehiclePlate: boolean;
        insurance: boolean;
        isFullyVerified: boolean;
    };
    // Documents info
    documents: {
        aadhaarNo: string | null;
        panCardNo: string | null;
        driverLicenseNo: string | null;
        vehiclePlateNo: string | null;
        insuranceNo: string | null;
    };
    // Statistics
    stats: {
        totalDeliveries: number;
        completedDeliveries: number;
        cancelledDeliveries: number;
        onTimePercentage: number;
        totalDistanceKm: number;
        rating: number;
        reviewCount: number;
    };
    // Salary info
    baseSalary: number;
    walletAddress: string | null;
};

/**
 * GET /api/driver/profile
 * Returns complete driver profile data
 */
export async function GET(req: Request) {
    try {
        const { driverId } = await requireDriverSession(req.headers);

        const driver = await prisma.driver.findUnique({
            where: { id: driverId },
            select: {
                id: true,
                name: true,
                phoneNumber: true,
                email: true,
                photoUrl: true,
                aadharNo: true,
                isAadharVerified: true,
                panCardNo: true,
                isPanCardVerified: true,
                driverLicenseNo: true,
                isDriverLicenseVerified: true,
                vehiclePlateNo: true,
                isVehiclePlateVerified: true,
                insuranceNo: true,
                isInsuranceVerified: true,
                phoneNumberVerified: true,
                baseSalary: true,
                walletAddress: true,
                verifiedDriver: {
                    select: { isVerified: true }
                },
            },
        });

        if (!driver) {
            return jsonError("Driver not found", 404);
        }

        // Get job statistics
        const jobStats = await prisma.job.groupBy({
            by: ['status'],
            where: { driverId },
            _count: { id: true },
            _sum: { distanceMeters: true },
        });

        let completedCount = 0;
        let cancelledCount = 0;
        let totalDistanceMeters = 0;
        let totalCount = 0;

        for (const stat of jobStats) {
            const count = stat._count.id;
            totalCount += count;
            if (stat.status === 'completed') {
                completedCount = count;
                totalDistanceMeters = stat._sum.distanceMeters || 0;
            } else if (stat.status === 'cancelled') {
                cancelledCount = count;
            }
        }

        // Calculate on-time percentage (placeholder - would need actual delivery time tracking)
        // For now, assume 95% on-time for completed deliveries
        const onTimePercentage = completedCount > 0 ? 95 : 0;

        // Rating is placeholder - would need actual rating system
        const rating = 4.8;
        const reviewCount = completedCount;

        const isFullyVerified =
            driver.phoneNumberVerified &&
            driver.isAadharVerified &&
            driver.isPanCardVerified &&
            driver.isDriverLicenseVerified &&
            driver.isVehiclePlateVerified &&
            driver.isInsuranceVerified;

        const dto: DriverProfileDto = {
            id: driver.id,
            name: driver.name,
            phoneNumber: driver.phoneNumber,
            email: driver.email,
            photoUrl: driver.photoUrl,
            verification: {
                phone: driver.phoneNumberVerified,
                aadhaar: driver.isAadharVerified,
                pan: driver.isPanCardVerified,
                driverLicense: driver.isDriverLicenseVerified,
                vehiclePlate: driver.isVehiclePlateVerified,
                insurance: driver.isInsuranceVerified,
                isFullyVerified: driver.verifiedDriver?.isVerified ?? isFullyVerified,
            },
            documents: {
                aadhaarNo: driver.aadharNo,
                panCardNo: driver.panCardNo,
                driverLicenseNo: driver.driverLicenseNo,
                vehiclePlateNo: driver.vehiclePlateNo,
                insuranceNo: driver.insuranceNo,
            },
            stats: {
                totalDeliveries: totalCount,
                completedDeliveries: completedCount,
                cancelledDeliveries: cancelledCount,
                onTimePercentage,
                totalDistanceKm: Math.round(totalDistanceMeters / 1000),
                rating,
                reviewCount,
            },
            baseSalary: Number(driver.baseSalary),
            walletAddress: driver.walletAddress,
        };

        return jsonOk(dto);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        if (msg === "Unauthorized") return jsonError("Unauthorized", 401);
        return jsonError(msg, 500);
    }
}
