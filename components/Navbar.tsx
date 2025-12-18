import Link from "next/link";
import { ChevronDown } from "lucide-react";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
      {/* Left Links */}
      <div className="flex items-center gap-8 flex-1">
        <Link href="#" className="flex items-center gap-1 text-sm font-medium hover:text-black/60 transition-colors">
          Solutions <ChevronDown className="w-4 h-4" />
        </Link>
        <Link href="#" className="flex items-center gap-1 text-sm font-medium hover:text-black/60 transition-colors">
          Products <ChevronDown className="w-4 h-4" />
        </Link>
        <Link href="#" className="text-sm font-medium hover:text-black/60 transition-colors">
          About
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
        <Link href="#" className="flex items-center gap-1 text-sm font-medium hover:text-black/60 transition-colors">
          En <ChevronDown className="w-4 h-4" />
        </Link>
        <button className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-black/80 transition-75">
          Get a Demo
        </button>
      </div>
    </nav>
  );
}
