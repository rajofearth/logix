import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { TruckDisplay } from "@/components/sections/TruckDisplay";
import { Features } from "@/components/sections/Features";
import { Results } from "@/components/sections/Results";
import { Solutions } from "@/components/sections/Solutions";
import { News } from "@/components/sections/News";

export default function Page() {
    return (
        <main className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
            <Navbar />
            <Hero />
            <TruckDisplay />
            <Solutions />
            <Features />
            <Results />
            <News />
        </main>
    );
}