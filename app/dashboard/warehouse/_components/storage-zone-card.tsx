"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Package } from "lucide-react";
import { cn } from "@/lib/utils";

// Types for our mock data
export interface SubSection {
    id: string;
    name: string;
    workers: number;
    items: number;
    capacity: number;
    type: 'grid' | 'list' | 'large-block';
    items_list?: string[]; // e.g. ["S01", "S01"]
    status?: 'active' | 'warning' | 'alert';
}

export interface StorageZone {
    id: string;
    name: string;
    sections: SubSection[];
}

interface StorageZoneCardProps {
    zone: StorageZone;
}

export function StorageZoneCard({ zone }: StorageZoneCardProps) {
    return (
        <Card className="bg-muted/20 p-3 rounded-[1.5rem] border border-border/50 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-700 px-2.5 py-0.5 text-xs font-medium rounded-md">
                    {zone.id} - {zone.name}
                </Badge>
            </div>

            <div className="grid grid-cols-12 gap-3 flex-1 h-full">
                {/* Layout mimicking the image - Left Column */}
                <div className="col-span-12 md:col-span-4 flex flex-col gap-3 h-full">
                    {zone.sections.filter(s => s.name === "01").map(section => (
                        <SubSectionCard key={section.id} section={section} className="h-full bg-white dark:bg-card border shadow-sm" />
                    ))}
                </div>

                {/* Right Column (Split into rows) */}
                <div className="col-span-12 md:col-span-8 flex flex-col gap-3 h-full">
                    <div className="grid grid-cols-2 gap-3 flex-1">
                        {zone.sections.filter(s => s.name === "02" || s.name === "03").map(section => (
                            <SubSectionCard key={section.id} section={section} className="bg-white dark:bg-card border shadow-sm h-full" />
                        ))}
                    </div>
                    <div className="flex-1">
                        {zone.sections.filter(s => s.name === "04").map(section => (
                            <SubSectionCard key={section.id} section={section} className="bg-white dark:bg-card border shadow-sm h-full" />
                        ))}
                    </div>
                    <div className="flex-1">
                        {zone.sections.filter(s => s.name === "05").map(section => (
                            <SubSectionCard key={section.id} section={section} className="bg-white dark:bg-card border shadow-sm h-full" />
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
}

function SubSectionCard({ section, className }: { section: SubSection, className?: string }) {
    return (
        <Card className={cn("p-3 rounded-lg flex flex-col", className)}>
            <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-sm">{section.name} <span className="text-[10px] text-muted-foreground font-normal">s</span></span>
                <div className="flex gap-2 text-[10px] text-muted-foreground font-medium">
                    <div className="flex items-center gap-1">
                        <User className="h-2.5 w-2.5" />
                        {section.workers}
                    </div>
                    <div className="flex items-center gap-1">
                        <Package className="h-2.5 w-2.5" />
                        {section.items}/{section.capacity}
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-auto">
                {section.items_list?.map((item, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "h-6 rounded-[4px] flex items-center justify-center text-[10px] font-bold w-[calc(33%-4px)] flex-grow transition-all hover:scale-105 cursor-default",
                            item === "S01" && idx % 3 === 0 ? "bg-red-100 text-red-600 dark:bg-red-900/20" :
                                item === "S01" && idx % 2 === 0 ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20" :
                                    "bg-orange-100 text-orange-600 dark:bg-orange-900/20",
                            // Simple heuristic to vary colors like in the image
                            section.name === "01" ? "bg-zinc-100 text-zinc-500 w-full dark:bg-zinc-800 dark:text-zinc-400" : "", // Generic huge blocks for 01
                            section.name === "01" && idx === 1 ? "bg-amber-100 text-amber-600 w-full dark:bg-amber-900/20" : "",
                            section.name === "01" && idx === 2 ? "bg-amber-100 text-amber-600 w-full dark:bg-amber-900/20" : ""
                        )}
                    >
                        {item}
                    </div>
                ))}
            </div>
        </Card>
    )
}
