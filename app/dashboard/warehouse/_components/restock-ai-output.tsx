"use client";

type RestockAiOutputProps = {
  output: string;
  isStreaming: boolean;
  onStop: () => void;
  onCopy: () => void;
};

export function RestockAiOutput({
  output,
  isStreaming,
  onStop,
  onCopy,
}: RestockAiOutputProps) {
  return (
    <div className="win7-groupbox">
      <div className="flex items-center justify-between mb-1">
        <legend className="text-xs">Response</legend>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="win7-btn text-xs"
            onClick={onCopy}
            disabled={!output}
          >
            Copy
          </button>
          <button
            type="button"
            className="win7-btn text-xs"
            onClick={onStop}
            disabled={!isStreaming}
          >
            Stop
          </button>
        </div>
      </div>
      <div className="win7-input p-2" style={{ minHeight: "180px", maxHeight: "350px", overflow: "auto", border: "1px solid #abadb3" }}>
        <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-black m-0">
          {output || "Click Generate to get restock recommendations."}
        </pre>
      </div>
    </div>
  );
}

