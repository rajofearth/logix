"use client"

import * as React from "react"

import { NotificationList } from "./_components/NotificationList"
import { useNotifications } from "./_hooks/useNotifications"

import { DashboardPage } from "@/components/dashboard/crm/DashboardPage"

export default function NotificationsPage() {
    const { notifications, markAsRead, markAllAsRead, remove } = useNotifications()

    return (
        <DashboardPage title="Notifications" className="p-0">
            <div className="flex flex-1 flex-col overflow-hidden">
                <div className="@container/main flex flex-1 flex-col">
                    <div className="max-w-2xl w-full mx-auto flex flex-col flex-1 h-full">
                        <NotificationList
                            notifications={notifications}
                            onMarkAsRead={markAsRead}
                            onMarkAllAsRead={markAllAsRead}
                            onDelete={remove}
                        />
                    </div>
                </div>
            </div>
        </DashboardPage>
    )
}
