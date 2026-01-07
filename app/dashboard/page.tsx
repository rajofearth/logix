import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { ChartAreaInteractive } from '@/components/dashboard/chart-area-interactive'
import { DataTable } from '@/components/dashboard/data-table'
import { SectionCards } from '@/components/dashboard/section-cards'

import data from "./data.json"

export default function Page() {
  return (
    <DashboardShell title="Logix Dashboard - Home" itemCount={data.length}>
      <div className="win7-mb-4">
        <SectionCards />
      </div>
      <div className="win7-mb-4">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </DashboardShell>
  )
}
