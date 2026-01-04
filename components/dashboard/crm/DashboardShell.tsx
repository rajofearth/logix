"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { DashboardHeader } from "@/components/dashboard/crm/DashboardHeader"
import { getDashboardTitle } from "@/components/dashboard/crm/routeTitles"
import { DashboardShellProvider } from "@/components/dashboard/crm/shell-context"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const defaultTitle = React.useMemo(() => getDashboardTitle(pathname), [pathname])

  const [title, setTitle] = React.useState<string | undefined>(undefined)
  const [actions, setActions] = React.useState<React.ReactNode>(null)

  React.useEffect(() => {
    // Reset per-route overrides when navigating.
    setTitle(undefined)
    setActions(null)
  }, [pathname])

  const providerValue = React.useMemo(
    () => ({ setTitle, setActions }),
    [setTitle, setActions]
  )

  const layoutStyle = {
    "--sidebar-width": "18rem",
    "--header-height": "calc(var(--spacing) * 12)",
  } as React.CSSProperties

  return (
    <DashboardShellProvider value={providerValue}>
      <SidebarProvider style={layoutStyle}>
        <AppSidebar variant="inset" />
        <SidebarInset className="min-h-svh">
          <DashboardHeader title={title ?? defaultTitle} actions={actions ?? undefined} />
          <div className="min-h-0 flex-1 overflow-auto">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </DashboardShellProvider>
  )
}


