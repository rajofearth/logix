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

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { listShipments, type ShipmentListItem } from "./_server/actions";

const STATUS_COLORS: Record<string, string> = {
    created: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    in_transit: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    delivered: "bg-green-500/10 text-green-500 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    exception: "bg-orange-500/10 text-orange-500 border-orange-500/20",
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
                <SiteHeader title="Air Shipments" />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                            {/* Header */}
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight">
                                        Air Shipments
                                    </h1>
                                    <p className="text-muted-foreground">
                                        Manage and track your air cargo shipments
                                    </p>
                                </div>
                                <Link href="/dashboard/air-shipments/new">
                                    <Button className="gap-2">
                                        <IconPlus className="size-4" />
                                        Create Shipment
                                    </Button>
                                </Link>
                            </div>

                            {/* Filters */}
                            <div className="flex gap-4">
                                <div className="relative flex-1 max-w-sm">
                                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by reference code..."
                                        className="pl-9"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={fetchShipments}
                                    disabled={isLoading}
                                >
                                    <IconRefresh
                                        className={`size-4 ${isLoading ? "animate-spin" : ""}`}
                                    />
                                </Button>
                            </div>

                            {/* Stats */}
                            <div className="grid gap-4 md:grid-cols-4">
                                <div className="rounded-lg border bg-card p-4">
                                    <div className="text-2xl font-bold">{total}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Total Shipments
                                    </p>
                                </div>
                                <div className="rounded-lg border bg-card p-4">
                                    <div className="text-2xl font-bold text-blue-500">
                                        {shipments.filter((s) => s.status === "created").length}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Created</p>
                                </div>
                                <div className="rounded-lg border bg-card p-4">
                                    <div className="text-2xl font-bold text-yellow-500">
                                        {shipments.filter((s) => s.status === "in_transit").length}
                                    </div>
                                    <p className="text-xs text-muted-foreground">In Transit</p>
                                </div>
                                <div className="rounded-lg border bg-card p-4">
                                    <div className="text-2xl font-bold text-green-500">
                                        {shipments.filter((s) => s.status === "delivered").length}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Delivered</p>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="rounded-lg border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Reference</TableHead>
                                            <TableHead>Package</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Carrier</TableHead>
                                            <TableHead>Route</TableHead>
                                            <TableHead>Created</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            Array.from({ length: 5 }).map((_, i) => (
                                                <TableRow key={i}>
                                                    <TableCell>
                                                        <Skeleton className="h-4 w-32" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className="h-4 w-40" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className="h-5 w-20" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className="h-4 w-28" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className="h-4 w-24" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className="h-4 w-20" />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : shipments.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={6}
                                                    className="h-32 text-center text-muted-foreground"
                                                >
                                                    <div className="flex flex-col items-center gap-2">
                                                        <IconPlane className="size-8 opacity-50" />
                                                        <p>No shipments found</p>
                                                        <Link href="/dashboard/air-shipments/new">
                                                            <Button variant="outline" size="sm">
                                                                Create your first shipment
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            shipments.map((shipment) => (
                                                <TableRow
                                                    key={shipment.id}
                                                    className="cursor-pointer hover:bg-muted/50"
                                                    onClick={() =>
                                                        router.push(
                                                            `/dashboard/air-shipments/${shipment.id}`
                                                        )
                                                    }
                                                >
                                                    <TableCell className="font-mono text-sm">
                                                        {shipment.referenceCode}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">
                                                                {shipment.packageName}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {shipment.weightKg} kg
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className={STATUS_COLORS[shipment.status]}
                                                        >
                                                            {shipment.status.replace("_", " ")}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="text-sm">{shipment.carrier}</div>
                                                            <div className="text-xs text-muted-foreground font-mono">
                                                                {shipment.flightNumber}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-sm">
                                                        {shipment.fromAirportIcao} → {shipment.toAirportIcao}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {formatDate(shipment.createdAt)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
