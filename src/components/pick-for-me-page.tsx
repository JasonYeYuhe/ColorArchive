"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import type { ColorRecord } from "@/src/types/color";
import type { ColorCollection } from "@/src/lib/collections";
import { colors } from "@/src/data/colors";
import { useLocale } from "@/src/components/locale-provider";

/* ------------------------------------------------------------------ */
/*  Scenario → Palette matching engine                                */
/* ------------------------------------------------------------------ */

interface ScenarioKeywords {
  [key: string]: string[];
}

const SCENARIO_KEYWORDS: ScenarioKeywords = {
  // Industries
  tech: ["cobalt", "azure", "violet", "ink", "vivid", "steel"],
  startup: ["cobalt", "violet", "azure", "vivid", "mint"],
  saas: ["cobalt", "azure", "violet", "ink", "vivid"],
  app: ["cobalt", "azure", "violet", "mint", "vivid"],
  software: ["cobalt", "azure", "sapphire", "steel", "ink"],
  fintech: ["cobalt", "sapphire", "ink", "amber", "steel"],
  healthcare: ["teal", "azure", "mint", "emerald", "sage"],
  medical: ["teal", "azure", "cerulean", "mint", "sage"],
  wellness: ["sage", "mint", "jade", "celadon", "soft"],
  yoga: ["sage", "jade", "celadon", "blush", "soft"],
  food: ["coral", "amber", "ember", "honey", "saffron"],
  restaurant: ["coral", "amber", "ember", "merlot", "saffron"],
  cafe: ["amber", "honey", "saffron", "ember", "muted"],
  coffee: ["ember", "amber", "honey", "saffron", "muted"],
  bakery: ["blush", "peony", "amber", "honey", "soft"],
  fashion: ["ink", "pearl", "garnet", "merlot", "blush"],
  luxury: ["merlot", "pearl", "garnet", "ink", "soft"],
  beauty: ["blush", "peony", "rose", "mauve", "pearl"],
  cosmetics: ["blush", "peony", "rose", "fuchsia", "pearl"],
  education: ["cobalt", "azure", "mint", "amber", "vivid"],
  finance: ["sapphire", "cobalt", "ink", "amber", "steel"],
  bank: ["sapphire", "cobalt", "ink", "steel", "muted"],
  real: ["amber", "honey", "olive", "ink", "pearl"],
  estate: ["amber", "honey", "olive", "ink", "pearl"],
  architecture: ["ink", "pearl", "olive", "amber", "muted"],
  interior: ["amber", "olive", "pearl", "blush", "sage"],
  gaming: ["violet", "cobalt", "vivid", "fuchsia", "ink"],
  music: ["violet", "orchid", "cobalt", "vivid", "ink"],
  fitness: ["lime", "vivid", "cobalt", "coral", "bright"],
  sport: ["crimson", "cobalt", "vivid", "lime", "bright"],

  // Scenarios
  website: ["cobalt", "azure", "pearl", "ink", "vivid"],
  landing: ["cobalt", "vivid", "pearl", "coral", "ink"],
  brand: ["ink", "pearl", "vivid", "cobalt", "amber"],
  logo: ["ink", "vivid", "cobalt", "crimson", "amber"],
  dashboard: ["cobalt", "azure", "ink", "steel", "mint"],
  portfolio: ["ink", "pearl", "muted", "cobalt", "soft"],
  blog: ["pearl", "ink", "azure", "blush", "muted"],
  wedding: ["blush", "pearl", "peony", "rose", "ivory"],
  invitation: ["blush", "pearl", "peony", "ink", "amber"],
  birthday: ["coral", "vivid", "amber", "mint", "fuchsia"],
  baby: ["blush", "mint", "pearl", "azure", "whisper"],
  nursery: ["blush", "mint", "pearl", "peony", "whisper"],
  poster: ["vivid", "ink", "crimson", "cobalt", "amber"],
  packaging: ["pearl", "ink", "vivid", "amber", "soft"],
  presentation: ["cobalt", "pearl", "ink", "amber", "vivid"],

  // Moods
  calm: ["cerulean", "aqua", "mist", "sage", "soft"],
  peaceful: ["sage", "celadon", "mist", "pearl", "soft"],
  energetic: ["vivid", "coral", "amber", "citrine", "lime"],
  bold: ["vivid", "crimson", "cobalt", "ink", "bright"],
  playful: ["coral", "mint", "vivid", "citrine", "fuchsia"],
  elegant: ["pearl", "ink", "merlot", "garnet", "muted"],
  modern: ["cobalt", "ink", "steel", "vivid", "pearl"],
  vintage: ["muted", "amber", "soft", "ember", "garnet"],
  retro: ["muted", "amber", "ember", "garnet", "soft"],
  minimal: ["pearl", "mist", "whisper", "ink", "muted"],
  warm: ["amber", "coral", "ember", "honey", "saffron"],
  cool: ["azure", "sapphire", "cobalt", "steel", "teal"],
  dark: ["ink", "shadow", "nocturne", "velvet", "cobalt"],
  professional: ["cobalt", "ink", "steel", "pearl", "muted"],
  creative: ["violet", "orchid", "coral", "vivid", "mint"],
  friendly: ["coral", "mint", "amber", "azure", "bloom"],
  premium: ["ink", "pearl", "merlot", "garnet", "muted"],
  organic: ["sage", "olive", "leaf", "amber", "celadon"],
  natural: ["moss", "amber", "leaf", "olive", "sage"],
  cozy: ["amber", "honey", "ember", "blush", "soft"],
  dreamy: ["blush", "peony", "mauve", "violet", "whisper"],
  futuristic: ["violet", "cobalt", "cyan", "vivid", "ink"],
  rustic: ["ember", "amber", "olive", "muted", "garnet"],
  clean: ["pearl", "whisper", "azure", "mist", "cobalt"],

  // Chinese keywords
  科技: ["cobalt", "azure", "violet", "ink", "vivid"],
  餐厅: ["coral", "amber", "ember", "merlot", "saffron"],
  咖啡: ["ember", "amber", "honey", "saffron", "muted"],
  婚礼: ["blush", "pearl", "peony", "rose", "amber"],
  品牌: ["ink", "pearl", "vivid", "cobalt", "amber"],
  网站: ["cobalt", "azure", "pearl", "ink", "vivid"],
  简约: ["pearl", "mist", "whisper", "ink", "muted"],
  温暖: ["amber", "coral", "ember", "honey", "saffron"],
  优雅: ["pearl", "ink", "merlot", "garnet", "muted"],
  活泼: ["coral", "mint", "vivid", "citrine", "fuchsia"],
  平静: ["cerulean", "aqua", "sage", "celadon", "soft"],
  高端: ["ink", "pearl", "merlot", "garnet", "muted"],
  自然: ["moss", "amber", "leaf", "olive", "sage"],
  时尚: ["ink", "pearl", "garnet", "blush", "vivid"],
  医疗: ["teal", "azure", "mint", "emerald", "sage"],
  金融: ["sapphire", "cobalt", "ink", "amber", "steel"],
  教育: ["cobalt", "azure", "mint", "amber", "vivid"],
  美妆: ["blush", "peony", "rose", "mauve", "pearl"],
  游戏: ["violet", "cobalt", "vivid", "fuchsia", "ink"],
  瑜伽: ["sage", "jade", "celadon", "blush", "soft"],
  健身: ["lime", "vivid", "cobalt", "coral", "bright"],
};

const QUICK_PROMPTS_EN = [
  "Coffee shop brand",
  "Tech startup dashboard",
  "Yoga studio website",
  "Wedding invitation",
  "Fashion e-commerce",
  "Healthcare app",
  "Kids birthday party",
  "Luxury real estate",
  "Organic skincare",
  "Gaming studio",
  "Cozy blog",
  "Finance dashboard",
];

const QUICK_PROMPTS_ZH = [
  "咖啡店品牌",
  "科技创业公司",
  "瑜伽工作室网站",
  "婚礼请柬",
  "时尚电商",
  "医疗健康 App",
  "儿童生日派对",
  "高端房地产",
  "天然护肤品牌",
  "游戏工作室",
  "温馨博客",
  "金融仪表盘",
];

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

function matchScenarioToFragments(input: string): string[] {
  const tokens = tokenize(input);
  const fragmentScores = new Map<string, number>();

  for (const token of tokens) {
    const frags = SCENARIO_KEYWORDS[token];
    if (frags) {
      for (let i = 0; i < frags.length; i++) {
        const weight = frags.length - i; // first fragment gets highest score
        fragmentScores.set(frags[i], (fragmentScores.get(frags[i]) || 0) + weight);
      }
    }
  }

  return [...fragmentScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([frag]) => frag);
}

function matchCollections(input: string, collections: ColorCollection[]): ColorCollection[] {
  const tokens = tokenize(input);
  if (tokens.length === 0) return [];

  const scored = collections.map((col) => {
    let score = 0;
    const searchable = [
      ...col.tags,
      ...col.promptWords,
      ...col.useCases,
      col.title,
      col.summary,
    ]
      .join(" ")
      .toLowerCase();

    for (const token of tokens) {
      if (searchable.includes(token)) score += 3;
      // partial match
      if (token.length >= 3) {
        const words = searchable.split(/\s+/);
        for (const word of words) {
          if (word.startsWith(token) || token.startsWith(word)) score += 1;
        }
      }
    }
    return { col, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.col);
}

function pickColorsFromFragments(fragments: string[], colors: ColorRecord[]): ColorRecord[] {
  if (fragments.length === 0) return [];

  const scored = colors.map((c) => {
    const nameLower = c.name.toLowerCase();
    let score = 0;
    for (let i = 0; i < fragments.length; i++) {
      if (nameLower.includes(fragments[i])) {
        score += fragments.length - i;
      }
    }
    return { color: c, score };
  });

  // Get top scoring colors, then pick diverse ones
  const top = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 100);

  // Pick 6 diverse colors (different hue families, varied lightness)
  const picked: ColorRecord[] = [];
  const usedFamilies = new Set<string>();

  // First pass: one per family
  for (const { color } of top) {
    if (picked.length >= 6) break;
    if (!usedFamilies.has(color.family)) {
      picked.push(color);
      usedFamilies.add(color.family);
    }
  }

  // Fill remaining from top scores
  for (const { color } of top) {
    if (picked.length >= 6) break;
    if (!picked.includes(color)) {
      picked.push(color);
    }
  }

  return picked;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

const TEXT = {
  en: {
    badge: "Color Picker",
    title: "Can't decide on a color?",
    subtitle: "Describe what you're designing and get instant palette suggestions from 5,000+ curated colors.",
    placeholder: "e.g., coffee shop brand, tech startup, wedding invitation...",
    tryThese: "Try these",
    yourPalette: "Your custom palette",
    matchedCollections: "Curated collections for you",
    noResults: "Try describing your project — like 'yoga studio', 'tech dashboard', or 'luxury brand'.",
    viewCollection: "View collection",
    copyHex: "Copied!",
    startOver: "Clear",
    viewAll: "Browse all 5,000+ colors",
    exploreCollections: "Explore all collections",
  },
  zh: {
    badge: "选色助手",
    title: "不知道该用什么颜色？",
    subtitle: "描述你正在设计的东西，从 5,000+ 精选颜色中获取即时配色建议。",
    placeholder: "例如：咖啡店品牌、科技创业公司、婚礼请柬...",
    tryThese: "试试这些",
    yourPalette: "为你定制的配色",
    matchedCollections: "为你推荐的精选集合",
    noResults: "试着描述你的项目 — 比如「瑜伽工作室」「科技仪表盘」「高端品牌」。",
    viewCollection: "查看集合",
    copyHex: "已复制！",
    startOver: "清除",
    viewAll: "浏览全部 5,000+ 颜色",
    exploreCollections: "探索所有集合",
  },
};

function CopyableColor({ color }: { color: ColorRecord }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }, [color.hex]);

  return (
    <button
      onClick={handleCopy}
      className="group flex flex-col items-center gap-2 transition"
      title={`Copy ${color.hex}`}
    >
      <div
        className="h-20 w-20 rounded-2xl shadow-md ring-1 ring-black/5 transition group-hover:scale-105 sm:h-24 sm:w-24"
        style={{ backgroundColor: color.hex }}
      />
      <span className="text-[11px] font-medium text-neutral-500 transition group-hover:text-neutral-900 dark:group-hover:text-white">
        {copied ? "✓" : color.hex}
      </span>
      <span className="max-w-[96px] truncate text-[10px] text-neutral-400">
        {color.name}
      </span>
    </button>
  );
}

export function PickForMePage({ collections }: { collections: ColorCollection[] }) {
  const { locale } = useLocale();
  const t = TEXT[locale] || TEXT.en;
  const quickPrompts = locale === "zh" ? QUICK_PROMPTS_ZH : QUICK_PROMPTS_EN;

  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      setQuery(input.trim());
    },
    [input],
  );

  const handleQuickPrompt = useCallback((prompt: string) => {
    setInput(prompt);
    setQuery(prompt);
  }, []);

  const handleClear = useCallback(() => {
    setInput("");
    setQuery("");
  }, []);

  const results = useMemo(() => {
    if (!query) return null;
    const fragments = matchScenarioToFragments(query);
    const pickedColors = pickColorsFromFragments(fragments, colors);
    const matchedCols = matchCollections(query, collections);
    return { pickedColors, matchedCols, fragments };
  }, [query, colors, collections]);

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        {/* Hero */}
        <section className="rounded-[2rem] border border-black/6 bg-white/80 px-6 py-12 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-10 sm:py-16 dark:bg-neutral-900 dark:border-white/10">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/90 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-neutral-500 dark:bg-white/10 dark:border-white/10">
            <span className="inline-block h-2 w-2 rounded-full bg-neutral-400" />
            {t.badge}
          </div>
          <h1 className="font-display mt-4 text-4xl font-light tracking-[-0.04em] text-neutral-950 sm:text-5xl dark:text-white">
            {t.title}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-neutral-600 dark:text-neutral-400">
            {t.subtitle}
          </p>

          {/* Input */}
          <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-lg gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.placeholder}
              className="flex-1 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:bg-neutral-800 dark:border-white/10 dark:text-white dark:placeholder:text-neutral-500"
              // eslint-disable-next-line jsx-a11y/no-autofocus -- primary input on a dedicated tool page; expected behavior
              autoFocus
            />
            <button
              type="submit"
              className="rounded-xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
            >
              Go
            </button>
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="rounded-xl border border-black/8 bg-white px-4 py-3 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 dark:bg-white/10 dark:text-neutral-300 dark:border-white/10"
              >
                {t.startOver}
              </button>
            )}
          </form>

          {/* Quick prompts */}
          {!query && (
            <div className="mx-auto mt-6 max-w-2xl">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-400">
                {t.tryThese}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="rounded-full border border-black/6 bg-white/80 px-3.5 py-1.5 text-sm text-neutral-600 transition hover:border-black/12 hover:bg-neutral-50 hover:text-neutral-900 dark:bg-white/5 dark:border-white/10 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Results */}
        {query && results && (
          <>
            {/* Custom palette */}
            {results.pickedColors.length > 0 && (
              <section className="rounded-[2rem] border border-black/6 bg-white/80 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-10 dark:bg-neutral-900 dark:border-white/10">
                <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">
                  {t.yourPalette}
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  &ldquo;{query}&rdquo;
                </p>

                {/* Palette strip */}
                <div className="mt-6 flex h-16 overflow-hidden rounded-2xl shadow-md ring-1 ring-black/5 sm:h-20">
                  {results.pickedColors.map((c) => (
                    <div
                      key={c.id}
                      className="flex-1"
                      style={{ backgroundColor: c.hex }}
                      title={`${c.name} — ${c.hex}`}
                    />
                  ))}
                </div>

                {/* Individual colors */}
                <div className="mt-6 flex flex-wrap justify-center gap-4 sm:gap-6">
                  {results.pickedColors.map((c) => (
                    <CopyableColor key={c.id} color={c} />
                  ))}
                </div>
              </section>
            )}

            {/* Matched collections */}
            {results.matchedCols.length > 0 && (
              <section className="rounded-[2rem] border border-black/6 bg-white/80 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-10 dark:bg-neutral-900 dark:border-white/10">
                <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">
                  {t.matchedCollections}
                </h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  {results.matchedCols.map((col) => (
                    <Link
                      key={col.id}
                      href={`/collections/${col.id}/`}
                      className="group rounded-2xl border border-black/6 bg-white p-4 transition hover:shadow-lg dark:bg-neutral-800 dark:border-white/10"
                    >
                      {/* Mini palette */}
                      <div className="flex h-10 overflow-hidden rounded-xl ring-1 ring-black/5">
                        {col.palette.slice(0, 5).map((c) => (
                          <div
                            key={c.id}
                            className="flex-1"
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                      </div>
                      <h3 className="mt-3 text-sm font-semibold text-neutral-900 group-hover:text-neutral-600 dark:text-white dark:group-hover:text-neutral-300">
                        {col.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-500">
                        {col.summary}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {col.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500 dark:bg-white/10"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* No results */}
            {results.pickedColors.length === 0 && results.matchedCols.length === 0 && (
              <section className="rounded-[2rem] border border-black/6 bg-white/80 px-6 py-12 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:bg-neutral-900 dark:border-white/10">
                <p className="text-neutral-500">{t.noResults}</p>
              </section>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/all-colors/"
                className="rounded-full border border-black/8 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:bg-white/10 dark:text-neutral-300 dark:border-white/10"
              >
                {t.viewAll}
              </Link>
              <Link
                href="/collections/"
                className="rounded-full border border-black/8 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:bg-white/10 dark:text-neutral-300 dark:border-white/10"
              >
                {t.exploreCollections}
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
