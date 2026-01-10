"use client";

import { useState, useMemo } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Block,
    ProductCategory,
    CATEGORIES,
    formatCapacityPercentage,
    getCategoryIcon,
    getCategoryLabel,
} from "./types";
import {
    Package,
    Thermometer,
    Droplets,
    Clock,
    ArrowRightLeft,
    Plus,
    ClipboardList,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    IndianRupee,
    Check,
    Loader2,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createProduct, predictProductPrice } from "../_lib/api";
import type { Product, LogisticsData, RouteType, PricePrediction, Warehouse } from "./types";
import { extractStateFromWarehouse } from "@/lib/warehouse/ml-prediction-mapper";

interface BlockDetailSheetProps {
    block: Block | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    warehouseId?: string;
    floorId?: string;
    warehouse?: Warehouse | null;
    onRefresh?: () => void;
}

// Add Product Dialog State
interface AddProductForm {
    name: string;
    sku: string;
    quantity: string;
    averageWeeklySales: string;
    boughtAt: string;
    currentPrice: string;
    category: ProductCategory;
}

// Transfer Dialog State
interface TransferForm {
    productId: string;
    quantity: string;
    destinationBlock: string;
}

// Picklist Item
interface PicklistItem {
    productId: string;
    productName: string;
    quantity: number;
    selected: boolean;
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

export function BlockDetailSheet({ block, open, onOpenChange, warehouseId, floorId, warehouse, onRefresh }: BlockDetailSheetProps) {
    // Dialog states
    const [addProductOpen, setAddProductOpen] = useState(false);
    const [transferOpen, setTransferOpen] = useState(false);
    const [picklistOpen, setPicklistOpen] = useState(false);
    const [predictionOpen, setPredictionOpen] = useState(false);
    const [selectedProductForPrediction, setSelectedProductForPrediction] = useState<Product | null>(null);

    // Form states
    const [addProductForm, setAddProductForm] = useState<AddProductForm>({
        name: "",
        sku: "",
        quantity: "",
        averageWeeklySales: "",
        boughtAt: "",
        currentPrice: "",
        category: "other",
    });

    const [transferForm, setTransferForm] = useState<TransferForm>({
        productId: "",
        quantity: "",
        destinationBlock: "",
    });

    const [picklistItems, setPicklistItems] = useState<PicklistItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Prediction states
    const [logisticsData, setLogisticsData] = useState<Partial<LogisticsData>>({
        originState: warehouse ? extractStateFromWarehouse(warehouse) : "",
        destState: "",
        routeDistance: 150000,
        routeType: "fastest",
        packageWeightKg: 10,
        estimatedDurationHours: 5.5,
        delayHours: 0,
    });
    const [prediction, setPrediction] = useState<PricePrediction | null>(null);
    const [isPredicting, setIsPredicting] = useState(false);

    // Stable reference for expiry check (30 days from now)
    const expiryThreshold = useMemo(() => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), []);

    if (!block) return null;

    const usagePercent = formatCapacityPercentage(block.used, block.capacity);
    const CategoryIcon = getCategoryIcon(block.category);
    const categoryLabel = getCategoryLabel(block.category);

    // Calculate total inventory value
    const totalBoughtValue = block.products.reduce(
        (sum, p) => sum + p.boughtAt * p.quantity,
        0
    );
    const totalCurrentValue = block.products.reduce(
        (sum, p) => sum + p.currentPrice * p.quantity,
        0
    );
    const valueDifference = totalCurrentValue - totalBoughtValue;
    const valuePercentChange = totalBoughtValue > 0
        ? ((valueDifference / totalBoughtValue) * 100).toFixed(1)
        : "0";

    // Format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(value);
    };

    // Handle Add Product
    const handleAddProduct = async () => {
        if (!warehouseId || !floorId || !block) {
            toast.error("Missing warehouse or floor information");
            return;
        }

        if (!addProductForm.name || !addProductForm.sku || !addProductForm.quantity ||
            !addProductForm.boughtAt || !addProductForm.currentPrice) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);
        try {
            await createProduct(warehouseId, floorId, block.id, {
                sku: addProductForm.sku,
                name: addProductForm.name,
                quantity: parseInt(addProductForm.quantity),
                category: addProductForm.category,
                averageWeeklySales: addProductForm.averageWeeklySales
                    ? parseInt(addProductForm.averageWeeklySales)
                    : null,
                boughtAt: parseFloat(addProductForm.boughtAt),
                currentPrice: parseFloat(addProductForm.currentPrice),
            });

            toast.success("Product added successfully!");
            setAddProductForm({
                name: "",
                sku: "",
                quantity: "",
                averageWeeklySales: "",
                boughtAt: "",
                currentPrice: "",
                category: "other",
            });
            setAddProductOpen(false);
            onRefresh?.(); // Refresh warehouse data
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to add product");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Transfer
    const handleTransfer = () => {
        // In a real app, this would make an API call
        console.log("Transferring:", transferForm);
        setTransferForm({
            productId: "",
            quantity: "",
            destinationBlock: "",
        });
        setTransferOpen(false);
    };

    // Initialize picklist
    const openPicklist = () => {
        setPicklistItems(
            block.products.map((p) => ({
                productId: p.id,
                productName: p.name,
                quantity: 0,
                selected: false,
            }))
        );
        setPicklistOpen(true);
    };

    // Handle Picklist generation
    const handleGeneratePicklist = () => {
        const selectedItems = picklistItems.filter((item) => item.selected && item.quantity > 0);
        // In a real app, this would generate a PDF or send to a printer
        console.log("Generating picklist:", selectedItems);
        setPicklistOpen(false);
    };

    // Toggle picklist item selection
    const togglePicklistItem = (productId: string) => {
        setPicklistItems((prev) =>
            prev.map((item) =>
                item.productId === productId
                    ? { ...item, selected: !item.selected }
                    : item
            )
        );
    };

    // Update picklist item quantity
    const updatePicklistQuantity = (productId: string, quantity: number) => {
        setPicklistItems((prev) =>
            prev.map((item) =>
                item.productId === productId ? { ...item, quantity } : item
            )
        );
    };

    // Open prediction dialog for a product
    const openPredictionDialog = (product: Product) => {
        setSelectedProductForPrediction(product);
        setLogisticsData({
            originState: warehouse ? extractStateFromWarehouse(warehouse) : "",
            destState: "",
            routeDistance: 150000,
            routeType: "fastest",
            packageWeightKg: 10,
            estimatedDurationHours: 5.5,
            delayHours: 0,
        });
        setPrediction(null);
        setPredictionOpen(true);
    };

    // Handle price prediction
    const handlePredict = async () => {
        if (!selectedProductForPrediction) return;

        if (!logisticsData.destState || !logisticsData.routeDistance || !logisticsData.routeType) {
            toast.error("Please fill in all required logistics fields");
            return;
        }

        setIsPredicting(true);
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
                pickupHour: new Date().getHours(),
                dayOfWeek: new Date().getDay(),
                pickupMonth: new Date().getMonth() + 1,
            };

            const result = await predictProductPrice(selectedProductForPrediction, fullLogisticsData, warehouse || undefined);
            setPrediction(result);
            toast.success("Price prediction generated successfully");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to predict price");
        } finally {
            setIsPredicting(false);
        }
    };

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent showCloseButton={false} className="w-full sm:max-w-md p-0 bg-transparent border-none shadow-none">
                    <div className="win7-window h-full flex flex-col rounded-none w-full">
                        {/* Title Bar */}
                        <div className="title-bar">
                            <div className="title-bar-text flex items-center gap-2">
                                <CategoryIcon className="size-4" />
                                Block {block.name} Details
                            </div>
                            <div className="title-bar-controls">
                                <button aria-label="Close" className="close" onClick={() => onOpenChange(false)}></button>
                            </div>
                        </div>

                        {/* Window Body */}
                        <div className="window-body flex-1 overflow-auto p-4 space-y-4">

                            {/* Header / Info Section */}
                            <div className="flex items-center justify-between p-2 bg-[#fff] border border-[#d9d9d9] rounded-[2px] mb-2">
                                <div>
                                    <div className="text-lg font-bold text-[#003399]">Block {block.name}</div>
                                    <div className="text-xs text-[#666]">Row {block.row}, Column {block.column}</div>
                                </div>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "text-[10px] uppercase font-bold px-2 py-0.5 border shadow-sm rounded-[2px]",
                                        block.status === "critical"
                                            ? "bg-[#ffcccc] text-[#cc0000] border-[#cc0000]"
                                            : block.status === "warning"
                                                ? "bg-[#fff2cc] text-[#bf9000] border-[#bf9000]"
                                                : block.status === "empty"
                                                    ? "bg-[#f2f2f2] text-[#666] border-[#999]"
                                                    : "bg-[#d9ead3] text-[#38761d] border-[#38761d]"
                                    )}
                                >
                                    {block.status}
                                </Badge>
                            </div>

                            {/* Capacity Group Box */}
                            <fieldset className="border border-[#d9d9d9] rounded-[3px] p-3 pt-1">
                                <legend className="text-[#003399] text-xs px-1 flex items-center gap-1">
                                    <Package className="size-3" />
                                    Storage Capacity
                                </legend>
                                <div className="flex items-end justify-between mb-2 mt-1">
                                    <div>
                                        <span className="text-3xl font-bold text-[#333] tracking-tight">{usagePercent}</span>
                                        <span className="text-lg font-bold text-[#888]">%</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-[#333]">{block.used.toLocaleString()} / {block.capacity.toLocaleString()}</div>
                                        <div className="text-xs text-[#666]">units stored</div>
                                    </div>
                                </div>
                                <div className="h-4 w-full bg-[#e6e6e6] border border-[#bcbcbc] rounded-[2px] relative overflow-hidden shadow-inner">
                                    <div
                                        className={cn(
                                            "h-full shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]",
                                            usagePercent >= 90 ? "bg-[linear-gradient(to_bottom,#ff3333_0%,#cc0000_100%)]" :
                                                usagePercent >= 70 ? "bg-[linear-gradient(to_bottom,#ffcc00_0%,#ff9900_100%)]" : "bg-[linear-gradient(to_bottom,#06b025_0%,#00cc00_50%,#00b300_100%)]"
                                        )}
                                        style={{ width: `${usagePercent}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-2 text-xs">
                                    <span className="text-[#666]">
                                        Available: <span className="font-bold text-[#0066cc]">{(block.capacity - block.used).toLocaleString()}</span> units
                                    </span>
                                    <span className="px-2 py-0.5 bg-[#f0f0f0] border border-[#d9d9d9] rounded-[2px] text-[#444]">
                                        {categoryLabel}
                                    </span>
                                </div>
                            </fieldset>

                            {/* Inventory Value Group Box */}
                            <fieldset className="border border-[#d9d9d9] rounded-[3px] p-3 pt-1">
                                <legend className="text-[#003399] text-xs px-1 flex items-center gap-1">
                                    <IndianRupee className="size-3.5" />
                                    Inventory Value
                                </legend>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <div className="p-2 border border-[#d9d9d9] bg-[#fcfcfc] rounded-[2px]">
                                        <div className="text-[10px] text-[#666] uppercase tracking-wide mb-1">Bought At</div>
                                        <div className="text-base font-bold text-[#333]">{formatCurrency(totalBoughtValue)}</div>
                                    </div>
                                    <div className="p-2 border border-[#d9d9d9] bg-[#fcfcfc] rounded-[2px]">
                                        <div className="text-[10px] text-[#666] uppercase tracking-wide mb-1">Current Value</div>
                                        <div className="flex items-center gap-1.5 align-baseline">
                                            <span className="text-base font-bold text-[#333]">{formatCurrency(totalCurrentValue)}</span>
                                            <span
                                                className={cn(
                                                    "text-[10px] font-bold flex items-center px-1 rounded-[2px]",
                                                    valueDifference >= 0
                                                        ? "text-[#38761d] bg-[#d9ead3] border border-[#38761d]"
                                                        : "text-[#cc0000] bg-[#ffcccc] border border-[#cc0000]"
                                                )}
                                            >
                                                {valueDifference >= 0 ? (
                                                    <TrendingUp className="size-2.5 mr-0.5" />
                                                ) : (
                                                    <TrendingDown className="size-2.5 mr-0.5" />
                                                )}
                                                {valuePercentChange}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </fieldset>

                            {/* Environment Group Box */}
                            <fieldset className="border border-[#d9d9d9] rounded-[3px] p-3 pt-1">
                                <legend className="text-[#003399] text-xs px-1">Environment</legend>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <div className={cn(
                                        "p-2 border rounded-[2px]",
                                        block.temperature != null
                                            ? "bg-[#fff2cc] border-[#bf9000]"
                                            : "bg-[#f2f2f2] border-[#d9d9d9]"
                                    )}>
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Thermometer className={cn(
                                                "size-3.5",
                                                block.temperature != null ? "text-[#e69138]" : "text-[#999]"
                                            )} />
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase",
                                                block.temperature != null ? "text-[#e69138]" : "text-[#999]"
                                            )}>
                                                Temp
                                            </span>
                                        </div>
                                        {block.temperature != null ? (
                                            <div className="text-lg font-bold text-[#333]">{block.temperature.toFixed(1)}°C</div>
                                        ) : (
                                            <div className="text-xs text-[#999]">N/A</div>
                                        )}
                                    </div>
                                    <div className={cn(
                                        "p-2 border rounded-[2px]",
                                        block.humidity != null
                                            ? "bg-[#c9daf8] border-[#3c78d8]"
                                            : "bg-[#f2f2f2] border-[#d9d9d9]"
                                    )}>
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Droplets className={cn(
                                                "size-3.5",
                                                block.humidity != null ? "text-[#3c78d8]" : "text-[#999]"
                                            )} />
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase",
                                                block.humidity != null ? "text-[#3c78d8]" : "text-[#999]"
                                            )}>
                                                Humidity
                                            </span>
                                        </div>
                                        {block.humidity != null ? (
                                            <div className="text-lg font-bold text-[#333]">{block.humidity.toFixed(0)}%</div>
                                        ) : (
                                            <div className="text-xs text-[#999]">N/A</div>
                                        )}
                                    </div>
                                </div>
                            </fieldset>

                            {/* Products List Group Box */}
                            <fieldset className="border border-[#d9d9d9] rounded-[3px] p-3 pt-1">
                                <legend className="text-[#003399] text-xs px-1 flex items-center gap-1">
                                    <ClipboardList className="size-3.5" />
                                    Products ({block.products.length})
                                </legend>
                                <div className="space-y-2 mt-1">
                                    {block.products.length === 0 ? (
                                        <div className="p-4 border border-dashed border-[#999] text-center bg-[#f9f9f9] rounded-[2px]">
                                            <div className="text-sm text-[#666]">No products stored</div>
                                        </div>
                                    ) : (
                                        block.products.map((product) => {
                                            const isExpiringSoon =
                                                product.expiryDate &&
                                                new Date(product.expiryDate) < expiryThreshold;

                                            const priceChange = product.currentPrice - product.boughtAt;
                                            const priceChangePercent = ((priceChange / product.boughtAt) * 100).toFixed(1);

                                            return (
                                                <div
                                                    key={product.id}
                                                    className={cn(
                                                        "p-2 border rounded-[2px] transition-colors hover:bg-[#e8f4fc] hover:border-[#aaddfa]",
                                                        isExpiringSoon
                                                            ? "bg-[#fff2cc] border-[#e69138]"
                                                            : "bg-white border-[#d9d9d9]"
                                                    )}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="font-bold text-sm text-[#333] flex items-center gap-1">
                                                                {product.name}
                                                                {isExpiringSoon && <AlertTriangle className="size-3 text-[#e69138]" />}
                                                            </div>
                                                            <div className="text-[10px] font-mono text-[#666]">{product.sku}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-bold text-[#333]">{product.quantity.toLocaleString()}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#eee]">
                                                        <div className="text-[10px] text-[#555]">
                                                            Current: <span className="font-bold">{formatCurrency(product.currentPrice)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn(
                                                                "text-[9px] font-bold px-1 rounded-[2px] border",
                                                                priceChange >= 0
                                                                    ? "text-[#38761d] bg-[#d9ead3] border-[#38761d]"
                                                                    : "text-[#cc0000] bg-[#ffcccc] border-[#cc0000]"
                                                            )}>
                                                                {priceChangePercent}%
                                                            </span>
                                                            <button
                                                                className="text-[10px] text-[#0066cc] hover:underline flex items-center gap-0.5"
                                                                onClick={() => openPredictionDialog(product)}
                                                            >
                                                                <Sparkles className="size-2.5" /> Predict
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </fieldset>

                            {/* Last Activity */}
                            {block.lastActivity && (
                                <div className="flex items-center gap-2 text-xs text-[#666] px-1">
                                    <Clock className="size-3.5" />
                                    <span>Last activity: {new Date(block.lastActivity).toLocaleString()}</span>
                                </div>
                            )}

                        </div>

                        {/* Status Bar / Footer Actions */}
                        <div className="status-bar h-auto p-2 flex justify-end gap-2 bg-[#f0f0f0] border-t border-[#d9d9d9]">
                            {/* Win7 Buttons */}
                            <button
                                className="win7-btn h-6 px-3 text-xs flex items-center gap-1"
                                onClick={() => setAddProductOpen(true)}
                            >
                                <Plus className="size-3" /> Add
                            </button>
                            <button
                                className="win7-btn h-6 px-3 text-xs flex items-center gap-1"
                                onClick={() => setTransferOpen(true)}
                            >
                                <ArrowRightLeft className="size-3" /> Transfer
                            </button>
                            <button
                                className="win7-btn h-6 px-3 text-xs flex items-center gap-1"
                                onClick={openPicklist}
                            >
                                <ClipboardList className="size-3" /> Picklist
                            </button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Add Product Dialog - Windows 7 Theme */}
            <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
                <DialogContent showCloseButton={false} className="sm:max-w-[600px] p-0 bg-transparent border-none shadow-none">
                    <div className="win7-window flex flex-col w-full">
                        <div className="title-bar">
                            <div className="title-bar-text" style={{ textShadow: "none" }}>Add New Product</div>
                            <div className="title-bar-controls">
                                <button
                                    aria-label="Close"
                                    className="close"
                                    onClick={() => setAddProductOpen(false)}
                                />
                            </div>
                        </div>

                        <div className="window-body p-4">
                            <div className="text-sm mb-4 text-black">
                                Add a new product to Block {block.name}
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="product-name" className="text-xs text-black font-normal">Product Name</Label>
                                        <input
                                            id="product-name"
                                            type="text"
                                            placeholder="Enter product name"
                                            className="w-full h-6 px-1 border border-[#abadb3] bg-white text-sm text-black shadow-inner focus:outline-none focus:border-[#3c7fb1] placeholder:text-gray-500"
                                            value={addProductForm.name}
                                            onChange={(e) =>
                                                setAddProductForm((prev) => ({
                                                    ...prev,
                                                    name: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="product-sku" className="text-xs text-black font-normal">SKU</Label>
                                        <input
                                            id="product-sku"
                                            type="text"
                                            placeholder="e.g., ELC-1234"
                                            className="w-full h-6 px-1 border border-[#abadb3] bg-white text-sm text-black shadow-inner focus:outline-none focus:border-[#3c7fb1] placeholder:text-gray-500"
                                            value={addProductForm.sku}
                                            onChange={(e) =>
                                                setAddProductForm((prev) => ({
                                                    ...prev,
                                                    sku: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="product-quantity" className="text-xs text-black font-normal">Quantity</Label>
                                        <input
                                            id="product-quantity"
                                            type="number"
                                            placeholder="0"
                                            className="w-full h-6 px-1 border border-[#abadb3] bg-white text-sm text-black shadow-inner focus:outline-none focus:border-[#3c7fb1] placeholder:text-gray-500"
                                            value={addProductForm.quantity}
                                            onChange={(e) =>
                                                setAddProductForm((prev) => ({
                                                    ...prev,
                                                    quantity: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="product-weekly-sales" className="text-xs text-black font-normal">Avg Weekly Sales</Label>
                                        <input
                                            id="product-weekly-sales"
                                            type="number"
                                            placeholder="e.g., 25"
                                            className="w-full h-6 px-1 border border-[#abadb3] bg-white text-sm text-black shadow-inner focus:outline-none focus:border-[#3c7fb1] placeholder:text-gray-500"
                                            value={addProductForm.averageWeeklySales}
                                            onChange={(e) =>
                                                setAddProductForm((prev) => ({
                                                    ...prev,
                                                    averageWeeklySales: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="product-bought" className="text-xs text-black font-normal">Bought At (per unit)</Label>
                                        <input
                                            id="product-bought"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="w-full h-6 px-1 border border-[#abadb3] bg-white text-sm text-black shadow-inner focus:outline-none focus:border-[#3c7fb1] placeholder:text-gray-500"
                                            value={addProductForm.boughtAt}
                                            onChange={(e) =>
                                                setAddProductForm((prev) => ({
                                                    ...prev,
                                                    boughtAt: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="product-current" className="text-xs text-black font-normal">Current Price (per unit)</Label>
                                    <input
                                        id="product-current"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="w-full h-6 px-1 border border-[#abadb3] bg-white text-sm text-black shadow-inner focus:outline-none focus:border-[#3c7fb1] placeholder:text-gray-500"
                                        value={addProductForm.currentPrice}
                                        onChange={(e) =>
                                            setAddProductForm((prev) => ({
                                                ...prev,
                                                currentPrice: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="category" className="text-xs text-black font-normal">Category</Label>
                                    <select
                                        id="category"
                                        className="w-full h-6 px-1 pr-7 border border-[#8e8f8f] bg-gradient-to-b from-[#f2f2f2] via-[#ebebeb] to-[#cfcfcf] text-sm text-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.8)] focus:outline-none focus:border-[#3c7fb1] focus:shadow-[inset_0_0_0_2px_#98d1ef] hover:border-[#3c7fb1] hover:bg-gradient-to-b hover:from-[#eaf6fd] hover:via-[#bee6fd] hover:to-[#a7d9f5] appearance-none"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='16' height='17' fill='none' version='1.1' viewBox='0 0 16 17' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 6H4V7H5V8H6V9H7V10H8V9H9V8H10V7H11V6Z' fill='%23000'/%3E%3C/svg%3E")`,
                                            backgroundRepeat: "no-repeat",
                                            backgroundPosition: "right 4px center",
                                            paddingRight: "24px",
                                            color: "#000",
                                        }}
                                        value={addProductForm.category}
                                        onChange={(e) =>
                                            setAddProductForm((prev) => ({
                                                ...prev,
                                                category: e.target.value as ProductCategory,
                                            }))
                                        }
                                    >
                                        {CATEGORIES.map((category) => (
                                            <option key={category} value={category} style={{ color: "#000" }}>
                                                {getCategoryLabel(category)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    className="win7-btn min-w-[70px] px-3 py-1 text-black"
                                    onClick={() => setAddProductOpen(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="win7-btn min-w-[70px] px-3 py-1 font-bold text-black"
                                    onClick={handleAddProduct}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting && <Loader2 className="h-3 w-3 mr-1 animate-spin inline" />}
                                    Add Product
                                </button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Transfer Dialog */}
            <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Transfer Product</DialogTitle>
                        <DialogDescription>
                            Move products from Block {block.name} to another location
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Select Product</Label>
                            <Select
                                value={transferForm.productId}
                                onValueChange={(value) =>
                                    setTransferForm((prev) => ({
                                        ...prev,
                                        productId: value ?? "",
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a product" />
                                </SelectTrigger>
                                <SelectContent>
                                    {block.products.map((product) => (
                                        <SelectItem key={product.id} value={product.id}>
                                            {product.name} ({product.quantity} available)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="transfer-quantity">Quantity</Label>
                                <Input
                                    id="transfer-quantity"
                                    type="number"
                                    placeholder="0"
                                    value={transferForm.quantity}
                                    onChange={(e) =>
                                        setTransferForm((prev) => ({
                                            ...prev,
                                            quantity: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="destination-block">Destination Block</Label>
                                <Input
                                    id="destination-block"
                                    placeholder="e.g., A-02"
                                    value={transferForm.destinationBlock}
                                    onChange={(e) =>
                                        setTransferForm((prev) => ({
                                            ...prev,
                                            destinationBlock: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTransferOpen(false)}>Cancel</Button>
                        <Button onClick={handleTransfer}>
                            <ArrowRightLeft className="h-4 w-4 mr-2" />
                            Transfer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Picklist Dialog */}
            <Dialog open={picklistOpen} onOpenChange={setPicklistOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Generate Picklist</DialogTitle>
                        <DialogDescription>
                            Select products and quantities for the picklist
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[300px] overflow-y-auto pr-2">
                        <div className="space-y-2">
                            {picklistItems.map((item) => {
                                const product = block.products.find(
                                    (p) => p.id === item.productId
                                );
                                if (!product) return null;

                                return (
                                    <div
                                        key={item.productId}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                                            item.selected
                                                ? "bg-primary/5 border-primary/30"
                                                : "bg-card border-border/50"
                                        )}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => togglePicklistItem(item.productId)}
                                            className={cn(
                                                "shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                                item.selected
                                                    ? "bg-primary border-primary text-primary-foreground"
                                                    : "border-border bg-background"
                                            )}
                                        >
                                            {item.selected && <Check className="h-3 w-3" />}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate">
                                                {product.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Available: {product.quantity}
                                            </div>
                                        </div>
                                        <Input
                                            type="number"
                                            className="w-20 h-8 text-center"
                                            placeholder="Qty"
                                            min={0}
                                            max={product.quantity}
                                            value={item.quantity || ""}
                                            onChange={(e) =>
                                                updatePicklistQuantity(
                                                    item.productId,
                                                    parseInt(e.target.value) || 0
                                                )
                                            }
                                            disabled={!item.selected}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPicklistOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleGeneratePicklist}
                            disabled={!picklistItems.some((item) => item.selected && item.quantity > 0)}
                        >
                            <ClipboardList className="h-4 w-4 mr-2" />
                            Generate Picklist
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Price Prediction Dialog */}
            <Dialog open={predictionOpen} onOpenChange={setPredictionOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            ML Price Prediction
                        </DialogTitle>
                        <DialogDescription>
                            Predict price deviation for {selectedProductForPrediction?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {/* Logistics Form */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="pred-origin-state">Origin State</Label>
                                <Select
                                    value={logisticsData.originState || ""}
                                    onValueChange={(value) =>
                                        setLogisticsData((prev) => ({ ...prev, originState: value || undefined }))
                                    }
                                >
                                    <SelectTrigger id="pred-origin-state">
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
                                <Label htmlFor="pred-dest-state">Destination State *</Label>
                                <Select
                                    value={logisticsData.destState || ""}
                                    onValueChange={(value) =>
                                        setLogisticsData((prev) => ({ ...prev, destState: value || undefined }))
                                    }
                                >
                                    <SelectTrigger id="pred-dest-state">
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
                                <Label htmlFor="pred-route-distance">Route Distance (meters) *</Label>
                                <Input
                                    id="pred-route-distance"
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
                                <Label htmlFor="pred-route-type">Route Type *</Label>
                                <Select
                                    value={logisticsData.routeType || ""}
                                    onValueChange={(value) =>
                                        setLogisticsData((prev) => ({
                                            ...prev,
                                            routeType: value as RouteType,
                                        }))
                                    }
                                >
                                    <SelectTrigger id="pred-route-type">
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
                                <Label htmlFor="pred-package-weight">Package Weight (kg)</Label>
                                <Input
                                    id="pred-package-weight"
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
                                <Label htmlFor="pred-estimated-duration">Estimated Duration (hours)</Label>
                                <Input
                                    id="pred-estimated-duration"
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
                                <Label htmlFor="pred-actual-transit">Actual Transit Hours (optional)</Label>
                                <Input
                                    id="pred-actual-transit"
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
                                <Label htmlFor="pred-delay-hours">Delay Hours</Label>
                                <Input
                                    id="pred-delay-hours"
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

                        {/* Prediction Results */}
                        {prediction && (
                            <div className="mt-4 p-4 rounded-lg border bg-gradient-to-br from-card to-muted/30 space-y-3">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    <Sparkles className="h-4 w-4" />
                                    Prediction Results
                                </div>

                                <div className="p-3 rounded-lg bg-card border">
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

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-2 rounded-lg bg-card border">
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                                            Initial Value
                                        </div>
                                        <div className="text-sm font-bold">{formatCurrency(prediction.initialValueINR)}</div>
                                    </div>
                                    <div className="p-2 rounded-lg bg-card border">
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                                            Expected Final Value
                                        </div>
                                        <div className="text-sm font-bold">{formatCurrency(prediction.expectedFinalValueINR)}</div>
                                    </div>
                                </div>

                                {prediction.predictedReason && (
                                    <div className="p-2 rounded-lg bg-card border">
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

                                {prediction.pricing && (
                                    <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <IndianRupee className="h-3 w-3 text-blue-600" />
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
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPredictionOpen(false)}>Close</Button>
                        <Button onClick={handlePredict} disabled={isPredicting || !logisticsData.destState || !logisticsData.routeDistance || !logisticsData.routeType}>
                            {isPredicting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Predict Price
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
