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

export function NavGeneral({
    items,
    label,
}: {
    items: {
        title: string
        url: string
        icon?: Icon
    }[]
    label?: string
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
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
