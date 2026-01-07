"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { IconLoader2, IconPackage, IconPlaneDeparture, IconPlaneArrival, IconArrowRight } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
} from "@/components/ui/combobox";
import { REAL_AIRPORTS } from "@/lib/carriers/carriers-data";
import { createShipment } from "../_server/actions";

export function ShipmentForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const [packageName, setPackageName] = React.useState("");
    const [weightKg, setWeightKg] = React.useState("");
    const [description, setDescription] = React.useState("");

    // Combobox states
    const [fromIcao, setFromIcao] = React.useState<string | null>(null);
    const [toIcao, setToIcao] = React.useState<string | null>(null);

    // We maintain input values to allow filtering if needed, 
    // but for now we'll rely on the Combobox's finding capabilities 
    // or just show the list (it's short). 
    // Ideally, we'd filter REAL_AIRPORTS based on a query state here.
    const [fromQuery, setFromQuery] = React.useState("");
    const [toQuery, setToQuery] = React.useState("");

    // Update query when selection changes to reflect the choice in the input
    const handleFromSelect = (icao: string | null) => {
        setFromIcao(icao);
        if (icao) {
            const airport = REAL_AIRPORTS.find(a => a.icao === icao);
            if (airport) {
                setFromQuery(`${airport.city} (${airport.icao})`);
            }
        }
    };

    const handleToSelect = (icao: string | null) => {
        setToIcao(icao);
        if (icao) {
            const airport = REAL_AIRPORTS.find(a => a.icao === icao);
            if (airport) {
                setToQuery(`${airport.city} (${airport.icao})`);
            }
        }
    };

    const filteredFromAirports = fromQuery
        ? REAL_AIRPORTS.filter(a =>
            a.city.toLowerCase().includes(fromQuery.toLowerCase()) ||
            a.name.toLowerCase().includes(fromQuery.toLowerCase()) ||
            a.icao.toLowerCase().includes(fromQuery.toLowerCase())
        )
        : REAL_AIRPORTS;

    const filteredToAirports = toQuery
        ? REAL_AIRPORTS.filter(a =>
            a.city.toLowerCase().includes(toQuery.toLowerCase()) ||
            a.name.toLowerCase().includes(toQuery.toLowerCase()) ||
            a.icao.toLowerCase().includes(toQuery.toLowerCase())
        )
        : REAL_AIRPORTS;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const weight = parseFloat(weightKg);
            if (isNaN(weight) || weight <= 0) {
                setError("Please enter a valid weight");
                setIsLoading(false);
                return;
            }

            if (!fromIcao || !toIcao) {
                setError("Please select both pickup and delivery airports");
                setIsLoading(false);
                return;
            }

            if (fromIcao === toIcao) {
                setError("Pickup and delivery airports cannot be the same");
                setIsLoading(false);
                return;
            }

            const result = await createShipment({
                packageName: packageName.trim(),
                weightKg: weight,
                description: description.trim() || undefined,
                fromIcao: fromIcao,
                toIcao: toIcao,
            });

            if (result.success) {
                router.push(`/dashboard/air-shipments/${result.shipmentId}`);
            } else {
                setError(result.error);
            }
        } catch {
            setError("Failed to create shipment. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto py-6">
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="bg-muted/30 p-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-sm">
                            <IconPackage className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold tracking-tight">New Air Shipment</h2>
                            <p className="text-sm text-muted-foreground">
                                Create a new shipment and assign it to an available flight route.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Route Selection Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Route Details</h3>

                        <div className="relative rounded-xl border bg-card shadow-sm grid md:grid-cols-[1fr,auto,1fr] items-center">
                            {/* Pickup Input */}
                            <div className="p-4 space-y-1.5 hover:bg-muted/50 transition-colors rounded-l-xl">
                                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                    <IconPlaneDeparture className="size-3.5 text-blue-500" />
                                    PICKUP AIRPORT
                                </Label>
                                <Combobox
                                    value={fromIcao}
                                    onValueChange={handleFromSelect}
                                >
                                    <ComboboxInput
                                        placeholder="Select pickup location..."
                                        value={fromQuery}
                                        onChange={(e) => setFromQuery(e.target.value)}
                                        className="h-9 border-none bg-transparent px-0 text-base font-medium shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50"
                                    />
                                    <ComboboxContent align="start" className="w-[300px]">
                                        <ComboboxList>
                                            {filteredFromAirports.length === 0 && (
                                                <ComboboxEmpty>No results found</ComboboxEmpty>
                                            )}
                                            {filteredFromAirports.map((airport) => (
                                                <ComboboxItem key={airport.icao} value={airport.icao}>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-medium">{airport.city} ({airport.icao})</span>
                                                        <span className="text-xs text-muted-foreground truncate max-w-[260px]">{airport.name}</span>
                                                    </div>
                                                </ComboboxItem>
                                            ))}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                            </div>

                            {/* Divider / Connector */}
                            <div className="flex items-center justify-center py-2 md:py-0 px-2 text-muted-foreground/30 relative z-10">
                                <IconArrowRight className="size-5 md:rotate-0 rotate-90" />
                                <div className="absolute inset-y-2 left-1/2 -ml-px w-px bg-border md:block hidden" />
                                <div className="absolute inset-x-2 top-1/2 -mt-px h-px bg-border md:hidden block" />
                            </div>

                            {/* Delivery Input */}
                            <div className="p-4 space-y-1.5 hover:bg-muted/50 transition-colors rounded-r-xl">
                                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                    <IconPlaneArrival className="size-3.5 text-green-500" />
                                    DELIVERY AIRPORT
                                </Label>
                                <Combobox
                                    value={toIcao}
                                    onValueChange={handleToSelect}
                                >
                                    <ComboboxInput
                                        placeholder="Select delivery location..."
                                        value={toQuery}
                                        onChange={(e) => setToQuery(e.target.value)}
                                        className="h-9 border-none bg-transparent px-0 text-base font-medium shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50"
                                    />
                                    <ComboboxContent align="end" className="w-[300px]">
                                        <ComboboxList>
                                            {filteredToAirports.length === 0 && (
                                                <ComboboxEmpty>No results found</ComboboxEmpty>
                                            )}
                                            {filteredToAirports.map((airport) => (
                                                <ComboboxItem
                                                    key={airport.icao}
                                                    value={airport.icao}
                                                    disabled={airport.icao === fromIcao}
                                                >
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-medium">{airport.city} ({airport.icao})</span>
                                                        <span className="text-xs text-muted-foreground truncate max-w-[260px]">{airport.name}</span>
                                                    </div>
                                                </ComboboxItem>
                                            ))}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-border" />

                    {/* Cargo Details Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Cargo Information</h3>

                        <div className="grid gap-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="packageName">
                                        Package Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="packageName"
                                        placeholder="e.g., Electronics Shipment"
                                        value={packageName}
                                        onChange={(e) => setPackageName(e.target.value)}
                                        required
                                        disabled={isLoading}
                                        className="h-11"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="weightKg">
                                        Weight (kg) <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="weightKg"
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        placeholder="e.g., 25"
                                        value={weightKg}
                                        onChange={(e) => setWeightKg(e.target.value)}
                                        required
                                        disabled={isLoading}
                                        className="h-11"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description (optional)</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Additional details about the package content, handling instructions, etc."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    disabled={isLoading}
                                    className="resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-muted/30 p-6 border-t flex items-center justify-between">
                    <p className="text-xs text-muted-foreground max-w-md">
                        * Real-time tracking will be enabled immediately after shipment creation.
                        Flight route will be determined by the selected airports.
                    </p>

                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="gap-2 min-w-[140px]">
                            {isLoading && <IconLoader2 className="size-4 animate-spin" />}
                            Create Shipment
                        </Button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 flex items-center gap-2 text-destructive animate-in fade-in slide-in-from-top-1">
                    <span className="text-sm font-medium">Error: {error}</span>
                </div>
            )}
        </form>
    );
}
