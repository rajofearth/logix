"use client"

import * as React from "react"
import { IconRefresh } from "@tabler/icons-react"

import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"

type DashboardHeaderProps = {
  title: string
  actions?: React.ReactNode
}

function CommandButton({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="h-7 rounded-[3px] px-2 text-[12px]"
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

export function DashboardHeader({ title, actions }: DashboardHeaderProps) {
  return (
    <header className="shrink-0">
      <div data-crm="toolbar" className="flex h-9 items-center gap-2 px-2">
        <SidebarTrigger className="-ml-1" />
        <div className="flex items-center gap-2">
          <CommandButton onClick={() => window.location.reload()}>
            <IconRefresh className="mr-1 size-4" />
            Refresh
          </CommandButton>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {actions}
          <ThemeToggle />
        </div>
      </div>

      <div data-crm="header" className="flex h-8 items-center px-2">
        <h1 className="text-[12px] font-semibold">{title}</h1>
      </div>
    </header>
  )
}


