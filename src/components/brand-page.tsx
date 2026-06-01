"use client";

import { useState, useMemo, useEffect } from "react";
import { CopyButton } from "@/src/components/copy-button";
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
} from "@/src/lib/brand-palette";

// ─── Small helpers ──────────────────────────────────────────────────────────

function wcagBadge(ratio: number) {
  const label = wcagLabel(ratio);
  const color =
    label === "AAA" ? "bg-emerald-100 text-emerald-700" :
    label === "AA" ? "bg-green-100 text-green-700" :
    label === "AA Large" ? "bg-yellow-100 text-yellow-700" :
    "bg-red-100 text-red-500";
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold leading-none ${color}`}>
      {label}
    </span>
  );
}

// ─── Scale row ───────────────────────────────────────────────────────────────

function ScaleRow({ scale, label }: { scale: ScaleColor[]; label: string }) {
  const [hovered, setHovered] = useState<ScaleColor | null>(null);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
          {label}
        </span>
        {hovered && (
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {hovered.hex} · {hovered.step} · {hovered.lightness}% L
          </span>
        )}
      </div>
      <div className="flex gap-1">
        {scale.map((c) => (
          <div
            key={c.step}
            className="group relative flex-1 cursor-default"
            onMouseEnter={() => setHovered(c)}
            onMouseLeave={() => setHovered(null)}
          >
            <div
              className="h-12 rounded-lg border border-black/6 transition-transform group-hover:-translate-y-0.5 dark:border-white/8"
              style={{ backgroundColor: c.hex }}
              title={`${c.step}: ${c.hex}`}
            />
            <div className="mt-1 text-center text-[9px] text-neutral-400 dark:text-neutral-500">{c.step}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── WCAG contrast matrix (key pairings) ────────────────────────────────────

function WcagMatrix({ palette }: { palette: BrandPalette }) {
  const WHITE = "#FFFFFF";
  const BLACK = "#111111";

  // Pick representative steps: 100(bg), 500(brand), 900(dark text)
  const steps = [100, 400, 500, 600, 900] as const;
  const cols = steps.map((s) => palette.primary.colors.find((c) => c.step === s)!);

  const pairings: { bg: ScaleColor; fg: string; fgLabel: string }[] = [
    ...cols.map((c) => ({ bg: c, fg: WHITE, fgLabel: "White" })),
    ...cols.map((c) => ({ bg: c, fg: BLACK, fgLabel: "Black" })),
  ];

  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
        WCAG Contrast
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {pairings.map((p, i) => {
          const ratio = hexContrastRatio(p.bg.hex, p.fg);
          return (
            <div
              key={i}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-black/6 p-3 dark:border-white/8"
              style={{ backgroundColor: p.bg.hex }}
            >
              <span
                className="text-sm font-bold"
                style={{ color: p.fg }}
              >
                Aa {ratio}:1
              </span>
              <div className="flex flex-col items-center gap-1">
                {wcagBadge(ratio)}
                <span className="text-[9px] opacity-70" style={{ color: p.fg }}>
                  {p.fgLabel} on {p.bg.step}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Semantic chips ──────────────────────────────────────────────────────────

function SemanticRow({ palette }: { palette: BrandPalette }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
        Semantic Colors
      </h3>
      <div className="flex flex-wrap gap-3">
        {palette.semantics.map((s) => (
          <div key={s.role} className="flex items-center gap-2.5 rounded-xl border border-black/6 bg-white/60 px-4 py-3 dark:border-white/8 dark:bg-white/4">
            <div
              className="h-8 w-8 flex-shrink-0 rounded-lg border border-black/8 dark:border-white/10"
              style={{ backgroundColor: s.hex }}
            />
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-700 dark:text-neutral-300">
                {s.label}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">{s.hex}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Export section ──────────────────────────────────────────────────────────

const EXPORT_TABS = [
  { id: "css",      label: "CSS Variables",    copyLabel: "CSS" },
  { id: "tailwind", label: "Tailwind Config",  copyLabel: "Config" },
  { id: "figma",    label: "Figma Tokens",     copyLabel: "JSON" },
  { id: "sd",       label: "Style Dictionary", copyLabel: "JSON" },
] as const;

type ExportTab = (typeof EXPORT_TABS)[number]["id"];

function ExportSection({ palette }: { palette: BrandPalette }) {
  const [tab, setTab] = useState<ExportTab>("css");
  const css = useMemo(() => buildBrandCssVariables(palette), [palette]);
  const tw  = useMemo(() => buildBrandTailwindConfig(palette), [palette]);
  const fig = useMemo(() => buildBrandFigmaTokens(palette), [palette]);
  const sd  = useMemo(() => buildBrandStyleDictionary(palette), [palette]);

  const contentMap: Record<ExportTab, string> = { css, tailwind: tw, figma: fig, sd };
  const content = contentMap[tab];
  const copyLabel = EXPORT_TABS.find((t) => t.id === tab)?.copyLabel ?? "Copy";

  return (
    <div className="rounded-2xl border border-black/6 bg-white/60 dark:border-white/8 dark:bg-white/4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/6 px-5 py-3 dark:border-white/8">
        <div className="flex flex-wrap gap-1">
          {EXPORT_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] transition ${
                tab === t.id
                  ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                  : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <CopyButton value={content} label={copyLabel} />
      </div>
      <pre className="overflow-x-auto rounded-b-2xl p-5 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
        <code>{content}</code>
      </pre>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

const PRESETS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export function BrandPage() {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState("");

  const palette = useMemo(
    () => (submitted ? generateBrandPalette(submitted) : null),
    [submitted],
  );

  const isValidHex = /^#?[0-9A-Fa-f]{6}$/.test(input.trim());

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidHex) return;
    const hex = input.trim().startsWith("#") ? input.trim() : `#${input.trim()}`;
    setSubmitted(hex);
  }

  function loadPreset(hex: string) {
    setInput(hex);
    setSubmitted(hex);
  }

  const previewHex = isValidHex
    ? (input.trim().startsWith("#") ? input.trim() : `#${input.trim()}`)
    : null;

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
          Brand System
        </div>
        <h1 className="font-display text-3xl font-light tracking-[-0.03em] text-neutral-950 dark:text-white sm:text-4xl">
          Brand Color Generator
        </h1>
        <p className="mt-3 max-w-xl text-neutral-500 dark:text-neutral-400">
          Enter a brand hex color to generate a complete design system — primary scale, neutral scale, semantic colors, and export-ready tokens.
        </p>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-wrap items-center gap-3">
          {previewHex && (
            <div
              className="h-10 w-10 flex-shrink-0 rounded-xl border border-black/10 dark:border-white/10"
              style={{ backgroundColor: previewHex }}
            />
          )}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="#3B82F6"
            maxLength={7}
            className="h-10 rounded-full border border-black/10 bg-white px-4 font-mono text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-200 dark:placeholder:text-neutral-600 dark:focus:ring-white/20"
          />
          <button
            type="submit"
            disabled={!isValidHex}
            className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-40 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
          >
            Generate
          </button>
        </div>

        {/* Presets */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-neutral-400">Try:</span>
          {PRESETS.map((hex) => (
            <button
              key={hex}
              type="button"
              onClick={() => loadPreset(hex)}
              className="flex items-center gap-1.5 rounded-full border border-black/8 bg-white px-2.5 py-1 text-xs font-medium text-neutral-600 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white/12"
            >
              <span
                className="inline-block h-3 w-3 rounded-full border border-black/10 dark:border-white/10"
                style={{ backgroundColor: hex }}
              />
              {hex}
            </button>
          ))}
        </div>
      </form>

      {/* Results */}
      {palette ? (
        <div className="space-y-8">
          {/* Scales */}
          <div className="space-y-6 rounded-2xl border border-black/6 bg-white/60 p-6 dark:border-white/8 dark:bg-white/4">
            <ScaleRow scale={palette.primary.colors} label="Primary Scale" />
            <ScaleRow scale={palette.neutral.colors} label="Neutral Scale" />
          </div>

          {/* Semantics */}
          <div className="rounded-2xl border border-black/6 bg-white/60 p-6 dark:border-white/8 dark:bg-white/4">
            <SemanticRow palette={palette} />
          </div>

          {/* WCAG */}
          <div className="rounded-2xl border border-black/6 bg-white/60 p-6 dark:border-white/8 dark:bg-white/4">
            <WcagMatrix palette={palette} />
          </div>

          {/* Export */}
          <ExportSection palette={palette} />
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-black/10 dark:border-white/10">
          <p className="text-sm text-neutral-400 dark:text-neutral-500">
            Enter a brand color above to generate your design system
          </p>
        </div>
      )}
    </main>
  );
}
