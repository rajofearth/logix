"use client";

import { StorageZoneCard, StorageZone } from "./storage-zone-card";

const MOCK_ZONES: StorageZone[] = [
    {
        id: "SZ 01",
        name: "Dairy Products",
        sections: [
            { id: "1", name: "01", workers: 123, items: 24, capacity: 40, type: "list", items_list: ["S01", "S01", "S01", "S01"] },
            { id: "2", name: "02", workers: 13, items: 5, capacity: 10, type: "grid", items_list: ["S01", "S01", "S01"] },
            { id: "3", name: "03", workers: 1, items: 9, capacity: 10, type: "grid", items_list: ["S01", "S01", "S01"] },
            { id: "4", name: "04", workers: 13, items: 25, capacity: 40, type: "grid", items_list: ["S01", "S01", "S01", "S01"] },
            { id: "5", name: "05", workers: 13, items: 24, capacity: 20, type: "grid", items_list: ["S01", "S01"] },
        ]
    },
    {
        id: "SZ 01",
        name: "Vegetable Products",
        sections: [
            { id: "1-v", name: "01", workers: 123, items: 24, capacity: 40, type: "list", items_list: ["S01", "S01", "S01", "S01"] },
            { id: "2-v", name: "02", workers: 5, items: 5, capacity: 10, type: "grid", items_list: ["S01", "S01", "S01"] },
            { id: "3-v", name: "03", workers: 2, items: 9, capacity: 10, type: "grid", items_list: ["S01", "S01", "S01"] },
            { id: "4-v", name: "04", workers: 7, items: 25, capacity: 40, type: "grid", items_list: ["S01", "S01", "S01", "S01"] },
            { id: "5-v", name: "05", workers: 10, items: 15, capacity: 20, type: "grid", items_list: ["S01", "S01"] },
        ]
    }
];

export function WarehouseVisualGrid() {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 relative h-full">
            {/* Background grid dots simulation if needed, but clean white is fine.
           To verify aesthetics, we can add a subtle pattern class if tailwind-patterns exists, or just custom css.
       */}
            {MOCK_ZONES.map((zone, idx) => (
                <StorageZoneCard key={idx} zone={zone} />
            ))}


        </div>
    );
}
