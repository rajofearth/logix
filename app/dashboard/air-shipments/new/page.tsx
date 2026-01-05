"use client";

import * as React from "react";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ShipmentForm } from "../_components/ShipmentForm";

export default function NewShipmentPage() {
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
                <SiteHeader title="Create Air Shipment" />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6 max-w-2xl">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">
                                    Create Air Shipment
                                </h1>
                                <p className="text-muted-foreground">
                                    Create a new air cargo shipment with automatic carrier assignment
                                </p>
                            </div>
                            <ShipmentForm />
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
