"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ShareOnXButton, ShareLinkButton } from "@/src/components/share-link-button";
import { UpgradeModal, useUpgradeModal } from "@/src/components/upgrade-modal";
import { SaveToProjectButton } from "@/src/components/save-to-project";
import { PaletteCritiquePanel } from "@/src/components/palette-critique-panel";
import { AiUsageBadge } from "@/src/components/ai-usage-badge";
import { DownloadPaletteImage } from "@/src/components/download-palette-image";
import { classifyError } from "@/src/lib/error-utils";
import { track } from "@/src/lib/track";
import { useImpression } from "@/src/lib/use-impression";
import { toggleFavoriteColor, getFavoriteColorIds } from "@/src/lib/favorites";
import { findClosestArchiveColor } from "@/src/lib/color-utils";
import { colors as archiveColors } from "@/src/data/colors";

import { API_URL } from "@/src/lib/api-config";

/**
 * UTF-8-safe base64 for the shareable prompt in the URL.
 *
 * `btoa()` only accepts Latin-1: it throws InvalidCharacterError on any code
 * point above U+00FF. The share URL was built with a bare `btoa(promptStr)`,
 * and the FIRST entry in PRESETS below is "深夜咖啡馆" — so tapping the default
 * suggestion threw. The generation itself had already succeeded and the palette
 * rendered, then this threw inside the same try block, so the user was shown a
 * palette AND an error message, with no share link. Every Chinese or accented
 * prompt hit it.
 *
 * Encode through TextEncoder so each byte is Latin-1-safe before base64, and
 * decode symmetrically. Pure-ASCII prompts produce byte-identical output to the
 * old code, so links shared before this fix still resolve.
 */
function encodeBase64Utf8(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function decodeBase64Utf8(input: string): string {
  const binary = atob(input);
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

const PRESETS = [
  "深夜咖啡馆",
  "Dark Academia",
  "Arctic Morning",
  "Cyberpunk City",
  "Spring Garden",
  "Golden Desert",
  "Rainy Afternoon",
  "Tokyo Neon",
  "Midsummer Forest",
  "Pale Minimalism",
];

interface MoodColor {
  hex: string;
  name: string;
  description: string;
}

interface MoodResult {
  colors: MoodColor[];
  palette_name: string;
  mood_tag: string;
}

function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export function MoodPalettePage() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<MoodResult | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => { clearTimeout(copiedTimerRef.current); }, []);
  const [savedIdx, setSavedIdx] = useState<Set<number>>(new Set());
  const [shareUrl, setShareUrl] = useState("/mood-palette/");
  const upgrade = useUpgradeModal();
  const impressionRef = useImpression("ai_module_impression", {
    tool: "mood_palette",
    surface: "mood_palette",
  });

  // Load from shared URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("p");
    const c = params.get("c");
    const n = params.get("n");
    const tag = params.get("tag");
    const pname = params.get("pname");
    if (p && c) {
      try {
        const decodedPrompt = decodeBase64Utf8(p);
        const hexes = c.split(",");
        const names = n ? n.split("|") : hexes.map(() => "");
        const colors: MoodColor[] = hexes.map((hex, i) => ({
          hex,
          name: names[i] ?? hex,
          description: "",
        }));
        setPrompt(decodedPrompt);
        setResult({
          colors,
          palette_name: pname ?? decodedPrompt,
          mood_tag: tag ?? "evocative",
        });
      } catch {
        // ignore malformed URL
      }
    }
  }, []);

  const buildShareUrl = useCallback((res: MoodResult, promptStr: string) => {
    const encoded = encodeBase64Utf8(promptStr);
    const hexes = res.colors.map((c) => c.hex).join(",");
    const names = res.colors.map((c) => encodeURIComponent(c.name)).join("|");
    return `/mood-palette/?p=${encoded}&c=${hexes}&n=${names}&pname=${encodeURIComponent(res.palette_name)}&tag=${encodeURIComponent(res.mood_tag)}`;
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    // The REQUEST half of the gate ratio. ai_generated only fires on success, so
    // without this a run of upstream failures would read as "nobody wanted it".
    track("ai_generate_click", { tool: "mood_palette", surface: "mood_palette" });
    setIsLoading(true);
    setError("");
    setResult(null);
    setSavedIdx(new Set());
    try {
      const res = await fetch(`${API_URL}/ai/mood-palette`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      if (res.status === 429) {
        const limitData = await res.json().catch(() => ({}));
        if (limitData.limit) {
          upgrade.handleRateLimitError(limitData);
          return;
        }
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Server error");
      }
      const data: MoodResult = await res.json();
      setResult(data);
      track("ai_generated", { tool: "mood_palette", surface: "mood_palette", mood: data.mood_tag });
      const url = buildShareUrl(data, prompt.trim());
      setShareUrl(url);
      window.history.replaceState(null, "", url);
    } catch (err) {
      setError(classifyError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const copyHex = (hex: string, idx: number) => {
    navigator.clipboard.writeText(hex);
    setCopiedIdx(idx);
    copiedTimerRef.current = setTimeout(() => setCopiedIdx(null), 1400);
    // "Did they keep it" — the second half of the AI gate. Copying is the only
    // evidence the generated colour was worth anything; without it the gate can
    // only measure curiosity. Deduped per visit at query time via session_id.
    track("ai_result_copied", { tool: "mood_palette", surface: "mood_palette" });
  };

  const saveColor = (color: MoodColor, idx: number) => {
    const match = findClosestArchiveColor(archiveColors, color.hex);
    if (!match) return;
    if (!getFavoriteColorIds().includes(match.id)) toggleFavoriteColor(match.id);
    setSavedIdx((prev) => new Set(prev).add(idx));
  };

  const xText = result
    ? `"${result.palette_name}" — a ${result.mood_tag} palette generated from "${prompt}" ✦ #colorarchive #colorpalette`
    : "";

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Header */}
      <section className="max-w-2xl mx-auto px-4 pt-12 pb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">AI Tool</p>
          <AiUsageBadge />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-light tracking-tight text-neutral-900 dark:text-white mb-3">
          Mood Palette Generator
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
          Describe a mood, scene, or emotion — get a 5-color palette that captures it.
        </p>
      </section>

      {/* Input */}
      <section className="max-w-2xl mx-auto px-4 pb-6">
        <div ref={impressionRef} className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-5">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
            }}
            placeholder="e.g. deep night coffee shop, warm amber glow, jazz playing low..."
            rows={3}
            className="w-full text-sm text-slate-800 dark:text-slate-200 bg-transparent placeholder:text-slate-400 focus:outline-none resize-none"
          />

          {/* Preset chips */}
          <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPrompt(p)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  prompt === p
                    ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                    : "border-slate-200 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-white/30"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] text-slate-400">⌘ + Enter to generate</p>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-colors disabled:opacity-40"
            >
              {isLoading ? "Generating…" : "Generate Palette"}
            </button>
          </div>
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>
      </section>

      {/* Loading skeleton */}
      {isLoading && (
        <section className="max-w-2xl mx-auto px-4 pb-10">
          <div className="grid grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-slate-100 dark:bg-white/8 animate-pulse" />
            ))}
          </div>
        </section>
      )}

      {/* Result */}
      {result && !isLoading && (
        <section className="max-w-2xl mx-auto px-4 pb-12">
          {/* Palette name + mood */}
          <div className="text-center mb-5">
            <h2 className="text-xl font-display font-normal text-neutral-900 dark:text-white">{result.palette_name}</h2>
            <span className="text-xs text-slate-400 italic">{result.mood_tag}</span>
          </div>

          {/* Color swatches */}
          <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-5">
            {result.colors.map((color, i) => {
              const lum = luminance(color.hex);
              const textColor = lum > 140 ? "#1a1a1a" : "#ffffff";
              return (
                <div key={i} className="flex flex-col gap-1.5">
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={`Copy ${color.hex}`}
                    className="h-32 sm:h-40 rounded-2xl shadow-sm relative group cursor-pointer"
                    style={{ backgroundColor: color.hex }}
                    onClick={() => copyHex(color.hex, i)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); copyHex(color.hex, i); } }}
                  >
                    <div
                      className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold"
                      style={{ color: textColor, backgroundColor: `${color.hex}cc` }}
                    >
                      {copiedIdx === i ? "✓" : "Copy"}
                    </div>
                  </div>
                  <p className="text-[10px] font-semibold text-neutral-700 dark:text-neutral-300 truncate">{color.name}</p>
                  <p className="text-[10px] font-mono text-slate-400">{color.hex.toUpperCase()}</p>
                  <p className="text-[9px] text-slate-400 leading-tight line-clamp-2 hidden sm:block">{color.description}</p>
                  <button
                    type="button"
                    onClick={() => saveColor(color, i)}
                    className={`text-[10px] font-medium transition-colors ${
                      savedIdx.has(i) ? "text-emerald-500" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  >
                    {savedIdx.has(i) ? "✓ Saved" : "+ Save"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Share row */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
            <ShareLinkButton href={shareUrl} label="Copy palette link" />
            <ShareOnXButton text={xText} href={shareUrl} />
            <DownloadPaletteImage
              colors={result.colors.map((c) => ({ hex: c.hex, name: c.name }))}
              title={result.palette_name}
              subtitle={result.mood_tag}
            />
            <SaveToProjectButton
              palette={result.colors.map((c) => c.hex)}
              defaultName={result.palette_name}
            />
          </div>

          {/* AI Design Critique */}
          <div className="mt-6">
            <PaletteCritiquePanel palette={result.colors.map((c) => c.hex)} />
          </div>
        </section>
      )}

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
