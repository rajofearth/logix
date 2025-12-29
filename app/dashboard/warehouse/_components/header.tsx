"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, CloudUpload, User, Thermometer, Settings } from "lucide-react"; // Assuming 'Cube' isn't valid, checking available icons later if needed, but 'Box' or 'Package' is likely. using 'Package' if 'Cube' fails or just generic SVG. Let's stick to standard lucide names.
import { Package, Users, Share2 } from "lucide-react";

export function WarehouseHeader() {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card/80 backdrop-blur-sm p-4 rounded-xl border shadow-sm shrink-0">
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <h2 className="text-lg font-bold tracking-tight">SZ-01</h2>
                    <span className="text-xs text-muted-foreground">Storage Zone</span>
                </div>

                <div className="h-8 w-px bg-border mx-2 hidden md:block" />

                <Select defaultValue="sz-01">
                    <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue placeholder="Select Zone" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="sz-01">SZ-01</SelectItem>
                        <SelectItem value="sz-02">SZ-02</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-6 lg:gap-10 text-sm overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                {/* Capacity Group */}
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                            <Package className="h-3.5 w-3.5" />
                            <span className="text-[10px] uppercase font-semibold">Capacity</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="font-bold text-base">12.8k <span className="text-xs font-normal text-muted-foreground">m²</span></span>
                            <span className="text-xs text-muted-foreground">13 Sections</span>
                        </div>
                    </div>
                </div>

                <div className="h-8 w-px bg-border/50 hidden md:block" />

                {/* Environment Group */}
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                            <Thermometer className="h-3.5 w-3.5" />
                            <span className="text-[10px] uppercase font-semibold">Environment</span>
                        </div>
                        <div className="flex items-baseline gap-3">
                            <span className="font-bold text-base text-emerald-600">26.3°C</span>
                            <span className="font-bold text-base text-blue-600">56% <span className="text-xs font-normal text-muted-foreground">H</span></span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 ml-auto">
                <div className="flex flex-col items-end mr-2 hidden lg:flex">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase">Last Updated</span>
                    <span className="text-xs font-mono">10:42:05 AM</span>
                </div>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent h-8 text-xs border-dashed">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Live
                </Button>
                <div className="h-8 w-px bg-border hidden md:block" />
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
