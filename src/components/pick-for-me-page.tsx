"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import type { ColorRecord } from "@/src/types/color";
import type { ColorCollection } from "@/src/lib/collections";
import { colors } from "@/src/data/colors";
import { useLocale } from "@/src/components/locale-provider";
import { track } from "@/src/lib/track";
import { writeClipboard } from "@/src/lib/clipboard";
import {
  matchCollections,
  matchScenarioToFragments,
  pickColorsFromFragments,
  QUICK_PROMPTS_EN,
  QUICK_PROMPTS_ZH,
} from "@/src/lib/pick-for-me";

/**
 * Analytics only. Two literals — "cjk" | "latin" — never the query text, so the
 * dimension stays groupable. No `g` flag: `.test` must not carry `lastIndex`.
 */
const CJK_RE = /[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af]/;

function langOf(q: string): "cjk" | "latin" {
  return CJK_RE.test(q) ? "cjk" : "latin";
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

const TEXT = {
  en: {
    badge: "Color Picker",
    title: "Can't decide on a color?",
    subtitle: "Describe what you're designing and get instant palette suggestions from 5,446 curated colors.",
    placeholder: "e.g., coffee shop brand, tech startup, wedding invitation...",
    tryThese: "Try these",
    yourPalette: "Your custom palette",
    matchedCollections: "Curated collections for you",
    noResults: "Try describing your project — like 'yoga studio', 'tech dashboard', or 'luxury brand'.",
    viewCollection: "View collection",
    copyHex: "Copied!",
    startOver: "Clear",
    viewAll: "Browse all 5,446 colors",
    exploreCollections: "Explore all collections",
  },
  zh: {
    badge: "选色助手",
    title: "不知道该用什么颜色？",
    subtitle: "描述你正在设计的东西，从 5,446 精选颜色中获取即时配色建议。",
    placeholder: "例如：咖啡店品牌、科技创业公司、婚礼请柬...",
    tryThese: "试试这些",
    yourPalette: "为你定制的配色",
    matchedCollections: "为你推荐的精选集合",
    noResults: "试着描述你的项目 — 比如「瑜伽工作室」「科技仪表盘」「高端品牌」。",
    viewCollection: "查看集合",
    copyHex: "已复制！",
    startOver: "清除",
    viewAll: "浏览全部 5,446 颜色",
    exploreCollections: "探索所有集合",
  },
};

function CopyableColor({ color }: { color: ColorRecord }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const result = await writeClipboard(color.hex);
    if (!result.ok) {
      track("color_copy_failed", {
        format: "pick-swatch",
        variant: "compact",
        reason: result.reason,
      });
      return;
    }
    track("color_copied", { format: "pick-swatch", variant: "compact" });
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
      const q = input.trim();
      track("tool_action", {
        tool: "pick-for-me",
        action: "go",
        source: "input",
        lang: langOf(q),
      });
      setQuery(q);
    },
    [input],
  );

  const handleQuickPrompt = useCallback((prompt: string) => {
    track("tool_action", {
      tool: "pick-for-me",
      action: "go",
      source: "chip",
      lang: langOf(prompt),
    });
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
                className="rounded-xl border border-black/8 bg-white px-4 py-3 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 dark:bg-white/10 dark:hover:bg-white/18 dark:text-neutral-300 dark:border-white/10"
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
                    className="rounded-full border border-black/6 bg-white/80 px-3.5 py-1.5 text-sm text-neutral-600 transition hover:border-black/12 hover:bg-neutral-50 hover:text-neutral-900 dark:bg-white/5 dark:border-white/10 dark:hover:border-white/30 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
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
                className="rounded-full border border-black/8 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:bg-white/10 dark:hover:bg-white/18 dark:text-neutral-300 dark:border-white/10"
              >
                {t.viewAll}
              </Link>
              <Link
                href="/collections/"
                className="rounded-full border border-black/8 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:bg-white/10 dark:hover:bg-white/18 dark:text-neutral-300 dark:border-white/10"
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
