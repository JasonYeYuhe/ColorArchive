"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

/* ------------------------------------------------------------------ */
/*  Color conversion helpers                                           */
/* ------------------------------------------------------------------ */

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function hexToHsl(hex: string) {
  const { r: ri, g: gi, b: bi } = hexToRgb(hex);
  const r = ri / 255, g = gi / 255, b = bi / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function relativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map(v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1: string, hex2: string) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}

function getFamily(hue: number) {
  if (hue < 15 || hue >= 345) return "Red";
  if (hue < 45) return "Orange";
  if (hue < 70) return "Yellow";
  if (hue < 95) return "Lime";
  if (hue < 150) return "Green";
  if (hue < 185) return "Teal";
  if (hue < 250) return "Blue";
  if (hue < 290) return "Purple";
  return "Pink";
}

/* ------------------------------------------------------------------ */
/*  Hex validation                                                     */
/* ------------------------------------------------------------------ */

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

function isValidHex(v: string): boolean {
  return HEX_RE.test(v);
}

function sanitizeHex(v: string): string {
  let h = v.trim();
  if (!h.startsWith("#")) h = "#" + h;
  return h.toUpperCase();
}

/* ------------------------------------------------------------------ */
/*  Copy button                                                        */
/* ------------------------------------------------------------------ */

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-full border border-black/8 bg-white/85 px-3 py-1.5 text-xs font-medium text-neutral-600 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white dark:hover:text-neutral-950"
    >
      {copied ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          Copied
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
          {label}
        </>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  WCAG badge                                                         */
/* ------------------------------------------------------------------ */

function WcagBadge({ label, pass }: { label: string; pass: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
        pass
          ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
          : "border border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400"
      }`}
    >
      {label}: {pass ? "Pass" : "Fail"}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Color info panel                                                   */
/* ------------------------------------------------------------------ */

function ColorPanel({
  label,
  hex,
  inputValue,
  onInputChange,
  onColorPickerChange,
}: {
  label: string;
  hex: string;
  inputValue: string;
  onInputChange: (v: string) => void;
  onColorPickerChange: (v: string) => void;
}) {
  const rgb = hexToRgb(hex);
  const hsl = hexToHsl(hex);
  const family = getFamily(hsl.h);

  return (
    <div className="rounded-[1.7rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)] dark:border-white/8 dark:bg-white/5">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
        {label}
      </div>

      {/* Swatch */}
      <div
        className="mt-4 h-[120px] w-full rounded-2xl border border-black/8 shadow-sm dark:border-white/10"
        style={{ backgroundColor: hex }}
      />

      {/* Inputs */}
      <div className="mt-4 flex items-center gap-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="#000000"
          className="w-full rounded-2xl border border-black/8 bg-white px-4 py-3 text-base font-medium text-neutral-950 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8 dark:border-white/10 dark:bg-white/5 dark:text-neutral-100 dark:focus:border-white/20 dark:focus:ring-white/8"
        />
        <input
          type="color"
          value={hex}
          onChange={(e) => onColorPickerChange(e.target.value.toUpperCase())}
          className="h-12 w-12 shrink-0 cursor-pointer rounded-xl border border-black/8 bg-transparent dark:border-white/10"
        />
      </div>

      {/* Color values */}
      <div className="mt-4 space-y-2.5">
        <div className="flex items-center justify-between rounded-xl border border-black/6 bg-neutral-50 px-4 py-2.5 dark:border-white/6 dark:bg-white/4">
          <span className="text-xs uppercase tracking-[0.16em] text-neutral-400">HEX</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{hex}</span>
            <CopyButton text={hex} label="Copy" />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-black/6 bg-neutral-50 px-4 py-2.5 dark:border-white/6 dark:bg-white/4">
          <span className="text-xs uppercase tracking-[0.16em] text-neutral-400">RGB</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
              {rgb.r}, {rgb.g}, {rgb.b}
            </span>
            <CopyButton text={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} label="Copy" />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-black/6 bg-neutral-50 px-4 py-2.5 dark:border-white/6 dark:bg-white/4">
          <span className="text-xs uppercase tracking-[0.16em] text-neutral-400">HSL</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
              {hsl.h}°, {hsl.s}%, {hsl.l}%
            </span>
            <CopyButton text={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} label="Copy" />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-black/6 bg-neutral-50 px-4 py-2.5 dark:border-white/6 dark:bg-white/4">
          <span className="text-xs uppercase tracking-[0.16em] text-neutral-400">Lightness</span>
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{hsl.l}%</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-black/6 bg-neutral-50 px-4 py-2.5 dark:border-white/6 dark:bg-white/4">
          <span className="text-xs uppercase tracking-[0.16em] text-neutral-400">Saturation</span>
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{hsl.s}%</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-black/6 bg-neutral-50 px-4 py-2.5 dark:border-white/6 dark:bg-white/4">
          <span className="text-xs uppercase tracking-[0.16em] text-neutral-400">Family</span>
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{family}</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export function ColorComparePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const paramA = searchParams.get("a");
  const paramB = searchParams.get("b");

  const defaultA = "#4A90D9";
  const defaultB = "#E74C3C";

  const initialA = paramA && isValidHex(sanitizeHex(paramA)) ? sanitizeHex(paramA) : defaultA;
  const initialB = paramB && isValidHex(sanitizeHex(paramB)) ? sanitizeHex(paramB) : defaultB;

  const [colorA, setColorA] = useState(initialA);
  const [colorB, setColorB] = useState(initialB);
  const [inputA, setInputA] = useState(initialA);
  const [inputB, setInputB] = useState(initialB);

  // Update URL when colors change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("a", colorA.replace("#", ""));
    params.set("b", colorB.replace("#", ""));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [colorA, colorB, pathname, router]);

  const handleInputA = useCallback((v: string) => {
    setInputA(v);
    const s = sanitizeHex(v);
    if (isValidHex(s)) setColorA(s);
  }, []);

  const handleInputB = useCallback((v: string) => {
    setInputB(v);
    const s = sanitizeHex(v);
    if (isValidHex(s)) setColorB(s);
  }, []);

  const handlePickerA = useCallback((v: string) => {
    setColorA(v);
    setInputA(v);
  }, []);

  const handlePickerB = useCallback((v: string) => {
    setColorB(v);
    setInputB(v);
  }, []);

  const handleSwap = useCallback(() => {
    setColorA(colorB);
    setColorB(colorA);
    setInputA(colorB);
    setInputB(colorA);
  }, [colorA, colorB]);

  const ratio = useMemo(() => contrastRatio(colorA, colorB), [colorA, colorB]);
  const passAANormal = ratio >= 4.5;
  const passAALarge = ratio >= 3;
  const passAAANormal = ratio >= 7;
  const passAAALarge = ratio >= 4.5;

  const rgbA = hexToRgb(colorA);
  const rgbB = hexToRgb(colorB);
  const hslA = hexToHsl(colorA);
  const hslB = hexToHsl(colorB);

  const comparisonSummary = `Color Comparison — ColorArchive
Color A: ${colorA} | RGB(${rgbA.r}, ${rgbA.g}, ${rgbA.b}) | HSL(${hslA.h}°, ${hslA.s}%, ${hslA.l}%) | Family: ${getFamily(hslA.h)}
Color B: ${colorB} | RGB(${rgbB.r}, ${rgbB.g}, ${rgbB.b}) | HSL(${hslB.h}°, ${hslB.s}%, ${hslB.l}%) | Family: ${getFamily(hslB.h)}
Contrast Ratio: ${ratio}:1
WCAG AA Normal: ${passAANormal ? "Pass" : "Fail"} | AA Large: ${passAALarge ? "Pass" : "Fail"}
WCAG AAA Normal: ${passAAANormal ? "Pass" : "Fail"} | AAA Large: ${passAAALarge ? "Pass" : "Fail"}`;

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        {/* Hero section */}
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14 dark:border-white/8 dark:bg-white/4">
          <div className="pointer-events-none absolute -right-10 top-0 h-64 w-64 rounded-full bg-violet-200/40 blur-3xl dark:bg-violet-800/20" />
          <div className="pointer-events-none absolute left-0 top-10 h-48 w-48 rounded-full bg-amber-200/30 blur-3xl dark:bg-amber-800/15" />
          <div className="relative mx-auto max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-neutral-500 dark:border-white/10 dark:bg-white/8 dark:text-neutral-400">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900 dark:bg-neutral-100" />
              Color Comparison
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl dark:text-neutral-50">
              Compare Two Colors
            </h1>

            <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-neutral-600 sm:text-lg dark:text-neutral-400">
              Place any two colors side by side to compare their values, contrast ratio, and WCAG
              accessibility compliance at a glance.
            </p>
          </div>
        </section>

        {/* Side-by-side comparison */}
        <section className="grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <ColorPanel
            label="Color A"
            hex={colorA}
            inputValue={inputA}
            onInputChange={handleInputA}
            onColorPickerChange={handlePickerA}
          />

          {/* Center column: contrast info + swap */}
          <div className="flex flex-col items-center justify-center gap-4">
            {/* Swap button */}
            <button
              type="button"
              onClick={handleSwap}
              title="Swap colors"
              className="rounded-full border border-black/8 bg-white/85 p-3 text-neutral-600 shadow-sm transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white dark:hover:text-neutral-950"
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

            {/* Contrast ratio */}
            <div className="rounded-[1.7rem] border border-black/6 bg-white/82 px-6 py-5 text-center shadow-[0_18px_48px_rgba(15,23,42,0.05)] dark:border-white/8 dark:bg-white/5">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
                Contrast Ratio
              </div>
              <div className="mt-2 text-3xl font-bold tracking-tight text-neutral-950 dark:text-neutral-50">
                {ratio}:1
              </div>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <WcagBadge label="AA Normal" pass={passAANormal} />
                <WcagBadge label="AA Large" pass={passAALarge} />
                <WcagBadge label="AAA Normal" pass={passAAANormal} />
                <WcagBadge label="AAA Large" pass={passAAALarge} />
              </div>
            </div>
          </div>

          <ColorPanel
            label="Color B"
            hex={colorB}
            inputValue={inputB}
            onInputChange={handleInputB}
            onColorPickerChange={handlePickerB}
          />
        </section>

        {/* Preview section */}
        <section className="rounded-[1.7rem] border border-black/6 bg-white/82 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.05)] dark:border-white/8 dark:bg-white/5">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
            Text Preview
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {/* Color A text on Color B background */}
            <div
              className="rounded-2xl border border-black/8 p-6 dark:border-white/10"
              style={{ backgroundColor: colorB, color: colorA }}
            >
              <div className="text-2xl font-bold">Heading Text</div>
              <p className="mt-2 text-base leading-relaxed">
                This is sample body text rendered in {colorA} on a {colorB} background.
                Check how the combination looks for readability.
              </p>
              <p className="mt-1 text-sm">Small text sample for fine print and captions.</p>
            </div>
            {/* Color B text on Color A background */}
            <div
              className="rounded-2xl border border-black/8 p-6 dark:border-white/10"
              style={{ backgroundColor: colorA, color: colorB }}
            >
              <div className="text-2xl font-bold">Heading Text</div>
              <p className="mt-2 text-base leading-relaxed">
                This is sample body text rendered in {colorB} on a {colorA} background.
                Check how the combination looks for readability.
              </p>
              <p className="mt-1 text-sm">Small text sample for fine print and captions.</p>
            </div>
          </div>
        </section>

        {/* Copy comparison */}
        <div className="flex justify-center">
          <CopyButton text={comparisonSummary} label="Copy comparison" />
        </div>
      </div>
    </main>
  );
}
