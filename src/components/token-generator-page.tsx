"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { hexToRgb, rgbToHsl, hslToRgb, rgbToHex } from "@/src/lib/color-utils";
import { useLocale } from "@/src/components/locale-provider";
import { ProGate } from "@/src/components/pro-gate";
import { WhatsNext } from "@/src/components/whats-next";

/* ------------------------------------------------------------------ */
/*  Types & constants                                                   */
/* ------------------------------------------------------------------ */

const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
type ScaleStep = (typeof SCALE_STEPS)[number];

type ExportFormat = "css" | "tailwind" | "scss" | "json" | "figma" | "style-dict";

const PRESETS = [
  { name: "Ocean Blue",   primary: "#2563EB" },
  { name: "Emerald",      primary: "#10B981" },
  { name: "Rose",         primary: "#E11D48" },
  { name: "Amber",        primary: "#F59E0B" },
  { name: "Violet",       primary: "#7C3AED" },
  { name: "Teal",         primary: "#0D9488" },
  { name: "Slate",        primary: "#475569" },
  { name: "Coral",        primary: "#F97316" },
];

/* Fixed semantic hues */
const SEMANTIC = {
  success: { h: 142, s: 76, l: 36 }, // ~green-600
  warning: { h:  38, s: 92, l: 50 }, // ~amber-500
  error:   { h:   0, s: 84, l: 60 }, // ~red-500
  info:    { h: 217, s: 91, l: 60 }, // ~blue-500
} as const;

/* ------------------------------------------------------------------ */
/*  Algorithm                                                           */
/* ------------------------------------------------------------------ */

interface ScaleEntry {
  step: ScaleStep;
  hex: string;
  r: number; g: number; b: number;
  h: number; s: number; l: number;
  contrastWhite: number;
  contrastBlack: number;
}

function relativeLuminance(r: number, g: number, b: number): number {
  const lin = (c: number) => { const n = c / 255; return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4); };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(lum1: number, lum2: number): number {
  const hi = Math.max(lum1, lum2), lo = Math.min(lum1, lum2);
  return parseFloat(((hi + 0.05) / (lo + 0.05)).toFixed(2));
}

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }

function buildScale(h: number, s: number, l: number): ScaleEntry[] {
  const BASE_IDX = 5;
  return SCALE_STEPS.map((step, i) => {
    let tL: number, tS: number;
    if (i < BASE_IDX) {
      const t = i / BASE_IDX;
      const e = t * t * (3 - 2 * t);
      tL = 97 + (l - 97) * e;
      tS = s * 0.08 + (s - s * 0.08) * e;
    } else if (i === BASE_IDX) {
      tL = l; tS = s;
    } else {
      const t = (i - BASE_IDX) / (SCALE_STEPS.length - 1 - BASE_IDX);
      const e = t * t * (3 - 2 * t);
      tL = l + (7 - l) * e;
      tS = s + (s * 0.75 - s) * e;
    }
    const cL = clamp(tL, 0, 100), cS = clamp(tS, 0, 100);
    const rgb = hslToRgb(h, cS, cL);
    const hex = "#" + rgbToHex(rgb).replace("#", "").toUpperCase();
    const lum = relativeLuminance(rgb.r, rgb.g, rgb.b);
    return {
      step, hex,
      r: rgb.r, g: rgb.g, b: rgb.b,
      h: Math.round(h), s: Math.round(cS), l: Math.round(cL),
      contrastWhite: contrastRatio(lum, 1.0),
      contrastBlack: contrastRatio(lum, 0.0),
    };
  });
}

function generateScale(baseHex: string): ScaleEntry[] {
  const rgb = hexToRgb(baseHex);
  if (!rgb) return [];
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return buildScale(h, s, l);
}

function generateNeutral(baseHex: string): ScaleEntry[] {
  const rgb = hexToRgb(baseHex);
  if (!rgb) return [];
  const { h } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return buildScale(h, 10, 50); // same hue, very low saturation, mid lightness anchor
}

function generateSemantic(key: keyof typeof SEMANTIC): ScaleEntry[] {
  const { h, s, l } = SEMANTIC[key];
  return buildScale(h, s, l);
}

/* ------------------------------------------------------------------ */
/*  Export builders                                                     */
/* ------------------------------------------------------------------ */

type TokenSystem = {
  primary:  ScaleEntry[];
  neutral:  ScaleEntry[];
  success:  ScaleEntry[];
  warning:  ScaleEntry[];
  error:    ScaleEntry[];
  info:     ScaleEntry[];
};

function buildCSS(tokens: TokenSystem, varName: string): string {
  const lines: string[] = [":root {"];
  const scales = Object.entries(tokens) as [string, ScaleEntry[]][];
  for (const [name, scale] of scales) {
    lines.push(`  /* ${name} */`);
    for (const e of scale) {
      lines.push(`  --color-${name === "primary" ? varName : name}-${e.step}: ${e.hex};`);
    }
  }
  lines.push("}");
  return lines.join("\n");
}

function buildTailwind(tokens: TokenSystem, varName: string): string {
  const lines: string[] = ["/** @type {import('tailwindcss').Config} */", "module.exports = {", "  theme: {", "    extend: {", "      colors: {"];
  const scales = Object.entries(tokens) as [string, ScaleEntry[]][];
  for (const [name, scale] of scales) {
    const key = name === "primary" ? varName : name;
    lines.push(`        ${key}: {`);
    for (const e of scale) {
      lines.push(`          ${e.step}: "${e.hex}",`);
    }
    lines.push("        },");
  }
  lines.push("      },", "    },", "  },", "};");
  return lines.join("\n");
}

function buildSCSS(tokens: TokenSystem, varName: string): string {
  const lines: string[] = [];
  const scales = Object.entries(tokens) as [string, ScaleEntry[]][];
  for (const [name, scale] of scales) {
    lines.push(`// ${name}`);
    for (const e of scale) {
      lines.push(`$color-${name === "primary" ? varName : name}-${e.step}: ${e.hex};`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

function buildJSON(tokens: TokenSystem, varName: string): string {
  const out: Record<string, Record<string, { $value: string; $type: string }>> = {};
  const scales = Object.entries(tokens) as [string, ScaleEntry[]][];
  for (const [name, scale] of scales) {
    const key = name === "primary" ? varName : name;
    out[key] = {};
    for (const e of scale) {
      out[key][String(e.step)] = { $value: e.hex, $type: "color" };
    }
  }
  return JSON.stringify(out, null, 2);
}

function buildFigmaTokens(tokens: TokenSystem, varName: string): string {
  const out: Record<string, Record<string, { $type: string; $value: string }>> = {};
  const scales = Object.entries(tokens) as [string, ScaleEntry[]][];
  for (const [name, scale] of scales) {
    const key = name === "primary" ? varName : name;
    out[key] = {};
    for (const e of scale) {
      out[key][String(e.step)] = { $type: "color", $value: e.hex };
    }
  }
  return JSON.stringify(out, null, 2);
}

function buildStyleDictionary(tokens: TokenSystem, varName: string): string {
  const out: Record<string, Record<string, Record<string, { value: string; type: string }>>> = { color: {} };
  const scales = Object.entries(tokens) as [string, ScaleEntry[]][];
  for (const [name, scale] of scales) {
    const key = name === "primary" ? varName : name;
    out.color[key] = {};
    for (const e of scale) {
      out.color[key][String(e.step)] = { value: e.hex, type: "color" };
    }
  }
  return JSON.stringify(out, null, 2);
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                      */
/* ------------------------------------------------------------------ */

function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => { clearTimeout(timerRef.current); }, []);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    timerRef.current = setTimeout(() => setCopied(false), 1500);
  }, [value]);
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="ml-1 inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500 transition hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
    >
      {copied ? "Copied!" : label ?? "Copy"}
    </button>
  );
}

function ScaleStrip({ scale, label }: { scale: ScaleEntry[]; label: string }) {
  const [hovered, setHovered] = useState<ScaleStep | null>(null);
  return (
    <div className="mb-4">
      <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">{label}</p>
      <div className="overflow-hidden rounded-2xl border border-black/6 dark:border-white/8">
        <div className="flex">
          {scale.map((e) => (
            <div
              key={e.step}
              className="group relative flex-1 cursor-default"
              style={{ backgroundColor: e.hex, minHeight: 72 }}
              onMouseEnter={() => setHovered(e.step)}
              onMouseLeave={() => setHovered(null)}
            >
              <div
                className={`absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-xl border border-black/8 bg-white px-2.5 py-1.5 text-center shadow-xl transition-all dark:border-white/10 dark:bg-neutral-900 ${
                  hovered === e.step ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none"
                }`}
              >
                <p className="text-[11px] font-bold text-neutral-900 dark:text-white">{e.hex}</p>
                <p className="text-[10px] text-neutral-500">{e.step}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex border-t border-black/6 dark:border-white/8">
          {scale.map((e) => (
            <div key={e.step} className="flex-1 px-0 py-1 text-center">
              <span className="block text-[8px] font-medium text-neutral-400">{e.step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContrastBadge({ val }: { val: number }) {
  const cls =
    val >= 4.5
      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
      : val >= 3
      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
      : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400";
  return <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${cls}`}>{val}:1</span>;
}

/* ------------------------------------------------------------------ */
/*  Main page                                                           */
/* ------------------------------------------------------------------ */

export function TokenGeneratorPage() {
  const { t } = useLocale();
  const [inputHex, setInputHex] = useState("#2563EB");
  const [varName, setVarName] = useState("brand");
  const [activeFormat, setActiveFormat] = useState<ExportFormat>("css");
  const [activeScale, setActiveScale] = useState<keyof TokenSystem>("primary");
  const [expandedScale, setExpandedScale] = useState<keyof TokenSystem | null>(null);

  const tokens = useMemo<TokenSystem>(() => ({
    primary: generateScale(inputHex),
    neutral: generateNeutral(inputHex),
    success: generateSemantic("success"),
    warning: generateSemantic("warning"),
    error:   generateSemantic("error"),
    info:    generateSemantic("info"),
  }), [inputHex]);

  const exportCode = useMemo(() => {
    if (!tokens.primary.length) return "";
    switch (activeFormat) {
      case "css":         return buildCSS(tokens, varName);
      case "tailwind":    return buildTailwind(tokens, varName);
      case "scss":        return buildSCSS(tokens, varName);
      case "json":        return buildJSON(tokens, varName);
      case "figma":       return buildFigmaTokens(tokens, varName);
      case "style-dict":  return buildStyleDictionary(tokens, varName);
    }
  }, [tokens, activeFormat, varName]);

  const handleHexChange = useCallback((val: string) => {
    const cleaned = val.startsWith("#") ? val : "#" + val;
    setInputHex(cleaned.toUpperCase());
  }, []);

  const isValid = hexToRgb(inputHex) !== null;

  const scaleLabels: Record<keyof TokenSystem, string> = {
    primary: `Primary (${varName})`,
    neutral: "Neutral",
    success: "Success",
    warning: "Warning",
    error:   "Error",
    info:    "Info",
  };

  const scaleColors: Record<keyof TokenSystem, string> = {
    primary: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    neutral: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
    success: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    error:   "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    info:    "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 pb-24 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/80 px-3 py-1 backdrop-blur dark:border-white/10 dark:bg-neutral-900/60">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">Free Tool</span>
          </div>
          <h1 className="mb-3 text-3xl font-bold text-neutral-900 sm:text-4xl dark:text-white">
            Design Token Generator
          </h1>
          <p className="mx-auto max-w-xl text-base text-neutral-500 dark:text-neutral-400">
            Enter a brand color to generate a complete design token system — primary, neutral, and semantic color scales — ready to export as CSS, Tailwind, SCSS, or JSON.
          </p>
        </div>

        {/* Input controls */}
        <div className="mb-8 rounded-[2rem] border border-black/6 bg-white/74 p-6 backdrop-blur-xl sm:p-8 dark:border-white/8 dark:bg-neutral-900/60">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Color picker */}
            <div>
              <label htmlFor="token-primary-hex" className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Brand Primary Color
              </label>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="color"
                    value={isValid ? inputHex : "#2563EB"}
                    onChange={(e) => handleHexChange(e.target.value)}
                    className="h-12 w-12 cursor-pointer rounded-xl border-2 border-black/10 bg-transparent p-0.5 dark:border-white/10"
                    aria-label="Pick brand color"
                  />
                </div>
                <input
                  id="token-primary-hex"
                  type="text"
                  value={inputHex}
                  onChange={(e) => handleHexChange(e.target.value)}
                  maxLength={7}
                  className={`flex-1 rounded-xl border bg-white px-3 py-2.5 font-mono text-sm tracking-wide transition focus:outline-none focus:ring-2 dark:bg-neutral-800 dark:text-white ${
                    isValid
                      ? "border-black/10 focus:ring-blue-400 dark:border-white/10"
                      : "border-red-300 focus:ring-red-400"
                  }`}
                  placeholder="#2563EB"
                  aria-label="Hex color value"
                />
              </div>
              {!isValid && (
                <p className="mt-1.5 text-xs text-red-500">Enter a valid 6-digit hex color (e.g. #2563EB)</p>
              )}
            </div>

            {/* Variable name */}
            <div>
              <label htmlFor="token-var-name" className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Token Name (for primary scale)
              </label>
              <input
                id="token-var-name"
                type="text"
                value={varName}
                onChange={(e) => setVarName(e.target.value.replace(/[^a-zA-Z0-9-_]/g, "").toLowerCase() || "brand")}
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 font-mono text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-white/10 dark:bg-neutral-800 dark:text-white"
                placeholder="brand"
                maxLength={32}
                aria-label="Token variable name"
              />
              <p className="mt-1.5 text-xs text-neutral-400">Used in export: <code className="font-mono">--color-{varName}-500</code></p>
            </div>
          </div>

          {/* Presets */}
          <div className="mt-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">Presets</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.primary}
                  type="button"
                  onClick={() => { handleHexChange(p.primary); }}
                  className="flex items-center gap-1.5 rounded-full border border-black/8 bg-white/80 px-3 py-1.5 text-xs font-medium text-neutral-600 transition hover:border-black/15 hover:bg-neutral-50 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                  <span className="h-3 w-3 rounded-full border border-black/10 flex-shrink-0" style={{ backgroundColor: p.primary }} />
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isValid && tokens.primary.length > 0 && (
          <>
            {/* Scale previews */}
            <div className="mb-8 rounded-[2rem] border border-black/6 bg-white/74 p-6 backdrop-blur-xl sm:p-8 dark:border-white/8 dark:bg-neutral-900/60">
              <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Token Preview — 6 Scales × 11 Steps
              </h2>

              {(Object.entries(tokens) as [keyof TokenSystem, ScaleEntry[]][]).map(([key, scale]) => (
                <ScaleStrip key={key} scale={scale} label={scaleLabels[key]} />
              ))}
            </div>

            {/* Scale detail table */}
            <div className="mb-8 rounded-[2rem] border border-black/6 bg-white/74 backdrop-blur-xl dark:border-white/8 dark:bg-neutral-900/60">
              {/* Tab bar */}
              <div className="flex overflow-x-auto border-b border-black/6 dark:border-white/8">
                {(Object.keys(tokens) as (keyof TokenSystem)[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveScale(key)}
                    aria-pressed={activeScale === key}
                    className={`flex-shrink-0 px-5 py-3 text-xs font-medium uppercase tracking-[0.14em] transition ${
                      activeScale === key
                        ? "border-b-2 border-neutral-900 text-neutral-900 dark:border-white dark:text-white"
                        : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                    }`}
                  >
                    {scaleLabels[key]}
                  </button>
                ))}
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/6 dark:border-white/8">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">Step</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">Preview</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">HEX</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-neutral-400 hidden sm:table-cell">RGB</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-neutral-400 hidden md:table-cell">HSL</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">vs White</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">vs Black</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokens[activeScale].map((e, idx) => (
                      <tr
                        key={e.step}
                        className={`border-b border-black/4 last:border-0 transition hover:bg-neutral-50 dark:border-white/5 dark:hover:bg-white/5 ${
                          idx === 5 ? "bg-neutral-50/80 dark:bg-white/5" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold ${idx === 5 ? "text-blue-600 dark:text-blue-400" : "text-neutral-500"}`}>
                            {e.step}{idx === 5 && <span className="ml-1 text-[9px] text-blue-400 uppercase tracking-widest">base</span>}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block h-6 w-10 rounded-md border border-black/8 dark:border-white/10" style={{ backgroundColor: e.hex }} />
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-neutral-700 dark:text-neutral-300">{e.hex}</span>
                          <CopyButton value={e.hex} label="Copy" />
                        </td>
                        <td className="hidden px-4 py-3 font-mono text-xs text-neutral-500 sm:table-cell">{e.r}, {e.g}, {e.b}</td>
                        <td className="hidden px-4 py-3 font-mono text-xs text-neutral-500 md:table-cell">{e.h}°, {e.s}%, {e.l}%</td>
                        <td className="px-4 py-3"><ContrastBadge val={e.contrastWhite} /></td>
                        <td className="px-4 py-3"><ContrastBadge val={e.contrastBlack} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Export */}
            <ProGate label="Export all 6 scales in CSS, Tailwind, SCSS, and JSON">
            <div className="mb-8 rounded-[2rem] border border-black/6 bg-white/74 p-6 backdrop-blur-xl sm:p-8 dark:border-white/8 dark:bg-neutral-900/60">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-400">Export Tokens</h2>
                <CopyButton value={exportCode} label="Copy All" />
              </div>

              {/* Format tabs */}
              <div className="mb-4 inline-flex overflow-hidden rounded-full border border-black/8 dark:border-white/10">
                {(["css", "tailwind", "scss", "json", "figma", "style-dict"] as const).map((fmt) => {
                  const labels: Record<ExportFormat, string> = {
                    css: "CSS Vars", tailwind: "Tailwind", scss: "SCSS",
                    json: "JSON (W3C)", figma: "Figma", "style-dict": "Style Dict",
                  };
                  return (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setActiveFormat(fmt)}
                    aria-pressed={activeFormat === fmt}
                    className={`px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] transition ${
                      activeFormat === fmt
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                        : "bg-white text-neutral-500 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                    }`}
                  >
                    {labels[fmt]}
                  </button>
                  );
                })}
              </div>

              {/* Code block */}
              <pre className="max-h-96 overflow-auto rounded-2xl bg-neutral-950 p-5 text-[11px] leading-relaxed text-neutral-300 dark:bg-neutral-900">
                <code>{exportCode}</code>
              </pre>
            </div>
            </ProGate>

            {/* Usage guide */}
            <div className="rounded-[2rem] border border-black/6 bg-white/74 p-6 backdrop-blur-xl sm:p-8 dark:border-white/8 dark:bg-neutral-900/60">
              <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">How to use this token system</h2>
              <div className="grid gap-5 sm:grid-cols-2 text-sm text-neutral-600 dark:text-neutral-400">
                <div>
                  <h3 className="mb-1.5 font-semibold text-neutral-800 dark:text-neutral-200">Primary scale ({varName})</h3>
                  <p>Generated from your brand color as step 500. Steps 50–400 are tints for backgrounds, hover states, and subtle UI surfaces. Steps 600–950 are shades for text, borders, and pressed states. Use step 500 for primary CTAs and interactive elements.</p>
                </div>
                <div>
                  <h3 className="mb-1.5 font-semibold text-neutral-800 dark:text-neutral-200">Neutral scale</h3>
                  <p>Built from the same hue as your brand color at very low saturation (10%). This creates a neutral palette that is subtly harmonious with your brand without being visibly tinted. Use for background surfaces, borders, and body text.</p>
                </div>
                <div>
                  <h3 className="mb-1.5 font-semibold text-neutral-800 dark:text-neutral-200">Semantic scales</h3>
                  <p>Fixed hue-based scales for success (green), warning (amber), error (red), and info (blue). These are independent of your brand color — semantic meaning must remain consistent across contexts. Use them only for feedback states, never for decoration.</p>
                </div>
                <div>
                  <h3 className="mb-1.5 font-semibold text-neutral-800 dark:text-neutral-200">Contrast badges</h3>
                  <p>Green badge = WCAG AA compliant (≥4.5:1 for normal text, ≥3:1 for large text). Amber = passes for large text only. Grey = fails AA. Step 700–900 of any scale typically passes AA on white; step 50–300 passes AA on black.</p>
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-black/5 bg-neutral-50 p-4 text-xs text-neutral-500 dark:border-white/5 dark:bg-neutral-800/50 dark:text-neutral-400">
                <strong className="font-semibold text-neutral-700 dark:text-neutral-300">Tip:</strong> For CSS custom properties, import the generated CSS into your root stylesheet. For Tailwind, paste the colors object into the <code className="font-mono">theme.extend.colors</code> section of your config file. For Style Dictionary users, the JSON export follows the W3C Design Token Community Group format.
              </div>
            </div>
          </>
        )}

        <WhatsNext items={[
          { href: "/contrast/", label: "Audit Contrast", desc: "Check WCAG compliance for your token system" },
          { href: "/preview/", label: "Preview in UI", desc: "See your colors applied to real components" },
          { href: "/pro/", label: "Complete Archive", desc: "All 5,000+ colors as production-ready tokens" },
        ]} />
      </div>
    </main>
  );
}
