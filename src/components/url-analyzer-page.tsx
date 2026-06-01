"use client";

import { useState } from "react";
import Link from "next/link";
import { findClosestArchiveColor } from "@/src/lib/color-utils";
import { classifyError } from "@/src/lib/error-utils";
import { colors as archiveColors } from "@/src/data/colors";
import { SaveToProjectButton } from "@/src/components/save-to-project";
import { PaletteCritiquePanel } from "@/src/components/palette-critique-panel";
import { UpgradeModal, useUpgradeModal } from "@/src/components/upgrade-modal";
import { AiUsageBadge } from "@/src/components/ai-usage-badge";
import type { ColorRecord } from "@/src/types/color";

import { API_URL } from "@/src/lib/api-config";

interface ExtractedColor {
  hex: string;
  frequency: number;
  archiveMatch: ColorRecord | null;
}

function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function UrlAnalyzerPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [colors, setColors] = useState<ExtractedColor[]>([]);
  const [analyzedUrl, setAnalyzedUrl] = useState("");
  const upgrade = useUpgradeModal();

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setColors([]);

    try {
      const res = await fetch(`${API_URL}/ai/analyze-url`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        if (data.limit) {
          upgrade.handleRateLimitError(data);
          return;
        }
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze URL");

      const enriched: ExtractedColor[] = data.colors.map((c: { hex: string; frequency: number }) => ({
        hex: c.hex,
        frequency: c.frequency,
        archiveMatch: findClosestArchiveColor(archiveColors, c.hex),
      }));

      setColors(enriched);
      setAnalyzedUrl(data.url);
    } catch (err) {
      setError(classifyError(err));
    } finally {
      setLoading(false);
    }
  };

  const palette = colors.map((c) => c.hex);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 pb-24">
      <section className="max-w-3xl mx-auto px-4 pt-10 pb-8">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1">AI Tool</p>
            <h1 className="text-3xl sm:text-4xl font-display font-light text-slate-900 dark:text-white leading-tight mb-2">
              Brand Color Analyzer
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg">
              Paste any URL to extract its color palette, find matching ColorArchive colors, and get a design critique.
            </p>
          </div>
          <AiUsageBadge />
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 space-y-8">
        {/* URL Input */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAnalyze(); }}
              placeholder="e.g. stripe.com, linear.app, notion.so"
              className="flex-1 text-sm border border-slate-200 dark:border-white/15 rounded-xl px-4 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !url.trim()}
              className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-40 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
            >
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>
          {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-white dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {/* Results */}
        {colors.length > 0 && !loading && (
          <>
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-slate-800 dark:text-white">
                      Extracted Colors
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">{analyzedUrl}</p>
                  </div>
                  <SaveToProjectButton
                    palette={palette}
                    defaultName={new URL(analyzedUrl).hostname}
                  />
                </div>
              </div>

              {/* Color swatches strip */}
              <div className="flex h-16">
                {colors.map((c, i) => (
                  <div key={i} className="flex-1 relative group" style={{ backgroundColor: c.hex }}>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span
                        className="text-[9px] font-mono px-1 py-0.5 rounded"
                        style={{ color: luminance(c.hex) > 0.5 ? "#1a1a1a" : "#ffffff" }}
                      >
                        {c.hex.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Color details */}
              <div className="divide-y divide-slate-100 dark:divide-white/10">
                {colors.map((c, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3">
                    <div className="w-8 h-8 rounded-lg border border-black/10 dark:border-white/10 shrink-0" style={{ backgroundColor: c.hex }} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-mono text-slate-700 dark:text-slate-300">{c.hex.toUpperCase()}</span>
                      <span className="text-xs text-slate-400 ml-2">({c.frequency}x)</span>
                    </div>
                    {c.archiveMatch && (
                      <Link
                        href={`/colors/${c.archiveMatch.id}/`}
                        className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
                      >
                        <div className="w-4 h-4 rounded border border-black/10 dark:border-white/10" style={{ backgroundColor: c.archiveMatch.hex }} />
                        {c.archiveMatch.name}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Critique */}
            <PaletteCritiquePanel palette={palette} />
          </>
        )}

        {/* How it works */}
        {colors.length === 0 && !loading && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-3">How it works</h2>
            <div className="grid sm:grid-cols-3 gap-4 text-sm text-slate-500 dark:text-slate-400">
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">1. Paste a URL</p>
                <p>Enter any website address. We fetch the page and scan all CSS for color values.</p>
              </div>
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">2. Extract Colors</p>
                <p>We identify hex, RGB, and HSL colors, rank them by frequency, and match each to the ColorArchive.</p>
              </div>
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">3. Get Insights</p>
                <p>Run an AI design critique, save as a project, or rebuild the palette with ColorArchive colors.</p>
              </div>
            </div>
          </div>
        )}

        {/* Related tools */}
        <section>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Related tools</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/brand-generator/", label: "Brand Generator" },
              { href: "/image-palette/", label: "Image Color Extractor" },
              { href: "/contrast/", label: "Contrast Checker" },
              { href: "/mood-palette/", label: "Mood Palette" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 text-sm bg-white dark:bg-white/8 border border-slate-200 dark:border-white/10 rounded-lg text-slate-600 dark:text-slate-300 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
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
