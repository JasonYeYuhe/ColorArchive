"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { BrandPalette } from "@/src/lib/brand-palettes";
import { brandPalettes, BRAND_CATEGORY_LABELS } from "@/src/lib/brand-palettes";
import { colors as archiveColors } from "@/src/data/colors";
import { findClosestArchiveColor } from "@/src/lib/color-relationships";
import { track } from "@/src/lib/track";
import { writeClipboard } from "@/src/lib/clipboard";

interface Props {
  brand: BrandPalette;
}

const ROLE_LABEL: Record<string, string> = {
  primary: "Primary",
  secondary: "Secondary",
  accent: "Accent",
  neutral: "Neutral",
  background: "Background",
};

export function BrandDetailPage({ brand }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  // Pre-compute archive matches once (deterministic, used by SSR + hydrate
  // identically because archiveColors and findClosestArchiveColor are pure).
  const matches = useMemo(
    () =>
      brand.colors.map((c) => ({
        ...c,
        archive: findClosestArchiveColor(archiveColors, c.hex),
      })),
    [brand],
  );

  // Suggest 4 sibling brands in the same category for cross-link discovery.
  const siblings = useMemo(
    () =>
      brandPalettes
        .filter((b) => b.category === brand.category && b.slug !== brand.slug)
        .slice(0, 4),
    [brand],
  );

  // `format` is a bounded literal union on purpose: it is an analytics dimension,
  // and every call site passes a hardcoded surface name (never a hex or a colour
  // name), so the dimension stays groupable.
  const copy = async (
    text: string,
    format: "brand-swatch" | "brand-css" | "brand-tailwind",
  ) => {
    const result = await writeClipboard(text);
    if (!result.ok) {
      track("color_copy_failed", { format, variant: "compact", reason: result.reason });
      return;
    }
    track("color_copied", { format, variant: "compact" });
    setCopied(text);
    window.setTimeout(() => setCopied((curr) => (curr === text ? null : curr)), 1200);
  };

  const cssVars = brand.colors
    .map((c) => `  --${slugifyName(c.name)}: ${c.hex.toLowerCase()};`)
    .join("\n");
  const cssBlock = `:root {\n${cssVars}\n}`;

  // Same slug derivation as cssVars above, so the two snippets always agree.
  const tailwindEntries = brand.colors
    .map((c) => `        "${slugifyName(c.name)}": "${c.hex.toLowerCase()}",`)
    .join("\n");
  const tailwindBlock = `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${tailwindEntries}\n      },\n    },\n  },\n};`;

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950">
      <section className="max-w-3xl mx-auto px-4 pt-10 pb-6">
        <nav className="mb-4 text-xs text-slate-400">
          <Link href="/" className="hover:text-neutral-700 dark:hover:text-neutral-300">
            ColorArchive
          </Link>
          <span className="mx-2">/</span>
          <Link href="/brands/" className="hover:text-neutral-700 dark:hover:text-neutral-300">
            Brands
          </Link>
          <span className="mx-2">/</span>
          <span>{brand.name}</span>
        </nav>

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-2">
          {BRAND_CATEGORY_LABELS[brand.category]}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-light tracking-tight text-neutral-900 dark:text-white mb-3">
          {brand.name} Color Palette
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-2">
          {brand.tagline}
        </p>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
          {brand.description}
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-8">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-3">
          The palette
        </h2>
        <ul className="space-y-2">
          {matches.map((c) => (
            <li
              key={c.hex}
              className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4"
            >
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => copy(c.hex, "brand-swatch")}
                  className="h-12 w-12 shrink-0 rounded-xl border border-black/8 dark:border-white/10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-neutral-300"
                  style={{ backgroundColor: c.hex }}
                  aria-label={`Copy ${c.hex}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {c.name}
                    </h3>
                    <span className="text-[10px] uppercase tracking-wide text-slate-400">
                      {ROLE_LABEL[c.role] ?? c.role}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copy(c.hex, "brand-swatch")}
                    className="mt-0.5 font-mono text-xs text-slate-500 dark:text-slate-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                  >
                    {c.hex.toUpperCase()}
                    <span className="ml-2 text-[10px] text-slate-300">
                      {copied === c.hex ? "Copied" : "Click to copy"}
                    </span>
                  </button>
                  {c.note && (
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      {c.note}
                    </p>
                  )}
                </div>
                {c.archive && (
                  <Link
                    href={`/colors/${c.archive.id}/`}
                    onClick={() =>
                      track("tool_action", {
                        tool: "brands",
                        action: "archive_open",
                        brand: brand.slug,
                      })
                    }
                    className="hidden sm:flex flex-col items-end text-[11px] text-slate-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors group"
                  >
                    <span>Closest in Archive</span>
                    <span className="flex items-center gap-1.5 mt-1">
                      <span
                        className="h-3 w-3 rounded border border-black/10 dark:border-white/15"
                        style={{ backgroundColor: c.archive.hex }}
                      />
                      <span className="font-medium group-hover:underline">
                        {c.archive.name}
                      </span>
                    </span>
                  </Link>
                )}
              </div>
              {c.archive && (
                <Link
                  href={`/colors/${c.archive.id}/`}
                  onClick={() =>
                    track("tool_action", {
                      tool: "brands",
                      action: "archive_open",
                      brand: brand.slug,
                    })
                  }
                  className="sm:hidden mt-2 inline-flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-neutral-700 transition-colors"
                >
                  <span
                    className="h-3 w-3 rounded border border-black/10"
                    style={{ backgroundColor: c.archive.hex }}
                  />
                  Closest in Archive: {c.archive.name}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-8">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-3">
          Copy as CSS
        </h2>
        <div className="relative rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-neutral-950 dark:bg-black p-4">
          <button
            type="button"
            onClick={() => copy(cssBlock, "brand-css")}
            className="absolute top-3 right-3 text-[10px] font-medium text-neutral-400 hover:text-white px-2 py-1 rounded-md border border-white/10 hover:bg-white/5 transition-colors"
          >
            {copied === cssBlock ? "Copied" : "Copy"}
          </button>
          <pre className="font-mono text-xs text-neutral-200 whitespace-pre overflow-x-auto leading-relaxed">
            {cssBlock}
          </pre>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-8">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-3">
          Copy as Tailwind config
        </h2>
        <div className="relative rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-neutral-950 dark:bg-black p-4">
          <button
            type="button"
            onClick={() => copy(tailwindBlock, "brand-tailwind")}
            className="absolute top-3 right-3 text-[10px] font-medium text-neutral-400 hover:text-white px-2 py-1 rounded-md border border-white/10 hover:bg-white/5 transition-colors"
          >
            {copied === tailwindBlock ? "Copied" : "Copy"}
          </button>
          <pre className="font-mono text-xs text-neutral-200 whitespace-pre overflow-x-auto leading-relaxed">
            {tailwindBlock}
          </pre>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-8">
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Source:{" "}
          <a
            href={brand.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            {brand.source.url}
          </a>{" "}
          · As of {brand.source.asOf} · This page is an unofficial reference. Color values are factual sRGB hex codes
          and not subject to copyright; the {brand.name} name and any associated marks belong to their owner. Use{" "}
          <Link href="/support/" className="underline">support</Link> to request removal.
        </p>
      </section>

      {siblings.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 pb-16">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-3">
            More from {BRAND_CATEGORY_LABELS[brand.category]}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {siblings.map((s) => (
              <Link
                key={s.slug}
                href={`/brands/${s.slug}/`}
                className="group rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
              >
                <div className="flex gap-1 mb-2 h-2 rounded-full overflow-hidden">
                  {s.colors.slice(0, 5).map((c) => (
                    <span
                      key={c.hex}
                      className="flex-1"
                      style={{ backgroundColor: c.hex }}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white group-hover:text-neutral-700 dark:group-hover:text-neutral-200">
                  {s.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {s.tagline}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
