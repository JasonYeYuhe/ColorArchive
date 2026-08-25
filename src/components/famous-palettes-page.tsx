"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CopyButton } from "@/src/components/copy-button";
import { useLocale } from "@/src/components/locale-provider";
import {
  famousPalettes,
  CATEGORY_LABELS,
  CATEGORY_LABELS_ZH,
  type FamousPalette,
  type FamousPaletteCategory,
} from "@/src/lib/famous-palettes";

const ALL_CATEGORIES: FamousPaletteCategory[] = [
  "brand",
  "art",
  "film",
  "design",
  "fashion",
];

function hexToSearch(hex: string): string {
  return hex.replace("#", "").toLowerCase();
}

function PaletteCard({ palette, locale }: { palette: FamousPalette; locale: string }) {
  const categoryLabel =
    locale === "zh"
      ? CATEGORY_LABELS_ZH[palette.category]
      : CATEGORY_LABELS[palette.category];

  const loadInPalette = () => {
    const hexes = palette.colors.slice(0, 8).map((c) => c.hex.replace("#", ""));
    const url = `/palette/?colors=${hexes.join(",")}`;
    window.open(url, "_blank");
  };

  return (
    <article className="group flex flex-col rounded-2xl border border-black/8 bg-white transition hover:border-black/12 hover:shadow-md dark:border-white/8 dark:bg-neutral-900 dark:hover:border-white/12">
      {/* Swatch strip */}
      <div className="flex h-20 overflow-hidden rounded-t-2xl">
        {palette.colors.map((color, i) => (
          <div
            key={i}
            className="flex-1 transition-all duration-300 group-hover:first:flex-[1.3]"
            style={{ backgroundColor: color.hex }}
            title={`${color.name} — ${color.hex}`}
          />
        ))}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                {categoryLabel}
              </span>
              {palette.subcategory && (
                <span className="text-[10px] text-neutral-400 dark:text-neutral-600">
                  {palette.subcategory}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {palette.name}
            </h3>
            {palette.year && (
              <p className="mt-0.5 text-[11px] text-neutral-400 dark:text-neutral-600">
                Est. {palette.year}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="mb-4 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
          {palette.description}
        </p>

        {/* Color chips */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {palette.colors.map((color, i) => (
            <a
              key={i}
              href={`/search/?q=${hexToSearch(color.hex)}`}
              className="group/chip flex items-center gap-1.5 rounded-full border border-black/8 bg-neutral-50 px-2.5 py-1 transition hover:border-black/16 hover:bg-white dark:border-white/8 dark:hover:border-white/20 dark:bg-neutral-800 dark:hover:bg-neutral-700"
              title={`Find ${color.name} in ColorArchive`}
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full border border-black/10 dark:border-white/10"
                style={{ backgroundColor: color.hex }}
              />
              <CopyButton value={color.hex} label={color.hex} trackAs="famous-palettes-swatch" variant="compact" />
            </a>
          ))}
        </div>

        {/* Context note */}
        <p className="mb-4 text-[11px] italic text-neutral-400 dark:text-neutral-600">
          {palette.context}
        </p>

        {/* Tags */}
        <div className="mb-4 flex flex-wrap gap-1">
          {palette.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-auto">
          <button
            type="button"
            onClick={loadInPalette}
            className="w-full rounded-xl border border-black/10 bg-neutral-50 px-4 py-2 text-xs font-medium text-neutral-700 transition hover:border-black/20 hover:bg-white dark:border-white/10 dark:hover:border-white/30 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            Open in Palette Builder →
          </button>
        </div>
      </div>
    </article>
  );
}

export function FamousPalettesPage() {
  const { t, locale } = useLocale();
  const [activeCategory, setActiveCategory] = useState<FamousPaletteCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    let result = famousPalettes;
    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          p.subcategory?.toLowerCase().includes(q) ||
          p.colors.some(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              c.hex.toLowerCase().includes(q),
          ),
      );
    }
    return result;
  }, [activeCategory, searchQuery]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: famousPalettes.length };
    for (const cat of ALL_CATEGORIES) {
      map[cat] = famousPalettes.filter((p) => p.category === cat).length;
    }
    return map;
  }, []);

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Hero */}
      <div className="border-b border-black/8 bg-white px-6 py-12 dark:border-white/8 dark:bg-neutral-950">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
            {t("famousPalettes.eyebrow")}
          </p>
          <h1 className="mb-3 font-display text-3xl font-light tracking-tight text-neutral-900 dark:text-neutral-100">
            {t("famousPalettes.title")}
          </h1>
          <p className="max-w-2xl text-base text-neutral-600 dark:text-neutral-400">
            {t("famousPalettes.subtitle")}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
              {famousPalettes.length} iconic palettes
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
              5 categories
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
              Click any hex to copy
            </span>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="sticky top-0 z-10 border-b border-black/8 bg-white/90 px-6 py-3 backdrop-blur dark:border-white/8 dark:bg-neutral-950/90">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <input
              type="text"
              placeholder="Search palettes, brands, colors…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 rounded-full border border-black/12 bg-neutral-50 px-4 text-sm text-neutral-700 outline-none transition placeholder:text-neutral-400 focus:border-black/24 focus:bg-white dark:border-white/12 dark:bg-neutral-900 dark:text-neutral-300 dark:focus:border-white/24 dark:focus:bg-neutral-800"
            />

            {/* Category filters */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  activeCategory === "all"
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                }`}
              >
                All ({counts.all})
              </button>
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    activeCategory === cat
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                  }`}
                >
                  {locale === "zh" ? CATEGORY_LABELS_ZH[cat] : CATEGORY_LABELS[cat]} ({counts[cat]})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No palettes found for &ldquo;{searchQuery}&rdquo;
            </p>
          </div>
        ) : (
          <>
            <p className="mb-6 text-xs text-neutral-400 dark:text-neutral-600">
              {filtered.length} palette{filtered.length !== 1 ? "s" : ""}
              {activeCategory !== "all" &&
                ` in ${locale === "zh" ? CATEGORY_LABELS_ZH[activeCategory] : CATEGORY_LABELS[activeCategory]}`}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((palette) => (
                <PaletteCard key={palette.id} palette={palette} locale={locale} />
              ))}
            </div>
          </>
        )}

        {/* Related tools */}
        <div className="mt-16 rounded-2xl border border-black/8 bg-white p-8 dark:border-white/8 dark:bg-neutral-900">
          <h2 className="mb-2 text-base font-bold text-neutral-900 dark:text-neutral-100">
            Explore More Color Tools
          </h2>
          <p className="mb-5 text-sm text-neutral-600 dark:text-neutral-400">
            Apply these palettes, build your own, or find similar colors in the ColorArchive.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/palette-generator/"
              className="rounded-xl border border-black/10 bg-neutral-50 px-4 py-2 text-sm text-neutral-700 transition hover:border-black/20 hover:bg-white dark:border-white/10 dark:hover:border-white/30 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              Palette Generator →
            </a>
            <a
              href="/combinations/"
              className="rounded-xl border border-black/10 bg-neutral-50 px-4 py-2 text-sm text-neutral-700 transition hover:border-black/20 hover:bg-white dark:border-white/10 dark:hover:border-white/30 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              Color Combinations →
            </a>
            <a
              href="/harmonies/"
              className="rounded-xl border border-black/10 bg-neutral-50 px-4 py-2 text-sm text-neutral-700 transition hover:border-black/20 hover:bg-white dark:border-white/10 dark:hover:border-white/30 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              Color Harmonies →
            </a>
            <Link
              href="/collections/"
              className="rounded-xl border border-black/10 bg-neutral-50 px-4 py-2 text-sm text-neutral-700 transition hover:border-black/20 hover:bg-white dark:border-white/10 dark:hover:border-white/30 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              Curated Collections →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
