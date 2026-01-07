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
                <div className="flex flex-1 flex-col items-center w-full">
                    <div className="w-full max-w-5xl flex flex-col gap-2">
                        <div className="flex flex-col gap-4 py-8 px-4 w-full">
                            <div className="text-center mb-4">
                                <h1 className="text-3xl font-bold tracking-tight">
                                    Create Air Shipment
                                </h1>
                                <p className="text-muted-foreground mt-2">
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
