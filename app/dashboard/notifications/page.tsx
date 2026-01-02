"use client"

import * as React from "react"

import type { NotificationDTO } from "./_types"
import { mockNotifications } from "./_types"
import { NotificationList } from "./_components/NotificationList"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function NotificationsPage() {
    const [notifications, setNotifications] = React.useState<NotificationDTO[]>(mockNotifications)

    // Mark single notification as read
    const handleMarkAsRead = React.useCallback((id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        )
    }, [])

    // Mark all notifications as read
    const handleMarkAllAsRead = React.useCallback(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }, [])

    // Delete notification
    const handleDelete = React.useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, [])

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader title="Notifications" />
                <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="@container/main flex flex-1 flex-col">
                        <div className="max-w-2xl w-full mx-auto flex flex-col flex-1 h-full">
                            <NotificationList
                                notifications={notifications}
                                onMarkAsRead={handleMarkAsRead}
                                onMarkAllAsRead={handleMarkAllAsRead}
                                onDelete={handleDelete}
                            />
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
