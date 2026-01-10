"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin, Radio } from "lucide-react";
import { type Delivery } from "../_data/deliveries";
import { DeliveryCard } from "./DeliveryCard";
import { SearchBar } from "./SearchBar";
import { TrackingMap } from "./TrackingMap";
import { MapStatusBar } from "./MapStatusBar";
import { DriverInfoPanel } from "./DriverInfoPanel";
import { CameraFeed } from "./CameraFeed";
import { ThreatDetectionPanel } from "./ThreatDetectionPanel";
import type { ThreatDetectionResult } from "./ThreatDetectionOverlay";
import { useDriverLocation } from "../_hooks/useDriverLocation";
import { getDirections } from "@/app/dashboard/jobs/_server/mapboxDirections";
import type { GeoJsonFeature, LineStringGeometry, LngLat } from "@/app/dashboard/jobs/_types";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";

interface TrackViewProps {
    initialDeliveries: Delivery[];
}

export function TrackView({ initialDeliveries }: TrackViewProps) {
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState("");
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
    const [routeGeoJson, setRouteGeoJson] = useState<GeoJsonFeature<LineStringGeometry> | null>(null);
    const [pickupRouteGeoJson, setPickupRouteGeoJson] = useState<GeoJsonFeature<LineStringGeometry> | null>(null);
    const [fuelStations, setFuelStations] = useState<Array<{ name: string; address?: string; distance?: number; coord: LngLat }>>([]);
    
    // Threat detection state
    const [threatResult, setThreatResult] = useState<ThreatDetectionResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [lastScanTime, setLastScanTime] = useState<Date | null>(null);

    // Real-time driver location tracking
    const { current: driverLocation, path: driverPath, isConnected: isLiveConnected } = useDriverLocation(
        selectedDelivery?.isActive ? selectedDelivery.id : null
    );

    // Auto-select delivery based on URL jobId param (e.g., from driver sheet Track button)
    useEffect(() => {
        const jobId = searchParams.get("jobId");
        if (jobId && initialDeliveries.length > 0) {
            const delivery = initialDeliveries.find(d => d.id === jobId);
            if (delivery) {
                setSelectedDelivery(delivery);
            }
        }
    }, [searchParams, initialDeliveries]);

    useEffect(() => {
        if (!selectedDelivery) {
            setRouteGeoJson(null);
            setFuelStations([]);
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch Route
                const routePromise = getDirections(
                    { lat: selectedDelivery.origin.lat, lng: selectedDelivery.origin.lng },
                    { lat: selectedDelivery.destination.lat, lng: selectedDelivery.destination.lng }
                );

                // Fetch Gas Stations near Pickup
                const { searchNearbyPlaces } = await import("@/app/dashboard/jobs/_server/mapboxGeocoding");
                const stationsPromise = searchNearbyPlaces(
                    { lat: selectedDelivery.origin.lat, lng: selectedDelivery.origin.lng },
                    "gas_station"
                );

                const [routeResult, stationsResult] = await Promise.all([routePromise, stationsPromise]);

                setRouteGeoJson(routeResult.routeGeoJson);
                setFuelStations(stationsResult);

            } catch (error) {
                console.error("Failed to fetch data:", error);
                setRouteGeoJson(current => current ?? null);
            }
        };

        fetchData();
    }, [selectedDelivery]);

    // Update routes from driver location if available
    useEffect(() => {
        if (isLiveConnected) {
            // Update delivery route
            if (driverLocation?.routeGeometry) {
                setRouteGeoJson(driverLocation.routeGeometry as GeoJsonFeature<LineStringGeometry>);
            }
            // Update pickup route (driver -> pickup location)
            if (driverLocation?.pickupRouteGeometry) {
                setPickupRouteGeoJson(driverLocation.pickupRouteGeometry as GeoJsonFeature<LineStringGeometry>);
            }
        }
    }, [driverLocation?.routeGeometry, driverLocation?.pickupRouteGeometry, isLiveConnected]);

    const filteredDeliveries = initialDeliveries.filter(
        (delivery) =>
            delivery.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            delivery.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDeliveryClick = (delivery: Delivery) => {
        setSelectedDelivery(selectedDelivery?.id === delivery.id ? null : delivery);
    };

    return (
        <DashboardShell title="Logix Dashboard - Tracking" itemCount={filteredDeliveries.length}>
            {/* Main Content - Split Layout */}
            <div className="flex w-full h-full relative" style={{ height: 'calc(100vh - 120px)' }}> {/* Adjusted height for window chrome */}

                {/* Left Panel - Cards */}
                <div className="w-full md:w-[340px] lg:w-[380px] shrink-0 flex flex-col border-r border-[#898c95] bg-[#ece9d8]">
                    {/* Search */}
                    <div className="p-3 pb-2">
                        <SearchBar value={searchQuery} onChange={setSearchQuery} />
                    </div>

                    {/* Scrollable Cards */}
                    <div className="flex-1 overflow-y-auto px-3 pb-3 pt-1 space-y-2">
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
                            <div className="text-center py-12 text-gray-500">
                                <MapPin className="size-10 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No deliveries found</p>
                                <p className="text-xs mt-1">Try adjusting your search</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel - Map */}
                <div className="flex-1 overflow-hidden relative bg-[#808080]"> {/* Map container */}
                    {selectedDelivery ? (
                        <>
                            <div className="absolute inset-0">
                                <TrackingMap
                                    pickup={{
                                        lat: selectedDelivery.origin.lat,
                                        lng: selectedDelivery.origin.lng,
                                    }}
                                    drop={{
                                        lat: selectedDelivery.destination.lat,
                                        lng: selectedDelivery.destination.lng,
                                    }}
                                    routeGeoJson={routeGeoJson}
                                    pickupRouteGeoJson={pickupRouteGeoJson}
                                    fuelStations={fuelStations}
                                    driverLocation={driverLocation ? {
                                        lat: driverLocation.latitude,
                                        lng: driverLocation.longitude,
                                        heading: driverLocation.heading,
                                    } : undefined}
                                    driverPath={driverPath.map(p => ({
                                        lat: p.latitude,
                                        lng: p.longitude,
                                    }))}
                                />
                            </div>

                            {/* Live indicator */}
                            {isLiveConnected && (
                                <div className="absolute top-4 left-4 flex items-center gap-2 bg-emerald-500/90 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg z-10 border border-emerald-700">
                                    <Radio className="size-3 animate-pulse" />
                                    LIVE
                                </div>
                            )}
                            {/* Map Overlays */}
                            <MapStatusBar
                                status={selectedDelivery.status}
                                lastUpdated={driverLocation?.updatedAt}
                                isLive={isLiveConnected}
                            />
                            <DriverInfoPanel
                                delivery={selectedDelivery}
                                topRightDock={
                                    <CameraFeed
                                        className="w-[320px]"
                                        title="Camera Feed"
                                        onThreatDetected={setThreatResult}
                                        onAnalysisStateChange={setIsAnalyzing}
                                        onLastScanTimeChange={setLastScanTime}
                                    />
                                }
                                threatDetectionPanel={
                                    <ThreatDetectionPanel
                                        result={threatResult}
                                        isLoading={isAnalyzing}
                                        lastScanTime={lastScanTime}
                                        onDismiss={() => setThreatResult(null)}
                                    />
                                }
                            />
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full bg-[#ece9d8] text-gray-600 p-6 text-center">
                            <div className="bg-white/50 p-4 rounded-full mb-4 border border-[#898c95]">
                                <MapPin className="size-8 opacity-50" />
                            </div>
                            <h3 className="font-bold text-lg mb-1 font-sans">Select a Delivery</h3>
                            <p className="text-sm max-w-[250px]">
                                Click on a delivery card to view its route on the map
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </DashboardShell>
    );
}
