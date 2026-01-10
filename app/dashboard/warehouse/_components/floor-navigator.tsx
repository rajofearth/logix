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
        <div className="flex items-center gap-1 select-none">
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
                            "px-3 py-1 rounded-sm text-xs font-sans border flex items-center gap-2 relative top-[1px]",
                            isSelected
                                ? "bg-white border-[#7f9db9] border-b-transparent z-10 font-bold"
                                : "bg-[#ece9d8] border-[#aca899] text-gray-600 hover:bg-[#f5f5f5]"
                        )}
                        style={isSelected ? { marginBottom: "-1px", height: "30px" } : { height: "28px" }}
                    >
                        <span>F{floor.level}</span>
                        <span className={cn(
                            "text-[10px]",
                            isSelected ? "text-green-600" : "text-gray-500"
                        )}>
                            {utilizationPercent}%
                        </span>
                    </button>
                );
            })}

            {onAddFloor && (
                <button
                    onClick={onAddFloor}
                    className="win7-btn h-[24px] w-[24px] flex items-center justify-center ml-2"
                    title="Add Floor"
                >
                    <Plus className="h-3 w-3" />
                </button>
            )}
        </div>
    );
}
