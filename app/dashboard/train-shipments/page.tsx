"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    IconPlus,
    IconRefresh,
    IconSearch,
    IconTrain,
} from "@tabler/icons-react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";

import {
    listTrainShipments,
    type TrainShipmentListItem,
} from "./_server/actions";

const STATUS_LABELS: Record<string, string> = {
    created: "Created",
    waiting_for_train: "Waiting",
    in_transit: "In Transit",
    at_station: "At Station",
    delivered: "Delivered",
    cancelled: "Cancelled",
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
    const router = useRouter();
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
        <DashboardShell title="Logix Dashboard - Train Shipments" itemCount={total}>
            <div className="flex flex-col gap-4">
                {/* Controls Groupbox */}
                <div className="win7-groupbox">
                    <legend>Shipment Controls</legend>
                    <div className="win7-p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <form onSubmit={handleSearch} className="flex gap-4 items-center w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-64">
                                <IconSearch className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-gray-500 pointer-events-none" />
                                <input
                                    placeholder="Search train shipments..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-7 pr-2 h-7 w-full border border-[#7f9db9] text-xs outline-none"
                                    style={{ background: '#fff' }}
                                />
                            </div>
                            <button
                                type="button" // Prevent form submit on refresh
                                onClick={() => fetchShipments(search)}
                                className="win7-btn h-7 w-7 flex items-center justify-center p-0"
                                title="Refresh"
                            >
                                <IconRefresh className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
                            </button>
                            <button type="submit" className="hidden">Search</button> {/* Implicit submit */}
                        </form>

                        <Link href="/dashboard/train-shipments/new">
                            <button className="win7-btn flex items-center gap-1">
                                <IconPlus className="size-3.5" />
                                Create Shipment
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Shipments Grid */}
                {isLoading ? (
                    <TrainListSkeleton />
                ) : shipments.length === 0 ? (
                    <div className="win7-groupbox p-8 text-center bg-white">
                        <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                            <div className="bg-gray-100 p-3 rounded-full border border-gray-200">
                                <IconTrain className="size-8 opacity-50" />
                            </div>
                            <h3 className="font-bold text-sm text-black">No train shipments yet</h3>
                            <p className="text-xs">Create your first shipment to start tracking.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {shipments.map((shipment) => (
                            <div
                                key={shipment.id}
                                className="group relative bg-white border border-[#707070] p-3 shadow-sm hover:border-[#3399ff] hover:shadow-md cursor-pointer transition-all duration-200 select-none"
                                onClick={() =>
                                    router.push(
                                        `/dashboard/train-shipments/${shipment.id}`
                                    )
                                }
                            >
                                {/* Active Selection Border Overlay (optional) */}

                                {/* Header */}
                                <div className="flex items-start justify-between mb-2 pb-2 border-b border-gray-100/50">
                                    <div className="min-w-0 pr-2">
                                        <div className="font-mono text-[10px] text-gray-500 mb-0.5">
                                            {shipment.referenceCode}
                                        </div>
                                        <h3 className="font-bold text-sm text-[#0066cc] truncate group-hover:underline">
                                            {shipment.packageName}
                                        </h3>
                                    </div>
                                    <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase border border-gray-300 bg-gray-50 text-gray-600 rounded-sm">
                                        {STATUS_LABELS[shipment.status] || shipment.status}
                                    </span>
                                </div>

                                {/* Train Details */}
                                <div className="flex items-center gap-2 mb-2 bg-[#f5f5f5] p-1.5 rounded border border-gray-200">
                                    <IconTrain className="size-4 text-amber-600 shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-black truncate">{shipment.trainName}</p>
                                        <p className="text-[10px] text-gray-500 font-mono truncate">{shipment.trainNumber}</p>
                                    </div>
                                </div>

                                {/* Route */}
                                <div className="flex items-center gap-2 text-xs mb-2 px-1">
                                    <span className="font-bold text-black">{shipment.fromStationCode}</span>
                                    <span className="flex-1 border-t border-dashed border-gray-300" />
                                    <span className="font-bold text-black">{shipment.toStationCode}</span>
                                </div>

                                {/* Footer Stats */}
                                <div className="flex items-center justify-between text-[10px] text-gray-500 mt-2 pt-2 border-t border-gray-100">
                                    <span>{formatDate(shipment.journeyDate)}</span>
                                    <span>{formatTime(shipment.scheduledDep)} - {formatTime(shipment.scheduledArr)}</span>
                                    <span className="font-medium text-black">{shipment.weightKg} kg</span>
                                </div>

                                {/* Delay Warning */}
                                {shipment.delayMinutes !== null && shipment.delayMinutes > 0 && (
                                    <div className="absolute top-2 right-2 flex animate-pulse">
                                        <span className="flex h-2 w-2 rounded-full bg-red-500"></span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardShell>
    );
}

function TrainListSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white border border-[#707070] p-3 shadow-sm h-[180px] flex flex-col">
                    {/* Header Skeleton */}
                    <div className="flex justify-between mb-2 pb-2 border-b border-gray-100/50">
                        <div className="space-y-1">
                            <div className="h-2 w-16 bg-gray-200 animate-pulse rounded-sm"></div>
                            <div className="h-4 w-24 bg-gray-200 animate-pulse rounded-sm"></div>
                        </div>
                        <div className="h-4 w-12 bg-gray-200 animate-pulse rounded-sm"></div>
                    </div>

                    {/* Train Info Skeleton */}
                    <div className="flex items-center gap-2 mb-2 bg-[#f5f5f5] p-1.5 rounded border border-gray-200 h-10">
                        <div className="size-4 bg-gray-300 animate-pulse rounded-sm"></div>
                        <div className="space-y-1 flex-1">
                            <div className="h-3 w-32 bg-gray-200 animate-pulse rounded-sm"></div>
                        </div>
                    </div>

                    {/* Route Skeleton */}
                    <div className="flex items-center justify-between px-1 mt-1">
                        <div className="h-3 w-8 bg-gray-200 animate-pulse rounded-sm"></div>
                        <div className="h-px w-20 bg-gray-200"></div>
                        <div className="h-3 w-8 bg-gray-200 animate-pulse rounded-sm"></div>
                    </div>

                    {/* Footer Skeleton */}
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                        <div className="h-2 w-12 bg-gray-200 animate-pulse rounded-sm"></div>
                        <div className="h-2 w-8 bg-gray-200 animate-pulse rounded-sm"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}
