"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    IconLoader2,
    IconPackage,
    IconPlaneDeparture,
    IconPlaneArrival,
    IconSearch,
} from "@tabler/icons-react";
import { REAL_AIRPORTS } from "@/lib/carriers/carriers-data";
import { createShipment } from "../_server/actions";
import { useShipmentForm } from "../_context/ShipmentFormContext";


export function ShipmentForm() {
    const router = useRouter();
    const { fromIcao, toIcao, setFromIcao, setToIcao } = useShipmentForm();
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const [packageName, setPackageName] = React.useState("");
    const [weightKg, setWeightKg] = React.useState("");
    const [description, setDescription] = React.useState("");

    // Combobox states
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

    const [showFromDropdown, setShowFromDropdown] = React.useState(false);
    const [showToDropdown, setShowToDropdown] = React.useState(false);
    const fromDropdownRef = React.useRef<HTMLDivElement>(null);
    const toDropdownRef = React.useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (fromDropdownRef.current && !fromDropdownRef.current.contains(event.target as Node)) {
                setShowFromDropdown(false);
            }
            if (toDropdownRef.current && !toDropdownRef.current.contains(event.target as Node)) {
                setShowToDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-sm">
            <div className="flex items-center gap-3 mb-4 p-2 bg-[#eef1ff] border border-[#7f9db9]">
                <div className="flex size-10 items-center justify-center bg-white border border-[#7f9db9]">
                    <IconPackage className="size-6 text-blue-600" />
                </div>
                <div>
                    <h2 className="font-bold text-black">New Air Shipment</h2>
                    <p className="text-xs text-gray-500">
                        Configure route and cargo details for auto-assignment.
                    </p>
                </div>
            </div>

            {/* Route Selection */}
            <div className="win7-groupbox">
                <legend>Route Configuration</legend>
                <div className="win7-p-4 space-y-4">
                    {/* Pickup Airport */}
                    <div className="grid gap-1">
                        <label htmlFor="fromAirport" className="font-bold text-black flex items-center gap-1">
                            <IconPlaneDeparture className="size-3.5" />
                            Pickup Airport <span className="text-red-600">*</span>
                        </label>
                        <div className="relative" ref={fromDropdownRef}>
                            <div className="relative flex items-center">
                                <IconSearch className="absolute left-2 size-3.5 text-gray-500 pointer-events-none" />
                                <input
                                    id="fromAirport"
                                    type="text"
                                    placeholder="Search pickup airport..."
                                    value={fromQuery}
                                    onChange={(e) => {
                                        setFromQuery(e.target.value);
                                        setShowFromDropdown(true);
                                    }}
                                    onFocus={() => setShowFromDropdown(true)}
                                    disabled={isLoading}
                                    className="w-full h-6 pl-7 pr-6 border border-[#7f9db9] outline-none focus:border-[#3399ff] text-sm"
                                />
                            </div>
                            {showFromDropdown && filteredFrom.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-[#7f9db9] shadow-lg max-h-48 overflow-y-auto">
                                    {filteredFrom.map((airport) => (
                                        <button
                                            key={airport.icao}
                                            type="button"
                                            onClick={() => {
                                                handleFromSelect(airport.icao);
                                                setShowFromDropdown(false);
                                            }}
                                            className="w-full text-left px-2 py-1.5 hover:bg-[#eef1ff] border-b border-gray-100 last:border-b-0 text-xs"
                                        >
                                            <div className="font-bold text-black">{airport.city}</div>
                                            <div className="text-gray-500 text-[10px]">{airport.name}</div>
                                            <div className="font-mono text-[10px] text-blue-600">{airport.icao}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Delivery Airport */}
                    <div className="grid gap-1">
                        <label htmlFor="toAirport" className="font-bold text-black flex items-center gap-1">
                            <IconPlaneArrival className="size-3.5" />
                            Delivery Airport <span className="text-red-600">*</span>
                        </label>
                        <div className="relative" ref={toDropdownRef}>
                            <div className="relative flex items-center">
                                <IconSearch className="absolute left-2 size-3.5 text-gray-500 pointer-events-none" />
                                <input
                                    id="toAirport"
                                    type="text"
                                    placeholder="Search delivery airport..."
                                    value={toQuery}
                                    onChange={(e) => {
                                        setToQuery(e.target.value);
                                        setShowToDropdown(true);
                                    }}
                                    onFocus={() => setShowToDropdown(true)}
                                    disabled={isLoading}
                                    className="w-full h-6 pl-7 pr-6 border border-[#7f9db9] outline-none focus:border-[#3399ff] text-sm"
                                />
                            </div>
                            {showToDropdown && filteredTo.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-[#7f9db9] shadow-lg max-h-48 overflow-y-auto">
                                    {filteredTo.map((airport) => (
                                        <button
                                            key={airport.icao}
                                            type="button"
                                            onClick={() => {
                                                handleToSelect(airport.icao);
                                                setShowToDropdown(false);
                                            }}
                                            disabled={airport.icao === fromIcao}
                                            className="w-full text-left px-2 py-1.5 hover:bg-[#eef1ff] border-b border-gray-100 last:border-b-0 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <div className="font-bold text-black">{airport.city}</div>
                                            <div className="text-gray-500 text-[10px]">{airport.name}</div>
                                            <div className="font-mono text-[10px] text-blue-600">{airport.icao}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Package Details */}
            <div className="win7-groupbox">
                <legend>Cargo Details</legend>
                <div className="win7-p-4 grid gap-4">
                    <div className="grid gap-1">
                        <label htmlFor="packageName" className="font-bold text-black">
                            Package Name <span className="text-red-600">*</span>
                        </label>
                        <input
                            id="packageName"
                            placeholder="e.g., Electronics Shipment"
                            value={packageName}
                            onChange={(e) => setPackageName(e.target.value)}
                            required
                            disabled={isLoading}
                            className="w-full h-6 px-1 border border-[#7f9db9] outline-none focus:border-[#3399ff]"
                        />
                    </div>

                    <div className="grid gap-1">
                        <label htmlFor="weightKg" className="font-bold text-black">
                            Weight (kg) <span className="text-red-600">*</span>
                        </label>
                        <input
                            id="weightKg"
                            type="number"
                            step="0.1"
                            min="0.1"
                            placeholder="e.g., 25"
                            value={weightKg}
                            onChange={(e) => setWeightKg(e.target.value)}
                            required
                            disabled={isLoading}
                            className="w-full h-6 px-1 border border-[#7f9db9] outline-none focus:border-[#3399ff]"
                        />
                    </div>

                    <div className="grid gap-1">
                        <label htmlFor="description" className="font-bold text-black">Description (optional)</label>
                        <textarea
                            id="description"
                            placeholder="Additional details about the package..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            disabled={isLoading}
                            className="w-full p-1 border border-[#7f9db9] outline-none focus:border-[#3399ff]"
                        />
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="p-2 border border-[#3399ff] bg-[#eef1ff]">
                <p className="text-xs text-black">
                    <strong>Auto-Assignment:</strong> A cargo carrier and aircraft will be automatically assigned upon creation.
                </p>
            </div>

            {error && (
                <div className="p-2 bg-red-100 border border-red-500 text-red-600 text-xs">
                    {error}
                </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-300">
                <button
                    type="button"
                    onClick={() => router.back()}
                    disabled={isLoading}
                    className="win7-btn min-w-[80px]"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="win7-btn min-w-[120px] font-bold"
                >
                    {isLoading && <IconLoader2 className="size-3 animate-spin mr-1 inline" />}
                    Create Shipment
                </button>
            </div>
        </form>
    );
}
