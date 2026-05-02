"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  findBrandsNearColor,
  type BrandColorMatch,
} from "@/src/lib/color-brand-matches";
import type { ColorRecord } from "@/src/types/color";

interface Props {
  color: ColorRecord;
}

/**
 * "Brands using a similar color" section, rendered on every color
 * detail page. Builds a bidirectional graph between the 5,446-color
 * archive and the 51-brand catalog: external visitors searching for
 * "[Brand] color" land on /brands/[slug]/, then click through to the
 * archive entry; archive visitors land here, then click through to
 * brand context. Both directions strengthen internal linking and
 * give Google a cleaner sitemap-as-graph.
 *
 * Pure data — no async, no localStorage. Safe under SSR.
 */
export function BrandsUsingColorSection({ color }: Props) {
  const matches = useMemo<BrandColorMatch[]>(
    () => findBrandsNearColor(color.hex, 3),
    [color.hex],
  );

  if (matches.length === 0) return null;

  return (
    <section
      aria-labelledby={`brand-matches-${color.id}`}
      className="rounded-[1.6rem] border border-black/6 bg-white/72 p-5 dark:border-white/8 dark:bg-white/5"
    >
      <h2
        id={`brand-matches-${color.id}`}
        className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500"
      >
        Brands using a similar color
      </h2>
      <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
        Within the public brand-guidelines reference catalog, these are the closest matches to {color.hex.toUpperCase()}.
      </p>
      <ul className="mt-4 space-y-2">
        {matches.map((m) => (
          <li key={m.brand.slug}>
            <Link
              href={`/brands/${m.brand.slug}/`}
              className="group flex items-center gap-3 rounded-xl border border-black/8 bg-white px-3 py-2.5 transition hover:border-neutral-300 dark:border-white/10 dark:bg-neutral-950/40 dark:hover:border-white/30"
            >
              <span
                className="h-9 w-9 shrink-0 rounded-lg border border-black/10 dark:border-white/15"
                style={{ backgroundColor: m.color.hex }}
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {m.brand.name}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-slate-400">
                    {m.color.role}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {m.color.name} · {m.color.hex.toUpperCase()}
                </span>
              </div>
              <span className="text-xs text-slate-300 group-hover:text-neutral-500 dark:text-slate-600">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
