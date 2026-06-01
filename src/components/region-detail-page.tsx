"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { RegionPalette } from "@/src/lib/region-palettes";
import { regionPalettes, CONTINENT_LABELS } from "@/src/lib/region-palettes";
import { colors as archiveColors } from "@/src/data/colors";
import { findClosestArchiveColor } from "@/src/lib/color-relationships";

interface Props {
  region: RegionPalette;
}

export function RegionDetailPage({ region }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  const matches = useMemo(
    () =>
      region.colors.map((c) => ({
        ...c,
        archive: findClosestArchiveColor(archiveColors, c.hex),
      })),
    [region],
  );

  const siblings = useMemo(
    () =>
      regionPalettes
        .filter((r) => r.continent === region.continent && r.slug !== region.slug)
        .slice(0, 4),
    [region],
  );

  const copy = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(text);
        window.setTimeout(() => setCopied((curr) => (curr === text ? null : curr)), 1200);
      })
      .catch(() => {});
  };

  const cssVars = region.colors
    .map((c) => `  --${slugifyName(c.name)}: ${c.hex.toLowerCase()};`)
    .join("\n");
  const cssBlock = `:root {\n${cssVars}\n}`;

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950">
      <section className="max-w-3xl mx-auto px-4 pt-10 pb-6">
        <nav className="mb-4 text-xs text-slate-400">
          <Link href="/" className="hover:text-neutral-700 dark:hover:text-neutral-300">
            ColorArchive
          </Link>
          <span className="mx-2">/</span>
          <Link href="/regions/" className="hover:text-neutral-700 dark:hover:text-neutral-300">
            Regions
          </Link>
          <span className="mx-2">/</span>
          <span>{region.name}</span>
        </nav>

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-2">
          {CONTINENT_LABELS[region.continent]}
        </p>
        <h1 className="text-3xl sm:text-4xl font-display font-light tracking-tight text-neutral-900 dark:text-white mb-3">
          {region.name} Color Palette
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-2">
          {region.tagline}
        </p>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
          {region.description}
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
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => copy(c.hex)}
                  className="h-12 w-12 shrink-0 rounded-xl border border-black/8 dark:border-white/10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-neutral-300"
                  style={{ backgroundColor: c.hex }}
                  aria-label={`Copy ${c.hex}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {c.name}
                    </h3>
                    {c.archive && (
                      <Link
                        href={`/colors/${c.archive.id}/`}
                        className="text-[11px] text-slate-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors flex items-center gap-1"
                      >
                        ≈
                        <span
                          className="h-3 w-3 rounded border border-black/10 dark:border-white/15"
                          style={{ backgroundColor: c.archive.hex }}
                        />
                        {c.archive.name}
                      </Link>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => copy(c.hex)}
                    className="mt-0.5 font-mono text-xs text-slate-500 dark:text-slate-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                  >
                    {c.hex.toUpperCase()}
                    <span className="ml-2 text-[10px] text-slate-300">
                      {copied === c.hex ? "Copied" : "Click to copy"}
                    </span>
                  </button>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-snug italic">
                    {c.source}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-8">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-3">
          Suits
        </h2>
        <div className="flex flex-wrap gap-2">
          {region.useCases.map((u) => (
            <span
              key={u}
              className="rounded-full bg-neutral-100 dark:bg-white/8 text-xs px-3 py-1 text-slate-600 dark:text-slate-300"
            >
              {u}
            </span>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-8">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-3">
          Copy as CSS
        </h2>
        <div className="relative rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-neutral-950 dark:bg-black p-4">
          <button
            type="button"
            onClick={() => copy(cssBlock)}
            className="absolute top-3 right-3 text-[10px] font-medium text-neutral-400 hover:text-white px-2 py-1 rounded-md border border-white/10 hover:bg-white/5 transition-colors"
          >
            {copied === cssBlock ? "Copied" : "Copy"}
          </button>
          <pre className="font-mono text-xs text-neutral-200 whitespace-pre overflow-x-auto leading-relaxed">
            {cssBlock}
          </pre>
        </div>
      </section>

      {region.references.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 pb-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-3">
            Further reading
          </h2>
          <ul className="space-y-1.5">
            {region.references.map((r) => (
              <li key={r.url} className="text-xs">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-slate-500 hover:text-neutral-700 dark:text-slate-400 dark:hover:text-neutral-200"
                >
                  {r.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {siblings.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 pb-16">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-3">
            More from {CONTINENT_LABELS[region.continent]}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {siblings.map((s) => (
              <Link
                key={s.slug}
                href={`/regions/${s.slug}/`}
                className="group rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
              >
                <div className="flex gap-1 mb-2 h-2 rounded-full overflow-hidden">
                  {s.colors.slice(0, 6).map((c) => (
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
