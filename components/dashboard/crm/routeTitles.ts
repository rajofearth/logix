export const dashboardRouteTitles: ReadonlyArray<readonly [prefix: string, title: string]> =
  [
    ["/dashboard/warehouse", "Warehouse Management"],
    ["/dashboard/package-scans", "Package Scans"],
    ["/dashboard/notifications", "Notifications"],
    ["/dashboard/messages", "Messages"],
    ["/dashboard/settings", "Settings"],
    ["/dashboard/payments", "Payments"],
    ["/dashboard/billing", "Invoices & Billing"],
    ["/dashboard/project", "Projects"],
    ["/dashboard/teams", "Team"],
    ["/dashboard/track", "Tracking"],
    ["/dashboard/driver", "Drivers"],
    ["/dashboard/jobs", "Jobs"],
    ["/dashboard", "Dashboard"],
  ] as const

export function getDashboardTitle(pathname: string): string {
  for (const [prefix, title] of dashboardRouteTitles) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return title
  }
  return "Dashboard"
}


