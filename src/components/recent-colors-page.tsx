"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ColorGrid } from "@/src/components/color-grid";
import { CopyButton } from "@/src/components/copy-button";
import { useLocale } from "@/src/components/locale-provider";
import { RecommendedColorsSection } from "@/src/components/recommended-colors-section";
import { clearRecentColors, getRecentColorIds, subscribeToRecentColors } from "@/src/lib/recent-colors";
import { colors } from "@/src/data/colors";
import type { ColorRecord } from "@/src/types/color";

export function RecentColorsPage() {
  const { t } = useLocale();
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    setRecentIds(getRecentColorIds());
    return subscribeToRecentColors(setRecentIds);
  }, []);

  const recentColors = useMemo(
    () =>
      recentIds
        .map((id) => colors.find((color) => color.id === id))
        .filter((color): color is ColorRecord => Boolean(color)),
    [colors, recentIds],
  );

  const paletteExport = useMemo(
    () => recentColors.map((color, index) => `${index + 1}. ${color.name} ${color.hex}`).join("\n"),
    [recentColors],
  );
  const cssExport = useMemo(
    () => recentColors.map((color, i) => `--recent-${i + 1}: ${color.hex}; /* ${color.name} */`).join("\n"),
    [recentColors],
  );
  const tailwindExport = useMemo(
    () => `@theme {\n${recentColors.map((color, i) => `  --color-recent-${i + 1}: ${color.hex};`).join("\n")}\n}`,
    [recentColors],
  );
  const jsonExport = useMemo(
    () =>
      JSON.stringify(
        recentColors.map((color) => ({
          id: color.id,
          name: color.name,
          hex: color.hex,
          rgb: color.rgb,
          hsl: color.hsl,
          family: color.family,
          hue: color.hue,
          saturation: color.saturation,
          lightness: color.lightness,
        })),
        null,
        2,
      ),
    [recentColors],
  );

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <nav className="mb-4 text-sm text-neutral-400">
          <Link href="/" className="transition hover:text-neutral-600">ColorArchive</Link>
          <span className="mx-2">&rsaquo;</span>
          <span className="text-neutral-600">Recent Colors</span>
        </nav>
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/74 sm:px-10 sm:py-14">
          <div className="relative mx-auto max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase dark:border-white/10 dark:bg-white/10 dark:text-neutral-400">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              {t("recent.badge")}
            </div>
            <h1 className="max-w-3xl font-display text-4xl font-light tracking-[-0.04em] text-neutral-950 dark:text-white sm:text-6xl">
              {t("recent.heading")}
            </h1>
            <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-neutral-600 dark:text-neutral-400 sm:text-lg">
              This page keeps a local trail of the colors you opened while browsing the archive. It
              makes it easier to resume exploration without an account or backend.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-black/6 bg-white/85 px-4 py-3 dark:border-white/10 dark:bg-white/8">
                <div className="text-xs uppercase tracking-[0.18em] text-neutral-400">{t("recent.recentLabel")}</div>
                <div className="mt-1 text-lg font-semibold text-neutral-950 dark:text-white">
                  {recentColors.length} {t("recent.colors")}
                </div>
              </div>
              {recentColors.length > 0 ? (
                <>
                  <CopyButton label="palette" value={paletteExport} />
                  <CopyButton label="CSS vars" value={cssExport} />
                  <CopyButton label="Tailwind" value={tailwindExport} />
                  <CopyButton label="JSON" value={jsonExport} />
                  <button
                    type="button"
                    onClick={() => clearRecentColors()}
                    className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white/14"
                  >
                    {t("recent.clearRecent")}
                  </button>
                </>
              ) : null}
              <Link
                href="/favorites/"
                className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                {t("recent.favorites")}
              </Link>
              <Link
                href="/all-colors"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white/14"
              >
                {t("recent.searchArchive")}
              </Link>
            </div>
          </div>
        </section>

        {recentColors.length === 0 ? (
          <section className="rounded-[1.75rem] border border-black/6 bg-white/80 px-6 py-12 text-center shadow-[0_18px_48px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-neutral-900/78">
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">
              {t("recent.noRecentYet")}
            </h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
              Open a color detail page or inspect colors on the archive to build a local recent
              trail.
            </p>
          </section>
        ) : (
          <>
            <RecommendedColorsSection
              colors={colors}
              seedIds={recentIds}
              title={t("recent.recommendedTitle")}
              description="These suggestions lean on the families and tonal jumps you opened most recently, so you can branch naturally instead of restarting from the full archive."
            />

            <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-neutral-900/78">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                {t("recent.exportPreview")}
              </div>
              <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4 text-sm leading-6 text-neutral-600 dark:bg-white/8 dark:text-neutral-300">
                {paletteExport}
              </pre>
              <div className="mt-4 text-xs uppercase tracking-[0.16em] text-neutral-400">
                {t("recent.jsonExportNote")}
              </div>
            </section>

            <ColorGrid colors={recentColors} />
          </>
        )}
      </div>
    </main>
  );
}
