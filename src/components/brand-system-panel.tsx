"use client";

import { useState, useMemo } from "react";
import {
  generateBrandPalette,
  buildBrandCssVariables,
  buildBrandTailwindConfig,
  buildBrandFigmaTokens,
  buildBrandStyleDictionary,
  hexContrastRatio,
  wcagLabel,
  type BrandPalette,
  type ScaleColor,
  type SemanticColor,
} from "@/src/lib/brand-palette";
import { buildDarkModePairs, buildDarkModeCss } from "@/src/lib/dark-mode-pairs";
import { CopyActionButton } from "@/src/components/copy-action-button";

type ExportFormat = "css" | "tailwind" | "figma" | "style-dict" | "dark-mode";

function ScaleRow({ colors, label }: { colors: ScaleColor[]; label: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex rounded-xl overflow-hidden border border-black/6">
        {colors.map((c) => (
          <div key={c.step} className="flex-1 group relative" style={{ backgroundColor: c.hex }}>
            <div className="h-10" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40">
              <span className="text-[9px] font-mono text-white">{c.step}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SemanticRow({ semantics }: { semantics: SemanticColor[] }) {
  return (
    <div>
      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Semantic</p>
      <div className="grid grid-cols-4 gap-2">
        {semantics.map((s) => (
          <div key={s.role} className="rounded-xl overflow-hidden border border-black/6">
            <div className="h-8" style={{ backgroundColor: s.hex }} />
            <div className="px-2 py-1.5 bg-white dark:bg-neutral-900">
              <p className="text-[10px] font-semibold text-neutral-700 dark:text-neutral-300">{s.label}</p>
              <p className="text-[9px] font-mono text-neutral-400">{s.hex}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContrastGrid({ palette }: { palette: BrandPalette }) {
  const pairs = [
    { bg: palette.primary.colors[0].hex, label: "Primary 50" },
    { bg: palette.primary.colors[5].hex, label: "Primary 500" },
    { bg: palette.primary.colors[10].hex, label: "Primary 950" },
    { bg: palette.neutral.colors[0].hex, label: "Neutral 50" },
    { bg: palette.neutral.colors[10].hex, label: "Neutral 950" },
  ];
  const textColors = ["#FFFFFF", "#000000"];

  return (
    <div>
      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Contrast check</p>
      <div className="grid gap-1 text-[10px]">
        {pairs.map((p) =>
          textColors.map((text) => {
            const ratio = hexContrastRatio(p.bg, text);
            const label = wcagLabel(ratio);
            return (
              <div key={`${p.bg}-${text}`} className="flex items-center gap-2 px-2 py-1 rounded-lg border border-black/4 bg-neutral-50 dark:bg-neutral-900">
                <div className="w-5 h-5 rounded-md border border-black/10" style={{ backgroundColor: p.bg }} />
                <div className="w-5 h-5 rounded-md border border-black/10" style={{ backgroundColor: text }} />
                <span className="font-mono text-neutral-500">{p.label} + {text === "#FFFFFF" ? "White" : "Black"}</span>
                <span className="ml-auto font-semibold" style={{ color: label === "Fail" ? "#ef4444" : label === "AAA" ? "#22c55e" : "#eab308" }}>
                  {ratio}:1 {label}
                </span>
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}

interface BrandSystemPanelProps {
  primaryHex: string;
}

export function BrandSystemPanel({ primaryHex }: BrandSystemPanelProps) {
  const [format, setFormat] = useState<ExportFormat>("css");
  const palette = useMemo(() => generateBrandPalette(primaryHex), [primaryHex]);

  // Lazy export generation — only compute the selected format.
  // Keep this useMemo BEFORE any early return so hook order stays stable.
  const exportText = useMemo(() => {
    if (!palette) return "";
    switch (format) {
      case "css": return buildBrandCssVariables(palette);
      case "tailwind": return buildBrandTailwindConfig(palette);
      case "figma": return buildBrandFigmaTokens(palette);
      case "style-dict": return buildBrandStyleDictionary(palette);
      case "dark-mode": {
        const darkPairs = buildDarkModePairs(
          palette.primary.colors.filter((c) => [50, 100, 500, 900, 950].includes(c.step)).map((c) => ({ name: `primary-${c.step}`, hex: c.hex })),
          "brand",
        );
        return buildDarkModeCss(darkPairs, "brand");
      }
    }
  }, [palette, format]);

  if (!palette) return null;

  const formatLabels: Record<ExportFormat, string> = {
    css: "CSS",
    tailwind: "Tailwind",
    figma: "Figma",
    "style-dict": "Style Dict",
    "dark-mode": "Dark Mode",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: primaryHex }} />
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Full Brand System</h3>
        <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-600 rounded-full dark:bg-indigo-900/30 dark:text-indigo-400">
          Pro
        </span>
      </div>

      {/* Scales */}
      <ScaleRow colors={palette.primary.colors} label="Primary scale (50–950)" />
      <ScaleRow colors={palette.neutral.colors} label="Neutral scale (brand-tinted)" />
      <SemanticRow semantics={palette.semantics} />
      <ContrastGrid palette={palette} />

      {/* Export format toggle */}
      <div className="flex flex-wrap items-center gap-1 bg-neutral-100 dark:bg-white/8 rounded-lg p-1">
        {(Object.keys(formatLabels) as ExportFormat[]).map((f) => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              format === f
                ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700"
            }`}
          >
            {formatLabels[f]}
          </button>
        ))}
      </div>

      {/* Code output */}
      <div className="relative">
        <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-black/6 bg-neutral-50 dark:bg-neutral-900 px-4 py-4 text-xs leading-6 text-neutral-600 dark:text-neutral-400 max-h-72 overflow-y-auto">
          {exportText}
        </pre>
        <div className="absolute top-2 right-2">
          <CopyActionButton value={exportText} label="Copy" />
        </div>
      </div>
    </div>
  );
}
