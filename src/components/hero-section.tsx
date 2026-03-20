"use client";

import Link from "next/link";
import { colors } from "@/src/data/colors";
import { checkoutConfig } from "@/src/lib/checkout-config";
import { landingGuides } from "@/src/lib/guides";
import { newsletterIssues } from "@/src/lib/newsletter-issues";
import { palettePacks } from "@/src/lib/palette-packs";
import { useLocale } from "@/src/components/locale-provider";

// Fixed hue-spanning strip: Tone (L=60) at Clear (S=54), one per hue across the spectrum
const HERO_STRIP = colors
  .filter((c) => c.lightness === 60 && c.saturation === 54)
  .sort((a, b) => a.hue - b.hue);

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
  const featuredGuides = landingGuides.slice(0, 4);
  const recentNotes = newsletterIssues.slice(0, 3);

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

          {/* Primary CTA hierarchy */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/free-pack/"
              className="rounded-full bg-neutral-950 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 focus:outline-none focus:ring-4 focus:ring-neutral-900/10"
            >
              {t("hero.getStartedFree")}
            </Link>
            <a
              href="#archive"
              className="rounded-full border border-black/8 bg-white/88 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-neutral-900/10"
            >
              {t("hero.browseArchive")}
            </a>
            <Link
              href="/packs/"
              className="rounded-full border border-black/8 bg-white/88 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-neutral-900/10"
            >
              {t("hero.browsePacks")}
            </Link>
            <Link
              href="/guides/"
              className="rounded-full border border-black/8 bg-white/88 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-neutral-900/10"
            >
              {t("hero.readGuides")}
            </Link>
            {checkoutConfig["all-access-bundle"].url && (
              <a
                href={checkoutConfig["all-access-bundle"].url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-emerald-300/40 bg-emerald-50/80 px-5 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 focus:outline-none focus:ring-4 focus:ring-emerald-400/20 dark:border-emerald-700/40 dark:bg-emerald-900/40 dark:text-emerald-300"
              >
                All Access ¥2,799
              </a>
            )}
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
          <span className="text-lg font-semibold text-neutral-950">2016</span> {t("hero.colors")}
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
      <section className="grid gap-4 sm:grid-cols-2">
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
      </section>

      {/* Token pipeline showcase */}
      <section className="rounded-[2rem] border border-black/6 bg-white/72 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:px-10 sm:py-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">
            {t("hero.tokenPipeline")}
          </div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-3xl">
            {t("hero.tokenHeading")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base">
            {t("hero.tokenDesc")}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.3rem] border border-black/6 bg-neutral-950 p-4 dark:border-white/10">
              <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">CSS Variables</div>
              <pre className="text-xs leading-5 text-emerald-400"><code>{`:root {\n  --coral-sunset: #E8734A;\n  --ocean-depth: #1B4965;\n  --sage-mist: #A3B899;\n  --warm-sand: #D4A574;\n}`}</code></pre>
            </div>
            <div className="rounded-[1.3rem] border border-black/6 bg-neutral-950 p-4 dark:border-white/10">
              <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">Tailwind Config</div>
              <pre className="text-xs leading-5 text-sky-400"><code>{`colors: {\n  coral: "#E8734A",\n  ocean: "#1B4965",\n  sage: "#A3B899",\n  sand: "#D4A574",\n}`}</code></pre>
            </div>
            <div className="rounded-[1.3rem] border border-black/6 bg-neutral-950 p-4 dark:border-white/10">
              <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">Figma Tokens JSON</div>
              <pre className="text-xs leading-5 text-amber-400"><code>{`{\n  "coral-sunset": {\n    "value": "#E8734A",\n    "type": "color"\n  }\n}`}</code></pre>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.14em] text-neutral-400">
            <span className="rounded-full border border-black/6 bg-white/80 px-3 py-1.5 dark:border-white/8 dark:bg-white/6">CSS</span>
            <span className="rounded-full border border-black/6 bg-white/80 px-3 py-1.5 dark:border-white/8 dark:bg-white/6">Tailwind</span>
            <span className="rounded-full border border-black/6 bg-white/80 px-3 py-1.5 dark:border-white/8 dark:bg-white/6">Figma JSON</span>
            <span className="rounded-full border border-black/6 bg-white/80 px-3 py-1.5 dark:border-white/8 dark:bg-white/6">Style Dictionary</span>
            <span className="rounded-full border border-black/6 bg-white/80 px-3 py-1.5 dark:border-white/8 dark:bg-white/6">SCSS</span>
            <span className="rounded-full border border-black/6 bg-white/80 px-3 py-1.5 dark:border-white/8 dark:bg-white/6">ACO</span>
            <span className="rounded-full border border-black/6 bg-white/80 px-3 py-1.5 dark:border-white/8 dark:bg-white/6">Procreate</span>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-black/6 bg-white/72 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:px-10 sm:py-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">
            {t("hero.guides")}
          </div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-3xl">
            {t("hero.guidesHeading")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base">
            {t("hero.guidesDesc")}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {featuredGuides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}/`}
                className="group rounded-[1.5rem] border border-black/6 bg-white/85 p-5 transition hover:shadow-md"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                    {guide.eyebrow}
                  </div>
                  <div className="rounded-full border border-black/6 bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
                    {guide.searchIntent}
                  </div>
                </div>
                <h3 className="mt-3 text-base font-semibold text-neutral-950 group-hover:text-neutral-700">
                  {guide.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-neutral-500">{guide.summary}</p>
              </Link>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/guides/"
              className="rounded-full bg-neutral-950 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800"
            >
              {t("hero.browseAllGuides")}
            </Link>
            <Link
              href="/notes/"
              className="rounded-full border border-black/8 bg-white/88 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-white"
            >
              {t("hero.readNotes")}
            </Link>
          </div>
        </div>
      </section>

      {/* Latest notes */}
      <section className="rounded-[2rem] border border-black/6 bg-white/72 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:px-10 sm:py-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">
            {t("hero.latestNotes")}
          </div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-3xl">
            {t("hero.latestNotesHeading")}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {recentNotes.map((note) => (
              <Link
                key={note.slug}
                href={`/notes/${note.slug}/`}
                className="rounded-[1.3rem] border border-black/6 bg-white/90 p-4 transition hover:-translate-y-0.5 hover:shadow-md dark:bg-neutral-800/60 dark:border-white/8"
              >
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  {note.eyebrow}
                </div>
                <div className="mt-2 text-sm font-semibold text-neutral-950 dark:text-white">
                  {note.title}
                </div>
                <div className="mt-2 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                  {note.summary}
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-5">
            <Link
              href="/notes/"
              className="rounded-full border border-black/8 bg-white/88 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-white"
            >
              {t("hero.readNotes")}
            </Link>
          </div>
        </div>
      </section>

      {/* Product showcase — pack cards */}
      <section className="rounded-[2rem] border border-black/6 bg-white/72 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:px-10 sm:py-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">
            {t("hero.palettePacks")}
          </div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-3xl">
            {t("hero.readyToUse")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base">
            {t("hero.packsDesc")}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {palettePacks.map((pack) => (
              <Link
                key={pack.id}
                href={`/packs/${pack.id}/`}
                className="group rounded-[1.5rem] border border-black/6 bg-white/85 p-5 transition hover:shadow-md"
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                    {pack.previewCollections.slice(0, 3).map((name, i) => (
                      <div
                        key={name}
                        className="h-6 w-6 rounded-full border-2 border-white"
                        style={{
                          backgroundColor: [
                            "#E8C4B8", "#6DB7FF", "#7FD7B4", "#FF8A7A", "#B4A0D9",
                          ][i % 5],
                        }}
                      />
                    ))}
                  </div>
                </div>
                <h3 className="text-base font-semibold text-neutral-950 group-hover:text-neutral-700">
                  {pack.title}
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  {pack.priceHint}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {pack.formatList.slice(0, 2).map((format) => (
                    <span
                      key={format}
                      className="rounded-full border border-black/6 bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-neutral-500"
                    >
                      {format}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/free-pack/"
              className="rounded-full bg-neutral-950 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800"
            >
              {t("hero.getStartedFree")}
            </Link>
            <Link
              href="/packs/"
              className="rounded-full border border-black/8 bg-white/88 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-white"
            >
              {t("hero.browseAllPacks")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
