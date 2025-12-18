"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import translationsData from "./i18n/translations.json";

export type Language = "en" | "hi" | "mr";

type Translations = typeof translationsData.en;
export type TranslationKey = keyof Translations;

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey) => string;
}

const translations = translationsData as Record<Language, Translations>;

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>("en");

    // Initialize language from localStorage or browser settings
    React.useEffect(() => {
        const savedLang = localStorage.getItem("preferredLanguage") as Language | null;
        if (savedLang && (savedLang === "en" || savedLang === "hi" || savedLang === "mr")) {
            setLanguageState(savedLang);
            return;
        }

        // 1. Check browser languages (highest intent)
        const browserLangs = navigator.languages || [navigator.language];
        for (const lang of browserLangs) {
            const shortLang = lang.split("-")[0];
            if (shortLang === "hi") {
                setLanguageState("hi");
                return;
            }
            if (shortLang === "mr") {
                setLanguageState("mr");
                return;
            }
        }

        // 2. Check region via TimeZone (if no specific language intent)
        try {
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (timeZone.includes("Kolkata") || timeZone.includes("Calcutta") || timeZone.includes("India")) {
                // For India, default to Hindi as a reasonable starting point for local content
                setLanguageState("hi");
                return;
            }
        } catch (e) {
            console.error("Failed to detect region via TimeZone:", e);
        }

        // 3. Last fallback (English browser setting or default)
        for (const lang of browserLangs) {
            const shortLang = lang.split("-")[0];
            if (shortLang === "en") {
                setLanguageState("en");
                return;
            }
        }
    }, []);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("preferredLanguage", lang);
    }, []);

    const t = useCallback((key: TranslationKey): string => {
        return translations[language][key] || key;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
