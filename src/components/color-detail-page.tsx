"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FavoriteButton } from "@/src/components/favorite-button";
import { ShareLinkButton } from "@/src/components/share-link-button";
import { addRecentColor, getRecentColorIds, subscribeToRecentColors } from "@/src/lib/recent-colors";
import { getWcagContrast, getTonalStrip } from "@/src/lib/color-utils";
import type { ColorRecord } from "@/src/types/color";

interface ColorDetailPageProps {
  allColors: readonly ColorRecord[];
  color: ColorRecord;
  relatedColors: readonly ColorRecord[];
  nearestColors: readonly ColorRecord[];
  analogousColors: readonly ColorRecord[];
  complementaryColor: ColorRecord | null;
  lighterCompanion: ColorRecord | null;
  darkerCompanion: ColorRecord | null;
}

interface PaletteEntry {
  label: string;
  value: ColorRecord;
}

function CopyButton({ value, label }: { value: string; label: string }) {
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

function RecommendationLink({
  color,
  eyebrow,
}: {
  color: ColorRecord;
  eyebrow: string;
}) {
  return (
    <Link
      href={`/colors/${color.id}/`}
      className="group rounded-[1.45rem] border border-black/6 bg-white/84 p-3 transition hover:-translate-y-0.5 hover:border-black/10 hover:shadow-[0_18px_36px_rgba(15,23,42,0.06)]"
    >
      <div
        className="h-24 rounded-[1.1rem] border border-black/6"
        style={{ backgroundColor: color.hex }}
        aria-hidden="true"
      />
      <div className="mt-3 text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">
        {eyebrow}
      </div>
      <div className="mt-1 truncate text-base font-semibold tracking-[-0.02em] text-neutral-950">
        {color.name}
      </div>
      <div className="mt-1 text-sm text-neutral-500">
        {color.hex} · {color.hsl}
      </div>
    </Link>
  );
}

function buildPaletteExport(entries: readonly PaletteEntry[]) {
  return entries.map((entry) => `${entry.label}: ${entry.value.name} ${entry.value.hex}`).join("\n");
}

function buildCssVariableExport(entries: readonly PaletteEntry[]) {
  return entries
    .map((entry) => {
      const slug = entry.label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      return `--colorarchive-${slug}: ${entry.value.hex};`;
    })
    .join("\n");
}

export function ColorDetailPage({
  allColors,
  color,
  relatedColors,
  nearestColors,
  analogousColors,
  complementaryColor,
  lighterCompanion,
  darkerCompanion,
}: ColorDetailPageProps) {
  const [recentColorIds, setRecentColorIds] = useState<string[]>([]);

  useEffect(() => {
    addRecentColor(color.id);
    setRecentColorIds(getRecentColorIds());
    return subscribeToRecentColors(setRecentColorIds);
  }, [color.id]);

  const paletteMoves = [
    lighterCompanion
      ? {
          label: "Lighter companion",
          value: lighterCompanion,
        }
      : null,
    darkerCompanion
      ? {
          label: "Darker companion",
          value: darkerCompanion,
        }
      : null,
    complementaryColor
      ? {
          label: "Complementary counterpoint",
          value: complementaryColor,
        }
      : null,
    ...analogousColors.map((analogousColor, index) => ({
      label: index === 0 ? "Analogous lead" : "Analogous echo",
      value: analogousColor,
    })),
  ]
    .filter(
      (
        item,
      ): item is {
        label: string;
        value: ColorRecord;
      } => Boolean(item),
    )
    .reduce<{ label: string; value: ColorRecord }[]>((items, item) => {
      if (items.some((existingItem) => existingItem.value.id === item.value.id)) {
        return items;
      }

      items.push(item);
      return items;
    }, []);
  const exportPalette = [{ label: "Base", value: color }, ...paletteMoves];
  const paletteExport = buildPaletteExport(exportPalette);
  const cssVariableExport = buildCssVariableExport(exportPalette);
  const recentTrail = recentColorIds
    .filter((id) => id !== color.id)
    .map((id) => allColors.find((entry) => entry.id === id))
    .filter((entry): entry is ColorRecord => Boolean(entry))
    .slice(0, 4);

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-black/6 bg-white/78 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          {(() => {
            const isLight = color.lightness > 65;
            return (
              <div
                className="relative h-72 border-b border-black/6 sm:h-80"
                style={{ backgroundColor: color.hex }}
                aria-hidden="true"
              >
                <div className={`absolute inset-0 ${isLight ? "bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_40%,rgba(0,0,0,0.04))]" : "bg-[linear-gradient(135deg,rgba(255,255,255,0.14),transparent_45%,rgba(17,24,39,0.08))]"}`} />
                <div className={`absolute left-6 top-6 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] backdrop-blur-md ${isLight ? "border border-black/10 bg-black/6 text-neutral-700" : "border border-white/30 bg-white/18 text-white/92"}`}>
                  Color detail
                </div>
                <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <div className={`text-4xl font-semibold tracking-[-0.04em] sm:text-5xl ${isLight ? "text-neutral-900" : "text-white"}`}>
                      {color.name}
                    </div>
                    <div className={`mt-3 text-sm uppercase tracking-[0.22em] ${isLight ? "text-neutral-500" : "text-white/75"}`}>
                      {color.family} · Hue {color.hue}
                    </div>
                  </div>
                  <div className={`rounded-2xl px-4 py-3 text-right backdrop-blur-md ${isLight ? "border border-black/10 bg-white/60 text-neutral-900" : "border border-white/24 bg-black/16 text-white"}`}>
                    <div className={`text-xs uppercase tracking-[0.16em] ${isLight ? "text-neutral-500" : "text-white/70"}`}>Hex</div>
                    <div className="mt-1 text-2xl font-semibold tracking-[0.04em]">{color.hex}</div>
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)]">
            <div className="space-y-5">
              {(() => {
                const wcag = getWcagContrast(color.hue, color.saturation, color.lightness);
                const gradeColors = {
                  "AA": "text-emerald-700 bg-emerald-50 border-emerald-200",
                  "AA Large": "text-amber-700 bg-amber-50 border-amber-200",
                  "Fail": "text-red-600 bg-red-50 border-red-200",
                } as const;
                return (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">RGB</div>
                      <div className="mt-1 font-medium text-neutral-950">{color.rgb}</div>
                    </div>
                    <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">HSL</div>
                      <div className="mt-1 font-medium text-neutral-950">{color.hsl}</div>
                    </div>
                    <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">Metrics</div>
                      <div className="mt-1 font-medium text-neutral-950">
                        S {color.saturation}% · L {color.lightness}%
                      </div>
                    </div>
                    <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">Contrast (WCAG)</div>
                      <div className="mt-2 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-neutral-500">on white</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-neutral-950">{wcag.vsWhite}:1</span>
                            <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${gradeColors[wcag.whiteGrade]}`}>{wcag.whiteGrade}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-neutral-500">on black</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-neutral-950">{wcag.vsBlack}:1</span>
                            <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${gradeColors[wcag.blackGrade]}`}>{wcag.blackGrade}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="flex flex-wrap gap-2">
                <CopyButton label="hex" value={color.hex} />
                <CopyButton label="rgb" value={color.rgb} />
                <CopyButton label="hsl" value={color.hsl} />
                <CopyButton label="palette" value={paletteExport} />
                <CopyButton label="CSS vars" value={cssVariableExport} />
                <FavoriteButton colorId={color.id} />
                <ShareLinkButton href={`/colors/${color.id}/`} />
                <Link
                  href="/recent"
                  className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
                >
                  Recent trail
                </Link>
              </div>

              <div className="rounded-[1.6rem] border border-black/6 bg-white/72 p-5">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  Archive context
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
                  This entry lives in the {color.family.toLowerCase()} family and sits at hue{" "}
                  {color.hue} with {color.saturation}% saturation and {color.lightness}% lightness.
                  Use it as a stable reference point inside the broader ColorArchive system.
                </p>
              </div>

              {(() => {
                const tonalStrip = getTonalStrip(allColors, color);
                if (tonalStrip.length < 2) return null;
                return (
                  <div className="rounded-[1.6rem] border border-black/6 bg-white/72 p-5">
                    <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                      Tonal strip
                    </div>
                    <p className="mt-2 text-sm leading-6 text-neutral-500">
                      All lightness levels at this hue and saturation. Click any to navigate.
                    </p>
                    <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1">
                      {tonalStrip.map((entry) => (
                        <Link
                          key={entry.id}
                          href={`/colors/${entry.id}/`}
                          title={`${entry.name} ${entry.hex}`}
                          className={`relative flex-shrink-0 rounded-xl border transition hover:-translate-y-0.5 ${
                            entry.id === color.id
                              ? "border-neutral-950/20 ring-2 ring-neutral-900/14"
                              : "border-black/8 hover:border-black/14"
                          }`}
                          style={{ backgroundColor: entry.hex, width: "2.75rem", height: "3.5rem" }}
                          aria-label={entry.name}
                        >
                          {entry.id === color.id && (
                            <span className="absolute -bottom-2 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-neutral-900" />
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="rounded-[1.6rem] border border-black/6 bg-white/72 p-5">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  Palette moves
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
                  Instead of stopping at one swatch, use nearby, opposite, and tonal neighbors to
                  branch into a broader palette.
                </p>

                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {paletteMoves.map((item) => (
                    <RecommendationLink key={item.value.id} color={item.value} eyebrow={item.label} />
                  ))}
                </div>

                <div className="mt-5 rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4">
                  <div className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
                    Export preview
                  </div>
                  <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-neutral-600">
                    {paletteExport}
                  </pre>
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-black/6 bg-white/72 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                      Nearest neighbors
                    </div>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
                      The closest archive matches by hue, saturation, and lightness.
                    </p>
                  </div>
                  <Link
                    href={`/search?hex=${encodeURIComponent(color.hex)}`}
                    className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
                  >
                    Search by hex
                  </Link>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {nearestColors.map((nearColor) => (
                    <RecommendationLink key={nearColor.id} color={nearColor} eyebrow="Nearby match" />
                  ))}
                </div>
              </div>

              {recentTrail.length > 0 ? (
                <div className="rounded-[1.6rem] border border-black/6 bg-white/72 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                        Recent trail
                      </div>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
                        Colors you viewed recently in this browser session.
                      </p>
                    </div>
                    <Link
                      href="/recent"
                      className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
                    >
                      Open recent
                    </Link>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {recentTrail.map((recentColor) => (
                      <RecommendationLink key={recentColor.id} color={recentColor} eyebrow="Recently viewed" />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <aside className="rounded-[1.8rem] border border-black/6 bg-white/78 p-5 shadow-[0_20px_56px_rgba(15,23,42,0.05)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                    Related colors
                  </div>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-neutral-950">
                    More from {color.family}
                  </h2>
                </div>
                <Link
                  href="/search"
                  className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
                >
                  Search
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {relatedColors.map((relatedColor) => (
                  <Link
                    key={relatedColor.id}
                    href={`/colors/${relatedColor.id}/`}
                    className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                      relatedColor.id === color.id
                        ? "border-neutral-950/12 bg-neutral-950 text-white"
                        : "border-black/6 bg-white hover:bg-neutral-50"
                    }`}
                  >
                    <span
                      className="h-11 w-11 rounded-2xl border border-black/6 shadow-sm"
                      style={{ backgroundColor: relatedColor.hex }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate font-medium ${
                          relatedColor.id === color.id ? "text-white" : "text-neutral-950"
                        }`}
                      >
                        {relatedColor.name}
                      </span>
                      <span
                        className={`mt-1 block text-sm ${
                          relatedColor.id === color.id ? "text-white/70" : "text-neutral-500"
                        }`}
                      >
                        {relatedColor.hex} · {relatedColor.hsl}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
