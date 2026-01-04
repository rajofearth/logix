"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { useDashboardShell } from "@/components/dashboard/crm/shell-context"

type DashboardPageProps = {
  title?: string
  actions?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export function DashboardPage({
  title,
  actions,
  className,
  children,
}: DashboardPageProps) {
  const { setTitle, setActions } = useDashboardShell()

  React.useEffect(() => {
    setTitle(title)
    setActions(actions ?? null)
    return () => {
      setTitle(undefined)
      setActions(null)
    }
  }, [actions, setActions, setTitle, title])

  return <div className={cn("p-4", className)}>{children}</div>
}


