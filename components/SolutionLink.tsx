"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SolutionLinkProps {
    children: React.ReactNode;
    image: string;
    description: string;
}

export function SolutionLink({ children, image, description }: SolutionLinkProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <span className="relative inline-block group">
            <span
                className="cursor-pointer underline decoration-gray-300 underline-offset-4 hover:decoration-black transition-colors"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {children}
            </span>

            {isHovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-[280px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="relative h-32 w-full">
                        <Image
                            src={image}
                            alt={String(children)}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="p-5">
                        <p className="text-sm text-black/60 leading-relaxed mb-4">
                            {description}
                        </p>
                        <Link
                            href="#"
                            className="text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all"
                        >
                            Show more <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    {/* Subtle arrow tip */}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-gray-100 rotate-45" />
                </div>
            )}
        </span>
    );
}
