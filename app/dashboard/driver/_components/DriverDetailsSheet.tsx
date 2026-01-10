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
    IconTruck,
    IconClock,
    IconPackage,
    IconChartLine,
    IconLocation,
    IconStar,
    IconPhone,
    IconMail,
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
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

// Mock shipment data for area chart
const shipmentData = [
    { month: "Jan", deliveries: 65 },
    { month: "Feb", deliveries: 78 },
    { month: "Mar", deliveries: 52 },
    { month: "Apr", deliveries: 91 },
    { month: "May", deliveries: 86 },
    { month: "Jun", deliveries: 73 },
    { month: "Jul", deliveries: 98 },
    { month: "Aug", deliveries: 88 },
    { month: "Sep", deliveries: 79 },
    { month: "Oct", deliveries: 95 },
    { month: "Nov", deliveries: 82 },
    { month: "Dec", deliveries: 89 },
]

// Mock delay reasons data for pie chart - Win7 blue colors
const delayReasonsData = [
    { reason: "Misrouted", count: 18, fill: "#0066cc" },
    { reason: "Breakdown", count: 8, fill: "#3399ff" },
    { reason: "Accident", count: 6, fill: "#cc0000" },
    { reason: "Others", count: 8, fill: "#888888" },
]

// Win7 chart colors
const shipmentChartConfig = {
    deliveries: {
        label: "Deliveries",
        color: "#0066cc", // Win7 blue
    },
} satisfies ChartConfig

const delayChartConfig = {
    misrouted: { label: "Misrouted", color: "#0066cc" },
    breakdown: { label: "Breakdown", color: "#3399ff" },
    accident: { label: "Accident", color: "#cc0000" },
    others: { label: "Others", color: "#888888" },
} satisfies ChartConfig

// Win7 status colors
const statusConfig = {
    available: {
        label: "Available",
        badgeClass: "bg-[#e8f4fc] text-[#0066cc] border-[#3c7fb1]",
        dotColor: "bg-[#0066cc]",
    },
    "on-route": {
        label: "On Route",
        badgeClass: "bg-[#d9edf7] text-[#31708f] border-[#bce8f1]",
        dotColor: "bg-[#5bc0de]",
    },
    "off-duty": {
        label: "Off Duty",
        badgeClass: "bg-[#f5f5f5] text-[#777] border-[#ddd]",
        dotColor: "bg-[#999]",
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
    const isAvailable = driver.status === "available"

    // Mock stats
    const stats = {
        totalDeliveries: 980,
        onTimeRate: 93,
        totalDelays: 40,
        progress: 63,
        rating: 4.9,
        reviews: 56,
        yearsExp: 3,
    }

    const handleTrackClick = () => {
        if (driver.currentJobId) {
            onOpenChange(false)
            router.push(`/dashboard/track?jobId=${driver.currentJobId}`)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent showCloseButton={false} className="w-full sm:max-w-md p-0 bg-transparent border-none shadow-none">
                <div className="win7-window h-full flex flex-col rounded-none w-full">
                    {/* Title Bar */}
                    <div className="title-bar">
                        <div className="title-bar-text flex items-center gap-2">
                            <IconTruck className="size-4" />
                            Driver Details
                        </div>
                        <div className="title-bar-controls">
                            <button aria-label="Close" className="close" onClick={() => onOpenChange(false)}></button>
                        </div>
                    </div>

                    {/* Window Body */}
                    <div className="window-body flex-1 overflow-auto p-4 space-y-4">

                        {/* Profile Header */}
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-b from-white to-[#f0f0f0] border border-[#d9d9d9] rounded-[3px] shadow-sm">
                            <Avatar className="size-14 border border-[#8e8f8f] shadow-sm">
                                <AvatarImage src={driver.avatar ?? undefined} alt={driver.name} />
                                <AvatarFallback className="text-sm font-bold bg-[#d9d9d9] text-[#333]">
                                    {getInitials(driver.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold text-[#333] tracking-tight">{driver.name}</h3>
                                    <span className={cn(
                                        "inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase rounded-[2px] border shadow-sm",
                                        status.badgeClass
                                    )}>
                                        <span className={cn("size-1.5 rounded-full mr-1", status.dotColor)} />
                                        {status.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-xs text-[#666]">
                                    <span className="flex items-center gap-1">
                                        <IconStar className="size-3 text-[#f4a100] fill-[#f4a100]" />
                                        <span className="font-bold text-[#333]">{stats.rating}</span>
                                        <span>({stats.reviews})</span>
                                    </span>
                                    <span>•</span>
                                    <span>{stats.yearsExp}+ years exp</span>
                                </div>
                            </div>
                        </div>

                        {/* Available Driver - Quick Actions */}
                        {isAvailable && (
                            <fieldset className="border border-[#d9d9d9] rounded-[3px] p-3 bg-[#e8f4fc]">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-[2px] flex items-center justify-center border border-[#8e8f8f] bg-white shadow-inner">
                                        <IconTruck className="size-5 text-[#0066cc]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[11px] font-bold text-[#333]">Ready for Assignment</p>
                                        <p className="text-[10px] text-[#666]">This driver is available for new jobs</p>
                                    </div>
                                    <button
                                        className="win7-btn px-3 h-7 text-[11px] font-bold"
                                        onClick={() => { }}
                                    >
                                        Assign Job
                                    </button>
                                </div>
                            </fieldset>
                        )}

                        {/* Active Job Card */}
                        {driver.currentJob && !isAvailable && (
                            <fieldset className="border border-[#d9d9d9] rounded-[3px] p-3 pt-1">
                                <legend className="text-[#003399] text-xs px-1 text-bold">
                                    Active Delivery
                                </legend>
                                <div className="p-2 bg-[#fcfcfc] border border-[#e0e0e0] rounded-[2px] mb-2">
                                    <div className="flex items-center gap-2">
                                        <IconTruck className="size-4 text-[#0066cc]" />
                                        <div>
                                            <p className="text-[11px] font-bold text-[#333]">{driver.currentJob}</p>
                                            <p className="text-[9px] text-[#666]">In progress</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {/* Progress */}
                                    <div>
                                        <div className="flex items-center justify-between text-[10px] mb-1">
                                            <span className="text-[#666]">Route Progress</span>
                                            <span className="font-bold text-[#0066cc]">{stats.progress}%</span>
                                        </div>
                                        <div className="h-[15px] border border-[#bcbcbc] bg-[#e6e6e6] rounded-[2px] overflow-hidden shadow-inner relative">
                                            <div
                                                className="h-full bg-[linear-gradient(to_bottom,#06b025_0%,#00cc00_50%,#00b300_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
                                                style={{ width: `${stats.progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Route */}
                                    <div className="flex items-center gap-2 text-[10px] p-1 bg-[#f9f9f9] border border-[#eee] rounded-[2px]">
                                        <div className="flex-1 truncate">
                                            <span className="text-[#666]">From:</span>
                                            <span className="ml-1 font-bold text-[#333]">{driver.route?.origin || "Los Angeles, CA"}</span>
                                        </div>
                                        <span className="text-[#999]">→</span>
                                        <div className="flex-1 truncate text-right">
                                            <span className="font-bold text-[#333]">{driver.route?.destination || "Chicago, IL"}</span>
                                        </div>
                                    </div>

                                    <button
                                        className="win7-btn w-full h-7 text-[10px] flex items-center justify-center gap-1.5"
                                        onClick={handleTrackClick}
                                    >
                                        <IconLocation className="size-3.5" />
                                        Track Live
                                    </button>
                                </div>
                            </fieldset>
                        )}

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-2">
                            {/* Total */}
                            <fieldset className="border border-[#d9d9d9] rounded-[3px] p-2 bg-white text-center">
                                <div className="flex items-center justify-center gap-1 mb-1 text-[#0066cc]">
                                    <IconPackage className="size-3.5" />
                                    <span className="text-[9px] font-bold uppercase">Total</span>
                                </div>
                                <p className="text-lg font-bold text-[#333]">{stats.totalDeliveries}</p>
                                <p className="text-[9px] text-[#666]">Deliveries</p>
                            </fieldset>

                            {/* On-Time */}
                            <fieldset className="border border-[#d9d9d9] rounded-[3px] p-2 bg-white text-center">
                                <div className="flex items-center justify-center gap-1 mb-1 text-[#38761d]">
                                    <IconClock className="size-3.5" />
                                    <span className="text-[9px] font-bold uppercase">On-Time</span>
                                </div>
                                <p className="text-lg font-bold text-[#333]">{stats.onTimeRate}%</p>
                                <p className="text-[9px] text-[#666]">Rate</p>
                            </fieldset>

                            {/* Rating */}
                            <fieldset className="border border-[#d9d9d9] rounded-[3px] p-2 bg-white text-center">
                                <div className="flex items-center justify-center gap-1 mb-1 text-[#f4a100]">
                                    <IconStar className="size-3.5 fill-[#f4a100]" />
                                    <span className="text-[9px] font-bold uppercase">Rating</span>
                                </div>
                                <p className="text-lg font-bold text-[#333]">{stats.rating}</p>
                                <p className="text-[9px] text-[#666]">{stats.reviews} Reviews</p>
                            </fieldset>
                        </div>

                        {/* Performance Chart */}
                        <fieldset className="border border-[#d9d9d9] rounded-[3px] p-3 pt-1">
                            <legend className="text-[#003399] text-xs px-1 flex items-center gap-1">
                                <IconChartLine className="size-3.5" />
                                Monthly Performance
                            </legend>
                            <div className="flex justify-end mb-2">
                                <span className="text-[9px] px-2 py-0.5 rounded-[2px] bg-[#f0f0f0] border border-[#d9d9d9] text-[#333]">
                                    Avg. {Math.round(shipmentData.reduce((sum, d) => sum + d.deliveries, 0) / 12)}/mo
                                </span>
                            </div>
                            <ChartContainer config={shipmentChartConfig} className="h-[140px] w-full">
                                <AreaChart data={shipmentData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="fillDeliveriesWin7" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#0066cc" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="#0066cc" stopOpacity={0.05} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" opacity={0.8} />
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 9, fill: "#666" }}
                                        tickMargin={6}
                                        interval={1}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 9, fill: "#666" }}
                                        tickCount={3}
                                        width={28}
                                    />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                        cursor={{ stroke: "#0066cc", strokeWidth: 1, strokeDasharray: "3 3" }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="deliveries"
                                        stroke="#0066cc"
                                        fill="url(#fillDeliveriesWin7)"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 3, fill: "#0066cc", stroke: "#fff", strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </fieldset>

                        {/* Delay Analysis */}
                        <fieldset className="border border-[#d9d9d9] rounded-[3px] p-3 pt-1">
                            <legend className="text-[#003399] text-xs px-1">Delay Analysis</legend>
                            <div className="flex justify-end mb-2">
                                <span className="text-[9px] px-2 py-0.5 rounded-[2px] bg-[#f0f0f0] border border-[#d9d9d9] text-[#333]">
                                    {stats.totalDelays} Total
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <ChartContainer config={delayChartConfig} className="h-[80px] w-[80px] shrink-0">
                                    <PieChart>
                                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                        <Pie
                                            data={delayReasonsData}
                                            dataKey="count"
                                            nameKey="reason"
                                            innerRadius={22}
                                            outerRadius={36}
                                            strokeWidth={2}
                                            paddingAngle={3}
                                        >
                                            {delayReasonsData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} stroke="#fff" />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ChartContainer>
                                <div className="flex-1 grid grid-cols-2 gap-2">
                                    {delayReasonsData.map((item, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <div
                                                className="size-2.5 rounded-full shrink-0"
                                                style={{ backgroundColor: item.fill }}
                                            />
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-bold text-[#333]">{item.reason}</p>
                                                <p className="text-[9px] text-[#666]">
                                                    {Math.round(item.count / stats.totalDelays * 100)}% • {item.count} cases
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </fieldset>

                        {/* Contact Info */}
                        {isAvailable && (
                            <fieldset className="border border-[#d9d9d9] rounded-[3px] p-3 pt-1">
                                <legend className="text-[#003399] text-xs px-1">Quick Contact</legend>
                                <div className="flex gap-2 mt-1">
                                    <button className="win7-btn flex-1 h-8 text-[10px] flex items-center justify-center gap-1.5">
                                        <IconPhone className="size-3.5" />
                                        Call Driver
                                    </button>
                                    <button className="win7-btn flex-1 h-8 text-[10px] flex items-center justify-center gap-1.5">
                                        <IconMail className="size-3.5" />
                                        Send Message
                                    </button>
                                </div>
                            </fieldset>
                        )}
                    </div>
                    {/* Status Bar */}
                    <div className="status-bar">
                        <p className="status-bar-field">Driver Status: {status.label}</p>
                        <p className="status-bar-field justify-end">ID: {driver.id}</p>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
