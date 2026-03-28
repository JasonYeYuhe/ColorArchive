"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { useLocale } from "@/src/components/locale-provider";

/* ------------------------------------------------------------------ */
/*  Color conversion helpers                                           */
/* ------------------------------------------------------------------ */

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const match = hex.match(/^#?([0-9a-f]{6})$/i);
  if (!match) return null;
  const r = parseInt(match[1].slice(0, 2), 16) / 255;
  const g = parseInt(match[1].slice(2, 4), 16) / 255;
  const b = parseInt(match[1].slice(4, 6), 16) / 255;
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

function hslToHex(h: number, s: number, l: number): string {
  const sN = s / 100, lN = l / 100;
  const q = lN < 0.5 ? lN * (1 + sN) : lN + sN - lN * sN;
  const p = 2 * lN - q;
  const hN = h / 360;
  const hue2rgb = (p2: number, q2: number, t: number) => {
    let t2 = t;
    if (t2 < 0) t2 += 1;
    if (t2 > 1) t2 -= 1;
    if (t2 < 1 / 6) return p2 + (q2 - p2) * 6 * t2;
    if (t2 < 1 / 2) return q2;
    if (t2 < 2 / 3) return p2 + (q2 - p2) * (2 / 3 - t2) * 6;
    return p2;
  };
  const r = Math.round(hue2rgb(p, q, hN + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, hN) * 255);
  const b = Math.round(hue2rgb(p, q, hN - 1 / 3) * 255);
  return `#${[r, g, b].map(c => c.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

/* ------------------------------------------------------------------ */
/*  Harmony generation                                                 */
/* ------------------------------------------------------------------ */

interface Harmony {
  name: string;
  colors: { hex: string; label: string }[];
}

function generateHarmonies(h: number, s: number, l: number): Harmony[] {
  return [
    {
      name: "Complementary",
      colors: [
        { hex: hslToHex(h, s, l), label: "Base" },
        { hex: hslToHex((h + 180) % 360, s, l), label: "Complement" },
      ],
    },
    {
      name: "Analogous",
      colors: [
        { hex: hslToHex((h + 330) % 360, s, l), label: "-30\u00B0" },
        { hex: hslToHex(h, s, l), label: "Base" },
        { hex: hslToHex((h + 30) % 360, s, l), label: "+30\u00B0" },
      ],
    },
    {
      name: "Triadic",
      colors: [
        { hex: hslToHex(h, s, l), label: "Base" },
        { hex: hslToHex((h + 120) % 360, s, l), label: "+120\u00B0" },
        { hex: hslToHex((h + 240) % 360, s, l), label: "+240\u00B0" },
      ],
    },
    {
      name: "Split-Complementary",
      colors: [
        { hex: hslToHex(h, s, l), label: "Base" },
        { hex: hslToHex((h + 150) % 360, s, l), label: "+150\u00B0" },
        { hex: hslToHex((h + 210) % 360, s, l), label: "+210\u00B0" },
      ],
    },
    {
      name: "Monochromatic",
      colors: [
        { hex: hslToHex(h, s, 90), label: "Lightest" },
        { hex: hslToHex(h, s, 70), label: "Light" },
        { hex: hslToHex(h, s, 50), label: "Mid" },
        { hex: hslToHex(h, s, 30), label: "Dark" },
        { hex: hslToHex(h, s, 15), label: "Darkest" },
      ],
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Export formatters                                                   */
/* ------------------------------------------------------------------ */

function harmonyToCss(harmony: Harmony): string {
  const vars = harmony.colors
    .map((c, i) => `  --harmony-${i + 1}: ${c.hex};`)
    .join("\n");
  return `:root {\n${vars}\n}`;
}

function harmonyToTailwind(harmony: Harmony): string {
  const vars = harmony.colors
    .map((c, i) => `  --color-harmony-${i + 1}: ${c.hex};`)
    .join("\n");
  return `@theme {\n${vars}\n}`;
}

/* ------------------------------------------------------------------ */
/*  CopyButton                                                         */
/* ------------------------------------------------------------------ */

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => { clearTimeout(timerRef.current); }, []);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          timerRef.current = setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard not available */
        }
      }}
      className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-white/10 dark:text-neutral-300 dark:hover:bg-white dark:hover:text-neutral-900"
    >
      {copied ? `${label} copied` : `Copy ${label}`}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Swatch                                                             */
/* ------------------------------------------------------------------ */

function Swatch({ hex, label }: { hex: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => { clearTimeout(timerRef.current); }, []);

  const isLight = (() => {
    const match = hex.match(/^#([0-9a-f]{6})$/i);
    if (!match) return false;
    const r = parseInt(match[1].slice(0, 2), 16);
    const g = parseInt(match[1].slice(2, 4), 16);
    const b = parseInt(match[1].slice(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 160;
  })();

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(hex);
          setCopied(true);
          timerRef.current = setTimeout(() => setCopied(false), 1200);
        } catch {
          /* clipboard not available */
        }
      }}
      className="group flex flex-1 flex-col items-center gap-2"
    >
      <div
        className="aspect-square w-full rounded-2xl shadow-sm transition-transform group-hover:scale-105"
        style={{ backgroundColor: hex }}
      >
        {copied && (
          <span
            className={`flex h-full items-center justify-center text-xs font-semibold ${isLight ? "text-neutral-800" : "text-white"}`}
          >
            Copied!
          </span>
        )}
      </div>
      <span className="text-[11px] font-medium tracking-wide text-neutral-500 dark:text-neutral-400">
        {hex}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
        {label}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  HarmonyCard                                                        */
/* ------------------------------------------------------------------ */

function HarmonyCard({ harmony }: { harmony: Harmony }) {
  const cssValue = useMemo(() => harmonyToCss(harmony), [harmony]);
  const tailwindValue = useMemo(() => harmonyToTailwind(harmony), [harmony]);

  return (
    <div className="rounded-[2rem] border border-black/6 bg-white/74 p-6 backdrop-blur-xl sm:p-8 dark:border-white/8 dark:bg-white/5">
      <h3 className="mb-5 text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
        {harmony.name}
      </h3>

      {/* Swatches */}
      <div className="mb-6 grid auto-cols-fr grid-flow-col gap-3">
        {harmony.colors.map((c) => (
          <Swatch key={`${c.hex}-${c.label}`} hex={c.hex} label={c.label} />
        ))}
      </div>

      {/* Export buttons */}
      <div className="flex flex-wrap gap-2">
        <CopyButton value={cssValue} label="CSS" />
        <CopyButton value={tailwindValue} label="Tailwind" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page component                                                */
/* ------------------------------------------------------------------ */

export function PaletteGeneratorPage() {
  const { t } = useLocale();
  const [hexInput, setHexInput] = useState("4A90D9");

  const hsl = useMemo(() => hexToHsl(hexInput), [hexInput]);
  const harmonies = useMemo(
    () => (hsl ? generateHarmonies(hsl.h, hsl.s, hsl.l) : []),
    [hsl],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
      setHexInput(raw);
    },
    [],
  );

  const seedHex = hsl ? hslToHex(hsl.h, hsl.s, hsl.l) : "#000000";

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute -top-40 left-1/3 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-200/40 to-purple-200/30 blur-3xl dark:from-blue-900/20 dark:to-purple-900/15" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-rose-200/30 to-orange-200/20 blur-3xl dark:from-rose-900/15 dark:to-orange-900/10" />

      <div className="relative mx-auto max-w-5xl px-4 pb-24 pt-12 sm:px-6 lg:px-8">
        {/* Header */}
        <section className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl dark:text-white">
            {t("palette_generator_title") || "Palette Generator"}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-neutral-500 dark:text-neutral-400">
            {t("palette_generator_subtitle") ||
              "Enter a seed color and explore harmonious palettes instantly. Click any swatch to copy its hex code."}
          </p>
        </section>

        {/* Seed color input */}
        <section className="mx-auto mb-14 max-w-md">
          <div className="rounded-[2rem] border border-black/6 bg-white/74 p-6 backdrop-blur-xl sm:p-8 dark:border-white/8 dark:bg-white/5">
            <label
              htmlFor="seed-hex"
              className="mb-3 block text-sm font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
            >
              {t("seed_color") || "Seed Color"}
            </label>

            <div className="flex items-center gap-4">
              {/* Live preview swatch */}
              <div
                className="h-14 w-14 shrink-0 rounded-2xl shadow-sm ring-1 ring-black/6 dark:ring-white/10"
                style={{ backgroundColor: hsl ? seedHex : "#000000" }}
              />

              {/* Input */}
              <div className="flex flex-1 items-center rounded-xl border border-black/8 bg-white px-3 py-2.5 text-lg font-mono focus-within:ring-2 focus-within:ring-blue-500 dark:border-white/10 dark:bg-white/10">
                <span className="mr-0.5 select-none text-neutral-400">#</span>
                <input
                  id="seed-hex"
                  type="text"
                  value={hexInput}
                  onChange={handleInputChange}
                  maxLength={6}
                  spellCheck={false}
                  autoComplete="off"
                  className="w-full bg-transparent uppercase text-neutral-900 outline-none placeholder:text-neutral-300 dark:text-white dark:placeholder:text-neutral-600"
                  placeholder="4A90D9"
                />
              </div>

              {/* Native color picker */}
              <input
                type="color"
                value={hsl ? seedHex : "#000000"}
                onChange={(e) => {
                  const v = e.target.value.replace("#", "");
                  setHexInput(v.toUpperCase());
                }}
                className="h-10 w-10 shrink-0 cursor-pointer appearance-none rounded-xl border-0 bg-transparent p-0"
                aria-label="Pick a color"
              />
            </div>

            {hexInput.length === 6 && !hsl && (
              <p className="mt-3 text-sm text-red-500">
                {t("invalid_hex") || "Invalid hex color"}
              </p>
            )}
          </div>
        </section>

        {/* Harmony cards */}
        {harmonies.length > 0 && (
          <section className="grid gap-6 sm:grid-cols-2">
            {harmonies.map((h) => (
              <HarmonyCard key={h.name} harmony={h} />
            ))}
          </section>
        )}

        {/* ─── About this tool ─── */}
        <section className="mt-14 rounded-[2rem] border border-black/6 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/80">
          <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">
            About this tool
          </h2>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            The Palette Generator creates harmonious color palettes from any hex color you provide. It calculates five classic harmony types — complementary, analogous, triadic, split-complementary, and monochromatic — so you can quickly explore color relationships without manual math.
          </p>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Designers use palette generators to speed up the early stages of branding, UI design, and web development. Instead of guessing which colors work together, you start with a single seed color and let color theory do the rest. Every swatch is click-to-copy, and you can export palettes as CSS variables or Tailwind config.
          </p>
        </section>

        {/* ─── Related tools ─── */}
        <section className="mt-6 rounded-[2rem] border border-black/6 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/80">
          <h2 className="mb-4 text-lg font-semibold text-neutral-950 dark:text-white">
            Related tools
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/mixer/" className="rounded-xl border border-black/6 bg-white/60 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-white transition dark:border-white/10 dark:bg-white/8 dark:text-neutral-300">
              Color Mixer
            </Link>
            <Link href="/harmonies/" className="rounded-xl border border-black/6 bg-white/60 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-white transition dark:border-white/10 dark:bg-white/8 dark:text-neutral-300">
              Color Harmonies
            </Link>
            <Link href="/tints/" className="rounded-xl border border-black/6 bg-white/60 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-white transition dark:border-white/10 dark:bg-white/8 dark:text-neutral-300">
              Tints &amp; Shades
            </Link>
            <Link href="/image-palette/" className="rounded-xl border border-black/6 bg-white/60 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-white transition dark:border-white/10 dark:bg-white/8 dark:text-neutral-300">
              Image Palette
            </Link>
            <Link href="/validate/" className="rounded-xl border border-black/6 bg-white/60 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-white transition dark:border-white/10 dark:bg-white/8 dark:text-neutral-300">
              Palette Validator
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
