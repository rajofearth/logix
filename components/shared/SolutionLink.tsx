"use client";

import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SolutionLinkProps {
    children: React.ReactNode;
    image: string;
    description: string;
}

export function SolutionLink({ children, image, description }: SolutionLinkProps) {
    return (
        <HoverCard>
            <HoverCardTrigger className="cursor-pointer underline decoration-border underline-offset-4 hover:decoration-foreground transition-colors">
                {children}
            </HoverCardTrigger>
            <HoverCardContent
                className="w-[280px] p-0 overflow-hidden rounded-2xl
                  shadow-2xl
                  bg-background/80 
                  backdrop-blur-md
                  border border-border
                  text-foreground
                  animate-in fade-in zoom-in-95 duration-200"
                sideOffset={16}
            >
                <div className="relative h-32 w-full">
                    <Image
                        src={image}
                        alt={String(children)}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="p-5">
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {description}
                    </p>
                    <Link
                        href="#"
                        className="text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all text-foreground"
                    >
                        Show more <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}
