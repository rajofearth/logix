"use client";

import { Phone, ClipboardCopy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface DriverInfoPanelProps {
    driver: {
        name: string;
        role: string;
        avatar: string;
        experience: string;
        license: string;
        idNumber: string;
        insuranceNumber: string;
    };
}

export function DriverInfoPanel({ driver }: DriverInfoPanelProps) {
    return (
        <div className="inline-flex flex-col bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-lg p-3 min-w-[480px]">
            {/* Header Row */}
            <div className="flex items-center gap-4">
                {/* Avatar & Name */}
                <div className="flex items-center gap-2.5">
                    <Avatar className="size-10 ring-2 ring-border">
                        <AvatarImage src={driver.avatar} alt={driver.name} />
                        <AvatarFallback className="text-sm">{driver.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-semibold text-foreground">{driver.name}</h3>
                            <button className="text-muted-foreground hover:text-foreground transition-colors">
                                <ClipboardCopy className="size-3" />
                            </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{driver.role}</p>
                    </div>
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-border" />

                {/* Info Items - Inline */}
                <div className="flex items-center gap-4 flex-1">
                    <div className="text-center">
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Experience</p>
                        <p className="text-xs font-medium text-foreground">{driver.experience}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wide">License</p>
                        <p className="text-xs font-medium text-foreground">{driver.license}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wide">ID Number</p>
                        <p className="text-xs font-medium text-foreground">{driver.idNumber}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Insurance</p>
                        <p className="text-xs font-medium text-foreground">{driver.insuranceNumber}</p>
                    </div>
                </div>

                {/* Call Button */}
                <Button
                    size="sm"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5 h-8 rounded-full px-4 shrink-0"
                >
                    <Phone className="size-3.5" />
                    Call
                </Button>
            </div>
        </div>
    );
}
