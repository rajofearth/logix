"use client";

import { cn } from "@/lib/utils";
import type { Delivery } from "../_data/deliveries";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
        <div
            onMouseEnter={() => onHover(delivery.id)}
            onMouseLeave={() => onHover(null)}
            onClick={onClick}
            className={cn(
                "transition-all duration-100 cursor-pointer p-2 border",
                isSelected
                    ? "bg-[#316ac5] border-[#000080] text-white" // Win7 Selected Item Blue
                    : "bg-white border-transparent hover:bg-[#eef1ff] hover:border-[#a8a8a8]", // Hover state
                "group relative select-none"
            )}
        >
            {/* Dotted focus outline simulation if needed, but simple selection is fine */}

            {/* Header Section */}
            <div className="flex items-start justify-between pb-1">
                <p className={cn(
                    "text-xs font-bold font-sans",
                    isSelected ? "text-white" : "text-black"
                )}>
                    {delivery.type}
                </p>
                {isSelected && <span className="text-[10px] text-white opacity-80">Selected</span>}
            </div>

            {/* Route Section - Compact */}
            <div className="space-y-1 mb-2">
                {/* Origin */}
                <div className="flex items-start gap-2">
                    <div className="w-3 flex justify-center pt-1">
                        <div className={cn("size-1.5 rounded-full", isSelected ? "bg-white" : "bg-green-600")} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={cn("text-[11px] truncate leading-tight", isSelected ? "text-white" : "text-black")}>
                            {delivery.origin.address}
                        </p>
                    </div>
                </div>

                {/* Destination */}
                <div className="flex items-start gap-2">
                    <div className="w-3 flex justify-center pt-1">
                        <div className={cn("size-1.5 rounded-sm", isSelected ? "bg-white" : "bg-red-600")} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={cn("text-[11px] truncate leading-tight", isSelected ? "text-white" : "text-black")}>
                            {delivery.destination.address}
                        </p>
                    </div>
                </div>
            </div>

            {/* Driver Section - Compact */}
            <div className={cn(
                "flex items-center gap-2 pt-1 border-t",
                isSelected ? "border-white/30" : "border-gray-200"
            )}>
                <Avatar className="size-6 ring-1 ring-black/10">
                    <AvatarImage src={delivery.driver.avatar} alt={delivery.driver.name} />
                    <AvatarFallback className="text-[9px] text-black">{delivery.driver.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p className={cn("text-[11px] font-medium truncate", isSelected ? "text-white" : "text-black")}>
                        {delivery.driver.name}
                    </p>
                    <p className={cn("text-[9px] truncate", isSelected ? "text-white/80" : "text-gray-500")}>
                        {delivery.driver.role}
                    </p>
                </div>
            </div>
        </div>
    );
}
