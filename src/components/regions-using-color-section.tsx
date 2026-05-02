"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  findRegionsNearColor,
  type RegionColorMatch,
} from "@/src/lib/color-region-matches";
import type { ColorRecord } from "@/src/types/color";

interface Props {
  color: ColorRecord;
}

/**
 * "Cultures using a similar color" — companion to
 * <BrandsUsingColorSection />. Same algorithm shape, different
 * catalog. Lets a single archive color page jump out into both the
 * brand catalog AND the cultural-palette catalog without doubling
 * code paths or visual weight.
 */
export function RegionsUsingColorSection({ color }: Props) {
  const matches = useMemo<RegionColorMatch[]>(
    () => findRegionsNearColor(color.hex, 3),
    [color.hex],
  );

  if (matches.length === 0) return null;

  return (
    <section
      aria-labelledby={`region-matches-${color.id}`}
      className="rounded-[1.6rem] border border-black/6 bg-white/72 p-5 dark:border-white/8 dark:bg-white/5"
    >
      <h2
        id={`region-matches-${color.id}`}
        className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500"
      >
        Cultures using a similar color
      </h2>
      <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
        From the cultural-palette catalog, these regions feature a color close to {color.hex.toUpperCase()}.
      </p>
      <ul className="mt-4 space-y-2">
        {matches.map((m) => (
          <li key={m.region.slug}>
            <Link
              href={`/regions/${m.region.slug}/`}
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
                    {m.region.name}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-slate-400">
                    {m.color.name}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {m.color.hex.toUpperCase()} · {m.color.source}
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
