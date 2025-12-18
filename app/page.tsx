import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { TruckDisplay } from "@/components/TruckDisplay";
import { Features } from "@/components/Features";
import { Results } from "@/components/Results";
import { Solutions } from "@/components/Solutions";
import { News } from "@/components/News";

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