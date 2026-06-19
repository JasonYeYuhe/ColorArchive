"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FavoriteButton } from "@/src/components/favorite-button";
import { ShareLinkButton } from "@/src/components/share-link-button";
import { sortColors } from "@/src/lib/color-utils";
import type { ColorRecord } from "@/src/types/color";
import { colors } from "@/src/data/colors";

function pickRandomColor(colors: readonly ColorRecord[]) {
  return colors[Math.floor(Math.random() * colors.length)] ?? null;
}

export function RandomDiscoveryPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id");
  const [selectedColorId, setSelectedColorId] = useState<string | null>(
    initialId && colors.some((color) => color.id === initialId) ? initialId : colors[0]?.id ?? null,
  );

  const selectedColor = useMemo(
    () => colors.find((color) => color.id === selectedColorId) ?? colors[0] ?? null,
    [colors, selectedColorId],
  );

  useEffect(() => {
    if (!selectedColor) {
      return;
    }

    router.replace(`${pathname}?id=${encodeURIComponent(selectedColor.id)}`, { scroll: false });
  }, [pathname, router, selectedColor]);

  const relatedColors = useMemo(() => {
    if (!selectedColor) {
      return [];
    }

    const familyPool = sortColors(
      colors.filter((color) => color.family === selectedColor.family),
      "hue",
    );

    return familyPool.filter((color) => color.id !== selectedColor.id).slice(0, 6);
  }, [colors, selectedColor]);

  const handleRandomize = () => {
    const nextColor = pickRandomColor(colors);
    if (nextColor) {
      setSelectedColorId(nextColor.id);
    }
  };

  if (!selectedColor) {
    return null;
  }

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="relative mx-auto max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              Random discovery
            </div>

            <h1 className="max-w-3xl font-display text-4xl font-light tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              Surprise me with color
            </h1>

            <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-neutral-600 sm:text-lg">
              Jump to a random point in the archive, then branch into related colors or open the full
              detail page when something clicks.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleRandomize}
                className="rounded-full border border-neutral-950/10 bg-neutral-950 px-4 py-2 font-medium text-white transition hover:bg-neutral-800"
              >
                Randomize
              </button>
              <FavoriteButton colorId={selectedColor.id} />
              <ShareLinkButton href={`/surprise?id=${selectedColor.id}`} />
              <Link
                href={`/colors/${selectedColor.id}/`}
                className="rounded-full border border-black/8 bg-white/88 px-4 py-2 font-medium text-neutral-700 transition hover:bg-white"
              >
                Open detail
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)]">
          <div className="overflow-hidden rounded-[1.8rem] border border-black/6 bg-white/82 shadow-[0_20px_56px_rgba(15,23,42,0.06)]">
            <div
              className="relative h-72 border-b border-black/6 sm:h-80"
              style={{ backgroundColor: selectedColor.hex }}
              aria-hidden="true"
            />
            <div className="space-y-5 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-neutral-400">Selected</div>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-neutral-950">
                    {selectedColor.name}
                  </h2>
                  <p className="mt-2 text-sm text-neutral-500">
                    {selectedColor.family} family · Hue {selectedColor.hue}
                  </p>
                </div>
                <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3 text-right">
                  <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">Hex</div>
                  <div className="mt-1 text-xl font-semibold tracking-[0.04em] text-neutral-950">
                    {selectedColor.hex}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">RGB</div>
                  <div className="mt-1 font-medium text-neutral-950">{selectedColor.rgb}</div>
                </div>
                <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">HSL</div>
                  <div className="mt-1 font-medium text-neutral-950">{selectedColor.hsl}</div>
                </div>
                <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">Balance</div>
                  <div className="mt-1 font-medium text-neutral-950">
                    S {selectedColor.saturation}% · L {selectedColor.lightness}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-[1.8rem] border border-black/6 bg-white/78 p-5 shadow-[0_20px_56px_rgba(15,23,42,0.05)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  Keep exploring
                </div>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-neutral-950">
                  Related colors
                </h3>
              </div>
              <Link
                href="/spectrum/"
                className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
              >
                Spectrum
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {relatedColors.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setSelectedColorId(color.id)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-black/6 bg-white px-3 py-3 text-left transition hover:bg-neutral-50"
                >
                  <span
                    className="h-11 w-11 rounded-2xl border border-black/6 shadow-sm"
                    style={{ backgroundColor: color.hex }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-neutral-950">{color.name}</span>
                    <span className="mt-1 block text-sm text-neutral-500">
                      {color.hex} · {color.hsl}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
