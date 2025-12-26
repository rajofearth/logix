"use client";

import { SolutionLink } from "@/components/shared/SolutionLink";
import { useLanguage } from "@/lib/LanguageContext";

export function Solutions() {
    const { t } = useLanguage();

    return (
        <section className="bg-background py-24 px-4 overflow-visible">
            <div className="max-w-4xl mx-auto">
                <div className="text-left text-3xl md:text-4xl font-semibold leading-[1.4] text-foreground">
                    {t("solutionsHeadline")}{" "}
                    <SolutionLink
                        image="/images/tracking-preview.png"
                        description={t("solutionsTrackingDesc")}
                    >
                        {t("vehicleTracking").toLowerCase()}
                    </SolutionLink>
                    {t("solutionsFor")}
                    {t("solutionsRealTimeUpdates")}
                    {t("solutionsAndToolsLike")}{" "}
                    <SolutionLink
                        image="/images/maintenance-preview.png"
                        description={t("solutionsMaintenanceDesc")}
                    >
                        {t("predictiveMaintenance").toLowerCase()}
                    </SolutionLink>
                    {t("solutionsToPreventBreakdowns")}
                    {t("solutionsStreamlineOperations")}
                    <SolutionLink
                        image="/images/workforce-preview.png"
                        description={t("solutionsWorkforceDesc")}
                    >
                        {t("workforceManagement").toLowerCase()}
                    </SolutionLink>
                    {t("solutionsAndEnsure")}{" "}
                    <SolutionLink
                        image="/images/maintenance-preview.png"
                        description={t("solutionsComplianceDesc")}
                    >
                        {t("regulatoryCompliance").toLowerCase()}
                    </SolutionLink>
                    {t("solutionsAndDriverSafety")}
                    {t("solutionsAdditionallySupport")}{" "}
                    <SolutionLink
                        image="/images/tracking-preview.png"
                        description={t("solutionsSustainabilityDesc")}
                    >
                        {t("solutionsSustainabilityEfforts")}
                    </SolutionLink>
                    {t("solutionsAndConnective")}{" "}
                    <SolutionLink
                        image="/images/tracking-preview.png"
                        description={t("solutionsEVDesc")}
                    >
                        {t("solutionsEVIntegration")}
                    </SolutionLink>
                    {t("solutionsOptimizingCosts")}
                    <SolutionLink
                        image="/images/workforce-preview.png"
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
