"use client";

import { useState, useCallback, useMemo } from "react";
import { hexToRgb, rgbToHsl, hslToRgb, rgbToHex } from "@/src/lib/color-utils";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
type ScaleStep = (typeof SCALE_STEPS)[number];

const PRESETS = [
  { name: "Ocean Blue", hex: "#2563EB" },
  { name: "Emerald", hex: "#10B981" },
  { name: "Rose", hex: "#E11D48" },
  { name: "Amber", hex: "#F59E0B" },
  { name: "Violet", hex: "#7C3AED" },
  { name: "Teal", hex: "#0D9488" },
  { name: "Slate", hex: "#475569" },
  { name: "Orange", hex: "#EA580C" },
];

type ExportFormat = "css" | "tailwind" | "sass" | "json";

/* ------------------------------------------------------------------ */
/*  Algorithm                                                          */
/* ------------------------------------------------------------------ */

interface ScaleEntry {
  step: ScaleStep;
  hex: string;
  r: number;
  g: number;
  b: number;
  h: number;
  s: number;
  l: number;
  contrastWhite: number;
  contrastBlack: number;
}

function relativeLuminance(r: number, g: number, b: number): number {
  const linearize = (c: number) => {
    const n = c / 255;
    return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

function contrastRatio(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function generateScale(baseHex: string): ScaleEntry[] {
  const rgb = hexToRgb(baseHex);
  if (!rgb) return [];

  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const BASE_INDEX = 5; // index of step 500

  return SCALE_STEPS.map((step, i) => {
    let targetL: number;
    let targetS: number;

    if (i < BASE_INDEX) {
      // Lighter: interpolate from (97%, S*0.08) at step 50 → (L, S) at step 500
      const t = i / BASE_INDEX;
      const ease = t * t * (3 - 2 * t); // smooth step
      targetL = 97 + (l - 97) * ease;
      targetS = s * 0.08 + (s - s * 0.08) * ease;
    } else if (i === BASE_INDEX) {
      // Step 500 = base color exactly
      targetL = l;
      targetS = s;
    } else {
      // Darker: interpolate from (L, S) at step 500 → (7%, S*0.75) at step 950
      const t = (i - BASE_INDEX) / (SCALE_STEPS.length - 1 - BASE_INDEX);
      const ease = t * t * (3 - 2 * t);
      targetL = l + (7 - l) * ease;
      targetS = s + (s * 0.75 - s) * ease;
    }

    const clampedL = clamp(targetL, 0, 100);
    const clampedS = clamp(targetS, 0, 100);
    const stepRgb = hslToRgb(h, clampedS, clampedL);
    const stepHex = "#" + rgbToHex(stepRgb).replace("#", "").toUpperCase();

    const lum = relativeLuminance(stepRgb.r, stepRgb.g, stepRgb.b);
    const lumWhite = 1.0;
    const lumBlack = 0.0;

    return {
      step,
      hex: stepHex,
      r: stepRgb.r,
      g: stepRgb.g,
      b: stepRgb.b,
      h: Math.round(h),
      s: Math.round(clampedS),
      l: Math.round(clampedL),
      contrastWhite: Math.round(contrastRatio(lum, lumWhite) * 10) / 10,
      contrastBlack: Math.round(contrastRatio(lum, lumBlack) * 10) / 10,
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Export generators                                                  */
/* ------------------------------------------------------------------ */

function toCssVars(scale: ScaleEntry[], name: string): string {
  const safeName = name.toLowerCase().replace(/[^a-z0-9]/g, "-");
  return `:root {\n${scale.map((e) => `  --color-${safeName}-${e.step}: ${e.hex};`).join("\n")}\n}`;
}

function toTailwindConfig(scale: ScaleEntry[], name: string): string {
  const safeName = name.toLowerCase().replace(/[^a-z0-9]/g, "-") || "primary";
  const entries = scale.map((e) => `    ${e.step}: "${e.hex}",`).join("\n");
  return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        ${safeName}: {\n${entries}\n        },\n      },\n    },\n  },\n};`;
}

function toSassVars(scale: ScaleEntry[], name: string): string {
  const safeName = name.toLowerCase().replace(/[^a-z0-9]/g, "-");
  return scale.map((e) => `$${safeName}-${e.step}: ${e.hex};`).join("\n");
}

function toJson(scale: ScaleEntry[], name: string): string {
  const safeName = name.toLowerCase().replace(/[^a-z0-9]/g, "-") || "primary";
  const obj: Record<string, string> = {};
  for (const e of scale) obj[String(e.step)] = e.hex;
  return JSON.stringify({ [safeName]: obj }, null, 2);
}

/* ------------------------------------------------------------------ */
/*  CopyButton                                                         */
/* ------------------------------------------------------------------ */

function CopyButton({ value, label, small }: { value: string; label: string; small?: boolean }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }, [value]);

  if (small) {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className="text-[10px] font-medium uppercase tracking-widest text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition"
      >
        {copied ? "✓" : "Copy"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-white dark:hover:text-neutral-900"
    >
      {copied ? "Copied!" : label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function TintsShadesPage() {
  const [hexInput, setHexInput] = useState("#2563EB");
  const [paletteName, setPaletteName] = useState("primary");
  const [activeFormat, setActiveFormat] = useState<ExportFormat>("css");
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  /* Normalize and validate hex */
  const validHex = useMemo(() => {
    const raw = hexInput.trim();
    const withHash = raw.startsWith("#") ? raw : `#${raw}`;
    const rgb = hexToRgb(withHash);
    return rgb ? withHash.toUpperCase() : null;
  }, [hexInput]);

  const scale = useMemo(() => {
    return validHex ? generateScale(validHex) : [];
  }, [validHex]);

  const exportCode = useMemo(() => {
    if (!scale.length) return "";
    switch (activeFormat) {
      case "css":
        return toCssVars(scale, paletteName);
      case "tailwind":
        return toTailwindConfig(scale, paletteName);
      case "sass":
        return toSassVars(scale, paletteName);
      case "json":
        return toJson(scale, paletteName);
    }
  }, [scale, paletteName, activeFormat]);

  const handleHexChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setHexInput(e.target.value);
  }, []);

  const handlePickerChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setHexInput(e.target.value.toUpperCase());
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-50 pb-24 pt-28 dark:bg-neutral-950">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-blue-200/40 to-violet-200/30 blur-3xl dark:from-blue-900/20 dark:to-violet-900/15" />
      <div className="pointer-events-none absolute -right-32 top-40 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-emerald-200/40 to-teal-100/30 blur-3xl dark:from-emerald-900/20 dark:to-teal-900/15" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
        {/* Hero */}
        <section className="mb-10 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl dark:text-white">
            Tints &amp; Shades Generator
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-neutral-500 dark:text-neutral-400">
            Generate a full 11-step tonal scale from any color — tints (50–400),
            the base (500), and shades (600–950). Export as CSS variables, Tailwind
            config, Sass, or JSON.
          </p>
        </section>

        {/* Input panel */}
        <div className="mb-6 rounded-[2rem] border border-black/6 bg-white/74 p-6 backdrop-blur-xl sm:p-8 dark:border-white/8 dark:bg-neutral-900/60">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
            {/* Color picker */}
            <div className="flex items-center gap-3">
              <label className="relative block h-14 w-14 flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl border-2 border-black/10 shadow-sm dark:border-white/10">
                <input
                  type="color"
                  value={validHex ?? "#2563EB"}
                  onChange={handlePickerChange}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  aria-label="Pick a color"
                />
                <span
                  className="block h-full w-full"
                  style={{ backgroundColor: validHex ?? "#2563EB" }}
                />
              </label>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  HEX Color
                </label>
                <input
                  type="text"
                  value={hexInput}
                  onChange={handleHexChange}
                  placeholder="#2563EB"
                  maxLength={7}
                  aria-label="Enter hex color"
                  className={`w-36 rounded-xl border px-3 py-2 font-mono text-sm uppercase tracking-wider transition focus:outline-none focus:ring-2 ${
                    validHex
                      ? "border-black/10 bg-white text-neutral-900 focus:ring-blue-500/40 dark:border-white/10 dark:bg-neutral-800 dark:text-white"
                      : "border-red-300 bg-red-50 text-red-700 focus:ring-red-400/40 dark:border-red-700 dark:bg-red-950/30 dark:text-red-300"
                  }`}
                />
                {!validHex && hexInput.length > 0 && (
                  <p className="mt-1 text-xs text-red-500">Enter a valid 6-digit hex</p>
                )}
              </div>
            </div>

            {/* Palette name */}
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Palette Name
              </label>
              <input
                type="text"
                value={paletteName}
                onChange={(e) => setPaletteName(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ""))}
                placeholder="primary"
                maxLength={32}
                aria-label="Palette name for export"
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-white/10 dark:bg-neutral-800 dark:text-white"
              />
            </div>

            {/* Presets */}
            <div>
              <span className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Presets
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.hex}
                    type="button"
                    onClick={() => setHexInput(p.hex)}
                    title={p.name}
                    aria-label={`Use ${p.name} preset`}
                    className="h-7 w-7 rounded-full border-2 border-white shadow-sm transition hover:scale-110 dark:border-neutral-700"
                    style={{ backgroundColor: p.hex }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Color scale */}
        {scale.length > 0 && (
          <>
            {/* Swatch strip */}
            <div className="mb-6 overflow-hidden rounded-[2rem] border border-black/6 shadow-sm dark:border-white/8">
              <div className="flex">
                {scale.map((entry) => (
                  <div
                    key={entry.step}
                    className="group relative flex-1 cursor-default"
                    style={{ backgroundColor: entry.hex, minHeight: 120 }}
                    onMouseEnter={() => setHoveredStep(entry.step)}
                    onMouseLeave={() => setHoveredStep(null)}
                  >
                    {/* Hover tooltip */}
                    <div
                      className={`absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-xl border border-black/8 bg-white px-3 py-2 text-center shadow-xl transition-all dark:border-white/10 dark:bg-neutral-900 ${
                        hoveredStep === entry.step ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none"
                      }`}
                    >
                      <p className="text-[11px] font-bold text-neutral-900 dark:text-white">{entry.hex}</p>
                      <p className="text-[10px] text-neutral-500">
                        rgb({entry.r}, {entry.g}, {entry.b})
                      </p>
                      <p className="text-[10px] text-neutral-500">
                        hsl({entry.h}, {entry.s}%, {entry.l}%)
                      </p>
                      <div className="mt-1 flex gap-1 justify-center">
                        <span className={`rounded px-1 text-[9px] font-medium ${entry.contrastWhite >= 4.5 ? "bg-green-100 text-green-700" : entry.contrastWhite >= 3 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-600"}`}>
                          W {entry.contrastWhite}:1
                        </span>
                        <span className={`rounded px-1 text-[9px] font-medium ${entry.contrastBlack >= 4.5 ? "bg-green-100 text-green-700" : entry.contrastBlack >= 3 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-600"}`}>
                          B {entry.contrastBlack}:1
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scale table */}
            <div className="mb-6 overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 backdrop-blur-xl dark:border-white/8 dark:bg-neutral-900/60">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/6 dark:border-white/8">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                        Step
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                        Preview
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                        HEX
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-neutral-400 hidden sm:table-cell">
                        RGB
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-neutral-400 hidden md:table-cell">
                        HSL
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                        Contrast
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {scale.map((entry, idx) => (
                      <tr
                        key={entry.step}
                        className={`border-b border-black/4 last:border-0 transition hover:bg-neutral-50 dark:border-white/5 dark:hover:bg-white/5 ${
                          idx === 5 ? "bg-neutral-50/80 dark:bg-white/5" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold ${idx === 5 ? "text-blue-600 dark:text-blue-400" : "text-neutral-500"}`}>
                            {entry.step}
                            {idx === 5 && (
                              <span className="ml-1 text-[9px] font-medium uppercase tracking-widest text-blue-400">
                                base
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-block h-6 w-10 rounded-md border border-black/8 dark:border-white/10"
                            style={{ backgroundColor: entry.hex }}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-neutral-700 dark:text-neutral-300">
                            {entry.hex}
                          </span>
                          <CopyButton value={entry.hex} label="Copy" small />
                        </td>
                        <td className="hidden px-4 py-3 font-mono text-xs text-neutral-500 sm:table-cell">
                          {entry.r}, {entry.g}, {entry.b}
                        </td>
                        <td className="hidden px-4 py-3 font-mono text-xs text-neutral-500 md:table-cell">
                          {entry.h}°, {entry.s}%, {entry.l}%
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                entry.contrastWhite >= 4.5
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                                  : entry.contrastWhite >= 3
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                                  : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                              }`}
                              title={`Contrast vs white: ${entry.contrastWhite}:1`}
                            >
                              W {entry.contrastWhite}:1
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                entry.contrastBlack >= 4.5
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                                  : entry.contrastBlack >= 3
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                                  : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                              }`}
                              title={`Contrast vs black: ${entry.contrastBlack}:1`}
                            >
                              B {entry.contrastBlack}:1
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Export section */}
            <div className="rounded-[2rem] border border-black/6 bg-white/74 p-6 backdrop-blur-xl sm:p-8 dark:border-white/8 dark:bg-neutral-900/60">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  Export
                </span>
                <div className="flex gap-1">
                  <CopyButton value={exportCode} label="Copy All" />
                </div>
              </div>

              {/* Format tabs */}
              <div className="mb-4 inline-flex overflow-hidden rounded-full border border-black/8 dark:border-white/10">
                {(["css", "tailwind", "sass", "json"] as const).map((fmt) => (
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
                    {fmt === "tailwind" ? "Tailwind" : fmt === "css" ? "CSS Vars" : fmt === "sass" ? "Sass" : "JSON"}
                  </button>
                ))}
              </div>

              {/* Code block */}
              <pre className="overflow-x-auto rounded-2xl bg-neutral-950 p-5 text-[11px] leading-relaxed text-neutral-300 dark:bg-neutral-900">
                <code>{exportCode}</code>
              </pre>
            </div>

            {/* How it works */}
            <div className="mt-6 rounded-[2rem] border border-black/6 bg-white/74 p-6 backdrop-blur-xl sm:p-8 dark:border-white/8 dark:bg-neutral-900/60">
              <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
                How the scale is generated
              </h2>
              <div className="grid gap-4 sm:grid-cols-3 text-sm text-neutral-600 dark:text-neutral-400">
                <div>
                  <h3 className="mb-1 font-medium text-neutral-800 dark:text-neutral-200">Steps 50–400 (Tints)</h3>
                  <p>The base color's hue is preserved. Lightness is interpolated upward toward 97% and saturation is reduced to create clean, light tints suitable for backgrounds and subtle UI surfaces.</p>
                </div>
                <div>
                  <h3 className="mb-1 font-medium text-neutral-800 dark:text-neutral-200">Step 500 (Base)</h3>
                  <p>The exact color you entered, used as the identity anchor for the scale. Step 500 is typically the primary action color in design systems.</p>
                </div>
                <div>
                  <h3 className="mb-1 font-medium text-neutral-800 dark:text-neutral-200">Steps 600–950 (Shades)</h3>
                  <p>Lightness is interpolated downward toward 7% while keeping the hue consistent. Darker steps are ideal for text, borders, and hover states.</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-neutral-400">
                Contrast badges show WCAG ratios versus white (W) and black (B). Green = AA compliant (≥4.5:1 for normal text), amber = large text only (≥3:1), grey = fails AA.
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
