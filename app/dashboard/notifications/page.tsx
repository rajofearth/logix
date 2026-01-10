"use client"

import * as React from "react"

import { NotificationList } from "./_components/NotificationList"
import { useNotifications } from "./_hooks/useNotifications"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function NotificationsPage() {
    const { notifications, markAsRead, markAllAsRead, remove } = useNotifications()

    return (
        <DashboardShell title="Notifications Center">
            <div className="h-full flex flex-col bg-[#ece9d8]">
                <div className="flex-1 overflow-hidden p-4">
                    <div className="win7-groupbox h-full flex flex-col bg-white">
                        <legend>All Notifications</legend>
                        <div className="flex-1 overflow-y-auto win7-p-4">
                            <div className="max-w-2xl mx-auto h-full">
                                <NotificationList
                                    notifications={notifications}
                                    onMarkAsRead={markAsRead}
                                    onMarkAllAsRead={markAllAsRead}
                                    onDelete={remove}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    )
}
