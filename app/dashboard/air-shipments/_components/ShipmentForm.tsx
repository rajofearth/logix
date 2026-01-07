"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { IconLoader2, IconPackage } from "@tabler/icons-react";
import { createShipment } from "../_server/actions";

export function ShipmentForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const [packageName, setPackageName] = React.useState("");
    const [weightKg, setWeightKg] = React.useState("");
    const [description, setDescription] = React.useState("");

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

            const result = await createShipment({
                packageName: packageName.trim(),
                weightKg: weight,
                description: description.trim() || undefined,
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
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-sm">
            <div className="flex items-center gap-3 mb-4 p-2 bg-[#eef1ff] border border-[#7f9db9]">
                <div className="flex size-10 items-center justify-center bg-white border border-[#7f9db9]">
                    <IconPackage className="size-6 text-blue-600" />
                </div>
                <div>
                    <h2 className="font-bold text-black">Package Information</h2>
                    <p className="text-xs text-gray-500">
                        Enter details for auto-assignment.
                    </p>
                </div>
            </div>

            <div className="grid gap-4">
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
