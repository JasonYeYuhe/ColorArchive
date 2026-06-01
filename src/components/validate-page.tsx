"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { hexToRgb, rgbToHsl, rgbToHex, hslToRgb } from "@/src/lib/color-convert";
import { hexContrastRatio, wcagLabel } from "@/src/lib/brand-palette";
import { getColorFamily } from "@/src/lib/color-filter";
import { findClosestArchiveColor } from "@/src/lib/color-relationships";
import { generateColorName } from "@/src/lib/color-naming";
import {
  simulateColorBlindness,
  hexToRgbCB,
  rgbToHexCB,
  COLOR_BLIND_INFO,
  type ColorBlindType,
  type RGB,
} from "@/src/lib/colorblind";
import { colors as allColors } from "@/src/data/colors";
import { ToolUpsellBanner } from "@/src/components/tool-upsell-banner";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ParsedColor {
  hex: string;
  r: number;
  g: number;
  b: number;
  h: number;
  s: number;
  l: number;
  family: string;
  poeticName: string;
  closestArchive: string | null;
}

interface ContrastPair {
  i: number;
  j: number;
  hex1: string;
  hex2: string;
  ratio: number;
  label: "AAA" | "AA" | "AA Large" | "Fail";
}

type HarmonyType =
  | "Monochromatic"
  | "Analogous"
  | "Complementary"
  | "Split-Complementary"
  | "Triadic"
  | "Tetradic"
  | "Polychromatic";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseHexColors(input: string): string[] {
  const matches = input.match(/#?[0-9A-Fa-f]{3,6}\b/g) ?? [];
  const unique = Array.from(
    new Set(
      matches
        .map((m) => {
          const clean = m.replace(/^#/, "");
          const expanded =
            clean.length === 3
              ? clean.split("").map((c) => c + c).join("")
              : clean;
          if (expanded.length !== 6 || !/^[0-9A-Fa-f]{6}$/.test(expanded)) return null;
          return `#${expanded.toUpperCase()}`;
        })
        .filter((h): h is string => h !== null),
    ),
  );
  return unique.slice(0, 8);
}

function analyzeColors(hexes: string[]): ParsedColor[] {
  return hexes.map((hex) => {
    const rgb = hexToRgb(hex)!;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const family = hsl.s < 5 ? "Neutral" : getColorFamily(hsl.h);
    const nameResult = generateColorName(hex);
    const closest = findClosestArchiveColor(allColors, hex);
    return {
      hex,
      r: rgb.r,
      g: rgb.g,
      b: rgb.b,
      h: hsl.h,
      s: hsl.s,
      l: hsl.l,
      family,
      poeticName: nameResult?.poeticName ?? hex,
      closestArchive: closest?.name ?? null,
    };
  });
}

function buildContrastPairs(hexes: string[]): ContrastPair[] {
  const pairs: ContrastPair[] = [];
  for (let i = 0; i < hexes.length; i++) {
    for (let j = i + 1; j < hexes.length; j++) {
      const ratio = hexContrastRatio(hexes[i], hexes[j]);
      pairs.push({ i, j, hex1: hexes[i], hex2: hexes[j], ratio, label: wcagLabel(ratio) });
    }
  }
  return pairs;
}

function hueDiff(a: number, b: number): number {
  const d = Math.abs(a - b);
  return d > 180 ? 360 - d : d;
}

function detectHarmony(colors: ParsedColor[]): { type: HarmonyType; description: string } {
  const chromatic = colors.filter((c) => c.s >= 10);
  if (chromatic.length < 2) {
    const allLow = colors.every((c) => c.s < 10);
    if (allLow) return { type: "Monochromatic", description: "All colors are neutral/achromatic tones varying in lightness." };
    return { type: "Monochromatic", description: "A single hue family with lightness/saturation variations." };
  }

  const hues = chromatic.map((c) => c.h);

  // Check if hues are within a tight range (monochromatic/analogous)
  const maxDiff = Math.max(...hues.flatMap((a, i) => hues.slice(i + 1).map((b) => hueDiff(a, b))));

  if (maxDiff <= 15) {
    return { type: "Monochromatic", description: "Colors share the same hue family, differing in lightness and saturation. Great for creating visual hierarchy." };
  }
  if (maxDiff <= 40) {
    return { type: "Analogous", description: "Adjacent hues on the color wheel. Produces harmonious, cohesive palettes that feel natural." };
  }

  if (chromatic.length === 2) {
    const diff = hueDiff(hues[0], hues[1]);
    if (diff >= 150 && diff <= 210)
      return { type: "Complementary", description: "Two hues opposite on the color wheel. High contrast and vibrant when used together." };
    return { type: "Polychromatic", description: "Mixed hue distribution across the color wheel." };
  }

  if (chromatic.length === 3) {
    const diffs = [hueDiff(hues[0], hues[1]), hueDiff(hues[1], hues[2]), hueDiff(hues[0], hues[2])];
    const sorted = [...diffs].sort((a, b) => a - b);
    if (sorted.every((d) => d >= 90 && d <= 150))
      return { type: "Triadic", description: "Three hues equally spaced around the color wheel (~120 degrees apart). Bold and balanced." };
    // Check split-complementary
    if (sorted[0] <= 50 && sorted[2] >= 130)
      return { type: "Split-Complementary", description: "A base hue plus two colors adjacent to its complement. Offers contrast with less tension than complementary." };
  }

  if (chromatic.length >= 4) {
    const diffs = hues.flatMap((a, i) => hues.slice(i + 1).map((b) => hueDiff(a, b)));
    const sorted = [...diffs].sort((a, b) => a - b);
    const hasOpposites = sorted.some((d) => d >= 150 && d <= 210);
    const hasAdjacent = sorted.some((d) => d <= 50);
    if (hasOpposites && hasAdjacent)
      return { type: "Tetradic", description: "Four hues forming a rectangular pattern on the color wheel. Rich palette with lots of variety." };
  }

  return { type: "Polychromatic", description: "Colors are distributed broadly across the color wheel. Vibrant and diverse, but may need careful balancing." };
}

function colorblindDeltaE(rgb1: RGB, rgb2: RGB): number {
  const dr = rgb1.r - rgb2.r;
  const dg = rgb1.g - rgb2.g;
  const db = rgb1.b - rgb2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function computeScore(
  colors: ParsedColor[],
  contrastPairs: ContrastPair[],
  harmony: HarmonyType,
): { total: number; contrast: number; diversity: number; lightness: number; colorblind: number } {
  const n = contrastPairs.length;

  // Contrast coverage: % of pairs passing AA (0-25 points)
  const passAA = contrastPairs.filter((p) => p.ratio >= 4.5).length;
  const contrast = n > 0 ? Math.round((passAA / n) * 25) : 0;

  // Hue diversity: spread across wheel (0-25 points)
  const chromatic = colors.filter((c) => c.s >= 10);
  let diversity = 0;
  if (chromatic.length >= 2) {
    const hues = chromatic.map((c) => c.h);
    const maxSpread = Math.max(...hues.flatMap((a, i) => hues.slice(i + 1).map((b) => hueDiff(a, b))));
    diversity = Math.min(25, Math.round((maxSpread / 180) * 25));
  }

  // Lightness range: covers light and dark (0-25 points)
  const lights = colors.map((c) => c.l);
  const lRange = Math.max(...lights) - Math.min(...lights);
  const lightness = Math.min(25, Math.round((lRange / 80) * 25));

  // Colorblind safety: pairs remain distinguishable (0-25 points)
  const types: ColorBlindType[] = ["protanopia", "deuteranopia", "tritanopia"];
  let totalChecks = 0;
  let safeChecks = 0;
  for (const type of types) {
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const sim1 = simulateColorBlindness({ r: colors[i].r, g: colors[i].g, b: colors[i].b }, type);
        const sim2 = simulateColorBlindness({ r: colors[j].r, g: colors[j].g, b: colors[j].b }, type);
        const de = colorblindDeltaE(sim1, sim2);
        totalChecks++;
        if (de >= 30) safeChecks++;
      }
    }
  }
  const colorblind = totalChecks > 0 ? Math.round((safeChecks / totalChecks) * 25) : 25;

  return { total: contrast + diversity + lightness + colorblind, contrast, diversity, lightness, colorblind };
}

function scoreLabel(score: number): { text: string; cls: string } {
  if (score >= 85) return { text: "Excellent", cls: "text-emerald-600 dark:text-emerald-400" };
  if (score >= 70) return { text: "Good", cls: "text-green-600 dark:text-green-400" };
  if (score >= 50) return { text: "Fair", cls: "text-yellow-600 dark:text-yellow-400" };
  if (score >= 30) return { text: "Needs Work", cls: "text-orange-600 dark:text-orange-400" };
  return { text: "Poor", cls: "text-red-600 dark:text-red-400" };
}

function badgeClasses(label: "AAA" | "AA" | "AA Large" | "Fail"): string {
  if (label === "AAA") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
  if (label === "AA") return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
  if (label === "AA Large") return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";
  return "bg-red-100 text-red-500 dark:bg-red-900/40 dark:text-red-400";
}

// ─── Constants ───────────────────────────────────────────────────────────────

const EXAMPLE = "#264653\n#2A9D8F\n#E9C46A\n#F4A261\n#E76F51";

const CB_TYPES: ColorBlindType[] = ["protanopia", "deuteranopia", "tritanopia", "achromatopsia"];

// ─── Component ───────────────────────────────────────────────────────────────

export function ValidatePage() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("colors") ?? "";
  });
  const [submitted, setSubmitted] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("colors") ?? "";
  });

  useEffect(() => {
    const colors = searchParams.get("colors");
    if (colors) {
      setInput(colors);
      setSubmitted(colors);
    }
  }, [searchParams]);

  const hexes = useMemo(() => (submitted ? parseHexColors(submitted) : []), [submitted]);
  const parsed = useMemo(() => analyzeColors(hexes), [hexes]);
  const contrastPairs = useMemo(() => buildContrastPairs(hexes), [hexes]);
  const harmony = useMemo(() => (parsed.length >= 2 ? detectHarmony(parsed) : null), [parsed]);
  const score = useMemo(
    () => (parsed.length >= 2 ? computeScore(parsed, contrastPairs, harmony?.type ?? "Polychromatic") : null),
    [parsed, contrastPairs, harmony],
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(input);
  }

  const passAA = contrastPairs.filter((p) => p.ratio >= 4.5).length;
  const passAAA = contrastPairs.filter((p) => p.ratio >= 7).length;
  const totalPairs = contrastPairs.length;

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
          Analysis
        </div>
        <h1 className="font-display text-3xl font-light tracking-[-0.03em] text-neutral-950 dark:text-white sm:text-4xl">
          Palette Validator
        </h1>
        <p className="mt-3 max-w-2xl text-neutral-500 dark:text-neutral-400">
          Paste your hex colors and get a comprehensive analysis: contrast matrix, harmony detection,
          colorblind simulation, and an overall quality score.
        </p>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="rounded-2xl border border-black/6 bg-white/60 p-5 backdrop-blur-sm dark:border-white/8 dark:bg-white/4">
          <label htmlFor="validate-hex-input" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
            Hex Colors (up to 8)
          </label>
          <textarea
            id="validate-hex-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            placeholder={"#264653\n#2A9D8F\n#E9C46A\n#F4A261\n#E76F51"}
            className="w-full rounded-xl border border-black/8 bg-white px-4 py-3 font-mono text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-200 dark:placeholder:text-neutral-600 dark:focus:ring-white/20"
          />
          <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500">
            One per line, comma-separated, or mixed. Supports #RGB and #RRGGBB.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={!input.trim()}
              className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-40 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
            >
              Validate Palette
            </button>
            <button
              type="button"
              onClick={() => { setInput(EXAMPLE); setSubmitted(EXAMPLE); }}
              className="rounded-full border border-black/8 bg-white px-4 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white/12"
            >
              Load example
            </button>
          </div>
        </div>
      </form>

      {/* Results */}
      {hexes.length >= 2 && (
        <div className="space-y-6">
          {/* ── Section 1: Color Palette Overview ── */}
          <section className="rounded-2xl border border-black/6 bg-white/60 p-5 backdrop-blur-sm dark:border-white/8 dark:bg-white/4">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
              Color Palette Overview
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {parsed.map((c) => (
                <div
                  key={c.hex}
                  className="overflow-hidden rounded-xl border border-black/6 dark:border-white/8"
                >
                  <div
                    className="h-16 w-full"
                    style={{ backgroundColor: c.hex }}
                  />
                  <div className="bg-white p-3 dark:bg-neutral-900">
                    <div className="mb-1 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                      {c.poeticName}
                    </div>
                    <div className="space-y-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      <div className="font-mono">{c.hex}</div>
                      <div>HSL: {c.h}, {c.s}%, {c.l}%</div>
                      <div>Family: {c.family}</div>
                      {c.closestArchive && (
                        <div className="text-neutral-400 dark:text-neutral-500">
                          Closest: {c.closestArchive}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Section 2: Contrast Matrix ── */}
          <section className="rounded-2xl border border-black/6 bg-white/60 p-5 backdrop-blur-sm dark:border-white/8 dark:bg-white/4">
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
              Contrast Matrix
            </h2>
            <p className="mb-4 text-xs text-neutral-400 dark:text-neutral-500">
              {passAA} of {totalPairs} pairs pass AA &middot; {passAAA} pass AAA
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs">
                <thead>
                  <tr>
                    <th className="p-1" />
                    {hexes.map((hex) => (
                      <th key={hex} className="p-1">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className="inline-block h-4 w-4 rounded border border-black/10 dark:border-white/10"
                            style={{ backgroundColor: hex }}
                          />
                          <span className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
                            {hex}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hexes.map((rowHex, ri) => (
                    <tr key={rowHex}>
                      <td className="p-1 pr-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
                            {rowHex}
                          </span>
                          <span
                            className="inline-block h-3.5 w-3.5 rounded border border-black/10 dark:border-white/10"
                            style={{ backgroundColor: rowHex }}
                          />
                        </div>
                      </td>
                      {hexes.map((colHex, ci) => {
                        if (ri === ci) {
                          return (
                            <td key={colHex} className="p-1">
                              <span className="text-neutral-300 dark:text-neutral-600">&mdash;</span>
                            </td>
                          );
                        }
                        const pair = contrastPairs.find(
                          (p) =>
                            (p.hex1 === rowHex && p.hex2 === colHex) ||
                            (p.hex2 === rowHex && p.hex1 === colHex),
                        )!;
                        return (
                          <td key={colHex} className="p-1">
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                                {pair.ratio}:1
                              </span>
                              <span
                                className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold leading-none ${badgeClasses(pair.label)}`}
                              >
                                {pair.label}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Section 3: Harmony Detection ── */}
          {harmony && (
            <section className="rounded-2xl border border-black/6 bg-white/60 p-5 backdrop-blur-sm dark:border-white/8 dark:bg-white/4">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
                Harmony Analysis
              </h2>
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                {/* Hue wheel */}
                <div className="relative h-40 w-40 flex-shrink-0">
                  <div
                    className="absolute inset-0 rounded-full opacity-15"
                    style={{
                      background: "conic-gradient(hsl(0,70%,50%), hsl(60,70%,50%), hsl(120,70%,50%), hsl(180,70%,50%), hsl(240,70%,50%), hsl(300,70%,50%), hsl(360,70%,50%))",
                    }}
                  />
                  <div className="absolute inset-4 rounded-full bg-white dark:bg-neutral-900" />
                  {parsed.filter((c) => c.s >= 10).map((c) => {
                    const angle = (c.h - 90) * (Math.PI / 180);
                    const radius = 60;
                    const cx = 80 + Math.cos(angle) * radius;
                    const cy = 80 + Math.sin(angle) * radius;
                    return (
                      <div
                        key={c.hex}
                        className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md dark:border-neutral-800"
                        style={{
                          left: cx,
                          top: cy,
                          backgroundColor: c.hex,
                        }}
                        title={`${c.hex} (${c.h}deg)`}
                      />
                    );
                  })}
                </div>
                <div>
                  <div className="mb-1 text-lg font-bold text-neutral-800 dark:text-neutral-200">
                    {harmony.type}
                  </div>
                  <p className="max-w-md text-sm text-neutral-500 dark:text-neutral-400">
                    {harmony.description}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* ── Section 4: Colorblind Preview ── */}
          <section className="rounded-2xl border border-black/6 bg-white/60 p-5 backdrop-blur-sm dark:border-white/8 dark:bg-white/4">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
              Colorblind Preview
            </h2>
            <div className="space-y-5">
              {/* Original */}
              <div>
                <div className="mb-2 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                  Original
                </div>
                <div className="flex gap-1.5">
                  {hexes.map((hex) => (
                    <div
                      key={hex}
                      className="h-10 flex-1 rounded-lg border border-black/6 dark:border-white/8"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              </div>

              {/* Simulations */}
              {CB_TYPES.map((type) => {
                const info = COLOR_BLIND_INFO.find((i) => i.type === type)!;
                const simulated = hexes.map((hex) => {
                  const rgb = hexToRgbCB(hex);
                  if (!rgb) return hex;
                  return rgbToHexCB(simulateColorBlindness(rgb, type));
                });
                // Find indistinguishable pairs
                const confusable: string[] = [];
                for (let i = 0; i < simulated.length; i++) {
                  for (let j = i + 1; j < simulated.length; j++) {
                    const rgb1 = hexToRgbCB(simulated[i]);
                    const rgb2 = hexToRgbCB(simulated[j]);
                    if (rgb1 && rgb2 && colorblindDeltaE(rgb1, rgb2) < 25) {
                      confusable.push(`${hexes[i]} / ${hexes[j]}`);
                    }
                  }
                }
                return (
                  <div key={type}>
                    <div className="mb-2 flex items-baseline gap-2">
                      <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                        {info.label}
                      </span>
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                        {info.prevalence}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {simulated.map((hex, idx) => (
                        <div
                          key={idx}
                          className="h-10 flex-1 rounded-lg border border-black/6 dark:border-white/8"
                          style={{ backgroundColor: hex }}
                          title={`${hexes[idx]} -> ${hex}`}
                        />
                      ))}
                    </div>
                    {confusable.length > 0 && (
                      <p className="mt-1 text-[11px] text-orange-600 dark:text-orange-400">
                        Potentially confusable: {confusable.join(", ")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Section 5: Palette Score ── */}
          {score && (
            <section className="rounded-2xl border border-black/6 bg-white/60 p-5 backdrop-blur-sm dark:border-white/8 dark:bg-white/4">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
                Palette Score
              </h2>
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                {/* Score circle */}
                <div className="relative flex h-28 w-28 flex-shrink-0 items-center justify-center">
                  <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-neutral-200 dark:text-neutral-700" />
                    <circle
                      cx="50" cy="50" r="42" fill="none" strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={`${(score.total / 100) * 264} 264`}
                      className={score.total >= 70 ? "text-emerald-500" : score.total >= 50 ? "text-yellow-500" : "text-red-500"}
                      stroke="currentColor"
                    />
                  </svg>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                      {score.total}
                    </div>
                    <div className={`text-xs font-semibold ${scoreLabel(score.total).cls}`}>
                      {scoreLabel(score.total).text}
                    </div>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="flex-1 space-y-2.5">
                  {[
                    { label: "Contrast Coverage", value: score.contrast, max: 25, desc: "Pairs passing WCAG AA" },
                    { label: "Hue Diversity", value: score.diversity, max: 25, desc: "Spread across color wheel" },
                    { label: "Lightness Range", value: score.lightness, max: 25, desc: "Light-to-dark coverage" },
                    { label: "Colorblind Safety", value: score.colorblind, max: 25, desc: "Distinguishable under CVD" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="mb-0.5 flex items-baseline justify-between">
                        <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                          {item.label}
                        </span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {item.value}/{item.max}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                        <div
                          className={`h-full rounded-full transition-all ${
                            item.value / item.max >= 0.7
                              ? "bg-emerald-500"
                              : item.value / item.max >= 0.4
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${(item.value / item.max) * 100}%` }}
                        />
                      </div>
                      <p className="mt-0.5 text-[10px] text-neutral-400 dark:text-neutral-500">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {hexes.length === 1 && submitted && (
        <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-black/10 dark:border-white/10">
          <p className="text-sm text-neutral-400 dark:text-neutral-500">
            Enter at least 2 colors to generate a full analysis
          </p>
        </div>
      )}

      {submitted && hexes.length === 0 && (
        <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-red-200 dark:border-red-900">
          <p className="text-sm text-red-400">No valid hex colors found in input</p>
        </div>
      )}

      <ToolUpsellBanner toolName="Palette Validator" />
    </main>
  );
}
