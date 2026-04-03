"use client";

import { useState } from "react";
import type { ColorCollection } from "@/src/lib/collections";
import { buildDarkModePairs, buildDarkModeCss, buildDarkModeTailwind } from "@/src/lib/dark-mode-pairs";
import { CopyActionButton } from "@/src/components/copy-action-button";

type Format = "preview" | "css" | "tailwind";

export function DarkModePairsCard({ collection }: { collection: ColorCollection }) {
  const [format, setFormat] = useState<Format>("preview");
  const pairs = buildDarkModePairs(
    collection.palette.map((c) => ({ name: c.name, hex: c.hex })),
    collection.id,
  );

  const cssOutput = buildDarkModeCss(pairs, collection.id);
  const twOutput = buildDarkModeTailwind(pairs, collection.id);

  return (
    <div className="mt-4 space-y-4">
      {/* Color pair preview */}
      <div className="grid gap-2">
        {pairs.map((pair) => (
          <div key={pair.name} className="flex items-center gap-2 rounded-xl overflow-hidden border border-black/6">
            <div className="flex-1 flex items-center gap-2 px-3 py-2" style={{ backgroundColor: "#fafafa" }}>
              <div className="w-6 h-6 rounded-md border border-black/10" style={{ backgroundColor: pair.light }} />
              <span className="text-xs font-mono text-neutral-600">{pair.light}</span>
            </div>
            <div className="flex-1 flex items-center gap-2 px-3 py-2" style={{ backgroundColor: "#1a1a1a" }}>
              <div className="w-6 h-6 rounded-md border border-white/20" style={{ backgroundColor: pair.dark }} />
              <span className="text-xs font-mono text-neutral-400">{pair.dark}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Format toggle */}
      <div className="flex items-center gap-1 bg-neutral-100 dark:bg-white/8 rounded-lg p-1">
        {(["preview", "css", "tailwind"] as Format[]).map((f) => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              format === f
                ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700"
            }`}
          >
            {f === "preview" ? "Preview" : f === "css" ? "CSS" : "Tailwind"}
          </button>
        ))}
      </div>

      {/* Code output */}
      {format !== "preview" && (
        <div className="relative">
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-black/6 bg-neutral-50 dark:bg-neutral-900 px-4 py-4 text-xs leading-6 text-neutral-600 dark:text-neutral-400 max-h-64 overflow-y-auto">
            {format === "css" ? cssOutput : twOutput}
          </pre>
          <div className="absolute top-2 right-2">
            <CopyActionButton value={format === "css" ? cssOutput : twOutput} label="Copy" />
          </div>
        </div>
      )}
    </div>
  );
}
