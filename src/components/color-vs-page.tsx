"use client";

import Link from "next/link";
import type { ColorRecord } from "@/src/types/color";
import { useLocale } from "@/src/components/locale-provider";
import { SendToTool } from "@/src/components/send-to-tool";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function relativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1: string, hex2: string) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}

function wcagLevel(ratio: number): { aa: boolean; aaLarge: boolean; aaa: boolean; aaaLarge: boolean } {
  return {
    aa: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaa: ratio >= 7,
    aaaLarge: ratio >= 4.5,
  };
}

function isLight(hex: string): boolean {
  return relativeLuminance(hex) > 0.5;
}

function hueDifference(a: number, b: number): number {
  const diff = Math.abs(a - b);
  return Math.min(diff, 360 - diff);
}

function harmonyLabel(hueDiff: number): string {
  if (hueDiff <= 15) return "Near identical";
  if (hueDiff <= 40) return "Analogous";
  if (hueDiff <= 90) return "Adjacent";
  if (hueDiff <= 135) return "Triadic range";
  if (hueDiff >= 150 && hueDiff <= 210) return "Complementary";
  return "Split-complementary";
}

/* ------------------------------------------------------------------ */
/*  Stat row                                                           */
/* ------------------------------------------------------------------ */

function StatRow({ label, left, right, winner }: { label: string; left: string; right: string; winner?: "left" | "right" | "tie" }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-2.5">
      <div className={`text-right text-sm font-mono ${winner === "left" ? "font-bold text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-neutral-400"}`}>
        {left}
      </div>
      <div className="text-[10px] font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500 min-w-[100px] text-center">
        {label}
      </div>
      <div className={`text-sm font-mono ${winner === "right" ? "font-bold text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-neutral-400"}`}>
        {right}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

interface ColorVsPageProps {
  colorA: ColorRecord;
  colorB: ColorRecord;
  relatedPairs: Array<{ a: ColorRecord; b: ColorRecord }>;
}

export function ColorVsPage({ colorA, colorB, relatedPairs }: ColorVsPageProps) {
  const { t } = useLocale();
  const ratio = contrastRatio(colorA.hex, colorB.hex);
  const wcag = wcagLevel(ratio);
  const hueDiff = hueDifference(colorA.hue, colorB.hue);
  const harmony = harmonyLabel(hueDiff);

  return (
    <main className="relative min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        {/* Hero comparison */}
        <section className="mb-10">
          <div className="grid grid-cols-2 overflow-hidden rounded-3xl shadow-lg" style={{ height: "220px" }}>
            <div
              className="flex flex-col items-center justify-center gap-2"
              style={{ backgroundColor: colorA.hex }}
            >
              <span className={`text-2xl font-bold ${isLight(colorA.hex) ? "text-neutral-900" : "text-white"}`}>
                {colorA.name}
              </span>
              <span className={`font-mono text-sm ${isLight(colorA.hex) ? "text-neutral-700" : "text-white/70"}`}>
                {colorA.hex}
              </span>
            </div>
            <div
              className="flex flex-col items-center justify-center gap-2"
              style={{ backgroundColor: colorB.hex }}
            >
              <span className={`text-2xl font-bold ${isLight(colorB.hex) ? "text-neutral-900" : "text-white"}`}>
                {colorB.name}
              </span>
              <span className={`font-mono text-sm ${isLight(colorB.hex) ? "text-neutral-700" : "text-white/70"}`}>
                {colorB.hex}
              </span>
            </div>
          </div>

          {/* VS badge */}
          <div className="relative -mt-6 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-sm font-black text-neutral-900 shadow-md dark:bg-neutral-800 dark:text-white">
              VS
            </div>
          </div>
        </section>

        {/* Title */}
        <h1 className="mb-2 text-center text-3xl font-display font-light tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
          {colorA.name} vs {colorB.name}
        </h1>
        <p className="mb-10 text-center text-sm text-neutral-500 dark:text-neutral-400">
          A detailed comparison of {colorA.hex} and {colorB.hex} — {harmony.toLowerCase()} colors
        </p>
        <div className="mb-10 flex justify-center">
          <SendToTool hexColors={[colorA.hex, colorB.hex]} label="Use these colors in..." />
        </div>

        {/* Contrast + WCAG */}
        <section className="mb-8 rounded-[2rem] border border-black/6 bg-white/74 p-6 backdrop-blur-xl sm:p-8 dark:border-white/8 dark:bg-white/5">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
            Contrast &amp; Accessibility
          </h2>

          <div className="mb-4 text-center">
            <span className="text-4xl font-black text-neutral-900 dark:text-white">{ratio}:1</span>
            <span className="ml-2 text-sm text-neutral-500">contrast ratio</span>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {([
              ["AA Normal", wcag.aa],
              ["AA Large", wcag.aaLarge],
              ["AAA Normal", wcag.aaa],
              ["AAA Large", wcag.aaaLarge],
            ] as const).map(([label, pass]) => (
              <span
                key={label}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  pass
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {pass ? "\u2713" : "\u2717"} {label}
              </span>
            ))}
          </div>

          {/* Preview text */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: colorA.hex }}>
              <span className="text-sm font-semibold" style={{ color: colorB.hex }}>
                Text on {colorA.name}
              </span>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: colorB.hex }}>
              <span className="text-sm font-semibold" style={{ color: colorA.hex }}>
                Text on {colorB.name}
              </span>
            </div>
          </div>
        </section>

        {/* Side-by-side stats */}
        <section className="mb-8 rounded-[2rem] border border-black/6 bg-white/74 p-6 backdrop-blur-xl sm:p-8 dark:border-white/8 dark:bg-white/5">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
            Color Properties
          </h2>

          <div className="divide-y divide-black/5 dark:divide-white/5">
            <StatRow label="HEX" left={colorA.hex} right={colorB.hex} />
            <StatRow label="RGB" left={colorA.rgb} right={colorB.rgb} />
            <StatRow label="HSL" left={colorA.hsl} right={colorB.hsl} />
            <StatRow label="Hue" left={`${colorA.hue}\u00B0`} right={`${colorB.hue}\u00B0`} />
            <StatRow
              label="Saturation"
              left={`${colorA.saturation}%`}
              right={`${colorB.saturation}%`}
              winner={colorA.saturation > colorB.saturation ? "left" : colorB.saturation > colorA.saturation ? "right" : "tie"}
            />
            <StatRow
              label="Lightness"
              left={`${colorA.lightness}%`}
              right={`${colorB.lightness}%`}
              winner={colorA.lightness > colorB.lightness ? "left" : colorB.lightness > colorA.lightness ? "right" : "tie"}
            />
            <StatRow label="Family" left={colorA.family} right={colorB.family} />
            <StatRow label="Hue Diff" left="" right="" />
            <div className="py-2.5 text-center">
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600 dark:bg-white/8 dark:text-neutral-400">
                {hueDiff}\u00B0 — {harmony}
              </span>
            </div>
          </div>
        </section>

        {/* Gradient blend */}
        <section className="mb-8 rounded-[2rem] border border-black/6 bg-white/74 p-6 backdrop-blur-xl sm:p-8 dark:border-white/8 dark:bg-white/5">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
            Gradient Blend
          </h2>
          <div
            className="h-16 rounded-2xl"
            style={{ background: `linear-gradient(to right, ${colorA.hex}, ${colorB.hex})` }}
          />
          <p className="mt-3 text-center font-mono text-xs text-neutral-500 dark:text-neutral-400">
            background: linear-gradient(to right, {colorA.hex}, {colorB.hex});
          </p>
        </section>

        {/* Use together suggestions */}
        <section className="mb-8 rounded-[2rem] border border-black/6 bg-white/74 p-6 backdrop-blur-xl sm:p-8 dark:border-white/8 dark:bg-white/5">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
            Using These Colors Together
          </h2>
          <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
            {ratio >= 4.5 ? (
              <p>
                With a contrast ratio of <strong>{ratio}:1</strong>, this pair meets <strong>WCAG AA</strong> for normal text.
                {colorA.lightness > colorB.lightness
                  ? ` Use ${colorA.name} as the background and ${colorB.name} as text for optimal readability.`
                  : ` Use ${colorB.name} as the background and ${colorA.name} as text for optimal readability.`}
              </p>
            ) : ratio >= 3 ? (
              <p>
                With a contrast ratio of <strong>{ratio}:1</strong>, this pair passes <strong>WCAG AA for large text</strong> only.
                Avoid using this combination for body text. Consider it for headings, decorative elements, or adjacent UI regions.
              </p>
            ) : (
              <p>
                With a contrast ratio of <strong>{ratio}:1</strong>, this pair does <strong>not meet WCAG guidelines</strong> for text.
                Use these colors as adjacent blocks, gradients, or decorative accents rather than text-on-background pairings.
              </p>
            )}
            <p>
              These colors have a <strong>{hueDiff}\u00B0 hue difference</strong>, making them{" "}
              <strong>{harmony.toLowerCase()}</strong>.{" "}
              {hueDiff <= 40
                ? "They create a harmonious, cohesive palette ideal for subtle variations in a design system."
                : hueDiff >= 150
                  ? "Their high contrast creates visual energy — great for call-to-action buttons, hero sections, and brand accents."
                  : "They offer moderate contrast — versatile for card designs, illustrations, and layered UI compositions."}
            </p>
          </div>
        </section>

        {/* Detail page links */}
        <section className="mb-8 grid grid-cols-2 gap-4">
          <Link
            href={`/colors/${colorA.id}/`}
            className="rounded-2xl border border-black/6 bg-white/74 p-5 text-center transition hover:shadow-md dark:border-white/8 dark:bg-white/5"
          >
            <div className="mx-auto mb-3 h-12 w-12 rounded-xl" style={{ backgroundColor: colorA.hex }} />
            <div className="text-sm font-semibold text-neutral-900 dark:text-white">{colorA.name}</div>
            <div className="text-xs text-neutral-500">{t("view_detail") || "View full details"} &rarr;</div>
          </Link>
          <Link
            href={`/colors/${colorB.id}/`}
            className="rounded-2xl border border-black/6 bg-white/74 p-5 text-center transition hover:shadow-md dark:border-white/8 dark:bg-white/5"
          >
            <div className="mx-auto mb-3 h-12 w-12 rounded-xl" style={{ backgroundColor: colorB.hex }} />
            <div className="text-sm font-semibold text-neutral-900 dark:text-white">{colorB.name}</div>
            <div className="text-xs text-neutral-500">{t("view_detail") || "View full details"} &rarr;</div>
          </Link>
        </section>

        {/* Related comparisons */}
        {relatedPairs.length > 0 && (
          <section className="rounded-[2rem] border border-black/6 bg-white/74 p-6 backdrop-blur-xl sm:p-8 dark:border-white/8 dark:bg-white/5">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
              Related Comparisons
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPairs.map(({ a, b }) => (
                <Link
                  key={`${a.id}-${b.id}`}
                  href={`/colors/${a.id}/vs/${b.id}/`}
                  // nofollow: vs pages are on-demand (ISR) over a ~29M combinatorial space.
                  // Letting crawlers spider vs→vs→vs generated millions of on-demand renders /
                  // ISR writes (the #1 ISR cost). Color→vs entry links stay followable; this
                  // just caps the exponential deep crawl. Users can still click through.
                  rel="nofollow"
                  className="flex items-center gap-3 rounded-xl border border-black/5 bg-white/60 p-3 transition hover:shadow-sm dark:border-white/5 dark:bg-white/3"
                >
                  <div className="flex gap-1">
                    <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: a.hex }} />
                    <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: b.hex }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      {a.name} vs {b.name}
                    </div>
                    <div className="text-[10px] text-neutral-400">{a.hex} · {b.hex}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
