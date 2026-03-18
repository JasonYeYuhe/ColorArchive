"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ColorGrid } from "@/src/components/color-grid";
import { getFavoriteColorIds, subscribeToFavorites } from "@/src/lib/favorites";
import type { ColorRecord } from "@/src/types/color";

interface FavoritesPageProps {
  colors: readonly ColorRecord[];
}

export function FavoritesPage({ colors }: FavoritesPageProps) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    setFavoriteIds(getFavoriteColorIds());
    return subscribeToFavorites(setFavoriteIds);
  }, []);

  const favoriteColors = useMemo(
    () => favoriteIds.map((id) => colors.find((color) => color.id === id)).filter((color): color is ColorRecord => Boolean(color)),
    [colors, favoriteIds],
  );

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute left-0 top-10 h-48 w-48 rounded-full bg-rose-200/28 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-sky-200/24 blur-3xl" />
          <div className="relative mx-auto max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              Personal archive
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              Your saved colors
            </h1>

            <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-neutral-600 sm:text-lg">
              Favorites are stored locally in your browser. This keeps the project static while
              still giving you a reusable working set.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-black/6 bg-white/85 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.18em] text-neutral-400">Saved</div>
                <div className="mt-1 text-lg font-semibold text-neutral-950">
                  {favoriteColors.length} colors
                </div>
              </div>
              <Link
                href="/collections"
                className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Browse collections
              </Link>
              <Link
                href="/search"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Find more colors
              </Link>
            </div>
          </div>
        </section>

        {favoriteColors.length === 0 ? (
          <section className="rounded-[1.75rem] border border-black/6 bg-white/80 px-6 py-12 text-center shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-neutral-950">
              No saved colors yet
            </h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Use the Save button on archive cards, selected colors, or detail pages to build a
              personal color shelf.
            </p>
          </section>
        ) : (
          <ColorGrid colors={favoriteColors} />
        )}
      </div>
    </main>
  );
}
