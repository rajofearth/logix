"use client";

import { Navigation, Flag, Route, Gauge } from "lucide-react";

interface DeliveryStatusBarProps {
    currentLocation: string;
    lastStop: string;
    distance: string;
    currentSpeed: string;
}

export function DeliveryStatusBar({
    currentLocation,
    lastStop,
    distance,
    currentSpeed,
}: DeliveryStatusBarProps) {
    return (
        <div className="inline-flex bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-lg px-4 py-2.5">
            <div className="flex items-center gap-6">
                {/* Current Location */}
                <div className="flex items-center gap-2 text-center">
                    <Navigation className="size-4 text-emerald-500 shrink-0" />
                    <div>
                        <p className="text-[10px] text-muted-foreground">Current location</p>
                        <p className="text-xs font-medium text-foreground">{currentLocation}</p>
                    </div>
                </div>

                <div className="w-px h-8 bg-border" />

                {/* Last Stop */}
                <div className="flex items-center gap-2 text-center">
                    <Flag className="size-4 text-muted-foreground shrink-0" />
                    <div>
                        <p className="text-[10px] text-muted-foreground">Last stop</p>
                        <p className="text-xs font-medium text-foreground">{lastStop}</p>
                    </div>
                </div>

                <div className="w-px h-8 bg-border" />

                {/* Distance */}
                <div className="flex items-center gap-2 text-center">
                    <Route className="size-4 text-muted-foreground shrink-0" />
                    <div>
                        <p className="text-[10px] text-muted-foreground">Distance</p>
                        <p className="text-xs font-medium text-foreground">{distance}</p>
                    </div>
                </div>

                <div className="w-px h-8 bg-border" />

                {/* Current Speed */}
                <div className="flex items-center gap-2 text-center">
                    <Gauge className="size-4 text-muted-foreground shrink-0" />
                    <div>
                        <p className="text-[10px] text-muted-foreground">Current speed</p>
                        <p className="text-xs font-medium text-foreground">{currentSpeed}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
