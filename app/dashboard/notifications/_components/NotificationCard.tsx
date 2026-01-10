"use client"

import * as React from "react"
import { IconBell, IconCheck, IconReceipt, IconScan, IconSettings, IconTruck, IconX } from "@tabler/icons-react"
import { formatDistanceToNow } from "date-fns"

import type { NotificationDTO } from "../_types"
import { notificationTypeConfig } from "../_types"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [isMarking, setIsMarking] = React.useState(false)

    const config = notificationTypeConfig[notification.type]
    const Icon = typeIcons[notification.type]

    const handleMarkAsRead = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (notification.read) return
        setIsMarking(true)
        setTimeout(() => {
            onMarkAsRead(notification.id)
            setIsMarking(false)
        }, 200)
    }

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsDeleting(true)
        setTimeout(() => {
            onDelete(notification.id)
        }, 300)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handleMarkAsRead(e as unknown as React.MouseEvent)
        }
    }

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            className={cn(
                "win7-list-item win7-notification-item w-full transition-none",
                !notification.read && "unread", // Bold font handled by CSS
                isDeleting && "opacity-0 scale-95 h-0 p-0 m-0 overflow-hidden",
                isMarking && "opacity-70"
            )}
            onClick={handleMarkAsRead}
        >
            {/* Icon */}
            <div className="relative shrink-0 mr-1 mt-0.5">
                <Icon className={cn("size-4 text-[#444]", config.textColor)} />
                {!notification.read && (
                    <span className="absolute -top-1 -right-1 text-[8px] text-[#0066cc]">●</span>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p className={cn(
                        "text-[12px] truncate leading-tight",
                        notification.read ? "text-gray-500 font-normal" : "text-black font-semibold"
                    )}>
                        {notification.title}
                    </p>
                    <span className="text-[10px] text-gray-500 shrink-0">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                    </span>
                </div>

                <div className="flex items-start gap-1 mt-0.5">
                    <p className={cn(
                        "text-[11px] leading-snug line-clamp-2",
                        notification.read ? "text-gray-400" : "text-gray-600"
                    )}>
                        {notification.message}
                    </p>
                </div>
            </div>

            {/* Hover Actions (Windows Explorer style visible on hover) */}
            <div
                className={cn(
                    "flex gap-1 shrink-0 ml-1",
                    isHovered ? "opacity-100" : "opacity-0"
                )}
            >
                {!notification.read && (
                    <button
                        onClick={handleMarkAsRead}
                        className="p-1 hover:bg-[#e6f4fc] hover:border hover:border-[#a8d8eb] rounded-sm"
                        title="Mark as read"
                    >
                        <IconCheck className="size-3 text-[#0066cc]" />
                    </button>
                )}
                <button
                    onClick={handleDelete}
                    className="p-1 hover:bg-[#e6f4fc] hover:border hover:border-[#a8d8eb] rounded-sm"
                    title="Delete"
                >
                    <IconX className="size-3 text-[#cc0000]" />
                </button>
            </div>
        </div>
    )
}
