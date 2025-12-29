"use client";

import { Card } from "@/components/ui/card";
import {
    Archive,
    Users,
    Truck,
    PackageCheck,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
} from "lucide-react";
import { Warehouse, Floor, Block } from "./types";

interface WarehouseFooterStatsProps {
    warehouse: Warehouse;
    floor: Floor;
}

export function WarehouseFooterStats({ warehouse, floor }: WarehouseFooterStatsProps) {
    // Calculate stats
    const capacityPercent = Math.round(
        (floor.stats.usedCapacity / floor.stats.totalCapacity) * 100
    );
    const freePercent = 100 - capacityPercent;

    // Count blocks at different statuses
    const criticalBlocks = floor.blocks.filter((b) => b.status === "critical").length;
    const warningBlocks = floor.blocks.filter((b) => b.status === "warning").length;

    // Count products expiring soon
    const expiringProducts = floor.blocks.reduce((count, block) => {
        return (
            count +
            block.products.filter(
                (p) =>
                    p.expiryDate &&
                    new Date(p.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            ).length
        );
    }, 0);

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 shrink-0">
            {/* Storage Available */}
            <Card className="p-3 flex flex-col justify-between shadow-sm bg-card/80 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Archive className="h-3.5 w-3.5 text-primary" />
                    <span>Floor Capacity</span>
                </div>
                <div className="space-y-1">
                    <div className="flex items-end gap-2">
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex relative">
                            <div
                                className={`h-full rounded-full ${capacityPercent >= 90
                                    ? "bg-red-500"
                                    : capacityPercent >= 70
                                        ? "bg-amber-500"
                                        : "bg-indigo-500"
                                    }`}
                                style={{ width: `${capacityPercent}%` }}
                            />
                        </div>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="font-bold">{capacityPercent}%</span>
                        <span className="text-muted-foreground">Free: {freePercent}%</span>
                    </div>
                </div>
            </Card>

            {/* Total Items */}
            <Card className="p-3 shadow-sm bg-card/80 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded">
                        <PackageCheck className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span>Total Items</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold">
                        {floor.stats.totalItems.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-medium text-emerald-600 flex items-center bg-emerald-100/50 dark:bg-emerald-900/20 px-1 rounded">
                        <TrendingUp className="h-3 w-3 mr-0.5" />
                        +12%
                    </span>
                </div>
            </Card>

            {/* Active Workers */}
            <Card className="p-3 shadow-sm bg-card/80 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <div className="p-1 bg-indigo-100 dark:bg-indigo-900/30 rounded">
                        <Users className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span>Active Workers</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold">{floor.stats.activeWorkers}</span>
                    <span className="text-[10px] text-muted-foreground">on this floor</span>
                </div>
            </Card>

            {/* Blocks at Capacity */}
            <Card className="p-3 shadow-sm bg-card/80 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <div className="p-1 bg-amber-100 dark:bg-amber-900/30 rounded">
                        <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span>Alerts</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-red-600">{criticalBlocks}</span>
                    <span className="text-[10px] text-muted-foreground">critical</span>
                    <span className="text-xl font-bold text-amber-600 ml-2">{warningBlocks}</span>
                    <span className="text-[10px] text-muted-foreground">warning</span>
                </div>
            </Card>

            {/* Expiring Soon */}
            <Card className="p-3 shadow-sm bg-card/80 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <div className="p-1 bg-rose-100 dark:bg-rose-900/30 rounded">
                        <Truck className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                    </div>
                    <span>Expiring (30d)</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold">{expiringProducts}</span>
                    <span className="text-[10px] text-muted-foreground">products</span>
                    {expiringProducts > 0 && (
                        <span className="text-[10px] font-medium text-rose-600 flex items-center bg-rose-100/50 dark:bg-rose-900/20 px-1 rounded">
                            <TrendingDown className="h-3 w-3 mr-0.5" />
                            Action needed
                        </span>
                    )}
                </div>
            </Card>
        </div>
    );
}
