"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Square } from "lucide-react";

type RestockAiOutputProps = {
  output: string;
  prompt?: string | null;
  isStreaming: boolean;
  onStop: () => void;
  onCopy: () => void;
};

export function RestockAiOutput({
  output,
  prompt,
  isStreaming,
  onStop,
  onCopy,
}: RestockAiOutputProps) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {isStreaming ? "Streaming response…" : output ? "Ready" : "No output yet"}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={onCopy}
            disabled={!output}
          >
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            Copy
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={onStop}
            disabled={!isStreaming}
          >
            <Square className="mr-1.5 h-3.5 w-3.5" />
            Stop
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-background">
        <ScrollArea className="h-56">
          <pre className="whitespace-pre-wrap break-words p-3 font-mono text-xs leading-relaxed">
            {output || "Click Generate to get restock recommendations."}
          </pre>
        </ScrollArea>
      </div>

      {prompt ? (
        <div className="rounded-md border bg-muted/20">
          <div className="px-3 py-2 text-xs font-semibold">Prompt</div>
          <ScrollArea className="h-40 border-t">
            <pre className="whitespace-pre-wrap break-words p-3 font-mono text-xs leading-relaxed text-muted-foreground">
              {prompt}
            </pre>
          </ScrollArea>
        </div>
      ) : null}
    </div>
  );
}

