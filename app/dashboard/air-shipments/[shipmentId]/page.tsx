"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
    IconArrowLeft,
    IconCircleFilled,
    IconPackage,
    IconPlane,
    IconRefresh,
} from "@tabler/icons-react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";

import {
    getShipmentDetail,
    updateShipmentStatus,
    type ShipmentDetail,
    type FlightOption,
} from "../_server/actions";
import { useShipmentStream } from "../_hooks/useShipmentStream";
import { ShipmentTimeline } from "../_components/ShipmentTimeline";
import { AirTrackingMap } from "../_components/AirTrackingMap";
import type { FlightSegmentMapData } from "../_components/types";

const STATUS_COLORS: Record<string, string> = {
    created: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    in_transit: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    delivered: "bg-green-500/10 text-green-500 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    exception: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

function formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date));
}

export default function ShipmentDetailPage() {
    const router = useRouter();
    const params = useParams();
    const shipmentId = params.shipmentId as string;

    const [shipment, setShipment] = React.useState<ShipmentDetail | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [isFlightDialogOpen, setIsFlightDialogOpen] = React.useState(false);

    // Subscribe to real-time updates
    const { airPosition, events: liveEvents, isConnected, error } = useShipmentStream(
        shipmentId
    );

    // Fetch initial shipment data
    const fetchShipment = React.useCallback(async () => {
        if (!shipmentId) return;
        setIsLoading(true);
        try {
            const data = await getShipmentDetail(shipmentId);
            setShipment(data);
        } catch (err) {
            console.error("Failed to fetch shipment:", err);
        } finally {
            setIsLoading(false);
        }
    }, [shipmentId]);

    React.useEffect(() => {
        fetchShipment();
    }, [fetchShipment]);

    const handleStatusUpdate = async (newStatus: "in_transit" | "delivered") => {
        if (newStatus === "in_transit") {
            setIsFlightDialogOpen(true);
            return;
        }

        setIsUpdating(true);
        try {
            await updateShipmentStatus(shipmentId, newStatus);
            await fetchShipment();
        } finally {
            setIsUpdating(false);
        }
    };

    const handleFlightSelection = async (flight: FlightOption) => {
        setIsUpdating(true);
        try {
            await updateShipmentStatus(shipmentId, "in_transit", {
                flightDetails: flight
            });
            await fetchShipment();
            setIsFlightDialogOpen(false);
        } finally {
            setIsUpdating(false);
        }
    };

    const airSegment = shipment?.segments.find((s) => s.type === "air");

    // Convert segments to map format
    const mapSegments: FlightSegmentMapData[] = React.useMemo(() => {
        if (!shipment) return [];
        return shipment.segments
            .filter((s) => s.type === "air")
            .map((s, index, all) => ({
                id: s.id,
                type: s.type,
                sortOrder: s.sortOrder,
                fromIcao: s.fromAirportIcao,
                toIcao: s.toAirportIcao,
                flightNumber: s.flightNumber,
                carrier: s.carrier,
                plannedDepartureAt: s.plannedDepartureAt,
                plannedArrivalAt: s.plannedArrivalAt,
                actualDepartureAt: s.actualDepartureAt,
                actualArrivalAt: s.actualArrivalAt,
                isActive: index === 0, // First segment is active
            }));
    }, [shipment]);

    if (isLoading) {
        return (
            <ShipmentSkeleton />
        );
    }

    if (!shipment) {
        return (
            <DashboardShell title="Shipment Not Found">
                <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white border border-[#7f9db9] m-4">
                    <IconPackage className="size-16 text-gray-400 mb-4" />
                    <h2 className="text-xl font-bold mb-2 text-black">Shipment Not Found</h2>
                    <p className="text-gray-500 mb-4">
                        The shipment you&apos;re looking for doesn&apos;t exist.
                    </p>
                    <button
                        onClick={() => router.push("/dashboard/air-shipments")}
                        className="win7-btn"
                    >
                        Back to Shipments
                    </button>
                </div>
            </DashboardShell>
        );
    }

    return (
        <DashboardShell title={`Shipment: ${shipment.referenceCode}`}>
            <div className="flex flex-col h-full bg-[#ece9d8]">
                {/* Win7 Toolbar / Header */}
                <div className="flex items-center gap-2 p-2 border-b border-[#fff] shadow-[0_1px_0_#aca899] mb-1">
                    <button
                        className="win7-btn flex items-center gap-1"
                        onClick={() => router.push("/dashboard/air-shipments")}
                    >
                        <IconArrowLeft className="size-3.5" /> Back
                    </button>
                    <div className="w-[1px] h-5 bg-[#aca899] mx-1 border-r border-white"></div>
                    <button
                        className="win7-btn flex items-center gap-1"
                        onClick={fetchShipment}
                    >
                        <IconRefresh className="size-3.5" /> Refresh
                    </button>
                </div>

                {/* Main Content Split */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Panel: Info (Scrollable) */}
                    <div className="w-full lg:w-[450px] flex flex-col overflow-y-auto border-r border-[#898c95] bg-white p-4 space-y-4">

                        {/* Header Status Block */}
                        <div className="win7-groupbox">
                            <legend>Status</legend>
                            <div className="win7-p-4 flex justify-between items-start">
                                <div>
                                    <h1 className="text-lg font-bold text-black">{shipment.referenceCode}</h1>
                                    <p className="text-xs text-gray-500">Created {formatDate(shipment.createdAt)}</p>
                                </div>
                                <div className="text-right">
                                    <span className="inline-block px-2 py-0.5 border border-gray-400 bg-gray-100 text-xs font-bold uppercase">
                                        {shipment.status.replace("_", " ")}
                                    </span>
                                    {isConnected && (
                                        <div className="flex items-center justify-end gap-1 text-[10px] text-green-600 mt-1 uppercase font-bold">
                                            <IconCircleFilled className="size-1.5 animate-pulse" /> Live
                                        </div>
                                    )}
                                    {!isConnected && error && (
                                        <div className="text-[10px] text-red-500 mt-1 uppercase font-bold">Disconnected</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Package Info */}
                        <div className="win7-groupbox">
                            <legend>Package Details</legend>
                            <div className="win7-p-4 grid gap-2 text-sm">
                                <div className="flex justify-between border-b border-dotted border-gray-300 pb-1">
                                    <span className="text-gray-500">Name</span>
                                    <span className="font-bold">{shipment.metadata.packageName}</span>
                                </div>
                                <div className="flex justify-between border-b border-dotted border-gray-300 pb-1">
                                    <span className="text-gray-500">Weight</span>
                                    <span className="font-bold">{shipment.metadata.weightKg} kg</span>
                                </div>
                                {shipment.metadata.description && (
                                    <div className="text-gray-600 italic text-xs pt-1">
                                        {shipment.metadata.description}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Flight Info */}
                        {airSegment && (
                            <div className="win7-groupbox">
                                <legend>Flight Information</legend>
                                <div className="win7-p-4 grid gap-2 text-sm">
                                    <div className="flex items-center gap-2 mb-2 bg-[#eef1ff] border border-[#7f9db9] p-2">
                                        <IconPlane className="size-4 text-blue-600" />
                                        <div className="font-bold text-blue-800">
                                            {airSegment.carrier} {airSegment.flightNumber}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase">From</p>
                                            <p className="font-mono font-bold">{airSegment.fromAirportIcao}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase">To</p>
                                            <p className="font-mono font-bold">{airSegment.toAirportIcao}</p>
                                        </div>
                                    </div>

                                    {airSegment.icao24 && (
                                        <div className="flex justify-between mt-1">
                                            <span className="text-gray-500 text-xs">Aircraft ICAO</span>
                                            <span className="font-mono text-xs">{airSegment.icao24.toUpperCase()}</span>
                                        </div>
                                    )}

                                    {airPosition && (
                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500">Altitude</span>
                                                <span className="font-mono text-black">
                                                    {airPosition.altitude ? `${Math.round(airPosition.altitude)} m` : "N/A"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500">Speed</span>
                                                <span className="font-mono text-black">
                                                    {airPosition.velocity ? `${Math.round(airPosition.velocity * 1.944)} kts` : "N/A"}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        {shipment.status !== "delivered" && shipment.status !== "cancelled" && (
                            <div className="flex gap-2 p-1 bg-[#ece9d8] border border-white shadow-[1px_1px_0_#aca899] rounded">
                                {shipment.status === "created" && (
                                    <button
                                        onClick={() => handleStatusUpdate("in_transit")}
                                        disabled={isUpdating}
                                        className="win7-btn w-full"
                                    >
                                        Mark In Transit
                                    </button>
                                )}
                                {shipment.status === "in_transit" && (
                                    <button
                                        onClick={() => handleStatusUpdate("delivered")}
                                        disabled={isUpdating}
                                        className="win7-btn w-full"
                                    >
                                        Mark Delivered
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Timeline */}
                        <div className="win7-groupbox">
                            <legend>History</legend>
                            <div className="win7-p-4">
                                <ShipmentTimeline
                                    events={shipment.events}
                                    liveEvents={liveEvents}
                                />
                            </div>
                        </div>

                    </div>

                    {/* Right Panel - Map */}
                    <div className="flex-1 overflow-hidden relative bg-[#ece9d8] border-l border-[#898c95]">
                        <div className="absolute inset-0">
                            <AirTrackingMap
                                segments={mapSegments}
                                aircraftPosition={airPosition}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}

function ShipmentSkeleton() {
    return (
        <DashboardShell title="Loading Shipment...">
            <div className="flex flex-col h-full bg-[#ece9d8]">
                <div className="flex items-center gap-2 p-2 border-b border-[#fff] shadow-[0_1px_0_#aca899] mb-1">
                    <Skeleton className="h-6 w-16" />
                    <div className="w-[1px] h-5 bg-[#aca899] mx-1 border-r border-white"></div>
                    <Skeleton className="h-6 w-16" />
                </div>
                <div className="flex-1 flex overflow-hidden">
                    <div className="w-full lg:w-[450px] flex-col overflow-y-auto border-r border-[#898c95] bg-white p-4 space-y-4">
                        <div className="win7-groupbox">
                            <legend>Status</legend>
                            <div className="win7-p-4 space-y-2">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                        <div className="win7-groupbox">
                            <legend>Package Details</legend>
                            <div className="win7-p-4 space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </div>
                        <div className="win7-groupbox">
                            <legend>History</legend>
                            <div className="win7-p-4 space-y-2">
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                            </div>
                        </div>
                    </div>
                    <div className="flex-1">
                        <Skeleton className="h-full w-full" />
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
