"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    IconArrowLeft,
    IconCircleFilled,
    IconPackage,
    IconRefresh,
    IconTrain,
    IconMapPin,
    IconClock,
} from "@tabler/icons-react";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    getTrainShipmentDetail,
    updateTrainShipmentStatus,
    refreshTrainPosition,
    type TrainShipmentDetail,
} from "../_server/actions";
import { TrainTimeline } from "../_components/TrainTimeline";
import { TrainTrackingMap } from "../_components/TrainTrackingMap";

const STATUS_COLORS: Record<string, string> = {
    created: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    waiting_for_train: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    in_transit: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    at_station: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    delivered: "bg-green-500/10 text-green-500 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
};

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
            <SidebarProvider
                style={
                    {
                        "--sidebar-width": "calc(var(--spacing) * 72)",
                        "--header-height": "calc(var(--spacing) * 12)",
                    } as React.CSSProperties
                }
            >
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <SiteHeader title="Shipment Details" />
                    <div className="flex flex-1 p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                            <div className="space-y-4">
                                <Skeleton className="h-32 w-full" />
                                <Skeleton className="h-48 w-full" />
                                <Skeleton className="h-64 w-full" />
                            </div>
                            <Skeleton className="h-[500px] w-full" />
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    if (!shipment) {
        return (
            <SidebarProvider
                style={
                    {
                        "--sidebar-width": "calc(var(--spacing) * 72)",
                        "--header-height": "calc(var(--spacing) * 12)",
                    } as React.CSSProperties
                }
            >
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <SiteHeader title="Shipment Not Found" />
                    <div className="flex flex-1 flex-col items-center justify-center p-6">
                        <IconPackage className="size-16 text-muted-foreground mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Shipment Not Found</h2>
                        <p className="text-muted-foreground mb-4">
                            The shipment you&apos;re looking for doesn&apos;t exist.
                        </p>
                        <Link href="/dashboard/train-shipments">
                            <Button>Back to Shipments</Button>
                        </Link>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader title={shipment.referenceCode} />
                <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="@container/main flex flex-1 overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 w-full h-full">
                            {/* Left Panel - Details & Timeline */}
                            <div className="flex flex-col overflow-y-auto border-r">
                                <div className="p-4 lg:p-6 space-y-6">
                                    {/* Back button and header */}
                                    <div className="flex items-start gap-4">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => router.push("/dashboard/train-shipments")}
                                        >
                                            <IconArrowLeft className="size-4" />
                                        </Button>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <h1 className="text-xl font-bold">
                                                    {shipment.referenceCode}
                                                </h1>
                                                <Badge
                                                    variant="outline"
                                                    className={STATUS_COLORS[shipment.status]}
                                                >
                                                    {shipment.status.replace(/_/g, " ")}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Created {formatDateTime(shipment.createdAt)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {shipment.status === "in_transit" && (
                                                <div className="flex items-center gap-1 text-xs text-amber-500">
                                                    <IconCircleFilled className="size-2 animate-pulse" />
                                                    Live
                                                </div>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={handleRefresh}
                                                disabled={isRefreshing}
                                            >
                                                <IconRefresh
                                                    className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
                                                />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Status Note */}
                                    {statusNote && (
                                        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                                            <p className="text-sm text-amber-600 dark:text-amber-400">
                                                {statusNote}
                                            </p>
                                        </div>
                                    )}

                                    {/* Package Info */}
                                    <div className="rounded-lg border bg-card p-4">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                                                <IconPackage className="size-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">Package Details</h3>
                                            </div>
                                        </div>
                                        <div className="grid gap-3">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Name</span>
                                                <span className="font-medium">{shipment.packageName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Weight</span>
                                                <span className="font-medium">{shipment.weightKg} kg</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Packages</span>
                                                <span className="font-medium">{shipment.packageCount}</span>
                                            </div>
                                            {shipment.description && (
                                                <div className="pt-2 border-t">
                                                    <span className="text-sm text-muted-foreground">
                                                        {shipment.description}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Train Info */}
                                    <div className="rounded-lg border bg-card p-4">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
                                                <IconTrain className="size-5 text-amber-500" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">Train Information</h3>
                                            </div>
                                        </div>
                                        <div className="grid gap-3">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Train</span>
                                                <span className="font-medium">{shipment.trainName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Number</span>
                                                <span className="font-medium font-mono">
                                                    {shipment.trainNumber}
                                                </span>
                                            </div>
                                            {shipment.coachType && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Coach</span>
                                                    <span className="font-medium">{shipment.coachType}</span>
                                                </div>
                                            )}
                                            {shipment.pnr && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">PNR</span>
                                                    <span className="font-medium font-mono">{shipment.pnr}</span>
                                                </div>
                                            )}
                                            {shipment.delayMinutes !== null && shipment.delayMinutes > 0 && (
                                                <div className="flex justify-between text-orange-500">
                                                    <span>Delay</span>
                                                    <span className="font-medium">
                                                        {shipment.delayMinutes} min
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Route Info */}
                                    <div className="rounded-lg border bg-card p-4">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
                                                <IconMapPin className="size-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">Route</h3>
                                            </div>
                                        </div>
                                        <div className="grid gap-3">
                                            <div>
                                                <p className="text-xs text-muted-foreground">From</p>
                                                <p className="font-medium">
                                                    {shipment.fromStationName}{" "}
                                                    <span className="text-muted-foreground">
                                                        ({shipment.fromStationCode})
                                                    </span>
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">To</p>
                                                <p className="font-medium">
                                                    {shipment.toStationName}{" "}
                                                    <span className="text-muted-foreground">
                                                        ({shipment.toStationCode})
                                                    </span>
                                                </p>
                                            </div>
                                            {shipment.currentStation && (
                                                <div className="pt-2 border-t">
                                                    <p className="text-xs text-muted-foreground">Current Station</p>
                                                    <p className="font-medium text-amber-500">
                                                        {shipment.currentStation}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Timing Info */}
                                    <div className="rounded-lg border bg-card p-4">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/10">
                                                <IconClock className="size-5 text-purple-500" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">Timing</h3>
                                            </div>
                                        </div>
                                        <div className="grid gap-3">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Journey Date</span>
                                                <span className="font-medium">
                                                    {formatDate(shipment.journeyDate)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Departure</span>
                                                <span className="font-medium">
                                                    {formatTime(shipment.scheduledDep)}
                                                    {shipment.actualDep && (
                                                        <span className="text-muted-foreground ml-2">
                                                            (Actual: {formatTime(shipment.actualDep)})
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Arrival</span>
                                                <span className="font-medium">
                                                    {formatTime(shipment.scheduledArr)}
                                                    {shipment.actualArr && (
                                                        <span className="text-muted-foreground ml-2">
                                                            (Actual: {formatTime(shipment.actualArr)})
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                            {shipment.lastTrackedAt && (
                                                <div className="pt-2 border-t text-xs text-muted-foreground">
                                                    Last updated: {formatDateTime(shipment.lastTrackedAt)}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    {shipment.status !== "delivered" &&
                                        shipment.status !== "cancelled" && (
                                            <div className="flex gap-2">
                                                {(shipment.status === "created" ||
                                                    shipment.status === "waiting_for_train") && (
                                                        <Button
                                                            onClick={() => handleStatusUpdate("in_transit")}
                                                            disabled={isUpdating}
                                                            className="flex-1"
                                                        >
                                                            Mark In Transit
                                                        </Button>
                                                    )}
                                                {shipment.status === "in_transit" && (
                                                    <Button
                                                        onClick={() => handleStatusUpdate("delivered")}
                                                        disabled={isUpdating}
                                                        className="flex-1"
                                                    >
                                                        Mark Delivered
                                                    </Button>
                                                )}
                                            </div>
                                        )}

                                    {/* Timeline */}
                                    <div>
                                        <h3 className="font-semibold mb-4">Tracking History</h3>
                                        <TrainTimeline events={shipment.events} />
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel - Map */}
                            <div className="h-[400px] lg:h-full">
                                <TrainTrackingMap
                                    fromStationCode={shipment.fromStationCode}
                                    toStationCode={shipment.toStationCode}
                                    currentStationCode={shipment.currentStation}
                                    positions={shipment.positions}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
