"use client";

import * as React from "react";
import { useState } from "react";
import { MapPin } from "lucide-react";
import { deliveries, type Delivery } from "./_data/deliveries";
import { DeliveryCard } from "./_components/DeliveryCard";
import { SearchBar } from "./_components/SearchBar";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function TrackPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);

    const filteredDeliveries = deliveries.filter(
        (delivery) =>
            delivery.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            delivery.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            delivery.client.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDeliveryClick = (delivery: Delivery) => {
        setSelectedDelivery(selectedDelivery?.id === delivery.id ? null : delivery);
    };

    return (
        <SidebarProvider
            className="h-svh w-full overflow-hidden"
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset className="h-svh overflow-hidden flex flex-col">
                <SiteHeader title="Tracking" />

                {/* Main Content - Split Layout */}
                <div className="flex flex-1 overflow-hidden">

                    {/* Left Panel - Cards */}
                    <div className="w-full md:w-[340px] lg:w-[380px] shrink-0 flex flex-col border-r border-border bg-background">
                        {/* Search */}
                        <div className="p-4 pb-2">
                            <SearchBar value={searchQuery} onChange={setSearchQuery} />
                        </div>

                        {/* Scrollable Cards */}
                        <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2 space-y-3">
                            {filteredDeliveries.map((delivery) => (
                                <DeliveryCard
                                    key={delivery.id}
                                    delivery={delivery}
                                    isHovered={hoveredCard === delivery.id}
                                    isSelected={selectedDelivery?.id === delivery.id}
                                    onHover={setHoveredCard}
                                    onClick={() => handleDeliveryClick(delivery)}
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

                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
