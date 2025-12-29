"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { WarehouseHeader } from "./_components/header";
import { FloorNavigator } from "./_components/floor-navigator";
import { WarehouseVisualGrid } from "./_components/warehouse-grid";
import { WarehouseFooterStats } from "./_components/footer-stats";
import { MOCK_WAREHOUSES } from "./_components/mock-data";

export default function WarehousePage() {
  // State for selected warehouse and floor
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(MOCK_WAREHOUSES[0].id);
  const [selectedFloorId, setSelectedFloorId] = useState(MOCK_WAREHOUSES[0].floors[0].id);

  // Get current warehouse and floor
  const selectedWarehouse = MOCK_WAREHOUSES.find((w) => w.id === selectedWarehouseId)!;
  const selectedFloor = selectedWarehouse.floors.find((f) => f.id === selectedFloorId) ||
    selectedWarehouse.floors[0];

  // Handle warehouse change
  const handleWarehouseChange = (warehouseId: string) => {
    setSelectedWarehouseId(warehouseId);
    // Reset to first floor of new warehouse
    const newWarehouse = MOCK_WAREHOUSES.find((w) => w.id === warehouseId);
    if (newWarehouse) {
      setSelectedFloorId(newWarehouse.floors[0].id);
    }
  };

  // Handle floor change
  const handleFloorChange = (floorId: string) => {
    setSelectedFloorId(floorId);
  };

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
      <SidebarInset className="max-h-screen overflow-hidden flex flex-col">
        <SiteHeader title="Warehouse Management" />
        <div className="flex flex-1 flex-col gap-3 p-4 overflow-hidden">
          {/* Header with Warehouse Selector */}
          <WarehouseHeader
            warehouses={MOCK_WAREHOUSES}
            selectedWarehouseId={selectedWarehouseId}
            onWarehouseChange={handleWarehouseChange}
          />

          {/* Floor Navigator */}
          <FloorNavigator
            floors={selectedWarehouse.floors}
            selectedFloorId={selectedFloorId}
            onFloorSelect={handleFloorChange}
          />

          {/* Main Content - Block Grid */}
          <div className="flex-1 rounded-xl border bg-background/50 p-4 shadow-sm relative min-h-0 overflow-hidden">
            {/* Background Pattern */}
            <div
              className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <div className="relative z-10 h-full">
              <WarehouseVisualGrid floor={selectedFloor} />
            </div>
          </div>

          {/* Footer Stats */}
          <WarehouseFooterStats
            warehouse={selectedWarehouse}
            floor={selectedFloor}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
