"use client";

import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Delivery } from "../_data/deliveries";

interface DeliveryCardProps {
    delivery: Delivery;
    isHovered: boolean;
    isSelected?: boolean;
    onHover: (id: string | null) => void;
    onClick?: () => void;
}

export function DeliveryCard({
    delivery,
    isHovered,
    isSelected,
    onHover,
    onClick
}: DeliveryCardProps) {
    return (
        <Card
            onMouseEnter={() => onHover(delivery.id)}
            onMouseLeave={() => onHover(null)}
            onClick={onClick}
            className={cn(
                "transition-all duration-300 cursor-pointer",
                isSelected
                    ? "ring-2 ring-primary bg-primary/10 dark:bg-primary/15 shadow-md"
                    : delivery.isActive
                        ? "ring-2 ring-primary/40 bg-primary/5 dark:bg-primary/10"
                        : "hover:ring-1 hover:ring-primary/20",
                isHovered && !isSelected && "scale-[1.02] shadow-lg"
            )}
        >
            <CardContent className="p-0">
                {/* Header Section */}
                <div className="flex items-start justify-between p-3 pb-2">
                    <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-foreground">{delivery.type}</p>
                    </div>
                </div>

                {/* Route Section - Compact */}
                <div className="px-3 py-2 space-y-2">
                    {/* Origin */}
                    <div className="flex items-start gap-2 group/origin">
                        <div className="relative flex flex-col items-center pt-0.5">
                            <div className="size-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20 transition-all duration-200 group-hover/origin:ring-emerald-500/40" />
                            <div className="w-0.5 h-5 bg-gradient-to-b from-emerald-500/50 to-destructive/50" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">
                                {delivery.origin.address}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                                {delivery.origin.detail}
                            </p>
                        </div>
                    </div>

                    {/* Destination */}
                    <div className="flex items-start gap-2 group/dest">
                        <div className="relative flex flex-col items-center pt-0.5">
                            <div className="size-2.5 rounded-full bg-destructive ring-2 ring-destructive/20 transition-all duration-200 group-hover/dest:ring-destructive/40" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">
                                {delivery.destination.address}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                                {delivery.destination.detail}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Client Section - Compact */}
                <div className="flex items-center justify-between px-3 py-2 border-t border-border/50">
                    <div className="flex items-center gap-2">
                        <Avatar className="size-8 ring-2 ring-background shadow-sm transition-transform duration-200 hover:scale-110">
                            <AvatarImage src={delivery.client.avatar} alt={delivery.client.name} />
                            <AvatarFallback className="text-xs">{delivery.client.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground">Client</p>
                            <p className="text-xs font-medium text-foreground truncate">
                                {delivery.client.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                                {delivery.client.company}
                            </p>
                        </div>
                    </div>


                </div>
            </CardContent>
        </Card>
    );
}
