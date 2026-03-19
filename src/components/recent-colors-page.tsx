"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ColorGrid } from "@/src/components/color-grid";
import { RecommendedColorsSection } from "@/src/components/recommended-colors-section";
import { clearRecentColors, getRecentColorIds, subscribeToRecentColors } from "@/src/lib/recent-colors";
import type { ColorRecord } from "@/src/types/color";

interface RecentColorsPageProps {
  colors: readonly ColorRecord[];
}

function CopyButton({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
    >
      {copied ? `${label} copied` : `Copy ${label}`}
    </button>
  );
}

export function RecentColorsPage({ colors }: RecentColorsPageProps) {
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    setRecentIds(getRecentColorIds());
    return subscribeToRecentColors(setRecentIds);
  }, []);

  const recentColors = useMemo(
    () =>
      recentIds
        .map((id) => colors.find((color) => color.id === id))
        .filter((color): color is ColorRecord => Boolean(color)),
    [colors, recentIds],
  );

  const paletteExport = useMemo(
    () => recentColors.map((color, index) => `${index + 1}. ${color.name} ${color.hex}`).join("\n"),
    [recentColors],
  );
  const jsonExport = useMemo(
    () =>
      JSON.stringify(
        recentColors.map((color) => ({
          id: color.id,
          name: color.name,
          hex: color.hex,
          rgb: color.rgb,
          hsl: color.hsl,
          family: color.family,
          hue: color.hue,
          saturation: color.saturation,
          lightness: color.lightness,
        })),
        null,
        2,
      ),
    [recentColors],
  );

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute left-0 top-8 h-52 w-52 rounded-full bg-sky-200/28 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-violet-200/24 blur-3xl" />
          <div className="relative mx-auto max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              Recent trail
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              Your recently viewed colors
            </h1>
            <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-neutral-600 sm:text-lg">
              This page keeps a local trail of the colors you opened while browsing the archive. It
              makes it easier to resume exploration without an account or backend.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-black/6 bg-white/85 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.18em] text-neutral-400">Recent</div>
                <div className="mt-1 text-lg font-semibold text-neutral-950">
                  {recentColors.length} colors
                </div>
              </div>
              {recentColors.length > 0 ? (
                <>
                  <CopyButton label="palette" value={paletteExport} />
                  <CopyButton label="JSON" value={jsonExport} />
                  <button
                    type="button"
                    onClick={() => clearRecentColors()}
                    className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                  >
                    Clear recent
                  </button>
                </>
              ) : null}
              <Link
                href="/favorites/"
                className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Favorites
              </Link>
              <Link
                href="/search"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Search archive
              </Link>
            </div>
          </div>
        </section>

        {recentColors.length === 0 ? (
          <section className="rounded-[1.75rem] border border-black/6 bg-white/80 px-6 py-12 text-center shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-neutral-950">
              No recent colors yet
            </h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Open a color detail page or inspect colors on the archive to build a local recent
              trail.
            </p>
          </section>
        ) : (
          <>
            <RecommendedColorsSection
              colors={colors}
              seedIds={recentIds}
              title="Keep exploring from your recent trail"
              description="These suggestions lean on the families and tonal jumps you opened most recently, so you can branch naturally instead of restarting from the full archive."
            />

            <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Recent export preview
              </div>
              <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4 text-sm leading-6 text-neutral-600">
                {paletteExport}
              </pre>
              <div className="mt-4 text-xs uppercase tracking-[0.16em] text-neutral-400">
                JSON export is also available from the action row above.
              </div>
            </section>

            <ColorGrid colors={recentColors} />
          </>
        )}
      </div>
    </main>
  );
}
