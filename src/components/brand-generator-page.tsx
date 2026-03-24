"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { hexToRgb, rgbToHsl } from "@/src/lib/color-utils";
import { colors as archiveColors } from "@/src/data/colors";
import { ShareOnXButton } from "@/src/components/share-link-button";
import { UpgradeModal, useUpgradeModal } from "@/src/components/upgrade-modal";
import { ProGate } from "@/src/components/pro-gate";
import { SaveToProjectButton } from "@/src/components/save-to-project";
import { PaletteCritiquePanel } from "@/src/components/palette-critique-panel";
import type { ColorRecord } from "@/src/types/color";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.colorarchive.me";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface BrandColor {
  role: string;
  hex: string;
  name: string;
  rationale: string;
}

interface GeneratedPalette {
  palette: BrandColor[];
  summary: string;
}

/* ------------------------------------------------------------------ */
/*  Archive matching                                                   */
/* ------------------------------------------------------------------ */

function colorDistance(
  r1: number, g1: number, b1: number,
  r2: number, g2: number, b2: number
): number {
  const dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
  return Math.sqrt(2 * dr * dr + 4 * dg * dg + 3 * db * db);
}

function findClosestArchiveColor(hex: string): ColorRecord | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  let best: { color: ColorRecord; d: number } | null = null;
  for (const ac of archiveColors) {
    const acRgb = hexToRgb(ac.hex);
    if (!acRgb) continue;
    const d = colorDistance(rgb.r, rgb.g, rgb.b, acRgb.r, acRgb.g, acRgb.b);
    if (!best || d < best.d) best = { color: ac, d };
  }
  return best?.color ?? null;
}

/* ------------------------------------------------------------------ */
/*  Export helpers                                                     */
/* ------------------------------------------------------------------ */

function toCssVars(palette: BrandColor[]): string {
  return [
    ":root {",
    ...palette.map((c) => {
      const varName = `--brand-${c.role.toLowerCase().replace(/\s+/g, "-")}`;
      return `  ${varName}: ${c.hex};`;
    }),
    "}",
  ].join("\n");
}

function toTailwindConfig(palette: BrandColor[]): string {
  const entries = palette.map((c) => {
    const key = c.role.toLowerCase().replace(/\s+/g, "-");
    return `      "${key}": "${c.hex}",`;
  });
  return [
    "// tailwind.config.js",
    "module.exports = {",
    "  theme: {",
    "    extend: {",
    "      colors: {",
    "        brand: {",
    ...entries,
    "        },",
    "      },",
    "    },",
    "  },",
    "};",
  ].join("\n");
}

/* ------------------------------------------------------------------ */
/*  Luminance helper                                                   */
/* ------------------------------------------------------------------ */

function textColorFor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#000";
  const l = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return l > 0.5 ? "#1a1a1a" : "#ffffff";
}

/* ------------------------------------------------------------------ */
/*  Copy button                                                        */
/* ------------------------------------------------------------------ */

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      onClick={handle}
      className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
    >
      {copied ? "✓ Copied" : label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Result display                                                     */
/* ------------------------------------------------------------------ */

function PaletteResult({
  generated,
  inputs,
}: {
  generated: GeneratedPalette;
  inputs: { industry: string; style: string; audience: string; keywords: string };
}) {
  const [exportMode, setExportMode] = useState<"css" | "tailwind">("css");

  const exportText = exportMode === "css"
    ? toCssVars(generated.palette)
    : toTailwindConfig(generated.palette);

  const xText = `Generated my brand palette with @ColorArchive AI ✦ ${generated.palette.slice(0, 3).map((c) => c.name).join(" · ")} #colorarchive #branddesign #colorpalette`;

  return (
    <div className="space-y-8">
      {/* Summary */}
      {generated.summary && (
        <p className="text-slate-600 text-sm leading-relaxed italic border-l-2 border-slate-300 pl-4">
          {generated.summary}
        </p>
      )}

      {/* Color cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {generated.palette.map((c) => {
          const tc = textColorFor(c.hex);
          const closest = findClosestArchiveColor(c.hex);
          return (
            <div key={c.role} className="rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-white">
              <div
                className="h-28 relative flex items-end p-3"
                style={{ backgroundColor: c.hex }}
              >
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: tc === "#ffffff" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)",
                    color: tc,
                  }}
                >
                  {c.role}
                </span>
                <button
                  className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full transition-colors"
                  style={{
                    backgroundColor: tc === "#ffffff" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.08)",
                    color: tc,
                  }}
                  onClick={() => navigator.clipboard.writeText(c.hex)}
                  title={`Copy ${c.hex}`}
                >
                  {c.hex.toUpperCase()}
                </button>
              </div>
              <div className="p-3 space-y-1.5">
                <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{c.rationale}</p>
                {closest && (
                  <div className="pt-1.5 border-t border-slate-100 flex items-center gap-1.5">
                    <div
                      className="w-3.5 h-3.5 rounded-sm shrink-0"
                      style={{ backgroundColor: closest.hex }}
                    />
                    <Link
                      href={`/colors/${closest.id}/`}
                      className="text-[10px] text-indigo-600 hover:underline truncate"
                    >
                      Closest: {closest.name}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Export section */}
      <ProGate label="Export">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-base font-semibold text-slate-800">Export</h3>
            <div className="flex items-center gap-2">
              {(["css", "tailwind"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setExportMode(fmt)}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors ${
                    exportMode === fmt
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {fmt === "css" ? "CSS Variables" : "Tailwind"}
                </button>
              ))}
              <CopyButton text={exportText} label="Copy" />
            </div>
          </div>
          <pre className="text-xs font-mono text-slate-600 bg-slate-50 rounded-xl p-4 overflow-auto whitespace-pre-wrap max-h-48">
            {exportText}
          </pre>
        </div>
      </ProGate>

      {/* Share + CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <ShareOnXButton text={xText} href="/brand-generator/" />
          <SaveToProjectButton
            palette={generated.palette.map((c) => c.hex)}
            defaultName={inputs.industry || inputs.style || "Brand Palette"}
          />
        </div>
        <Link
          href="/packs/brand-starter-kit/"
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-700 transition-colors"
        >
          Get Brand Color Starter Kit →
        </Link>
      </div>

      {/* AI Design Critique */}
      <PaletteCritiquePanel palette={generated.palette.map((c) => c.hex)} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

const STYLE_PRESETS = ["Minimal", "Bold", "Elegant", "Playful", "Natural", "Tech", "Luxury", "Warm"];
const INDUSTRY_PRESETS = ["SaaS / Tech", "Fashion", "Health & Wellness", "Food & Beverage", "Finance", "Creative Agency", "Education", "Real Estate"];

export function BrandGeneratorPage() {
  const [industry, setIndustry] = useState("");
  const [style, setStyle] = useState("");
  const [audience, setAudience] = useState("");
  const [keywords, setKeywords] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedPalette | null>(null);
  const upgrade = useUpgradeModal();

  const handleGenerate = useCallback(async () => {
    if (!industry && !style && !keywords) {
      setError("Please fill in at least one field.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/ai/brand-palette`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry, style, audience, keywords }),
      });
      const data = await res.json();
      if (res.status === 429 && data.limit) {
        upgrade.handleRateLimitError(data);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Failed to generate palette");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [industry, style, audience, keywords, upgrade]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-24">
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 pt-10 pb-8">
        <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1">AI Tool</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-2">
          Brand Color Generator
        </h1>
        <p className="text-slate-500 text-sm max-w-lg">
          Describe your brand and get a complete 6-color palette — primary, accents, neutrals, and highlight — with rationale for every choice.
        </p>
      </section>

      <div className="max-w-3xl mx-auto px-4 space-y-8">
        {/* Input form */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          {/* Industry */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Industry / Category
            </label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. SaaS startup, organic skincare, architecture firm"
              className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {INDUSTRY_PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setIndustry(p)}
                  className="px-2.5 py-0.5 text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-500 rounded-full transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Visual Style / Aesthetic
            </label>
            <input
              type="text"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="e.g. minimal and clean, bold and modern, soft and approachable"
              className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {STYLE_PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setStyle(p)}
                  className="px-2.5 py-0.5 text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-500 rounded-full transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Audience */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Target Audience <span className="text-slate-300 font-normal normal-case">(optional)</span>
            </label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g. young professionals, luxury consumers, creative freelancers"
              className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Brand Values / Keywords <span className="text-slate-300 font-normal normal-case">(optional)</span>
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. trustworthy, innovative, sustainable, premium"
              className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
              isLoading
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-slate-900 text-white hover:bg-slate-700"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                Generating your palette…
              </span>
            ) : (
              "Generate Brand Palette"
            )}
          </button>
        </div>

        {/* Result */}
        {result && (
          <PaletteResult
            generated={result}
            inputs={{ industry, style, audience, keywords }}
          />
        )}

        {/* How it works */}
        {!result && (
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-3">How it works</h2>
            <div className="grid sm:grid-cols-3 gap-4 text-sm text-slate-500">
              <div>
                <p className="font-medium text-slate-700 mb-1">1. Describe</p>
                <p>Tell us your industry, aesthetic, and what your brand stands for. The more detail, the better the result.</p>
              </div>
              <div>
                <p className="font-medium text-slate-700 mb-1">2. Generate</p>
                <p>Claude analyzes your inputs against color psychology and design principles to build a 6-color system.</p>
              </div>
              <div>
                <p className="font-medium text-slate-700 mb-1">3. Export</p>
                <p>Copy CSS variables or Tailwind config. Each color links to the closest ColorArchive match for exploration.</p>
              </div>
            </div>
          </section>
        )}

        {/* Related tools */}
        <section>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Related tools</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/contrast/", label: "Contrast Checker" },
              { href: "/tokens/", label: "Token Generator" },
              { href: "/harmonies/", label: "Color Harmonies" },
              { href: "/image-palette/", label: "Image Color Extractor" },
              { href: "/color-quiz/", label: "Color Personality Quiz" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-600 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </section>
      </div>

      <UpgradeModal
        open={upgrade.open}
        onClose={upgrade.close}
        tier={upgrade.info.tier}
        used={upgrade.info.used}
        limit={upgrade.info.limit}
      />
    </main>
  );
}
