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
import { Progress } from "@/components/ui/progress";
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
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import {
    Block,
    ProductCategory,
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
    Calendar,
    TrendingUp,
    TrendingDown,
    IndianRupee,
    Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BlockDetailSheetProps {
    block: Block | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// Add Product Dialog State
interface AddProductForm {
    name: string;
    sku: string;
    quantity: string;
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

export function BlockDetailSheet({ block, open, onOpenChange }: BlockDetailSheetProps) {
    // Dialog states
    const [addProductOpen, setAddProductOpen] = useState(false);
    const [transferOpen, setTransferOpen] = useState(false);
    const [picklistOpen, setPicklistOpen] = useState(false);

    // Form states
    const [addProductForm, setAddProductForm] = useState<AddProductForm>({
        name: "",
        sku: "",
        quantity: "",
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

    if (!block) return null;

    const usagePercent = formatCapacityPercentage(block.used, block.capacity);
    const CategoryIcon = getCategoryIcon(block.category);
    const categoryLabel = getCategoryLabel(block.category);

    // Stable reference for expiry check (30 days from now)
    const expiryThreshold = useMemo(() => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), []);

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
    const handleAddProduct = () => {
        // In a real app, this would make an API call
        console.log("Adding product:", addProductForm);
        setAddProductForm({
            name: "",
            sku: "",
            quantity: "",
            boughtAt: "",
            currentPrice: "",
            category: "other",
        });
        setAddProductOpen(false);
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

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="w-full sm:max-w-xl flex flex-col bg-linear-to-b from-background to-muted/20">
                    <SheetHeader className="pb-4 border-b border-border/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50">
                                    <CategoryIcon className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <SheetTitle className="text-lg font-semibold">
                                        Block {block.name}
                                    </SheetTitle>
                                    <SheetDescription className="text-xs">
                                        Row {block.row}, Column {block.column}
                                    </SheetDescription>
                                </div>
                            </div>
                            <Badge
                                className={cn(
                                    "text-[10px] uppercase tracking-wider font-medium px-2.5 py-1",
                                    block.status === "critical"
                                        ? "bg-red-500/90 hover:bg-red-600"
                                        : block.status === "warning"
                                            ? "bg-amber-500/90 hover:bg-amber-600"
                                            : block.status === "empty"
                                                ? "bg-zinc-500/90 hover:bg-zinc-600"
                                                : "bg-emerald-500/90 hover:bg-emerald-600"
                                )}
                            >
                                {block.status}
                            </Badge>
                        </div>
                    </SheetHeader>

                    <ScrollArea className="flex-1 -mx-6 px-6">
                        <div className="space-y-5 py-4">
                            {/* Capacity Overview */}
                            <div className="space-y-2.5">
                                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                                    <Package className="h-3.5 w-3.5" />
                                    Capacity
                                </h4>
                                <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm">
                                    <div className="flex items-baseline justify-between mb-3">
                                        <span className="text-3xl font-bold tracking-tight">
                                            {usagePercent}%
                                        </span>
                                        <span className="text-xs text-muted-foreground font-medium">
                                            {block.used.toLocaleString()} / {block.capacity.toLocaleString()} units
                                        </span>
                                    </div>
                                    <Progress value={usagePercent} className="h-2.5" />
                                    <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                                        <span>
                                            Available:{" "}
                                            <span className="font-semibold text-foreground">
                                                {(block.capacity - block.used).toLocaleString()}
                                            </span>{" "}
                                            units
                                        </span>
                                        <span>
                                            Category:{" "}
                                            <span className="font-semibold text-foreground">
                                                {categoryLabel}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Value Summary */}
                            <div className="space-y-2.5">
                                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                                    <IndianRupee className="h-3.5 w-3.5" />
                                    Inventory Value
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-lg bg-card border border-border/50">
                                        <div className="text-xs text-muted-foreground mb-1">Bought At</div>
                                        <div className="text-lg font-bold">{formatCurrency(totalBoughtValue)}</div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-card border border-border/50">
                                        <div className="text-xs text-muted-foreground mb-1">Current Value</div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold">{formatCurrency(totalCurrentValue)}</span>
                                            <span
                                                className={cn(
                                                    "text-xs font-medium flex items-center gap-0.5",
                                                    valueDifference >= 0 ? "text-emerald-600" : "text-red-600"
                                                )}
                                            >
                                                {valueDifference >= 0 ? (
                                                    <TrendingUp className="h-3 w-3" />
                                                ) : (
                                                    <TrendingDown className="h-3 w-3" />
                                                )}
                                                {valuePercentChange}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Environment */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-lg bg-linear-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 border border-orange-200/50 dark:border-orange-800/30">
                                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-1.5">
                                        <Thermometer className="h-3.5 w-3.5" />
                                        <span className="text-[10px] font-semibold uppercase tracking-wide">
                                            Temperature
                                        </span>
                                    </div>
                                    <span className="text-xl font-bold">
                                        {block.temperature?.toFixed(1) ?? "--"}C
                                    </span>
                                </div>
                                <div className="p-3 rounded-lg bg-linear-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-950/30 dark:to-cyan-900/20 border border-cyan-200/50 dark:border-cyan-800/30">
                                    <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 mb-1.5">
                                        <Droplets className="h-3.5 w-3.5" />
                                        <span className="text-[10px] font-semibold uppercase tracking-wide">
                                            Humidity
                                        </span>
                                    </div>
                                    <span className="text-xl font-bold">
                                        {block.humidity?.toFixed(0) ?? "--"}%
                                    </span>
                                </div>
                            </div>

                            {/* Products List */}
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                                        <ClipboardList className="h-3.5 w-3.5" />
                                        Products ({block.products.length})
                                    </h4>
                                </div>
                                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
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
                                                    "p-3 rounded-lg border bg-card transition-colors hover:bg-muted/30",
                                                    isExpiringSoon &&
                                                    "border-amber-400/50 bg-amber-50/30 dark:bg-amber-950/10"
                                                )}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium text-sm truncate">
                                                                {product.name}
                                                            </span>
                                                            {isExpiringSoon && (
                                                                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                                            <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded">
                                                                {product.sku}
                                                            </span>
                                                            {product.expiryDate && (
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {new Date(product.expiryDate).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <div className="font-bold text-sm">
                                                            {product.quantity.toLocaleString()}
                                                            <span className="text-[10px] text-muted-foreground font-normal ml-1">
                                                                qty
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Price Row */}
                                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                                                    <div className="flex items-center gap-4 text-[11px]">
                                                        <div>
                                                            <span className="text-muted-foreground">Bought:</span>{" "}
                                                            <span className="font-medium">{formatCurrency(product.boughtAt)}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">Current:</span>{" "}
                                                            <span className="font-medium">{formatCurrency(product.currentPrice)}</span>
                                                        </div>
                                                    </div>
                                                    <span
                                                        className={cn(
                                                            "text-[10px] font-semibold flex items-center gap-0.5",
                                                            priceChange >= 0 ? "text-emerald-600" : "text-red-600"
                                                        )}
                                                    >
                                                        {priceChange >= 0 ? (
                                                            <TrendingUp className="h-2.5 w-2.5" />
                                                        ) : (
                                                            <TrendingDown className="h-2.5 w-2.5" />
                                                        )}
                                                        {priceChangePercent}%
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Last Activity */}
                            {block.lastActivity && (
                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground p-2.5 bg-muted/30 rounded-lg border border-border/30">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>
                                        Last activity: {new Date(block.lastActivity).toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Quick Actions */}
                    <div className="pt-4 border-t border-border/50 mt-auto">
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 text-xs h-9"
                                onClick={() => setAddProductOpen(true)}
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Add Product
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 text-xs h-9"
                                onClick={() => setTransferOpen(true)}
                            >
                                <ArrowRightLeft className="h-3.5 w-3.5" />
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

            {/* Add Product Drawer */}
            <Drawer open={addProductOpen} onOpenChange={setAddProductOpen}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Add New Product</DrawerTitle>
                        <DrawerDescription>
                            Add a new product to Block {block.name}
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 space-y-4">
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
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                                value={addProductForm.category}
                                onValueChange={(value) =>
                                    setAddProductForm((prev) => ({
                                        ...prev,
                                        category: value as ProductCategory,
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="electronics">Electronics</SelectItem>
                                    <SelectItem value="food">Food & Beverages</SelectItem>
                                    <SelectItem value="apparel">Apparel</SelectItem>
                                    <SelectItem value="pharmaceuticals">Pharmaceuticals</SelectItem>
                                    <SelectItem value="machinery">Machinery</SelectItem>
                                    <SelectItem value="raw-materials">Raw Materials</SelectItem>
                                    <SelectItem value="packaging">Packaging</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DrawerFooter>
                        <Button onClick={handleAddProduct}>Add Product</Button>
                        <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            {/* Transfer Drawer */}
            <Drawer open={transferOpen} onOpenChange={setTransferOpen}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Transfer Product</DrawerTitle>
                        <DrawerDescription>
                            Move products from Block {block.name} to another location
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 space-y-4">
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
                                <Label htmlFor="transfer-quantity">Quantity to Transfer</Label>
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
                    <DrawerFooter>
                        <Button onClick={handleTransfer}>
                            <ArrowRightLeft className="h-4 w-4 mr-2" />
                            Transfer
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            {/* Picklist Drawer */}
            <Drawer open={picklistOpen} onOpenChange={setPicklistOpen}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Generate Picklist</DrawerTitle>
                        <DrawerDescription>
                            Select products and quantities for the picklist
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 max-h-[300px] overflow-y-auto">
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
                    <DrawerFooter>
                        <Button
                            onClick={handleGeneratePicklist}
                            disabled={!picklistItems.some((item) => item.selected && item.quantity > 0)}
                        >
                            <ClipboardList className="h-4 w-4 mr-2" />
                            Generate Picklist
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
}
