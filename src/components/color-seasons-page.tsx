"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/src/components/locale-provider";
import {
  colorSeasons,
  MOOD_LABELS,
  MOOD_LABELS_ZH,
  type ColorSeason,
  type SeasonMood,
} from "@/src/lib/color-seasons";

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => { clearTimeout(timerRef.current); }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      timerRef.current = setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
      title={`Copy ${value}`}
    >
      {copied ? "✓" : label}
    </button>
  );
}

function SeasonCard({
  season,
  locale,
}: {
  season: ColorSeason;
  locale: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const moodLabel =
    locale === "zh"
      ? MOOD_LABELS_ZH[season.mood]
      : MOOD_LABELS[season.mood];

  const name = locale === "zh" ? season.nameZh : season.name;
  const tagline = locale === "zh" ? season.taglineZh : season.tagline;
  const description = locale === "zh" ? season.descriptionZh : season.description;
  const context = locale === "zh" ? season.contextZh : season.context;
  const designTips = locale === "zh" ? season.designTipsZh : season.designTips;
  const natureSources = locale === "zh" ? season.natureSourcesZh : season.natureSources;
  const industryUses = locale === "zh" ? season.industryUsesZh : season.industryUses;

  const loadInPalette = () => {
    const hexes = season.colors
      .map((c) => c.hex.replace("#", "").toLowerCase());
    const url = `/palette/?colors=${hexes.join(",")}`;
    window.open(url, "_blank");
  };

  return (
    <article className="group flex flex-col rounded-2xl border border-black/8 bg-white transition hover:border-black/12 hover:shadow-md dark:border-white/8 dark:bg-neutral-900 dark:hover:border-white/12">
      {/* Swatch strip */}
      <div className="flex h-20 overflow-hidden rounded-t-2xl">
        {season.colors.map((color, i) => (
          <div
            key={i}
            className="flex-1 transition-all duration-300 group-hover:first:flex-[1.4]"
            style={{ backgroundColor: color.hex }}
            title={`${color.name} — ${color.hex}`}
          />
        ))}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="mb-1.5 flex items-center gap-2 flex-wrap">
              <span className="text-2xl font-black tracking-tighter text-neutral-900 dark:text-neutral-100">
                {name}
              </span>
              <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                {moodLabel}
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {season.months}
            </p>
            <p className="mt-1.5 text-sm font-medium italic text-neutral-700 dark:text-neutral-300">
              "{tagline}"
            </p>
          </div>
          <button
            type="button"
            onClick={loadInPalette}
            className="shrink-0 rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            title="Open palette in Palette Builder"
          >
            Open →
          </button>
        </div>

        {/* Description */}
        <p className="mb-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          {description}
        </p>

        {/* Color swatches with names */}
        <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {season.colors.map((color) => (
            <div key={color.hex} className="flex flex-col items-center gap-1.5">
              <div
                className="h-10 w-full rounded-lg shadow-sm"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
              <p className="text-center text-[10px] font-medium leading-tight text-neutral-700 dark:text-neutral-300">
                {color.name}
              </p>
              <div className="flex items-center gap-1">
                <CopyButton value={color.hex} label={color.hex.toUpperCase()} />
              </div>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {season.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Expand / collapse */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mb-4 self-start text-xs font-medium text-neutral-500 underline-offset-2 transition hover:text-neutral-900 hover:underline dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          {expanded ? "↑ Less detail" : "↓ More detail"}
        </button>

        {expanded && (
          <div className="mt-1 space-y-4 border-t border-neutral-100 pt-4 dark:border-neutral-800">
            {/* Context */}
            <div>
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Cultural Context
              </h4>
              <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {context}
              </p>
            </div>

            {/* Design tips */}
            <div>
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Design Tips
              </h4>
              <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {designTips}
              </p>
            </div>

            {/* Two columns: nature + industry */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  Nature Sources
                </h4>
                <ul className="space-y-1">
                  {natureSources.map((source) => (
                    <li
                      key={source}
                      className="text-xs text-neutral-600 dark:text-neutral-400"
                    >
                      · {source}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  Industry Uses
                </h4>
                <ul className="space-y-1">
                  {industryUses.map((use) => (
                    <li
                      key={use}
                      className="text-xs text-neutral-600 dark:text-neutral-400"
                    >
                      · {use}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export function ColorSeasonsPage() {
  const { t, locale } = useLocale();

  const heading = locale === "zh" ? "四季色彩" : "Color by Season";
  const subheading =
    locale === "zh"
      ? "春夏秋冬的调色板：自然来源、文化背景与设计指导"
      : "The four-season color reference: natural sources, cultural context, and design guidance";

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-10 max-w-2xl">
        <h1 className="mb-3 text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl dark:text-neutral-100">
          {heading}
        </h1>
        <p className="text-base leading-relaxed text-neutral-500 dark:text-neutral-400">
          {subheading}
        </p>
        <div className="mt-4 flex gap-3 text-sm text-neutral-500 dark:text-neutral-400">
          <span>4 seasons</span>
          <span>·</span>
          <span>24 signature colors</span>
          <span>·</span>
          <span>Copy hex codes instantly</span>
        </div>
      </div>

      {/* Season gradient strip */}
      <div
        className="mb-10 h-3 rounded-full"
        style={{
          background:
            "linear-gradient(to right, #F9C6C9, #B8E4C5, #FF6B6B, #4ECDC4, #C0392B, #27684A, #1B3A6B, #9E2A2B)",
        }}
        aria-hidden="true"
      />

      {/* Season cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {colorSeasons.map((season) => (
          <SeasonCard key={season.id} season={season} locale={locale} />
        ))}
      </div>

      {/* Bottom CTA section */}
      <div className="mt-12 rounded-2xl border border-black/8 bg-neutral-50 p-8 text-center dark:border-white/8 dark:bg-neutral-900">
        <h2 className="mb-2 text-xl font-bold text-neutral-900 dark:text-neutral-100">
          {locale === "zh" ? "探索更多色彩" : "Explore More Colors"}
        </h2>
        <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
          {locale === "zh"
            ? "浏览完整色彩档案，或探索特定系列"
            : "Browse the full color archive or explore curated collections"}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/all-colors/"
            className="rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            {locale === "zh" ? "浏览所有颜色" : "Browse All Colors"}
          </Link>
          <Link
            href="/collections/"
            className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            {locale === "zh" ? "精选系列" : "Curated Collections"}
          </Link>
          <Link
            href="/decades/"
            className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            {locale === "zh" ? "年代色彩" : "Color by Decade"}
          </Link>
          <Link
            href="/stories/"
            className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            {locale === "zh" ? "色彩故事" : "Color Stories"}
          </Link>
        </div>
      </div>

      {/* SEO content */}
      <section className="mt-12 space-y-6 rounded-2xl border border-black/8 bg-white p-8 dark:border-white/8 dark:bg-neutral-900">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
          {locale === "zh"
            ? "关于四季色彩调色板"
            : "About Seasonal Color Palettes"}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              {locale === "zh" ? "色彩的季节节奏" : "The Seasonal Rhythm of Color"}
            </h3>
            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {locale === "zh"
                ? "每个季节都通过光线角度、植被和气候特征产生独特的色彩参考。设计师在整个行业中遵循这些季节节奏——从时装周日程到零售营销日历。"
                : "Each season produces a distinct color reference through angle of light, vegetation, and atmospheric conditions. Designers follow these seasonal rhythms across industries — from fashion week schedules to retail marketing calendars."}
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              {locale === "zh" ? "如何使用季节性调色板" : "How to Use Seasonal Palettes"}
            </h3>
            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {locale === "zh"
                ? "季节性调色板提供视觉连贯性——读者立即感知季节并相应地调整期望。对于当季产品和活动，这种对齐是免费的情感共鸣。反季节调色板则可成为强大的品牌对比工具。"
                : "Seasonal palettes deliver visual coherence — readers immediately perceive the season and adjust expectations accordingly. For seasonal products and campaigns, this alignment is free emotional resonance. Contra-seasonal palettes, conversely, can be a powerful brand differentiation tool."}
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              {locale === "zh" ? "季节性色彩与品牌" : "Seasonal Color and Branding"}
            </h3>
            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {locale === "zh"
                ? "全年运营的品牌通常维持一个主调色板，同时在促销材料中采用季节性强调色。这保持了品牌可识别性，同时使内容感觉当下且相关。"
                : "Brands operating year-round typically maintain a primary palette while adopting seasonal accent colors in promotional material. This maintains brand recognizability while making content feel timely and relevant."}
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              {locale === "zh" ? "文化季节差异" : "Cultural Seasonal Variation"}
            </h3>
            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {locale === "zh"
                ? "季节性色彩关联因地理位置和文化而异。北半球的春季调色板与澳大利亚的春季调色板有所不同。全球品牌在应用季节性色彩时应考虑这些区域差异。"
                : "Seasonal color associations vary by geography and culture. The spring palette in the Northern Hemisphere differs from spring in Australia. Global brands should consider these regional variations when applying seasonal color."}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
