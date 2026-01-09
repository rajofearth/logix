"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { ProductCategory } from "./types";
import { getCategoryLabel } from "./types";

export type RestockAiScopeValue = "floor" | "warehouse";

type RestockAiScopeProps = {
  scope: RestockAiScopeValue;
  onScopeChange: (scope: RestockAiScopeValue) => void;
  category: "all" | ProductCategory;
  onCategoryChange: (category: "all" | ProductCategory) => void;
  categories: ProductCategory[];
  includePrompt: boolean;
  onIncludePromptChange: (v: boolean) => void;
  disabled?: boolean;
};

export function RestockAiScope({
  scope,
  onScopeChange,
  category,
  onCategoryChange,
  categories,
  includePrompt,
  onIncludePromptChange,
  disabled,
}: RestockAiScopeProps) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Scope</Label>
        <Select
          value={scope}
          onValueChange={(v) => onScopeChange(v as RestockAiScopeValue)}
          disabled={disabled}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select scope" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="floor">Selected floor</SelectItem>
            <SelectItem value="warehouse">Entire warehouse</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Section (category)</Label>
        <Select
          value={category}
          onValueChange={(v) => onCategoryChange(v as "all" | ProductCategory)}
          disabled={disabled}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="All sections" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sections</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {getCategoryLabel(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end gap-2 pb-0.5">
        <Switch
          checked={includePrompt}
          onCheckedChange={onIncludePromptChange}
          disabled={disabled}
          size="default"
        />
        <Label className="text-xs">Show prompt (debug)</Label>
      </div>
    </div>
  );
}

