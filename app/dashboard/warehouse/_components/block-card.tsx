"use client";

import { cn } from "@/lib/utils";
import { Block, formatCapacityPercentage, getCategoryIcon, getStatusColor } from "./types";
import { Package, Clock } from "lucide-react";

interface BlockCardProps {
    block: Block;
    onClick: (block: Block) => void;
}

export function BlockCard({ block, onClick }: BlockCardProps) {
    const usagePercent = formatCapacityPercentage(block.used, block.capacity);
    const statusColor = getStatusColor(block.status);
    const categoryIcon = getCategoryIcon(block.category);

    // Determine status ring color for glow effect
    const statusRingClass =
        block.status === "critical" ? "ring-red-500/30" :
            block.status === "warning" ? "ring-amber-500/30" :
                block.status === "empty" ? "ring-zinc-500/20" : "ring-emerald-500/20";

    return (
        <button
            onClick={() => onClick(block)}
            className={cn(
                "group relative flex flex-col p-3 rounded-xl transition-all duration-300",
                "bg-card border shadow-sm hover:shadow-lg",
                "hover:scale-[1.02] hover:border-primary/50",
                "ring-2 ring-offset-1 ring-offset-background",
                statusRingClass,
                "cursor-pointer focus:outline-none focus:ring-primary/50"
            )}
        >
            {/* Block Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-lg">{categoryIcon}</span>
                    <span className="font-bold text-sm">{block.name}</span>
                </div>
                <div className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide",
                    block.status === "critical" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                        block.status === "warning" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                            block.status === "empty" ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" :
                                "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                )}>
                    {usagePercent}%
                </div>
            </div>

            {/* Fill Level Visualization */}
            <div className="relative h-16 w-full rounded-lg bg-muted/50 overflow-hidden mb-2">
                <div
                    className={cn(
                        "absolute bottom-0 left-0 right-0 transition-all duration-500 rounded-t-sm",
                        statusColor
                    )}
                    style={{ height: `${Math.max(usagePercent, 2)}%` }}
                />
                {/* Grid lines overlay */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="border-b border-dashed border-foreground/10 h-1/4" />
                    <div className="border-b border-dashed border-foreground/10 h-1/4" />
                    <div className="border-b border-dashed border-foreground/10 h-1/4" />
                </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    <span>{block.used.toLocaleString()}/{block.capacity.toLocaleString()}</span>
                </div>
                {block.lastActivity && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Clock className="h-3 w-3" />
                        <span>
                            {new Date(block.lastActivity).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                    </div>
                )}
            </div>

            {/* Hover overlay with more info */}
            <div className={cn(
                "absolute inset-0 rounded-xl bg-linear-to-t from-black/80 via-black/40 to-transparent",
                "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                "flex items-end justify-center p-3 pointer-events-none"
            )}>
                <span className="text-xs text-white font-medium">Click for details</span>
            </div>
        </button>
    );
}

// Legend component to display status meanings
export function BlockLegend() {
    return (
        <div className="flex items-center gap-4 px-3 py-2 bg-muted/30 rounded-lg text-xs">
            <span className="text-muted-foreground font-medium">Capacity:</span>
            <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-emerald-500" />
                <span>Normal (0-70%)</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-amber-500" />
                <span>Warning (70-90%)</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span>Critical (90-100%)</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-zinc-300 dark:bg-zinc-700" />
                <span>Empty</span>
            </div>
        </div>
    );
}
