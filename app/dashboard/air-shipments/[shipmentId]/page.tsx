"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    IconArrowLeft,
    IconCircleFilled,
    IconPackage,
    IconPlane,
    IconRefresh,
} from "@tabler/icons-react";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { FlightSelectionDialog } from "../_components/FlightSelectionDialog";

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
                        <Link href="/dashboard/air-shipments">
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
                                            onClick={() => router.push("/dashboard/air-shipments")}
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
                                                    {shipment.status.replace("_", " ")}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Created {formatDate(shipment.createdAt)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isConnected ? (
                                                <div className="flex items-center gap-1 text-xs text-green-500">
                                                    <IconCircleFilled className="size-2 animate-pulse" />
                                                    Live
                                                </div>
                                            ) : error ? (
                                                <div className="text-xs text-red-500">Disconnected</div>
                                            ) : null}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={fetchShipment}
                                            >
                                                <IconRefresh className="size-4" />
                                            </Button>
                                        </div>
                                    </div>

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
                                                <span className="font-medium">
                                                    {shipment.metadata.packageName}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Weight</span>
                                                <span className="font-medium">
                                                    {shipment.metadata.weightKg} kg
                                                </span>
                                            </div>
                                            {shipment.metadata.description && (
                                                <div className="pt-2 border-t">
                                                    <span className="text-sm text-muted-foreground">
                                                        {shipment.metadata.description}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Flight Info */}
                                    {airSegment && (
                                        <div className="rounded-lg border bg-card p-4">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
                                                    <IconPlane className="size-5 text-blue-500" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">Flight Information</h3>
                                                </div>
                                            </div>
                                            <div className="grid gap-3">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Carrier</span>
                                                    <span className="font-medium">{airSegment.carrier}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Flight</span>
                                                    <span className="font-medium font-mono">
                                                        {airSegment.flightNumber}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Route</span>
                                                    <span className="font-medium font-mono">
                                                        {airSegment.fromAirportIcao} → {airSegment.toAirportIcao}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Aircraft</span>
                                                    <span className="font-medium font-mono">
                                                        {airSegment.icao24?.toUpperCase()}
                                                    </span>
                                                </div>
                                                {airPosition && (
                                                    <>
                                                        <div className="pt-2 border-t" />
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Altitude</span>
                                                            <span className="font-medium">
                                                                {airPosition.altitude
                                                                    ? `${Math.round(airPosition.altitude)} m`
                                                                    : "N/A"}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Speed</span>
                                                            <span className="font-medium">
                                                                {airPosition.velocity
                                                                    ? `${Math.round(airPosition.velocity * 1.944)} kts`
                                                                    : "N/A"}
                                                            </span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Quick Actions */}
                                    {shipment.status !== "delivered" &&
                                        shipment.status !== "cancelled" && (
                                            <div className="flex gap-2">
                                                {shipment.status === "created" && (
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
                                        <ShipmentTimeline
                                            events={shipment.events}
                                            liveEvents={liveEvents}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel - Map */}
                            <div className="h-[400px] lg:h-full">
                                <AirTrackingMap
                                    segments={shipment.segments.map((seg) => ({
                                        id: seg.id,
                                        type: seg.type,
                                        sortOrder: seg.sortOrder,
                                        fromIcao: seg.fromAirportIcao,
                                        toIcao: seg.toAirportIcao,
                                        flightNumber: seg.flightNumber,
                                        carrier: seg.carrier,
                                        plannedDepartureAt: seg.plannedDepartureAt,
                                        plannedArrivalAt: seg.plannedArrivalAt,
                                        actualDepartureAt: seg.actualDepartureAt,
                                        actualArrivalAt: seg.actualArrivalAt,
                                        isActive: shipment.status === "in_transit" && seg.type === "air",
                                    }))}
                                    aircraftPosition={airPosition}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>

            <FlightSelectionDialog
                open={isFlightDialogOpen}
                onOpenChange={setIsFlightDialogOpen}
                fromIcao={airSegment?.fromAirportIcao || ""}
                toIcao={airSegment?.toAirportIcao || ""}
                onSelectFlight={handleFlightSelection}
                isUpdating={isUpdating}
            />
        </SidebarProvider>
    );
}
