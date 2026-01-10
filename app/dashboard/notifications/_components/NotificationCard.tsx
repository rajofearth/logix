"use client"

import * as React from "react"
import { IconBell, IconCheck, IconReceipt, IconScan, IconSettings, IconTruck, IconX } from "@tabler/icons-react"
import { formatDistanceToNow } from "date-fns"

import type { NotificationDTO } from "../_types"
import { cn } from "@/lib/utils"

const typeIcons = {
    job: IconTruck,
    driver: IconBell,
    packageVerification: IconScan,
    billing: IconReceipt,
    system: IconSettings,
}

interface NotificationCardProps {
    notification: NotificationDTO
    onMarkAsRead: (id: string) => void
    onDelete: (id: string) => void
}

export function NotificationCard({
    notification,
    onMarkAsRead,
    onDelete,
}: NotificationCardProps) {
    const [isHovered, setIsHovered] = React.useState(false)

    // Win7 list items usually don't have separate delete/mark actions on the item itself 
    // unless it's a context menu, but for UX we keep them.
    // We will show them on hover, Win7 style (simple icons).

    const Icon = typeIcons[notification.type]

    const handleMarkAsRead = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (notification.read) return
        onMarkAsRead(notification.id)
    }

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation()
        onDelete(notification.id)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handleMarkAsRead(e as unknown as React.MouseEvent)
        }
    }

    return (
        <div
            role="button"
            tabIndex={0}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onKeyDown={handleKeyDown}
            onClick={handleMarkAsRead}
            className={cn(
                "win7-listbox-item relative group w-full text-left select-none",
                notification.read ? "opacity-70 grayscale-[0.5]" : "font-medium"
            )}
        >
            {/* Icon */}
            <div className="shrink-0 flex items-center justify-center p-1">
                {/* Use a simple image wrapper or just the icon */}
                <div className="relative">
                    <Icon className={cn("size-6",
                        // In Win7 list items, icons usually keep their color but text changes to white on select.
                        // Our listbox-item css handles text color helper classes? Not fully.
                        // Let's force icon color to be visible or white on hover.
                        "text-[#444] group-hover:text-white"
                    )} />
                    {!notification.read && (
                        <div className="absolute -top-1 -right-1 size-2 rounded-full bg-[#0066cc] border border-white shadow-sm" />
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-14 flex flex-col justify-center h-full py-1">
                <div className="flex items-center gap-2">
                    <span className="truncate text-sm group-hover:text-white">
                        {notification.title}
                    </span>
                    <span className="text-[10px] text-[#666] group-hover:text-white/80 shrink-0">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                    </span>
                </div>
                <p className="text-xs text-[#555] group-hover:text-white/90 truncate leading-tight">
                    {notification.message}
                </p>
            </div>

            {/* Hover Actions (Win7 style: usually visible on selection) */}
            <div
                className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 flex gap-1",
                    isHovered ? "opacity-100" : "opacity-0"
                )}
            >
                {!notification.read && (
                    <button
                        onClick={handleMarkAsRead}
                        title="Mark as read"
                        className="size-6 flex items-center justify-center rounded border border-transparent hover:border-[#fff9] hover:bg-[#ffffff33] text-[#444] group-hover:text-white"
                    >
                        <IconCheck className="size-4" />
                    </button>
                )}
                <button
                    onClick={handleDelete}
                    title="Dismiss"
                    className="size-6 flex items-center justify-center rounded border border-transparent hover:border-[#fff9] hover:bg-[#ffffff33] text-[#444] group-hover:text-white"
                >
                    <IconX className="size-4" />
                </button>
            </div>
        </div>
    )
}
