"use client";

import * as React from "react";
import Link from "next/link";

import {
    IconPlus,
    IconRefresh,
    IconSearch,
    IconTrain,
} from "@tabler/icons-react";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    listTrainShipments,
    type TrainShipmentListItem,
} from "./_server/actions";

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

export default function TrainShipmentsPage() {

    const [shipments, setShipments] = React.useState<TrainShipmentListItem[]>([]);
    const [total, setTotal] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(true);
    const [search, setSearch] = React.useState("");

    const fetchShipments = React.useCallback(async (searchQuery?: string) => {
        setIsLoading(true);
        try {
            const result = await listTrainShipments({
                search: searchQuery || undefined,
                limit: 50,
            });
            setShipments(result.shipments);
            setTotal(result.total);
        } catch (error) {
            console.error("Failed to fetch train shipments:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchShipments();
    }, [fetchShipments]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchShipments(search);
    };

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
                <SiteHeader title="Train Shipments" />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight">
                                        Train Shipments
                                    </h1>
                                    <p className="text-muted-foreground">
                                        Manage your Indian Railways cargo shipments
                                    </p>
                                </div>
                                <Link href="/dashboard/train-shipments/new">
                                    <Button className="gap-2">
                                        <IconPlus className="size-4" />
                                        Create Shipment
                                    </Button>
                                </Link>
                            </div>

                            {/* Search and filters */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                                    <div className="relative flex-1 max-w-md">
                                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by reference, train, package..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                    <Button type="submit" variant="secondary">
                                        Search
                                    </Button>
                                </form>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => fetchShipments(search)}
                                >
                                    <IconRefresh className="size-4" />
                                </Button>
                            </div>

                            {/* Stats */}
                            <div className="text-sm text-muted-foreground">
                                {total} shipment{total !== 1 ? "s" : ""} found
                            </div>

                            {/* Shipments list */}
                            {isLoading ? (
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <Skeleton key={i} className="h-48 rounded-lg" />
                                    ))}
                                </div>
                            ) : shipments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="flex size-16 items-center justify-center rounded-full bg-muted mb-4">
                                        <IconTrain className="size-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">
                                        No train shipments yet
                                    </h3>
                                    <p className="text-muted-foreground mb-4 max-w-md">
                                        Create your first train shipment to start tracking cargo
                                        across Indian Railways.
                                    </p>
                                    <Link href="/dashboard/train-shipments/new">
                                        <Button className="gap-2">
                                            <IconPlus className="size-4" />
                                            Create Shipment
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {shipments.map((shipment) => (
                                        <Link
                                            key={shipment.id}
                                            href={`/dashboard/train-shipments/${shipment.id}`}
                                            className="rounded-lg border bg-card p-4 block hover:border-primary/50 transition-colors"
                                        >
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <p className="font-mono text-sm text-muted-foreground">
                                                        {shipment.referenceCode}
                                                    </p>
                                                    <h3 className="font-semibold truncate">
                                                        {shipment.packageName}
                                                    </h3>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={STATUS_COLORS[shipment.status]}
                                                >
                                                    {shipment.status.replace(/_/g, " ")}
                                                </Badge>
                                            </div>

                                            {/* Train info */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="flex size-8 items-center justify-center rounded bg-amber-500/10">
                                                    <IconTrain className="size-4 text-amber-500" />
                                                </div>
                                                <div className="text-sm">
                                                    <p className="font-medium">{shipment.trainName}</p>
                                                    <p className="text-muted-foreground font-mono">
                                                        {shipment.trainNumber}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Route */}
                                            <div className="flex items-center gap-2 text-sm mb-3">
                                                <span className="font-medium">
                                                    {shipment.fromStationCode}
                                                </span>
                                                <span className="flex-1 border-t border-dashed border-muted-foreground/30" />
                                                <span className="font-medium">
                                                    {shipment.toStationCode}
                                                </span>
                                            </div>

                                            {/* Details */}
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>{formatDate(shipment.journeyDate)}</span>
                                                <span>
                                                    {formatTime(shipment.scheduledDep)} →{" "}
                                                    {formatTime(shipment.scheduledArr)}
                                                </span>
                                                <span>{shipment.weightKg} kg</span>
                                            </div>

                                            {/* Delay indicator */}
                                            {shipment.delayMinutes !== null &&
                                                shipment.delayMinutes > 0 && (
                                                    <div className="mt-2 text-xs text-orange-500">
                                                        ⚠️ Delayed by {shipment.delayMinutes} min
                                                    </div>
                                                )}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
