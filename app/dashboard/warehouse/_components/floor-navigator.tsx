"use client";

import { cn } from "@/lib/utils";
import { Floor, formatCapacityPercentage } from "./types";
import { Building2, Thermometer, Droplets, Users, Package } from "lucide-react";

interface FloorNavigatorProps {
    floors: Floor[];
    selectedFloorId: string;
    onFloorSelect: (floorId: string) => void;
}

export function FloorNavigator({ floors, selectedFloorId, onFloorSelect }: FloorNavigatorProps) {
    const selectedFloor = floors.find((f) => f.id === selectedFloorId);

    return (
        <div className="flex flex-col gap-3 bg-card/80 backdrop-blur-sm rounded-xl border p-3 shadow-sm">
            {/* Floor Tabs */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
                    <Building2 className="h-3.5 w-3.5" />
                    <span className="font-medium">Floors</span>
                </div>
                <div className="flex gap-1.5 flex-1 overflow-x-auto scrollbar-none">
                    {floors.map((floor) => {
                        const utilizationPercent = formatCapacityPercentage(
                            floor.stats.usedCapacity,
                            floor.stats.totalCapacity
                        );
                        const isSelected = floor.id === selectedFloorId;

                        return (
                            <button
                                key={floor.id}
                                onClick={() => onFloorSelect(floor.id)}
                                className={cn(
                                    "relative flex flex-col items-center px-4 py-2 rounded-lg transition-all duration-200 min-w-[72px]",
                                    "border hover:border-primary/30",
                                    isSelected
                                        ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                                        : "bg-muted/30 hover:bg-muted/60 border-transparent"
                                )}
                            >
                                <span className="font-semibold text-sm">F{floor.level}</span>
                                <span className={cn(
                                    "text-[10px] font-medium",
                                    isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                                )}>
                                    {utilizationPercent}%
                                </span>
                                {/* Utilization indicator bar */}
                                <div className="absolute bottom-0 left-1 right-1 h-0.5 bg-black/10 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all",
                                            isSelected ? "bg-primary-foreground/50" :
                                                utilizationPercent >= 90 ? "bg-red-500" :
                                                    utilizationPercent >= 70 ? "bg-amber-500" :
                                                        "bg-emerald-500"
                                        )}
                                        style={{ width: `${utilizationPercent}%` }}
                                    />
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Selected Floor Stats */}
                {selectedFloor && (
                    <div className="hidden lg:flex items-center gap-4 ml-auto pl-4 border-l">
                        <div className="flex items-center gap-1.5 text-xs">
                            <Package className="h-3 w-3 text-blue-500" />
                            <span className="text-muted-foreground">Items:</span>
                            <span className="font-semibold">
                                {selectedFloor.stats.totalItems.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                            <Users className="h-3 w-3 text-indigo-500" />
                            <span className="text-muted-foreground">Workers:</span>
                            <span className="font-semibold">{selectedFloor.stats.activeWorkers}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                            <Thermometer className="h-3 w-3 text-orange-500" />
                            <span className="font-semibold">
                                {selectedFloor.stats.averageTemperature?.toFixed(1)}°C
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                            <Droplets className="h-3 w-3 text-cyan-500" />
                            <span className="font-semibold">
                                {selectedFloor.stats.averageHumidity?.toFixed(0)}%
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
