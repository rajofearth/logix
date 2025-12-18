import Image from "next/image";

export function Results() {
    return (
        <section className="bg-white py-24 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Results that speak<br />for themselves.
                    </h2>
                    <p className="text-black/60">
                        Learn how we help companies around the world.
                    </p>
                </div>

                <div className="bg-[#fcfcfc] border border-gray-100 rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden">
                    <div className="max-w-3xl relative z-10">
                        <h3 className="text-2xl md:text-3xl font-semibold leading-snug mb-8">
                            Since implementing the telematics system from{" "}
                            <span className="text-[#22c55e]">Logix</span>, our fleet has reached
                            an entirely new level of efficiency.{" "}
                            <span className="bg-black text-white px-2 py-0.5">
                                Over six months, we have reduced costs by 27%.
                            </span>
                        </h3>

                        <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden">
                                <Image
                                    src="/avatar.png"
                                    alt="James Anderson"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <p className="font-bold text-sm">James Anderson</p>
                                <p className="text-xs text-black/40">
                                    Chief Operating Officer, Scan Global Logistics
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Graph Section */}
                    <div className="mt-16 relative h-48 md:h-64 w-full">
                        <svg
                            viewBox="0 0 1000 200"
                            className="w-full h-full overflow-visible"
                            preserveAspectRatio="none"
                        >
                            {/* Grid Lines */}
                            <line x1="0" y1="150" x2="1000" y2="150" stroke="#f0f0f0" strokeWidth="1" />
                            <line x1="250" y1="0" x2="250" y2="200" stroke="#f0f0f0" strokeWidth="1" strokeDasharray="4" />
                            <line x1="500" y1="0" x2="500" y2="200" stroke="#f0f0f0" strokeWidth="1" strokeDasharray="4" />
                            <line x1="750" y1="0" x2="750" y2="200" stroke="#f0f0f0" strokeWidth="1" strokeDasharray="4" />

                            {/* Curve */}
                            <path
                                d="M 0 50 C 250 50, 450 50, 600 130 C 750 210, 900 150, 1000 150"
                                fill="none"
                                stroke="#22c55e"
                                strokeWidth="2"
                            />

                            {/* Indicators */}
                            <circle cx="250" cy="50" r="6" fill="#22c55e" />
                            <circle cx="250" cy="50" r="12" stroke="#22c55e" strokeOpacity="0.2" strokeWidth="8" fill="none" />

                            {/* Labels */}
                            <text x="0" y="190" className="text-[10px] fill-gray-300 font-medium">March</text>
                            <text x="250" y="190" className="text-[10px] fill-gray-300 font-medium text-center" textAnchor="middle">May</text>
                            <text x="500" y="190" className="text-[10px] fill-gray-300 font-medium text-center" textAnchor="middle">Jul</text>
                            <text x="750" y="190" className="text-[10px] fill-gray-300 font-medium text-center" textAnchor="middle">Sep</text>

                            <text x="960" y="20" className="text-[12px] fill-gray-300 font-bold" textAnchor="end">100%</text>
                            <text x="960" y="140" className="text-[12px] fill-[#22c55e] font-bold" textAnchor="end">73%</text>
                        </svg>
                    </div>
                </div>
            </div>
        </section>
    );
}
