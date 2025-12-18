"use client";

import Link from "next/link";
import { ChevronDown, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage, Language } from "@/lib/LanguageContext";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", flag: "🇮🇳" },
] as const;

export function Navbar() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
      {/* Left Links */}
      <div className="flex items-center gap-8 flex-1">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-black/60 transition-colors outline-none group">
            {t("solutions")} <ChevronDown className="w-4 h-4 group-data-[state=open]:rotate-180 transition-transform duration-200" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-200" sideOffset={12}>
            <div className="px-3 py-2 text-[10px] font-bold text-black/40 uppercase tracking-widest mb-1">Services</div>
            <DropdownMenuItem className="rounded-xl px-3 py-2.5 focus:bg-black/5 cursor-pointer transition-colors">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">{t("vehicleTracking")}</span>
                <span className="text-xs text-black/40">Real-time GPS monitoring</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl px-3 py-2.5 focus:bg-black/5 cursor-pointer transition-colors">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">{t("predictiveMaintenance")}</span>
                <span className="text-xs text-black/40">AI-driven repair alerts</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl px-3 py-2.5 focus:bg-black/5 cursor-pointer transition-colors">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">{t("workforceManagement")}</span>
                <span className="text-xs text-black/40">Optimize driver schedules</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl px-3 py-2.5 focus:bg-black/5 cursor-pointer transition-colors">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">{t("regulatoryCompliance")}</span>
                <span className="text-xs text-black/40">Stay ahead of standards</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-black/60 transition-colors outline-none group">
            {t("products")} <ChevronDown className="w-4 h-4 group-data-[state=open]:rotate-180 transition-transform duration-200" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-200" sideOffset={12}>
            <div className="px-3 py-2 text-[10px] font-bold text-black/40 uppercase tracking-widest mb-1">Hardware</div>
            <DropdownMenuItem className="rounded-xl px-3 py-2.5 focus:bg-black/5 cursor-pointer transition-colors font-medium text-sm">
              {t("gpsTracker")}
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl px-3 py-2.5 focus:bg-black/5 cursor-pointer transition-colors font-medium text-sm">
              {t("dashCam")}
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl px-3 py-2.5 focus:bg-black/5 cursor-pointer transition-colors font-medium text-sm">
              {t("assetTag")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Link href="#" className="text-sm font-medium hover:text-black/60 transition-colors">
          {t("about")}
        </Link>
      </div>

      {/* Logo */}
      <div className="flex flex-col items-center">
        <div className="flex flex-col items-center -space-y-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-1">
            <path d="M4 4H10V10H4V4ZM14 4H20V10H14V4ZM4 14H10V20H4V14ZM14 14H20V20H14V14Z" fill="black" />
          </svg>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Logix</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6 flex-1 justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 text-sm font-medium hover:text-black/60 transition-colors outline-none group bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <Globe className="w-3.5 h-3.5 text-black/40" />
            <span className="uppercase">{language}</span>
            <ChevronDown className="w-3.5 h-3.5 group-data-[state=open]:rotate-180 transition-transform duration-200" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-200" sideOffset={12}>
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setLanguage(lang.code as Language)}
                className={`rounded-xl px-3 py-1.5 cursor-pointer transition-colors flex items-center justify-between ${language === lang.code ? 'bg-black/5 font-semibold' : 'focus:bg-black/5'}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs">{lang.flag}</span>
                  <span className="text-sm">{lang.name}</span>
                </div>
                {language === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <button className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-black/80 transition-75">
          {t("demo")}
        </button>
      </div>
    </nav>
  );
}
