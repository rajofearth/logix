"use client";

import { useEffect, useRef } from "react";

export function Grain() {
    return (
        <div className="pointer-events-none fixed inset-0 z-[9999] opacity-[0.03] mix-blend-overlay">
            <svg className="h-full w-full">
                <filter id="noiseFilter">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.8"
                        numOctaves="3"
                        stitchTiles="stitch"
                    />
                </filter>
                <rect width="100%" height="100%" filter="url(#noiseFilter)" />
            </svg>
        </div>
    );
}
