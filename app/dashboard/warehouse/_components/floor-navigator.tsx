"use client";

import { cn } from "@/lib/utils";
import { Floor, formatCapacityPercentage } from "./types";

interface FloorNavigatorProps {
    floors: Floor[];
    selectedFloorId: string;
    onFloorSelect: (floorId: string) => void;
}

export function FloorNavigator({ floors, selectedFloorId, onFloorSelect }: FloorNavigatorProps) {
    return (
        <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-900/60 border border-zinc-800 shrink-0 w-fit">
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
                            "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
                            isSelected
                                ? "bg-zinc-700 text-white"
                                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                        )}
                    >
                        <span>F{floor.level}</span>
                        <span className={cn(
                            "ml-1.5 text-xs",
                            isSelected ? "text-zinc-300" : "text-zinc-500"
                        )}>
                            {utilizationPercent}%
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
