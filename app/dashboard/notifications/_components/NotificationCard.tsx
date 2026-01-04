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
        <button
            type="button"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onKeyDown={handleKeyDown}
            className={cn(
                "group relative flex gap-3 rounded-lg p-3 transition-all duration-300 ease-out text-left w-full",
                "hover:bg-muted/50 hover:shadow-sm hover:-translate-y-0.5",
                "border border-transparent",
                !notification.read && "bg-primary/5 border-primary/10",
                isDeleting && "opacity-0 scale-95 h-0 p-0 m-0 overflow-hidden",
                isMarking && "opacity-70"
            )}
            onClick={handleMarkAsRead}
        >
            {/* Icon with unread indicator */}
            <div className="relative shrink-0">
                <div
                    className={cn(
                        "flex size-10 items-center justify-center rounded-full transition-transform duration-200",
                        config.iconBgColor,
                        isHovered && "scale-110"
                    )}
                >
                    <Icon className={cn("size-5", config.textColor)} />
                </div>
                {/* Unread indicator dot - positioned on icon */}
                {!notification.read && (
                    <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <p
                            className={cn(
                                "text-sm font-medium truncate transition-colors",
                                notification.read ? "text-muted-foreground" : "text-foreground"
                            )}
                        >
                            {notification.title}
                        </p>
                        <Badge
                            variant="outline"
                            className={cn(
                                "shrink-0 text-[10px] px-1.5 py-0",
                                config.textColor
                            )}
                        >
                            {config.label}
                        </Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                    </span>
                </div>

                <p
                    className={cn(
                        "text-xs leading-relaxed transition-colors",
                        notification.read ? "text-muted-foreground/70" : "text-muted-foreground"
                    )}
                >
                    {notification.message}
                </p>
            </div>

            {/* Actions - revealed on hover */}
            <div
                className={cn(
                    "absolute right-2 top-2 flex gap-1 transition-all duration-200",
                    isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
                )}
            >
                {!notification.read && (
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={handleMarkAsRead}
                        className="size-6 hover:bg-primary/10 hover:text-primary"
                    >
                        <IconCheck className="size-3.5" />
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleDelete}
                    className="size-6 hover:bg-destructive/10 hover:text-destructive"
                >
                    <IconX className="size-3.5" />
                </Button>
            </div>
        </button>
    )
}
