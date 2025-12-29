"use client";

import { cn } from "@/lib/utils";
import { Floor, formatCapacityPercentage } from "./types";
import { Plus } from "lucide-react";

interface FloorNavigatorProps {
    floors: Floor[];
    selectedFloorId: string;
    onFloorSelect: (floorId: string) => void;
    onAddFloor?: () => void;
}

export function FloorNavigator({ floors, selectedFloorId, onFloorSelect, onAddFloor }: FloorNavigatorProps) {
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

            {onAddFloor && (
                <button
                    onClick={onAddFloor}
                    className="flex items-center justify-center w-8 h-8 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors ml-1"
                    title="Add Floor"
                >
                    <Plus className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
