import { SolutionLink } from "./SolutionLink";

export function Solutions() {
    return (
        <section className="bg-white py-24 px-4 overflow-visible">
            <div className="max-w-4xl mx-auto">
                <div className="text-left text-3xl md:text-4xl font-semibold leading-[1.4] text-black">
                    Our fleet management solutions include{" "}
                    <SolutionLink
                        image="/tracking-preview.png"
                        description="Track your trucks, vans, cars, trailers and assets with GPS tracking."
                    >
                        vehicle tracking
                    </SolutionLink>{" "}
                    for real-time updates and tools like{" "}
                    <SolutionLink
                        image="/maintenance-preview.png"
                        description="Optimize vehicle uptime with data-driven maintenance schedules."
                    >
                        predictive maintenance
                    </SolutionLink>{" "}
                    to prevent breakdowns. We help streamline operations with{" "}
                    <SolutionLink
                        image="/workforce-preview.png"
                        description="Manage your team efficiently with intelligent scheduling tools."
                    >
                        workforce management
                    </SolutionLink>{" "}
                    and ensure{" "}
                    <SolutionLink
                        image="/maintenance-preview.png"
                        description="Stay ahead of industry standards with automated compliance reporting."
                    >
                        regulatory compliance
                    </SolutionLink>{" "}
                    and driver safety. Additionally, we support{" "}
                    <SolutionLink
                        image="/tracking-preview.png"
                        description="Incentivize safe driving habits with detailed performance analytics."
                    >
                        sustainability efforts
                    </SolutionLink>{" "}
                    and{" "}
                    <SolutionLink
                        image="/tracking-preview.png"
                        description="Transition smoothly to electric fleets with range and charging data."
                    >
                        EV integration
                    </SolutionLink>
                    , optimizing costs through efficient{" "}
                    <SolutionLink
                        image="/workforce-preview.png"
                        description="Reduce administrative overhead with integrated business tools."
                    >
                        business administration
                    </SolutionLink>
                    .
                </div>
            </div>
        </section>
    );
}
