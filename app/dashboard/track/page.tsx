"use client";

import * as React from "react";
import { useState } from "react";
import { MapPin } from "lucide-react";
import { deliveries } from "./_data/deliveries";
import { DeliveryCard } from "./_components/DeliveryCard";
import { SearchBar } from "./_components/SearchBar";
import { TrackingMap } from "./_components/TrackingMap";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function TrackPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const filteredDeliveries = deliveries.filter(
        (delivery) =>
            delivery.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            delivery.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            delivery.client.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                <SiteHeader title="Tracking" />

                {/* Main Content - Split Layout */}
                <div className="flex flex-1 h-[calc(100vh-var(--header-height))] overflow-hidden">

                    {/* Left Panel - Cards */}
                    <div className="w-full md:w-[340px] lg:w-[380px] shrink-0 flex flex-col border-r border-border bg-background">
                        {/* Search */}
                        <div className="p-4 pb-2">
                            <SearchBar value={searchQuery} onChange={setSearchQuery} />
                        </div>

                        {/* Title */}
                        <div className="px-4 py-2">
                            <h2 className="text-base font-semibold text-foreground">
                                Ongoing Delivery Panel
                            </h2>
                        </div>

                        {/* Scrollable Cards */}
                        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
                            {filteredDeliveries.map((delivery) => (
                                <DeliveryCard
                                    key={delivery.id}
                                    delivery={delivery}
                                    isHovered={hoveredCard === delivery.id}
                                    onHover={setHoveredCard}
                                />
                            ))}

                            {filteredDeliveries.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground">
                                    <MapPin className="size-10 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No deliveries found</p>
                                    <p className="text-xs mt-1">Try adjusting your search</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel - Map (hidden on mobile) */}
                    <div className="hidden md:flex flex-1 min-w-0">
                        <TrackingMap
                            deliveries={filteredDeliveries}
                            selectedDeliveryId={hoveredCard}
                        />
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
