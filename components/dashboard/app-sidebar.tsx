"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconBell,
  IconBuildingWarehouse,
  IconCamera,
  IconCurrentLocation,
  IconDashboard,
  IconFileAi,
  IconFileDescription,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconMessage,
  IconReceipt,
  IconSearch,
  IconSettings,
  IconShieldCheck,
  IconUsers,
} from "@tabler/icons-react"

import { NavGeneral } from '@/components/dashboard/nav-general'
import { NavMain } from '@/components/dashboard/nav-main'
import { NavSecondary } from '@/components/dashboard/nav-secondary'
import { NavUser } from '@/components/dashboard/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useSession } from '@/lib/auth-client'
import { Skeleton } from '@/components/ui/skeleton'

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Jobs",
      url: "/dashboard/jobs",
      icon: IconListDetails,
    },
    {
      title: "Driver",
      url: "/dashboard/driver",
      icon: IconUsers,
    },
    {
      title: "Tracking",
      url: "/dashboard/track",
      icon: IconCurrentLocation,
    },
    {
      title: "Package Scans",
      url: "/dashboard/package-scans",
      icon: IconCamera,
    },
    {
      title: "Warehouse",
      url: "/dashboard/warehouse",
      icon: IconBuildingWarehouse,
    },
    {
      title: "Invoices & Billing",
      url: "/dashboard/billing",
      icon: IconReceipt,
    },
    {
      title: "Payments",
      url: "/dashboard/payments",
      icon: IconShieldCheck,
    },
    {
      title: "Projects",
      url: "/dashboard/project",
      icon: IconFolder,
    },
    {
      title: "Team",
      url: "/dashboard/teams",
      icon: IconUsers,
    },
  ],
  navGeneral: [
    {
      title: "Messages",
      url: "/dashboard/messages",
      icon: IconMessage,
    },
    {
      title: "Notifications",
      url: "/dashboard/notifications",
      icon: IconBell,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
  ],

  navSecondary: [
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],

}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, isPending } = useSession()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="data-[slot=sidebar-menu-button]:p-1.5!" render={<Link href="/dashboard" aria-label="Logix Home" />}><IconInnerShadowTop className="size-5!" /><span className="text-base font-semibold">Logix</span></SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavGeneral items={data.navGeneral} label="General" />
        <NavSecondary items={data.navSecondary} className="mt-auto" />

      </SidebarContent>
      <SidebarFooter>
        {isPending ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-2 px-2 py-1.5">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="grid flex-1 gap-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : session?.user ? (
          <NavUser user={{
            name: session.user.name,
            email: session.user.email,
            image: session.user.image ?? undefined,
          }} />
        ) : null}
      </SidebarFooter>
    </Sidebar>
  )
}
