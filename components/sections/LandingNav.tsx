"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function LandingNav() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12"
        >
            <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background">
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M12 2L2 19H22L12 2Z"
                            fill="currentColor"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
                <span className="text-lg font-bold tracking-tight">Logix</span>
            </div>

            <div className="hidden items-center gap-8 md:flex">
                {["Features", "Solutions", "Pricing", "Company"].map((item) => (
                    <Link
                        key={item}
                        href={`#${item.toLowerCase()}`}
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        {item}
                    </Link>
                ))}
            </div>

            <div className="hidden items-center gap-4 md:flex">
                <Link
                    href="/login"
                    className="text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                >
                    Sign In
                </Link>
                <Button className="group rounded-full bg-foreground px-5 text-background hover:bg-foreground/90">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
            </div>

            <button
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
            >
                <Menu className="h-6 w-6" />
            </button>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="absolute inset-x-0 top-full mt-2 flex flex-col gap-4 rounded-xl border border-border bg-background/95 p-6 shadow-2xl backdrop-blur-3xl md:hidden">
                    {["Features", "Solutions", "Pricing", "Company"].map((item) => (
                        <Link
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            className="text-lg font-medium text-foreground"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {item}
                        </Link>
                    ))}
                    <div className="mt-4 flex flex-col gap-3">
                        <Button variant="outline" className="w-full rounded-full">
                            Sign In
                        </Button>
                        <Button className="w-full rounded-full">Get Started</Button>
                    </div>
                </div>
            )}
        </motion.nav>
    );
}
