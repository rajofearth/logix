"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconBellRinging,
  IconBuildingWarehouse,
  IconCreditCard,
  IconFileInvoice,
  IconFolderOpen,
  IconInnerShadowTop,
  IconLayoutDashboard,
  IconLifebuoy,
  IconMapRoute,
  IconMessageCircle,
  IconPlane,
  IconRoute,
  IconScan,
  IconSearch,
  IconSettings2,
  IconSteeringWheel,
  IconTrain,
  IconTruckDelivery,
  IconUsersGroup,
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
import { getUnreadCount } from "@/app/dashboard/notifications/_server/notificationActions"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconLayoutDashboard,
    },
    {
      title: "Jobs",
      url: "/dashboard/jobs",
      icon: IconTruckDelivery,
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
      title: "Tracking",
      url: "/dashboard/track",
      icon: IconMapRoute,
    },
    {
      title: "Air Shipments",
      url: "/dashboard/air-shipments",
      icon: IconPlane,
    },
    {
      title: "Train Shipments",
      url: "/dashboard/train-shipments",
      icon: IconTrain,
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
      title: "Invoices & Billing",
      url: "/dashboard/billing",
      icon: IconFileInvoice,
    },
    {
      title: "Payments",
      url: "/dashboard/payments",
      icon: IconCreditCard,
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
  ],
  navGeneral: [
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
  ],

  navSecondary: [
    {
      title: "Get Help",
      url: "#",
      icon: IconLifebuoy,
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
  const [unreadNotifications, setUnreadNotifications] = React.useState<number>(0)

  React.useEffect(() => {
    let cancelled = false
      ; (async () => {
        try {
          const count = await getUnreadCount()
          if (!cancelled) setUnreadNotifications(count)
        } catch (e) {
          console.error("[Sidebar] unread notifications error:", e)
        }
      })()
    return () => {
      cancelled = true
    }
  }, [])

  React.useEffect(() => {
    // Keep unread badge in sync with new incoming notifications
    const es = new EventSource("/api/notifications/stream")

    const refresh = async () => {
      try {
        const count = await getUnreadCount()
        setUnreadNotifications(count)
      } catch (e) {
        console.error("[Sidebar] unread notifications refresh error:", e)
      }
    }

    es.addEventListener("notification", (() => { void refresh() }) as EventListener)
    return () => {
      es.close()
    }
  }, [])

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
        <NavGeneral
          items={data.navGeneral}
          label="General"
          notificationsUnreadCount={unreadNotifications}
        />
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
