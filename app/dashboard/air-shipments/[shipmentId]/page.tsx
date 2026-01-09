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

import {
    getShipmentDetail,
    updateShipmentStatus,
    type ShipmentDetail,
} from "../_server/actions";
import { useShipmentStream } from "../_hooks/useShipmentStream";
import { ShipmentTimeline } from "../_components/ShipmentTimeline";
import { AirTrackingMap } from "../_components/AirTrackingMap";

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
        setIsUpdating(true);
        try {
            await updateShipmentStatus(shipmentId, newStatus);
            await fetchShipment();
        } finally {
            setIsUpdating(false);
        }
    };

    const airSegment = shipment?.segments.find((s) => s.type === "air");

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
                    <div className="w-full lg:w-[450px] flex-col overflow-y-auto border-r border-[#898c95] bg-white p-4 space-y-4">

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

                    {/* Right Panel: Map */}
                    <div className="flex-1 bg-[#808080] relative border-l border-white h-[400px] lg:h-auto">
                        <AirTrackingMap
                            fromAirportIcao={airSegment?.fromAirportIcao || null}
                            toAirportIcao={airSegment?.toAirportIcao || null}
                            aircraftPosition={airPosition}
                        />
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
                {/* Win7 Toolbar / Header Stub */}
                <div className="flex items-center gap-2 p-2 border-b border-[#fff] shadow-[0_1px_0_#aca899] mb-1">
                    <button className="win7-btn flex items-center gap-1 opacity-50 cursor-not-allowed">
                        <IconArrowLeft className="size-3.5" /> Back
                    </button>
                    <div className="w-[1px] h-5 bg-[#aca899] mx-1 border-r border-white"></div>
                    <button className="win7-btn flex items-center gap-1 opacity-50 cursor-not-allowed">
                        <IconRefresh className="size-3.5" /> Refresh
                    </button>
                </div>

                {/* Main Content Split */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Panel: Info (Scrollable) */}
                    <div className="w-full lg:w-[450px] flex-col overflow-y-auto border-r border-[#898c95] bg-white p-4 space-y-4">

                        {/* Status Block Skeleton */}
                        <div className="win7-groupbox">
                            <legend>Status</legend>
                            <div className="win7-p-4 flex justify-between items-start">
                                <div className="space-y-2">
                                    <div className="h-6 w-32 bg-gray-200 animate-pulse rounded-sm"></div>
                                    <div className="h-3 w-24 bg-gray-200 animate-pulse rounded-sm"></div>
                                </div>
                                <div className="h-6 w-20 bg-gray-200 animate-pulse border border-gray-300"></div>
                            </div>
                        </div>

                        {/* Package Info Skeleton */}
                        <div className="win7-groupbox">
                            <legend>Package Details</legend>
                            <div className="win7-p-4 grid gap-2 text-sm">
                                <div className="flex justify-between border-b border-dotted border-gray-300 pb-1">
                                    <div className="h-4 w-12 bg-gray-200 animate-pulse rounded-sm"></div>
                                    <div className="h-4 w-24 bg-gray-200 animate-pulse rounded-sm"></div>
                                </div>
                                <div className="flex justify-between border-b border-dotted border-gray-300 pb-1">
                                    <div className="h-4 w-12 bg-gray-200 animate-pulse rounded-sm"></div>
                                    <div className="h-4 w-16 bg-gray-200 animate-pulse rounded-sm"></div>
                                </div>
                            </div>
                        </div>

                        {/* Flight Info Skeleton */}
                        <div className="win7-groupbox">
                            <legend>Flight Information</legend>
                            <div className="win7-p-4 grid gap-2 text-sm">
                                <div className="h-10 w-full bg-[#eef1ff] border border-[#7f9db9] p-2 flex items-center gap-2">
                                    <div className="size-4 bg-blue-200 rounded-full animate-pulse"></div>
                                    <div className="h-4 w-32 bg-blue-200 animate-pulse rounded-sm"></div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div className="space-y-1">
                                        <div className="h-3 w-8 bg-gray-200 animate-pulse rounded-sm"></div>
                                        <div className="h-5 w-16 bg-gray-200 animate-pulse rounded-sm"></div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="h-3 w-8 bg-gray-200 animate-pulse rounded-sm"></div>
                                        <div className="h-5 w-16 bg-gray-200 animate-pulse rounded-sm"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timeline Skeleton */}
                        <div className="win7-groupbox">
                            <legend>History</legend>
                            <div className="win7-p-4 space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className="size-3 rounded-full bg-gray-200 animate-pulse border border-gray-300"></div>
                                            <div className="w-px h-full bg-gray-200 my-1"></div>
                                        </div>
                                        <div className="space-y-1 w-full">
                                            <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded-sm"></div>
                                            <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded-sm"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right Panel: Map Skeleton */}
                    <div className="flex-1 bg-[#808080] relative border-l border-white h-[400px] lg:h-auto flex items-center justify-center">
                        <div className="text-white/50 flex flex-col items-center gap-2">
                            <div className="size-10 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                            <span className="text-sm shadow-black drop-shadow-md">Loading Map...</span>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
