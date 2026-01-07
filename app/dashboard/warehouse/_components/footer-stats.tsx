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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 shrink-0">
            {/* Storage Available */}
            <div className="p-2 border border-[#7f9db9] bg-white">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Archive className="h-3.5 w-3.5 text-blue-600" />
                    <span className="font-bold text-black">Storage Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-4 bg-gray-200 border border-gray-400 overflow-hidden flex shadow-inner">
                        <div
                            className="h-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-medium"
                            style={{ width: `${capacityPercent}%` }}
                        >
                        </div>
                    </div>
                    <span className="text-xs font-mono">{capacityPercent}%</span>
                </div>
            </div>

            {/* Total Items */}
            <div className="p-2 border border-[#7f9db9] bg-white">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <Package className="h-3.5 w-3.5 text-blue-600" />
                    <span className="font-bold text-black">Total Items</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-black font-sans">
                        {floor.stats.totalItems.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-green-600 font-bold">↑ 43%</span>
                </div>
            </div>

            {/* Active Workers */}
            <div className="p-2 border border-[#7f9db9] bg-white">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <Users className="h-3.5 w-3.5 text-amber-600" />
                    <span className="font-bold text-black">Active workers</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-black font-sans">
                        {floor.stats.activeWorkers}
                    </span>
                </div>
            </div>

            {/* Orders */}
            <div className="p-2 border border-[#7f9db9] bg-white">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <ShoppingCart className="h-3.5 w-3.5 text-green-600" />
                    <span className="font-bold text-black">Orders</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-black font-sans">
                        {orders.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-green-600 font-bold">↑ {ordersChange}%</span>
                </div>
            </div>

            {/* Stock Utilization */}
            <div className="p-2 border border-[#7f9db9] bg-white">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <BarChart3 className="h-3.5 w-3.5 text-red-600" />
                    <span className="font-bold text-black">Stock utilization</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-black font-sans">
                        {stockUtilization}%
                    </span>
                    <span className="text-[10px] text-green-600 font-bold">↑ {utilizationChange}%</span>
                </div>
            </div>
        </div>
    );
}
