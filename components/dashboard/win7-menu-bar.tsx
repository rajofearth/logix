"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    IconBellRinging,
    IconBuildingWarehouse,
    IconCreditCard,
    IconFileInvoice,
    IconFolderOpen,
    IconLayoutDashboard,
    IconMapRoute,
    IconMessageCircle,
    IconPlane,
    IconRoute,
    IconScan,
    IconSettings2,
    IconSteeringWheel,
    IconTrain,
    IconTruckDelivery,
    IconUsersGroup,
} from "@tabler/icons-react"
import { useSession } from "@/lib/auth-client"

const menuItems = [
    {
        title: "Home",
        url: "/dashboard",
        icon: IconLayoutDashboard,
    },
    {
        title: "Jobs",
        url: "/dashboard/jobs",
        icon: IconTruckDelivery,
        submenu: [
            { title: "All Jobs", url: "/dashboard/jobs" },
            { title: "Create Job", url: "/dashboard/jobs/create" },
        ],
    },
    {
        title: "Fulfillment",
        url: "/dashboard/fulfillment",
        icon: IconRoute,
    },
    {
        title: "Driver",
        url: "/dashboard/driver",
        icon: IconSteeringWheel,
    },
    {
        title: "Track",
        url: "/dashboard/track",
        icon: IconMapRoute,
    },
    {
        title: "Shipments",
        icon: IconPlane,
        submenu: [
            { title: "Air Shipments", url: "/dashboard/air-shipments", icon: IconPlane },
            { title: "Train Shipments", url: "/dashboard/train-shipments", icon: IconTrain },
        ],
    },
    {
        title: "Package Scans",
        url: "/dashboard/package-scans",
        icon: IconScan,
    },
    {
        title: "Warehouse",
        url: "/dashboard/warehouse",
        icon: IconBuildingWarehouse,
    },
    {
        title: "Finance",
        icon: IconCreditCard,
        submenu: [
            { title: "Billing", url: "/dashboard/billing", icon: IconFileInvoice },
            { title: "Payments", url: "/dashboard/payments", icon: IconCreditCard },
        ],
    },
    {
        title: "Projects",
        url: "/dashboard/project",
        icon: IconFolderOpen,
    },
    {
        title: "Team",
        url: "/dashboard/teams",
        icon: IconUsersGroup,
    },
]

const generalItems = [
    {
        title: "Messages",
        url: "/dashboard/messages",
        icon: IconMessageCircle,
    },
    {
        title: "Notifications",
        url: "/dashboard/notifications",
        icon: IconBellRinging,
    },
    {
        title: "Settings",
        url: "/dashboard/settings",
        icon: IconSettings2,
    },
]

export function Win7MenuBar() {
    const pathname = usePathname()
    const { data: session } = useSession()

    const isActive = (url: string) => {
        if (url === "/dashboard") {
            return pathname === "/dashboard"
        }
        return pathname.startsWith(url)
    }

    return (
        <ul className="win7-menubar" role="menubar">
            {menuItems.map((item) => (
                <li
                    key={item.title}
                    role="menuitem"
                    tabIndex={0}
                    className={item.url && isActive(item.url) ? "is-active" : undefined}
                >
                    {item.url && !item.submenu ? (
                        <Link href={item.url}>{item.title}</Link>
                    ) : (
                        <span>{item.title}</span>
                    )}
                    {item.submenu && (
                        <ul className="dropdown" role="menu">
                            {item.submenu.map((subItem) => (
                                <li key={subItem.url} role="menuitem">
                                    <Link href={subItem.url}>{subItem.title}</Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </li>
            ))}

            {/* Separator */}
            <li style={{ borderLeft: "1px solid #a0a0a0", margin: "0 4px", padding: 0, height: 20 }} />

            {/* General items */}
            {generalItems.map((item) => (
                <li
                    key={item.title}
                    role="menuitem"
                    tabIndex={0}
                    className={isActive(item.url) ? "is-active" : undefined}
                >
                    <Link href={item.url}>{item.title}</Link>
                </li>
            ))}

            {/* User profile on far right */}
            <li className="user-profile" role="menuitem" tabIndex={0}>
                <span>{session?.user?.name || "User"}</span>
                {session?.user?.image ? (
                    <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="avatar"
                    />
                ) : (
                    <div
                        className="avatar"
                        style={{
                            background: "#4580c4",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontSize: "12px",
                            fontWeight: 600,
                        }}
                    >
                        {(session?.user?.name || "U").charAt(0).toUpperCase()}
                    </div>
                )}
            </li>
        </ul>
    )
}
