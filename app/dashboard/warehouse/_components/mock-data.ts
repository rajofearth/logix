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

// Seeded random number generator for consistent SSR/client values
function createSeededRandom(seed: number) {
    let currentSeed = seed;
    return function () {
        currentSeed = (currentSeed * 1103515245 + 12345) & 0x7fffffff;
        return currentSeed / 0x7fffffff;
    };
}

// Create static data with fixed seed - runs once at module load time
const random = createSeededRandom(42);

// Fixed base date for deterministic dates
const BASE_DATE = new Date("2025-12-29T12:00:00Z").getTime();

// Helper to generate products for a block
function generateProducts(category: ProductCategory, count: number, blockSeed: number): Product[] {
    const productNames: Record<ProductCategory, string[]> = {
        electronics: ["Laptop", "Monitor", "Keyboard", "Mouse", "Headphones", "Tablet", "Smartphone", "Webcam"],
        food: ["Canned Beans", "Rice Bags", "Pasta", "Olive Oil", "Sugar", "Flour", "Coffee", "Tea"],
        apparel: ["T-Shirts", "Jeans", "Jackets", "Shoes", "Socks", "Hats", "Gloves", "Scarves"],
        pharmaceuticals: ["Aspirin", "Vitamins", "Bandages", "Syringes", "Masks", "Sanitizer", "Antibiotics", "Insulin"],
        machinery: ["Motors", "Gears", "Pumps", "Valves", "Bearings", "Belts", "Chains", "Filters"],
        "raw-materials": ["Steel Sheets", "Aluminum Rods", "Copper Wire", "Plastic Pellets", "Wood Planks", "Glass Panels", "Rubber", "Fabric Rolls"],
        packaging: ["Cardboard Boxes", "Bubble Wrap", "Tape", "Labels", "Pallets", "Shrink Wrap", "Foam", "Bags"],
        other: ["Miscellaneous A", "Miscellaneous B", "Miscellaneous C", "Item D", "Item E", "Item F", "Item G", "Item H"],
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

    const products: Product[] = [];
    const names = productNames[category];
    const productRandom = createSeededRandom(blockSeed);

    for (let i = 0; i < count; i++) {
        const nameIndex = i % names.length;
        const qty = Math.floor(productRandom() * 500) + 50;
        const expiryOffset = productRandom() * 180 * 24 * 60 * 60 * 1000;
        const updateOffset = productRandom() * 7 * 24 * 60 * 60 * 1000;

        products.push({
            id: `prod-${category}-${blockSeed}-${i}`,
            sku: `${skuPrefixes[category]}-${String(blockSeed * 100 + i + 1).padStart(4, "0")}`,
            name: names[nameIndex],
            quantity: qty,
            category,
            expiryDate: category === "food" || category === "pharmaceuticals"
                ? new Date(BASE_DATE + expiryOffset)
                : undefined,
            lastUpdated: new Date(BASE_DATE - updateOffset),
        });
    }

    return products;
}

// Helper to generate blocks for a floor
function generateBlocks(floorLevel: number, rows: number, cols: number, warehouseSeed: number): Block[] {
    const blocks: Block[] = [];
    const categories: ProductCategory[] = [
        "electronics",
        "food",
        "apparel",
        "pharmaceuticals",
        "machinery",
        "raw-materials",
    ];

    const rowLabels = "ABCDEFGHIJ".split("");
    const capacities = [500, 750, 1000, 1250];
    let blockIndex = 0;

    for (let r = 0; r < rows; r++) {
        for (let c = 1; c <= cols; c++) {
            const blockSeed = warehouseSeed * 1000 + floorLevel * 100 + blockIndex;
            const blockRandom = createSeededRandom(blockSeed);

            const capacity = capacities[Math.floor(blockRandom() * 4)];
            const usagePercent = blockRandom();
            const used = Math.floor(capacity * usagePercent);
            const category = categories[Math.floor(blockRandom() * categories.length)];
            const productCount = Math.floor(blockRandom() * 8) + 3;
            const temp = 18 + blockRandom() * 8;
            const humid = 40 + blockRandom() * 20;
            const activityOffset = blockRandom() * 2 * 60 * 60 * 1000;

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
                temperature: temp,
                humidity: humid,
                lastActivity: new Date(BASE_DATE - activityOffset),
            });
            blockIndex++;
        }
    }

    return blocks;
}

// Helper to calculate floor stats
function calculateFloorStats(blocks: Block[], floorSeed: number): FloorStats {
    const statsRandom = createSeededRandom(floorSeed);
    return {
        totalCapacity: blocks.reduce((sum, b) => sum + b.capacity, 0),
        usedCapacity: blocks.reduce((sum, b) => sum + b.used, 0),
        totalItems: blocks.reduce((sum, b) => sum + b.products.reduce((ps, p) => ps + p.quantity, 0), 0),
        activeWorkers: Math.floor(statsRandom() * 30) + 10,
        averageTemperature: blocks.reduce((sum, b) => sum + (b.temperature || 22), 0) / blocks.length,
        averageHumidity: blocks.reduce((sum, b) => sum + (b.humidity || 50), 0) / blocks.length,
    };
}

// Generate floors for a warehouse
function generateFloors(warehouseId: string, floorCount: number, warehouseSeed: number): Floor[] {
    const floors: Floor[] = [];

    for (let i = 1; i <= floorCount; i++) {
        const rows = i === 1 ? 4 : 3; // Ground floor is larger
        const cols = 6;
        const blocks = generateBlocks(i, rows, cols, warehouseSeed);
        const floorSeed = warehouseSeed * 100 + i;

        floors.push({
            id: `${warehouseId}-F${i}`,
            name: i === 1 ? "Ground Floor" : `Floor ${i}`,
            level: i,
            blocks,
            stats: calculateFloorStats(blocks, floorSeed),
        });
    }

    return floors;
}

// Main mock data - generated once with deterministic seeds
const mumbaiFloors = generateFloors("WH-MUM", 4, 1);
const delhiFloors = generateFloors("WH-DEL", 3, 2);
const bangaloreFloors = generateFloors("WH-BLR", 3, 3);

export const MOCK_WAREHOUSES: Warehouse[] = [
    {
        id: "WH-MUM",
        name: "Mumbai Central Warehouse",
        code: "MUM-01",
        address: "Plot 45, MIDC Industrial Area, Andheri East",
        city: "Mumbai",
        totalFloors: 4,
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
        code: "DEL-01",
        address: "Sector 18, Noida Industrial Complex",
        city: "Delhi NCR",
        totalFloors: 3,
        totalBlocks: delhiFloors.reduce((sum, f) => sum + f.blocks.length, 0),
        totalCapacity: delhiFloors.reduce((sum, f) => sum + f.stats.totalCapacity, 0),
        usedCapacity: delhiFloors.reduce((sum, f) => sum + f.stats.usedCapacity, 0),
        floors: delhiFloors,
        workers: delhiFloors.reduce((sum, f) => sum + f.stats.activeWorkers, 0),
        lastUpdated: new Date(BASE_DATE),
    },
    {
        id: "WH-BLR",
        name: "Bangalore East Facility",
        code: "BLR-01",
        address: "Electronic City Phase 2, Industrial Zone",
        city: "Bangalore",
        totalFloors: 3,
        totalBlocks: bangaloreFloors.reduce((sum, f) => sum + f.blocks.length, 0),
        totalCapacity: bangaloreFloors.reduce((sum, f) => sum + f.stats.totalCapacity, 0),
        usedCapacity: bangaloreFloors.reduce((sum, f) => sum + f.stats.usedCapacity, 0),
        floors: bangaloreFloors,
        workers: bangaloreFloors.reduce((sum, f) => sum + f.stats.activeWorkers, 0),
        lastUpdated: new Date(BASE_DATE),
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
