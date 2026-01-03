"use client";

import * as React from "react";
import Image from "next/image";
import { format } from "date-fns";
import { Package, CheckCircle2, XCircle, AlertTriangle, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PackageVerification {
    id: string;
    phase: "pickup" | "delivery";
    capturedImageUrl: string;
    damagePercentage: number;
    anomalyDetected: boolean;
    threshold: number;
    heatmapImageUrl: string | null;
    passed: boolean;
    createdAt: string;
}

interface PackageVerificationCardProps {
    verification: PackageVerification;
    className?: string;
}

export function PackageVerificationCard({ verification, className }: PackageVerificationCardProps) {
    const [showHeatmap, setShowHeatmap] = React.useState(false);
    const [imageError, setImageError] = React.useState(false);
    const [heatmapError, setHeatmapError] = React.useState(false);

    const isPickup = verification.phase === "pickup";
    const damageLevel = verification.damagePercentage;

    const getStatusColor = () => {
        if (!verification.passed) return "text-red-500";
        if (damageLevel <= 10) return "text-green-500";
        if (damageLevel <= 30) return "text-yellow-500";
        return "text-orange-500";
    };

    const getStatusBgColor = () => {
        if (!verification.passed) return "bg-red-500/10 border-red-500/20";
        if (damageLevel <= 10) return "bg-green-500/10 border-green-500/20";
        if (damageLevel <= 30) return "bg-yellow-500/10 border-yellow-500/20";
        return "bg-orange-500/10 border-orange-500/20";
    };

    const StatusIcon = verification.passed ? CheckCircle2 : XCircle;

    return (
        <div className={cn(
            "rounded-lg border bg-card p-4 space-y-3",
            isPickup ? "border-l-4 border-l-blue-500" : "border-l-4 border-l-purple-500",
            className
        )}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium capitalize">
                        {verification.phase} Verification
                    </span>
                </div>
                <div className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border",
                    getStatusBgColor()
                )}>
                    <StatusIcon className={cn("h-3 w-3", getStatusColor())} />
                    <span className={getStatusColor()}>
                        {verification.passed ? "PASSED" : "FAILED"}
                    </span>
                </div>
            </div>

            {/* Image Section */}
            <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                {!imageError && !heatmapError ? (
                    <Image
                        src={showHeatmap && verification.heatmapImageUrl
                            ? verification.heatmapImageUrl
                            : verification.capturedImageUrl}
                        alt={`Package ${verification.phase} ${showHeatmap ? "heatmap" : "photo"}`}
                        fill
                        className="object-cover"
                        onError={() => showHeatmap ? setHeatmapError(true) : setImageError(true)}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                )}

                {/* Toggle Heatmap Button */}
                {verification.heatmapImageUrl && !heatmapError && (
                    <button
                        onClick={() => setShowHeatmap(!showHeatmap)}
                        className="absolute bottom-2 right-2 px-2 py-1 rounded text-xs font-medium bg-black/60 text-white hover:bg-black/80 transition-colors"
                    >
                        {showHeatmap ? "Show Original" : "Show Heatmap"}
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-md bg-muted/50">
                    <div className={cn("text-lg font-semibold", getStatusColor())}>
                        {damageLevel.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Damage</div>
                </div>
                <div className="text-center p-2 rounded-md bg-muted/50">
                    <div className="flex items-center justify-center">
                        {verification.anomalyDetected ? (
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        ) : (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                    </div>
                    <div className="text-xs text-muted-foreground">Anomaly</div>
                </div>
                <div className="text-center p-2 rounded-md bg-muted/50">
                    <div className="text-lg font-semibold">
                        {(verification.threshold * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Threshold</div>
                </div>
            </div>

            {/* Timestamp */}
            <div className="text-xs text-muted-foreground text-right">
                {format(new Date(verification.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </div>
        </div>
    );
}

interface PackageVerificationListProps {
    verifications: PackageVerification[];
    className?: string;
}

export function PackageVerificationList({ verifications, className }: PackageVerificationListProps) {
    if (verifications.length === 0) {
        return (
            <div className={cn("text-center py-8 text-muted-foreground", className)}>
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No package verifications yet</p>
            </div>
        );
    }

    const pickupVerification = verifications.find(v => v.phase === "pickup");
    const deliveryVerification = verifications.find(v => v.phase === "delivery");

    return (
        <div className={cn("space-y-4", className)}>
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4" />
                Package Condition Verification
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
                {pickupVerification && (
                    <PackageVerificationCard verification={pickupVerification} />
                )}
                {deliveryVerification && (
                    <PackageVerificationCard verification={deliveryVerification} />
                )}
            </div>
        </div>
    );
}
