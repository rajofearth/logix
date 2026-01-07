"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    IconPlane,
    IconPlus,
    IconRefresh,
    IconSearch,
} from "@tabler/icons-react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { listShipments, type ShipmentListItem } from "./_server/actions";

const STATUS_LABELS: Record<string, string> = {
    created: "Created",
    in_transit: "In Transit",
    delivered: "Delivered",
    cancelled: "Cancelled",
    exception: "Exception",
};

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date));
}

export default function AirShipmentsPage() {
    const router = useRouter();
    const [shipments, setShipments] = React.useState<ShipmentListItem[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [search, setSearch] = React.useState("");
    const [total, setTotal] = React.useState(0);

    const fetchShipments = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await listShipments({
                search: search || undefined,
                limit: 50,
            });
            setShipments(result.shipments);
            setTotal(result.total);
        } catch (error) {
            console.error("Failed to fetch shipments:", error);
        } finally {
            setIsLoading(false);
        }
    }, [search]);

    React.useEffect(() => {
        fetchShipments();
    }, [fetchShipments]);

    // Calculate stats
    const stats = React.useMemo(() => {
        return {
            created: shipments.filter((s) => s.status === "created").length,
            in_transit: shipments.filter((s) => s.status === "in_transit").length,
            delivered: shipments.filter((s) => s.status === "delivered").length,
        }
    }, [shipments]);

    return (
        <DashboardShell title="Logix Dashboard - Air Shipments" itemCount={total}>
            <div className="flex flex-col gap-4">
                {/* Header & Controls */}
                <div className="win7-groupbox">
                    <legend>Shipment Controls</legend>
                    <div className="win7-p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex gap-4 items-center w-full sm:w-auto">
                            {/* Filter input */}
                            <div className="relative flex-1 sm:w-64">
                                <IconSearch className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-gray-500 pointer-events-none" />
                                <input
                                    placeholder="Search reference..."
                                    className="pl-7 pr-2 h-7 w-full border border-[#7f9db9] text-xs outline-none"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{ background: '#fff' }}
                                />
                            </div>
                            <button
                                onClick={fetchShipments}
                                disabled={isLoading}
                                className="win7-btn h-7 w-7 flex items-center justify-center p-0"
                                title="Refresh"
                            >
                                <IconRefresh
                                    className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
                                />
                            </button>
                        </div>

                        <Link href="/dashboard/air-shipments/new">
                            <button className="win7-btn flex items-center gap-1">
                                <IconPlus className="size-3.5" />
                                Create Shipment
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Status Bar / Stats */}
                <div className="grid grid-cols-4 gap-2">
                    <div className="border border-[#7f9db9] bg-white p-2">
                        <div className="text-xl font-bold font-sans">{total}</div>
                        <p className="text-[10px] text-gray-500 uppercase">Total</p>
                    </div>
                    <div className="border border-[#7f9db9] bg-white p-2">
                        <div className="text-xl font-bold font-sans text-blue-600">{stats.created}</div>
                        <p className="text-[10px] text-gray-500 uppercase">Created</p>
                    </div>
                    <div className="border border-[#7f9db9] bg-white p-2">
                        <div className="text-xl font-bold font-sans text-[#fc0]">{stats.in_transit}</div> {/* Win7 yellow-ish */}
                        <p className="text-[10px] text-gray-500 uppercase">In Transit</p>
                    </div>
                    <div className="border border-[#7f9db9] bg-white p-2">
                        <div className="text-xl font-bold font-sans text-green-600">{stats.delivered}</div>
                        <p className="text-[10px] text-gray-500 uppercase">Delivered</p>
                    </div>
                </div>

                {/* Table */}
                <div className="border border-[#7f9db9] bg-white">
                    <table className="win7-table w-full">
                        <thead>
                            <tr>
                                <th className="text-left py-1 pr-2">Reference</th>
                                <th className="text-left py-1 pr-2">Package</th>
                                <th className="text-left py-1 pr-2">Status</th>
                                <th className="text-left py-1 pr-2">Carrier</th>
                                <th className="text-left py-1 pr-2">Route</th>
                                <th className="text-left py-1">Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={6} className="py-2">
                                            <Skeleton className="h-4 w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : shipments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="h-32 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <IconPlane className="size-8 opacity-50" />
                                            <p>No shipments found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                shipments.map((shipment) => (
                                    <tr
                                        key={shipment.id}
                                        className="hover:bg-[#eef1ff] cursor-pointer"
                                        onClick={() =>
                                            router.push(
                                                `/dashboard/air-shipments/${shipment.id}`
                                            )
                                        }
                                    >
                                        <td className="font-mono text-xs text-blue-800">
                                            {shipment.referenceCode}
                                        </td>
                                        <td>
                                            <div>
                                                <div className="font-bold text-xs">
                                                    {shipment.packageName}
                                                </div>
                                                <div className="text-[10px] text-gray-500">
                                                    {shipment.weightKg} kg
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-xs">
                                                {STATUS_LABELS[shipment.status] || shipment.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div>
                                                <div className="text-xs">{shipment.carrier}</div>
                                                <div className="text-[10px] text-gray-500 font-mono">
                                                    {shipment.flightNumber}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="font-mono text-xs">
                                            {shipment.fromAirportIcao} → {shipment.toAirportIcao}
                                        </td>
                                        <td className="text-xs text-gray-500">
                                            {formatDate(shipment.createdAt)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardShell>
    );
}
