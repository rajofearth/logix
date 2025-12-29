"use client";

import {
    Warehouse,
    Floor,
    Block,
    Product,
    ProductCategory,
    getBlockStatus,
    FloorStats,
} from "./types";

// Better seeded random number generator (xorshift128+) for higher entropy
function createSeededRandom(seed: number) {
    let s0 = seed ^ 0xDEADBEEF;
    let s1 = (seed * 1103515245 + 12345) ^ 0xCAFEBABE;

    return function () {
        let x = s0;
        const y = s1;
        s0 = y;
        x ^= x << 23;
        x ^= x >> 17;
        x ^= y ^ (y >> 26);
        s1 = x;
        return ((x + y) >>> 0) / 0xFFFFFFFF;
    };
}

// Fixed base date for deterministic dates
const BASE_DATE = new Date("2025-12-29T12:00:00Z").getTime();

// Extended product names with more variety
const productNames: Record<ProductCategory, string[]> = {
    electronics: [
        "MacBook Pro 16\"", "Dell XPS 15", "ThinkPad X1 Carbon", "Surface Laptop",
        "LG UltraWide 34\"", "Samsung Odyssey G9", "ASUS ProArt Monitor", "BenQ Designer Display",
        "Logitech MX Master 3", "Razer DeathAdder V3", "Apple Magic Mouse", "SteelSeries Aerox",
        "Corsair K100 RGB", "Keychron Q1 Pro", "Das Keyboard 4", "NuPhy Air75",
        "Sony WH-1000XM5", "AirPods Pro 2", "Bose QC Ultra", "Sennheiser Momentum 4",
        "iPad Pro 12.9\"", "Samsung Galaxy Tab S9", "Wacom Cintiq 22", "reMarkable 2",
        "iPhone 15 Pro Max", "Samsung S24 Ultra", "Google Pixel 8 Pro", "OnePlus 12",
        "Logitech C920 HD", "Elgato Facecam Pro", "Razer Kiyo Pro", "Sony ZV-E10"
    ],
    food: [
        "Organic Black Beans", "Basmati Rice 5kg", "Whole Wheat Pasta", "Extra Virgin Olive Oil",
        "Raw Cane Sugar", "Almond Flour", "Ethiopian Coffee Beans", "Matcha Green Tea",
        "Coconut Milk", "Oat Milk Barista", "Greek Yogurt", "Aged Cheddar Cheese",
        "Grass-Fed Beef Jerky", "Wild Salmon Fillets", "Free Range Eggs", "Organic Chicken",
        "Himalayan Pink Salt", "Black Pepper Whole", "Turmeric Powder", "Ceylon Cinnamon",
        "Dark Chocolate 85%", "Protein Bars Box", "Trail Mix Premium", "Dried Mangoes",
        "Apple Cider Vinegar", "Tahini Paste", "Almond Butter", "Manuka Honey",
        "Quinoa Organic", "Chia Seeds", "Hemp Hearts", "Flax Seeds Ground"
    ],
    apparel: [
        "Merino Wool T-Shirt", "Organic Cotton Tee", "Performance Tank", "Compression Top",
        "Selvage Denim Jeans", "Chino Pants Slim", "Jogger Sweatpants", "Cargo Shorts",
        "Down Puffer Jacket", "Waterproof Shell", "Fleece Pullover", "Blazer Wool Blend",
        "Running Shoes Nike", "Leather Boots Chelsea", "Canvas Sneakers", "Hiking Boots Gore-Tex",
        "Merino Wool Socks", "Athletic Crew Socks", "Compression Socks", "No-Show Liner",
        "Beanie Cashmere", "Baseball Cap Wool", "Bucket Hat Canvas", "Visor Sports",
        "Leather Gloves Touch", "Ski Gloves Insulated", "Gym Gloves Grip", "Cycling Gloves",
        "Cashmere Scarf", "Silk Scarf Print", "Wool Blanket Scarf", "Infinity Scarf Knit"
    ],
    pharmaceuticals: [
        "Ibuprofen 200mg", "Acetaminophen 500mg", "Aspirin 325mg", "Naproxen Sodium",
        "Vitamin D3 5000IU", "Vitamin C 1000mg", "B-Complex Plus", "Omega-3 Fish Oil",
        "Sterile Gauze 4x4", "Adhesive Bandages Box", "Medical Tape Roll", "Elastic Bandage Wrap",
        "Insulin Syringes 100ct", "Safety Needles", "Sharps Container", "Glucose Test Strips",
        "N95 Respirators", "Surgical Masks Box", "Face Shields", "Nitrile Gloves XL",
        "Hand Sanitizer Gel", "Isopropyl Alcohol 99%", "Hydrogen Peroxide", "Betadine Solution",
        "Amoxicillin 500mg", "Azithromycin Z-Pack", "Ciprofloxacin HCL", "Metformin ER",
        "Insulin Lispro", "Insulin Glargine", "Insulin Aspart", "Insulin Degludec"
    ],
    machinery: [
        "Brushless DC Motor", "Stepper Motor NEMA23", "Servo Motor 400W", "AC Induction Motor",
        "Helical Gear Set", "Bevel Gear Pair", "Worm Gear Assembly", "Planetary Gearbox",
        "Centrifugal Pump 2HP", "Submersible Pump", "Diaphragm Pump", "Peristaltic Pump",
        "Ball Valve Stainless", "Gate Valve Bronze", "Check Valve Swing", "Solenoid Valve 24V",
        "Ball Bearing 6205", "Roller Bearing NJ", "Thrust Bearing 51", "Linear Bearing LM",
        "Timing Belt HTD-5M", "V-Belt A Section", "Poly V Belt", "Flat Belt Conveyor",
        "Roller Chain #40", "Leaf Chain AL", "Silent Chain SC", "Attachment Chain K1",
        "HEPA Filter Unit", "Oil Filter Element", "Air Filter Panel", "Hydraulic Filter"
    ],
    "raw-materials": [
        "Steel Sheet 16ga", "Steel Plate 1/4\"", "Steel Tube Square", "Steel Angle Iron",
        "Aluminum Bar 6061", "Aluminum Sheet 0.063", "Aluminum Tube Round", "Aluminum Extrusion",
        "Copper Wire 12AWG", "Copper Sheet 0.032", "Copper Pipe Type L", "Copper Bus Bar",
        "ABS Pellets Black", "PLA Filament 1.75", "PETG Pellets Clear", "Nylon 6 Granules",
        "Oak Lumber 4/4", "Maple Plywood 3/4", "Walnut Board", "Pine Beam 4x6",
        "Tempered Glass 6mm", "Acrylic Sheet Clear", "Polycarbonate Panel", "Glass Fiber Mat",
        "Natural Rubber Sheet", "Silicone Rubber Cord", "Neoprene Foam", "EPDM Gasket Roll",
        "Cotton Canvas 10oz", "Polyester Fabric 600D", "Nylon Ripstop", "Kevlar Fabric"
    ],
    packaging: [
        "Corrugated Box 12x12", "Shipping Box 18x14", "Moving Box Large", "Mailer Box Custom",
        "Bubble Wrap Roll 12\"", "Bubble Mailer Poly", "Air Pillows 8x4", "Foam Sheets 1\"",
        "Packing Tape Clear", "Duct Tape Heavy", "Masking Tape 2\"", "Strapping Tape",
        "Shipping Labels 4x6", "Barcode Labels Roll", "Warning Labels Set", "Address Labels Bulk",
        "Wood Pallet 48x40", "Plastic Pallet Euro", "Pallet Collar Wood", "Pallet Jack Manual",
        "Stretch Wrap 18\"", "Shrink Film Tube", "Poly Bag 6x9", "Vacuum Seal Roll",
        "Packing Peanuts Bio", "Kraft Paper Roll", "Tissue Paper Ream", "Newsprint Sheets",
        "Poly Mailer 10x13", "Padded Envelope", "Document Sleeve", "Zip Lock Bags Gallon"
    ],
    other: [
        "Safety Goggles ANSI", "Hard Hat Class E", "High-Vis Vest", "Steel Toe Boots",
        "Fire Extinguisher 5lb", "First Aid Kit 50P", "Emergency Blanket", "Flashlight LED",
        "Tool Box 20\"", "Wrench Set Metric", "Screwdriver Kit", "Drill Bit Set HSS",
        "Cable Ties 8\"", "Velcro Straps Roll", "Bungee Cords Set", "Rope Nylon 100ft",
        "Cleaning Supplies Kit", "Degreaser Gallon", "Floor Cleaner", "Disinfectant Spray",
        "Office Chair Ergo", "Standing Desk 60\"", "Monitor Arm Dual", "Keyboard Tray",
        "Whiteboard 48x36", "Markers Dry Erase", "Sticky Notes Pack", "Binder Clips Box",
        "USB-C Hub 7-in-1", "Power Strip Surge", "Extension Cord 25ft", "Cable Organizer"
    ],
};

const skuPrefixes: Record<ProductCategory, string> = {
    electronics: "ELC",
    food: "FDB",
    apparel: "APL",
    pharmaceuticals: "PHM",
    machinery: "MCH",
    "raw-materials": "RMT",
    packaging: "PKG",
    other: "OTH",
};

// Helper to generate products for a block with more entropy
function generateProducts(category: ProductCategory, count: number, blockSeed: number): Product[] {
    const products: Product[] = [];
    const names = productNames[category];
    const productRandom = createSeededRandom(blockSeed * 7919); // Use prime for better distribution

    // Shuffle starting index for more variety
    const startOffset = Math.floor(productRandom() * names.length);

    for (let i = 0; i < count; i++) {
        // Use random index instead of sequential
        const nameIndex = (startOffset + Math.floor(productRandom() * names.length)) % names.length;

        // More varied quantities with occasional outliers
        const baseQty = Math.floor(productRandom() * 400) + 20;
        const multiplier = productRandom() > 0.9 ? 3 : (productRandom() > 0.7 ? 1.5 : 1);
        const qty = Math.floor(baseQty * multiplier);

        // Varied expiry dates - some soon, some far out
        const expiryDays = productRandom() > 0.3
            ? 30 + Math.floor(productRandom() * 150) // 30-180 days
            : 5 + Math.floor(productRandom() * 25);  // 5-30 days (expiring soon)
        const expiryOffset = expiryDays * 24 * 60 * 60 * 1000;

        // Varied last update times
        const updateDays = Math.floor(Math.pow(productRandom(), 2) * 14); // Weighted towards recent
        const updateOffset = updateDays * 24 * 60 * 60 * 1000;

        // Generate unique SKU with more entropy
        const skuNum = Math.floor(productRandom() * 9000) + 1000;

        // Generate prices based on category
        const priceRanges: Record<ProductCategory, [number, number]> = {
            electronics: [50, 2500],
            food: [2, 50],
            apparel: [15, 250],
            pharmaceuticals: [5, 150],
            machinery: [100, 5000],
            "raw-materials": [10, 500],
            packaging: [1, 25],
            other: [5, 100],
        };

        const [minPrice, maxPrice] = priceRanges[category];
        const boughtAt = Math.round((minPrice + productRandom() * (maxPrice - minPrice)) * 100) / 100;
        // Current price fluctuates +/- 20% from bought price
        const priceFluctuation = 0.8 + productRandom() * 0.4;
        const currentPrice = Math.round(boughtAt * priceFluctuation * 100) / 100;

        products.push({
            id: `prod-${category}-${blockSeed}-${i}-${skuNum}`,
            sku: `${skuPrefixes[category]}-${skuNum}`,
            name: names[nameIndex],
            quantity: qty,
            category,
            boughtAt,
            currentPrice,
            expiryDate: category === "food" || category === "pharmaceuticals"
                ? new Date(BASE_DATE + expiryOffset)
                : undefined,
            lastUpdated: new Date(BASE_DATE - updateOffset),
        });
    }

    return products;
}

// Helper to generate blocks for a floor with more entropy
function generateBlocks(floorLevel: number, rows: number, cols: number, warehouseSeed: number): Block[] {
    const blocks: Block[] = [];
    const categories: ProductCategory[] = [
        "electronics",
        "food",
        "apparel",
        "pharmaceuticals",
        "machinery",
        "raw-materials",
        "packaging",
        "other",
    ];

    const rowLabels = "ABCDEFGHIJ".split("");
    const capacities = [300, 450, 600, 750, 900, 1000, 1200, 1500];
    let blockIndex = 0;

    for (let r = 0; r < rows; r++) {
        for (let c = 1; c <= cols; c++) {
            // Use better seed mixing
            const blockSeed = (warehouseSeed * 31337) ^ (floorLevel * 7919) ^ (blockIndex * 104729);
            const blockRandom = createSeededRandom(blockSeed);

            // More varied capacity selection
            const capacity = capacities[Math.floor(blockRandom() * capacities.length)];

            // Create varied usage patterns with some empty and some critical
            let usagePercent: number;
            const usageType = blockRandom();
            if (usageType < 0.08) {
                usagePercent = 0; // Empty
            } else if (usageType < 0.15) {
                usagePercent = 0.92 + blockRandom() * 0.08; // Critical (92-100%)
            } else if (usageType < 0.30) {
                usagePercent = 0.72 + blockRandom() * 0.18; // Warning (72-90%)
            } else {
                usagePercent = 0.15 + blockRandom() * 0.55; // Normal with variation (15-70%)
            }

            const used = Math.floor(capacity * usagePercent);

            // Varied category distribution
            const category = categories[Math.floor(blockRandom() * categories.length)];

            // More varied product counts
            const productCount = 2 + Math.floor(blockRandom() * 10); // 2-11 products

            // More varied environmental conditions
            const tempBase = category === "food" || category === "pharmaceuticals" ? 4 : 20;
            const tempVariance = category === "food" || category === "pharmaceuticals" ? 4 : 6;
            const temp = tempBase + (blockRandom() - 0.5) * 2 * tempVariance;

            const humidBase = category === "electronics" ? 35 : 50;
            const humid = humidBase + (blockRandom() - 0.5) * 30;

            // More varied activity times
            const activityHours = Math.floor(Math.pow(blockRandom(), 1.5) * 48); // Weighted towards recent
            const activityOffset = activityHours * 60 * 60 * 1000;

            blocks.push({
                id: `F${floorLevel}-${rowLabels[r]}${c}`,
                name: `${rowLabels[r]}-${String(c).padStart(2, "0")}`,
                row: rowLabels[r],
                column: c,
                capacity,
                used,
                status: getBlockStatus(used, capacity),
                category,
                products: generateProducts(category, productCount, blockSeed),
                temperature: Math.round(temp * 10) / 10,
                humidity: Math.round(humid),
                lastActivity: new Date(BASE_DATE - activityOffset),
            });
            blockIndex++;
        }
    }

    return blocks;
}

// Helper to calculate floor stats
function calculateFloorStats(blocks: Block[], floorSeed: number): FloorStats {
    const statsRandom = createSeededRandom(floorSeed * 7);
    return {
        totalCapacity: blocks.reduce((sum, b) => sum + b.capacity, 0),
        usedCapacity: blocks.reduce((sum, b) => sum + b.used, 0),
        totalItems: blocks.reduce((sum, b) => sum + b.products.reduce((ps, p) => ps + p.quantity, 0), 0),
        activeWorkers: 8 + Math.floor(statsRandom() * 40), // 8-47 workers
        averageTemperature: blocks.reduce((sum, b) => sum + (b.temperature || 22), 0) / blocks.length,
        averageHumidity: blocks.reduce((sum, b) => sum + (b.humidity || 50), 0) / blocks.length,
    };
}

// Generate floors for a warehouse with varying sizes
function generateFloors(warehouseId: string, floorCount: number, warehouseSeed: number): Floor[] {
    const floors: Floor[] = [];
    const floorRandom = createSeededRandom(warehouseSeed * 13);

    for (let i = 1; i <= floorCount; i++) {
        // Varied floor sizes
        const rows = i === 1 ? 4 + Math.floor(floorRandom() * 2) : 2 + Math.floor(floorRandom() * 3);
        const cols = 4 + Math.floor(floorRandom() * 4); // 4-7 columns
        const blocks = generateBlocks(i, rows, cols, warehouseSeed);
        const floorSeed = warehouseSeed * 100 + i;

        const floorNames = ["Ground Floor", "Mezzanine", "Second Floor", "Third Floor", "Fourth Floor", "Rooftop Storage"];
        floors.push({
            id: `${warehouseId}-F${i}`,
            name: floorNames[i - 1] || `Floor ${i}`,
            level: i,
            blocks,
            stats: calculateFloorStats(blocks, floorSeed),
        });
    }

    return floors;
}

// Main mock data - generated once with deterministic but varied seeds
const mumbaiFloors = generateFloors("WH-MUM", 5, 42);
const delhiFloors = generateFloors("WH-DEL", 4, 1337);
const bangaloreFloors = generateFloors("WH-BLR", 3, 8675309);
const chennaiFloors = generateFloors("WH-CHN", 3, 31415);

export const MOCK_WAREHOUSES: Warehouse[] = [
    {
        id: "WH-MUM",
        name: "Mumbai Central Warehouse",
        code: "MUM-01",
        address: "Plot 45, MIDC Industrial Area, Andheri East",
        city: "Mumbai",
        totalFloors: 5,
        totalBlocks: mumbaiFloors.reduce((sum, f) => sum + f.blocks.length, 0),
        totalCapacity: mumbaiFloors.reduce((sum, f) => sum + f.stats.totalCapacity, 0),
        usedCapacity: mumbaiFloors.reduce((sum, f) => sum + f.stats.usedCapacity, 0),
        floors: mumbaiFloors,
        workers: mumbaiFloors.reduce((sum, f) => sum + f.stats.activeWorkers, 0),
        lastUpdated: new Date(BASE_DATE),
    },
    {
        id: "WH-DEL",
        name: "Delhi North Hub",
        code: "DEL-02",
        address: "Sector 18, Noida Industrial Complex",
        city: "Delhi NCR",
        totalFloors: 4,
        totalBlocks: delhiFloors.reduce((sum, f) => sum + f.blocks.length, 0),
        totalCapacity: delhiFloors.reduce((sum, f) => sum + f.stats.totalCapacity, 0),
        usedCapacity: delhiFloors.reduce((sum, f) => sum + f.stats.usedCapacity, 0),
        floors: delhiFloors,
        workers: delhiFloors.reduce((sum, f) => sum + f.stats.activeWorkers, 0),
        lastUpdated: new Date(BASE_DATE - 2 * 60 * 60 * 1000),
    },
    {
        id: "WH-BLR",
        name: "Bangalore Tech Park Facility",
        code: "BLR-03",
        address: "Electronic City Phase 2, Industrial Zone",
        city: "Bangalore",
        totalFloors: 3,
        totalBlocks: bangaloreFloors.reduce((sum, f) => sum + f.blocks.length, 0),
        totalCapacity: bangaloreFloors.reduce((sum, f) => sum + f.stats.totalCapacity, 0),
        usedCapacity: bangaloreFloors.reduce((sum, f) => sum + f.stats.usedCapacity, 0),
        floors: bangaloreFloors,
        workers: bangaloreFloors.reduce((sum, f) => sum + f.stats.activeWorkers, 0),
        lastUpdated: new Date(BASE_DATE - 30 * 60 * 1000),
    },
    {
        id: "WH-CHN",
        name: "Chennai Port Warehouse",
        code: "CHN-04",
        address: "Old Mahabalipuram Road, Sholinganallur",
        city: "Chennai",
        totalFloors: 3,
        totalBlocks: chennaiFloors.reduce((sum, f) => sum + f.blocks.length, 0),
        totalCapacity: chennaiFloors.reduce((sum, f) => sum + f.stats.totalCapacity, 0),
        usedCapacity: chennaiFloors.reduce((sum, f) => sum + f.stats.usedCapacity, 0),
        floors: chennaiFloors,
        workers: chennaiFloors.reduce((sum, f) => sum + f.stats.activeWorkers, 0),
        lastUpdated: new Date(BASE_DATE - 4 * 60 * 60 * 1000),
    },
];

// Export specific warehouse for easier access
export function getWarehouseById(id: string): Warehouse | undefined {
    return MOCK_WAREHOUSES.find((w) => w.id === id);
}

export function getFloorById(warehouseId: string, floorId: string): Floor | undefined {
    const warehouse = getWarehouseById(warehouseId);
    return warehouse?.floors.find((f) => f.id === floorId);
}

export function getBlockById(warehouseId: string, floorId: string, blockId: string): Block | undefined {
    const floor = getFloorById(warehouseId, floorId);
    return floor?.blocks.find((b) => b.id === blockId);
}
