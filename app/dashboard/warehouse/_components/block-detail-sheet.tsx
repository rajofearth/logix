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
                <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
                    {/* Sticky Header */}
                    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
                        <SheetHeader className="p-4 pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center">
                                        <CategoryIcon className="size-5 text-primary" />
                                    </div>
                                    <div>
                                        <SheetTitle className="text-base font-semibold">
                                            Block {block.name}
                                        </SheetTitle>
                                        <SheetDescription className="text-xs">
                                            Row {block.row}, Column {block.column}
                                        </SheetDescription>
                                    </div>
                                </div>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 border",
                                        block.status === "critical"
                                            ? "bg-red-500/10 text-red-500 border-red-500/20"
                                            : block.status === "warning"
                                                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                : block.status === "empty"
                                                    ? "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
                                                    : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                    )}
                                >
                                    <span className={cn(
                                        "size-1.5 rounded-full mr-1.5",
                                        block.status === "critical" ? "bg-red-500" :
                                            block.status === "warning" ? "bg-amber-500" :
                                                block.status === "empty" ? "bg-zinc-500" : "bg-emerald-500"
                                    )} />
                                    {block.status}
                                </Badge>
                            </div>
                        </SheetHeader>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="space-y-4 p-4">
                            {/* Capacity Overview */}
                            <div className="p-4 rounded-xl bg-gradient-to-br from-card to-muted/30 border shadow-sm">
                                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                                    <Package className="size-4" />
                                    <span className="text-xs font-semibold uppercase tracking-wide">Storage Capacity</span>
                                </div>
                                <div className="flex items-end justify-between mb-3">
                                    <div>
                                        <span className="text-4xl font-bold tracking-tight">{usagePercent}</span>
                                        <span className="text-xl font-bold text-muted-foreground">%</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-semibold">{block.used.toLocaleString()} / {block.capacity.toLocaleString()}</div>
                                        <div className="text-xs text-muted-foreground">units stored</div>
                                    </div>
                                </div>
                                <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                                            usagePercent >= 90 ? "bg-red-500" :
                                                usagePercent >= 70 ? "bg-amber-500" : "bg-emerald-500"
                                        )}
                                        style={{ width: `${usagePercent}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-3 text-xs">
                                    <span className="text-muted-foreground">
                                        Available: <span className="font-semibold text-emerald-600">{(block.capacity - block.used).toLocaleString()}</span> units
                                    </span>
                                    <Badge variant="secondary" className="text-[10px] h-5">
                                        {categoryLabel}
                                    </Badge>
                                </div>
                            </div>

                            {/* Value Summary */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-muted-foreground px-1">
                                    <IndianRupee className="size-3.5" />
                                    <span className="text-xs font-semibold uppercase tracking-wide">Inventory Value</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-3 rounded-lg bg-card border">
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Bought At</div>
                                        <div className="text-lg font-bold">{formatCurrency(totalBoughtValue)}</div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-card border">
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Current Value</div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-lg font-bold">{formatCurrency(totalCurrentValue)}</span>
                                            <span
                                                className={cn(
                                                    "text-[10px] font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded-full",
                                                    valueDifference >= 0
                                                        ? "text-emerald-600 bg-emerald-500/10"
                                                        : "text-red-600 bg-red-500/10"
                                                )}
                                            >
                                                {valueDifference >= 0 ? (
                                                    <TrendingUp className="size-2.5" />
                                                ) : (
                                                    <TrendingDown className="size-2.5" />
                                                )}
                                                {valuePercentChange}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Environment Cards */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className={cn(
                                    "p-3 rounded-lg border transition-colors",
                                    block.temperature != null
                                        ? "bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20"
                                        : "bg-muted/30 border-border/50"
                                )}>
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <Thermometer className={cn(
                                            "size-4",
                                            block.temperature != null ? "text-orange-500" : "text-muted-foreground"
                                        )} />
                                        <span className={cn(
                                            "text-[10px] font-semibold uppercase tracking-wide",
                                            block.temperature != null ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground"
                                        )}>
                                            Temperature
                                        </span>
                                    </div>
                                    {block.temperature != null ? (
                                        <div className="flex items-baseline gap-0.5">
                                            <span className="text-2xl font-bold">{block.temperature.toFixed(1)}</span>
                                            <span className="text-sm font-semibold text-muted-foreground">°C</span>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground">Not monitored</div>
                                    )}
                                </div>
                                <div className={cn(
                                    "p-3 rounded-lg border transition-colors",
                                    block.humidity != null
                                        ? "bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20"
                                        : "bg-muted/30 border-border/50"
                                )}>
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <Droplets className={cn(
                                            "size-4",
                                            block.humidity != null ? "text-cyan-500" : "text-muted-foreground"
                                        )} />
                                        <span className={cn(
                                            "text-[10px] font-semibold uppercase tracking-wide",
                                            block.humidity != null ? "text-cyan-600 dark:text-cyan-400" : "text-muted-foreground"
                                        )}>
                                            Humidity
                                        </span>
                                    </div>
                                    {block.humidity != null ? (
                                        <div className="flex items-baseline gap-0.5">
                                            <span className="text-2xl font-bold">{block.humidity.toFixed(0)}</span>
                                            <span className="text-sm font-semibold text-muted-foreground">%</span>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground">Not monitored</div>
                                    )}
                                </div>
                            </div>

                            {/* Products List */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <ClipboardList className="size-3.5" />
                                        <span className="text-xs font-semibold uppercase tracking-wide">Products</span>
                                    </div>
                                    <Badge variant="secondary" className="text-[10px] h-5">
                                        {block.products.length} items
                                    </Badge>
                                </div>

                                {block.products.length === 0 ? (
                                    <div className="p-6 rounded-lg border border-dashed text-center">
                                        <Package className="size-8 mx-auto text-muted-foreground/50 mb-2" />
                                        <p className="text-sm text-muted-foreground">No products stored</p>
                                        <p className="text-xs text-muted-foreground/70">Add products to this block to start tracking</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {block.products.map((product) => {
                                            const isExpiringSoon =
                                                product.expiryDate &&
                                                new Date(product.expiryDate) < expiryThreshold;

                                            const priceChange = product.currentPrice - product.boughtAt;
                                            const priceChangePercent = ((priceChange / product.boughtAt) * 100).toFixed(1);

                                            return (
                                                <div
                                                    key={product.id}
                                                    className={cn(
                                                        "p-3 rounded-lg border bg-card transition-all hover:shadow-sm",
                                                        isExpiringSoon &&
                                                        "border-amber-500/30 bg-amber-500/5"
                                                    )}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5 mb-1">
                                                                <span className="font-medium text-sm truncate">
                                                                    {product.name}
                                                                </span>
                                                                {isExpiringSoon && (
                                                                    <AlertTriangle className="size-3.5 text-amber-500 shrink-0" />
                                                                )}
                                                            </div>
                                                            <span className="font-mono text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                                                                {product.sku}
                                                            </span>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <div className="text-base font-bold tabular-nums">
                                                                {product.quantity.toLocaleString()}
                                                                <span className="text-[10px] text-muted-foreground font-normal ml-0.5">qty</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50 text-[11px]">
                                                        <div className="flex items-center gap-3">
                                                            <span>
                                                                <span className="text-muted-foreground">Bought:</span>{" "}
                                                                <span className="font-medium">{formatCurrency(product.boughtAt)}</span>
                                                            </span>
                                                            <span>
                                                                <span className="text-muted-foreground">Current:</span>{" "}
                                                                <span className="font-medium">{formatCurrency(product.currentPrice)}</span>
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className={cn(
                                                                    "text-[10px] font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded-full",
                                                                    priceChange >= 0
                                                                        ? "text-emerald-600 bg-emerald-500/10"
                                                                        : "text-red-600 bg-red-500/10"
                                                                )}
                                                            >
                                                                {priceChange >= 0 ? (
                                                                    <TrendingUp className="size-2.5" />
                                                                ) : (
                                                                    <TrendingDown className="size-2.5" />
                                                                )}
                                                                {priceChangePercent}%
                                                            </span>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-6 px-2 text-[10px] gap-1"
                                                                onClick={() => openPredictionDialog(product)}
                                                            >
                                                                <Sparkles className="h-3 w-3" />
                                                                Predict
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Last Activity */}
                            {block.lastActivity && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                                    <Clock className="size-3.5" />
                                    <span>Last activity: {new Date(block.lastActivity).toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Quick Actions - Sticky Footer */}
                    <div className="sticky bottom-0 p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                size="sm"
                                className="gap-1.5 text-xs h-9 bg-primary hover:bg-primary/90"
                                onClick={() => setAddProductOpen(true)}
                            >
                                <Plus className="size-3.5" />
                                Add
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 text-xs h-9"
                                onClick={() => setTransferOpen(true)}
                            >
                                <ArrowRightLeft className="size-3.5" />
                                Transfer
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 text-xs h-9"
                                onClick={openPicklist}
                            >
                                <ClipboardList className="h-3.5 w-3.5" />
                                Picklist
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Add Product Dialog */}
            <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
                        <DialogDescription>
                            Add a new product to Block {block.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="product-name">Product Name</Label>
                                <Input
                                    id="product-name"
                                    placeholder="Enter product name"
                                    value={addProductForm.name}
                                    onChange={(e) =>
                                        setAddProductForm((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="product-sku">SKU</Label>
                                <Input
                                    id="product-sku"
                                    placeholder="e.g., ELC-1234"
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
                            <div className="space-y-2">
                                <Label htmlFor="product-quantity">Quantity</Label>
                                <Input
                                    id="product-quantity"
                                    type="number"
                                    placeholder="0"
                                    value={addProductForm.quantity}
                                    onChange={(e) =>
                                        setAddProductForm((prev) => ({
                                            ...prev,
                                            quantity: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="product-weekly-sales">Avg Weekly Sales</Label>
                                <Input
                                    id="product-weekly-sales"
                                    type="number"
                                    placeholder="e.g., 25"
                                    value={addProductForm.averageWeeklySales}
                                    onChange={(e) =>
                                        setAddProductForm((prev) => ({
                                            ...prev,
                                            averageWeeklySales: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="product-bought">Bought At (per unit)</Label>
                                <Input
                                    id="product-bought"
                                    type="number"
                                    placeholder="0.00"
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
                        <div className="space-y-2">
                            <Label htmlFor="product-current">Current Price (per unit)</Label>
                            <Input
                                id="product-current"
                                type="number"
                                placeholder="0.00"
                                value={addProductForm.currentPrice}
                                onChange={(e) =>
                                    setAddProductForm((prev) => ({
                                        ...prev,
                                        currentPrice: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={addProductForm.category}
                                onValueChange={(value) =>
                                    setAddProductForm((prev) => ({
                                        ...prev,
                                        category: value as ProductCategory,
                                    }))
                                }
                            >
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {getCategoryLabel(category)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddProductOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddProduct} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Add Product
                        </Button>
                    </DialogFooter>
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
