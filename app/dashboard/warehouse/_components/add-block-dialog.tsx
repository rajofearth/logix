"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createBlock } from "../_lib/api";
import { getCategoryLabel, ProductCategory, CATEGORIES } from "./types";

interface AddBlockDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    warehouseId: string;
    floorId: string;
    onSuccess?: () => void;
}

export function AddBlockDialog({
    open,
    onOpenChange,
    warehouseId,
    floorId,
    onSuccess,
}: AddBlockDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: "",
        row: "",
        column: "",
        capacity: "",
        category: "other" as ProductCategory,
    });

    const handleSubmit = async () => {
        if (!form.name || !form.row || !form.column || !form.capacity) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);
        try {
            await createBlock(warehouseId, floorId, {
                name: form.name,
                row: form.row, // Keep as string (A, B, C...)
                column: parseInt(form.column),
                capacity: parseInt(form.capacity),
                category: form.category,
            });

            toast.success("Block created successfully!");
            setForm({
                name: "",
                row: "",
                column: "",
                capacity: "",
                category: "other",
            });
            onOpenChange(false);
            onSuccess?.();
            // Small delay to ensure drawer closes smoothly before refresh
            setTimeout(() => onSuccess?.(), 100);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to create block");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Block</DialogTitle>
                    <DialogDescription>
                        Create a storage block in this floor.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="block-name">Block Name/Code</Label>
                        <Input
                            id="block-name"
                            placeholder="A-1"
                            value={form.name}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    name: e.target.value.toUpperCase(),
                                }))
                            }
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="row">Row (e.g. A, B)</Label>
                            <Input
                                id="row"
                                placeholder="A"
                                value={form.row}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        row: e.target.value.toUpperCase(),
                                    }))
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="column">Column (e.g. 1, 2)</Label>
                            <Input
                                id="column"
                                type="number"
                                placeholder="1"
                                value={form.column}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        column: e.target.value,
                                    }))
                                }
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="capacity">Capacity (Units)</Label>
                            <Input
                                id="capacity"
                                type="number"
                                placeholder="1000"
                                value={form.capacity}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        capacity: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={form.category}
                                onValueChange={(v) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        category: v as ProductCategory,
                                    }))
                                }
                            >
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {getCategoryLabel(cat)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Create Block
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
