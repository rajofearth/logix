"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import type { Product, Warehouse, Floor, LogisticsData, RouteType, PricePrediction } from "./types";
import { predictProductPrice } from "../_lib/api";
import { extractStateFromWarehouse } from "@/lib/warehouse/ml-prediction-mapper";

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
        <div className="win7-window flex flex-col">
            <div className="title-bar">
                <div className="title-bar-text">
                    ML Price Prediction
                    {warehouse ? ` - ${warehouse.name}` : ""}
                </div>
            </div>
            <div className="window-body has-space flex flex-col gap-2">
                {/* Product Selection */}
                <div className="win7-groupbox">
                    <legend className="text-xs">Product</legend>
                    <select
                        className="win7-input w-full text-xs"
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                    >
                        <option value="">Choose a product</option>
                        {products.length === 0 ? (
                            <option value="" disabled>No products available</option>
                        ) : (
                            products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name} ({product.quantity} units) - {formatCurrency(product.currentPrice)}/unit
                                </option>
                            ))
                        )}
                    </select>
                </div>

                {/* Logistics Form */}
                {selectedProduct && (
                    <div className="win7-groupbox">
                        <legend className="text-xs">Logistics</legend>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-xs block">Origin State</label>
                                <select
                                    className="win7-input w-full text-xs"
                                    value={logisticsData.originState || ""}
                                    onChange={(e) =>
                                        setLogisticsData((prev) => ({ ...prev, originState: e.target.value || undefined }))
                                    }
                                >
                                    <option value="">Select state</option>
                                    {INDIAN_STATES.map((state) => (
                                        <option key={state} value={state}>
                                            {state}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs block">Dest State *</label>
                                <select
                                    className="win7-input w-full text-xs"
                                    value={logisticsData.destState || ""}
                                    onChange={(e) =>
                                        setLogisticsData((prev) => ({ ...prev, destState: e.target.value || undefined }))
                                    }
                                >
                                    <option value="">Select state</option>
                                    {INDIAN_STATES.map((state) => (
                                        <option key={state} value={state}>
                                            {state}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs block">Distance (m) *</label>
                                <input
                                    className="win7-input w-full text-xs"
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
                            <div className="space-y-1">
                                <label className="text-xs block">Route Type *</label>
                                <select
                                    className="win7-input w-full text-xs"
                                    value={logisticsData.routeType || ""}
                                    onChange={(e) =>
                                        setLogisticsData((prev) => ({
                                            ...prev,
                                            routeType: e.target.value as RouteType,
                                        }))
                                    }
                                >
                                    <option value="">Select type</option>
                                    {ROUTE_TYPES.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs block">Weight (kg)</label>
                                <input
                                    className="win7-input w-full text-xs"
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
                            <div className="space-y-1">
                                <label className="text-xs block">Est. Duration (h)</label>
                                <input
                                    className="win7-input w-full text-xs"
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
                            <div className="space-y-1">
                                <label className="text-xs block">Transit Hours</label>
                                <input
                                    className="win7-input w-full text-xs"
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
                            <div className="space-y-1">
                                <label className="text-xs block">Delay Hours</label>
                                <input
                                    className="win7-input w-full text-xs"
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
                    <button
                        type="button"
                        className="win7-btn text-xs"
                        onClick={handlePredict}
                        disabled={!canPredict || isPredicting}
                    >
                        {isPredicting ? "Predicting…" : "Predict Price"}
                    </button>
                </div>

                {/* Prediction Results */}
                {prediction && (
                    <div className="win7-groupbox">
                        <legend className="text-xs">Results</legend>
                        <div className="space-y-2">
                            {/* Deviation Summary */}
                            <div className="p-2 border border-gray-300 bg-white">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-600">Price Deviation</span>
                                    <span
                                        className={`text-sm font-bold ${
                                            prediction.direction === "positive" ? "text-green-600" : "text-red-600"
                                        }`}
                                    >
                                        {prediction.direction === "positive" ? "↑" : "↓"} {prediction.deviationRatioPercent}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-600">
                                    Deviation: {formatCurrency(prediction.deviationINR)}
                                </div>
                            </div>

                            {/* Value Comparison */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-2 border border-gray-300 bg-white">
                                    <div className="text-[10px] text-gray-600 mb-1">Initial Value</div>
                                    <div className="text-xs font-bold">{formatCurrency(prediction.initialValueINR)}</div>
                                </div>
                                <div className="p-2 border border-gray-300 bg-white">
                                    <div className="text-[10px] text-gray-600 mb-1">Expected Final</div>
                                    <div className="text-xs font-bold">{formatCurrency(prediction.expectedFinalValueINR)}</div>
                                </div>
                            </div>

                            {/* Reason Classification */}
                            {prediction.predictedReason && (
                                <div className="p-2 border border-gray-300 bg-white">
                                    <div className="text-[10px] text-gray-600 mb-1">Predicted Reason</div>
                                    <div className="text-xs font-semibold capitalize">
                                        {prediction.predictedReason.replace("_", " ")}
                                        {prediction.confidence && (
                                            <span className="text-xs text-gray-600 ml-1">
                                                ({Math.round(prediction.confidence * 100)}%)
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Pricing Recommendations */}
                            {prediction.pricing && (
                                <div className="p-2 border border-blue-300 bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-600 mb-2">Pricing Recommendations</div>
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div>
                                            <div className="text-gray-600 mb-1">Base Cost</div>
                                            <div className="font-semibold">{formatCurrency(prediction.pricing.baseCost)}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600 mb-1">Risk Buffer</div>
                                            <div className="font-semibold">{formatCurrency(prediction.pricing.riskBuffer)}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600 mb-1">Suggested Quote</div>
                                            <div className="font-bold text-blue-600">{formatCurrency(prediction.pricing.suggestedQuote)}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
