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
import { createFloor } from "../_lib/api";

interface AddFloorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    warehouseId: string;
    onSuccess?: () => void;
}

export function AddFloorDialog({ open, onOpenChange, warehouseId, onSuccess }: AddFloorDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: "",
        level: "",
    });

    const handleSubmit = async () => {
        if (!form.name || !form.level) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsSubmitting(true);
        try {
            await createFloor(warehouseId, {
                name: form.name,
                level: parseInt(form.level),
            });

            toast.success("Floor created successfully!");
            setForm({ name: "", level: "" });
            onOpenChange(false);
            onSuccess?.();
            // Small delay to ensure drawer closes smoothly before refresh
            setTimeout(() => onSuccess?.(), 100);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to create floor");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Add New Floor</DrawerTitle>
                    <DrawerDescription>
                        Add a new floor level to the warehouse.
                    </DrawerDescription>
                </DrawerHeader>
                <div className="px-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="floor-name">Floor Name</Label>
                        <Input
                            id="floor-name"
                            placeholder="Ground Floor"
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
                        <Label htmlFor="floor-level">Level Number</Label>
                        <Input
                            id="floor-level"
                            type="number"
                            placeholder="0"
                            value={form.level}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    level: e.target.value,
                                }))
                            }
                        />
                        <p className="text-xs text-zinc-500">
                            Use 0 for Ground, 1 for First Floor, etc.
                        </p>
                    </div>
                </div>
                <DrawerFooter>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Create Floor
                    </Button>
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
