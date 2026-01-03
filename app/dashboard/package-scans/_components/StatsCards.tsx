"use client";

import {
    IconTrendingUp,
    IconTrendingDown,
    IconPackage,
    IconCheck,
    IconX,
    IconAlertTriangle,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface StatsCardsProps {
    stats: {
        total: number;
        pickupScans: number;
        deliveryScans: number;
        passed: number;
        failed: number;
        avgDamage: string;
    };
}

export function StatsCards({ stats }: StatsCardsProps) {
    const passRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : "0.0";
    const avgDamage = parseFloat(stats.avgDamage);

    return (
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Total Scans</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats.total.toLocaleString()}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <IconPackage className="size-3" />
                            All time
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        {stats.pickupScans} pickup • {stats.deliveryScans} delivery
                    </div>
                    <div className="text-muted-foreground">
                        Package verification records
                    </div>
                </CardFooter>
            </Card>

            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Pass Rate</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {passRate}%
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline" className={parseFloat(passRate) >= 80 ? "text-emerald-600" : "text-amber-600"}>
                            {parseFloat(passRate) >= 80 ? (
                                <IconTrendingUp className="size-3" />
                            ) : (
                                <IconTrendingDown className="size-3" />
                            )}
                            {parseFloat(passRate) >= 80 ? "Healthy" : "Needs attention"}
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        {stats.passed} passed, {stats.failed} failed
                    </div>
                    <div className="text-muted-foreground">
                        Overall verification success rate
                    </div>
                </CardFooter>
            </Card>

            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Passed Scans</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-emerald-600">
                        {stats.passed.toLocaleString()}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                            <IconCheck className="size-3" />
                            Approved
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium text-emerald-600">
                        <IconCheck className="size-4" />
                        Packages in good condition
                    </div>
                    <div className="text-muted-foreground">
                        Met damage threshold requirements
                    </div>
                </CardFooter>
            </Card>

            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Avg. Damage</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats.avgDamage}%
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline" className={avgDamage <= 15 ? "text-emerald-600" : avgDamage <= 30 ? "text-amber-600" : "text-red-600"}>
                            {avgDamage <= 15 ? (
                                <IconCheck className="size-3" />
                            ) : avgDamage <= 30 ? (
                                <IconAlertTriangle className="size-3" />
                            ) : (
                                <IconX className="size-3" />
                            )}
                            {avgDamage <= 15 ? "Low" : avgDamage <= 30 ? "Moderate" : "High"}
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Average damage across all scans
                    </div>
                    <div className="text-muted-foreground">
                        {avgDamage <= 15 ? "Excellent package handling" : avgDamage <= 30 ? "Room for improvement" : "Review required"}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
