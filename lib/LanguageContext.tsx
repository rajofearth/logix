"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "hi" | "mr";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    en: {
        // Navbar
        solutions: "Solutions",
        products: "Products",
        about: "About",
        demo: "Get a Demo",
        vehicleTracking: "Vehicle Tracking",
        predictiveMaintenance: "Predictive Maintenance",
        workforceManagement: "Workforce Management",
        regulatoryCompliance: "Regulatory Compliance",
        gpsTracker: "GPS Tracker X1",
        dashCam: "Dash Cam Pro",
        assetTag: "Asset Tag",
        // Hero
        heroTitle: "Control your fleet like never before.",
        heroSubtitle: "Real-time tracking, advanced analytics, and seamless management - all in one powerful platform.",
        // Solutions Section
        solutionsHeadline: "Our fleet management solutions include",
        solutionsTrackingDesc: "Track your trucks, vans, cars, trailers and assets with GPS tracking.",
        solutionsMaintenanceDesc: "Optimize vehicle uptime with data-driven maintenance schedules.",
        solutionsWorkforceDesc: "Manage your team efficiently with intelligent scheduling tools.",
        solutionsComplianceDesc: "Stay ahead of industry standards with automated compliance reporting.",
        solutionsSustainabilityEfforts: "sustainability efforts",
        solutionsSustainabilityDesc: "Incentivize safe driving habits with detailed performance analytics.",
        solutionsEVIntegration: "EV integration",
        solutionsEVDesc: "Transition smoothly to electric fleets with range and charging data.",
        solutionsBusinessAdmin: "business administration",
        solutionsBusinessDesc: "Reduce administrative overhead with integrated business tools.",
        // Features Section
        featuresTitle: "Useful for business.",
        featuresSubtitle: "Our technologies enhance business efficiency and driver safety.",
        featureTimeSaving: "Time saving",
        featureTimeSavingDesc: "Process automation frees you to focus on other tasks.",
        featureLessMundanity: "less mundanity",
        featureSafety: "Safety",
        featureSafetyDesc: "Analyzing driving behavior improves road safety.",
        featureFewerAccidents: "fewer accidents.",
        featureEfficiency: "Improving efficiency",
        featureEfficiencyDesc: "Route optimization saves up to a third on fuel.",
        featureFuelReduction: "reduction in fuel costs.",
        // Results Section
        resultsTitle: "Results that speak for themselves.",
        resultsSubtitle: "Learn how we help companies around the world.",
        resultsQuote: "Since implementing the telematics system from Logix, our fleet has reached an entirely new level of efficiency.",
        resultsSavings: "Over six months, we have reduced costs by 27%.",
        resultsCostIndex: "Operational Cost Index",
        // News Section
        newsTitle: "News and updates.",
        newsSubtitle: "Stay up-to-date with the latest developments and innovations in fleet management.",
        newsItem1Title: "Integration with SAP is now complete and fully operational.",
        newsItem1Desc: "Users can now integrate Logix with SAP for comprehensive financial and...",
        newsItem2Title: "Logix supports electric vehicles and fleet tools.",
        newsItem2Desc: "We've added tools for managing EV fleets, including battery level monito...",
        newsItem3Title: "Big data technology: The future of fleet optimization.",
        newsItem3Desc: "Real-time data analysis unlocks new opportunities for cost reduction and...",
        newsSubscribe: "Subscribe",
        newsShowAll: "Show All",
    },
    hi: {
        // Navbar
        solutions: "समाधान",
        products: "उत्पाद",
        about: "हमारे बारे में",
        demo: "डेमो प्राप्त करें",
        vehicleTracking: "वाहन ट्रैकिंग",
        predictiveMaintenance: "पूर्वानुमानित रखरखाव",
        workforceManagement: "कार्यबल प्रबंधन",
        regulatoryCompliance: "नियामक अनुपालन",
        gpsTracker: "जीपीएस ट्रैकर X1",
        dashCam: "डैश कैम प्रो",
        assetTag: "एसेट टैग",
        // Hero
        heroTitle: "अपने बेड़े को पहले की तरह नियंत्रित करें।",
        heroSubtitle: "रीयल-टाइम ट्रैकिंग, उन्नत विश्लेषण और सहज प्रबंधन - सब एक शक्तिशाली प्लेटफॉर्म में।",
        // Solutions Section
        solutionsHeadline: "हमारे बेड़े प्रबंधन समाधानों में शामिल हैं",
        solutionsTrackingDesc: "जीपीएस ट्रैकिंग के साथ अपने ट्रकों, वैन, कारों, ट्रेलरों और संपत्तियों को ट्रैक करें।",
        solutionsMaintenanceDesc: "डेटा-संचालित रखरखाव कार्यक्रमों के साथ वाहन के अपटाइम को अनुकूलित करें।",
        solutionsWorkforceDesc: "बुद्धिमान शेड्यूलिंग टूल के साथ अपनी टीम को कुशलतापूर्वक प्रबंधित करें।",
        solutionsComplianceDesc: "स्वचालित अनुपालन रिपोर्टिंग के साथ उद्योग मानकों से आगे रहें।",
        solutionsSustainabilityEfforts: "स्थायित्व प्रयास",
        solutionsSustainabilityDesc: "विस्तृत प्रदर्शन विश्लेषण के साथ सुरक्षित ड्राइविंग आदतों को प्रोत्साहित करें।",
        solutionsEVIntegration: "ईवी एकीकरण",
        solutionsEVDesc: "रेंज और चार्जिंग डेटा के साथ इलेक्ट्रिक बेड़े में सुचारू रूप से संक्रमण करें।",
        solutionsBusinessAdmin: "व्यावसायिक प्रशासन",
        solutionsBusinessDesc: "एकीकृत व्यावसायिक उपकरणों के साथ प्रशासनिक ओवरहेड को कम करें।",
        // Features Section
        featuresTitle: "व्यवसाय के लिए उपयोगी।",
        featuresSubtitle: "हमारी प्रौद्योगिकियां व्यावसायिक दक्षता और ड्राइवर सुरक्षा को बढ़ाती हैं।",
        featureTimeSaving: "समय की बचत",
        featureTimeSavingDesc: "प्रक्रिया स्वचालन आपको अन्य कार्यों पर ध्यान केंद्रित करने के लिए स्वतंत्र करता है।",
        featureLessMundanity: "कम नीरसता",
        featureSafety: "सुरक्षा",
        featureSafetyDesc: "ड्राइविंग व्यवहार का विश्लेषण सड़क सुरक्षा में सुधार करता है।",
        featureFewerAccidents: "कम दुर्घटनाएं।",
        featureEfficiency: "दक्षता में सुधार",
        featureEfficiencyDesc: "मार्ग अनुकूलन ईंधन पर एक तिहाई तक बचाता है।",
        featureFuelReduction: "ईंधन लागत में कमी।",
        // Results Section
        resultsTitle: "परिणाम जो खुद बोलते हैं।",
        resultsSubtitle: "जानें कि हम दुनिया भर की कंपनियों की कैसे मदद करते हैं।",
        resultsQuote: "Logix से टेलीमैटिक्स सिस्टम लागू करने के बाद से, हमारे बेड़े दक्षता के एक बिल्कुल नए स्तर पर पहुंच गए हैं।",
        resultsSavings: "छह महीनों में, हमने लागत में 27% की कमी की है।",
        resultsCostIndex: "परिचालन लागत सूचकांक",
        // News Section
        newsTitle: "समाचार और अपडेट।",
        newsSubtitle: "बेड़े प्रबंधन में नवीनतम घटनाओं और नवाचारों के साथ अपडेट रहें।",
        newsItem1Title: "SAP के साथ एकीकरण अब पूरा हो गया है और पूरी तरह कार्यात्मक है।",
        newsItem1Desc: "उपयोगकर्ता अब व्यापक वित्तीय के लिए SAP के साथ Logix को एकीकृत कर सकते हैं...",
        newsItem2Title: "Logix इलेक्ट्रिक वाहनों और बेड़े के उपकरणों का समर्थन करता है।",
        newsItem2Desc: "हमने EV बेड़े के प्रबंधन के लिए उपकरण जोड़े हैं, जिसमें बैटरी स्तर की निगरानी शामिल है...",
        newsItem3Title: "बिग डेटा तकनीक: बेड़े अनुकूलन का भविष्य।",
        newsItem3Desc: "रीयल-टाइम डेटा विश्लेषण लागत में कमी के लिए नए अवसर खोलता है...",
        newsSubscribe: "सब्सक्राइब करें",
        newsShowAll: "सभी दिखाएं",
    },
    mr: {
        // Navbar
        solutions: "उपाय",
        products: "उत्पादने",
        about: "आमच्याबद्दल",
        demo: "डेमो मिळवा",
        vehicleTracking: "वाहन ट्रॅकिंग",
        predictiveMaintenance: "अंदाज देखभाल",
        workforceManagement: "कार्यबल व्यवस्थापन",
        regulatoryCompliance: "नियामक पालन",
        gpsTracker: "जीपीएस ट्रॅकर X1",
        dashCam: "डॅश कॅम प्रो",
        assetTag: "एसेट टॅग",
        // Hero
        heroTitle: "तुमच्या ताफ्यावर पूर्वी कधीही नसेल इतके नियंत्रण ठेवा.",
        heroSubtitle: "रिअल-टाइम ट्रॅकिंग, प्रगत विश्लेषण आणि अखंड व्यवस्थापन - सर्व एका शक्तिशाली प्लॅटफॉर्ममध्ये.",
        // Solutions Section
        solutionsHeadline: "आमच्या ताफा व्यवस्थापन उपायांमध्ये समाविष्ट आहे",
        solutionsTrackingDesc: "जीपीएस ट्रॅकिंगसह तुमचे ट्रक, व्हॅन, कार, ट्रेलर आणि मालमत्तेचा मागोवा घ्या.",
        solutionsMaintenanceDesc: "डेटा-आधारित देखभाल वेळापत्रकांसह वाहन अपटाइम ऑप्टिमाइझ करा.",
        solutionsWorkforceDesc: "इंटेलिजेंट शेड्यूलिंग साधनांसह तुमची टीम कार्यक्षमतेने व्यवस्थापित करा.",
        solutionsComplianceDesc: "स्वयंचलित अनुपालन रिपोर्टिंगसह उद्योग मानकांच्या पुढे रहा.",
        solutionsSustainabilityEfforts: "शाश्वत प्रयत्न",
        solutionsSustainabilityDesc: "तपशीलवार कामगिरी विश्लेषणासह सुरक्षित ड्रायव्हिंग सवयींना प्रोत्साहित करा.",
        solutionsEVIntegration: "ईव्ही एकत्रीकरण",
        solutionsEVDesc: "रेंज आणि चार्जिंग डेटासह इलेक्ट्रिक ताफ्यांमध्ये सहजतेने संक्रमण करा.",
        solutionsBusinessAdmin: "व्यवसाय प्रशासन",
        solutionsBusinessDesc: "एकात्मिक व्यवसाय साधनांसह प्रशासकीय ओव्हरहेड कमी करा.",
        // Features Section
        featuresTitle: "व्यवसायासाठी उपयुक्त.",
        featuresSubtitle: "आमची तंत्रज्ञाने व्यवसाय कार्यक्षमतेत आणि ड्रायव्हर सुरक्षिततेत वाढ करतात.",
        featureTimeSaving: "वेळेची बचत",
        featureTimeSavingDesc: "प्रक्रिया ऑटोमेशन तुम्हाला इतर कामांवर लक्ष केंद्रित करण्यास मोकळे करते.",
        featureLessMundanity: "कमी कंटाळवाणेपणा",
        featureSafety: "सुरक्षा",
        featureSafetyDesc: "ड्रायव्हिंग वर्तनाचे विश्लेषण केल्याने रस्ता सुरक्षा सुधारते.",
        featureFewerAccidents: "कमी अपघात.",
        featureEfficiency: "कार्यक्षमता सुधारणे",
        featureEfficiencyDesc: "मार्ग ऑप्टिमायझेशन इंधनावर एक तृतीयांश पर्यंत बचत करते.",
        featureFuelReduction: "इंधन खर्चात घट.",
        // Results Section
        resultsTitle: "परिणाम जे स्वतःसाठी बोलतात.",
        resultsSubtitle: "आम्ही जगभरातील कंपन्यांना कशी मदत करतो ते जाणून घ्या.",
        resultsQuote: "Logix कडून टेलिमॅटिक्स सिस्टम लागू केल्यापासून, आमचा ताफा कार्यक्षमतेच्या पूर्णपणे नवीन स्तरावर पोहोचला आहे.",
        resultsSavings: "सहा महिन्यांत आम्ही खर्च २७% नी कमी केला आहे.",
        resultsCostIndex: "ऑपरेशनल कॉस्ट इंडेक्स",
        // News Section
        newsTitle: "बातमी आणि अपडेट्स.",
        newsSubtitle: "ताफा व्यवस्थापनातील नवीनतम घडामोडी आणि नवनवीन शोधांशी अद्ययावत रहा.",
        newsItem1Title: "SAP सोबतचे एकत्रीकरण आता पूर्ण झाले असून ते पूर्णपणे कार्यान्वित आहे.",
        newsItem1Desc: "वापरकर्ते आता सर्वसमावेशक फायनान्शिअलसाठी SAP सह Logix एकत्रित करू शकतात...",
        newsItem2Title: "Logix इलेक्ट्रिक वाहने आणि ताफा साधनांना सपोर्ट करते.",
        newsItem2Desc: "आम्ही EV ताफ्यांच्या व्यवस्थापनासाठी साधने जोडली आहेत, ज्यात बॅटरी लेव्हल मॉनिटरिंग समाविष्ट आहे...",
        newsItem3Title: "बिग डेटा तंत्रज्ञान: ताफा ऑप्टिमायझेशनचे भविष्य.",
        newsItem3Desc: "रिअल-टाइम डेटा विश्लेषण खर्च कमी करण्यासाठी नवीन संधी उघडते...",
        newsSubscribe: "सब्सक्राइब करा",
        newsShowAll: "सर्व दाखवा",
    },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>("en");

    const t = (key: string) => {
        return translations[language][key] || key;
    };

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
