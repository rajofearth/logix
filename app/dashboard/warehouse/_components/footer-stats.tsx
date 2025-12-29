"use client";

import { Floor } from "./types";
import {
    Archive,
    Package,
    Users,
    ShoppingCart,
    BarChart3,
} from "lucide-react";

interface WarehouseFooterStatsProps {
    floor: Floor;
}

export function WarehouseFooterStats({ floor }: WarehouseFooterStatsProps) {
    const capacityPercent = Math.round(
        (floor.stats.usedCapacity / floor.stats.totalCapacity) * 100
    );
    const freePercent = 100 - capacityPercent;

    // Mock order count
    const orders = 23000;
    const ordersChange = 40;

    // Stock utilization
    const stockUtilization = 78.74;
    const utilizationChange = 10;

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 shrink-0">
            {/* Storage Available */}
            <div className="p-4 rounded-lg bg-zinc-900/80 border border-zinc-800">
                <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
                    <Archive className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Storage Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-6 bg-zinc-800 rounded-md overflow-hidden flex">
                        <div
                            className="h-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-medium"
                            style={{ width: `${capacityPercent}%` }}
                        >
                            {capacityPercent}%
                        </div>
                        <div className="flex-1 flex items-center justify-center text-[10px] text-zinc-400">
                            {freePercent}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Total Items */}
            <div className="p-4 rounded-lg bg-zinc-900/80 border border-zinc-800">
                <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                    <Package className="h-3.5 w-3.5 text-blue-400" />
                    <span>Total Items</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-white">
                        {floor.stats.totalItems.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-400">↑ 43%</span>
                </div>
            </div>

            {/* Active Workers */}
            <div className="p-4 rounded-lg bg-zinc-900/80 border border-zinc-800">
                <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                    <Users className="h-3.5 w-3.5 text-amber-400" />
                    <span>Active workers</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-white">
                        {floor.stats.activeWorkers}
                    </span>
                </div>
            </div>

            {/* Orders */}
            <div className="p-4 rounded-lg bg-zinc-900/80 border border-zinc-800">
                <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                    <ShoppingCart className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Orders</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-white">
                        {orders.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-400">↑ {ordersChange}%</span>
                </div>
            </div>

            {/* Stock Utilization */}
            <div className="p-4 rounded-lg bg-zinc-900/80 border border-zinc-800">
                <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                    <BarChart3 className="h-3.5 w-3.5 text-rose-400" />
                    <span>Stock utilization</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-white">
                        {stockUtilization}%
                    </span>
                    <span className="text-[10px] text-emerald-400">↑ {utilizationChange}%</span>
                </div>
            </div>
        </div>
    );
}
