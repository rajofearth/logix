"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { toast } from "sonner";

import type { ProductCategory } from "./types";
import { RestockAiOutput } from "./restock-ai-output";
import { RestockAiScope, type RestockAiScopeValue } from "./restock-ai-scope";

type RestockAiPanelProps = {
  warehouseId: string;
  floorId?: string | null;
  floorName?: string | null;
  categories: ProductCategory[];
};

type DeltaEventData = { text: string };
type ServerErrorEventData = { message: string };

function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function RestockAiPanel({ warehouseId, floorId, floorName, categories }: RestockAiPanelProps) {
  const [scope, setScope] = useState<RestockAiScopeValue>("floor");
  const [category, setCategory] = useState<"all" | ProductCategory>("all");

  const [output, setOutput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const esRef = useRef<EventSource | null>(null);

  const categoryOptions = useMemo(() => Array.from(new Set(categories)), [categories]);

  const canGenerate = scope === "warehouse" ? Boolean(warehouseId) : Boolean(warehouseId && floorId);
  const disabledControls = isStreaming;

  const stop = () => {
    esRef.current?.close();
    esRef.current = null;
    setIsStreaming(false);
  };

  useEffect(() => () => stop(), []);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.success("Copied");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const onGenerate = () => {
    if (!canGenerate) {
      toast.error(scope === "floor" ? "Select a floor first" : "Select a warehouse first");
      return;
    }

    stop();
    setOutput("");
    setError(null);
    setIsStreaming(true);

    const url = new URL(`/api/warehouse/${warehouseId}/restock-ai/stream`, window.location.origin);
    url.searchParams.set("scope", scope);
    if (scope === "floor" && floorId) url.searchParams.set("floorId", floorId);
    if (category !== "all") url.searchParams.set("category", category);

    const es = new EventSource(url.toString());
    esRef.current = es;

    es.addEventListener("delta", (evt) => {
      const data = safeJsonParse<DeltaEventData>((evt as MessageEvent).data);
      if (!data?.text) return;
      setOutput((prev) => prev + data.text);
    });

    es.addEventListener("server_error", (evt) => {
      const data = safeJsonParse<ServerErrorEventData>((evt as MessageEvent).data);
      const msg = data?.message ?? "Server error";
      setError(msg);
      toast.error(msg);
      stop();
    });

    es.addEventListener("done", () => {
      stop();
    });

    es.onerror = () => {
      setError("Connection error");
      toast.error("Connection error");
      stop();
    };
  };

  return (
    <div className="win7-window flex flex-col">
      <div className="title-bar">
        <div className="title-bar-text">
          AI Restock Recommendations
          {scope === "floor" && floorName ? ` - ${floorName}` : ""}
        </div>
      </div>
      <div className="window-body has-space flex flex-col gap-2">
        <RestockAiScope
          scope={scope}
          onScopeChange={setScope}
          category={category}
          onCategoryChange={setCategory}
          categories={categoryOptions}
          disabled={disabledControls}
        />

        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-red-600">{error ? `Error: ${error}` : ""}</div>
          <button
            type="button"
            className="win7-btn text-xs"
            onClick={onGenerate}
            disabled={!canGenerate || isStreaming}
          >
            {isStreaming ? "Generating…" : "Generate"}
          </button>
        </div>

        <RestockAiOutput output={output} isStreaming={isStreaming} onStop={stop} onCopy={onCopy} />
      </div>
    </div>
  );
}

