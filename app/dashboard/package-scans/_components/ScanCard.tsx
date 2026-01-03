"use client";

import * as React from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
    IconCheck,
    IconX,
    IconAlertTriangle,
    IconPhoto,
    IconTruck,
    IconMapPin,
    IconEye,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Job {
    id: string;
    title: string;
    status: string;
    pickupAddress: string;
    dropAddress: string;
    driver: {
        id: string;
        name: string;
        photoUrl: string | null;
    } | null;
}

interface PackageVerification {
    id: string;
    phase: "pickup" | "delivery";
    capturedImageUrl: string;
    heatmapImageUrl: string | null;
    damagePercentage: number;
    anomalyDetected: boolean;
    threshold: number;
    passed: boolean;
    createdAt: string;
    job: Job;
}

interface ScanCardProps {
    verification: PackageVerification;
}

export function ScanCard({ verification }: ScanCardProps) {
    const [showHeatmap, setShowHeatmap] = React.useState(false);
    const [imageError, setImageError] = React.useState(false);

    const getStatusColor = () => {
        if (!verification.passed) return "destructive";
        if (verification.damagePercentage <= 10) return "default";
        if (verification.damagePercentage <= 30) return "secondary";
        return "outline";
    };

    const getDamageColor = () => {
        if (verification.damagePercentage <= 10) return "text-emerald-500";
        if (verification.damagePercentage <= 30) return "text-amber-500";
        return "text-red-500";
    };

    return (
        <Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/20">
            {/* Image Section */}
            <div className="relative aspect-4/3 bg-muted overflow-hidden">
                {!imageError ? (
                    <Image
                        src={showHeatmap && verification.heatmapImageUrl
                            ? verification.heatmapImageUrl
                            : verification.capturedImageUrl}
                        alt={`Package ${verification.phase} scan`}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <IconPhoto className="size-12 text-muted-foreground/30" />
                    </div>
                )}

                {/* Overlay badges */}
                <div className="absolute top-2 left-2 flex gap-2">
                    <Badge variant={verification.phase === "pickup" ? "default" : "secondary"}>
                        {verification.phase === "pickup" ? "Pickup" : "Delivery"}
                    </Badge>
                </div>

                <div className="absolute top-2 right-2">
                    <Badge variant={getStatusColor()}>
                        {verification.passed ? (
                            <><IconCheck className="size-3 mr-1" /> Passed</>
                        ) : (
                            <><IconX className="size-3 mr-1" /> Failed</>
                        )}
                    </Badge>
                </div>

                {/* Damage percentage overlay */}
                <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/80 to-transparent p-3">
                    <div className="flex items-center justify-between">
                        <span className={cn("text-2xl font-bold", getDamageColor())}>
                            {verification.damagePercentage.toFixed(1)}%
                        </span>
                        <span className="text-xs text-white/70">damage detected</span>
                    </div>
                </div>

                {/* Heatmap toggle */}
                {verification.heatmapImageUrl && (
                    <button
                        onClick={() => setShowHeatmap(!showHeatmap)}
                        className="absolute bottom-2 right-2 px-2 py-1 rounded text-xs font-medium bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                    >
                        {showHeatmap ? "Original" : "Heatmap"}
                    </button>
                )}
            </div>

            <CardContent className="p-4 space-y-3">
                {/* Job info */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <IconTruck className="size-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium truncate">{verification.job.title}</span>
                    </div>
                    {verification.job.driver && (
                        <div className="flex items-center gap-2">
                            <Avatar className="size-5">
                                <AvatarImage src={verification.job.driver.photoUrl || undefined} />
                                <AvatarFallback className="text-[10px]">
                                    {verification.job.driver.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground truncate">
                                {verification.job.driver.name}
                            </span>
                        </div>
                    )}
                </div>

                {/* Stats row */}
                <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {verification.anomalyDetected ? (
                            <IconAlertTriangle className="size-3 text-amber-500" />
                        ) : (
                            <IconCheck className="size-3 text-emerald-500" />
                        )}
                        {verification.anomalyDetected ? "Anomaly" : "No anomaly"}
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {format(new Date(verification.createdAt), "MMM d, h:mm a")}
                    </span>
                </div>

                {/* View details button */}
                <Dialog>
                    <DialogTrigger
                        render={
                            <Button variant="outline" size="sm" className="w-full">
                                <IconEye className="size-4 mr-2" />
                                View Details
                            </Button>
                        }
                    />
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Package Scan Details</DialogTitle>
                            <DialogDescription>
                                {verification.phase === "pickup" ? "Pickup" : "Delivery"} verification for {verification.job.title}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4">
                            {/* Large image */}
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                                {!imageError ? (
                                    <Image
                                        src={showHeatmap && verification.heatmapImageUrl
                                            ? verification.heatmapImageUrl
                                            : verification.capturedImageUrl}
                                        alt="Package scan"
                                        fill
                                        className="object-contain"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <IconPhoto className="size-16 text-muted-foreground/30" />
                                    </div>
                                )}
                                {verification.heatmapImageUrl && (
                                    <button
                                        onClick={() => setShowHeatmap(!showHeatmap)}
                                        className="absolute bottom-3 right-3 px-3 py-1.5 rounded-md text-sm font-medium bg-black/60 text-white hover:bg-black/80 transition-colors"
                                    >
                                        {showHeatmap ? "Show Original" : "Show Heatmap"}
                                    </button>
                                )}
                            </div>

                            {/* Details grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-3 rounded-lg bg-muted/50">
                                    <div className={cn("text-xl font-bold", getDamageColor())}>
                                        {verification.damagePercentage.toFixed(1)}%
                                    </div>
                                    <div className="text-xs text-muted-foreground">Damage</div>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-muted/50">
                                    <div className="text-xl font-bold">
                                        {verification.passed ? (
                                            <IconCheck className="size-6 mx-auto text-emerald-500" />
                                        ) : (
                                            <IconX className="size-6 mx-auto text-red-500" />
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Status</div>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-muted/50">
                                    <div className="text-xl font-bold">
                                        {(verification.threshold * 100).toFixed(0)}%
                                    </div>
                                    <div className="text-xs text-muted-foreground">Threshold</div>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-muted/50">
                                    <div className="text-xl font-bold capitalize">
                                        {verification.phase}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Phase</div>
                                </div>
                            </div>

                            {/* Job details */}
                            <div className="space-y-2 pt-2 border-t">
                                <div className="flex items-start gap-2">
                                    <IconMapPin className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Pickup: </span>
                                        {verification.job.pickupAddress}
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <IconMapPin className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Drop-off: </span>
                                        {verification.job.dropAddress}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
