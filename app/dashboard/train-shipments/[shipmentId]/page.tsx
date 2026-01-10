"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
    IconArrowLeft,
    IconCircleFilled,
    IconPackage,
    IconRefresh,
    IconTrain,
    IconMapPin,
    IconClock,
} from "@tabler/icons-react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";

import {
    getTrainShipmentDetail,
    updateTrainShipmentStatus,
    refreshTrainPosition,
    type TrainShipmentDetail,
} from "../_server/actions";
import { TrainTimeline } from "../_components/TrainTimeline";
import { TrainTrackingMap } from "../_components/TrainTrackingMap";

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(date));
}

function formatTime(date: Date): string {
    return new Intl.DateTimeFormat("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(new Date(date));
}

function formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat("en-IN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(new Date(date));
}

export default function TrainShipmentDetailPage() {
    const router = useRouter();
    const params = useParams();
    const shipmentId = params.shipmentId as string;

    const [shipment, setShipment] = React.useState<TrainShipmentDetail | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const [statusNote, setStatusNote] = React.useState<string | null>(null);

    // Fetch shipment data
    const fetchShipment = React.useCallback(async () => {
        if (!shipmentId) return;
        setIsLoading(true);
        try {
            const data = await getTrainShipmentDetail(shipmentId);
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

    // Auto-refresh position every 60 seconds
    React.useEffect(() => {
        if (!shipment || shipment.status === "delivered" || shipment.status === "cancelled") {
            return;
        }

        const interval = setInterval(async () => {
            try {
                const result = await refreshTrainPosition(shipmentId);
                if (result.success && result.statusNote) {
                    setStatusNote(result.statusNote);
                }
                await fetchShipment();
            } catch {
                // Ignore refresh errors
            }
        }, 60000);

        return () => clearInterval(interval);
    }, [shipmentId, shipment?.status, fetchShipment]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            const result = await refreshTrainPosition(shipmentId);
            if (result.success && result.statusNote) {
                setStatusNote(result.statusNote);
            }
            await fetchShipment();
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleStatusUpdate = async (newStatus: "in_transit" | "delivered") => {
        setIsUpdating(true);
        try {
            await updateTrainShipmentStatus(shipmentId, newStatus);
            await fetchShipment();
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <TrainShipmentSkeleton />
        );
    }

    if (!shipment) {
        return (
            <DashboardShell title="Shipment Not Found">
                <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-[#7f9db9] m-4">
                    <IconPackage className="size-16 text-gray-400 mb-4" />
                    <h2 className="text-xl font-bold mb-2">Shipment Not Found</h2>
                    <p className="text-gray-500 mb-4">
                        The shipment you&apos;re looking for doesn&apos;t exist.
                    </p>
                    <button
                        onClick={() => router.push("/dashboard/train-shipments")}
                        className="win7-btn"
                    >
                        Back to Shipments
                    </button>
                </div>
            </DashboardShell>
        );
    }

    return (
        <DashboardShell title={`Train Shipment: ${shipment.referenceCode}`}>
            <div className="flex flex-col h-full bg-[#ece9d8]">
                {/* Toolbar */}
                <div className="flex items-center gap-2 p-2 border-b border-[#fff] shadow-[0_1px_0_#aca899] mb-1">
                    <button
                        className="win7-btn flex items-center gap-1"
                        onClick={() => router.push("/dashboard/train-shipments")}
                    >
                        <IconArrowLeft className="size-3.5" /> Back
                    </button>
                    <div className="w-[1px] h-5 bg-[#aca899] mx-1 border-r border-white"></div>
                    <button
                        className="win7-btn flex items-center gap-1"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                    >
                        <IconRefresh className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                    {shipment.status === "in_transit" && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold uppercase ml-2">
                            <IconCircleFilled className="size-2 animate-pulse" /> Live
                        </div>
                    )}
                </div>

                {/* Main Content Split */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Panel: Info (Scrollable) */}
                    <div className="w-full lg:w-[450px] flex-col overflow-y-auto border-r border-[#898c95] bg-white p-4 space-y-4">

                        {/* Header Status */}
                        <div className="win7-groupbox">
                            <legend>Status</legend>
                            <div className="win7-p-4 flex justify-between items-start">
                                <div>
                                    <h1 className="text-lg font-bold text-black">{shipment.referenceCode}</h1>
                                    <p className="text-xs text-gray-500">Created {formatDateTime(shipment.createdAt)}</p>
                                </div>
                                <div className="text-right">
                                    <span className="inline-block px-2 py-0.5 border border-gray-400 bg-gray-100 text-xs font-bold uppercase">
                                        {shipment.status.replace(/_/g, " ")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Status Note */}
                        {statusNote && (
                            <div className="win7-groupbox border-amber-500/50">
                                <legend className="text-amber-600">Update</legend>
                                <div className="win7-p-4 bg-amber-50 rounded-sm">
                                    <p className="text-sm text-amber-700 font-sans">
                                        {statusNote}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Package Info */}
                        <div className="win7-groupbox">
                            <legend>Package Details</legend>
                            <div className="win7-p-4 grid gap-2 text-sm">
                                <div className="flex justify-between border-b border-dotted border-gray-300 pb-1">
                                    <span className="text-gray-500">Name</span>
                                    <span className="font-bold">{shipment.packageName}</span>
                                </div>
                                <div className="flex justify-between border-b border-dotted border-gray-300 pb-1">
                                    <span className="text-gray-500">Weight</span>
                                    <span className="font-bold">{shipment.weightKg} kg</span>
                                </div>
                                <div className="flex justify-between border-b border-dotted border-gray-300 pb-1">
                                    <span className="text-gray-500">Packages</span>
                                    <span className="font-medium">{shipment.packageCount}</span>
                                </div>
                                {shipment.description && (
                                    <div className="text-gray-600 italic text-xs pt-1">
                                        {shipment.description}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Train Info */}
                        <div className="win7-groupbox">
                            <legend>Train Information</legend>
                            <div className="win7-p-4 grid gap-2 text-sm">
                                <div className="flex items-center gap-2 mb-2 bg-[#fffde7] border border-[#d4af37] p-2">
                                    <IconTrain className="size-4 text-amber-600" />
                                    <div className="font-bold text-amber-900">
                                        {shipment.trainName} ({shipment.trainNumber})
                                    </div>
                                </div>

                                {shipment.coachType && (
                                    <div className="flex justify-between border-b border-dotted border-gray-300 pb-1">
                                        <span className="text-gray-500">Coach</span>
                                        <span className="font-mono">{shipment.coachType}</span>
                                    </div>
                                )}
                                {shipment.pnr && (
                                    <div className="flex justify-between border-b border-dotted border-gray-300 pb-1">
                                        <span className="text-gray-500">PNR</span>
                                        <span className="font-mono">{shipment.pnr}</span>
                                    </div>
                                )}
                                {shipment.delayMinutes !== null && shipment.delayMinutes > 0 && (
                                    <div className="flex justify-between text-red-600 bg-red-50 p-1 border border-red-200">
                                        <span className="font-bold">Delay</span>
                                        <span className="font-bold">{shipment.delayMinutes} min</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Route & Timing (Combined for compactness) */}
                        <div className="win7-groupbox">
                            <legend>Route & Timing</legend>
                            <div className="win7-p-4 space-y-2">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="bg-[#f5f5f5] p-2 border border-gray-200">
                                        <p className="text-[10px] text-gray-500 uppercase">From</p>
                                        <p className="font-bold">{shipment.fromStationCode}</p>
                                        <p className="text-[10px]">{shipment.fromStationName}</p>
                                        <p className="text-xs font-mono mt-1 text-black">{formatTime(shipment.scheduledDep)}</p>
                                        {shipment.actualDep && <p className="text-[10px] text-gray-500">Act: {formatTime(shipment.actualDep)}</p>}
                                    </div>
                                    <div className="bg-[#f5f5f5] p-2 border border-gray-200">
                                        <p className="text-[10px] text-gray-500 uppercase">To</p>
                                        <p className="font-bold">{shipment.toStationCode}</p>
                                        <p className="text-[10px]">{shipment.toStationName}</p>
                                        <p className="text-xs font-mono mt-1 text-black">{formatTime(shipment.scheduledArr)}</p>
                                        {shipment.actualArr && <p className="text-[10px] text-gray-500">Act: {formatTime(shipment.actualArr)}</p>}
                                    </div>
                                </div>

                                {shipment.currentStation && (
                                    <div className="p-2 border border-[#3399ff] bg-[#eef1ff] flex justify-between items-center text-xs">
                                        <span className="text-[#0066cc] font-bold">Current Station:</span>
                                        <span className="font-mono font-bold text-black">{shipment.currentStation}</span>
                                    </div>
                                )}

                                {shipment.lastTrackedAt && (
                                    <div className="text-[9px] text-gray-400 text-right">
                                        Last updated: {formatDateTime(shipment.lastTrackedAt)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        {shipment.status !== "delivered" && shipment.status !== "cancelled" && (
                            <div className="flex gap-2 p-1 bg-[#ece9d8] border border-white shadow-[1px_1px_0_#aca899] rounded">
                                {(shipment.status === "created" || shipment.status === "waiting_for_train") && (
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
                                <TrainTimeline events={shipment.events} />
                            </div>
                        </div>

                    </div>

                    {/* Right Panel: Map */}
                    <div className="flex-1 bg-[#808080] relative border-l border-white h-[400px] lg:h-auto">
                        <TrainTrackingMap
                            fromStationCode={shipment.fromStationCode}
                            toStationCode={shipment.toStationCode}
                            currentStationCode={shipment.currentStation}
                            positions={shipment.positions}
                        />
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}

function TrainShipmentSkeleton() {
    return (
        <DashboardShell title="Loading Train Shipment...">
            <div className="flex flex-col h-full bg-[#ece9d8]">
                {/* Toolbar Stub */}
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

                        {/* Status Skeleton */}
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

                        {/* Package Details Skeleton */}
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
                                <div className="flex justify-between border-b border-dotted border-gray-300 pb-1">
                                    <div className="h-4 w-12 bg-gray-200 animate-pulse rounded-sm"></div>
                                    <div className="h-4 w-8 bg-gray-200 animate-pulse rounded-sm"></div>
                                </div>
                            </div>
                        </div>

                        {/* Train Information Skeleton */}
                        <div className="win7-groupbox">
                            <legend>Train Information</legend>
                            <div className="win7-p-4 grid gap-2 text-sm">
                                <div className="h-10 w-full bg-[#fffde7] border border-[#d4af37] p-2 flex items-center gap-2">
                                    <div className="size-4 bg-amber-200 rounded-full animate-pulse"></div>
                                    <div className="h-4 w-32 bg-amber-200 animate-pulse rounded-sm"></div>
                                </div>

                                <div className="flex justify-between border-b border-dotted border-gray-300 pb-1 mt-2">
                                    <div className="h-4 w-12 bg-gray-200 animate-pulse rounded-sm"></div>
                                    <div className="h-4 w-20 bg-gray-200 animate-pulse rounded-sm"></div>
                                </div>
                                <div className="flex justify-between border-b border-dotted border-gray-300 pb-1">
                                    <div className="h-4 w-12 bg-gray-200 animate-pulse rounded-sm"></div>
                                    <div className="h-4 w-16 bg-gray-200 animate-pulse rounded-sm"></div>
                                </div>
                            </div>
                        </div>

                        {/* Route & Timing Skeleton */}
                        <div className="win7-groupbox">
                            <legend>Route & Timing</legend>
                            <div className="win7-p-4 space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1 bg-gray-50 p-2 border border-gray-200">
                                        <div className="h-3 w-8 bg-gray-200 animate-pulse rounded-sm"></div>
                                        <div className="h-4 w-16 bg-gray-200 animate-pulse rounded-sm"></div>
                                        <div className="h-3 w-24 bg-gray-200 animate-pulse rounded-sm"></div>
                                    </div>
                                    <div className="space-y-1 bg-gray-50 p-2 border border-gray-200">
                                        <div className="h-3 w-8 bg-gray-200 animate-pulse rounded-sm"></div>
                                        <div className="h-4 w-16 bg-gray-200 animate-pulse rounded-sm"></div>
                                        <div className="h-3 w-24 bg-gray-200 animate-pulse rounded-sm"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* History Skeleton */}
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
