"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useLocale } from "@/src/components/locale-provider";
import { colors as allColors } from "@/src/data/colors";
import { getRecentColorIds } from "@/src/lib/recent-colors";
import { getFamilySlug } from "@/src/lib/color-family-pages";
import type { ColorRecord, ColorFamily } from "@/src/types/color";
import { addToPalette, getPaletteIds, subscribeToPalette, MAX_SIZE } from "@/src/lib/palette-builder";

interface TrendingColor {
  color: ColorRecord;
  score: number;
}

function PaletteAddButton({ colorId }: { colorId: string }) {
  const { t } = useLocale();
  const [paletteIds, setPaletteIds] = useState<string[]>([]);

  useEffect(() => {
    setPaletteIds(getPaletteIds());
    return subscribeToPalette(setPaletteIds);
  }, []);

  const inPalette = paletteIds.includes(colorId);
  const isFull = paletteIds.length >= MAX_SIZE;

  return (
    <button
      type="button"
      onClick={() => addToPalette(colorId)}
      disabled={inPalette || isFull}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] transition ${
        inPalette
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : isFull
            ? "cursor-not-allowed border-black/8 bg-neutral-50 text-neutral-300"
            : "border-black/8 bg-white text-neutral-600 hover:bg-neutral-950 hover:text-white"
      }`}
    >
      {inPalette ? t("colorDetail.inPalette") : isFull ? t("colorDetail.paletteFull") : t("colorDetail.addToPalette")}
    </button>
  );
}

// Deterministic "trending" algorithm based on color properties + date seed
function generateTrendingColors(seed: number): TrendingColor[] {
  const scored: TrendingColor[] = allColors.map((color) => {
    // Mix of hue, saturation, lightness + date seed for variety
    const hueFactor = Math.sin((color.hue + seed * 7) * 0.0174) * 0.5 + 0.5;
    const satFactor = color.saturation / 100;
    const lightFactor = 1 - Math.abs(color.lightness - 55) / 55; // prefer mid-range
    const idHash = color.id.split("").reduce((acc, ch) => ((acc << 3) - acc + ch.charCodeAt(0)) | 0, 0);
    const variety = Math.sin(idHash + seed) * 0.5 + 0.5;

    const score = hueFactor * 0.3 + satFactor * 0.25 + lightFactor * 0.2 + variety * 0.25;
    return { color, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 24);
}

function generateFamilyTrends(seed: number): { family: ColorFamily; count: number; topColor: ColorRecord }[] {
  const familyScores: Record<string, { total: number; count: number; topColor: ColorRecord; topScore: number }> = {};

  for (const color of allColors) {
    const hueFactor = Math.sin((color.hue + seed * 7) * 0.0174) * 0.5 + 0.5;
    const score = hueFactor * 0.6 + (color.saturation / 100) * 0.4;

    if (!familyScores[color.family]) {
      familyScores[color.family] = { total: 0, count: 0, topColor: color, topScore: 0 };
    }
    familyScores[color.family].total += score;
    familyScores[color.family].count++;
    if (score > familyScores[color.family].topScore) {
      familyScores[color.family].topScore = score;
      familyScores[color.family].topColor = color;
    }
  }

  return Object.entries(familyScores)
    .map(([family, data]) => ({
      family: family as ColorFamily,
      count: Math.round(data.total * 100),
      topColor: data.topColor,
    }))
    .sort((a, b) => b.count - a.count);
}

export function TrendingPage() {
  const { t } = useLocale();
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    setRecentIds(getRecentColorIds());
  }, []);

  // Seed changes weekly for fresh trending content
  const weekSeed = useMemo(() => {
    const now = new Date();
    return Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000));
  }, []);

  const trending = useMemo(() => generateTrendingColors(weekSeed), [weekSeed]);
  const familyTrends = useMemo(() => generateFamilyTrends(weekSeed), [weekSeed]);
  const recentColors = recentIds
    .map((id) => allColors.find((c) => c.id === id))
    .filter((c): c is ColorRecord => Boolean(c))
    .slice(0, 6);

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        {/* Hero */}
        <section className="rounded-[2rem] border border-black/6 bg-white/78 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400">
            {t("trending.badge")}
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-4xl">
            {t("trending.title")}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
            {t("trending.description")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/all-colors"
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
            >
              {t("trending.searchArchive")}
            </Link>
            <Link
              href="/collections/"
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-50"
            >
              {t("trending.browseCollections")}
            </Link>
          </div>
        </section>

        {/* Family trend bars */}
        <section className="rounded-[2rem] border border-black/6 bg-white/78 p-6">
          <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
            {t("trending.familyTrends")}
          </h2>
          <div className="mt-4 space-y-3">
            {familyTrends.map((entry) => {
              const maxCount = familyTrends[0].count;
              const pct = Math.round((entry.count / maxCount) * 100);
              return (
                <Link
                  key={entry.family}
                  href={`/families/${getFamilySlug(entry.family)}/`}
                  className="group flex items-center gap-3"
                >
                  <span
                    className="h-8 w-8 flex-shrink-0 rounded-lg border border-black/6"
                    style={{ backgroundColor: entry.topColor.hex }}
                    aria-hidden="true"
                  />
                  <span className="w-16 text-sm font-medium text-neutral-700">{entry.family}</span>
                  <span className="flex-1">
                    <span
                      className="block h-6 rounded-full bg-neutral-100 transition group-hover:bg-neutral-200"
                    >
                      <span
                        className="block h-6 rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: entry.topColor.hex,
                          opacity: 0.7,
                        }}
                      />
                    </span>
                  </span>
                  <span className="w-10 text-right text-xs font-medium text-neutral-500">
                    {pct}%
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Trending colors grid */}
        <section className="rounded-[2rem] border border-black/6 bg-white/78 p-6">
          <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
            {t("trending.topColors")}
          </h2>
          <p className="mt-2 text-sm text-neutral-500">{t("trending.topColorsDesc")}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {trending.map((entry, index) => (
              <article
                key={entry.color.id}
                className="rounded-[1.45rem] border border-black/6 bg-white/84 p-3 transition hover:-translate-y-0.5 hover:border-black/10 hover:shadow-[0_18px_36px_rgba(15,23,42,0.06)]"
              >
                <Link href={`/colors/${entry.color.id}/`} className="group block">
                  <div
                    className="h-20 rounded-[1.1rem] border border-black/6"
                    style={{ backgroundColor: entry.color.hex }}
                    aria-hidden="true"
                  />
                  <div className="mt-3 flex items-center gap-2">
                    <span className="rounded-full border border-black/8 bg-neutral-50 px-2 py-0.5 text-[10px] font-semibold text-neutral-500">
                      #{index + 1}
                    </span>
                    <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">
                      {entry.color.family}
                    </span>
                  </div>
                  <div className="mt-1 truncate text-base font-semibold tracking-[-0.02em] text-neutral-950">
                    {entry.color.name}
                  </div>
                  <div className="mt-1 text-sm text-neutral-500">
                    {entry.color.hex}
                  </div>
                </Link>
                <div className="mt-3">
                  <PaletteAddButton colorId={entry.color.id} />
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Personal recent trail */}
        {recentColors.length > 0 && (
          <section className="rounded-[2rem] border border-black/6 bg-white/78 p-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                {t("trending.yourRecent")}
              </h2>
              <Link
                href="/recent/"
                className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
              >
                {t("trending.viewAll")}
              </Link>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {recentColors.map((color) => (
                <Link
                  key={color.id}
                  href={`/colors/${color.id}/`}
                  className="flex items-center gap-3 rounded-2xl border border-black/6 bg-white px-3 py-3 transition hover:bg-neutral-50"
                >
                  <span
                    className="h-10 w-10 rounded-xl border border-black/6"
                    style={{ backgroundColor: color.hex }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-neutral-950">
                      {color.name}
                    </span>
                    <span className="block text-xs text-neutral-500">{color.hex}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="rounded-[2rem] border border-black/6 bg-neutral-950 p-6 text-white">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-white/40">
            {t("trending.ctaLabel")}
          </div>
          <p className="mt-2 text-lg font-semibold tracking-[-0.02em]">
            {t("trending.ctaTitle")}
          </p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">
            {t("trending.ctaDesc")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/packs/"
              className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-950 transition hover:bg-neutral-200"
            >
              {t("trending.browsePacks")}
            </Link>
            <Link
              href="/free-pack/"
              className="rounded-full border border-white/16 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/80 transition hover:border-white/30 hover:text-white"
            >
              {t("trending.freeDownload")}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
