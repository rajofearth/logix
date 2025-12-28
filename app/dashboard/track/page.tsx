import { prisma } from "@/lib/prisma";
import { TrackView } from "./_components/TrackView";
import { type Delivery } from "./_data/deliveries";

export const dynamic = "force-dynamic";

export default async function TrackPage() {
    const jobs = await prisma.job.findMany({
        where: {
            driverId: {
                not: null,
            },
        },
        include: {
            driver: true,
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const deliveries: Delivery[] = jobs.map((job) => {
        // Mock data for fields not in DB
        const isEnRoute = job.driver?.status === 'on_route';

        return {
            id: job.id,
            type: job.title || "Standard Delivery",
            image: "/truck.png", // specific truck image or default
            origin: {
                address: job.pickupAddress,
                detail: `Lat: ${Number(job.pickupLat).toFixed(4)}, Lng: ${Number(job.pickupLng).toFixed(4)}`, // Fallback detail
            },
            destination: {
                address: job.dropAddress,
                detail: `Lat: ${Number(job.dropLat).toFixed(4)}, Lng: ${Number(job.dropLng).toFixed(4)}`,
            },
            driver: {
                name: job.driver?.name || "Unknown Driver",
                role: "Driver",
                avatar: job.driver?.photoUrl || "/driver1.jpg",
                experience: "N/A", // Not in DB
                license: job.driver?.driverLicenseNo || "N/A",
                idNumber: job.driver?.id || "N/A",
                licenseClass: "N/A",
                insuranceNumber: job.driver?.insuranceNo || "N/A",
            },
            status: {
                currentLocation: isEnRoute ? "On Route" : "Waiting",
                lastStop: "Just now", // Placeholder
                distance: `${(job.distanceMeters / 1609.34).toFixed(1)} mi`,
                currentSpeed: isEnRoute ? "45 mph" : "0 mph",
            },
            isActive: isEnRoute,
        };
    });

    return <TrackView initialDeliveries={deliveries} />;
}
