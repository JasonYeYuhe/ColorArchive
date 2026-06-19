"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ShareLinkButton } from "@/src/components/share-link-button";
import { colors } from "@/src/data/colors";
import type { ColorRecord } from "@/src/types/color";

function uniqueSorted(values: readonly number[]) {
  return [...new Set(values)].sort((left, right) => left - right);
}

export function SpectrumExplorerPage() {
  const saturationBands = useMemo(
    () =>
      uniqueSorted(colors.map((color) => color.saturation)).map((saturation) => ({
        saturation,
        label:
          saturation <= 18
            ? "Muted"
            : saturation <= 34
              ? "Soft"
              : saturation <= 54
                ? "Clear"
                : "Vivid",
      })),
    [colors],
  );

  const lightnessBands = useMemo(() => uniqueSorted(colors.map((color) => color.lightness)).reverse(), [colors]);
  const hueBands = useMemo(() => uniqueSorted(colors.map((color) => color.hue)), [colors]);
  const [activeSaturation, setActiveSaturation] = useState<number>(saturationBands[2]?.saturation ?? 54);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);

  const spectrumRows = useMemo(
    () =>
      lightnessBands.map((lightness) => ({
        lightness,
        colors: hueBands.map((hue) =>
          colors.find(
            (color) =>
              color.hue === hue &&
              color.lightness === lightness &&
              color.saturation === activeSaturation,
          ) ?? null,
        ),
      })),
    [activeSaturation, colors, hueBands, lightnessBands],
  );

  useEffect(() => {
    const firstAvailableColor =
      spectrumRows.flatMap((row) => row.colors).find((color): color is ColorRecord => color !== null) ?? null;

    if (!firstAvailableColor) {
      setSelectedColorId(null);
      return;
    }

    if (!spectrumRows.flatMap((row) => row.colors).some((color) => color?.id === selectedColorId)) {
      setSelectedColorId(firstAvailableColor.id);
    }
  }, [selectedColorId, spectrumRows]);

  const selectedColor = useMemo(
    () =>
      spectrumRows
        .flatMap((row) => row.colors)
        .find((color): color is ColorRecord => color !== null && color.id === selectedColorId) ?? null,
    [selectedColorId, spectrumRows],
  );

  const activeBandLabel =
    saturationBands.find((band) => band.saturation === activeSaturation)?.label ?? "Active";

  const LIGHTNESS_NAMES: Record<number, string> = {
    98: "Veil", 94: "Whisper", 90: "Mist", 84: "Pearl",
    76: "Bloom", 68: "Silk", 60: "Tone", 54: "Radiant",
    48: "Core", 42: "Velvet", 34: "Dusk", 28: "Shadow",
    20: "Nocturne", 14: "Ink",
  };

  const hueNames = useMemo(() => {
    const map = new Map<number, string>();
    colors.forEach((c) => {
      if (!map.has(c.hue)) {
        map.set(c.hue, c.name.split(" ")[0]);
      }
    });
    return map;
  }, [colors]);

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="relative mx-auto max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              Spectrum explorer
            </div>

            <h1 className="font-display max-w-3xl text-4xl font-light tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              Browse the archive as a spectrum
            </h1>

            <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-neutral-600 sm:text-lg">
              Instead of cards, this view arranges the archive as a hue-by-lightness matrix. Switch
              saturation bands to see how the spectrum tightens or opens across the full set.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-black/6 bg-white/85 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.18em] text-neutral-400">Mode</div>
                <div className="mt-1 text-lg font-semibold text-neutral-950">Matrix view</div>
              </div>
              <div className="rounded-2xl border border-black/6 bg-white/85 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.18em] text-neutral-400">Hue columns</div>
                <div className="mt-1 text-lg font-semibold text-neutral-950">{hueBands.length}</div>
              </div>
              <div className="rounded-2xl border border-black/6 bg-white/85 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.18em] text-neutral-400">Light rows</div>
                <div className="mt-1 text-lg font-semibold text-neutral-950">{lightnessBands.length}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-black/6 bg-white/78 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.04)] sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Saturation band
              </div>
              <div className="mt-1 text-sm text-neutral-600">
                Current band: {activeBandLabel} ({activeSaturation}%)
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {saturationBands.map((band) => {
                const isActive = band.saturation === activeSaturation;

                return (
                  <button
                    key={band.saturation}
                    type="button"
                    onClick={() => setActiveSaturation(band.saturation)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-neutral-950 text-white"
                        : "border border-black/8 bg-white text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    {band.label}
                    <span className={`ml-2 text-xs ${isActive ? "text-white/70" : "text-neutral-400"}`}>
                      {band.saturation}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)]">
          <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-neutral-950">
                Hue × Lightness matrix
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Each tile opens the corresponding archive detail page.
              </p>
            </div>
            <Link
              href="/all-colors/"
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Dense archive
            </Link>
          </div>

          <div className="overflow-x-auto rounded-[1.75rem] border border-black/6 bg-white/78 p-3 shadow-[0_18px_48px_rgba(15,23,42,0.04)] sm:p-4">
            <div
              className="grid gap-1.5"
              style={{
                gridTemplateColumns: `5rem repeat(${hueBands.length}, minmax(2.75rem, 1fr))`,
              }}
            >
              <div />
              {hueBands.map((hue) => (
                <div
                  key={`hue-${hue}`}
                  className="overflow-hidden text-center text-[9px] font-medium uppercase tracking-[0.12em] text-neutral-400 truncate px-0.5"
                  title={`${hueNames.get(hue) ?? ""} (${hue}°)`}
                >
                  {hueNames.get(hue) ?? hue}
                </div>
              ))}

              {spectrumRows.map((row) => (
                <div key={`row-${row.lightness}`} className="contents">
                  <div className="flex flex-col items-center justify-center rounded-xl bg-neutral-50 px-1 py-1 text-center">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-600 leading-tight">
                      {LIGHTNESS_NAMES[row.lightness] ?? `L${row.lightness}`}
                    </span>
                    <span className="text-[9px] text-neutral-400 leading-tight">{row.lightness}</span>
                  </div>
                  {row.colors.map((color, index) =>
                    color ? (
                      <button
                        key={`${row.lightness}-${color.id}`}
                        type="button"
                        onClick={() => setSelectedColorId(color.id)}
                        className={`group relative overflow-visible rounded-xl border bg-white transition ${
                          color.id === selectedColorId
                            ? "border-neutral-950/18 ring-2 ring-neutral-900/10"
                            : "border-black/6 hover:border-neutral-950/12"
                        }`}
                        aria-label={`Inspect ${color.name}`}
                      >
                        <div
                          className="h-16 overflow-hidden rounded-[0.6rem] transition duration-200 group-hover:scale-[1.03]"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-black/8 bg-white px-2.5 py-1.5 text-center shadow-lg group-hover:block">
                          <div className="text-[11px] font-semibold text-neutral-950">{color.name}</div>
                          <div className="text-[10px] text-neutral-500">{color.hex}</div>
                        </div>
                      </button>
                    ) : (
                      <div
                        key={`${row.lightness}-empty-${hueBands[index]}`}
                        className="h-16 rounded-xl border border-dashed border-black/6 bg-neutral-50/60"
                      />
                    ),
                  )}
                </div>
              ))}
            </div>
          </div>
          </div>

          <aside className="rounded-[1.75rem] border border-black/6 bg-white/80 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            {selectedColor ? (
              <div className="space-y-5">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                    Selected spectrum point
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                    {selectedColor.name}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    This point sits at hue {selectedColor.hue}, saturation {selectedColor.saturation}%, and
                    lightness {selectedColor.lightness}% within the current matrix band.
                  </p>
                </div>

                <div
                  className="h-44 rounded-[1.5rem] border border-black/6"
                  style={{ backgroundColor: selectedColor.hex }}
                  aria-hidden="true"
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">Hex</div>
                    <div className="mt-1 font-medium text-neutral-950">{selectedColor.hex}</div>
                  </div>
                  <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">RGB</div>
                    <div className="mt-1 font-medium text-neutral-950">{selectedColor.rgb}</div>
                  </div>
                  <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3 sm:col-span-2">
                    <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">HSL</div>
                    <div className="mt-1 font-medium text-neutral-950">{selectedColor.hsl}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <ShareLinkButton href={`/colors/${selectedColor.id}/`} />
                  <Link
                    href={`/colors/${selectedColor.id}/`}
                    className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
                  >
                    Open detail
                  </Link>
                  <Link
                    href="/all-colors/"
                    className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
                  >
                    Surprise me
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-sm text-neutral-500">No spectrum point selected.</div>
            )}
          </aside>
        </section>

        <section className="rounded-[1.75rem] border border-black/6 bg-neutral-950 p-5 text-white shadow-[0_18px_48px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white dark:text-neutral-950">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-white/40 dark:text-neutral-400">
            Ready for production
          </div>
          <p className="mt-2 text-lg font-semibold tracking-[-0.02em]">
            Take these colors into your project
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60 dark:text-neutral-500">
            ColorArchive Pro turns archive colors into CSS variables, Figma tokens, Tailwind config,
            and Procreate swatches — structured for real projects.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/pro/"
              className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-950 transition hover:bg-neutral-200 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800"
            >
              Upgrade to Pro
            </Link>
            <Link
              href="/free-resources/"
              className="rounded-full border border-white/16 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/80 transition hover:border-white/30 hover:text-white dark:border-black/16 dark:text-neutral-600 dark:hover:border-black/30 dark:hover:text-neutral-950"
            >
              Free resources
            </Link>
            <Link
              href="/collections/"
              className="rounded-full border border-white/16 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/80 transition hover:border-white/30 hover:text-white dark:border-black/16 dark:text-neutral-600 dark:hover:border-black/30 dark:hover:text-neutral-950"
            >
              View collections
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
