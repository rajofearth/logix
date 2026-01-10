"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, TrendingUp, TrendingDown, IndianRupee, AlertCircle, Sparkles } from "lucide-react";
import type { Product, Warehouse, Floor, LogisticsData, RouteType, PricePrediction } from "./types";
import { predictProductPrice } from "../_lib/api";
import { extractStateFromWarehouse } from "@/lib/warehouse/ml-prediction-mapper";
import { cn } from "@/lib/utils";

interface MLPredictionPanelProps {
    warehouse?: Warehouse | null;
    floor?: Floor | null;
}

const INDIAN_STATES = [
    "AP", "AS", "BR", "CH", "DL", "GJ", "HR", "JH", "KA", "KL",
    "MH", "MP", "OR", "PB", "RJ", "TG", "TN", "UP", "UT", "WB",
];

const ROUTE_TYPES: { value: RouteType; label: string }[] = [
    { value: "economy", label: "Economy" },
    { value: "fastest", label: "Fastest" },
    { value: "via_gas_station", label: "Via Gas Station" },
];

// Get all products from floor
function getAllProducts(floor: Floor | null | undefined): Product[] {
    if (!floor) return [];
    return floor.blocks.flatMap((block) => block.products);
}

export function MLPredictionPanel({ warehouse, floor }: MLPredictionPanelProps) {
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [logisticsData, setLogisticsData] = useState<Partial<LogisticsData>>({
        originState: warehouse ? extractStateFromWarehouse(warehouse) : "",
        destState: "",
        routeDistance: 150000, // Default 150km
        routeType: "fastest",
        packageWeightKg: 10,
        estimatedDurationHours: 5.5,
        actualTransitHours: undefined,
        delayHours: 0,
        pickupHour: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
        pickupMonth: new Date().getMonth() + 1,
    });

    const [prediction, setPrediction] = useState<PricePrediction | null>(null);
    const [isPredicting, setIsPredicting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const products = useMemo(() => getAllProducts(floor), [floor]);
    const selectedProduct = products.find((p) => p.id === selectedProductId);

    // Update origin state when warehouse changes
    useMemo(() => {
        if (warehouse && !logisticsData.originState) {
            setLogisticsData((prev) => ({
                ...prev,
                originState: extractStateFromWarehouse(warehouse),
            }));
        }
    }, [warehouse, logisticsData.originState]);

    const handlePredict = async () => {
        if (!selectedProduct) {
            toast.error("Please select a product");
            return;
        }

        if (!logisticsData.destState || !logisticsData.routeDistance || !logisticsData.routeType) {
            toast.error("Please fill in all required logistics fields");
            return;
        }

        setIsPredicting(true);
        setError(null);
        setPrediction(null);

        try {
            const fullLogisticsData: LogisticsData = {
                originState: logisticsData.originState || "",
                destState: logisticsData.destState,
                routeDistance: logisticsData.routeDistance,
                routeType: logisticsData.routeType,
                packageWeightKg: logisticsData.packageWeightKg || 10,
                estimatedDurationHours: logisticsData.estimatedDurationHours || 5.5,
                actualTransitHours: logisticsData.actualTransitHours,
                delayHours: logisticsData.delayHours || 0,
                pickupHour: logisticsData.pickupHour ?? new Date().getHours(),
                dayOfWeek: logisticsData.dayOfWeek ?? new Date().getDay(),
                pickupMonth: logisticsData.pickupMonth ?? new Date().getMonth() + 1,
            };

            const result = await predictProductPrice(selectedProduct, fullLogisticsData, warehouse || undefined);
            setPrediction(result);
            toast.success("Price prediction generated successfully");
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Failed to predict price";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsPredicting(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const canPredict = selectedProduct && logisticsData.destState && logisticsData.routeDistance && logisticsData.routeType;

    return (
        <Card size="sm" className="border-[#7f9db9] bg-white text-black">
            <CardHeader className="border-b border-[#7f9db9]">
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    ML Price Prediction
                </CardTitle>
                <div className="text-xs text-gray-600">
                    Predict price deviations for logistics shipments using deep learning models.
                    {warehouse && ` (Warehouse: ${warehouse.name})`}
                </div>
            </CardHeader>
            <CardContent className="grid gap-4">
                {/* Product Selection */}
                <div className="space-y-2">
                    <Label htmlFor="product-select">Select Product</Label>
                    <Select value={selectedProductId} onValueChange={(value) => setSelectedProductId(value || "")}>
                        <SelectTrigger id="product-select">
                            <SelectValue placeholder="Choose a product" />
                        </SelectTrigger>
                        <SelectContent>
                            {products.length === 0 ? (
                                <SelectItem value="none" disabled>
                                    No products available
                                </SelectItem>
                            ) : (
                                products.map((product) => (
                                    <SelectItem key={product.id} value={product.id}>
                                        {product.name} ({product.quantity} units) - {formatCurrency(product.currentPrice)}/unit
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {/* Logistics Form */}
                {selectedProduct && (
                    <div className="grid gap-4 border-t pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="origin-state">Origin State</Label>
                                <Select
                                    value={logisticsData.originState || ""}
                                    onValueChange={(value) =>
                                        setLogisticsData((prev) => ({ ...prev, originState: value || undefined }))
                                    }
                                >
                                    <SelectTrigger id="origin-state">
                                        <SelectValue placeholder="Select state" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INDIAN_STATES.map((state) => (
                                            <SelectItem key={state} value={state}>
                                                {state}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dest-state">Destination State *</Label>
                                <Select
                                    value={logisticsData.destState || ""}
                                    onValueChange={(value) =>
                                        setLogisticsData((prev) => ({ ...prev, destState: value || undefined }))
                                    }
                                >
                                    <SelectTrigger id="dest-state">
                                        <SelectValue placeholder="Select state" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INDIAN_STATES.map((state) => (
                                            <SelectItem key={state} value={state}>
                                                {state}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="route-distance">Route Distance (meters) *</Label>
                                <Input
                                    id="route-distance"
                                    type="number"
                                    placeholder="150000"
                                    value={logisticsData.routeDistance || ""}
                                    onChange={(e) =>
                                        setLogisticsData((prev) => ({
                                            ...prev,
                                            routeDistance: parseFloat(e.target.value) || undefined,
                                        }))
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="route-type">Route Type *</Label>
                                <Select
                                    value={logisticsData.routeType || ""}
                                    onValueChange={(value) =>
                                        setLogisticsData((prev) => ({
                                            ...prev,
                                            routeType: value as RouteType,
                                        }))
                                    }
                                >
                                    <SelectTrigger id="route-type">
                                        <SelectValue placeholder="Select route type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ROUTE_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="package-weight">Package Weight (kg)</Label>
                                <Input
                                    id="package-weight"
                                    type="number"
                                    placeholder="10"
                                    value={logisticsData.packageWeightKg || ""}
                                    onChange={(e) =>
                                        setLogisticsData((prev) => ({
                                            ...prev,
                                            packageWeightKg: parseFloat(e.target.value) || undefined,
                                        }))
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="estimated-duration">Estimated Duration (hours)</Label>
                                <Input
                                    id="estimated-duration"
                                    type="number"
                                    step="0.1"
                                    placeholder="5.5"
                                    value={logisticsData.estimatedDurationHours || ""}
                                    onChange={(e) =>
                                        setLogisticsData((prev) => ({
                                            ...prev,
                                            estimatedDurationHours: parseFloat(e.target.value) || undefined,
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="actual-transit">Actual Transit Hours (optional)</Label>
                                <Input
                                    id="actual-transit"
                                    type="number"
                                    step="0.1"
                                    placeholder="6.0"
                                    value={logisticsData.actualTransitHours || ""}
                                    onChange={(e) =>
                                        setLogisticsData((prev) => ({
                                            ...prev,
                                            actualTransitHours: parseFloat(e.target.value) || undefined,
                                        }))
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="delay-hours">Delay Hours</Label>
                                <Input
                                    id="delay-hours"
                                    type="number"
                                    step="0.1"
                                    placeholder="0"
                                    value={logisticsData.delayHours || ""}
                                    onChange={(e) =>
                                        setLogisticsData((prev) => ({
                                            ...prev,
                                            delayHours: parseFloat(e.target.value) || undefined,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Predict Button */}
                <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-red-600">{error ? `Error: ${error}` : ""}</div>
                    <Button
                        type="button"
                        className="h-8 text-xs win7-btn"
                        onClick={handlePredict}
                        disabled={!canPredict || isPredicting}
                    >
                        {isPredicting ? (
                            <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Predicting…
                            </>
                        ) : (
                            "Predict Price"
                        )}
                    </Button>
                </div>

                {/* Prediction Results */}
                {prediction && (
                    <div className="border-t pt-4 space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <Sparkles className="h-4 w-4" />
                            Prediction Results
                        </div>

                        {/* Deviation Summary */}
                        <div className="p-4 rounded-lg bg-gradient-to-br from-card to-muted/30 border">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                                    Price Deviation
                                </span>
                                <span
                                    className={cn(
                                        "text-lg font-bold flex items-center gap-1",
                                        prediction.direction === "positive"
                                            ? "text-emerald-600"
                                            : "text-red-600"
                                    )}
                                >
                                    {prediction.direction === "positive" ? (
                                        <TrendingUp className="h-4 w-4" />
                                    ) : (
                                        <TrendingDown className="h-4 w-4" />
                                    )}
                                    {prediction.deviationRatioPercent}
                                </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Deviation: {formatCurrency(prediction.deviationINR)}
                            </div>
                        </div>

                        {/* Value Comparison */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-3 rounded-lg bg-card border">
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                                    Initial Value
                                </div>
                                <div className="text-sm font-bold">{formatCurrency(prediction.initialValueINR)}</div>
                            </div>
                            <div className="p-3 rounded-lg bg-card border">
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                                    Expected Final Value
                                </div>
                                <div className="text-sm font-bold">{formatCurrency(prediction.expectedFinalValueINR)}</div>
                            </div>
                        </div>

                        {/* Reason Classification */}
                        {prediction.predictedReason && (
                            <div className="p-3 rounded-lg bg-card border">
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                                    Predicted Reason
                                </div>
                                <div className="text-sm font-semibold capitalize">
                                    {prediction.predictedReason.replace("_", " ")}
                                    {prediction.confidence && (
                                        <span className="text-xs text-muted-foreground ml-2">
                                            ({Math.round(prediction.confidence * 100)}% confidence)
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Pricing Recommendations */}
                        {prediction.pricing && (
                            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                                <div className="flex items-center gap-2 mb-3">
                                    <IndianRupee className="h-4 w-4 text-blue-600" />
                                    <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                        Pricing Recommendations
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div>
                                        <div className="text-muted-foreground mb-1">Base Cost</div>
                                        <div className="font-semibold">{formatCurrency(prediction.pricing.baseCost)}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground mb-1">Risk Buffer</div>
                                        <div className="font-semibold">{formatCurrency(prediction.pricing.riskBuffer)}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground mb-1">Suggested Quote</div>
                                        <div className="font-bold text-blue-600">{formatCurrency(prediction.pricing.suggestedQuote)}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
