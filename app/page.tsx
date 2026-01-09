import { Grain } from "@/components/ui/grain";
import { LandingNav } from "@/components/sections/LandingNav";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { Features } from "@/components/sections/Features";
import { Footer } from "@/components/sections/Footer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";

export default function Page() {
    return (
        <SmoothScroll>
            <main className="min-h-screen w-full bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
                <Grain />
                <LandingNav />
                <Hero />
                <Marquee />
                <Features />
                <Footer />
            </main>
        </SmoothScroll>
    );
}