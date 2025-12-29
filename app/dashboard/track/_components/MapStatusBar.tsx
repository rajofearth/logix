"use client";

import { MapPin, Clock, Route, Gauge } from "lucide-react";
import type { DeliveryStatus } from "../_data/deliveries";

interface MapStatusBarProps {
    status: DeliveryStatus;
}

export function MapStatusBar({ status }: MapStatusBarProps) {
    return (
        <div className="absolute top-3 left-0 right-0 z-10 px-3 flex justify-center">
            <div className="w-full max-w-3xl bg-background/70 backdrop-blur-xl backdrop-saturate-150 border border-white/10 rounded-lg shadow-lg px-3 py-2">
                <div className="flex items-center justify-between gap-6 flex-wrap">
                    {/* Current Location */}
                    <div className="flex items-center gap-1.5">
                        <div className="flex items-center justify-center size-6 rounded-full bg-primary/15">
                            <MapPin className="size-3 text-primary" />
                        </div>
                        <div>
                            <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wide">Current location</p>
                            <p className="text-xs font-semibold text-foreground">{status.currentLocation}</p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-6 w-px bg-white/10 hidden sm:block" />

                    {/* Last Stop */}
                    <div className="flex items-center gap-1.5">
                        <div className="flex items-center justify-center size-6 rounded-full bg-amber-500/15">
                            <Clock className="size-3 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wide">Last stop</p>
                            <p className="text-xs font-semibold text-foreground">{status.lastStop}</p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-6 w-px bg-white/10 hidden sm:block" />

                    {/* Distance */}
                    <div className="flex items-center gap-1.5">
                        <div className="flex items-center justify-center size-6 rounded-full bg-blue-500/15">
                            <Route className="size-3 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wide">Distance</p>
                            <p className="text-xs font-semibold text-foreground">{status.distance}</p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-6 w-px bg-white/10 hidden sm:block" />

                    {/* Current Speed */}
                    <div className="flex items-center gap-1.5">
                        <div className="flex items-center justify-center size-6 rounded-full bg-emerald-500/15">
                            <Gauge className="size-3 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wide">Current speed</p>
                            <p className="text-xs font-semibold text-foreground">{status.currentSpeed}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
