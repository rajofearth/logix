"use client";

import * as React from "react";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TrainShipmentForm } from "../_components/TrainShipmentForm";

export default function NewTrainShipmentPage() {
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
                <SiteHeader title="Create Train Shipment" />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6 max-w-3xl">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">
                                    Create Train Shipment
                                </h1>
                                <p className="text-muted-foreground">
                                    Book cargo transport on Indian Railways with real-time
                                    tracking
                                </p>
                            </div>
                            <TrainShipmentForm />
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
