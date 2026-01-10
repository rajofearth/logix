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
    { value: "packageVerification", label: "Scans" },
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
        <div className="flex h-full flex-col p-2 space-y-2">
            {/* Header / Toolbar area */}
            <div className="flex items-end justify-between px-1">
                <h2 className="text-lg text-[#003399] mb-1">Notifications</h2>
                {unreadCount > 0 && (
                    <button
                        onClick={onMarkAllAsRead}
                        className="win7-btn text-[11px] mb-1"
                    >
                        <IconCheck className="size-3 inline-block mr-1" />
                        Mark all read
                    </button>
                )}
            </div>

            {/* Win7 Tabs */}
            <menu role="tablist" className="win7-tablist">
                {filterOptions.map((option) => {
                    const isActive = filter === option.value
                    const count =
                        option.value === "all"
                            ? notifications.length
                            : option.value === "unread"
                                ? unreadCount
                                : notifications.filter((n) => n.type === option.value).length

                    return (
                        <button
                            key={option.value}
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => setFilter(option.value)}
                            className={cn("win7-tab", isActive && "active")}
                        >
                            {option.label}
                            {count > 0 && <span className="ml-1 text-[#666]">({count})</span>}
                        </button>
                    )
                })}
            </menu>

            {/* Notification List (Listbox style) */}
            <div className="win7-listbox flex-1 w-full" role="tabpanel">
                <div className="p-1 space-y-0.5">
                    {filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="mb-4 opacity-50">
                                <IconBellOff className="size-10 text-[#888]" />
                            </div>
                            <p className="text-[12px] text-[#555]">
                                No notifications
                            </p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification, index) => (
                            <div
                                key={notification.id}
                                className="animate-in fade-in-0 slide-in-from-left-1 duration-200"
                                style={{
                                    animationDelay: `${index * 30}ms`,
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
            </div>
        </div>
    )
}
