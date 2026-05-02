"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  brandPalettes,
  brandsByCategory,
  BRAND_CATEGORY_LABELS,
} from "@/src/lib/brand-palettes";

export function BrandsIndexPage() {
  const grouped = useMemo(() => {
    const m = brandsByCategory();
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, []);

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950">
      <section className="max-w-3xl mx-auto px-4 pt-12 pb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">
          Brand color reference
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4">
          Famous Brand Color Palettes
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
          Hex values, names, and design rationale for {brandPalettes.length} of the world&apos;s most-recognized brand color systems —
          each sourced from public brand guidelines and matched to its nearest ColorArchive entry.
        </p>
        <p className="mt-3 text-[11px] text-slate-400 max-w-lg mx-auto">
          Unofficial reference. Color values are not subject to copyright; brand names belong to their respective owners.
          Ask us to remove a listing via <Link href="/support/" className="underline hover:text-neutral-700">support</Link>.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-20 space-y-12">
        {grouped.map(([cat, items]) => (
          <div key={cat}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-4">
              {BRAND_CATEGORY_LABELS[cat]}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/brands/${brand.slug}/`}
                  className="group block rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 hover:border-neutral-300 dark:hover:border-neutral-600 hover:shadow-md transition-all"
                >
                  <div className="flex gap-1.5 mb-3 h-3 rounded-full overflow-hidden">
                    {brand.colors.slice(0, 5).map((c) => (
                      <span
                        key={c.hex}
                        className="flex-1"
                        style={{ backgroundColor: c.hex }}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-white group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors">
                      {brand.name}
                    </h3>
                    <span className="text-[10px] uppercase tracking-wide text-slate-400">
                      {brand.colors.length} colors
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {brand.tagline}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
