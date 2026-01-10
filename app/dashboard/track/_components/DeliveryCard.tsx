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
                "transition-all duration-100 cursor-pointer p-2 border select-none",
                "font-[var(--w7-font)]"
            )}
            style={{
                font: 'var(--w7-font)',
                fontSize: '9pt',
                background: isSelected
                    ? 'linear-gradient(#3399ff 45%, #1c78cc 45%, #0056b3)' // Win7 selection blue gradient
                    : isHovered
                        ? 'linear-gradient(rgba(255,255,255,0.6), rgba(230,236,245,0.8) 90%, rgba(255,255,255,0.8))' // Win7 hover
                        : '#fff',
                border: isSelected
                    ? '1px solid #003399'
                    : isHovered
                        ? '1px solid #aaddfa' // Win7 hover border
                        : '1px solid #cdd7db',
                borderRadius: 'var(--w7-el-bdr)',
                boxShadow: isSelected
                    ? 'inset 0 0 0 1px rgba(255,255,255,0.3)'
                    : 'inset 0 0 0 1px #fff',
                color: isSelected ? '#fff' : '#000',
            }}
        >
            {/* Header Section */}
            <div className="flex items-start justify-between pb-1">
                <p
                    className="text-xs font-bold"
                    style={{ color: isSelected ? '#fff' : '#000' }}
                >
                    {delivery.type}
                </p>
                {isSelected && (
                    <span
                        className="text-[10px]"
                        style={{ color: 'rgba(255,255,255,0.8)' }}
                    >
                        Selected
                    </span>
                )}
            </div>

            {/* Route Section - Compact */}
            <div className="space-y-1 mb-2">
                {/* Origin */}
                <div className="flex items-start gap-2">
                    <div className="w-3 flex justify-center pt-1">
                        <div
                            className="size-1.5 rounded-full"
                            style={{ background: isSelected ? '#fff' : '#0066cc' }}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p
                            className="text-[11px] truncate leading-tight"
                            style={{ color: isSelected ? '#fff' : '#000' }}
                        >
                            {delivery.origin.address}
                        </p>
                    </div>
                </div>

                {/* Destination */}
                <div className="flex items-start gap-2">
                    <div className="w-3 flex justify-center pt-1">
                        <div
                            className="size-1.5 rounded-sm"
                            style={{ background: isSelected ? '#fff' : '#cc0000' }}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p
                            className="text-[11px] truncate leading-tight"
                            style={{ color: isSelected ? '#fff' : '#000' }}
                        >
                            {delivery.destination.address}
                        </p>
                    </div>
                </div>
            </div>

            {/* Driver Section - Compact */}
            <div
                className="flex items-center gap-2 pt-1"
                style={{
                    borderTop: isSelected ? '1px solid rgba(255,255,255,0.3)' : '1px solid #e0e0e0'
                }}
            >
                <Avatar
                    className="size-6"
                    style={{ border: '1px solid #8e8f8f' }}
                >
                    <AvatarImage src={delivery.driver.avatar} alt={delivery.driver.name} />
                    <AvatarFallback
                        className="text-[9px]"
                        style={{
                            background: 'linear-gradient(#fff 45%, #f0f0f0 45%, #e0e0e0)',
                            color: '#333'
                        }}
                    >
                        {delivery.driver.name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p
                        className="text-[11px] font-medium truncate"
                        style={{ color: isSelected ? '#fff' : '#000' }}
                    >
                        {delivery.driver.name}
                    </p>
                    <p
                        className="text-[9px] truncate"
                        style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : '#666' }}
                    >
                        {delivery.driver.role}
                    </p>
                </div>
            </div>
        </div>
    );
}
