"use client";

import Link from "next/link";
import { useMemo } from "react";
import { buildRecommendedColors } from "@/src/lib/color-recommendations";
import type { ColorRecord } from "@/src/types/color";

interface RecommendedColorsSectionProps {
  colors: readonly ColorRecord[];
  seedIds: string[];
  title: string;
  description: string;
}

export function RecommendedColorsSection({
  colors,
  seedIds,
  title,
  description,
}: RecommendedColorsSectionProps) {
  const recommendedColors = useMemo(
    () => buildRecommendedColors({ colors, seedIds, excludeIds: seedIds, limit: 8 }),
    [colors, seedIds],
  );

  if (recommendedColors.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
            Recommended next
          </div>
          <h2 className="mt-2 font-display text-2xl font-light tracking-[-0.03em] text-neutral-950">
            {title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">{description}</p>
        </div>
        <Link
          href="/all-colors"
          className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
        >
          Open search
        </Link>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {recommendedColors.map((color) => (
          <Link
            key={color.id}
            href={`/colors/${color.id}/`}
            className="overflow-hidden rounded-[1.3rem] border border-black/6 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]"
          >
            <div className="h-32 border-b border-black/6" style={{ backgroundColor: color.hex }} />
            <div className="p-4">
              <div className="text-base font-semibold tracking-[-0.02em] text-neutral-950">
                {color.name}
              </div>
              <div className="mt-1 text-sm text-neutral-500">{color.hex}</div>
              <div className="mt-2 text-xs uppercase tracking-[0.16em] text-neutral-400">
                {color.family} · H {color.hue}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
