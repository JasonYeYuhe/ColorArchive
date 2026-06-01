"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useLocale } from "@/src/components/locale-provider";
import {
  hexToRgb,
  rgbToHsl,
  formatRgb,
  formatHsl,
  getColorFamily,
  getWcagContrast,
  getTonalStrip,
  getNearestColors,
  getAnalogousColors,
  getComplementaryColor,
  getToneCompanion,
  getSplitComplementaryColors,
  getTriadicColors,
  getWcagPairings,
} from "@/src/lib/color-utils";
import type { WcagPairing } from "@/src/lib/color-utils";
import { colors as allColors } from "@/src/data/colors";
import type { ColorRecord } from "@/src/types/color";

function CopyBtn({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const id = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(id);
  }, [copied]);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
        } catch {
          /* noop */
        }
      }}
      className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white dark:hover:text-neutral-950"
    >
      {copied ? `${label} Copied` : `Copy ${label}`}
    </button>
  );
}

function RelatedCard({ color, eyebrow }: { color: ColorRecord; eyebrow: string }) {
  return (
    <article className="rounded-[1.45rem] border border-black/6 bg-white/84 p-3 transition hover:-translate-y-0.5 hover:border-black/10 hover:shadow-[0_18px_36px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-neutral-900/84">
      <Link href={`/colors/${color.id}/`} className="group block">
        <div
          className="h-24 rounded-[1.1rem] border border-black/6 dark:border-white/10"
          style={{ backgroundColor: color.hex }}
          aria-hidden="true"
        />
        <div className="mt-3 text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">
          {eyebrow}
        </div>
        <div className="mt-1 truncate text-base font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
          {color.name}
        </div>
        <div className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {color.hex} &middot; {color.hsl}
        </div>
      </Link>
    </article>
  );
}

function buildColorRecord(hex6: string): ColorRecord | null {
  const rgb = hexToRgb(hex6);
  if (!rgb) return null;

  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const hexUpper = `#${hex6.toUpperCase()}`;

  return {
    id: `hex-${hex6.toLowerCase()}`,
    name: hexUpper,
    hex: hexUpper,
    rgb: formatRgb(rgb),
    hsl: formatHsl(h, s, l),
    hue: h,
    saturation: s,
    lightness: l,
    family: getColorFamily(h),
  };
}

export function CustomColorPage() {
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const hexParam = searchParams.get("c") ?? "";

  const color = useMemo(() => {
    const cleaned = hexParam.replace(/[^0-9a-fA-F]/g, "");
    if (cleaned.length !== 6) return null;
    return buildColorRecord(cleaned);
  }, [hexParam]);

  // Derived relationships from the archive
  const nearest = useMemo(() => (color ? getNearestColors(allColors, color, 6) : []), [color]);
  const complementary = useMemo(() => (color ? getComplementaryColor(allColors, color) : null), [color]);
  const analogous = useMemo(() => (color ? getAnalogousColors(allColors, color, 2) : []), [color]);
  const triadic = useMemo(() => (color ? getTriadicColors(allColors, color) : []), [color]);
  const splitComp = useMemo(() => (color ? getSplitComplementaryColors(allColors, color) : []), [color]);
  const lighter = useMemo(() => (color ? getToneCompanion(allColors, color, "lighter") : null), [color]);
  const darker = useMemo(() => (color ? getToneCompanion(allColors, color, "darker") : null), [color]);
  const wcagPairings = useMemo(() => (color ? getWcagPairings(allColors, color, 6) : []), [color]);
  const wcagContrast = useMemo(() => (color ? getWcagContrast(color.hue, color.saturation, color.lightness) : null), [color]);
  const tonalStrip = useMemo(() => (color ? getTonalStrip(allColors, color) : []), [color]);

  if (!color) {
    return (
      <main className="px-4 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center gap-6 py-20 text-center">
          <h1 className="font-display text-3xl font-light tracking-[-0.04em] text-neutral-950 dark:text-white">
            Invalid Hex Color
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Please provide a valid 6-digit hex code, e.g. <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-sm dark:bg-white/10">?c=ff5733</code>
          </p>
          <Link
            href="/all-colors/"
            className="mt-4 rounded-full border border-black/8 bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 dark:border-white/20 dark:bg-white dark:text-neutral-950"
          >
            Browse All Colors
          </Link>
        </div>
      </main>
    );
  }

  const isLight = color.lightness > 65;

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        {/* Hero swatch */}
        <section className="overflow-hidden rounded-[2rem] border border-black/6 bg-white/78 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-neutral-900/78">
          <div
            className="relative h-72 border-b border-black/6 dark:border-white/10 sm:h-80"
            style={{ backgroundColor: color.hex }}
            aria-hidden="true"
          >
            <div
              className={`absolute inset-0 ${isLight ? "bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_40%,rgba(0,0,0,0.04))]" : "bg-[linear-gradient(135deg,rgba(255,255,255,0.14),transparent_45%,rgba(17,24,39,0.08))]"}`}
            />
            <div
              className={`absolute left-6 top-6 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] backdrop-blur-md ${isLight ? "border border-black/10 bg-black/6 text-neutral-700" : "border border-white/30 bg-white/18 text-white/92"}`}
            >
              Custom Color
            </div>
            <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1
                  className={`font-display text-4xl font-light tracking-[-0.04em] sm:text-5xl ${isLight ? "text-neutral-900" : "text-white"}`}
                >
                  {color.hex}
                </h1>
                <p
                  className={`mt-2 text-base ${isLight ? "text-neutral-600" : "text-white/72"}`}
                >
                  {color.family} &middot; {color.hsl}
                </p>
              </div>
            </div>
          </div>

          {/* Color values */}
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap gap-2">
              <CopyBtn value={color.hex} label="HEX" />
              <CopyBtn value={color.rgb} label="RGB" />
              <CopyBtn value={color.hsl} label="HSL" />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-black/6 bg-neutral-50/80 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">
                  Hue
                </div>
                <div className="mt-1 text-lg font-semibold text-neutral-950 dark:text-white">
                  {color.hue}&deg;
                </div>
              </div>
              <div className="rounded-2xl border border-black/6 bg-neutral-50/80 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">
                  Saturation
                </div>
                <div className="mt-1 text-lg font-semibold text-neutral-950 dark:text-white">
                  {color.saturation}%
                </div>
              </div>
              <div className="rounded-2xl border border-black/6 bg-neutral-50/80 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">
                  Lightness
                </div>
                <div className="mt-1 text-lg font-semibold text-neutral-950 dark:text-white">
                  {color.lightness}%
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WCAG Contrast */}
        {wcagContrast && (
          <section className="rounded-[2rem] border border-black/6 bg-white/78 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-neutral-900/78 sm:p-8">
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">
              WCAG Contrast
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-black/6 bg-neutral-50/80 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">
                  On White
                </div>
                <div className="mt-1 text-lg font-semibold text-neutral-950 dark:text-white">
                  {wcagContrast.vsWhite.toFixed(2)} : 1
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  {wcagContrast.vsWhite >= 7 ? "AAA" : wcagContrast.vsWhite >= 4.5 ? "AA" : wcagContrast.vsWhite >= 3 ? "AA Large" : "Fail"}
                </div>
              </div>
              <div className="rounded-2xl border border-black/6 bg-neutral-50/80 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">
                  On Black
                </div>
                <div className="mt-1 text-lg font-semibold text-neutral-950 dark:text-white">
                  {wcagContrast.vsBlack.toFixed(2)} : 1
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  {wcagContrast.vsBlack >= 7 ? "AAA" : wcagContrast.vsBlack >= 4.5 ? "AA" : wcagContrast.vsBlack >= 3 ? "AA Large" : "Fail"}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tonal strip */}
        {tonalStrip.length > 0 && (
          <section className="rounded-[2rem] border border-black/6 bg-white/78 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-neutral-900/78 sm:p-8">
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">
              Tonal Scale
            </h2>
            <div className="mt-4 flex gap-1 overflow-hidden rounded-2xl">
              {tonalStrip.map((step) => (
                <div
                  key={step.lightness}
                  className="h-14 flex-1"
                  style={{ backgroundColor: step.hex }}
                  title={`${step.hex} — L${step.lightness}`}
                />
              ))}
            </div>
          </section>
        )}

        {/* WCAG Pairings */}
        {wcagPairings.length > 0 && (
          <section className="rounded-[2rem] border border-black/6 bg-white/78 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-neutral-900/78 sm:p-8">
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">
              Accessible Pairings
            </h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Archive colors that pass WCAG contrast checks against this color.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {wcagPairings.map((pairing: WcagPairing) => (
                <Link
                  key={pairing.color.id}
                  href={`/colors/${pairing.color.id}/`}
                  className="flex items-center gap-3 rounded-2xl border border-black/6 bg-neutral-50/80 p-3 transition hover:bg-neutral-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/8"
                >
                  <div
                    className="h-10 w-10 shrink-0 rounded-xl border border-black/6 dark:border-white/10"
                    style={{ backgroundColor: pairing.color.hex }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-neutral-950 dark:text-white">
                      {pairing.color.name}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {pairing.ratio.toFixed(2)}:1 &middot; {pairing.grade}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Color relationships */}
        <section className="rounded-[2rem] border border-black/6 bg-white/78 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-neutral-900/78 sm:p-8">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">
            Color Relationships
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Nearest matches and harmonic companions from the archive.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {complementary && <RelatedCard color={complementary} eyebrow="Complementary" />}
            {lighter && <RelatedCard color={lighter} eyebrow="Lighter Companion" />}
            {darker && <RelatedCard color={darker} eyebrow="Darker Companion" />}
            {analogous.map((c, i) => (
              <RelatedCard key={c.id} color={c} eyebrow={i === 0 ? "Analogous Lead" : "Analogous Echo"} />
            ))}
            {triadic.map((c, i) => (
              <RelatedCard key={c.id} color={c} eyebrow={`Triadic ${i + 1}`} />
            ))}
            {splitComp.map((c, i) => (
              <RelatedCard key={c.id} color={c} eyebrow={`Split Comp ${i + 1}`} />
            ))}
          </div>
        </section>

        {/* Nearest colors */}
        {nearest.length > 0 && (
          <section className="rounded-[2rem] border border-black/6 bg-white/78 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-neutral-900/78 sm:p-8">
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">
              Nearest Archive Colors
            </h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              The closest colors in the archive to {color.hex}.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {nearest.map((c) => (
                <RelatedCard key={c.id} color={c} eyebrow={c.family} />
              ))}
            </div>
          </section>
        )}

        {/* Back link */}
        <div className="flex justify-center py-4">
          <Link
            href="/all-colors/"
            className="rounded-full border border-black/8 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white dark:hover:text-neutral-950"
          >
            &larr; Browse All Colors
          </Link>
        </div>
      </div>
    </main>
  );
}
