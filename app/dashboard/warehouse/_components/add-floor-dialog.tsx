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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Floor</DialogTitle>
                    <DialogDescription>
                        Add a new floor level to the warehouse.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
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
                        <p className="text-[0.8rem] text-muted-foreground">
                            Use 0 for Ground, 1 for First Floor, etc.
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Create Floor
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
