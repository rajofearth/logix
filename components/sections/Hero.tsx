"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";

export function Hero() {
    const { t } = useLanguage();

    const title = t("heroTitle");
    const titleParts = title.split(' ');
    const titleFirstLine = titleParts.slice(0, 3).join(' ');
    const titleSecondLine = titleParts.slice(3).join(' ');

    return (
        <div className="flex flex-col items-center text-center px-4 pt-20 pb-16 max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[0.9]">
                {titleFirstLine}<br />{titleSecondLine}
            </h1>
            <p className="text-lg md:text-xl text-black/60 max-w-2xl leading-relaxed">
                {t("heroSubtitle")}
            </p>
            <div className="mt-8">
                <Button className="rounded-full px-8 py-6 text-base">
                    {t("demo")}
                </Button>
            </div>
        </div>
    );
}
