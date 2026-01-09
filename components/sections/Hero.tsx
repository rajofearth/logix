"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

export function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <section
            ref={containerRef}
            className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-32 md:pt-40"
        >
            <motion.div
                style={{ y, opacity }}
                className="container relative z-10 mx-auto flex flex-col items-center px-6 text-center"
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/50 px-4 py-1.5 backdrop-blur-md"
                >
                    <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        v2.0 Now Live
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-4xl text-5xl font-semibold tracking-tight sm:text-7xl md:text-8xl lg:text-9xl text-balance"
                >
                    Logistics
                    <br />
                    <span className="text-muted-foreground">Reimagined.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-8 max-w-2xl text-lg text-muted-foreground sm:text-xl md:text-2xl text-balance"
                >
                    The complete operating system for modern fleets. AI-driven tracking, automated billing, and warehouse intelligence in one beautiful platform.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-10 flex flex-wrap items-center justify-center gap-4"
                >
                    <Button
                        size="lg"
                        className="group h-12 rounded-full px-8 text-base shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_60px_-10px_rgba(0,0,0,0.4)] dark:shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)]"
                    >
                        Start free trial
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="group h-12 rounded-full px-8 text-base backdrop-blur-sm transition-all hover:bg-secondary/50"
                    >
                        <Play className="mr-2 h-4 w-4 fill-current transition-transform group-hover:scale-110" />
                        Watch demo
                    </Button>
                </motion.div>
            </motion.div>

            {/* Abstract Background Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute -left-[10%] top-[20%] h-[40rem] w-[40rem] rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 opacity-30 blur-[100px]" />
                <div className="absolute -right-[10%] top-[40%] h-[30rem] w-[30rem] rounded-full bg-gradient-to-l from-blue-500/10 to-pink-500/10 opacity-30 blur-[100px]" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-20" />
        </section>
    );
}
