export const GST_CONFIG = {
    STANDARD_RATE: 18,
    HSN_LOGISTICS: "9965",
    CURRENCY: "INR",
    FINANCIAL_YEAR_START_MONTH: 3, // April (0-indexed)
};

export const STATE_CODES: Record<string, string> = {
    "1": "Jammu & Kashmir", "2": "Himachal Pradesh", "3": "Punjab", "4": "Chandigarh",
    "5": "Uttarakhand", "6": "Haryana", "7": "Delhi", "8": "Rajasthan", "9": "Uttar Pradesh",
    "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh", "13": "Nagaland",
    "14": "Manipur", "15": "Mizoram", "16": "Tripura", "17": "Meghalaya", "18": "Assam",
    "19": "West Bengal", "20": "Jharkhand", "21": "Odisha", "22": "Chhattisgarh",
    "23": "Madhya Pradesh", "24": "Gujarat", "25": "Daman & Diu", "26": "Dadra & Nagar Haveli",
    "27": "Maharashtra", "29": "Karnataka", "30": "Goa", "31": "Lakshadweep",
    "32": "Kerala", "33": "Tamil Nadu", "34": "Puducherry", "35": "Andaman & Nicobar Islands",
    "36": "Telangana", "37": "Andhra Pradesh", "38": "Ladakh"
};

export function getFinancialYear(date: Date = new Date()): string {
    const month = date.getMonth();
    const year = date.getFullYear();
    const startYear = month >= GST_CONFIG.FINANCIAL_YEAR_START_MONTH ? year : year - 1;
    const endYear = startYear + 1;
    return `${startYear}-${endYear.toString().slice(-2)}`;
}

export function isInterState(supplierGstin: string | null, buyerGstin: string | null, _placeOfSupply: string): boolean {
    if (!supplierGstin || !buyerGstin) return true; // Default to IGST if unsure
    const supplierStateCode = supplierGstin.slice(0, 2);
    const buyerStateCode = buyerGstin.slice(0, 2);

    // Simplification: use GSTIN state codes to determine intra/inter
    return supplierStateCode !== buyerStateCode;
}
