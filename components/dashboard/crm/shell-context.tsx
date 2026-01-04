"use client"

import * as React from "react"

export type DashboardShellContextValue = {
  setTitle: (title: string | undefined) => void
  setActions: (actions: React.ReactNode) => void
}

const DashboardShellContext = React.createContext<DashboardShellContextValue | null>(
  null
)

export function DashboardShellProvider({
  value,
  children,
}: {
  value: DashboardShellContextValue
  children: React.ReactNode
}) {
  return (
    <DashboardShellContext.Provider value={value}>
      {children}
    </DashboardShellContext.Provider>
  )
}

export function useDashboardShell() {
  const ctx = React.useContext(DashboardShellContext)
  if (!ctx) {
    throw new Error("useDashboardShell must be used within DashboardShellProvider.")
  }
  return ctx
}


