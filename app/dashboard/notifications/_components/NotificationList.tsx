"use client"

import * as React from "react"
import { IconBellOff, IconCheck } from "@tabler/icons-react"

import type { NotificationDTO, NotificationType } from "../_types"
import { NotificationCard } from "./NotificationCard"
import { cn } from "@/lib/utils"

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
        <div className="flex h-full flex-col">
            {/* Windows 7 Tabs */}
            <div className="px-2 pt-2">
                <menu role="tablist" className="win7-tablist flex-wrap" aria-label="Notification Filters">
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
                                aria-controls="notification-panel"
                                className={cn(
                                    "win7-tab",
                                    isActive && "active"
                                )}
                                onClick={() => setFilter(option.value)}
                            >
                                {option.label}
                                {count > 0 && <span className="ml-1 text-xs opacity-70">({count})</span>}
                            </button>
                        )
                    })}
                </menu>
            </div>

            {/* Tab Panel / List Content */}
            <div role="tabpanel" id="notification-panel" className="win7-tabpanel flex-1 flex flex-col p-0 overflow-hidden !bg-white">

                {/* Mark All Read Toolbar inside panel */}
                {unreadCount > 0 && (
                    <div className="p-2 border-b border-[#e5e5e5] bg-[#f0f0f0] flex justify-end">
                        <button
                            onClick={onMarkAllAsRead}
                            className="text-xs text-[#0066cc] hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0"
                        >
                            <IconCheck className="size-3" />
                            Mark all as read
                        </button>
                    </div>
                )}

                <div className="win7-listbox flex-1 h-full w-full border-0">
                    {filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center select-none">
                            <div className="flex size-16 items-center justify-center rounded-full bg-[#f0f0f0] mb-4 border border-[#d9d9d9]">
                                <IconBellOff className="size-8 text-[#888]" />
                            </div>
                            <p className="text-sm text-[#444]">
                                No notifications
                            </p>
                            <p className="text-xs text-[#666] mt-1">
                                {filter === "unread"
                                    ? "You're all caught up!"
                                    : `No ${filter === "all" ? "" : filter} notifications yet`}
                            </p>
                        </div>
                    ) : (
                        <div className="p-1 space-y-0.5">
                            {filteredNotifications.map((notification) => (
                                <NotificationCard
                                    key={notification.id}
                                    notification={notification}
                                    onMarkAsRead={onMarkAsRead}
                                    onDelete={onDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
