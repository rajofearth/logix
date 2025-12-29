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
    CloudUpload,
    Settings,
    Building2,
    Layers,
    Boxes,
    MapPin,
    Plus,
    ScanBarcode,
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

    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card/80 backdrop-blur-sm p-4 rounded-xl border shadow-sm shrink-0">
            {/* Warehouse Selector */}
            <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                </div>

                <div className="flex flex-col min-w-0">
                    <Select value={selectedWarehouseId} onValueChange={(value) => value && onWarehouseChange(value)}>
                        <SelectTrigger className="w-[220px] h-9 font-semibold text-sm border-none shadow-none p-0 focus:ring-0">
                            <SelectValue placeholder="Select Warehouse" />
                        </SelectTrigger>
                        <SelectContent>
                            {warehouses.map((warehouse) => (
                                <SelectItem key={warehouse.id} value={warehouse.id}>
                                    <div className="flex items-center gap-2">
                                        <span>{warehouse.name}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {selectedWarehouse && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{selectedWarehouse.city}</span>
                            <span className="mx-1">•</span>
                            <span className="font-mono">{selectedWarehouse.code}</span>
                        </div>
                    )}
                </div>

                <div className="h-10 w-px bg-border mx-2 hidden md:block" />

                {/* Quick Stats */}
                {selectedWarehouse && (
                    <div className="hidden lg:flex items-center gap-6 text-sm">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                                <Layers className="h-3.5 w-3.5" />
                                <span className="text-[10px] uppercase font-semibold">Floors</span>
                            </div>
                            <span className="font-bold text-base">{selectedWarehouse.totalFloors}</span>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                                <Boxes className="h-3.5 w-3.5" />
                                <span className="text-[10px] uppercase font-semibold">Blocks</span>
                            </div>
                            <span className="font-bold text-base">{selectedWarehouse.totalBlocks}</span>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                                <span className="text-[10px] uppercase font-semibold">Capacity</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-base">{capacityPercent}%</span>
                                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${capacityPercent >= 90
                                            ? "bg-red-500"
                                            : capacityPercent >= 70
                                                ? "bg-amber-500"
                                                : "bg-emerald-500"
                                            }`}
                                        style={{ width: `${capacityPercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-auto">
                {/* Quick Actions */}
                <div className="hidden md:flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                        <ScanBarcode className="h-3.5 w-3.5" />
                        Scan
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                        <Plus className="h-3.5 w-3.5" />
                        Add Product
                    </Button>
                </div>

                <div className="h-8 w-px bg-border hidden md:block" />

                {/* Live Indicator */}
                <Button variant="outline" size="sm" className="gap-2 bg-transparent h-8 text-xs border-dashed">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Live
                </Button>

                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Settings className="h-4 w-4" />
                </Button>
                <Button variant="default" size="sm" className="h-8 text-xs shadow-md shadow-primary/20">
                    <CloudUpload className="h-3.5 w-3.5 mr-2" />
                    Export
                </Button>
            </div>
        </div>
    );
}
