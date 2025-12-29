"use client";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { WarehouseHeader } from "./_components/header";
import { WarehouseVisualGrid } from "./_components/warehouse-grid";
import { WarehouseFooterStats } from "./_components/footer-stats";

export default function WarehousePage() {
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
        <div className="flex flex-1 flex-col gap-4 p-4 overflow-hidden">
          <WarehouseHeader />

          <div className="flex-1 rounded-xl border bg-background/50 p-4 shadow-sm relative min-h-0 overflow-auto">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            />
            <div className="relative z-10 h-full">
              <WarehouseVisualGrid />
            </div>
          </div>

          <WarehouseFooterStats />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
