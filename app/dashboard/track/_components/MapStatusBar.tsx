"use client";

import { MapPin, Clock, Route, Gauge, Radio } from "lucide-react";
import type { DeliveryStatus } from "../_data/deliveries";

interface MapStatusBarProps {
    status: DeliveryStatus;
    liveSpeed?: number | null;
    lastUpdated?: string;
    isLive?: boolean;
}

function formatSpeed(mps: number | null | undefined): string {
    if (mps === null || mps === undefined) return "0 mph";
    const mph = mps * 2.237; // Convert m/s to mph
    return `${Math.round(mph)} mph`;
}

function formatTimeAgo(isoString: string | undefined): string {
    if (!isoString) return "N/A";
    const now = Date.now();
    const then = new Date(isoString).getTime();
    const seconds = Math.floor((now - then) / 1000);

    if (seconds < 5) return "Just now";
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
}

export function MapStatusBar({ status, liveSpeed, lastUpdated, isLive }: MapStatusBarProps) {
    // Use live data if available, otherwise fall back to static status
    const displaySpeed = isLive && liveSpeed !== undefined ? formatSpeed(liveSpeed) : status.currentSpeed;
    const displayLastStop = isLive && lastUpdated ? formatTimeAgo(lastUpdated) : status.lastStop;

    return (
        <div className="absolute top-3 left-0 right-0 z-10 px-3 flex justify-center">
            <div className="w-full max-w-3xl bg-background/70 backdrop-blur-xl backdrop-saturate-150 border border-white/10 rounded-lg shadow-lg px-3 py-2">
                <div className="flex items-center justify-between gap-6 flex-wrap">
                    {/* Live Indicator (when tracking) */}
                    {isLive && (
                        <>
                            <div className="flex items-center gap-1.5">
                                <div className="flex items-center justify-center size-6 rounded-full bg-emerald-500/20">
                                    <Radio className="size-3 text-emerald-500 animate-pulse" />
                                </div>
                                <div>
                                    <p className="text-[9px] text-emerald-500 font-medium uppercase tracking-wide">Live tracking</p>
                                    <p className="text-xs font-semibold text-emerald-500">{displayLastStop}</p>
                                </div>
                            </div>
                            <div className="h-6 w-px bg-white/10 hidden sm:block" />
                        </>
                    )}

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

                    {/* Last Stop (only show when not live) */}
                    {!isLive && (
                        <>
                            <div className="flex items-center gap-1.5">
                                <div className="flex items-center justify-center size-6 rounded-full bg-amber-500/15">
                                    <Clock className="size-3 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wide">Last stop</p>
                                    <p className="text-xs font-semibold text-foreground">{status.lastStop}</p>
                                </div>
                            </div>
                            <div className="h-6 w-px bg-white/10 hidden sm:block" />
                        </>
                    )}

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
                        <div className={`flex items-center justify-center size-6 rounded-full ${isLive ? 'bg-emerald-500/15' : 'bg-emerald-500/15'}`}>
                            <Gauge className={`size-3 ${isLive ? 'text-emerald-500' : 'text-emerald-500'}`} />
                        </div>
                        <div>
                            <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wide">Current speed</p>
                            <p className="text-xs font-semibold text-foreground">{displaySpeed}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

