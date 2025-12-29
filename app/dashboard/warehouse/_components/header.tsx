"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
    Eye,
    Users,
    Maximize2,
    Thermometer,
    Droplets,
    Settings,
} from "lucide-react";
import { Warehouse, formatCapacityPercentage } from "./types";

interface WarehouseHeaderProps {
    warehouses: Warehouse[];
    selectedWarehouseId: string;
    onWarehouseChange: (warehouseId: string) => void;
}

export function WarehouseHeader({
    warehouses,
    selectedWarehouseId,
    onWarehouseChange,
}: WarehouseHeaderProps) {
    const selectedWarehouse = warehouses.find((w) => w.id === selectedWarehouseId);
    const capacityPercent = selectedWarehouse
        ? formatCapacityPercentage(selectedWarehouse.usedCapacity, selectedWarehouse.totalCapacity)
        : 0;

    // Calculate total size in m² (mock)
    const totalSize = selectedWarehouse ? Math.round(selectedWarehouse.totalCapacity * 0.5) : 0;

    return (
        <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-zinc-900/80 border border-zinc-800 shrink-0">
            {/* Left: Zone Info */}
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <span className="text-lg font-bold text-white">{selectedWarehouse?.code || "SZ-01"}</span>
                    <span className="text-xs text-zinc-400">Storage Zone</span>
                </div>

                <div className="flex items-center gap-2 ml-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-xs">
                        <Eye className="h-3.5 w-3.5" />
                        <span>{selectedWarehouse?.totalBlocks || 120}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-xs">
                        <Users className="h-3.5 w-3.5" />
                        <span>{selectedWarehouse?.workers || 120}</span>
                    </div>
                </div>

                <Select value={selectedWarehouseId} onValueChange={(value) => value && onWarehouseChange(value)}>
                    <SelectTrigger className="w-[120px] h-8 text-xs bg-zinc-800 border-zinc-700 text-zinc-300">
                        <SelectValue placeholder="Zone" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                        {warehouses.map((warehouse) => (
                            <SelectItem key={warehouse.id} value={warehouse.id} className="text-zinc-300">
                                {warehouse.code}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Center: Key Metrics */}
            <div className="hidden lg:flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                        <Maximize2 className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-6 text-sm">
                    <div className="flex flex-col items-center">
                        <span className="text-white font-semibold">{totalSize.toLocaleString()} m²</span>
                        <span className="text-[10px] text-zinc-500">Total Size</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-white font-semibold">{selectedWarehouse?.totalFloors || 13}</span>
                        <span className="text-[10px] text-zinc-500">Sections</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-cyan-400 font-semibold flex items-center gap-1">
                            <Thermometer className="h-3 w-3" />
                            26.3°C
                        </span>
                        <span className="text-[10px] text-zinc-500">Temperature</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <Droplets className="h-3 w-3" />
                            56.2%
                        </span>
                        <span className="text-[10px] text-zinc-500">Humidity</span>
                    </div>
                </div>
            </div>

            {/* Right: Live Status & Actions */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-800 border border-zinc-700">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="text-xs text-zinc-300">Live Data</span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                    <Settings className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
