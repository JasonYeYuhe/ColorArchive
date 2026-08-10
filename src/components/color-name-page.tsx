"use client";

import { useMemo, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { generateColorName, nearestColor } from "@/src/lib/color-naming";
import { deltaE2000Hex, interpretDeltaE } from "@/src/lib/color-difference";
import { colors } from "@/src/data/colors";
import { CopyButton } from "@/src/components/copy-button";
import { useLocale } from "@/src/components/locale-provider";

/* ─── Constants ─────────────────────────────────────────────────────────────── */

const PRESET_COLORS = [
  { label: "Ocean Blue", hex: "#2563EB" },
  { label: "Forest Green", hex: "#16A34A" },
  { label: "Dusty Rose", hex: "#C98B8B" },
  { label: "Golden Amber", hex: "#D97706" },
  { label: "Soft Lavender", hex: "#9F7AEA" },
  { label: "Warm Coral", hex: "#F87171" },
  { label: "Slate Gray", hex: "#64748B" },
  { label: "Mint Fresh", hex: "#34D399" },
];

const colorCandidates = colors.map((c) => ({
  id: c.id,
  hex: c.hex,
  name: c.name,
  slug: c.id,
}));

/* ─── Hex Input ──────────────────────────────────────────────────────────────── */

function isValidHex(v: string): boolean {
  return /^#?[0-9a-fA-F]{6}$/.test(v.trim());
}

function normalizeHex(v: string): string {
  const s = v.trim().replace(/^#/, "");
  return `#${s.toUpperCase()}`;
}

/* ─── Main Component ─────────────────────────────────────────────────────────── */

export function ColorNamePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLocale();

  const initialHex = searchParams.get("hex") ?? "#2563EB";
  const [input, setInput] = useState(initialHex);
  const [committed, setCommitted] = useState(initialHex);

  const isValid = isValidHex(input);
  const hex = isValid ? normalizeHex(committed) : "#2563EB";

  const result = useMemo(() => generateColorName(hex), [hex]);
  const nearest = useMemo(() => nearestColor(hex, colorCandidates), [hex]);

  // Perceptually-ranked runners-up (CIEDE2000) — the archive-inverted lookup:
  // "which named colors IS this hex", not just the single closest. The card
  // above shows the RGB-nearest color, so exclude that id here (the two
  // metrics can disagree, so filter by id rather than assuming it ranks #1).
  const rankedNearest = useMemo(() => {
    const scored: Array<{ id: string; hex: string; name: string; deltaE: number }> = [];
    for (const c of colorCandidates) {
      if (nearest && c.id === nearest.id) continue;
      const d = deltaE2000Hex(hex, c.hex);
      if (d !== null) scored.push({ id: c.id, hex: c.hex, name: c.name, deltaE: d });
    }
    scored.sort((a, b) => a.deltaE - b.deltaE);
    return scored.slice(0, 5);
  }, [hex, nearest]);

  const handleCommit = useCallback(() => {
    if (isValidHex(input)) {
      const normalized = normalizeHex(input);
      setCommitted(normalized);
      const params = new URLSearchParams(searchParams.toString());
      params.set("hex", normalized);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [input, pathname, router, searchParams]);

  const handlePreset = (presetHex: string) => {
    setInput(presetHex);
    setCommitted(presetHex);
    const params = new URLSearchParams(searchParams.toString());
    params.set("hex", presetHex);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (!result) return null;

  const bgStyle = { backgroundColor: result.hex };
  const textColor = result.textOnColor;

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-light tracking-tight text-neutral-950 dark:text-white sm:text-3xl">
          Color Name Generator
        </h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Enter any hex color to get poetic names, design token suggestions, and semantic role guidance.
        </p>
      </div>

      {/* Input row */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex flex-1 gap-2">
          {/* Color picker */}
          <label aria-label="Pick a color" className="relative flex h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
            <input
              type="color"
              value={isValidHex(input) ? normalizeHex(input) : "#2563EB"}
              onChange={(e) => {
                setInput(e.target.value);
                setCommitted(e.target.value);
                const params = new URLSearchParams(searchParams.toString());
                params.set("hex", e.target.value.toUpperCase());
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });
              }}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
            <span
              className="h-full w-full rounded-lg"
              style={bgStyle}
              aria-hidden="true"
            />
          </label>
          {/* Hex text input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onBlur={handleCommit}
            onKeyDown={(e) => { if (e.key === "Enter") handleCommit(); }}
            placeholder="#2563EB"
            maxLength={7}
            className="h-10 flex-1 rounded-xl border border-black/10 bg-white px-4 font-mono text-sm uppercase text-neutral-900 placeholder-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-white/10 dark:bg-neutral-900 dark:text-white"
          />
          <button
            type="button"
            onClick={handleCommit}
            className="h-10 rounded-xl bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
          >
            Name it
          </button>
        </div>
      </div>

      {/* Presets */}
      <div className="mb-8 flex flex-wrap gap-2">
        {PRESET_COLORS.map((p) => (
          <button
            key={p.hex}
            type="button"
            onClick={() => handlePreset(p.hex)}
            className="flex items-center gap-2 rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-black/20 hover:bg-neutral-50 dark:border-white/10 dark:hover:border-white/30 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            <span
              className="inline-block h-3 w-3 rounded-full border border-black/10"
              style={{ backgroundColor: p.hex }}
            />
            {p.label}
          </button>
        ))}
      </div>

      {/* Main result card */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm dark:border-white/8 dark:bg-neutral-900">
        {/* Color swatch strip */}
        <div
          className="relative flex h-40 w-full items-end justify-between p-5 sm:h-52"
          style={bgStyle}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-70" style={{ color: textColor }}>
              {result.family}
            </p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: textColor }}>
              {result.poeticName}
            </h2>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="rounded-full px-3 py-1 text-xs font-mono font-semibold" style={{ backgroundColor: `${textColor}18`, color: textColor }}>
              {result.hex}
            </span>
            <span className="rounded-full px-3 py-1 text-xs font-mono" style={{ backgroundColor: `${textColor}12`, color: textColor }}>
              HSL({result.hsl.h}, {result.hsl.s}%, {result.hsl.l}%)
            </span>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 gap-px bg-black/6 sm:grid-cols-2 dark:bg-white/6">
          {/* Alternate names */}
          <div className="bg-white p-5 dark:bg-neutral-900">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">Alternate Names</h3>
            <div className="flex flex-col gap-2">
              {result.alternateNames.map((name) => (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{name}</span>
                  <CopyButton value={name} label="name" />
                </div>
              ))}
            </div>
          </div>

          {/* Mood / psychology */}
          <div className="bg-white p-5 dark:bg-neutral-900">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">Color Psychology</h3>
            <div className="flex flex-wrap gap-1.5">
              {result.moods.map((mood) => (
                <span
                  key={mood}
                  className="rounded-full border border-black/8 px-2.5 py-1 text-xs font-medium capitalize text-neutral-700 dark:border-white/10 dark:text-neutral-300"
                >
                  {mood}
                </span>
              ))}
            </div>
          </div>

          {/* Token names */}
          <div className="bg-white p-5 dark:bg-neutral-900">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">Design Token Names</h3>
            <div className="flex flex-col gap-2">
              {[
                { label: "CSS Variable", value: result.cssVar },
                { label: "Tailwind", value: result.tailwindName },
                { label: "Sass", value: result.sassVar },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">{label}</p>
                    <p className="font-mono text-xs text-neutral-800 dark:text-neutral-200">{value}</p>
                  </div>
                  <CopyButton value={value} label={label} />
                </div>
              ))}
            </div>
          </div>

          {/* Semantic role + contrast */}
          <div className="bg-white p-5 dark:bg-neutral-900">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">Usage Guidance</h3>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Semantic Role</p>
                <p className="font-mono text-xs text-neutral-800 dark:text-neutral-200">{result.semanticRole}</p>
              </div>
              <CopyButton value={result.semanticRole} label="role" />
            </div>
            <div className="flex gap-3">
              <div className="flex-1 rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-800">
                <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">vs White</p>
                <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{result.contrastWhite}:1</p>
                <p className="text-[10px] text-neutral-500">
                  {result.contrastWhite >= 7 ? "AAA" : result.contrastWhite >= 4.5 ? "AA" : result.contrastWhite >= 3 ? "AA Large" : "Fail"}
                </p>
              </div>
              <div className="flex-1 rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-800">
                <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">vs Black</p>
                <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{result.contrastBlack}:1</p>
                <p className="text-[10px] text-neutral-500">
                  {result.contrastBlack >= 7 ? "AAA" : result.contrastBlack >= 4.5 ? "AA" : result.contrastBlack >= 3 ? "AA Large" : "Fail"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nearest ColorArchive color */}
      {nearest && (
        <div className="mb-6 overflow-hidden rounded-2xl border border-black/8 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-neutral-900">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">Nearest ColorArchive Color</h3>
          <div className="flex items-center gap-4">
            <div
              className="h-14 w-14 shrink-0 rounded-xl border border-black/8 shadow-sm dark:border-white/8"
              style={{ backgroundColor: nearest.hex }}
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-neutral-900 dark:text-white">{nearest.name}</p>
              <p className="font-mono text-xs text-neutral-500">{nearest.hex}</p>
              <p className="mt-0.5 text-xs text-neutral-400">Distance: {nearest.distance} RGB units</p>
            </div>
            <Link
              href={`/colors/${nearest.slug}/`}
              className="shrink-0 rounded-xl bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
            >
              View color →
            </Link>
          </div>

          {/* ΔE-ranked runners-up */}
          {rankedNearest.length > 0 && (
            <div className="mt-4 border-t border-black/6 pt-3 dark:border-white/8">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                Perceptually closest (CIEDE2000)
              </p>
              <div className="space-y-1.5">
                {rankedNearest.map((c) => (
                  <div key={c.id} className="flex items-center gap-2.5 text-sm">
                    <span
                      className="h-5 w-5 shrink-0 rounded-md border border-black/8 dark:border-white/8"
                      style={{ backgroundColor: c.hex }}
                    />
                    <Link
                      href={`/colors/${c.id}/`}
                      className="font-medium text-neutral-800 underline-offset-2 hover:underline dark:text-neutral-200"
                    >
                      {c.name}
                    </Link>
                    <span className="font-mono text-xs text-neutral-500">{c.hex}</span>
                    <span className="ml-auto text-[11px] text-neutral-400" title={interpretDeltaE(c.deltaE).en}>
                      ΔE {c.deltaE.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Share / copy row */}
      <div className="flex flex-wrap items-center gap-3">
        <CopyButton value={result.poeticName} label="name" />
        <CopyButton value={result.hex} label="hex" />
        <CopyButton value={result.cssVar} label="CSS var" />
      </div>

      {/* Educational footer */}
      <div className="mt-10 rounded-2xl border border-black/6 bg-neutral-50 p-6 dark:border-white/6 dark:bg-neutral-900/50">
        <h3 className="mb-2 text-sm font-semibold text-neutral-900 dark:text-white">How color names work</h3>
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          This generator analyzes hue angle, saturation, and lightness to produce names aligned with color theory traditions.
          Lightness descriptors (pale, soft, deep) map to Tailwind-style scale steps. Hue word pools draw from gemology,
          botany, and natural phenomena — the same sources used in professional color naming systems from Pantone to
          Benjamin Moore. Design token names follow the semantic/primitive pattern used in modern design systems.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/guides/color-token-naming-guide/" className="text-xs font-medium text-neutral-700 underline underline-offset-2 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white">
            Color token naming guide →
          </Link>
          <Link href="/tools/" className="text-xs font-medium text-neutral-700 underline underline-offset-2 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white">
            All color tools →
          </Link>
        </div>
      </div>
    </main>
  );
}
