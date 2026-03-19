"use client";

import { useCallback, useMemo, useState } from "react";
import { colors } from "@/src/data/colors";
import { hslToRgb, rgbToHex } from "@/src/lib/color-utils";
import type { ColorRecord } from "@/src/types/color";

/* ------------------------------------------------------------------ */
/*  WCAG contrast helpers                                              */
/* ------------------------------------------------------------------ */

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace(/^#/, "");
  const expanded =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  const num = parseInt(expanded, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function getRelativeLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const sRGB = c / 255;
    return sRGB <= 0.04045 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

type WcagLevel = "Pass" | "Fail";

interface WcagResult {
  ratio: number;
  aaNormal: WcagLevel;
  aaLarge: WcagLevel;
  aaaNormal: WcagLevel;
  aaaLarge: WcagLevel;
  aaUi: WcagLevel;
}

function evaluateWcag(hex1: string, hex2: string): WcagResult {
  const ratio = getContrastRatio(hex1, hex2);
  return {
    ratio: Math.round(ratio * 100) / 100,
    aaNormal: ratio >= 4.5 ? "Pass" : "Fail",
    aaLarge: ratio >= 3 ? "Pass" : "Fail",
    aaaNormal: ratio >= 7 ? "Pass" : "Fail",
    aaaLarge: ratio >= 4.5 ? "Pass" : "Fail",
    aaUi: ratio >= 3 ? "Pass" : "Fail",
  };
}

/* ------------------------------------------------------------------ */
/*  Hex validation                                                     */
/* ------------------------------------------------------------------ */

const HEX_PATTERN = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

function isValidHex(value: string): boolean {
  return HEX_PATTERN.test(value);
}

function normalizeHex(value: string): string {
  const cleaned = value.replace(/^#/, "");
  const expanded =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  return `#${expanded.toUpperCase()}`;
}

/* ------------------------------------------------------------------ */
/*  Badge component                                                    */
/* ------------------------------------------------------------------ */

function WcagBadge({ label, level, result }: { label: string; level: string; result: WcagLevel }) {
  const pass = result === "Pass";
  return (
    <div className="flex items-center justify-between rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
      <div>
        <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">{label}</div>
        <div className="mt-1 text-sm font-medium text-neutral-700">{level}</div>
      </div>
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
          pass
            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border border-red-200 bg-red-50 text-red-600"
        }`}
      >
        {result}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Color picker panel                                                 */
/* ------------------------------------------------------------------ */

function ColorPickerPanel({
  label,
  hex,
  onHexChange,
}: {
  label: string;
  hex: string;
  onHexChange: (hex: string) => void;
}) {
  const [inputValue, setInputValue] = useState(hex);
  const [showPalette, setShowPalette] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState("");

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (isValidHex(value)) {
      onHexChange(normalizeHex(value));
    }
  };

  const handleSelectColor = useCallback(
    (color: ColorRecord) => {
      const colorHex = rgbToHex(hslToRgb(color.hue, color.saturation, color.lightness));
      setInputValue(colorHex);
      onHexChange(colorHex);
      setShowPalette(false);
      setPaletteSearch("");
    },
    [onHexChange],
  );

  const filteredColors = useMemo(() => {
    if (!paletteSearch.trim()) {
      return colors.slice(0, 60);
    }
    const query = paletteSearch.trim().toLowerCase();
    return colors
      .filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.hex.toLowerCase().includes(query) ||
          c.family.toLowerCase().includes(query),
      )
      .slice(0, 60);
  }, [paletteSearch]);

  return (
    <div className="rounded-[1.7rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">{label}</div>

      <div className="mt-4 flex items-center gap-3">
        <div
          className="h-12 w-12 shrink-0 rounded-xl border border-black/8 shadow-sm"
          style={{ backgroundColor: hex }}
        />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="#000000"
          className="w-full rounded-2xl border border-black/8 bg-white px-4 py-3 text-base font-medium text-neutral-950 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8"
        />
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setShowPalette((prev) => !prev)}
          className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-sm text-neutral-700 transition hover:bg-neutral-950 hover:text-white"
        >
          {showPalette ? "Hide palette" : "Pick from archive"}
        </button>
      </div>

      {showPalette && (
        <div className="mt-4">
          <input
            type="text"
            value={paletteSearch}
            onChange={(e) => setPaletteSearch(e.target.value)}
            placeholder="Search colors by name, hex, or family"
            className="mb-3 w-full rounded-2xl border border-black/8 bg-white px-4 py-2.5 text-sm text-neutral-950 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8"
          />
          <div className="grid max-h-48 grid-cols-6 gap-1.5 overflow-y-auto sm:grid-cols-8">
            {filteredColors.map((color) => {
              const colorHex = rgbToHex(hslToRgb(color.hue, color.saturation, color.lightness));
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => handleSelectColor(color)}
                  title={`${color.name} — ${colorHex}`}
                  className="aspect-square rounded-lg border border-black/8 transition hover:scale-110 hover:shadow-md"
                  style={{ backgroundColor: colorHex }}
                />
              );
            })}
          </div>
          {filteredColors.length === 0 && (
            <p className="py-4 text-center text-sm text-neutral-400">No colors match your search.</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export function ContrastCheckerPage() {
  const [fgHex, setFgHex] = useState("#1A1A2E");
  const [bgHex, setBgHex] = useState("#F5F5F0");

  const wcag = useMemo(() => evaluateWcag(fgHex, bgHex), [fgHex, bgHex]);

  const handleSwap = () => {
    setFgHex(bgHex);
    setBgHex(fgHex);
  };

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        {/* Hero section */}
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute -right-10 top-0 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="pointer-events-none absolute left-0 top-10 h-48 w-48 rounded-full bg-sky-200/30 blur-3xl" />
          <div className="relative mx-auto max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              WCAG accessibility
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              Contrast checker
            </h1>

            <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-neutral-600 sm:text-lg">
              Enter two colors to calculate the WCAG contrast ratio. Check compliance for
              normal text, large text, and UI components at AA and AAA levels.
            </p>
          </div>
        </section>

        {/* Color pickers */}
        <section className="grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <ColorPickerPanel label="Foreground (text)" hex={fgHex} onHexChange={setFgHex} />

          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap foreground and background"
              className="rounded-full border border-black/8 bg-white/85 p-3 text-neutral-600 shadow-sm transition hover:bg-neutral-950 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          <ColorPickerPanel label="Background" hex={bgHex} onHexChange={setBgHex} />
        </section>

        {/* Results */}
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)]">
          {/* Live preview */}
          <div className="rounded-[1.75rem] border border-black/6 bg-white/80 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-neutral-950">
                Live preview
              </h2>
              <div className="rounded-full border border-black/6 bg-neutral-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
                {wcag.ratio} : 1
              </div>
            </div>

            <div
              className="mt-5 overflow-hidden rounded-[1.4rem] border border-black/6"
              style={{ backgroundColor: bgHex }}
            >
              <div className="space-y-4 p-6 sm:p-8">
                <h3
                  className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl"
                  style={{ color: fgHex }}
                >
                  Heading text sample
                </h3>
                <p className="text-base leading-7 sm:text-lg" style={{ color: fgHex }}>
                  The quick brown fox jumps over the lazy dog. This paragraph demonstrates how
                  body text appears at normal size with these two colors combined.
                </p>
                <p className="text-sm leading-6" style={{ color: fgHex }}>
                  Small text is harder to read at low contrast ratios. WCAG requires at least
                  4.5:1 for normal text and 3:1 for large text at the AA level.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <span
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium"
                    style={{ color: fgHex, borderColor: fgHex }}
                  >
                    Button outline
                  </span>
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
                    style={{ backgroundColor: fgHex, color: bgHex }}
                  >
                    Button filled
                  </span>
                </div>
              </div>
            </div>

            {/* Reversed preview */}
            <div
              className="mt-3 overflow-hidden rounded-[1.4rem] border border-black/6"
              style={{ backgroundColor: fgHex }}
            >
              <div className="p-6 sm:p-8">
                <p className="text-sm leading-6" style={{ color: bgHex }}>
                  Reversed: background color on foreground color.
                </p>
              </div>
            </div>
          </div>

          {/* WCAG results */}
          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-black/6 bg-white/80 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Contrast ratio
              </div>
              <div className="mt-3 text-5xl font-bold tracking-[-0.04em] text-neutral-950">
                {wcag.ratio}
                <span className="text-lg font-medium text-neutral-400"> : 1</span>
              </div>
              <div className="mt-3 text-sm leading-6 text-neutral-600">
                {wcag.ratio >= 7
                  ? "Excellent contrast. Passes all WCAG criteria."
                  : wcag.ratio >= 4.5
                    ? "Good contrast. Passes AA for normal text and AAA for large text."
                    : wcag.ratio >= 3
                      ? "Moderate contrast. Passes AA for large text and UI components only."
                      : "Poor contrast. Fails most WCAG criteria."}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-black/6 bg-white/80 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <div className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                WCAG compliance
              </div>
              <div className="space-y-2">
                <WcagBadge label="Normal text" level="AA (4.5:1)" result={wcag.aaNormal} />
                <WcagBadge label="Large text" level="AA (3:1)" result={wcag.aaLarge} />
                <WcagBadge label="Normal text" level="AAA (7:1)" result={wcag.aaaNormal} />
                <WcagBadge label="Large text" level="AAA (4.5:1)" result={wcag.aaaLarge} />
                <WcagBadge label="UI components" level="AA (3:1)" result={wcag.aaUi} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
