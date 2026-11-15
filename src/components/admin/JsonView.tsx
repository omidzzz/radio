"use client";

import { useState } from "react";

interface JsonViewProps {
  data: unknown;
  title?: string;
}

export default function JsonView({ data, title = "Post Data" }: JsonViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback copy
    }
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-surface">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/50">
        <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          {title}
        </h3>
        <button
          onClick={handleCopy}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          {copied ? "Copied!" : "Copy JSON"}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-xs text-text-muted">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
