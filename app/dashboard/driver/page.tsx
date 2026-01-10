"use client"

import * as React from "react"
import type { DriverStatus } from "./_types"
import type { DriverDTO } from "./_types"
import type { DriverStats } from "./_server/driverActions"
import { listDrivers, getDriverStats } from "./_server/driverActions"
import { DriverFilters } from "./_components/DriverFilters"
import { DriversGrid } from "./_components/DriversGrid"
import { Pagination } from "./_components/Pagination"
import { DriverDetailsSheet } from "./_components/DriverDetailsSheet"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function DriversPage() {
  const [drivers, setDrivers] = React.useState<DriverDTO[]>([])
  const [stats, setStats] = React.useState<DriverStats>({
    all: 0,
    available: 0,
    onRoute: 0,
    offDuty: 0,
  })
  const [isLoading, setIsLoading] = React.useState(true)
  const [filter, setFilter] = React.useState<DriverStatus | "all">("all")
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)

  // Sheet state
  const [selectedDriver, setSelectedDriver] = React.useState<DriverDTO | null>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  // Fetch stats on mount
  React.useEffect(() => {
    getDriverStats().then(setStats)
  }, [])

  // Fetch drivers when filter/search/page changes
  React.useEffect(() => {
    setIsLoading(true)
    listDrivers(filter, debouncedSearch, page)
      .then((result) => {
        setDrivers(result.drivers)
        setTotalPages(result.totalPages)
        setTotalItems(result.total)
      })
      .finally(() => setIsLoading(false))
  }, [filter, debouncedSearch, page])

  // Reset to page 1 when filter or search changes
  React.useEffect(() => {
    setPage(1)
  }, [filter, debouncedSearch])

  // Handle driver card click
  const handleDriverClick = (driver: DriverDTO) => {
    setSelectedDriver(driver)
    setIsSheetOpen(true)
  }

  return (
    <DashboardShell title="Logix Dashboard - Drivers" itemCount={totalItems}>
      <div className="win7-groupbox">
        <legend>Driver Management</legend>
        <div className="win7-p-4 flex flex-col gap-4">
          <DriverFilters
            stats={stats}
            activeFilter={filter}
            onFilterChange={setFilter}
            search={search}
            onSearchChange={setSearch}
          />

          <DriversGrid
            drivers={drivers}
            isLoading={isLoading}
            onDriverClick={handleDriverClick}
          />

          {totalItems > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>

      <DriverDetailsSheet
        driver={selectedDriver}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </DashboardShell>
  )
}