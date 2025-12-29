"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
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
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Add New Warehouse</DrawerTitle>
                    <DrawerDescription>
                        Create a new warehouse to manage inventory
                    </DrawerDescription>
                </DrawerHeader>
                <div className="px-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="warehouse-name">Warehouse Name</Label>
                            <Input
                                id="warehouse-name"
                                placeholder="Mumbai Central Warehouse"
                                value={form.name}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="warehouse-code">Code</Label>
                            <Input
                                id="warehouse-code"
                                placeholder="WH-MUM"
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
                    <div className="space-y-2">
                        <Label htmlFor="warehouse-address">Address</Label>
                        <Input
                            id="warehouse-address"
                            placeholder="Plot 45, Industrial Area"
                            value={form.address}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    address: e.target.value,
                                }))
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="warehouse-city">City</Label>
                        <Input
                            id="warehouse-city"
                            placeholder="Mumbai"
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
                <DrawerFooter>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Create Warehouse
                    </Button>
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
