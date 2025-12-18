"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/LanguageContext";

export function News() {
    const { t } = useLanguage();

    const newsItems = [
        {
            image: "/news-van.png",
            title: t("newsItem1Title"),
            description: t("newsItem1Desc"),
            date: "Dec 24",
        },
        {
            image: "/news-ev.png",
            title: t("newsItem2Title"),
            description: t("newsItem2Desc"),
            date: "Dec 17",
        },
        {
            image: "/news-truck.png",
            title: t("newsItem3Title"),
            description: t("newsItem3Desc"),
            date: "Dec 14",
        },
    ];

    return (
        <section className="bg-white py-24 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        {t("newsTitle")}
                    </h2>
                    <p className="text-black/60 mx-auto max-w-lg">
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
                            <h3 className="text-xl font-bold leading-tight mb-3 group-hover:text-black/70 transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-black/40 text-sm mb-6 flex-grow">
                                {item.description}
                            </p>
                            <div className="text-black/20 text-xs font-bold uppercase tracking-wider">
                                {item.date}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-center gap-4">
                    <button className="bg-black text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-black/80 transition-colors">
                        {t("newsSubscribe")}
                    </button>
                    <button className="bg-gray-100 text-black px-8 py-3 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors">
                        {t("newsShowAll")}
                    </button>
                </div>
            </div>
        </section>
    );
}
