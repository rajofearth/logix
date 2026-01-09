"use client";

import * as React from "react";
import { AlertTriangle, Shield, X } from "lucide-react";

export interface ThreatDetectionResult {
    hasThreat: boolean;
    threatType: string | null;
    confidence: number;
    description: string;
    boundingBox?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

interface ThreatDetectionOverlayProps {
    result: ThreatDetectionResult | null;
    isLoading: boolean;
    videoWidth: number;
    videoHeight: number;
    onDismiss?: () => void;
}

export function ThreatDetectionOverlay({
    result,
    isLoading,
    videoWidth,
    videoHeight,
    onDismiss,
}: ThreatDetectionOverlayProps) {
    // Calculate bounding box coordinates in pixels
    const boundingBoxStyle = React.useMemo(() => {
        if (!result?.hasThreat || !result.boundingBox) return null;

        const { x, y, width, height } = result.boundingBox;
        return {
            left: `${x * 100}%`,
            top: `${y * 100}%`,
            width: `${width * 100}%`,
            height: `${height * 100}%`,
        };
    }, [result]);

    if (isLoading) {
        return (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="win7-aero-card bg-white/90 backdrop-blur-sm">
                    <div className="win7-aero-card-body p-3 flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#3c7fb1]" />
                        <span className="text-[11px]">Analyzing frame...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!result || !result.hasThreat) {
        return null;
    }

    return (
        <>
            {/* Bounding box overlay for threat location */}
            {boundingBoxStyle && (
                <div
                    className="absolute border-2 border-red-500 bg-red-500/20 pointer-events-none z-10"
                    style={boundingBoxStyle}
                >
                    <div className="absolute -top-6 left-0">
                        <div className="win7-btn bg-red-500 text-white text-[10px] px-2 py-0.5 h-auto min-h-0 border-red-600">
                            {result.threatType || "Threat"}
                        </div>
                    </div>
                </div>
            )}

            {/* Threat alert banner */}
            <div className="absolute top-2 left-2 right-2 z-20 pointer-events-auto">
                <div className="win7-aero-card border-red-500 bg-red-50/95">
                    <div className="win7-aero-card-header bg-red-500/20 border-b border-red-400">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="size-4 text-red-600" />
                            <span className="text-[11px] font-semibold text-red-900">
                                Threat Detected
                            </span>
                        </div>
                        {onDismiss && (
                            <button
                                type="button"
                                onClick={onDismiss}
                                className="win7-btn h-[18px] min-w-[18px] p-0 text-[10px] bg-red-500/20 hover:bg-red-500/40 border-red-400"
                                aria-label="Dismiss alert"
                            >
                                <X className="size-3" />
                            </button>
                        )}
                    </div>
                    <div className="win7-aero-card-body p-2 space-y-2">
                        {/* Threat type badge */}
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-red-800">Type:</span>
                            <div className="win7-btn bg-red-500 text-white text-[10px] px-2 py-0.5 h-auto min-h-0 border-red-600">
                                {result.threatType || "Unknown"}
                            </div>
                        </div>

                        {/* Confidence indicator */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-red-800">Confidence:</span>
                                <span className="text-[10px] font-semibold text-red-900">
                                    {Math.round(result.confidence)}%
                                </span>
                            </div>
                            <div
                                role="progressbar"
                                className="win7-desktop [role='progressbar'] h-3"
                                aria-valuenow={result.confidence}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            >
                                <div
                                    style={{
                                        width: `${result.confidence}%`,
                                        backgroundColor: result.confidence > 70 ? "#ef0000" : "#e6df1b",
                                    }}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="win7-groupbox bg-white/50 p-2 border-red-300">
                            <p className="text-[10px] text-red-900 leading-tight">
                                {result.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status indicator (bottom right) */}
            <div className="absolute bottom-2 right-2 z-10 pointer-events-auto">
                <div className="win7-aero-card bg-white/90">
                    <div className="win7-aero-card-body p-1.5 flex items-center gap-1.5">
                        <Shield className="size-3 text-red-600" />
                        <span className="text-[10px] text-red-900">Threat Active</span>
                    </div>
                </div>
            </div>
        </>
    );
}
