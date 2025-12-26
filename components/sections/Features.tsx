"use client";

import { useLanguage } from "@/lib/LanguageContext";

export function Features() {
    const { t } = useLanguage();

    const features = [
        {
            badge: t("featureTimeSaving"),
            stat: "20%",
            substat: t("featureLessMundanity"),
            description: t("featureTimeSavingDesc"),
        },
        {
            badge: t("featureSafety"),
            stat: "50%",
            substat: t("featureFewerAccidents"),
            description: t("featureSafetyDesc"),
        },
        {
            badge: t("featureEfficiency"),
            stat: "30%",
            substat: t("featureFuelReduction"),
            description: t("featureEfficiencyDesc"),
        },
    ];

    return (
        <section className="bg-background py-24 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
                        {t("featuresTitle")}
                    </h2>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        {t("featuresSubtitle")}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-card border border-border rounded-[2rem] p-10 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <span className="inline-block bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-10">
                                {feature.badge}
                            </span>
                            <div className="mb-6">
                                <div className="text-5xl font-bold mb-2 text-foreground">{feature.stat}</div>
                                <div className="text-xl font-bold leading-tight text-foreground">
                                    {feature.substat}
                                </div>
                            </div>
                            <p className="text-muted-foreground text-sm leading-relaxed max-w-[200px]">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
