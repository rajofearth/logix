"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, CloudUpload, User } from "lucide-react"; // Assuming 'Cube' isn't valid, checking available icons later if needed, but 'Box' or 'Package' is likely. using 'Package' if 'Cube' fails or just generic SVG. Let's stick to standard lucide names.
import { Package, Users, Share2 } from "lucide-react";

export function WarehouseHeader() {
    return (
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between bg-card p-6 rounded-xl border shadow-sm">
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold tracking-tight">SZ-01</h2>
                    <span className="text-sm text-muted-foreground">Storage Zone</span>
                </div>

                <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-md">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background rounded shadow-sm text-sm font-medium">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span>120</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>120</span>
                    </div>
                </div>

                <Select defaultValue="sz-01">
                    <SelectTrigger className="w-[140px] h-9">
                        <SelectValue placeholder="Select Zone" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="sz-01">SZ-01</SelectItem>
                        <SelectItem value="sz-02">SZ-02</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-8 text-sm">
                <div className="flex items-center gap-4">
                    <Share2 className="h-5 w-5 text-muted-foreground rotate-90" />
                    <div className="h-10 w-10 bg-black text-white rounded-xl flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="3" x2="9" y2="21" /></svg>
                    </div>
                </div>

                <div className="flex flex-col">
                    <span className="font-bold text-lg">12,796 m²</span>
                    <span className="text-muted-foreground text-xs">Total Size</span>
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-lg">13</span>
                    <span className="text-muted-foreground text-xs">Sections</span>
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-lg text-emerald-600">26.3°C</span>
                    <span className="text-muted-foreground text-xs">Temperature</span>
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-lg text-emerald-600">56.2%</span>
                    <span className="text-muted-foreground text-xs">Humidity</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button variant="outline" className="gap-2 bg-background">
                    <Calendar className="h-4 w-4" />
                    Live Data
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                </Button>
                <Button variant="outline" size="icon">
                    <CloudUpload className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
