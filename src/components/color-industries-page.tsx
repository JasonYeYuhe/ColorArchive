"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CopyButton } from "@/src/components/copy-button";
import { useLocale } from "@/src/components/locale-provider";
import {
  colorIndustries,
  SIGNAL_LABELS,
  SIGNAL_LABELS_ZH,
  type ColorIndustry,
  type IndustrySignal,
} from "@/src/lib/color-industries";

function IndustryCard({
  industry,
  locale,
}: {
  industry: ColorIndustry;
  locale: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const signalLabel =
    locale === "zh"
      ? SIGNAL_LABELS_ZH[industry.signal as IndustrySignal]
      : SIGNAL_LABELS[industry.signal as IndustrySignal];

  const name = locale === "zh" ? industry.nameZh : industry.name;
  const tagline = locale === "zh" ? industry.taglineZh : industry.tagline;
  const description = locale === "zh" ? industry.descriptionZh : industry.description;
  const context = locale === "zh" ? industry.contextZh : industry.context;
  const designTips = locale === "zh" ? industry.designTipsZh : industry.designTips;
  const keyBrands = locale === "zh" ? industry.keyBrandsZh : industry.keyBrands;
  const avoidColors = locale === "zh" ? industry.avoidColorsZh : industry.avoidColors;

  const loadInPalette = () => {
    const hexes = industry.colors
      .map((c) => c.hex.replace("#", "").toLowerCase());
    const url = `/palette/?colors=${hexes.join(",")}`;
    window.open(url, "_blank");
  };

  return (
    <article className="group flex flex-col rounded-2xl border border-black/8 bg-white transition hover:border-black/12 hover:shadow-md dark:border-white/8 dark:bg-neutral-900 dark:hover:border-white/12">
      {/* Swatch strip */}
      <div className="flex h-20 overflow-hidden rounded-t-2xl">
        {industry.colors.map((color, i) => (
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
                {signalLabel}
              </span>
            </div>
            <p className="mt-1.5 text-sm font-medium italic text-neutral-700 dark:text-neutral-300">
              &ldquo;{tagline}&rdquo;
            </p>
          </div>
          <button
            type="button"
            onClick={loadInPalette}
            className="shrink-0 rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            title="Open palette in Palette Builder"
          >
            {locale === "zh" ? "打开 →" : "Open →"}
          </button>
        </div>

        {/* Description */}
        <p className="mb-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          {description}
        </p>

        {/* Color swatches with names */}
        <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {industry.colors.map((color) => (
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
                <CopyButton value={color.hex} label={color.hex.toUpperCase()} variant="compact" />
              </div>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {industry.tags.map((tag) => (
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
          {expanded
            ? locale === "zh" ? "↑ 收起详情" : "↑ Less detail"
            : locale === "zh" ? "↓ 展开详情" : "↓ More detail"}
        </button>

        {expanded && (
          <div className="mt-1 space-y-4 border-t border-neutral-100 pt-4 dark:border-neutral-800">
            {/* Industry context */}
            <div>
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                {locale === "zh" ? "行业背景" : "Industry Context"}
              </h4>
              <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {context}
              </p>
            </div>

            {/* Design tips */}
            <div>
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                {locale === "zh" ? "设计提示" : "Design Tips"}
              </h4>
              <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {designTips}
              </p>
            </div>

            {/* Two columns: key brands + avoid colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  {locale === "zh" ? "代表品牌" : "Key Brands"}
                </h4>
                <ul className="space-y-1">
                  {keyBrands.map((brand) => (
                    <li
                      key={brand}
                      className="text-xs text-neutral-600 dark:text-neutral-400"
                    >
                      · {brand}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  {locale === "zh" ? "避免色彩" : "Avoid"}
                </h4>
                <ul className="space-y-1">
                  {avoidColors.map((avoid) => (
                    <li
                      key={avoid}
                      className="text-xs text-neutral-600 dark:text-neutral-400"
                    >
                      · {avoid}
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

export function ColorIndustriesPage() {
  const { locale } = useLocale();

  const heading = locale === "zh" ? "行业色彩指南" : "Color by Industry";
  const subheading =
    locale === "zh"
      ? "9个主要设计行业的色彩调色板：品牌心理学、行业规范与设计指导"
      : "Color palettes across 9 major design industries — brand psychology, industry conventions, and design guidance";

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-10 max-w-2xl">
        <h1 className="mb-3 font-display text-3xl font-light tracking-tight text-neutral-900 sm:text-4xl dark:text-neutral-100">
          {heading}
        </h1>
        <p className="text-base leading-relaxed text-neutral-500 dark:text-neutral-400">
          {subheading}
        </p>
        <div className="mt-4 flex gap-3 text-sm text-neutral-500 dark:text-neutral-400">
          <span>{locale === "zh" ? "9个行业" : "9 industries"}</span>
          <span>·</span>
          <span>{locale === "zh" ? "54种标志色" : "54 signature colors"}</span>
          <span>·</span>
          <span>{locale === "zh" ? "即时复制色值" : "Copy hex codes instantly"}</span>
        </div>
      </div>

      {/* Industry gradient strip */}
      <div
        className="mb-10 h-3 rounded-full"
        style={{
          background:
            "linear-gradient(to right, #0F2A4A, #2563EB, #C0392B, #E67E22, #0D7377, #1A1A1A, #C9A96E, #2D5016, #9B4F6C, #C17B4A)",
        }}
        aria-hidden="true"
      />

      {/* Industry cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {colorIndustries.map((industry) => (
          <IndustryCard key={industry.id} industry={industry} locale={locale} />
        ))}
      </div>

      {/* Bottom CTA section */}
      <div className="mt-12 rounded-2xl border border-black/8 bg-neutral-50 p-8 text-center dark:border-white/8 dark:bg-neutral-900">
        <h2 className="mb-2 text-xl font-bold text-neutral-900 dark:text-neutral-100">
          {locale === "zh" ? "探索更多色彩" : "Explore More Colors"}
        </h2>
        <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
          {locale === "zh"
            ? "浏览完整色彩档案，或探索季节性与年代调色板"
            : "Browse the full color archive or explore seasonal and decade palettes"}
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
            className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:border-neutral-500 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            {locale === "zh" ? "精选系列" : "Curated Collections"}
          </Link>
          <Link
            href="/seasonal/"
            className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:border-neutral-500 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            {locale === "zh" ? "四季色彩" : "Color by Season"}
          </Link>
          <Link
            href="/decades/"
            className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:border-neutral-500 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            {locale === "zh" ? "年代色彩" : "Color by Decade"}
          </Link>
        </div>
      </div>

      {/* SEO content */}
      <section className="mt-12 space-y-6 rounded-2xl border border-black/8 bg-white p-8 dark:border-white/8 dark:bg-neutral-900">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
          {locale === "zh"
            ? "关于行业色彩心理学"
            : "About Industry Color Psychology"}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              {locale === "zh" ? "为什么行业拥有色彩语法" : "Why Industries Develop Color Grammars"}
            </h3>
            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {locale === "zh"
                ? "行业色彩语法通过数十年的品牌积累和消费者条件反射逐渐形成。当医疗保健使用蓝绿色足够长时间后，消费者就会将蓝绿色与医疗信赖联系起来——这使得整个行业都采用这种语法以符合期望，从而形成自我强化的循环。"
                : "Industry color grammars develop through decades of brand accumulation and consumer conditioning. When healthcare uses teal long enough, consumers associate teal with medical trust — which causes the whole industry to adopt the grammar to meet expectations, creating a self-reinforcing cycle."}
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              {locale === "zh" ? "打破与顺应行业规范" : "Breaking vs. Following Industry Conventions"}
            </h3>
            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {locale === "zh"
                ? "顺应行业色彩规范降低了认知摩擦——用户立即理解产品所处类别。打破规范可以创造强大的差异化（Robinhood的绿色在金融中表现突出），但需要大量营销投入来建立正确的联系。"
                : "Following industry color conventions reduces cognitive friction — users immediately understand the product's category. Breaking conventions can create powerful differentiation (Robinhood's green stood out in finance), but requires significant marketing investment to establish correct associations."}
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              {locale === "zh" ? "色彩如何影响转化率" : "How Color Affects Conversion"}
            </h3>
            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {locale === "zh"
                ? "行业色彩研究表明，色彩与受众期望的一致性直接影响转化率。医疗应用使用红色背景会降低信任感，快餐品牌使用蓝色会降低食欲刺激——这两种情况都会降低转化率，尽管用户无法明确说明原因。"
                : "Industry color research shows that alignment between color and audience expectations directly impacts conversion. A healthcare app with red backgrounds reduces trust; a fast food brand with blue reduces appetite stimulation — both lower conversion, even though users can't articulate why."}
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              {locale === "zh" ? "色彩随行业演进" : "How Industry Colors Evolve"}
            </h3>
            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {locale === "zh"
                ? "行业色彩并非静止。科技行业从科幻蓝移向更深、更饱和的AI紫和午夜海军蓝。餐饮行业在全球化和可持续性趋势下，从快餐红橙移向更丰富的工艺棕。这些演变通常追随更广泛的文化转变。"
                : "Industry colors are not static. Tech has moved from sci-fi blue toward deeper, more saturated AI-purple and midnight navy. Food has shifted from fast-food red-orange toward richer craft browns as globalization and sustainability trends mature. These evolutions typically follow broader cultural shifts."}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
