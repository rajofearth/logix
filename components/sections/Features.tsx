"use client";

import { motion } from "framer-motion";
import { Box, Layers, Zap, Shield, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
    {
        title: "Global Fleet Tracking",
        description: "Real-time visibility across continents with millisecond latency updates.",
        icon: Globe,
        className: "md:col-span-2 md:row-span-2",
    },
    {
        title: "Smart Inventory",
        description: "AI-powered stock prediction reducing dead stock by up to 40%.",
        icon: Box,
        className: "md:col-span-1 md:row-span-1",
    },
    {
        title: "Instant Billing",
        description: "Automated invoicing and receipt verification.",
        icon: Zap,
        className: "md:col-span-1 md:row-span-1",
    },
    {
        title: "Damage Detection",
        description: "Computer vision analysis for package integrity assurance.",
        icon: Layers,
        className: "md:col-span-1 md:row-span-2",
    },
    {
        title: "Secure Payments",
        description: "Crypto & Fiat integrated gateway.",
        icon: Shield,
        className: "md:col-span-2 md:row-span-1",
    },
];

export function Features() {
    return (
        <section className="container mx-auto px-6 py-24 md:px-12 md:py-32" id="features">
            <div className="mb-20 max-w-2xl">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl"
                >
                    Everything you need.
                    <span className="text-muted-foreground block mt-2">Nothing you don&apos;t.</span>
                </motion.h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-3 md:gap-6 h-auto md:h-[800px]">
                {features.map((feature, i) => (
                    <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className={cn(
                            "group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/50 bg-secondary/20 p-8 backdrop-blur-sm transition-all hover:bg-secondary/40",
                            feature.className
                        )}
                    >
                        <div>
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-2xl font-medium">{feature.title}</h3>
                            <p className="mt-2 text-muted-foreground">{feature.description}</p>
                        </div>

                        <div className="absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 blur-3xl transition-all group-hover:scale-150" />
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
