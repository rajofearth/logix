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
        <div className="flex items-center gap-1 select-none w-full">
            <ul className="win7-tablist flex-1">
                {floors.map((floor) => {
                    const utilizationPercent = formatCapacityPercentage(
                        floor.stats.usedCapacity,
                        floor.stats.totalCapacity
                    );
                    const isSelected = floor.id === selectedFloorId;

                    return (
                        <li key={floor.id}>
                            <button
                                onClick={() => onFloorSelect(floor.id)}
                                className={cn(
                                    "win7-tab flex items-center gap-2 relative",
                                    isSelected ? "active font-bold" : ""
                                )}
                                aria-selected={isSelected}
                            >
                                <span>F{floor.level}</span>
                                <span className={cn(
                                    "text-[10px]",
                                    isSelected ? "text-green-600" : "text-gray-500"
                                )}>
                                    {utilizationPercent}%
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>

            {onAddFloor && (
                <button
                    onClick={onAddFloor}
                    className="win7-btn h-[24px] w-[24px] flex items-center justify-center ml-2 shrink-0"
                    title="Add Floor"
                >
                    <Plus className="h-3 w-3" />
                </button>
            )}
        </div>
    );
}
