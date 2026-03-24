"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { colors } from "@/src/data/colors";
import { checkoutConfig } from "@/src/lib/checkout-config";
import { useLocale } from "@/src/components/locale-provider";

// Fixed hue-spanning strip: Tone (L=60) at Clear (S=54), one per hue across the spectrum
const HERO_STRIP = colors
  .filter((c) => c.lightness === 60 && c.saturation === 54)
  .sort((a, b) => a.hue - b.hue);

function BelowFoldSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse rounded-[2rem] border border-black/6 bg-white/72 px-6 py-8 dark:border-white/10 dark:bg-neutral-900/60 sm:px-10 sm:py-10">
          <div className="mx-auto max-w-4xl space-y-4">
            <div className="h-3 w-24 rounded bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-7 w-64 rounded bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-4 w-96 rounded bg-neutral-100 dark:bg-neutral-800" />
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-24 rounded-[1.3rem] border border-black/6 bg-neutral-50 dark:border-white/8 dark:bg-white/4" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const HeroSectionBelowFold = dynamic(
  () =>
    import("./hero-section-below-fold").then((m) => ({
      default: m.HeroSectionBelowFold,
    })),
  { ssr: false, loading: () => <BelowFoldSkeleton /> }
);

interface HeroSectionProps {
  activeFamily: string;
  searchQuery: string;
  totalColors: number;
  visibleColors: number;
}

export function HeroSection({
  activeFamily,
  searchQuery,
  totalColors,
  visibleColors,
}: HeroSectionProps) {
  const { t } = useLocale();
  const searchSummary = searchQuery.trim().length > 0 ? `Matching "${searchQuery.trim()}"` : t("hero.showingFullArchive");

  return (
    <div className="flex flex-col gap-6">
      {/* Main hero */}
      <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/72 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-16 top-8 h-48 w-48 rounded-full bg-rose-200/45 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-sky-200/35 blur-3xl" />
        <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
        <div className="relative mx-auto max-w-4xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
            <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
            {t("hero.badge")}
          </div>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
            ColorArchive
          </h1>

          <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-neutral-600 sm:text-lg">
            {t("hero.description")}
          </p>

          {/* Spectrum strip */}
          <div className="mt-5 flex overflow-hidden rounded-2xl border border-black/6 shadow-sm">
            {HERO_STRIP.map((c) => (
              <div
                key={c.id}
                className="h-3 flex-1"
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>

          {/* Primary CTA — focused on 2 actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="#archive"
              className="rounded-full bg-neutral-950 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 focus:outline-none focus:ring-4 focus:ring-neutral-900/10 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
            >
              {t("hero.browseArchive")}
            </a>
            <Link
              href="/brand-generator/"
              className="rounded-full border border-black/8 bg-white/88 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-neutral-900/10 dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white/14"
            >
              AI Brand Generator
            </Link>
            <Link
              href="/packs/"
              className="text-sm font-medium text-neutral-500 transition hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              {t("hero.browsePacks")} &rarr;
            </Link>
          </div>

          {/* Status pills */}
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
            <span className="rounded-full border border-black/6 bg-white/80 px-3 py-1.5">
              {searchSummary}
            </span>
            <span className="rounded-full border border-black/6 bg-white/80 px-3 py-1.5">
              {activeFamily === "All" ? t("hero.allFamilies") : `${activeFamily} ${t("hero.family")}`}
            </span>
          </div>

          {/* Stats cards */}
          <div className="mt-8 flex flex-wrap gap-3">
            <div className="rounded-2xl border border-black/6 bg-white/85 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.18em] text-neutral-400">{t("hero.archive")}</div>
              <div className="mt-1 text-lg font-semibold text-neutral-950">{totalColors} {t("hero.colors")}</div>
            </div>
            <div className="rounded-2xl border border-black/6 bg-white/85 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.18em] text-neutral-400">{t("hero.showing")}</div>
              <div className="mt-1 text-lg font-semibold text-neutral-950">{visibleColors} {t("hero.colors")}</div>
            </div>
            <div className="rounded-2xl border border-black/6 bg-white/85 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.18em] text-neutral-400">{t("hero.defaultSort")}</div>
              <div className="mt-1 text-lg font-semibold text-neutral-950">Hue &rarr; Sat &rarr; Light</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / social proof bar */}
      <section className="flex flex-wrap items-center justify-center gap-4 rounded-[1.5rem] border border-black/6 bg-white/74 px-6 py-4 text-center shadow-sm backdrop-blur-xl sm:gap-8">
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <span className="text-lg font-semibold text-neutral-950">3,066</span> {t("hero.colors")}
        </div>
        <div className="h-4 w-px bg-black/10" aria-hidden="true" />
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <span className="text-lg font-semibold text-neutral-950">12</span> {t("hero.collections")}
        </div>
        <div className="h-4 w-px bg-black/10" aria-hidden="true" />
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <span className="text-lg font-semibold text-neutral-950">7</span> {t("hero.products")}
        </div>
        <div className="h-4 w-px bg-black/10" aria-hidden="true" />
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <span className="text-lg font-semibold text-neutral-950">100%</span> {t("hero.static")}
        </div>
      </section>

      {/* Feature callouts */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-black/6 bg-white/78 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.04)]">
          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-violet-200/30 blur-2xl" />
          <div className="relative">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-600">
              {t("hero.new")}
            </div>
            <h3 className="text-lg font-semibold tracking-[-0.02em] text-neutral-950">
              {t("hero.contrastChecker")}
            </h3>
            <p className="mt-1.5 text-sm leading-6 text-neutral-600">
              {t("hero.contrastDesc")}
            </p>
            <Link
              href="/contrast/"
              className="mt-3 inline-flex rounded-full border border-black/8 bg-white px-4 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              {t("hero.tryContrastChecker")}
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[1.75rem] border border-black/6 bg-white/78 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.04)]">
          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-amber-200/30 blur-2xl" />
          <div className="relative">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-600">
              {t("hero.new")}
            </div>
            <h3 className="text-lg font-semibold tracking-[-0.02em] text-neutral-950">
              {t("hero.shareablePalettes")}
            </h3>
            <p className="mt-1.5 text-sm leading-6 text-neutral-600">
              {t("hero.paletteDesc")}
            </p>
            <Link
              href="/palette/"
              className="mt-3 inline-flex rounded-full border border-black/8 bg-white px-4 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              {t("hero.createPalette")}
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[1.75rem] border border-black/6 bg-white/78 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.04)]">
          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-teal-200/30 blur-2xl" />
          <div className="relative">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-600">
              {t("hero.new")}
            </div>
            <h3 className="text-lg font-semibold tracking-[-0.02em] text-neutral-950">
              {t("hero.colorblindSimulator")}
            </h3>
            <p className="mt-1.5 text-sm leading-6 text-neutral-600">
              {t("hero.colorblindDesc")}
            </p>
            <Link
              href="/colorblind/"
              className="mt-3 inline-flex rounded-full border border-black/8 bg-white px-4 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              {t("hero.tryColorblind")}
            </Link>
          </div>
        </div>
      </section>

      {/* Color of the Day */}
      {(() => {
        const today = new Date();
        const dayHash = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        const todayColor = colors[dayHash % colors.length];
        return (
          <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-neutral-900/80">
            <div className="flex items-center gap-4 sm:gap-6">
              <Link href={`/colors/${todayColor.id}/`} className="shrink-0">
                <div className="h-20 w-20 rounded-2xl shadow-md transition hover:shadow-lg sm:h-24 sm:w-24" style={{ backgroundColor: todayColor.hex }} />
              </Link>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
                  {t("hero.colorOfTheDay")}
                </div>
                <Link href={`/colors/${todayColor.id}/`} className="mt-1 block text-xl font-semibold tracking-[-0.03em] text-neutral-950 hover:underline dark:text-white sm:text-2xl">
                  {todayColor.name}
                </Link>
                <div className="mt-1 font-mono text-sm text-neutral-500">{todayColor.hex} · {todayColor.hsl}</div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Below-fold sections: lazy loaded */}
      <HeroSectionBelowFold />
    </div>
  );
}
