"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createWarehouse } from "../_lib/api";

interface AddWarehouseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function AddWarehouseDialog({ open, onOpenChange, onSuccess }: AddWarehouseDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: "",
        code: "",
        address: "",
        city: "",
    });

    const handleSubmit = async () => {
        if (!form.name || !form.code || !form.address || !form.city) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsSubmitting(true);
        try {
            await createWarehouse({
                name: form.name,
                code: form.code,
                address: form.address,
                city: form.city,
            });

            toast.success("Warehouse created successfully!");
            setForm({ name: "", code: "", address: "", city: "" });
            onOpenChange(false);
            onSuccess?.();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to create warehouse");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className="sm:max-w-[450px] p-0 bg-transparent border-none shadow-none">
                <div className="win7-window flex flex-col w-full">
                    <div className="title-bar">
                        <div className="title-bar-text" style={{ textShadow: "none" }}>Add New Warehouse</div>
                        <div className="title-bar-controls">
                            <button
                                aria-label="Close"
                                className="close"
                                onClick={() => onOpenChange(false)}
                            />
                        </div>
                    </div>

                    <div className="window-body p-4">
                        <div className="text-sm mb-4">
                            Create a new warehouse to manage inventory.
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="warehouse-name" className="text-xs">Warehouse Name</Label>
                                    <input
                                        id="warehouse-name"
                                        placeholder="Mumbai Central Warehouse"
                                        className="w-full h-6 px-1 border border-[#abadb3] bg-white text-sm shadow-inner focus:outline-none focus:border-[#3c7fb1]"
                                        value={form.name}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                name: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="warehouse-code" className="text-xs">Code</Label>
                                    <input
                                        id="warehouse-code"
                                        placeholder="WH-MUM"
                                        className="w-full h-6 px-1 border border-[#abadb3] bg-white text-sm shadow-inner focus:outline-none focus:border-[#3c7fb1]"
                                        value={form.code}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                code: e.target.value.toUpperCase(),
                                            }))
                                        }
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="warehouse-address" className="text-xs">Address</Label>
                                <input
                                    id="warehouse-address"
                                    placeholder="Plot 45, Industrial Area"
                                    className="w-full h-6 px-1 border border-[#abadb3] bg-white text-sm shadow-inner focus:outline-none focus:border-[#3c7fb1]"
                                    value={form.address}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            address: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="warehouse-city" className="text-xs">City</Label>
                                <input
                                    id="warehouse-city"
                                    placeholder="Mumbai"
                                    className="w-full h-6 px-1 border border-[#abadb3] bg-white text-sm shadow-inner focus:outline-none focus:border-[#3c7fb1]"
                                    value={form.city}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            city: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                className="win7-btn min-w-[70px] px-3 py-1"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="win7-btn min-w-[70px] px-3 py-1 font-bold"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting && <Loader2 className="h-3 w-3 mr-1 animate-spin inline" />}
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
