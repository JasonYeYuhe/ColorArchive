"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CopyButton } from "@/src/components/copy-button";
import { useLocale } from "@/src/components/locale-provider";
import {
  colorTrends2026,
  CATEGORY_LABELS,
  CATEGORY_LABELS_ZH,
  type ColorTrend,
  type TrendCategory,
} from "@/src/lib/color-trends";

const ALL_CATEGORIES: TrendCategory[] = [
  "fashion",
  "interior",
  "tech",
  "branding",
  "editorial",
  "universal",
];

function TrendCard({ trend, locale }: { trend: ColorTrend; locale: string }) {
  const [expanded, setExpanded] = useState(false);

  const categoryLabel =
    locale === "zh"
      ? CATEGORY_LABELS_ZH[trend.category]
      : CATEGORY_LABELS[trend.category];

  const name = locale === "zh" ? trend.nameZh : trend.name;
  const tagline = locale === "zh" ? trend.taglineZh : trend.tagline;
  const description = locale === "zh" ? trend.descriptionZh : trend.description;
  const context = locale === "zh" ? trend.contextZh : trend.context;
  const designGuidance = locale === "zh" ? trend.designGuidanceZh : trend.designGuidance;

  const loadInPalette = () => {
    const hexes = trend.colors.map((c) => c.hex.replace("#", "").toLowerCase());
    const url = `/palette/?colors=${hexes.join(",")}`;
    window.open(url, "_blank");
  };

  return (
    <article className="group flex flex-col rounded-2xl border border-black/8 bg-white transition hover:border-black/12 hover:shadow-md dark:border-white/8 dark:bg-neutral-900 dark:hover:border-white/12">
      {/* Swatch strip */}
      <div className="flex h-24 overflow-hidden rounded-t-2xl">
        {trend.colors.map((color, i) => (
          <div
            key={i}
            className="flex-1 transition-all duration-300 group-hover:first:flex-[1.6]"
            style={{ backgroundColor: color.hex }}
            title={`${color.name} — ${color.hex}`}
          />
        ))}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <div
                className="h-3 w-3 rounded-full ring-1 ring-black/10 flex-shrink-0"
                style={{ backgroundColor: trend.heroHex }}
              />
              <span className="text-xl font-black tracking-tight text-neutral-900 dark:text-neutral-100">
                {name}
              </span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                {categoryLabel}
              </span>
            </div>
            <p className="text-[12px] leading-relaxed text-neutral-500 dark:text-neutral-400">
              {tagline}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="mb-4 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
          {description}
        </p>

        {/* Color swatches */}
        <div className="mb-4 grid grid-cols-3 gap-2">
          {trend.colors.map((color) => (
            <div key={color.hex} className="flex items-center gap-2">
              <div
                className="h-7 w-7 flex-shrink-0 rounded-lg ring-1 ring-black/10 dark:ring-white/10"
                style={{ backgroundColor: color.hex }}
              />
              <div className="min-w-0">
                <div className="truncate text-[10px] font-medium text-neutral-700 dark:text-neutral-300">
                  {color.name}
                </div>
                <CopyButton value={color.hex} label={color.hex} variant="compact" copiedLabel="\u2713 Copied" />
              </div>
            </div>
          ))}
        </div>

        {/* Expand/collapse */}
        {expanded && (
          <div className="mb-4 space-y-3 border-t border-black/6 pt-4 dark:border-white/6">
            <div>
              <h4 className="mb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                {locale === "zh" ? "趋势背景" : "Trend Context"}
              </h4>
              <p className="text-[12px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                {context}
              </p>
            </div>
            <div>
              <h4 className="mb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                {locale === "zh" ? "设计指导" : "Design Guidance"}
              </h4>
              <p className="text-[12px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                {designGuidance}
              </p>
            </div>
            <div>
              <h4 className="mb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                {locale === "zh" ? "适用行业" : "Industries"}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {trend.industries.map((ind) => (
                  <span
                    key={ind}
                    className="rounded-full border border-black/8 px-2 py-0.5 text-[10px] text-neutral-500 dark:border-white/8 dark:text-neutral-400"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-black/6 pt-3 dark:border-white/6">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] font-medium text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            {expanded
              ? locale === "zh"
                ? "收起"
                : "Show less"
              : locale === "zh"
              ? "展开详情"
              : "Expand details"}
          </button>
          <span className="text-neutral-200 dark:text-neutral-700">·</span>
          <button
            type="button"
            onClick={loadInPalette}
            className="text-[11px] font-medium text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            {locale === "zh" ? "在调色板中打开" : "Open in Palette"}
          </button>
          {trend.relatedCollectionSlug && (
            <>
              <span className="text-neutral-200 dark:text-neutral-700">·</span>
              <Link
                href={`/collections/${trend.relatedCollectionSlug}/`}
                className="text-[11px] font-medium text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              >
                {locale === "zh" ? "相关合集" : "Related Collection"}
              </Link>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export function ColorTrendsPage() {
  const { locale } = useLocale();
  const [activeCategory, setActiveCategory] = useState<TrendCategory | "all">("all");

  const filtered =
    activeCategory === "all"
      ? colorTrends2026
      : colorTrends2026.filter((t) => t.category === activeCategory);

  const allLabel = locale === "zh" ? "全部" : "All";

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Page header */}
      <header className="mb-10">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            2026
          </span>
        </div>
        <h1 className="mb-3 text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl dark:text-neutral-100">
          {locale === "zh" ? "2026年色彩趋势" : "Color Trends 2026"}
        </h1>
        <p className="max-w-2xl text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          {locale === "zh"
            ? "八种定义2026年设计语言的色彩趋势——跨越时尚、室内、科技与品牌领域。每种趋势包含精选调色板、设计背景与使用指导。"
            : "Eight color trends defining the design language of 2026 — across fashion, interior, tech, and branding. Each trend includes a curated palette, cultural context, and design guidance."}
        </p>
      </header>

      {/* Category filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition ${
            activeCategory === "all"
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
          }`}
        >
          {allLabel}
        </button>
        {ALL_CATEGORIES.map((cat) => {
          const hasItems = colorTrends2026.some((t) => t.category === cat);
          if (!hasItems) return null;
          const label =
            locale === "zh" ? CATEGORY_LABELS_ZH[cat] : CATEGORY_LABELS[cat];
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition ${
                activeCategory === cat
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Trend grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((trend) => (
          <TrendCard key={trend.id} trend={trend} locale={locale} />
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 rounded-2xl bg-neutral-50 p-8 text-center dark:bg-neutral-900">
        <h2 className="mb-2 text-lg font-bold text-neutral-900 dark:text-neutral-100">
          {locale === "zh" ? "探索所有5446种颜色" : "Explore All 5,446 Colors"}
        </h2>
        <p className="mb-4 text-[13px] text-neutral-500 dark:text-neutral-400">
          {locale === "zh"
            ? "在ColorArchive的完整色彩库中找到这些趋势色调的完美匹配。"
            : "Find the perfect match for these trend tones in ColorArchive's complete color library."}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/all-colors/"
            className="rounded-xl bg-neutral-900 px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            {locale === "zh" ? "浏览全部颜色" : "Browse All Colors"}
          </Link>
          <Link
            href="/palette-generator/"
            className="rounded-xl border border-black/8 bg-white px-4 py-2 text-[12px] font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:border-white/8 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            {locale === "zh" ? "调色板生成器" : "Palette Generator"}
          </Link>
          <Link
            href="/collections/"
            className="rounded-xl border border-black/8 bg-white px-4 py-2 text-[12px] font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:border-white/8 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            {locale === "zh" ? "精选合集" : "Curated Collections"}
          </Link>
        </div>
      </div>
    </main>
  );
}
