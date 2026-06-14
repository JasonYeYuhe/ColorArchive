"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { colors } from "@/src/data/colors";

import { EmailSubscribe } from "@/src/components/email-subscribe";
import { getColorOfDay, todayDateStr } from "@/src/lib/color-of-day";
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

const FEATURES = [
  { titleKey: "hero.contrastChecker", descKey: "hero.contrastDesc", ctaKey: "hero.tryContrastChecker", href: "/contrast/" },
  { titleKey: "hero.shareablePalettes", descKey: "hero.paletteDesc", ctaKey: "hero.createPalette", href: "/palette/" },
  { titleKey: "hero.colorblindSimulator", descKey: "hero.colorblindDesc", ctaKey: "hero.tryColorblind", href: "/colorblind/" },
] as const;

export function HeroSection({
  activeFamily,
  searchQuery,
  totalColors,
  visibleColors,
}: HeroSectionProps) {
  const { t } = useLocale();
  const searchSummary =
    searchQuery.trim().length > 0 ? `Matching "${searchQuery.trim()}"` : t("hero.showingFullArchive");
  const familyLabel = activeFamily === "All" ? t("hero.allFamilies") : `${activeFamily} ${t("hero.family")}`;

  return (
    <div className="flex flex-col gap-6">
      {/* Main hero — editorial */}
      <section className="relative overflow-hidden rounded-[2rem] border border-black/8 bg-white/70 px-6 py-16 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/55 sm:px-12 sm:py-24">
        <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent dark:via-white/10" />
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mb-7 inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.32em] text-neutral-500 dark:text-neutral-400">
            <span className="h-px w-8 bg-neutral-300 dark:bg-neutral-700" />
            {t("hero.badge")}
            <span className="h-px w-8 bg-neutral-300 dark:bg-neutral-700" />
          </div>

          <h1 className="font-display text-5xl font-light leading-[1.02] tracking-[-0.01em] text-neutral-900 dark:text-white sm:text-[5.5rem]">
            ColorArchive
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-balance text-base leading-7 text-neutral-600 dark:text-neutral-400 sm:text-lg">
            {t("hero.description")}
          </p>

          {/* Spectrum strip — color, front and center */}
          <div className="mx-auto mt-10 flex max-w-2xl overflow-hidden rounded-full border border-black/8 shadow-sm dark:border-white/10">
            {HERO_STRIP.map((c) => (
              <div key={c.id} className="h-4 flex-1" style={{ backgroundColor: c.hex }} title={c.name} />
            ))}
          </div>

          {/* Focused CTA */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#archive"
              className="rounded-full bg-neutral-900 px-8 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 focus:outline-none focus:ring-4 focus:ring-neutral-900/10 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              {t("hero.browseArchive")}
            </a>
            <Link
              href="/pick-for-me/"
              className="rounded-full border border-black/12 bg-white/70 px-6 py-3 text-sm font-medium text-neutral-700 transition hover:border-black/25 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10"
            >
              {t("hero.pickForMe")}
            </Link>
            <Link
              href="/collections/"
              className="px-3 py-3 text-sm font-medium text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              {t("hero.browseCollections")} &rarr;
            </Link>
          </div>

          {/* Quiet status line — replaces the parameter cards */}
          <p className="mt-8 text-xs uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
            {totalColors.toLocaleString()} {t("hero.colors")} · {visibleColors.toLocaleString()} {t("hero.showing")} · {familyLabel} · {searchSummary}
          </p>
        </div>
      </section>

      {/* Stats / social proof bar */}
      <section className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 rounded-[1.5rem] border border-black/8 bg-white/70 px-6 py-5 text-center backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/55">
        {[
          { n: "5,446", l: t("hero.colors") },
          { n: "12", l: t("hero.collections") },
          { n: "7", l: t("hero.products") },
          { n: "100%", l: t("hero.static") },
        ].map((s) => (
          <div key={s.l} className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-light text-neutral-900 dark:text-white">{s.n}</span>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">{s.l}</span>
          </div>
        ))}
      </section>

      {/* Feature callouts — quiet, no glows */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.href}
            className="rounded-[1.75rem] border border-black/8 bg-white/70 p-6 backdrop-blur-xl transition hover:border-black/16 dark:border-white/10 dark:bg-neutral-900/55"
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-400 dark:text-neutral-500">
              {t("hero.new")}
            </div>
            <h3 className="font-display mt-2 text-xl font-normal tracking-[-0.01em] text-neutral-900 dark:text-white">
              {t(f.titleKey)}
            </h3>
            <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
              {t(f.descKey)}
            </p>
            <Link
              href={f.href}
              className="mt-4 inline-flex rounded-full border border-black/10 bg-white px-4 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-white/12 dark:bg-white/5 dark:text-neutral-300"
            >
              {t(f.ctaKey)}
            </Link>
          </div>
        ))}
      </section>

      {/* Color of the Day */}
      {(() => {
        // Canonical color-of-the-day — golden-angle rotation shared byte-for-byte
        // with /today/, the daily email, and iOS (src/lib/color-of-day.ts).
        const todayColor = getColorOfDay(todayDateStr());
        return (
          <section className="rounded-[1.75rem] border border-black/8 bg-white/75 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/70">
            <div className="flex items-center gap-5 sm:gap-6">
              <Link href={`/colors/${todayColor.id}/`} className="shrink-0">
                <div className="h-20 w-20 rounded-2xl shadow-md transition hover:shadow-lg sm:h-24 sm:w-24" style={{ backgroundColor: todayColor.hex }} />
              </Link>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400 dark:text-neutral-500">
                  {t("hero.colorOfTheDay")}
                </div>
                <Link
                  href={`/colors/${todayColor.id}/`}
                  className="font-display mt-1.5 block text-2xl font-normal tracking-[-0.01em] text-neutral-900 hover:underline dark:text-white sm:text-3xl"
                >
                  {todayColor.name}
                </Link>
                <div className="mt-1 font-mono text-sm text-neutral-500 dark:text-neutral-400">
                  {todayColor.hex} · {todayColor.hsl}
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Below-fold sections: lazy loaded */}
      <HeroSectionBelowFold />

      {/* Newsletter subscribe */}
      <EmailSubscribe />
    </div>
  );
}
