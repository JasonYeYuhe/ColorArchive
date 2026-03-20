"use client";

import Link from "next/link";
import { Suspense } from "react";
import { EmailCaptureForm } from "@/src/components/email-capture-form";
import { colors } from "@/src/data/colors";
import { collections } from "@/src/lib/collections";
import { palettePacks } from "@/src/lib/palette-packs";

const HERO_STRIP = colors
  .filter((c) => c.lightness === 60 && c.saturation === 54)
  .sort((a, b) => a.hue - b.hue);

const FEATURED_COLLECTIONS = collections.slice(0, 4);
const BUNDLE = palettePacks.find((p) => p.id === "all-access-bundle");

export function LaunchPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/72 px-6 py-12 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-16 dark:border-white/8 dark:bg-neutral-900/72">
        <div className="pointer-events-none absolute -left-16 top-8 h-48 w-48 rounded-full bg-rose-200/45 blur-3xl dark:bg-rose-900/20" />
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-sky-200/35 blur-3xl dark:bg-sky-900/15" />
        <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent dark:via-white/10" />

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium tracking-[0.22em] text-orange-700 uppercase dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300">
            <span className="inline-block h-2 w-2 rounded-full bg-orange-500" />
            Live on Product Hunt
          </div>

          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-5xl dark:text-neutral-50">
            2,016 curated colors.<br />Production-ready tokens.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-balance text-base leading-7 text-neutral-600 sm:text-lg dark:text-neutral-400">
            Browse a calm, searchable color archive. Build palettes, check WCAG contrast, and export tokens for Figma, CSS, Tailwind, and Style Dictionary.
          </p>

          {/* Spectrum strip */}
          <div className="mx-auto mt-6 max-w-md">
            <div className="flex overflow-hidden rounded-2xl border border-black/6 shadow-sm dark:border-white/8">
              {HERO_STRIP.map((c) => (
                <div key={c.id} className="h-3 flex-1" style={{ backgroundColor: c.hex }} title={c.name} />
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/free-pack/"
              className="inline-flex items-center rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            >
              Get free sample pack
            </Link>
            <Link
              href="/"
              className="inline-flex items-center rounded-full border border-black/10 bg-white/80 px-6 py-2.5 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              Browse the archive
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Colors", value: "2,016" },
          { label: "Collections", value: String(collections.length) },
          { label: "Export formats", value: "10+" },
          { label: "Token packs", value: String(palettePacks.length) },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-black/6 bg-white/60 px-5 py-4 text-center backdrop-blur-sm dark:border-white/8 dark:bg-neutral-900/60">
            <div className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">{stat.value}</div>
            <div className="mt-1 text-xs text-neutral-500">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Featured collections */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">Featured collections</h2>
        <p className="mt-2 text-sm text-neutral-500">Curated palette sets for brand, editorial, and product work.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {FEATURED_COLLECTIONS.map((col) => (
            <Link
              key={col.id}
              href={`/collections/${col.id}/`}
              className="group rounded-2xl border border-black/6 bg-white/60 p-5 backdrop-blur-sm transition hover:shadow-md dark:border-white/8 dark:bg-neutral-900/60"
            >
              <div className="mb-3 flex gap-1.5 overflow-hidden rounded-lg">
                {col.palette.slice(0, 5).map((c) => (
                  <div key={c.id} className="h-8 flex-1" style={{ backgroundColor: c.hex }} />
                ))}
              </div>
              <h3 className="font-medium text-neutral-900 group-hover:text-neutral-700 dark:text-neutral-100 dark:group-hover:text-neutral-300">
                {col.title}
              </h3>
              <p className="mt-1 text-xs text-neutral-500 line-clamp-2">{col.summary}</p>
            </Link>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link href="/collections/" className="text-sm font-medium text-neutral-500 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-700 dark:decoration-neutral-600 dark:hover:text-neutral-300">
            View all {collections.length} collections
          </Link>
        </div>
      </section>

      {/* Tools */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">Built-in tools</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { title: "Palette Builder", desc: "Build, share, and export custom palettes from the archive.", href: "/palette/" },
            { title: "Contrast Checker", desc: "Check WCAG AA/AAA contrast ratios in real time.", href: "/contrast/" },
            { title: "Word → Color", desc: "Type any word, get a deterministic color and palette.", href: "/word-to-color/" },
          ].map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="rounded-2xl border border-black/6 bg-white/60 p-5 backdrop-blur-sm transition hover:shadow-md dark:border-white/8 dark:bg-neutral-900/60"
            >
              <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{tool.title}</h3>
              <p className="mt-1 text-xs text-neutral-500">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Bundle CTA */}
      {BUNDLE && (
        <section className="mt-14 overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 sm:p-8 dark:border-emerald-800 dark:bg-emerald-950/40">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-1 text-xs font-medium tracking-widest text-emerald-700 uppercase dark:text-emerald-400">Best value</div>
              <h2 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50">{BUNDLE.title}</h2>
              <p className="mt-1 max-w-md text-sm text-neutral-600 dark:text-neutral-400">
                All 6 packs in one download. 32% savings over buying individually.
              </p>
            </div>
            <Link
              href={`/packs/${BUNDLE.id}/`}
              className="inline-flex shrink-0 items-center rounded-full bg-emerald-700 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              View bundle — {BUNDLE.priceHint}
            </Link>
          </div>
        </section>
      )}

      {/* Email capture */}
      <section className="mt-14 rounded-2xl border border-black/6 bg-white/60 p-6 text-center backdrop-blur-sm sm:p-8 dark:border-white/8 dark:bg-neutral-900/60">
        <h2 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50">Get the free sample pack</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
          Enter your email and we&apos;ll send a download link with curated palette files in CSS, JSON, Tailwind, Figma, and more.
        </p>
        <div className="mx-auto mt-5 max-w-sm">
          <Suspense fallback={null}>
            <EmailCaptureForm source="free-pack" />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
