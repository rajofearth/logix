"use client";

import { motion } from "framer-motion";

const companies = [
    "Linear",
    "Vercel",
    "Stripe",
    "Raycast",
    "Arc",
    "Coinbase",
    "Shopify",
    "Discord",
];

export function Marquee() {
    return (
        <div className="relative flex w-full overflow-hidden border-y border-border/50 bg-background py-10">
            <div className="absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-background to-transparent" />
            <div className="absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-background to-transparent" />

            <motion.div
                className="flex whitespace-nowrap"
                animate={{ x: [0, -1000] }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: 20,
                }}
            >
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-12 px-6 opacity-30 grayscale transition-opacity hover:opacity-100 hover:grayscale-0">
                        {companies.map((company) => (
                            <span key={company} className="text-2xl font-bold tracking-tighter">
                                {company}
                            </span>
                        ))}
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
