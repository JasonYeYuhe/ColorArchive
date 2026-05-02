"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FavoriteButton } from "@/src/components/favorite-button";
import { ShareLinkButton, ShareOnXButton } from "@/src/components/share-link-button";
import { PinterestSaveButton } from "@/src/components/pinterest-save-button";
import { SaveToProjectButton } from "@/src/components/save-to-project";
import { SendToTool } from "@/src/components/send-to-tool";
import { StickyColorBar } from "@/src/components/sticky-color-bar";
import { useLocale } from "@/src/components/locale-provider";
import {
  addManyToPalette,
  addToPalette,
  getPaletteIds,
  MAX_SIZE,
  subscribeToPalette,
} from "@/src/lib/palette-builder";
import { addRecentColor, getRecentColorIds, subscribeToRecentColors } from "@/src/lib/recent-colors";
import { getWcagContrast, getTonalStrip, hexToRgb, rgbToCmyk } from "@/src/lib/color-utils";
import { simulateColorBlindness, hexToRgbCB, rgbToHexCB } from "@/src/lib/colorblind";
import type { WcagPairing } from "@/src/lib/color-utils";
import { getFamilySlug } from "@/src/lib/color-family-pages";
import type { ColorRecord } from "@/src/types/color";
import { getColorPsychology } from "@/src/data/color-psychology";
import { ColorOriginsSection } from "@/src/components/color-origins-section";
import { BrandsUsingColorSection } from "@/src/components/brands-using-color-section";
import { useAuth } from "@/src/components/auth-provider";
import { withSvgWatermark } from "@/src/lib/export-watermark";
import { LogToJournalButton } from "@/src/components/log-to-journal-button";

interface ColorDetailPageProps {
  allColors: readonly ColorRecord[];
  color: ColorRecord;
  relatedColors: readonly ColorRecord[];
  nearestColors: readonly ColorRecord[];
  analogousColors: readonly ColorRecord[];
  triadicColors: readonly ColorRecord[];
  splitCompColors: readonly ColorRecord[];
  complementaryColor: ColorRecord | null;
  lighterCompanion: ColorRecord | null;
  darkerCompanion: ColorRecord | null;
  wcagPairings: WcagPairing[];
  usedInCollections: { id: string; title: string }[];
}

interface PaletteEntry {
  label: string;
  value: ColorRecord;
}

function DownloadSwatchButton({ color }: { color: ColorRecord }) {
  const { tier } = useAuth();
  function handleDownload() {
    const rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
<rect width="400" height="240" fill="${color.hex}"/>
<rect y="240" width="400" height="60" fill="#fafaf9"/>
<text x="200" y="268" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" font-weight="600" fill="#1a1a1a">${color.name}</text>
<text x="200" y="288" text-anchor="middle" font-family="monospace" font-size="12" fill="#666">${color.hex}</text>
</svg>`;
    const svg = withSvgWatermark(rawSvg, tier);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${color.id}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <button
      type="button"
      onClick={handleDownload}
      className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
    >
      SVG
    </button>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const { t } = useLocale();
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
      {copied ? `${label} ${t("colorDetail.copiedState")}` : `${t("colorDetail.copyAction")} ${label}`}
    </button>
  );
}

function PaletteAddButton({ colorId }: { colorId: string }) {
  const { t } = useLocale();
  const [paletteIds, setPaletteIds] = useState<string[]>([]);

  useEffect(() => {
    setPaletteIds(getPaletteIds());
    return subscribeToPalette(setPaletteIds);
  }, []);

  const inPalette = paletteIds.includes(colorId);
  const isFull = paletteIds.length >= MAX_SIZE;

  return (
    <button
      type="button"
      onClick={() => addToPalette(colorId)}
      disabled={inPalette || isFull}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] transition ${
        inPalette
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : isFull
            ? "cursor-not-allowed border-black/8 bg-neutral-50 text-neutral-300"
            : "border-black/8 bg-white text-neutral-600 hover:bg-neutral-950 hover:text-white"
      }`}
    >
      {inPalette ? t("colorDetail.inPalette") : isFull ? t("colorDetail.paletteFull") : t("colorDetail.addToPalette")}
    </button>
  );
}

function PaletteBundleButton({
  colorIds,
  label,
}: {
  colorIds: string[];
  label: string;
}) {
  const { t } = useLocale();
  const [paletteIds, setPaletteIds] = useState<string[]>([]);

  useEffect(() => {
    setPaletteIds(getPaletteIds());
    return subscribeToPalette(setPaletteIds);
  }, []);

  const addableIds = colorIds.filter((id) => !paletteIds.includes(id));
  const noCapacity = paletteIds.length >= MAX_SIZE;

  return (
    <button
      type="button"
      onClick={() => addManyToPalette(colorIds)}
      disabled={addableIds.length === 0 || noCapacity}
      className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-300"
    >
      {addableIds.length === 0 ? t("colorDetail.alreadySaved") : noCapacity ? t("colorDetail.paletteFull") : label}
    </button>
  );
}

function RecommendationCard({
  color,
  eyebrow,
}: {
  color: ColorRecord;
  eyebrow: string;
}) {
  return (
    <article className="rounded-[1.45rem] border border-black/6 bg-white/84 p-3 transition hover:-translate-y-0.5 hover:border-black/10 hover:shadow-[0_18px_36px_rgba(15,23,42,0.06)]">
      <Link href={`/colors/${color.id}/`} className="group block">
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
      <div className="mt-3">
        <PaletteAddButton colorId={color.id} />
      </div>
    </article>
  );
}

const AI_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.colorarchive.org";

interface AiName { en: string; zh: string; description: string; }

function AiColorNaming({ color }: { color: ColorRecord }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [names, setNames] = useState<AiName[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => { clearTimeout(copiedTimerRef.current); }, []);

  const handleGenerate = async () => {
    setState("loading");
    try {
      const res = await fetch(`${AI_URL}/ai/name-color`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hex: color.hex, name: color.name, hsl: color.hsl, family: color.family }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setNames(data.names ?? []);
      setState("done");
    } catch {
      setState("error");
    }
  };

  const handleCopy = (idx: number, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx);
      copiedTimerRef.current = setTimeout(() => setCopiedIdx(null), 1500);
    });
  };

  return (
    <div className="rounded-[1.6rem] border border-black/6 bg-white/72 p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
          AI Color Names
        </h2>
        {state !== "done" && (
          <button
            onClick={handleGenerate}
            disabled={state === "loading"}
            className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white disabled:opacity-50"
          >
            {state === "loading" ? (
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                Generating…
              </span>
            ) : (
              "✦ Generate"
            )}
          </button>
        )}
      </div>

      {state === "idle" && (
        <p className="text-xs text-neutral-400 leading-5">
          Let AI suggest alternative poetic names for this color in English and Chinese.
        </p>
      )}

      {state === "error" && (
        <p className="text-xs text-red-500">Could not generate names. Try again later.</p>
      )}

      {state === "done" && names.length > 0 && (
        <div className="space-y-2.5">
          {names.map((n, i) => (
            <div key={i} className="flex items-start justify-between gap-3 rounded-xl bg-neutral-50 px-3.5 py-3">
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-neutral-900">{n.en}</span>
                  <span className="text-sm text-neutral-500">{n.zh}</span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5 leading-4">{n.description}</p>
              </div>
              <button
                onClick={() => handleCopy(i, n.en)}
                className="shrink-0 text-[10px] font-medium text-neutral-400 hover:text-neutral-700 transition-colors"
              >
                {copiedIdx === i ? "✓" : "Copy"}
              </button>
            </div>
          ))}
          <button
            onClick={() => setState("idle")}
            className="text-[10px] text-neutral-400 hover:text-neutral-600 mt-1"
          >
            Generate again
          </button>
        </div>
      )}
    </div>
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
  triadicColors,
  splitCompColors,
  complementaryColor,
  lighterCompanion,
  darkerCompanion,
  wcagPairings,
  usedInCollections,
}: ColorDetailPageProps) {
  const { t } = useLocale();
  const [recentColorIds, setRecentColorIds] = useState<string[]>([]);
  const cmykString = (() => {
    const rgb = hexToRgb(color.hex);
    if (!rgb) return null;
    const { c, m, y, k } = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    return `cmyk(${c}%, ${m}%, ${y}%, ${k}%)`;
  })();

  useEffect(() => {
    addRecentColor(color.id);
    setRecentColorIds(getRecentColorIds());
    return subscribeToRecentColors(setRecentColorIds);
  }, [color.id]);

  const paletteMoves = [
    lighterCompanion
      ? {
          label: t("colorDetail.lighterCompanion"),
          value: lighterCompanion,
        }
      : null,
    darkerCompanion
      ? {
          label: t("colorDetail.darkerCompanion"),
          value: darkerCompanion,
        }
      : null,
    complementaryColor
      ? {
          label: t("colorDetail.complementary"),
          value: complementaryColor,
        }
      : null,
    ...analogousColors.map((analogousColor, index) => ({
      label: index === 0 ? t("colorDetail.analogousLead") : t("colorDetail.analogousEcho"),
      value: analogousColor,
    })),
    ...triadicColors.map((triadicColor, index) => ({
      label: index === 0 ? t("colorDetail.triadic1") : t("colorDetail.triadic2"),
      value: triadicColor,
    })),
    ...splitCompColors.map((sc, index) => ({
      label: index === 0 ? t("colorDetail.splitComp1") : t("colorDetail.splitComp2"),
      value: sc,
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
  const exportPaletteIds = exportPalette.map((entry) => entry.value.id);
  const recentTrail = recentColorIds
    .filter((id) => id !== color.id)
    .map((id) => allColors.find((entry) => entry.id === id))
    .filter((entry): entry is ColorRecord => Boolean(entry))
    .slice(0, 4);

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <StickyColorBar name={color.name} hex={color.hex} rgb={color.rgb} hsl={color.hsl} />
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
                  {t("colorDetail.badge")}
                </div>
                <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h1 className={`text-4xl font-semibold tracking-[-0.04em] sm:text-5xl ${isLight ? "text-neutral-900" : "text-white"}`}>
                      {color.name}
                    </h1>
                    <div className={`mt-3 text-sm uppercase tracking-[0.22em] ${isLight ? "text-neutral-500" : "text-white/75"}`}>
                      <Link
                        href={`/families/${getFamilySlug(color.family)}/`}
                        className={`transition-opacity hover:opacity-70 ${isLight ? "text-neutral-500" : "text-white/75"}`}
                      >
                        {color.family}
                      </Link>
                      {" · "}{t("colorDetail.hueLabel")}{" "}{color.hue}
                    </div>
                  </div>
                  <div className={`rounded-2xl px-4 py-3 text-right backdrop-blur-md ${isLight ? "border border-black/10 bg-white/60 text-neutral-900" : "border border-white/24 bg-black/16 text-white"}`}>
                    <div className={`text-xs uppercase tracking-[0.16em] ${isLight ? "text-neutral-500" : "text-white/70"}`}>{t("colorDetail.hexLabel")}</div>
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
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">RGB</div>
                      <div className="mt-1 font-medium text-neutral-950">{color.rgb}</div>
                    </div>
                    <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">HSL</div>
                      <div className="mt-1 font-medium text-neutral-950">{color.hsl}</div>
                    </div>
                    {cmykString && (
                      <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
                        <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">CMYK</div>
                        <div className="mt-1 font-medium text-neutral-950">{cmykString}</div>
                      </div>
                    )}
                    <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">{t("colorDetail.metrics")}</div>
                      <div className="mt-1 font-medium text-neutral-950">
                        S {color.saturation}% · L {color.lightness}%
                      </div>
                    </div>
                    <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">{t("colorDetail.contrastWcag")}</div>
                      <div className="mt-2 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-neutral-500">{t("colorDetail.onWhite")}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-neutral-950">{wcag.vsWhite}:1</span>
                            <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${gradeColors[wcag.whiteGrade]}`}>{wcag.whiteGrade}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-neutral-500">{t("colorDetail.onBlack")}</span>
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
                {cmykString && <CopyButton label="cmyk" value={cmykString} />}
                <CopyButton label="tailwind" value={`bg-[${color.hex}]`} />
                <CopyButton label="all" value={`${color.name}\nHEX: ${color.hex}\nRGB: ${color.rgb}\nHSL: ${color.hsl}\nFamily: ${color.family}`} />
                <CopyButton label="palette" value={paletteExport} />
                <CopyButton label="CSS vars" value={cssVariableExport} />
                <DownloadSwatchButton color={color} />
                <PaletteAddButton colorId={color.id} />
                <PaletteBundleButton colorIds={exportPaletteIds} label={t("colorDetail.addRecommendedPalette")} />
                <FavoriteButton colorId={color.id} />
                <LogToJournalButton color={color} />
                <ShareLinkButton href={`/colors/${color.id}/`} />
                <ShareOnXButton href={`/colors/${color.id}/`} text={`${color.name} ${color.hex} — from the ColorArchive`} />
                <PinterestSaveButton color={color} />
                <SaveToProjectButton palette={[color.hex]} defaultName={color.name} />
                <Link
                  href={`/brand/?primary=${encodeURIComponent(color.hex)}`}
                  className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"
                >
                  {t("colorDetail.startPalette")}
                </Link>
                <Link
                  href="/recent/"
                  className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
                >
                  {t("colorDetail.recentTrailLink")}
                </Link>
              </div>

              <div className="rounded-[1.6rem] border border-black/6 bg-white/72 p-5">
                <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  {t("colorDetail.aboutThisColor")}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
                  {color.name} ({color.hex}) belongs to the{" "}
                  <Link
                    href={`/families/${getFamilySlug(color.family)}/`}
                    className="text-neutral-900 underline underline-offset-2 hover:text-neutral-500"
                  >
                    {color.family.toLowerCase()} family
                  </Link>{" "}
                  — hue {color.hue}°, {color.saturation}% saturation, {color.lightness}% lightness.
                  {" "}{t("colorDetail.copyHint")}
                </p>
                <div className="mt-4 overflow-hidden rounded-xl border border-black/6 bg-neutral-950 dark:border-white/8">
                  <div className="border-b border-white/6 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.16em] text-white/40">
                    CSS
                  </div>
                  <pre className="overflow-x-auto px-4 py-3 text-sm leading-6 text-white/80">
                    <span className="text-white/40">{":root {"}</span>{"\n"}
                    {"  "}
                    <span className="text-sky-300">
                      {"--colorarchive-"}
                      {color.name
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, "")}
                    </span>
                    <span className="text-white/60">{": "}</span>
                    <span className="text-emerald-300">{color.hex}</span>
                    <span className="text-white/60">{";"}</span>
                    {"\n  "}
                    <span className="text-white/40">{"--colorarchive-"}{color.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}{"-hsl"}</span>
                    <span className="text-white/60">{": "}</span>
                    <span className="text-sky-300">{color.hsl}</span>
                    <span className="text-white/60">{";"}</span>
                    {"\n  "}
                    <span className="text-white/40">{"--colorarchive-"}{color.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}{"-rgb"}</span>
                    <span className="text-white/60">{": "}</span>
                    <span className="text-amber-300">{`rgb(${parseInt(color.hex.slice(1, 3), 16)}, ${parseInt(color.hex.slice(3, 5), 16)}, ${parseInt(color.hex.slice(5, 7), 16)})`}</span>
                    <span className="text-white/60">{";"}</span>
                    {"\n"}
                    <span className="text-white/40">{"}"}</span>
                  </pre>
                </div>
              </div>

              {/* AI Color Naming */}
              <AiColorNaming color={color} />

              {/* Design Context — Color Psychology */}
              {(() => {
                const psych = getColorPsychology(color.family, color.lightness);
                return (
                  <div className="rounded-[1.6rem] border border-black/6 bg-white/72 p-5 dark:border-white/8 dark:bg-white/5">
                    <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
                      Design Context
                    </h2>
                    <div className="mt-4 space-y-4">
                      {/* Mood */}
                      <div>
                        <div className="flex flex-wrap gap-1.5">
                          {psych.mood.map((m) => (
                            <span key={m} className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:bg-white/8 dark:text-neutral-300">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Industries */}
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                          Common in
                        </div>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                          {psych.industries.join(" · ")}
                        </p>
                      </div>

                      {/* Pairs with */}
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                          Pairs well with
                        </div>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                          {psych.pairsWith}
                        </p>
                      </div>

                      {/* Design tip */}
                      <div className="rounded-xl bg-neutral-50 p-4 dark:bg-white/5">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                          Design tip
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                          {psych.designTip}
                        </p>
                      </div>

                      {/* Cultural note */}
                      <details className="group">
                        <summary className="cursor-pointer text-xs font-medium text-neutral-400 transition hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300">
                          Cultural context <span className="ml-1 inline-block transition-transform group-open:rotate-90">&#9654;</span>
                        </summary>
                        <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                          {psych.culture}
                        </p>
                      </details>
                    </div>
                  </div>
                );
              })()}

              {/* Color Origins — heritage / cultures / wild / reads */}
              <ColorOriginsSection color={color} />

              {/* Reverse-index: which brands use a similar color (links to /brands/[slug]/) */}
              <BrandsUsingColorSection color={color} />

              {(() => {
                const tonalStrip = getTonalStrip(allColors, color);
                if (tonalStrip.length < 2) return null;
                return (
                  <div className="rounded-[1.6rem] border border-black/6 bg-white/72 p-5">
                    <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                      {t("colorDetail.tonalStrip")}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-neutral-500">
                      {t("colorDetail.tonalDesc")}
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
                <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  {t("colorDetail.paletteMoves")}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
                  {t("colorDetail.paletteMovesDesc")}
                </p>

                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {paletteMoves.map((item) => (
                    <RecommendationCard key={item.value.id} color={item.value} eyebrow={item.label} />
                  ))}
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                  <div className="rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4">
                    <div className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
                      {t("colorDetail.exportPreview")}
                    </div>
                    <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-neutral-600">
                      {paletteExport}
                    </pre>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <PaletteBundleButton colorIds={paletteMoves.map((item) => item.value.id)} label={t("colorDetail.addPaletteMoves")} />
                  </div>
                </div>
              </div>

              {/* Compare with — VS links */}
              <div className="rounded-[1.6rem] border border-black/6 bg-white/72 p-5">
                <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  Compare
                </h2>
                <div className="mt-3 flex items-center justify-between">
                  <p className="max-w-2xl text-sm leading-6 text-neutral-600">
                    See how {color.name} compares side by side with related colors.
                  </p>
                  <SendToTool hexColors={[color.hex, ...(complementaryColor ? [complementaryColor.hex] : [])]} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {paletteMoves.slice(0, 6).map((item) => (
                    <Link
                      key={item.value.id}
                      href={`/colors/${color.id}/vs/${item.value.id}/`}
                      className="inline-flex items-center gap-2 rounded-xl border border-black/6 bg-white/60 px-3 py-2 text-xs font-medium text-neutral-600 transition hover:shadow-sm dark:border-white/8 dark:bg-white/5 dark:text-neutral-300"
                    >
                      <span className="inline-block h-4 w-4 rounded" style={{ backgroundColor: color.hex }} />
                      <span>vs</span>
                      <span className="inline-block h-4 w-4 rounded" style={{ backgroundColor: item.value.hex }} />
                      <span>{item.value.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-black/6 bg-white/72 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                      {t("colorDetail.nearestNeighbors")}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
                      {t("colorDetail.nearestDesc")}
                    </p>
                  </div>
                  <Link
                    href={`/all-colors?hex=${encodeURIComponent(color.hex)}`}
                    className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
                  >
                    {t("colorDetail.searchByHex")}
                  </Link>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {nearestColors.map((nearColor) => (
                    <RecommendationCard key={nearColor.id} color={nearColor} eyebrow={t("colorDetail.nearbyMatch")} />
                  ))}
                </div>
              </div>

              {wcagPairings.length > 0 && (
                <div className="rounded-[1.6rem] border border-black/6 bg-white/72 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                        {t("colorDetail.accessiblePairings")}
                      </h2>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
                        {t("colorDetail.accessibleDesc")}
                      </p>
                    </div>
                    <Link
                      href={`/contrast/`}
                      className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
                    >
                      {t("colorDetail.contrastChecker")}
                    </Link>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {wcagPairings.map((pairing) => {
                      const gradeColors = {
                        "AAA": "text-emerald-700 bg-emerald-50 border-emerald-200",
                        "AA": "text-sky-700 bg-sky-50 border-sky-200",
                        "AA Large": "text-amber-700 bg-amber-50 border-amber-200",
                      } as const;
                      return (
                        <article key={pairing.color.id} className="rounded-[1.45rem] border border-black/6 bg-white/84 p-3 transition hover:-translate-y-0.5 hover:border-black/10 hover:shadow-[0_18px_36px_rgba(15,23,42,0.06)]">
                          <Link href={`/colors/${pairing.color.id}/`} className="group block">
                            <div className="flex gap-1.5 overflow-hidden rounded-[1.1rem] border border-black/6" aria-hidden="true">
                              <div className="h-24 flex-1" style={{ backgroundColor: color.hex }} />
                              <div className="h-24 flex-1" style={{ backgroundColor: pairing.color.hex }} />
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                              <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${gradeColors[pairing.grade]}`}>
                                {pairing.grade}
                              </span>
                              <span className="text-[11px] font-medium text-neutral-500">
                                {pairing.ratio}:1
                              </span>
                            </div>
                            <div className="mt-1 truncate text-base font-semibold tracking-[-0.02em] text-neutral-950">
                              {pairing.color.name}
                            </div>
                            <div className="mt-1 text-sm text-neutral-500">
                              {pairing.color.hex}
                            </div>
                          </Link>
                          <div className="mt-3">
                            <PaletteAddButton colorId={pairing.color.id} />
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Colorblind simulation */}
              {(() => {
                const rgb = hexToRgbCB(color.hex);
                if (!rgb) return null;
                const types = [
                  { key: "deuteranopia" as const, label: "Deuteranopia" },
                  { key: "protanopia" as const, label: "Protanopia" },
                  { key: "tritanopia" as const, label: "Tritanopia" },
                ] as const;
                return (
                  <div className="rounded-[1.6rem] border border-black/6 bg-white/72 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                          Color Vision Simulation
                        </h2>
                        <p className="mt-1.5 text-sm text-neutral-500">How this color appears with different color vision deficiencies.</p>
                      </div>
                      <Link
                        href="/colorblind/"
                        className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
                      >
                        Full simulator
                      </Link>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {types.map(({ key, label }) => {
                        const simRgb = simulateColorBlindness(rgb, key);
                        const simHex = rgbToHexCB(simRgb);
                        return (
                          <div key={key} className="flex flex-col gap-2">
                            <div
                              className="h-14 rounded-[1rem] border border-black/8"
                              style={{ backgroundColor: simHex }}
                            />
                            <div className="text-[11px] font-medium text-neutral-500">{label}</div>
                            <div className="font-mono text-xs text-neutral-400">{simHex}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <div className="rounded-[1.6rem] border border-black/6 bg-neutral-950 p-5 text-white dark:border-white/10 dark:bg-white dark:text-neutral-950">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-white/40 dark:text-neutral-400">
                  {t("colorDetail.readyToBuild")}
                </div>
                <p className="mt-2 text-lg font-semibold tracking-[-0.02em]">
                  {t("colorDetail.buildTitle")}
                </p>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/60 dark:text-neutral-500">
                  {t("colorDetail.buildDesc")}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/pro/"
                    className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-950 transition hover:bg-neutral-200 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800"
                  >
                    {t("colorDetail.browsePacks")}
                  </Link>
                  <Link
                    href="/free-resources/"
                    className="rounded-full border border-white/16 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/80 transition hover:border-white/30 hover:text-white dark:border-black/16 dark:text-neutral-600 dark:hover:border-black/30 dark:hover:text-neutral-950"
                  >
                    {t("colorDetail.freeDownload")}
                  </Link>
                  <Link
                    href="/collections/"
                    className="rounded-full border border-white/16 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/80 transition hover:border-white/30 hover:text-white dark:border-black/16 dark:text-neutral-600 dark:hover:border-black/30 dark:hover:text-neutral-950"
                  >
                    {t("colorDetail.viewCollections")}
                  </Link>
                </div>
              </div>

              {recentTrail.length > 0 ? (
                <div className="rounded-[1.6rem] border border-black/6 bg-white/72 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                        {t("colorDetail.recentTrail")}
                      </h2>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
                        {t("colorDetail.recentDesc")}
                      </p>
                    </div>
                    <Link
                      href="/recent/"
                      className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
                    >
                      {t("colorDetail.openRecent")}
                    </Link>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {recentTrail.map((recentColor) => (
                      <RecommendationCard key={recentColor.id} color={recentColor} eyebrow={t("colorDetail.recentlyViewed")} />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <aside className="rounded-[1.8rem] border border-black/6 bg-white/78 p-5 shadow-[0_20px_56px_rgba(15,23,42,0.05)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                    {t("colorDetail.relatedColors")}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-neutral-950">
                    <Link
                      href={`/families/${getFamilySlug(color.family)}/`}
                      className="transition-colors hover:text-neutral-500"
                    >
                      {t("colorDetail.moreFrom")} {color.family}
                    </Link>
                  </h2>
                </div>
                <Link
                  href="/all-colors"
                  className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
                >
                  {t("colorDetail.search")}
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

        {usedInCollections.length > 0 && (
          <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-neutral-900/80">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
              {t("colorDetail.usedIn")}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {usedInCollections.map((col) => (
                <Link
                  key={col.id}
                  href={`/collections/${col.id}/`}
                  className="rounded-full border border-black/8 bg-neutral-50 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white dark:hover:text-neutral-950"
                >
                  {col.title}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
