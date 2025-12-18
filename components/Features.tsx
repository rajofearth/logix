export function Features() {
    const features = [
        {
            badge: "Time saving",
            stat: "20%",
            substat: "less mundanity",
            description: "Process automation frees you to focus on other tasks.",
        },
        {
            badge: "Safety",
            stat: "50%",
            substat: "fewer accidents.",
            description: "Analyzing driving behavior improves road safety.",
        },
        {
            badge: "Improving efficiency",
            stat: "30%",
            substat: "reduction in fuel costs.",
            description: "Route optimization saves up to a third on fuel.",
        },
    ];

    return (
        <section className="bg-white py-24 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Useful for business.
                    </h2>
                    <p className="text-black/60 max-w-xl mx-auto">
                        Our technologies enhance business efficiency and driver safety.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white border border-gray-100 rounded-[2rem] p-10 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <span className="inline-block bg-gray-50 text-black/40 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-10">
                                {feature.badge}
                            </span>
                            <div className="mb-6">
                                <div className="text-5xl font-bold mb-2">{feature.stat}</div>
                                <div className="text-xl font-bold leading-tight">
                                    {feature.substat}
                                </div>
                            </div>
                            <p className="text-black/40 text-sm leading-relaxed max-w-[200px]">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
