"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    XAxis,
    YAxis,
} from "recharts"
import {
    IconMapPin,
    IconTruck,
    IconClock,
    IconPackage,
    IconChartLine,
    IconLocation,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"

import type { DriverDTO } from "../_types"
import { cn } from "@/lib/utils"
import { getInitials } from "@/lib/utils"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Mock shipment data for area chart
const shipmentData = [
    { month: "Jan", deliveries: 65, target: 80 },
    { month: "Feb", deliveries: 78, target: 80 },
    { month: "Mar", deliveries: 52, target: 80 },
    { month: "Apr", deliveries: 91, target: 80 },
    { month: "May", deliveries: 86, target: 80 },
    { month: "Jun", deliveries: 73, target: 80 },
    { month: "Jul", deliveries: 98, target: 80 },
    { month: "Aug", deliveries: 88, target: 80 },
    { month: "Sep", deliveries: 79, target: 80 },
    { month: "Oct", deliveries: 95, target: 80 },
    { month: "Nov", deliveries: 82, target: 80 },
    { month: "Dec", deliveries: 89, target: 80 },
]

// Mock delay reasons data for pie chart
const delayReasonsData = [
    { reason: "Misrouted Shipment", count: 18, fill: "var(--color-misrouted)" },
    { reason: "Vehicle Breakdown", count: 8, fill: "var(--color-breakdown)" },
    { reason: "Accident or Collision", count: 6, fill: "var(--color-accident)" },
    { reason: "Others", count: 8, fill: "var(--color-others)" },
]

const shipmentChartConfig = {
    deliveries: {
        label: "Deliveries",
        color: "oklch(0.646 0.222 41.116)", // primary orange
    },
    target: {
        label: "Target",
        color: "oklch(0.7 0.015 286.067)", // muted
    },
} satisfies ChartConfig

const delayChartConfig = {
    misrouted: {
        label: "Misrouted Shipment",
        color: "oklch(0.646 0.222 41.116)", // primary
    },
    breakdown: {
        label: "Vehicle Breakdown",
        color: "oklch(0.7 0.015 286.067)", // gray
    },
    accident: {
        label: "Accident or Collision",
        color: "oklch(0.47 0.157 37.304)", // dark orange
    },
    others: {
        label: "Others",
        color: "oklch(0.553 0.195 38.402)", // medium orange
    },
} satisfies ChartConfig

const statusConfig = {
    available: {
        label: "Available",
        ringColor: "ring-emerald-500",
        badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        progressColor: "bg-emerald-500",
    },
    "on-route": {
        label: "On Route",
        ringColor: "ring-primary",
        badgeClass: "bg-primary/10 text-primary",
        progressColor: "bg-primary",
    },
    "off-duty": {
        label: "Off Duty",
        ringColor: "ring-muted-foreground/50",
        badgeClass: "bg-muted text-muted-foreground",
        progressColor: "bg-muted-foreground/50",
    },
}

interface DriverDetailsSheetProps {
    driver: DriverDTO | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function DriverDetailsSheet({
    driver,
    open,
    onOpenChange,
}: DriverDetailsSheetProps) {
    const router = useRouter()

    if (!driver) return null

    const status = statusConfig[driver.status]

    // Mock stats
    const stats = {
        totalDeliveries: 980,
        onTimeRate: 93,
        totalDelays: 40,
        progress: 63,
    }

    const handleTrackClick = () => {
        if (driver.currentJobId) {
            onOpenChange(false) // Close the sheet
            router.push(`/dashboard/track?jobId=${driver.currentJobId}`)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader className="pb-4">
                    {/* Driver Avatar, Name and Status */}
                    <div className="flex items-center gap-4">
                        <Avatar
                            size="lg"
                            className={cn("ring-2 ring-offset-2 ring-offset-background", status.ringColor)}
                        >
                            <AvatarImage src={driver.avatar ?? undefined} alt={driver.name} />
                            <AvatarFallback>{getInitials(driver.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <SheetTitle className="text-base">{driver.name}</SheetTitle>
                                <Badge
                                    variant="secondary"
                                    className={cn("text-[0.6rem]", status.badgeClass)}
                                >
                                    {status.label}
                                </Badge>
                            </div>
                            <SheetDescription>Driver</SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="space-y-3 px-4 pb-4 h-full overflow-hidden flex flex-col">
                    {/* Active Job Card */}
                    {driver.currentJob && (
                        <Card className="overflow-hidden shrink-0">
                            {/* Card Header with job title and status */}
                            <CardHeader className="p-3 border-b border-border/50">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <IconTruck className="size-4 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm">{driver.currentJob}</CardTitle>
                                            <p className="text-[0.65rem] text-muted-foreground">Active Delivery</p>
                                        </div>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className={cn("text-[0.6rem] px-1.5 h-5", status.badgeClass)}
                                    >
                                        {status.label}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="p-3">
                                {/* Route Progress Section */}
                                <div className="space-y-2">
                                    {/* Progress indicator */}
                                    <div className="flex items-center justify-between text-[0.65rem]">
                                        <span className="text-muted-foreground">Route Progress</span>
                                        <span className="font-semibold text-primary">{stats.progress}%</span>
                                    </div>

                                    {/* Progress bar with truck */}
                                    <div className="relative py-2">
                                        {/* Base line */}
                                        <div className="h-1 w-full bg-muted rounded-full" />

                                        {/* Filled progress line */}
                                        <div
                                            className="absolute top-2 left-0 h-1 rounded-full bg-primary transition-all duration-500"
                                            style={{ width: `${stats.progress}%` }}
                                        />

                                        {/* Truck icon at progress position */}
                                        <div
                                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-500"
                                            style={{ left: `${stats.progress}%` }}
                                        >
                                            <div className="size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg ring-2 ring-background">
                                                <IconTruck className="size-3" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Origin and Destination */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-1">
                                                <div className="size-1 rounded-full bg-primary" />
                                                <span className="text-[0.6rem] text-muted-foreground uppercase tracking-wider">Pickup</span>
                                            </div>
                                            <p className="text-[0.7rem] font-medium leading-tight truncate">{driver.route?.origin || "Los Angeles, CA"}</p>
                                        </div>
                                        <div className="space-y-0.5 text-right">
                                            <div className="flex items-center gap-1 justify-end">
                                                <span className="text-[0.6rem] text-muted-foreground uppercase tracking-wider">Drop-off</span>
                                                <div className="size-1 rounded-full bg-muted-foreground/50" />
                                            </div>
                                            <p className="text-[0.7rem] font-medium leading-tight truncate">{driver.route?.destination || "Chicago, IL"}</p>
                                        </div>
                                    </div>

                                    {/* Track Button */}
                                    <div className="pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full h-7 text-[0.65rem] gap-1.5 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
                                            onClick={handleTrackClick}
                                        >
                                            <IconLocation className="size-3.5" />
                                            Track Shipment
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 shrink-0">
                        <Card className="p-3 bg-muted/20 border-0">
                            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                                <IconPackage className="size-3" />
                                <span className="text-[0.6rem] uppercase tracking-wide">Weekly</span>
                            </div>
                            <p className="text-xl font-bold">{stats.totalDeliveries}</p>
                            <p className="text-[0.6rem] text-muted-foreground">Deliveries</p>
                        </Card>
                        <Card className="p-3 bg-muted/20 border-0">
                            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                                <IconClock className="size-3" />
                                <span className="text-[0.6rem] uppercase tracking-wide">On-Time</span>
                            </div>
                            <p className="text-xl font-bold text-emerald-600">{stats.onTimeRate}%</p>
                            <p className="text-[0.6rem] text-muted-foreground">Rate</p>
                        </Card>
                        <Card className="p-3 bg-muted/20 border-0">
                            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                                <IconTruck className="size-3" />
                                <span className="text-[0.6rem] uppercase tracking-wide">Rating</span>
                            </div>
                            <p className="text-xl font-bold">5.0</p>
                            <p className="text-[0.6rem] text-muted-foreground">56 Reviews</p>
                        </Card>
                    </div>

                    <div className="grid gap-3 min-h-0 flex-1 overflow-hidden">
                        {/* Shipment Statistics Chart */}
                        <Card className="flex flex-col min-h-0 shadow-sm">
                            <CardHeader className="p-3 pb-0 shrink-0">
                                <CardTitle className="flex items-center gap-2 text-xs font-medium">
                                    <IconChartLine className="size-3.5 text-primary" />
                                    Shipment Trends
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 pt-0 flex-1 min-h-0">
                                <ChartContainer config={shipmentChartConfig} className="h-full w-full max-h-[140px]">
                                    <AreaChart data={shipmentData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="fillDeliveries" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--color-deliveries)" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="var(--color-deliveries)" stopOpacity={0.1} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                        <XAxis
                                            dataKey="month"
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                                            tickMargin={5}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                                            tickCount={4}
                                        />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Area
                                            type="monotone"
                                            dataKey="deliveries"
                                            stroke="var(--color-deliveries)"
                                            fill="url(#fillDeliveries)"
                                            strokeWidth={2}
                                            animationDuration={1000}
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        {/* Delay Reasons - Horizontal Layout */}
                        <Card className="flex flex-col shadow-sm">
                            <CardHeader className="p-3 pb-2 shrink-0 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-xs font-medium">Delay Analysis</CardTitle>
                                <div className="text-[0.65rem] text-muted-foreground font-medium bg-muted/50 px-2 py-0.5 rounded-full">
                                    {stats.totalDelays} Cases
                                </div>
                            </CardHeader>
                            <CardContent className="p-3 pt-0 flex items-center justify-between gap-4">
                                <ChartContainer config={delayChartConfig} className="h-[90px] w-[90px] shrink-0">
                                    <PieChart>
                                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                        <Pie
                                            data={delayReasonsData}
                                            dataKey="count"
                                            nameKey="reason"
                                            innerRadius={25}
                                            outerRadius={40}
                                            strokeWidth={2}
                                            paddingAngle={2}
                                        >
                                            {delayReasonsData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} stroke="hsl(var(--background))" />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ChartContainer>
                                <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1.5">
                                    {delayReasonsData.map((item, index) => (
                                        <div key={index} className="flex items-center gap-1.5 min-w-0">
                                            <span
                                                className="size-2 rounded-full shrink-0"
                                                style={{ backgroundColor: item.fill.replace("var(--color-", "").replace(")", "") === item.fill ? item.fill : undefined }}
                                            />
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[0.6rem] text-muted-foreground truncate leading-tight">{item.reason}</span>
                                                <span className="text-[0.65rem] font-medium leading-none">{Math.round(item.count / stats.totalDelays * 100)}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SheetContent>
        </Sheet >
    )
}
