import { Warehouse, Floor, Block, Product } from "../_components/types";

const API_BASE = "/api/warehouse";

// ====================
// Warehouse API
// ====================

export interface WarehouseListItem {
    id: string;
    name: string;
    code: string;
    address: string;
    city: string;
    totalFloors: number;
    totalBlocks: number;
    totalCapacity: number;
    usedCapacity: number;
    workers: number;
    lastUpdated: string;
}

export async function fetchWarehouses(): Promise<WarehouseListItem[]> {
    const res = await fetch(API_BASE);
    if (!res.ok) {
        throw new Error(`Failed to fetch warehouses: ${res.statusText}`);
    }
    return res.json();
}

export async function fetchWarehouse(id: string): Promise<Warehouse> {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) {
        throw new Error(`Failed to fetch warehouse: ${res.statusText}`);
    }
    const data = await res.json();
    // Convert string dates back to Date objects
    return transformWarehouse(data);
}

export async function createWarehouse(
    data: Pick<Warehouse, "name" | "code" | "address" | "city"> & { workers?: number }
): Promise<Warehouse> {
    const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create warehouse");
    }
    return res.json();
}

// ====================
// Floor API
// ====================

export async function fetchFloor(warehouseId: string, floorId: string): Promise<Floor> {
    const res = await fetch(`${API_BASE}/${warehouseId}/floor/${floorId}`);
    if (!res.ok) {
        throw new Error(`Failed to fetch floor: ${res.statusText}`);
    }
    const data = await res.json();
    return transformFloor(data);
}

export async function createFloor(
    warehouseId: string,
    data: { name: string; level: number }
): Promise<Floor> {
    const res = await fetch(`${API_BASE}/${warehouseId}/floor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create floor");
    }
    return res.json();
}

// ====================
// Block API
// ====================

export async function createBlock(
    warehouseId: string,
    floorId: string,
    data: Omit<Block, "id" | "used" | "status" | "products" | "lastActivity">
): Promise<Block> {
    const res = await fetch(`${API_BASE}/${warehouseId}/floor/${floorId}/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create block");
    }
    return res.json();
}

// ====================
// Product API
// ====================

export interface CreateProductData {
    sku: string;
    name: string;
    quantity: number;
    category: string;
    averageWeeklySales?: number | null;
    boughtAt: number;
    currentPrice: number;
    expiryDate?: string;
}

export async function createProduct(
    warehouseId: string,
    floorId: string,
    blockId: string,
    data: CreateProductData
): Promise<Product> {
    const res = await fetch(
        `${API_BASE}/${warehouseId}/floor/${floorId}/block/${blockId}/product`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }
    );
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create product");
    }
    const product = await res.json();
    return transformProduct(product);
}

export async function updateProduct(
    warehouseId: string,
    floorId: string,
    blockId: string,
    productId: string,
    data: Partial<Omit<Product, "id" | "sku">>
): Promise<Product> {
    const res = await fetch(
        `${API_BASE}/${warehouseId}/floor/${floorId}/block/${blockId}/product/${productId}`,
        {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }
    );
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update product");
    }
    const product = await res.json();
    return transformProduct(product);
}

export async function deleteProduct(
    warehouseId: string,
    floorId: string,
    blockId: string,
    productId: string
): Promise<void> {
    const res = await fetch(
        `${API_BASE}/${warehouseId}/floor/${floorId}/block/${blockId}/product/${productId}`,
        { method: "DELETE" }
    );
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete product");
    }
}

export interface SearchResult extends Product {
    location: {
        warehouseId: string;
        warehouseName: string;
        floorId: string;
        floorName: string;
        blockId: string;
        blockName: string;
    };
}

export async function searchProducts(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];
    const res = await fetch(`${API_BASE}/product/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) {
        throw new Error(`Failed to search products: ${res.statusText}`);
    }
    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((p: any) => ({
        ...transformProduct(p as Record<string, unknown>),
        location: p.location,
    }));
}

export async function transferProduct(
    productId: string,
    targetBlockId: string,
    quantity: number
): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/product/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, targetBlockId, quantity }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to transfer product");
    }
    return res.json();
}

// ====================
// Transform helpers
// ====================

function transformProduct(p: Record<string, unknown>): Product {
    return {
        id: p.id as string,
        sku: p.sku as string,
        name: p.name as string,
        quantity: p.quantity as number,
        category: p.category as Product["category"],
        averageWeeklySales:
            (p.averageWeeklySales as number | null | undefined) ?? null,
        boughtAt: p.boughtAt as number,
        currentPrice: p.currentPrice as number,
        expiryDate: p.expiryDate ? new Date(p.expiryDate as string) : undefined,
        lastUpdated: new Date(p.lastUpdated as string),
    };
}

function transformBlock(b: Record<string, unknown>): Block {
    return {
        id: b.id as string,
        name: b.name as string,
        row: b.row as string,
        column: b.column as number,
        capacity: b.capacity as number,
        used: b.used as number,
        status: b.status as Block["status"],
        category: b.category as Block["category"],
        temperature: b.temperature as number | undefined,
        humidity: b.humidity as number | undefined,
        lastActivity: b.lastActivity ? new Date(b.lastActivity as string) : undefined,
        products: ((b.products as Record<string, unknown>[]) || []).map(transformProduct),
    };
}

function transformFloor(f: Record<string, unknown>): Floor {
    return {
        id: f.id as string,
        name: f.name as string,
        level: f.level as number,
        blocks: ((f.blocks as Record<string, unknown>[]) || []).map(transformBlock),
        stats: f.stats as Floor["stats"],
    };
}

function transformWarehouse(w: Record<string, unknown>): Warehouse {
    return {
        id: w.id as string,
        name: w.name as string,
        code: w.code as string,
        address: w.address as string,
        city: w.city as string,
        totalFloors: w.totalFloors as number,
        totalBlocks: w.totalBlocks as number,
        totalCapacity: w.totalCapacity as number,
        usedCapacity: w.usedCapacity as number,
        floors: ((w.floors as Record<string, unknown>[]) || []).map(transformFloor),
        workers: w.workers as number,
        lastUpdated: new Date(w.lastUpdated as string),
    };
}
