"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    IconLoader2,
    IconPackage,
    IconPlaneDeparture,
    IconPlaneArrival,
    IconArrowRight,
    IconScale, // Using IconScale instead of IconWeight for better compatibility
    IconClipboardText, // Using IconClipboardText for description
    IconSearch,
    IconMapPin
} from "@tabler/icons-react";

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
    const [fromQuery, setFromQuery] = React.useState("");
    const [toQuery, setToQuery] = React.useState("");

    const handleFromSelect = (icao: string | null) => {
        setFromIcao(icao);
        if (icao) {
            const airport = REAL_AIRPORTS.find(a => a.icao === icao);
            if (airport) setFromQuery(`${airport.city} (${airport.icao})`);
        }
    };

    const handleToSelect = (icao: string | null) => {
        setToIcao(icao);
        if (icao) {
            const airport = REAL_AIRPORTS.find(a => a.icao === icao);
            if (airport) setToQuery(`${airport.city} (${airport.icao})`);
        }
    };

    const filterAirports = (query: string) => {
        if (!query) return REAL_AIRPORTS;
        const lower = query.toLowerCase();
        return REAL_AIRPORTS.filter(a =>
            a.city.toLowerCase().includes(lower) ||
            a.name.toLowerCase().includes(lower) ||
            a.icao.toLowerCase().includes(lower)
        );
    };

    const filteredFrom = filterAirports(fromQuery);
    const filteredTo = filterAirports(toQuery);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const weight = parseFloat(weightKg);
            if (isNaN(weight) || weight <= 0) throw new Error("Please enter a valid weight");
            if (!fromIcao || !toIcao) throw new Error("Please select both pickup and delivery airports");
            if (fromIcao === toIcao) throw new Error("Pickup and delivery airports cannot be the same");

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
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to create shipment");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Main Card */}
            <div className="group relative rounded-sm border bg-card/50 backdrop-blur-xl shadow-premium overflow-hidden transition-all duration-300 hover:shadow-premium-lg">
                {/* Header Gradient */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />

                <div className="px-8 py-6 border-b bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-sm bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-inner border border-primary/10">
                            <IconPackage className="size-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-foreground">New Air Shipment</h2>
                            <p className="text-sm text-muted-foreground">Configure route and cargo details</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-10">
                    {/* 1. Route Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                            <span className="flex items-center justify-center size-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">1</span>
                            Route Configuration
                        </div>

                        <div className="relative p-1 rounded-sm bg-muted/30 border ring-1 ring-border/50">
                            {/* Visual Divider Vertical (Desktop) */}
                            <div className="absolute inset-y-0 left-1/2 -ml-px w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent hidden md:block" />

                            <div className="grid md:grid-cols-2 gap-4 relative">
                                {/* Pickup */}
                                <div className="group/field relative bg-card hover:bg-card/80 transition-colors rounded-sm p-5 border shadow-sm hover:shadow-md focus-within:ring-2 focus-within:ring-primary/20">
                                    <Label className="mb-2 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pickup Location</Label>
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-sm bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                                            <IconPlaneDeparture className="size-5" />
                                        </div>
                                        <div className="flex-1 relative">
                                            <Combobox value={fromIcao} onValueChange={handleFromSelect}>
                                                <div className="relative">
                                                    <IconSearch className="absolute left-0 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                                    <ComboboxInput
                                                        placeholder="Search pickup airport..."
                                                        value={fromQuery}
                                                        onChange={(e) => setFromQuery(e.target.value)}
                                                        className="w-full bg-transparent border-none p-0 pl-6 h-9 text-base font-medium placeholder:text-muted-foreground/40 focus-visible:ring-0"
                                                    />
                                                </div>
                                                <ComboboxContent align="start" className="w-[320px] p-0 overflow-hidden rounded-sm border-border shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-3xl bg-popover/95">
                                                    <ComboboxList className="max-h-[280px] p-1">
                                                        {filteredFrom.length === 0 && <ComboboxEmpty className="py-4 text-sm text-muted-foreground text-center">No airports found</ComboboxEmpty>}
                                                        {filteredFrom.map((airport) => (
                                                            <ComboboxItem key={airport.icao} value={airport.icao} className="rounded-sm p-2 aria-selected:bg-primary/10 aria-selected:text-primary cursor-pointer">
                                                                <div className="flex items-center gap-3 w-full">
                                                                    <div className="size-8 rounded-sm bg-muted flex items-center justify-center shrink-0">
                                                                        <IconMapPin className="size-4 text-muted-foreground" />
                                                                    </div>
                                                                    <div className="flex flex-col min-w-0 flex-1">
                                                                        <span className="font-medium text-sm truncate">{airport.city}</span>
                                                                        <span className="text-xs text-muted-foreground truncate">{airport.name}</span>
                                                                    </div>
                                                                    <span className="font-mono text-xs font-bold bg-muted px-1.5 py-0.5 rounded-sm tracking-wide border">{airport.icao}</span>
                                                                </div>
                                                            </ComboboxItem>
                                                        ))}
                                                    </ComboboxList>
                                                </ComboboxContent>
                                            </Combobox>
                                        </div>
                                    </div>
                                </div>

                                {/* Connector Icon */}
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex size-8 rounded-sm bg-background border shadow-sm items-center justify-center text-muted-foreground rotate-45">
                                    <IconArrowRight className="size-4 -rotate-45" />
                                </div>

                                {/* Delivery */}
                                <div className="group/field relative bg-card hover:bg-card/80 transition-colors rounded-sm p-5 border shadow-sm hover:shadow-md focus-within:ring-2 focus-within:ring-primary/20">
                                    <Label className="mb-2 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">Delivery Location</Label>
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-sm bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
                                            <IconPlaneArrival className="size-5" />
                                        </div>
                                        <div className="flex-1 relative">
                                            <Combobox value={toIcao} onValueChange={handleToSelect}>
                                                <div className="relative">
                                                    <IconSearch className="absolute left-0 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                                    <ComboboxInput
                                                        placeholder="Search delivery airport..."
                                                        value={toQuery}
                                                        onChange={(e) => setToQuery(e.target.value)}
                                                        className="w-full bg-transparent border-none p-0 pl-6 h-9 text-base font-medium placeholder:text-muted-foreground/40 focus-visible:ring-0"
                                                    />
                                                </div>
                                                <ComboboxContent align="end" className="w-[320px] p-0 overflow-hidden rounded-sm border-border shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-3xl bg-popover/95">
                                                    <ComboboxList className="max-h-[280px] p-1">
                                                        {filteredTo.length === 0 && <ComboboxEmpty className="py-4 text-sm text-muted-foreground text-center">No airports found</ComboboxEmpty>}
                                                        {filteredTo.map((airport) => (
                                                            <ComboboxItem key={airport.icao} value={airport.icao} disabled={airport.icao === fromIcao} className="rounded-sm p-2 aria-selected:bg-primary/10 aria-selected:text-primary cursor-pointer disabled:opacity-50">
                                                                <div className="flex items-center gap-3 w-full">
                                                                    <div className="size-8 rounded-sm bg-muted flex items-center justify-center shrink-0">
                                                                        <IconMapPin className="size-4 text-muted-foreground" />
                                                                    </div>
                                                                    <div className="flex flex-col min-w-0 flex-1">
                                                                        <span className="font-medium text-sm truncate">{airport.city}</span>
                                                                        <span className="text-xs text-muted-foreground truncate">{airport.name}</span>
                                                                    </div>
                                                                    <span className="font-mono text-xs font-bold bg-muted px-1.5 py-0.5 rounded-sm tracking-wide border">{airport.icao}</span>
                                                                </div>
                                                            </ComboboxItem>
                                                        ))}
                                                    </ComboboxList>
                                                </ComboboxContent>
                                            </Combobox>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-border/50" />

                    {/* 2. Cargo Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                            <span className="flex items-center justify-center size-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">2</span>
                            Cargo Details
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Package Name */}
                            <div className="space-y-2">
                                <Label htmlFor="packageName" className="text-xs font-medium uppercase text-muted-foreground">Package Name</Label>
                                <div className="relative group/input">
                                    <IconPackage className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground transition-colors group-focus-within/input:text-primary" />
                                    <Input
                                        id="packageName"
                                        placeholder="e.g. Industrial Parts Batch A"
                                        value={packageName}
                                        onChange={(e) => setPackageName(e.target.value)}
                                        className="pl-10 h-12 bg-background/50 border-input transition-all focus:border-primary focus:ring-primary/20"
                                    />
                                </div>
                            </div>

                            {/* Weight */}
                            <div className="space-y-2">
                                <Label htmlFor="weight" className="text-xs font-medium uppercase text-muted-foreground">Total Weight (kg)</Label>
                                <div className="relative group/input">
                                    <IconScale className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground transition-colors group-focus-within/input:text-primary" />
                                    <Input
                                        id="weight"
                                        type="number"
                                        step="0.1"
                                        placeholder="0.00"
                                        value={weightKg}
                                        onChange={(e) => setWeightKg(e.target.value)}
                                        className="pl-10 h-12 bg-background/50 border-input transition-all focus:border-primary focus:ring-primary/20 font-mono"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">KG</div>
                                </div>
                            </div>

                            {/* Description - Full Width */}
                            <div className="md:col-span-2 space-y-2">
                                <Label htmlFor="desc" className="text-xs font-medium uppercase text-muted-foreground">Description & Instructions <span className="text-muted-foreground/50 lowercase ml-1">(Optional)</span></Label>
                                <div className="relative group/input">
                                    <IconClipboardText className="absolute left-3 top-4 size-5 text-muted-foreground transition-colors group-focus-within/input:text-primary" />
                                    <Textarea
                                        id="desc"
                                        placeholder="Add any special handling instructions or content details..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="pl-10 min-h-[100px] bg-background/50 border-input transition-all focus:border-primary focus:ring-primary/20 resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 bg-muted/20 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground text-center sm:text-left">
                        By creating this shipment, you agree to the carrier assignment terms. <br />
                        <span className="opacity-70">Tracking will be activated immediately.</span>
                    </p>
                    <div className="flex w-full sm:w-auto gap-3">
                        <Button type="button" variant="ghost" className="flex-1 sm:flex-none hover:bg-destructive/10 hover:text-destructive" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="flex-1 sm:flex-none min-w-[160px] bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/25 transition-all text-primary-foreground font-semibold">
                            {isLoading ? <IconLoader2 className="animate-spin size-4 mr-2" /> : <IconPackage className="size-4 mr-2" />}
                            Create Shipment
                        </Button>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mx-auto max-w-lg mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                    <div className="size-2 rounded-full bg-destructive animate-pulse" />
                    {error}
                </div>
            )}
        </form>
    );
}
