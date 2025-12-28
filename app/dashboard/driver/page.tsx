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

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

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
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Drivers" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 px-4 md:gap-6 md:py-6 lg:px-6">
              {/* Filters & Search */}
              <DriverFilters
                stats={stats}
                activeFilter={filter}
                onFilterChange={setFilter}
                search={search}
                onSearchChange={setSearch}
              />

              {/* Drivers Grid */}
              <DriversGrid
                drivers={drivers}
                isLoading={isLoading}
                onDriverClick={handleDriverClick}
              />

              {/* Pagination - always visible when there are items */}
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
        </div>
      </SidebarInset>

      {/* Driver Details Sheet */}
      <DriverDetailsSheet
        driver={selectedDriver}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </SidebarProvider>
  )
}