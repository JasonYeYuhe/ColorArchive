"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/src/components/locale-provider";

interface Question {
  id: string;
  text: { en: string; ja: string };
  options: { label: { en: string; ja: string }; scores: Record<string, number> }[];
}

const QUESTIONS: Question[] = [
  {
    id: "role",
    text: {
      en: "What best describes your role?",
      ja: "あなたの役割は？",
    },
    options: [
      { label: { en: "Designer / Art Director", ja: "デザイナー / アートディレクター" }, scores: { "brand-starter-kit": 2, "complete-archive": 1 } },
      { label: { en: "Developer / Engineer", ja: "開発者 / エンジニア" }, scores: { "complete-archive": 2, "dark-mode-ui-kit": 1 } },
      { label: { en: "Content Creator / Marketer", ja: "コンテンツクリエイター / マーケター" }, scores: { "content-creator-bundle": 2, "palette-pack-vol-1": 1 } },
      { label: { en: "Founder / Solo Builder", ja: "起業家 / ソロビルダー" }, scores: { "brand-starter-kit": 2, "palette-pack-vol-1": 1 } },
    ],
  },
  {
    id: "goal",
    text: {
      en: "What's your primary goal?",
      ja: "主な目的は？",
    },
    options: [
      { label: { en: "Build a brand identity system", ja: "ブランドアイデンティティの構築" }, scores: { "brand-starter-kit": 3 } },
      { label: { en: "Ship a dark/light mode UI", ja: "ダーク/ライトモード UI の実装" }, scores: { "dark-mode-ui-kit": 3 } },
      { label: { en: "Create social content & visuals", ja: "ソーシャルコンテンツ制作" }, scores: { "content-creator-bundle": 3 } },
      { label: { en: "Integrate colors into a design system", ja: "デザインシステムに色を統合" }, scores: { "complete-archive": 3 } },
    ],
  },
  {
    id: "scope",
    text: {
      en: "How many colors do you need?",
      ja: "必要な色の数は？",
    },
    options: [
      { label: { en: "A small, curated palette (5-20 colors)", ja: "少数の厳選パレット（5-20色）" }, scores: { "palette-pack-vol-1": 2, "seasonal-spring-2026": 1 } },
      { label: { en: "A structured brand set (20-50 colors)", ja: "構造化されたブランドセット（20-50色）" }, scores: { "brand-starter-kit": 2, "content-creator-bundle": 1 } },
      { label: { en: "Everything — the full 2016-color archive", ja: "全部 — 2016色の完全アーカイブ" }, scores: { "complete-archive": 3, "all-access-bundle": 2 } },
    ],
  },
  {
    id: "format",
    text: {
      en: "Which export format matters most?",
      ja: "最も重要なエクスポート形式は？",
    },
    options: [
      { label: { en: "CSS / Tailwind tokens", ja: "CSS / Tailwind トークン" }, scores: { "palette-pack-vol-1": 1, "complete-archive": 1 } },
      { label: { en: "Figma / Style Dictionary / Design tools", ja: "Figma / Style Dictionary / デザインツール" }, scores: { "complete-archive": 2 } },
      { label: { en: "iOS / Android / Flutter (mobile)", ja: "iOS / Android / Flutter（モバイル）" }, scores: { "complete-archive": 2, "brand-starter-kit": 1 } },
      { label: { en: "Visual assets (SVG boards, wallpapers)", ja: "ビジュアル素材（SVGボード、壁紙）" }, scores: { "content-creator-bundle": 2, "palette-pack-vol-1": 1 } },
    ],
  },
  {
    id: "budget",
    text: {
      en: "What's your budget preference?",
      ja: "ご予算は？",
    },
    options: [
      { label: { en: "As low as possible", ja: "できるだけ安く" }, scores: { "palette-pack-vol-1": 2, "seasonal-spring-2026": 2 } },
      { label: { en: "Mid-range for the right value", ja: "適正な価値に見合った中価格帯" }, scores: { "brand-starter-kit": 1, "dark-mode-ui-kit": 1, "content-creator-bundle": 1 } },
      { label: { en: "I want the best deal overall", ja: "全体的に最もお得なもの" }, scores: { "all-access-bundle": 3 } },
    ],
  },
];

const PACK_META: Record<string, { title: string; desc: { en: string; ja: string }; href: string; accent: string }> = {
  "palette-pack-vol-1": { title: "Palette Pack Vol. 1", desc: { en: "A curated starter set with SVG boards, gradient wallpapers, and multi-platform tokens.", ja: "SVGボード、グラデーション壁紙、マルチプラットフォームトークンを含むスターターセット。" }, href: "/packs/palette-pack-vol-1/", accent: "bg-amber-50 border-amber-200/60" },
  "brand-starter-kit": { title: "Brand Color Starter Kit", desc: { en: "Structured brand palettes with usage guides, psychology notes, and mobile tokens.", ja: "使用ガイド、心理学ノート、モバイルトークンを含む構造化されたブランドパレット。" }, href: "/packs/brand-starter-kit/", accent: "bg-rose-50 border-rose-200/60" },
  "content-creator-bundle": { title: "Creator Bundle", desc: { en: "Visual assets, AI prompts, and shareable palette boards for content creators.", ja: "コンテンツクリエイター向けのビジュアル素材、AIプロンプト、共有可能なパレットボード。" }, href: "/packs/content-creator-bundle/", accent: "bg-violet-50 border-violet-200/60" },
  "complete-archive": { title: "Complete Archive Token Set", desc: { en: "All 2016 colors in 16+ formats including SwiftUI, Android, Flutter, and WCAG reports.", ja: "SwiftUI、Android、Flutter、WCAGレポートを含む16以上の形式で全2016色。" }, href: "/packs/complete-archive/", accent: "bg-sky-50 border-sky-200/60" },
  "dark-mode-ui-kit": { title: "Dark Mode UI Kit", desc: { en: "Paired light/dark tokens with WCAG contrast matrices and AA/AAA compliance reports.", ja: "WCAGコントラストマトリックスとAA/AAAコンプライアンスレポートを含む明暗ペアトークン。" }, href: "/packs/dark-mode-ui-kit/", accent: "bg-neutral-100 border-neutral-300/60" },
  "seasonal-spring-2026": { title: "Seasonal: Spring 2026", desc: { en: "Limited spring palettes with mood board notes — lightest entry point.", ja: "ムードボードノート付きの限定スプリングパレット。" }, href: "/packs/seasonal-spring-2026/", accent: "bg-emerald-50 border-emerald-200/60" },
  "all-access-bundle": { title: "All Access Bundle", desc: { en: "Every pack combined at 32% off — the simplest way to get everything.", ja: "全パックを32%割引で — 全てを手に入れる最もシンプルな方法。" }, href: "/packs/all-access-bundle/", accent: "bg-emerald-50 border-emerald-300/40" },
};

export function PackQuizPage() {
  const { locale } = useLocale();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});

  const isFinished = current >= QUESTIONS.length;

  function selectOption(optionIndex: number) {
    const question = QUESTIONS[current];
    const option = question.options[optionIndex];
    const newScores = { ...scores };
    for (const [packId, score] of Object.entries(option.scores)) {
      newScores[packId] = (newScores[packId] || 0) + score;
    }
    setScores(newScores);
    setAnswers([...answers, optionIndex]);
    setCurrent(current + 1);
  }

  function restart() {
    setCurrent(0);
    setAnswers([]);
    setScores({});
  }

  const ranked = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([id, score]) => ({ id, score, ...(PACK_META[id] || { title: id, desc: { en: "", ja: "" }, href: `/packs/${id}/`, accent: "bg-white border-black/6" }) }));

  const question = QUESTIONS[current];

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute left-0 top-8 h-52 w-52 rounded-full bg-violet-200/28 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-amber-200/24 blur-3xl" />
          <div className="relative mx-auto max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              {locale === "ja" ? "パック選択ガイド" : "Pack finder"}
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              {locale === "ja" ? "あなたに最適なパックは？" : "Which pack is right for you?"}
            </h1>
            <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-neutral-600 sm:text-lg">
              {locale === "ja"
                ? "5つの質問に答えるだけで、プロジェクトに最適なパックをご提案します。"
                : "Answer 5 quick questions and we'll recommend the best pack for your project."}
            </p>
          </div>
        </section>

        {!isFinished && question ? (
          /* Question Card */
          <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.05)] sm:p-8">
            <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              {locale === "ja" ? `質問 ${current + 1} / ${QUESTIONS.length}` : `Question ${current + 1} of ${QUESTIONS.length}`}
            </div>
            {/* Progress bar */}
            <div className="mb-6 h-1.5 w-full rounded-full bg-neutral-100">
              <div
                className="h-1.5 rounded-full bg-neutral-900 transition-all duration-300"
                style={{ width: `${((current) / QUESTIONS.length) * 100}%` }}
              />
            </div>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-3xl">
              {question.text[locale]}
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {question.options.map((option, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectOption(i)}
                  className="rounded-[1.2rem] border border-black/6 bg-neutral-50 px-5 py-4 text-left text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-white hover:shadow-md active:scale-[0.98]"
                >
                  {option.label[locale]}
                </button>
              ))}
            </div>
          </section>
        ) : isFinished ? (
          /* Results */
          <>
            <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.05)] sm:p-8">
              <div className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                {locale === "ja" ? "おすすめ結果" : "Your recommendation"}
              </div>
              <div className="mb-6 h-1.5 w-full rounded-full bg-neutral-900" />
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-3xl">
                {locale === "ja" ? "あなたにおすすめのパック" : "Here's what we recommend"}
              </h2>
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {ranked.map((pack, i) => (
                  <Link
                    key={pack.id}
                    href={pack.href}
                    className={`rounded-[1.2rem] border p-5 transition hover:shadow-md ${i === 0 ? pack.accent + " ring-2 ring-neutral-900/10" : "border-black/6 bg-white"}`}
                  >
                    {i === 0 && (
                      <div className="mb-2 inline-flex rounded-full bg-neutral-900 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                        {locale === "ja" ? "最もおすすめ" : "Best match"}
                      </div>
                    )}
                    <h3 className="text-lg font-semibold tracking-[-0.02em] text-neutral-950">
                      {pack.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">
                      {pack.desc[locale]}
                    </p>
                    <div className="mt-3 text-sm font-medium text-neutral-900">
                      {locale === "ja" ? "詳細を見る →" : "View details →"}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={restart}
                className="rounded-full border border-black/8 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                {locale === "ja" ? "やり直す" : "Start over"}
              </button>
              <Link
                href="/packs/"
                className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                {locale === "ja" ? "全パックを見る" : "Browse all packs"}
              </Link>
              <Link
                href="/free-pack/"
                className="rounded-full border border-black/8 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                {locale === "ja" ? "無料サンプル" : "Free sample"}
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
