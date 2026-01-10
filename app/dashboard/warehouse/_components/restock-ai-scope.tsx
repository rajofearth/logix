"use client";

import type { ProductCategory } from "./types";
import { getCategoryLabel } from "./types";

export type RestockAiScopeValue = "floor" | "warehouse";

type RestockAiScopeProps = {
  scope: RestockAiScopeValue;
  onScopeChange: (scope: RestockAiScopeValue) => void;
  category: "all" | ProductCategory;
  onCategoryChange: (category: "all" | ProductCategory) => void;
  categories: ProductCategory[];
  disabled?: boolean;
};

export function RestockAiScope({
  scope,
  onScopeChange,
  category,
  onCategoryChange,
  categories,
  disabled,
}: RestockAiScopeProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <label className="text-xs whitespace-nowrap">Scope:</label>
        <select
          className="win7-input text-xs"
          value={scope}
          onChange={(e) => onScopeChange(e.target.value as RestockAiScopeValue)}
          disabled={disabled}
        >
          <option value="floor">Floor</option>
          <option value="warehouse">Warehouse</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs whitespace-nowrap">Section:</label>
        <select
          className="win7-input text-xs"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as "all" | ProductCategory)}
          disabled={disabled}
        >
          <option value="all">All</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {getCategoryLabel(c)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

