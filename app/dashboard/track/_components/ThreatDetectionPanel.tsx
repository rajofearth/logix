"use client";

import * as React from "react";
import { AlertTriangle, Shield, Clock, X } from "lucide-react";
import type { ThreatDetectionResult } from "./ThreatDetectionOverlay";

interface ThreatDetectionPanelProps {
    result: ThreatDetectionResult | null;
    isLoading: boolean;
    lastScanTime: Date | null;
    onDismiss?: () => void;
}

export function ThreatDetectionPanel({
    result,
    isLoading,
    lastScanTime,
    onDismiss,
}: ThreatDetectionPanelProps) {
    return (
        <div className="win7-aero-card">
            <div className="win7-aero-card-header">
                <div className="flex items-center gap-2">
                    <Shield className="size-4" />
                    <span className="text-[11px]">Threat Detection</span>
                </div>
                {isLoading && (
                    <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#3c7fb1]" />
                        <span className="text-[10px]">Analyzing...</span>
                    </div>
                )}
            </div>

            <div className="win7-aero-card-body p-3 space-y-3">
                {/* Status Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock className="size-3.5 text-gray-600" />
                        <span className="text-[10px] text-gray-700">
                            {lastScanTime
                                ? `Last scan: ${lastScanTime.toLocaleTimeString()}`
                                : "No scans yet"}
                        </span>
                    </div>
                </div>

                {/* Threat Result */}
                {result ? (
                    result.hasThreat ? (
                        <div className="space-y-3">
                            {/* Threat Alert Header */}
                            <div className="win7-groupbox border-red-500 bg-red-50">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="size-4 text-red-600" />
                                        <span className="text-[12px] font-semibold text-red-900">
                                            Threat Detected
                                        </span>
                                    </div>
                                    {onDismiss && (
                                        <button
                                            type="button"
                                            onClick={onDismiss}
                                            className="win7-btn h-[20px] min-w-[20px] p-0 text-[10px] bg-red-500/20 hover:bg-red-500/40 border-red-400"
                                            aria-label="Dismiss alert"
                                        >
                                            <X className="size-3" />
                                        </button>
                                    )}
                                </div>

                                {/* Threat Type */}
                                <div className="mb-2">
                                    <span className="text-[10px] text-red-800 mb-1 block">Threat Type:</span>
                                    <div className="win7-btn bg-red-500 text-white text-[11px] px-3 py-1 h-auto min-h-0 border-red-600 inline-block">
                                        {result.threatType || "Unknown"}
                                    </div>
                                </div>

                                {/* Confidence */}
                                <div className="space-y-1 mb-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-red-800">Confidence:</span>
                                        <span className="text-[11px] font-semibold text-red-900">
                                            {Math.round(result.confidence)}%
                                        </span>
                                    </div>
                                    <div
                                        role="progressbar"
                                        className="win7-desktop [role='progressbar'] h-4"
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
                                <div className="win7-groupbox bg-white/70 p-2 border-red-300">
                                    <p className="text-[11px] text-red-900 leading-relaxed">
                                        {result.description}
                                    </p>
                                </div>

                                {/* Bounding Box Info (if available) */}
                                {result.boundingBox && (
                                    <div className="text-[10px] text-red-800">
                                        <span className="font-semibold">Location:</span>{" "}
                                        {Math.round(result.boundingBox.x * 100)}%,{" "}
                                        {Math.round(result.boundingBox.y * 100)}% ({" "}
                                        {Math.round(result.boundingBox.width * 100)}% ×{" "}
                                        {Math.round(result.boundingBox.height * 100)}% )
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="win7-groupbox bg-green-50 border-green-400 p-3 text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <Shield className="size-4 text-green-600" />
                                <span className="text-[11px] font-semibold text-green-900">
                                    No Threats Detected
                                </span>
                            </div>
                            <p className="text-[10px] text-green-800">
                                Package appears safe and secure
                            </p>
                        </div>
                    )
                ) : (
                    <div className="win7-groupbox bg-gray-50 border-gray-300 p-3 text-center">
                        <p className="text-[10px] text-gray-600">
                            {isLoading ? "Analyzing frame..." : "Waiting for analysis..."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
