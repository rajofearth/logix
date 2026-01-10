// Notification Types and Mock Data
import type { NotificationType as PrismaNotificationType } from "@prisma/client"

export type NotificationType = PrismaNotificationType

export interface NotificationDTO {
    id: string
    type: NotificationType
    title: string
    message: string
    timestamp: string
    read: boolean
    avatar?: string
    icon?: string
    actionUrl?: string
}

// Status colors matching existing design system
export const notificationTypeConfig = {
    job: {
        label: "Job",
        bgColor: "bg-primary/10",
        textColor: "text-primary",
        iconBgColor: "bg-primary/20",
    },
    driver: {
        label: "Driver",
        bgColor: "bg-emerald-500/10",
        textColor: "text-emerald-500",
        iconBgColor: "bg-emerald-500/20",
    },
    packageVerification: {
        label: "Scans",
        bgColor: "bg-amber-500/10",
        textColor: "text-amber-500",
        iconBgColor: "bg-amber-500/20",
    },
    billing: {
        label: "Billing",
        bgColor: "bg-blue-500/10",
        textColor: "text-blue-500",
        iconBgColor: "bg-blue-500/20",
    },
    system: {
        label: "System",
        bgColor: "bg-muted",
        textColor: "text-muted-foreground",
        iconBgColor: "bg-muted",
    },
    warehouse: {
        label: "Warehouse",
        bgColor: "bg-purple-500/10",
        textColor: "text-purple-500",
        iconBgColor: "bg-purple-500/20",
    },
}

// Mock notifications for development
export const mockNotifications: NotificationDTO[] = [
    {
        id: "notif-1",
        type: "job",
        title: "New Job Assigned",
        message: "Job #JB-2024-0891 has been assigned to driver Michael Chen.",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
        read: false,
        actionUrl: "/dashboard/jobs",
    },
    {
        id: "notif-2",
        type: "driver",
        title: "Driver Arrived",
        message: "Sarah Wilson has arrived at the pickup location for Job #JB-2024-0887.",
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
        read: false,
        actionUrl: "/dashboard/driver",
    },
    {
        id: "notif-3",
        type: "billing",
        title: "Invoice Generated",
        message: "Invoice #INV-2024-0156 for $2,450.00 has been generated and sent to ABC Logistics.",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
        read: false,
        actionUrl: "/dashboard/billing",
    },
    {
        id: "notif-4",
        type: "job",
        title: "Job Completed",
        message: "Job #JB-2024-0885 has been successfully completed by driver James Rodriguez.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        read: true,
        actionUrl: "/dashboard/jobs",
    },
    {
        id: "notif-5",
        type: "driver",
        title: "Driver Status Update",
        message: "Alex Thompson has switched to 'Available' status and is ready for new assignments.",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        read: true,
        actionUrl: "/dashboard/driver",
    },
    {
        id: "notif-6",
        type: "system",
        title: "System Maintenance",
        message: "Scheduled maintenance will occur on Jan 5th, 2026 from 2:00 AM to 4:00 AM PST.",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        read: true,
    },
    {
        id: "notif-7",
        type: "billing",
        title: "Payment Received",
        message: "Payment of $1,875.00 received from XYZ Transport for Invoice #INV-2024-0149.",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        read: true,
        actionUrl: "/dashboard/billing",
    },
    {
        id: "notif-8",
        type: "job",
        title: "Delivery Delayed",
        message: "Job #JB-2024-0879 delivery has been delayed due to traffic. New ETA: 4:30 PM.",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        read: true,
        actionUrl: "/dashboard/jobs",
    },
]
