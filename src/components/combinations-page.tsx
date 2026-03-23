"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/src/components/locale-provider";
import type { ColorCombination, HarmonyType } from "@/src/lib/combinations";

interface CombinationsPageProps {
  combinations: ColorCombination[];
}

const HARMONY_LABELS: Record<HarmonyType, string> = {
  complementary: "Complementary",
  analogous: "Analogous",
  triadic: "Triadic",
  "split-complementary": "Split Complementary",
  "neutral-accent": "Neutral + Accent",
  monochromatic: "Monochromatic",
  custom: "Custom",
};

function CopyButton({ hex }: { hex: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
    >
      {copied ? "✓" : hex}
    </button>
  );
}

function CombinationCard({ combo }: { combo: ColorCombination }) {
  return (
    <div className="group rounded-2xl border border-black/8 bg-white p-5 transition hover:border-black/12 hover:shadow-sm dark:border-white/8 dark:bg-neutral-900 dark:hover:border-white/12">
      {/* Color swatches */}
      <div className="mb-4 flex h-16 overflow-hidden rounded-xl">
        {combo.colors.map((color, i) => (
          <div
            key={color.id}
            className="flex-1 transition-all duration-300 group-hover:flex-[1.2]"
            style={{ backgroundColor: color.hex }}
            title={color.name}
          />
        ))}
      </div>

      {/* Name + harmony badge */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {combo.name}
        </h3>
        <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
          {HARMONY_LABELS[combo.harmonyType]}
        </span>
      </div>

      {/* Description */}
      <p className="mb-3 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
        {combo.description}
      </p>

      {/* Use case */}
      <p className="mb-4 text-[11px] font-medium text-neutral-500 dark:text-neutral-500">
        <span className="text-neutral-400 dark:text-neutral-600">Use: </span>
        {combo.useCase}
      </p>

      {/* Color hex codes + links */}
      <div className="flex flex-wrap gap-2">
        {combo.colors.map((color) => (
          <Link
            key={color.id}
            href={`/colors/${color.id}/`}
            className="flex items-center gap-1.5 rounded-full border border-black/8 bg-neutral-50 px-2 py-1 transition hover:border-black/16 hover:bg-white dark:border-white/8 dark:bg-neutral-800 dark:hover:bg-neutral-700"
          >
            <span
              className="h-3 w-3 rounded-full border border-black/10 dark:border-white/10"
              style={{ backgroundColor: color.hex }}
            />
            <CopyButton hex={color.hex} />
          </Link>
        ))}
      </div>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-1">
        {combo.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CombinationsPage({ combinations }: CombinationsPageProps) {
  const { t } = useLocale();
  const [activeHarmony, setActiveHarmony] = useState<HarmonyType | "all">("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allHarmonies = useMemo((): HarmonyType[] => {
    const seen = new Set<HarmonyType>();
    for (const c of combinations) seen.add(c.harmonyType);
    return [...seen];
  }, [combinations]);

  const allTags = useMemo(() => {
    const seen = new Set<string>();
    for (const c of combinations) for (const tag of c.tags) seen.add(tag);
    return [...seen].sort();
  }, [combinations]);

  const filtered = useMemo(() => {
    return combinations.filter((c) => {
      if (activeHarmony !== "all" && c.harmonyType !== activeHarmony) return false;
      if (activeTag !== null && !c.tags.includes(activeTag)) return false;
      return true;
    });
  }, [combinations, activeHarmony, activeTag]);

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <div className="border-b border-black/8 bg-white px-6 py-12 dark:border-white/8 dark:bg-neutral-950">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
            Color Combinations
          </p>
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Curated Color Combinations
          </h1>
          <p className="max-w-xl text-base text-neutral-600 dark:text-neutral-400">
            {combinations.length} handpicked 2–5 color combinations built from the ColorArchive palette. Filter by harmony type or style, copy hex codes, and explore each color in detail.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-0 z-10 border-b border-black/8 bg-white/90 px-6 py-3 backdrop-blur dark:border-white/8 dark:bg-neutral-950/90">
        <div className="mx-auto max-w-6xl">
          {/* Harmony filter */}
          <div className="mb-2 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setActiveHarmony("all")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                activeHarmony === "all"
                  ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
              }`}
            >
              All ({combinations.length})
            </button>
            {allHarmonies.map((h) => {
              const count = combinations.filter((c) => c.harmonyType === h).length;
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => setActiveHarmony(activeHarmony === h ? "all" : h)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    activeHarmony === h
                      ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                  }`}
                >
                  {HARMONY_LABELS[h]} ({count})
                </button>
              );
            })}
          </div>

          {/* Tag filter */}
          <div className="flex flex-wrap gap-1">
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition ${
                  activeTag === tag
                    ? "bg-neutral-700 text-white dark:bg-neutral-200 dark:text-neutral-900"
                    : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-500 dark:hover:bg-neutral-800"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="px-6 py-10">
        <div className="mx-auto max-w-6xl">
          {filtered.length === 0 ? (
            <div className="py-24 text-center text-neutral-400 dark:text-neutral-600">
              No combinations match the selected filters.
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm text-neutral-400 dark:text-neutral-600">
                Showing {filtered.length} combination{filtered.length === 1 ? "" : "s"}
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((combo) => (
                  <CombinationCard key={combo.id} combo={combo} />
                ))}
              </div>
            </>
          )}

          {/* Bottom CTA */}
          <div className="mt-16 rounded-2xl border border-black/8 bg-white p-8 text-center dark:border-white/8 dark:bg-neutral-900">
            <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Build your own combination
            </h2>
            <p className="mb-5 text-sm text-neutral-500 dark:text-neutral-400">
              Use our tools to create custom palettes, check contrast, or explore harmonies from any color in the archive.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/palette-generator/"
                className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
              >
                Palette Generator
              </Link>
              <Link
                href="/harmonies/"
                className="rounded-full border border-black/12 bg-white px-5 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-white/12 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
              >
                Harmony Calculator
              </Link>
              <Link
                href="/contrast/"
                className="rounded-full border border-black/12 bg-white px-5 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-white/12 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
              >
                Contrast Checker
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
