"use client";

import { useState, useEffect, useCallback } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { WarehouseHeader } from "./_components/header";
import { FloorNavigator } from "./_components/floor-navigator";
import { WarehouseVisualGrid } from "./_components/warehouse-grid";
import { WarehouseFooterStats } from "./_components/footer-stats";
import { Warehouse, Floor } from "./_components/types";
import { fetchWarehouses, fetchWarehouse, WarehouseListItem } from "./_lib/api";
import { Loader2, Plus } from "lucide-react";
import { AddWarehouseDialog } from "./_components/add-warehouse-dialog";
import { AddFloorDialog } from "./_components/add-floor-dialog";
import { AddBlockDialog } from "./_components/add-block-dialog";
import { Button } from "@/components/ui/button";

export default function WarehousePage() {
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [warehouseList, setWarehouseList] = useState<WarehouseListItem[]>([]);
  const [warehouses, setWarehouses] = useState<Map<string, Warehouse>>(new Map());

  // Selection states
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);
  const [highlightedBlockId, setHighlightedBlockId] = useState<string | null>(null);
  const [addWarehouseOpen, setAddWarehouseOpen] = useState(false);
  const [addFloorOpen, setAddFloorOpen] = useState(false);
  const [addBlockOpen, setAddBlockOpen] = useState(false);

  // Load warehouses list on mount
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const list = await fetchWarehouses();
        setWarehouseList(list);

        if (list.length > 0) {
          setSelectedWarehouseId(list[0].id);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load warehouses");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Load full warehouse data when selection changes
  useEffect(() => {
    if (!selectedWarehouseId) return;

    // Check if already loaded
    if (warehouses.has(selectedWarehouseId)) {
      const w = warehouses.get(selectedWarehouseId)!;
      if (!selectedFloorId && w.floors.length > 0) {
        setSelectedFloorId(w.floors[0].id);
      }
      return;
    }

    const load = async () => {
      try {
        setIsLoading(true);
        const warehouse = await fetchWarehouse(selectedWarehouseId);
        setWarehouses((prev) => new Map(prev).set(selectedWarehouseId, warehouse));

        if (warehouse.floors.length > 0) {
          setSelectedFloorId(warehouse.floors[0].id);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load warehouse");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [selectedWarehouseId, warehouses, selectedFloorId]);

  // Get current warehouse and floor
  const selectedWarehouse = selectedWarehouseId ? warehouses.get(selectedWarehouseId) : null;
  const selectedFloor = selectedWarehouse?.floors.find((f) => f.id === selectedFloorId) ||
    selectedWarehouse?.floors[0];

  // Refresh current warehouse data
  const refreshWarehouse = useCallback(async () => {
    if (!selectedWarehouseId) return;
    try {
      const warehouse = await fetchWarehouse(selectedWarehouseId);
      setWarehouses((prev) => new Map(prev).set(selectedWarehouseId, warehouse));
    } catch (e) {
      console.error("Failed to refresh warehouse:", e);
    }
  }, [selectedWarehouseId]);

  // Refresh warehouses list (after creating new warehouse)
  const refreshWarehouses = useCallback(async () => {
    try {
      const list = await fetchWarehouses();
      setWarehouseList(list);
      // If this is the first warehouse, select it
      if (list.length > 0 && !selectedWarehouseId) {
        setSelectedWarehouseId(list[0].id);
      }
    } catch (e) {
      console.error("Failed to refresh warehouses:", e);
    }
  }, [selectedWarehouseId]);

  // Handle warehouse change
  const handleWarehouseChange = (warehouseId: string) => {
    setSelectedWarehouseId(warehouseId);
    setSelectedFloorId(null); // Will be set when warehouse loads
  };

  // Handle floor change
  const handleFloorChange = (floorId: string) => {
    setSelectedFloorId(floorId);
  };

  // Handle search result click - navigate to the floor and highlight block
  const handleSearchResultClick = async (floorId: string, blockId: string, warehouseId?: string) => {
    // If different warehouse, switch to it first
    if (warehouseId && warehouseId !== selectedWarehouseId) {
      setSelectedWarehouseId(warehouseId);
      // Wait a bit for warehouse to load
      setTimeout(() => {
        setSelectedFloorId(floorId);
        setHighlightedBlockId(blockId);
        setTimeout(() => setHighlightedBlockId(null), 3000);
      }, 500);
    } else {
      setSelectedFloorId(floorId);
      setHighlightedBlockId(blockId);
      setTimeout(() => setHighlightedBlockId(null), 3000);
    }
  };

  // Create warehouses array for header (combining list with loaded data)
  const warehousesForHeader: Warehouse[] = warehouseList.map((item) => {
    const loaded = warehouses.get(item.id);
    if (loaded) return loaded;

    // Return minimal warehouse object for unloaded warehouses
    return {
      id: item.id,
      name: item.name,
      code: item.code,
      address: item.address,
      city: item.city,
      totalFloors: item.totalFloors,
      totalBlocks: item.totalBlocks,
      totalCapacity: item.totalCapacity,
      usedCapacity: item.usedCapacity,
      floors: [],
      workers: item.workers,
      lastUpdated: new Date(item.lastUpdated),
    };
  });

  // Loading state
  if (isLoading && warehouseList.length === 0) {
    return (
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" />
        <SidebarInset className="max-h-screen overflow-hidden flex flex-col">
          <SiteHeader title="Warehouse Management" />
          <div className="flex flex-1 items-center justify-center bg-zinc-950">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
              <p className="text-zinc-400 text-sm">Loading warehouses...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // Error state
  if (error && warehouseList.length === 0) {
    return (
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" />
        <SidebarInset className="max-h-screen overflow-hidden flex flex-col">
          <SiteHeader title="Warehouse Management" />
          <div className="flex flex-1 items-center justify-center bg-zinc-950">
            <div className="flex flex-col items-center gap-3">
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-zinc-400 text-sm underline hover:text-white"
              >
                Retry
              </button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // Empty state
  if (warehouseList.length === 0) {
    return (
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" />
        <SidebarInset className="max-h-screen overflow-hidden flex flex-col">
          <SiteHeader title="Warehouse Management" />
          <div className="flex flex-1 items-center justify-center bg-zinc-950">
            <div className="flex flex-col items-center gap-4">
              <p className="text-zinc-400 text-lg">No warehouses found</p>
              <p className="text-zinc-500 text-sm max-w-md text-center">
                Get started by creating your first warehouse. You can add floors, blocks, and products to organize your inventory.
              </p>
              <Button onClick={() => setAddWarehouseOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Warehouse
              </Button>
            </div>
            <AddWarehouseDialog
              open={addWarehouseOpen}
              onOpenChange={setAddWarehouseOpen}
              onSuccess={refreshWarehouses}
            />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // Create a placeholder floor for loading state
  const placeholderFloor: Floor = {
    id: "loading",
    name: "Loading...",
    level: 1,
    blocks: [],
    stats: {
      totalCapacity: 0,
      usedCapacity: 0,
      totalItems: 0,
      activeWorkers: 0,
    },
  };

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="max-h-screen overflow-hidden flex flex-col">
        <SiteHeader title="Warehouse Management" />
        <div className="flex flex-1 flex-col gap-3 p-4 overflow-hidden bg-zinc-950">
          {/* Header with Warehouse Selector */}
          <WarehouseHeader
            warehouses={warehousesForHeader}
            selectedWarehouseId={selectedWarehouseId || ""}
            onWarehouseChange={handleWarehouseChange}
            onSearchResultClick={handleSearchResultClick}
            onAddWarehouse={() => setAddWarehouseOpen(true)}
          />

          {/* Navigation & Actions */}
          <div className="flex items-center justify-between gap-4">
            {selectedWarehouse && (
              <FloorNavigator
                floors={selectedWarehouse.floors}
                selectedFloorId={selectedFloorId || ""}
                onFloorSelect={handleFloorChange}
                onAddFloor={() => setAddFloorOpen(true)}
              />
            )}

            {selectedWarehouse && selectedFloorId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddBlockOpen(true)}
                className="gap-2 bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <Plus className="h-4 w-4" />
                Add Block
              </Button>
            )}
          </div>

          {/* Main Content - Block Grid */}
          <div className="flex-1 rounded-lg p-4 min-h-0 overflow-hidden relative">
            {isLoading && (
              <div className="absolute inset-0 bg-zinc-950/80 flex items-center justify-center z-10">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
              </div>
            )}
            <WarehouseVisualGrid
              floor={selectedFloor || placeholderFloor}
              highlightedBlockId={highlightedBlockId}
              warehouseId={selectedWarehouseId || undefined}
              onRefresh={refreshWarehouse}
            />
          </div>

          {/* Footer Stats */}
          <WarehouseFooterStats floor={selectedFloor || placeholderFloor} />
        </div>
      </SidebarInset>

      <AddWarehouseDialog
        open={addWarehouseOpen}
        onOpenChange={setAddWarehouseOpen}
        onSuccess={refreshWarehouses}
      />

      {selectedWarehouseId && (
        <AddFloorDialog
          open={addFloorOpen}
          onOpenChange={setAddFloorOpen}
          warehouseId={selectedWarehouseId}
          onSuccess={refreshWarehouse}
        />
      )}

      {selectedWarehouseId && selectedFloorId && (
        <AddBlockDialog
          open={addBlockOpen}
          onOpenChange={setAddBlockOpen}
          warehouseId={selectedWarehouseId}
          floorId={selectedFloorId}
          onSuccess={refreshWarehouse}
        />
      )}
    </SidebarProvider>
  );
}
