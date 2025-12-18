"use client";

import { SolutionLink } from "./SolutionLink";
import { useLanguage } from "@/lib/LanguageContext";

export function Solutions() {
    const { t } = useLanguage();

    return (
        <section className="bg-white py-24 px-4 overflow-visible">
            <div className="max-w-4xl mx-auto">
                <div className="text-left text-3xl md:text-4xl font-semibold leading-[1.4] text-black">
                    {t("solutionsHeadline")}{" "}
                    <SolutionLink
                        image="/tracking-preview.png"
                        description={t("solutionsTrackingDesc")}
                    >
                        {t("vehicleTracking").toLowerCase()}
                    </SolutionLink>{" "}
                    for {t("en") === "en" ? "real-time updates" : "रिअल-टाइम अपडेट"} and tools like{" "}
                    <SolutionLink
                        image="/maintenance-preview.png"
                        description={t("solutionsMaintenanceDesc")}
                    >
                        {t("predictiveMaintenance").toLowerCase()}
                    </SolutionLink>{" "}
                    to prevent breakdowns. We help streamline operations with{" "}
                    <SolutionLink
                        image="/workforce-preview.png"
                        description={t("solutionsWorkforceDesc")}
                    >
                        {t("workforceManagement").toLowerCase()}
                    </SolutionLink>{" "}
                    and ensure{" "}
                    <SolutionLink
                        image="/maintenance-preview.png"
                        description={t("solutionsComplianceDesc")}
                    >
                        {t("regulatoryCompliance").toLowerCase()}
                    </SolutionLink>{" "}
                    and driver safety. Additionally, we support{" "}
                    <SolutionLink
                        image="/tracking-preview.png"
                        description={t("solutionsSustainabilityDesc")}
                    >
                        {t("solutionsSustainabilityEfforts")}
                    </SolutionLink>{" "}
                    and{" "}
                    <SolutionLink
                        image="/tracking-preview.png"
                        description={t("solutionsEVDesc")}
                    >
                        {t("solutionsEVIntegration")}
                    </SolutionLink>
                    , optimizing costs through efficient{" "}
                    <SolutionLink
                        image="/workforce-preview.png"
                        description={t("solutionsBusinessDesc")}
                    >
                        {t("solutionsBusinessAdmin")}
                    </SolutionLink>
                    .
                </div>
            </div>
        </section>
    );
}
