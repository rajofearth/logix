"use client"

import { type Icon } from "@tabler/icons-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroupLabel,
} from '@/components/ui/sidebar'
import { Badge } from "@/components/ui/badge"

export function NavGeneral({
    items,
    label,
    notificationsUnreadCount,
}: {
    items: {
        title: string
        url: string
        icon?: Icon
    }[]
    label?: string
    notificationsUnreadCount?: number
}) {
    const pathname = usePathname()

    return (
        <SidebarGroup>
            {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <Link href={item.url}>
                                <SidebarMenuButton
                                    tooltip={item.title}
                                    isActive={
                                        item.url !== "#" &&
                                        (pathname === item.url ||
                                            (item.url !== "/" && pathname.startsWith(`${item.url}/`)))
                                    }
                                >
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                    {item.url === "/dashboard/notifications" &&
                                        (notificationsUnreadCount ?? 0) > 0 && (
                                            <Badge
                                                variant="default"
                                                className="ml-auto h-5 px-1.5 text-[10px] leading-none"
                                            >
                                                {notificationsUnreadCount}
                                            </Badge>
                                        )}
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
