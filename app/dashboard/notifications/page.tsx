"use client"

import * as React from "react"

import { NotificationList } from "./_components/NotificationList"
import { useNotifications } from "./_hooks/useNotifications"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function NotificationsPage() {
    const { notifications, markAsRead, markAllAsRead, remove } = useNotifications()

    return (
        <DashboardShell title="Notifications Center">
            <div className="h-full flex flex-col bg-[#ece9d8] p-4">
                <NotificationList
                    notifications={notifications}
                    onMarkAsRead={markAsRead}
                    onMarkAllAsRead={markAllAsRead}
                    onDelete={remove}
                />
            </div>
        </DashboardShell>
    )
}
