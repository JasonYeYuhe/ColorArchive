"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getFavoriteColorIds, subscribeToFavorites } from "@/src/lib/favorites";
import { getRecentColorIds, subscribeToRecentColors } from "@/src/lib/recent-colors";
import type { ColorRecord } from "@/src/types/color";

interface LocalArchiveHubProps {
  colors: readonly ColorRecord[];
}

function swatchPreviewClass(index: number) {
  if (index === 0) {
    return "ring-2 ring-white/80";
  }

  return "ring-1 ring-black/8";
}

export function LocalArchiveHub({ colors }: LocalArchiveHubProps) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    setFavoriteIds(getFavoriteColorIds());
    setRecentIds(getRecentColorIds());

    const unsubscribeFavorites = subscribeToFavorites(setFavoriteIds);
    const unsubscribeRecent = subscribeToRecentColors(setRecentIds);

    return () => {
      unsubscribeFavorites();
      unsubscribeRecent();
    };
  }, []);

  const favoriteColors = useMemo(
    () =>
      favoriteIds
        .map((id) => colors.find((color) => color.id === id))
        .filter((color): color is ColorRecord => Boolean(color))
        .slice(0, 4),
    [colors, favoriteIds],
  );

  const recentColors = useMemo(
    () =>
      recentIds
        .map((id) => colors.find((color) => color.id === id))
        .filter((color): color is ColorRecord => Boolean(color))
        .slice(0, 4),
    [colors, recentIds],
  );

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-[1.75rem] border border-black/6 bg-white/78 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.04)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Continue browsing
            </div>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-neutral-950">
              Recent trail
            </h2>
          </div>
          <div className="rounded-full border border-black/6 bg-neutral-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
            {recentIds.length} tracked
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          Resume from the colors you inspected most recently. This trail stays local to the browser.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {recentColors.length > 0 ? (
            recentColors.map((color, index) => (
              <Link
                key={color.id}
                href={`/colors/${color.id}/`}
                className="group flex items-center gap-3 rounded-2xl border border-black/6 bg-white px-3 py-2 transition hover:bg-neutral-50"
              >
                <span
                  className={`h-8 w-8 rounded-full border border-black/6 ${swatchPreviewClass(index)}`}
                  style={{ backgroundColor: color.hex }}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-neutral-900">{color.name}</span>
              </Link>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-black/8 bg-neutral-50 px-4 py-4 text-sm text-neutral-500">
              Open a few color detail pages and the trail appears here.
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/recent/"
            className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Open recent
          </Link>
          <Link
            href="/all-colors"
            className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            Search archive
          </Link>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-black/6 bg-white/78 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.04)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Working set
            </div>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-neutral-950">
              Favorites shelf
            </h2>
          </div>
          <div className="rounded-full border border-black/6 bg-neutral-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
            {favoriteIds.length} saved
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          Keep a compact palette of colors worth revisiting. This remains local and static.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {favoriteColors.length > 0 ? (
            favoriteColors.map((color, index) => (
              <Link
                key={color.id}
                href={`/colors/${color.id}/`}
                className="group flex items-center gap-3 rounded-2xl border border-black/6 bg-white px-3 py-2 transition hover:bg-neutral-50"
              >
                <span
                  className={`h-8 w-8 rounded-full border border-black/6 ${swatchPreviewClass(index)}`}
                  style={{ backgroundColor: color.hex }}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-neutral-900">{color.name}</span>
              </Link>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-black/8 bg-neutral-50 px-4 py-4 text-sm text-neutral-500">
              Save colors from cards or detail pages to build a reusable shelf.
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/favorites/"
            className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Open favorites
          </Link>
          <Link
            href="/collections/"
            className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            Browse collections
          </Link>
        </div>
      </div>
    </section>
  );
}
