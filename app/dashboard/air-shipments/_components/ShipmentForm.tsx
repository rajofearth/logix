"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { IconLoader2, IconPackage } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                        <IconPackage className="size-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Package Details</h2>
                        <p className="text-sm text-muted-foreground">
                            Enter the package information. A carrier and flight will be
                            automatically assigned.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6">
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
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description (optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="Additional details about the package..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            disabled={isLoading}
                        />
                    </div>
                </div>
            </div>

            {/* Info card */}
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                    <strong>Auto-Assignment:</strong> When you create this shipment, it
                    will be automatically assigned to an available cargo carrier and
                    aircraft. You&apos;ll be able to track the flight in real-time on the
                    shipment detail page.
                </p>
            </div>

            {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                    <p className="text-sm text-destructive">{error}</p>
                </div>
            )}

            <div className="flex gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="gap-2">
                    {isLoading && <IconLoader2 className="size-4 animate-spin" />}
                    Create Shipment
                </Button>
            </div>
        </form>
    );
}
