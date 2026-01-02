"use client"

import * as React from "react"
import { IconBellOff, IconCheck } from "@tabler/icons-react"

import type { NotificationDTO, NotificationType } from "../_types"
import { NotificationCard } from "./NotificationCard"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

type FilterType = "all" | "unread" | NotificationType

interface NotificationListProps {
    notifications: NotificationDTO[]
    onMarkAsRead: (id: string) => void
    onMarkAllAsRead: () => void
    onDelete: (id: string) => void
}

const filterOptions: { value: FilterType; label: string }[] = [
    { value: "all", label: "All" },
    { value: "unread", label: "Unread" },
    { value: "job", label: "Jobs" },
    { value: "driver", label: "Drivers" },
    { value: "billing", label: "Billing" },
    { value: "system", label: "System" },
]

export function NotificationList({
    notifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onDelete,
}: NotificationListProps) {
    const [filter, setFilter] = React.useState<FilterType>("all")

    const unreadCount = notifications.filter((n) => !n.read).length

    const filteredNotifications = React.useMemo(() => {
        return notifications.filter((notification) => {
            if (filter === "all") return true
            if (filter === "unread") return !notification.read
            return notification.type === filter
        })
    }, [notifications, filter])

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="border-b border-border p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
                        {unreadCount > 0 && (
                            <Badge
                                variant="default"
                                className="animate-pulse"
                            >
                                {unreadCount} new
                            </Badge>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onMarkAllAsRead}
                            className="text-xs text-muted-foreground hover:text-primary"
                        >
                            <IconCheck className="size-3.5 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2">
                    {filterOptions.map((option) => {
                        const isActive = filter === option.value
                        const count =
                            option.value === "all"
                                ? notifications.length
                                : option.value === "unread"
                                    ? unreadCount
                                    : notifications.filter((n) => n.type === option.value).length

                        return (
                            <Badge
                                key={option.value}
                                variant={isActive ? "default" : "outline"}
                                className={cn(
                                    "cursor-pointer transition-all duration-200",
                                    isActive && "shadow-sm",
                                    !isActive && "hover:bg-muted/50"
                                )}
                                onClick={() => setFilter(option.value)}
                            >
                                {option.label}
                                {count > 0 && (
                                    <span className={cn(
                                        "ml-1 text-[10px]",
                                        isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                                    )}>
                                        ({count})
                                    </span>
                                )}
                            </Badge>
                        )
                    })}
                </div>
            </div>

            {/* Notification List */}
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="flex size-16 items-center justify-center rounded-full bg-muted mb-4">
                                <IconBellOff className="size-8 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">
                                No notifications
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                                {filter === "unread"
                                    ? "You're all caught up!"
                                    : `No ${filter === "all" ? "" : filter} notifications yet`}
                            </p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification, index) => (
                            <div
                                key={notification.id}
                                className="animate-in fade-in-0 slide-in-from-left-2"
                                style={{
                                    animationDelay: `${index * 50}ms`,
                                    animationFillMode: "backwards",
                                }}
                            >
                                <NotificationCard
                                    notification={notification}
                                    onMarkAsRead={onMarkAsRead}
                                    onDelete={onDelete}
                                />
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
