"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/LanguageContext";

export function News() {
    const { t } = useLanguage();

    const newsItems = [
        {
            image: "/images/news-van.png",
            title: t("newsItem1Title"),
            description: t("newsItem1Desc"),
            date: "Dec 24",
        },
        {
            image: "/images/news-ev.png",
            title: t("newsItem2Title"),
            description: t("newsItem2Desc"),
            date: "Dec 17",
        },
        {
            image: "/images/news-truck.png",
            title: t("newsItem3Title"),
            description: t("newsItem3Desc"),
            date: "Dec 14",
        },
    ];

    return (
        <section
            className="py-24 px-4"
            style={{ backgroundColor: "var(--color-background)" }}
        >
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2
                        className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
                        style={{ color: "var(--color-foreground)" }}
                    >
                        {t("newsTitle")}
                    </h2>
                    <p
                        className="mx-auto max-w-lg"
                        style={{ color: "var(--color-muted-foreground)" }}
                    >
                        {t("newsSubtitle")}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {newsItems.map((item, index) => (
                        <div key={index} className="flex flex-col group cursor-pointer">
                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl mb-6">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                            <h3
                                className="text-xl font-bold leading-tight mb-3 group-hover:opacity-80 transition-colors"
                                style={{ color: "var(--color-foreground)" }}
                            >
                                {item.title}
                            </h3>
                            <p
                                className="text-sm mb-6 flex-grow"
                                style={{ color: "var(--color-muted-foreground)" }}
                            >
                                {item.description}
                            </p>
                            <div
                                className="text-xs font-bold uppercase tracking-wider"
                                style={{ color: "var(--color-border)" }}
                            >
                                {item.date}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-center gap-4">
                    <button
                        className="px-8 py-3 rounded-full text-sm font-bold transition-colors"
                        style={{
                            backgroundColor: "var(--color-primary)",
                            color: "var(--color-primary-foreground)",
                        }}
                    >
                        {t("newsSubscribe")}
                    </button>
                    <button
                        className="px-8 py-3 rounded-full text-sm font-bold transition-colors"
                        style={{
                            backgroundColor: "var(--color-muted)",
                            color: "var(--color-foreground)",
                        }}
                    >
                        {t("newsShowAll")}
                    </button>
                </div>
            </div>
        </section>
    );
}
