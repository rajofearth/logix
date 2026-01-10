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
            <SheetContent
                side="right"
                className="w-full sm:max-w-md overflow-y-auto p-0"
                style={{
                    background: 'var(--w7-surface)',
                    borderLeft: '1px solid var(--w7-w-bd)',
                    font: 'var(--w7-font)'
                }}
            >
                {/* Win7 Aero Header */}
                <div
                    className="sticky top-0 z-10"
                    style={{
                        background: 'linear-gradient(to right, rgba(255,255,255,0.4), rgba(0,0,0,0.1), rgba(255,255,255,0.2)), var(--w7-w-bg)',
                        borderBottom: '1px solid var(--w7-w-bd)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)',
                    }}
                >
                    <SheetHeader className="p-4 pb-3">
                        <div className="flex items-center gap-3">
                            <Avatar
                                size="lg"
                                className="border-2 border-[rgba(0,0,0,0.5)] shadow-md"
                            >
                                <AvatarImage src={driver.avatar ?? undefined} alt={driver.name} />
                                <AvatarFallback
                                    className="text-sm font-semibold"
                                    style={{ background: 'var(--w7-el-grad)', color: '#333' }}
                                >
                                    {getInitials(driver.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <SheetTitle
                                        className="text-base truncate"
                                        style={{
                                            color: '#000',
                                            textShadow: '0 0 10px #fff, 0 0 10px #fff, 0 0 10px #fff'
                                        }}
                                    >
                                        {driver.name}
                                    </SheetTitle>
                                    <span className={cn(
                                        "inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase rounded-[var(--w7-el-bdr)] border",
                                        status.badgeClass
                                    )}>
                                        <span className={cn("size-1.5 rounded-full mr-1", status.dotColor)} />
                                        {status.label}
                                    </span>
                                </div>
                                <SheetDescription
                                    className="flex items-center gap-3 mt-0.5"
                                    style={{ color: '#333', textShadow: '0 0 5px #fff' }}
                                >
                                    <span className="flex items-center gap-1">
                                        <IconStar className="size-3 fill-[#f4a100]" style={{ color: '#f4a100' }} />
                                        <span className="font-medium" style={{ color: '#000' }}>{stats.rating}</span>
                                        <span style={{ color: '#555' }}>({stats.reviews})</span>
                                    </span>
                                    <span style={{ color: '#666' }}>•</span>
                                    <span>{stats.yearsExp}+ years exp</span>
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>
                </div>

                <div className="p-4 space-y-4">
                    {/* Available Driver - Quick Actions */}
                    {isAvailable && (
                        <fieldset
                            className="border rounded-[var(--w7-el-bdr)] p-3 m-0 mb-4"
                            style={{
                                borderColor: 'var(--w7-el-bd-h)',
                                background: '#e8f4fc',
                                boxShadow: 'inset 0 0 0 1px #fff'
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="size-10 rounded-[var(--w7-el-bdr)] flex items-center justify-center"
                                    style={{
                                        background: 'linear-gradient(#fff 45%, #f0f0f0 45%, #e0e0e0)',
                                        border: '1px solid #8e8f8f',
                                        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.8)'
                                    }}
                                >
                                    <IconTruck className="size-5" style={{ color: '#0066cc' }} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[11px] font-semibold" style={{ color: '#000' }}>Ready for Assignment</p>
                                    <p className="text-[10px]" style={{ color: '#666' }}>This driver is available for new jobs</p>
                                </div>
                                <button
                                    className="win7-btn px-3 h-7 text-[11px] flex items-center justify-center"
                                    style={{
                                        background: 'linear-gradient(#eaf6fd 45%, #bee6fd 45%, #a7d9f5)',
                                        color: '#000',
                                        borderColor: 'var(--w7-el-bd-h)',
                                        fontWeight: 600
                                    }}
                                >
                                    Assign Job
                                </button>
                            </div>
                        </fieldset>
                    )}

                    {/* Active Job Card - Only for on-route drivers */}
                    {driver.currentJob && !isAvailable && (
                        <fieldset
                            className="border rounded-[var(--w7-el-bdr)] p-0 m-0 overflow-hidden"
                            style={{ borderColor: 'var(--w7-el-bd)' }}
                        >
                            {/* Header */}
                            <div
                                className="p-3 pb-2"
                                style={{ background: '#e8f4fc', borderBottom: '1px solid #bce8f1' }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="size-8 rounded-[var(--w7-el-bdr)] flex items-center justify-center"
                                            style={{ background: 'var(--w7-el-grad)', border: '1px solid var(--w7-el-bd)' }}
                                        >
                                            <IconTruck className="size-4" style={{ color: 'var(--w7-link-c)' }} />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-semibold" style={{ color: '#000' }}>{driver.currentJob}</p>
                                            <p className="text-[9px]" style={{ color: '#666' }}>Active Delivery</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 pt-2 space-y-3" style={{ background: '#fff' }}>
                                {/* Win7 Progress bar */}
                                <div>
                                    <div className="flex items-center justify-between text-[10px] mb-1">
                                        <span style={{ color: '#666' }}>Route Progress</span>
                                        <span className="font-semibold" style={{ color: 'var(--w7-link-c)' }}>{stats.progress}%</span>
                                    </div>
                                    <div
                                        role="progressbar"
                                        className="h-[15px] rounded-[var(--w7-el-bdr)] overflow-hidden"
                                        style={{
                                            border: '1px solid var(--w7-el-bd)',
                                            boxShadow: 'inset 0 0 0 1px rgba(243,243,243,0.5)',
                                            background: 'linear-gradient(to bottom, #f3f3f3, #fcfcfc 3px, #dbdbdb 6px, #cacaca 6px, #d5d5d5), #ddd'
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: `${stats.progress}%`,
                                                height: '100%',
                                                background: 'linear-gradient(to bottom, rgba(243,243,243,0.7), rgba(252,252,252,0.7) 3px, transparent 6px), linear-gradient(to bottom, transparent 65%, rgba(255,255,255,0.3)), #0bd82c'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Route */}
                                <div className="flex items-center gap-2 text-[10px]">
                                    <div className="flex-1 truncate">
                                        <span style={{ color: '#666' }}>From:</span>
                                        <span className="ml-1 font-medium" style={{ color: '#000' }}>{driver.route?.origin || "Los Angeles, CA"}</span>
                                    </div>
                                    <span style={{ color: '#666' }}>→</span>
                                    <div className="flex-1 truncate text-right">
                                        <span className="font-medium" style={{ color: '#000' }}>{driver.route?.destination || "Chicago, IL"}</span>
                                    </div>
                                </div>

                                <button
                                    className="win7-btn w-full h-7 text-[10px]"
                                    onClick={handleTrackClick}
                                >
                                    <IconLocation className="size-3.5 mr-1.5" />
                                    Track Live
                                </button>
                            </div>
                        </fieldset>
                    )}

                    {/* Stats Grid - Win7 groupbox style */}
                    <div className="grid grid-cols-3 gap-2">
                        {/* Total */}
                        <fieldset
                            className="border rounded-[var(--w7-el-bdr)] p-3"
                            style={{ borderColor: '#cdd7db', background: '#fff' }}
                        >
                            <div className="flex items-center gap-1.5 mb-1" style={{ color: 'var(--w7-link-c)' }}>
                                <IconPackage className="size-3.5" />
                                <span className="text-[9px] font-semibold uppercase">Total</span>
                            </div>
                            <p className="text-xl font-bold" style={{ color: 'var(--w7-link-c)' }}>{stats.totalDeliveries}</p>
                            <p className="text-[9px]" style={{ color: '#666' }}>Deliveries</p>
                        </fieldset>

                        {/* On-Time */}
                        <fieldset
                            className="border rounded-[var(--w7-el-bdr)] p-3"
                            style={{ borderColor: '#cdd7db', background: '#fff' }}
                        >
                            <div className="flex items-center gap-1.5 mb-1" style={{ color: '#5cb85c' }}>
                                <IconClock className="size-3.5" />
                                <span className="text-[9px] font-semibold uppercase">On-Time</span>
                            </div>
                            <p className="text-xl font-bold" style={{ color: '#5cb85c' }}>{stats.onTimeRate}%</p>
                            <p className="text-[9px]" style={{ color: '#666' }}>Rate</p>
                        </fieldset>

                        {/* Rating */}
                        <fieldset
                            className="border rounded-[var(--w7-el-bdr)] p-3"
                            style={{ borderColor: '#cdd7db', background: '#fff' }}
                        >
                            <div className="flex items-center gap-1.5 mb-1" style={{ color: '#f4a100' }}>
                                <IconStar className="size-3.5 fill-[#f4a100]" />
                                <span className="text-[9px] font-semibold uppercase">Rating</span>
                            </div>
                            <p className="text-xl font-bold" style={{ color: '#f4a100' }}>{stats.rating}</p>
                            <p className="text-[9px]" style={{ color: '#666' }}>{stats.reviews} Reviews</p>
                        </fieldset>
                    </div>

                    {/* Performance Chart - Win7 groupbox */}
                    <fieldset
                        className="border rounded-[var(--w7-el-bdr)] p-0 m-0 overflow-hidden"
                        style={{ borderColor: '#cdd7db', background: '#fff' }}
                    >
                        <div className="p-3 pb-1 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[11px] font-semibold" style={{ color: '#000' }}>
                                <IconChartLine className="size-4" style={{ color: 'var(--w7-link-c)' }} />
                                Monthly Performance
                            </div>
                            <span
                                className="text-[9px] px-2 py-0.5 rounded-[var(--w7-el-bdr)]"
                                style={{ background: 'linear-gradient(#f2f2f2 45%, #ebebeb 45%, #cfcfcf)', border: '1px solid #8e8f8f', color: '#000' }}
                            >
                                Avg. {Math.round(shipmentData.reduce((sum, d) => sum + d.deliveries, 0) / 12)}/mo
                            </span>
                        </div>
                        <div className="p-3 pt-0">
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
                        </div>
                    </fieldset>

                    {/* Delay Analysis - Win7 groupbox */}
                    <fieldset
                        className="border rounded-[var(--w7-el-bdr)] p-0 m-0 overflow-hidden"
                        style={{ borderColor: '#cdd7db', background: '#fff' }}
                    >
                        <div className="p-3 pb-2 flex items-center justify-between">
                            <span className="text-[11px] font-semibold" style={{ color: '#000' }}>Delay Analysis</span>
                            <span
                                className="text-[9px] px-2 py-0.5 rounded-[var(--w7-el-bdr)]"
                                style={{ border: '1px solid #8e8f8f', background: '#fff', color: '#000' }}
                            >
                                {stats.totalDelays} Total
                            </span>
                        </div>
                        <div className="p-3 pt-0">
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
                                                <p className="text-[10px] font-medium" style={{ color: '#000' }}>{item.reason}</p>
                                                <p className="text-[9px]" style={{ color: '#666' }}>
                                                    {Math.round(item.count / stats.totalDelays * 100)}% • {item.count} cases
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </fieldset>

                    {/* Contact Info - Win7 groupbox */}
                    {isAvailable && (
                        <fieldset
                            className="border rounded-[var(--w7-el-bdr)] p-0 m-0 overflow-hidden"
                            style={{ borderColor: '#cdd7db', background: '#fff' }}
                        >
                            <div className="p-3 pb-2">
                                <span className="text-[11px] font-semibold" style={{ color: '#000' }}>Quick Contact</span>
                            </div>
                            <div className="p-3 pt-0">
                                <div className="flex gap-2">
                                    <button className="win7-btn flex-1 h-8 text-[10px] flex items-center justify-center">
                                        <IconPhone className="size-3.5 mr-1.5" />
                                        Call Driver
                                    </button>
                                    <button className="win7-btn flex-1 h-8 text-[10px] flex items-center justify-center">
                                        <IconMail className="size-3.5 mr-1.5" />
                                        Send Message
                                    </button>
                                </div>
                            </div>
                        </fieldset>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
