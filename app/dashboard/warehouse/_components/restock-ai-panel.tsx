"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
type PromptEventData = { prompt: string };
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
  const [includePrompt, setIncludePrompt] = useState(false);

  const [output, setOutput] = useState("");
  const [prompt, setPrompt] = useState<string | null>(null);
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
    setPrompt(null);
    setError(null);
    setIsStreaming(true);

    const url = new URL(`/api/warehouse/${warehouseId}/restock-ai/stream`, window.location.origin);
    url.searchParams.set("scope", scope);
    if (scope === "floor" && floorId) url.searchParams.set("floorId", floorId);
    if (category !== "all") url.searchParams.set("category", category);
    if (includePrompt) url.searchParams.set("includePrompt", "1");

    const es = new EventSource(url.toString());
    esRef.current = es;

    es.addEventListener("delta", (evt) => {
      const data = safeJsonParse<DeltaEventData>((evt as MessageEvent).data);
      if (!data?.text) return;
      setOutput((prev) => prev + data.text);
    });

    es.addEventListener("prompt", (evt) => {
      const data = safeJsonParse<PromptEventData>((evt as MessageEvent).data);
      if (!data?.prompt) return;
      setPrompt(data.prompt);
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
    <Card size="sm" className="border-[#7f9db9] bg-white text-black">
      <CardHeader className="border-b border-[#7f9db9]">
        <CardTitle>AI Restock Recommendations</CardTitle>
        <div className="text-xs text-gray-600">
          Uses LMStudio model <span className="font-mono">google/gemma-3n-e4b</span> and estimates weekly sales.
          {scope === "floor" && floorName ? ` (Floor: ${floorName})` : ""}
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        <RestockAiScope
          scope={scope}
          onScopeChange={setScope}
          category={category}
          onCategoryChange={setCategory}
          categories={categoryOptions}
          includePrompt={includePrompt}
          onIncludePromptChange={setIncludePrompt}
          disabled={disabledControls}
        />

        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-red-600">{error ? `Error: ${error}` : ""}</div>
          <Button
            type="button"
            className="h-8 text-xs win7-btn"
            onClick={onGenerate}
            disabled={!canGenerate || isStreaming}
          >
            {isStreaming ? "Generating…" : "Generate"}
          </Button>
        </div>

        <RestockAiOutput output={output} prompt={prompt} isStreaming={isStreaming} onStop={stop} onCopy={onCopy} />
      </CardContent>
    </Card>
  );
}

