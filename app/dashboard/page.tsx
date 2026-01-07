"use client"

import dynamic from 'next/dynamic'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { ChartAreaInteractive } from '@/components/dashboard/chart-area-interactive'
import { SectionCards } from '@/components/dashboard/section-cards'

import data from "./data.json"

// Dynamic import with SSR disabled to prevent hydration mismatch
// caused by auto-generated IDs in Base UI/Radix components
const DataTable = dynamic(
  () => import('@/components/dashboard/data-table').then(mod => ({ default: mod.DataTable })),
  { ssr: false }
)

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
