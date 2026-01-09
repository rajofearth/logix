"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { WarehouseHeader } from "./_components/header";
import { FloorNavigator } from "./_components/floor-navigator";
import { WarehouseVisualGrid } from "./_components/warehouse-grid";
import { WarehouseFooterStats } from "./_components/footer-stats";
import { Warehouse, Floor } from "./_components/types";
import { fetchWarehouses, fetchWarehouse, WarehouseListItem } from "./_lib/api";
import { Loader2, Plus, AlertCircle } from "lucide-react";
import { AddWarehouseDialog } from "./_components/add-warehouse-dialog";
import { AddFloorDialog } from "./_components/add-floor-dialog";
import { AddBlockDialog } from "./_components/add-block-dialog";
import { Button } from "@/components/ui/button";
import { RestockAiPanel } from "./_components/restock-ai-panel";

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

  const availableCategories = selectedFloor
    ? Array.from(new Set(selectedFloor.blocks.map((b) => b.category)))
    : [];

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

  // Handle search result click
  const handleSearchResultClick = async (floorId: string, blockId: string, warehouseId?: string) => {
    // If different warehouse, switch to it first
    if (warehouseId && warehouseId !== selectedWarehouseId) {
      setSelectedWarehouseId(warehouseId);
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

  // Create warehouses array for header
  const warehousesForHeader: Warehouse[] = warehouseList.map((item) => {
    const loaded = warehouses.get(item.id);
    if (loaded) return loaded;
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

  // Placeholder floor
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

  if (isLoading && warehouseList.length === 0) {
    return (
      <DashboardShell title="Warehouse Management">
        <div className="flex h-full items-center justify-center bg-[#ece9d8]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-gray-500" />
            <p className="text-sm text-gray-600">Loading warehouses...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (error && warehouseList.length === 0) {
    return (
      <DashboardShell title="Warehouse Management">
        <div className="flex h-full items-center justify-center bg-[#ece9d8]">
          <div className="win7-window p-4 bg-white border border-red-500 flex flex-col items-center gap-2">
            <AlertCircle className="text-red-500" />
            <p className="text-red-600 font-bold">{error}</p>
            <button className="win7-btn" onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (warehouseList.length === 0) {
    return (
      <DashboardShell title="Warehouse Management">
        <div className="flex h-full items-center justify-center bg-[#ece9d8]">
          <div className="win7-groupbox bg-white p-4 max-w-md text-center">
            <h2 className="text-lg font-bold text-[#003399]">No Warehouses Found</h2>
            <p className="text-sm text-gray-500 mb-4">Start by creating your first warehouse.</p>
            <button className="win7-btn" onClick={() => setAddWarehouseOpen(true)}>
              <Plus className="inline size-4 mr-1" /> Create Warehouse
            </button>
          </div>
        </div>
        <AddWarehouseDialog open={addWarehouseOpen} onOpenChange={setAddWarehouseOpen} onSuccess={refreshWarehouses} />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Warehouse Management System">
      <div className="flex flex-col gap-3 p-3 h-full bg-[#ece9d8]">
        {/* Header */}
        <WarehouseHeader
          warehouses={warehousesForHeader}
          selectedWarehouseId={selectedWarehouseId || ""}
          onWarehouseChange={handleWarehouseChange}
          onSearchResultClick={handleSearchResultClick}
          onAddWarehouse={() => setAddWarehouseOpen(true)}
        />

        {/* Controls */}
        <div className="flex items-center justify-between gap-4 p-1 bg-[#ece9d8] border-b border-white shadow-[0_1px_0_#aca899]">
          {selectedWarehouse && (
            <FloorNavigator
              floors={selectedWarehouse.floors}
              selectedFloorId={selectedFloorId || ""}
              onFloorSelect={handleFloorChange}
              onAddFloor={() => setAddFloorOpen(true)}
            />
          )}

          {selectedWarehouse && selectedFloorId && (
            <button
              onClick={() => setAddBlockOpen(true)}
              className="win7-btn gap-1 font-bold text-xs"
            >
              <Plus className="h-3 w-3" />
              Add Block
            </button>
          )}
        </div>

        {/* Main Content - Block Grid */}
        <div className="flex-1 border border-[#898c95] bg-white min-h-0 overflow-hidden relative shadow-inner">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
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
        <div className="win7-groupbox">
          <legend>Statistics</legend>
          <div className="win7-p-2">
            <WarehouseFooterStats floor={selectedFloor || placeholderFloor} />
          </div>
        </div>

        {/* AI Restock */}
        {selectedWarehouseId && selectedFloor && (
          <div className="win7-groupbox">
            <legend>AI</legend>
            <div className="win7-p-2">
              <RestockAiPanel
                warehouseId={selectedWarehouseId}
                floorId={selectedFloor.id}
                floorName={selectedFloor.name}
                categories={availableCategories}
              />
            </div>
          </div>
        )}
      </div>

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
    </DashboardShell>
  );
}
