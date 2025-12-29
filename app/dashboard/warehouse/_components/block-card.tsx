"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Block, formatCapacityPercentage, getCategoryIcon } from "./types";
import { Users } from "lucide-react";

interface BlockCardProps {
    block: Block;
    onClick: (block: Block) => void;
    isHighlighted?: boolean;
}

// Generate slot visualization similar to reference image
function SlotGrid({ block }: { block: Block }) {
    const totalSlots = Math.min(block.capacity, 12); // Max 12 slots for display
    const filledSlots = Math.round((block.used / block.capacity) * totalSlots);

    const getSlotColor = (index: number) => {
        if (index >= filledSlots) return "bg-zinc-700/50"; // Empty slot
        if (block.status === "critical") return "bg-red-500/80";
        if (block.status === "warning") return "bg-amber-500/80";
        return "bg-emerald-500/80";
    };

    // Create rows of slots (3 per row)
    const rows = [];
    for (let i = 0; i < totalSlots; i += 3) {
        const rowSlots = [];
        for (let j = 0; j < 3 && i + j < totalSlots; j++) {
            const slotIndex = i + j;
            rowSlots.push(
                <div
                    key={slotIndex}
                    className={cn(
                        "h-5 rounded text-[9px] flex items-center justify-center font-medium",
                        getSlotColor(slotIndex),
                        slotIndex < filledSlots ? "text-white/80" : "text-zinc-500"
                    )}
                >
                    S{String(slotIndex + 1).padStart(2, "0")}
                </div>
            );
        }
        rows.push(
            <div key={i} className="grid grid-cols-3 gap-1">
                {rowSlots}
            </div>
        );
    }

    return <div className="space-y-1">{rows}</div>;
}

export function BlockCard({ block, onClick, isHighlighted }: BlockCardProps) {
    const cardRef = useRef<HTMLButtonElement>(null);
    const usagePercent = formatCapacityPercentage(block.used, block.capacity);
    const CategoryIcon = getCategoryIcon(block.category);

    // Mock worker count based on block usage
    const workers = Math.max(1, Math.floor(block.used / 50));

    // Scroll into view when highlighted
    useEffect(() => {
        if (isHighlighted && cardRef.current) {
            cardRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [isHighlighted]);

    return (
        <button
            ref={cardRef}
            onClick={() => onClick(block)}
            className={cn(
                "flex flex-col p-3 rounded-lg bg-zinc-900/60 border transition-all text-left w-full",
                isHighlighted
                    ? "border-primary ring-2 ring-primary/50 animate-pulse"
                    : "border-zinc-800 hover:border-zinc-600"
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-white">{block.column.toString().padStart(2, "0")}</span>
                    <span className="text-xs text-zinc-500">s</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{workers}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <CategoryIcon className="h-3 w-3" />
                        <span>{block.used}/{block.capacity}</span>
                    </div>
                </div>
            </div>

            {/* Slot Grid */}
            <SlotGrid block={block} />
        </button>
    );
}

// Simple legend - matching dark theme
export function BlockLegend() {
    return (
        <div className="flex items-center gap-6 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span>Normal</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                <span>Warning</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-red-500" />
                <span>Critical</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-zinc-700" />
                <span>Empty</span>
            </div>
        </div>
    );
}
