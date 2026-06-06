"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { ProGate } from "@/src/components/pro-gate";
import { track } from "@/src/lib/track";

type ExportFormat = "css" | "tailwind" | "sass" | "json" | "figma" | "style-dict";

interface FormatDef {
  id: ExportFormat;
  label: string;
  pro: boolean;
}

const FORMATS: FormatDef[] = [
  { id: "css", label: "CSS", pro: false },
  { id: "json", label: "JSON", pro: false },
  { id: "tailwind", label: "Tailwind", pro: true },
  { id: "sass", label: "Sass/SCSS", pro: true },
  { id: "figma", label: "Figma Tokens", pro: true },
  { id: "style-dict", label: "Style Dict", pro: true },
];

interface ColorEntry {
  name: string;
  hex: string;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function buildExport(format: ExportFormat, colors: ColorEntry[], prefix: string): string {
  switch (format) {
    case "css": {
      const vars = colors.map((c) => `  --${prefix}-${slugify(c.name)}: ${c.hex};`).join("\n");
      return `:root {\n${vars}\n}`;
    }
    case "json":
      return JSON.stringify(
        colors.map((c) => ({ name: c.name, hex: c.hex })),
        null,
        2,
      );
    case "tailwind": {
      const entries = colors.map((c) => `    "${slugify(c.name)}": "${c.hex}",`).join("\n");
      return `// tailwind.config.ts\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n${entries}\n      },\n    },\n  },\n};`;
    }
    case "sass": {
      return colors.map((c) => `$${prefix}-${slugify(c.name)}: ${c.hex};`).join("\n");
    }
    case "figma": {
      const tokens: Record<string, { $type: string; $value: string; $description: string }> = {};
      for (const c of colors) {
        tokens[slugify(c.name)] = { $type: "color", $value: c.hex, $description: c.name };
      }
      return JSON.stringify({ [prefix]: tokens }, null, 2);
    }
    case "style-dict": {
      const properties: Record<string, { value: string; comment: string }> = {};
      for (const c of colors) {
        properties[slugify(c.name)] = { value: c.hex, comment: c.name };
      }
      return JSON.stringify({ color: { [prefix]: properties } }, null, 2);
    }
  }
}

interface PaletteExportPanelProps {
  colors: ColorEntry[];
  prefix?: string;
}

/**
 * Unified export panel with tabbed format selection.
 * CSS and JSON are free; Tailwind, Sass, Figma, Style Dictionary are Pro-gated.
 * Drop into any tool page to provide a consistent export experience.
 */
export function PaletteExportPanel({ colors, prefix = "palette" }: PaletteExportPanelProps) {
  const [activeFormat, setActiveFormat] = useState<ExportFormat>("css");
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const code = useMemo(
    () => buildExport(activeFormat, colors, prefix),
    [activeFormat, colors, prefix],
  );

  const activeDef = FORMATS.find((f) => f.id === activeFormat)!;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      track("export", { format: activeFormat, method: "copy" });
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  };

  const copyButton = (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white dark:hover:text-neutral-950"
    >
      {copied ? "Copied!" : `Copy ${activeDef.label}`}
    </button>
  );

  return (
    <div className="rounded-[2rem] border border-black/6 bg-white/74 p-5 backdrop-blur-xl sm:p-6 dark:border-white/8 dark:bg-white/5">
      {/* Format tabs */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        {FORMATS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActiveFormat(f.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeFormat === f.id
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-white/8 dark:text-neutral-400 dark:hover:bg-white/15"
            }`}
          >
            {f.label}
            {f.pro && (
              <span className="ml-1 text-[8px] font-bold opacity-60">PRO</span>
            )}
          </button>
        ))}
      </div>

      {/* Code preview + copy */}
      <div className="flex items-start justify-between gap-4">
        <pre className="flex-1 overflow-x-auto rounded-xl bg-neutral-50 p-4 text-xs leading-5 text-neutral-600 dark:bg-white/5 dark:text-neutral-400">
          {code}
        </pre>
      </div>

      <div className="mt-3 flex justify-end">
        {activeDef.pro ? (
          <ProGate label={activeDef.label}>{copyButton}</ProGate>
        ) : (
          copyButton
        )}
      </div>
    </div>
  );
}
