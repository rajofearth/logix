import type { Product, ProductCategory, Warehouse, GoodsType, RouteType, LogisticsData, MLPredictionRequest } from "@/app/dashboard/warehouse/_components/types";

// State code mapping from city/address to state codes
const CITY_TO_STATE: Record<string, string> = {
    // Major cities to state codes
    mumbai: "MH",
    pune: "MH",
    nagpur: "MH",
    delhi: "DL",
    gurgaon: "HR",
    noida: "UP",
    bangalore: "KA",
    chennai: "TN",
    hyderabad: "TG",
    kolkata: "WB",
    ahmedabad: "GJ",
    surat: "GJ",
    jaipur: "RJ",
    lucknow: "UP",
    kanpur: "UP",
    chandigarh: "CH",
    bhopal: "MP",
    indore: "MP",
    patna: "BR",
    bhubaneswar: "OR",
    coimbatore: "TN",
    kochi: "KL",
    trivandrum: "KL",
    guwahati: "AS",
    ranchi: "JH",
    raipur: "CH",
    amritsar: "PB",
    ludhiana: "PB",
    dehradun: "UT",
};

// Extract state code from warehouse city/address
export function extractStateFromWarehouse(warehouse: Warehouse): string {
    const cityLower = warehouse.city.toLowerCase();
    const addressLower = warehouse.address.toLowerCase();

    // Check city first
    for (const [city, state] of Object.entries(CITY_TO_STATE)) {
        if (cityLower.includes(city)) {
            return state;
        }
    }

    // Check address
    for (const [city, state] of Object.entries(CITY_TO_STATE)) {
        if (addressLower.includes(city)) {
            return state;
        }
    }

    // Default to Maharashtra if not found
    return "MH";
}

// Map product category to ML goods type
export function mapProductCategoryToGoodsType(category: ProductCategory): GoodsType {
    const mapping: Record<ProductCategory, GoodsType> = {
        electronics: "gold", // High-value items
        food: "wheat", // Agricultural/commodity
        apparel: "silver", // Medium-value items
        pharmaceuticals: "oil", // Liquid/chemical goods
        machinery: "gold", // High-value equipment
        "raw-materials": "wheat", // Commodity
        packaging: "wheat", // Commodity
        other: "wheat", // Default to commodity
    };

    return mapping[category] || "wheat";
}

// Calculate logistics cost estimate based on product value and weight
function estimateLogisticsCost(initialValue: number, weightKg: number, routeDistance: number): number {
    // Base cost calculation: 0.3% of value + distance-based + weight-based
    const valueBased = initialValue * 0.003;
    const distanceBased = (routeDistance / 1000) * 5; // 5 INR per km
    const weightBased = weightKg * 10; // 10 INR per kg

    return Math.max(valueBased, distanceBased + weightBased);
}

// Map product and logistics data to ML API request format
export function mapProductToMLRequest(
    product: Product,
    logisticsData: LogisticsData,
    warehouse?: Warehouse
): MLPredictionRequest {
    const goodsType = mapProductCategoryToGoodsType(product.category);
    const originState = warehouse ? extractStateFromWarehouse(warehouse) : logisticsData.originState;
    const destState = logisticsData.destState;
    const isInterstate = originState !== destState;

    // Calculate total product value
    const initialGoodsValue = product.currentPrice * product.quantity;

    // Estimate package weight if not provided (use quantity as proxy)
    const packageWeightKg = logisticsData.packageWeightKg || Math.max(1, product.quantity * 0.1);

    // Estimate logistics cost
    const logisticsTotalAmount = estimateLogisticsCost(
        initialGoodsValue,
        packageWeightKg,
        logisticsData.routeDistance
    );

    // Get current date/time for defaults
    const now = new Date();
    const pickupHour = logisticsData.pickupHour ?? now.getHours();
    const dayOfWeek = logisticsData.dayOfWeek ?? now.getDay();
    const pickupMonth = logisticsData.pickupMonth ?? now.getMonth() + 1;

    // Use estimated duration if actual not provided
    const actualTransitHours = logisticsData.actualTransitHours ?? logisticsData.estimatedDurationHours;
    const delayHours = logisticsData.delayHours ?? 0;

    return {
        goodsType,
        routeDistance: logisticsData.routeDistance,
        packageWeightKg,
        routeType: logisticsData.routeType,
        pickupHour,
        dayOfWeek,
        originState,
        destState,
        isInterstate,
        estimatedDurationHours: logisticsData.estimatedDurationHours,
        initialGoodsValue,
        logisticsTotalAmount,
        pickupMonth,
        actualTransitHours,
        delayHours,
    };
}
