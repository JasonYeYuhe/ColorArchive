"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { colors } from "@/src/data/colors";
import { hslToRgb, rgbToHex } from "@/src/lib/color-utils";
import { useLocale } from "@/src/components/locale-provider";
import type { ColorRecord } from "@/src/types/color";

/* ------------------------------------------------------------------ */
/*  WCAG contrast helpers                                              */
/* ------------------------------------------------------------------ */

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace(/^#/, "");
  const expanded =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  const num = parseInt(expanded, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function getRelativeLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const sRGB = c / 255;
    return sRGB <= 0.04045 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

type WcagLevel = "Pass" | "Fail";

interface WcagResult {
  ratio: number;
  apca: number;
  aaNormal: WcagLevel;
  aaLarge: WcagLevel;
  aaaNormal: WcagLevel;
  aaaLarge: WcagLevel;
  aaUi: WcagLevel;
}

function sRGBtoY(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Piecewise sRGB linearization (simplified APCA)
  const [rL, gL, bL] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126729 * rL + 0.7151522 * gL + 0.0721750 * bL;
}

function getApcaContrast(textHex: string, bgHex: string): number {
  const txtY = sRGBtoY(textHex);
  const bgY = sRGBtoY(bgHex);
  // Simplified APCA-W3 (Silver level approximation)
  const normBG = Math.pow(bgY, 0.56);
  const normTXT = Math.pow(txtY, 0.57);
  const rawContrast = (normBG - normTXT) * 1.14;
  if (Math.abs(rawContrast) < 0.1) return 0;
  return Math.round(rawContrast * 100) / 100;
}

function evaluateWcag(hex1: string, hex2: string): WcagResult {
  const ratio = getContrastRatio(hex1, hex2);
  const apca = getApcaContrast(hex1, hex2);
  return {
    ratio: Math.round(ratio * 100) / 100,
    apca,
    aaNormal: ratio >= 4.5 ? "Pass" : "Fail",
    aaLarge: ratio >= 3 ? "Pass" : "Fail",
    aaaNormal: ratio >= 7 ? "Pass" : "Fail",
    aaaLarge: ratio >= 4.5 ? "Pass" : "Fail",
    aaUi: ratio >= 3 ? "Pass" : "Fail",
  };
}

/* ------------------------------------------------------------------ */
/*  Hex validation                                                     */
/* ------------------------------------------------------------------ */

const HEX_PATTERN = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

function isValidHex(value: string): boolean {
  return HEX_PATTERN.test(value);
}

function normalizeHex(value: string): string {
  const cleaned = value.replace(/^#/, "");
  const expanded =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  return `#${expanded.toUpperCase()}`;
}

/* ------------------------------------------------------------------ */
/*  Badge component                                                    */
/* ------------------------------------------------------------------ */

function WcagBadge({ label, level, result }: { label: string; level: string; result: WcagLevel }) {
  const pass = result === "Pass";
  return (
    <div className="flex items-center justify-between rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
      <div>
        <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">{label}</div>
        <div className="mt-1 text-sm font-medium text-neutral-700">{level}</div>
      </div>
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
          pass
            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border border-red-200 bg-red-50 text-red-600"
        }`}
      >
        {result}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Color picker panel                                                 */
/* ------------------------------------------------------------------ */

function ColorPickerPanel({
  label,
  hex,
  onHexChange,
}: {
  label: string;
  hex: string;
  onHexChange: (hex: string) => void;
}) {
  const { t } = useLocale();
  const [inputValue, setInputValue] = useState(hex);
  const [showPalette, setShowPalette] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState("");

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (isValidHex(value)) {
      onHexChange(normalizeHex(value));
    }
  };

  const handleSelectColor = useCallback(
    (color: ColorRecord) => {
      const colorHex = rgbToHex(hslToRgb(color.hue, color.saturation, color.lightness));
      setInputValue(colorHex);
      onHexChange(colorHex);
      setShowPalette(false);
      setPaletteSearch("");
    },
    [onHexChange],
  );

  const filteredColors = useMemo(() => {
    if (!paletteSearch.trim()) {
      return colors.slice(0, 60);
    }
    const query = paletteSearch.trim().toLowerCase();
    return colors
      .filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.hex.toLowerCase().includes(query) ||
          c.family.toLowerCase().includes(query),
      )
      .slice(0, 60);
  }, [paletteSearch]);

  return (
    <div className="rounded-[1.7rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">{label}</div>

      <div className="mt-4 flex items-center gap-3">
        <div
          className="h-12 w-12 shrink-0 rounded-xl border border-black/8 shadow-sm"
          style={{ backgroundColor: hex }}
        />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="#000000"
          className="w-full rounded-2xl border border-black/8 bg-white px-4 py-3 text-base font-medium text-neutral-950 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8"
        />
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setShowPalette((prev) => !prev)}
          className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-sm text-neutral-700 transition hover:bg-neutral-950 hover:text-white"
        >
          {showPalette ? t("contrast.hidePalette") : t("contrast.pickFromArchive")}
        </button>
      </div>

      {showPalette && (
        <div className="mt-4">
          <input
            type="text"
            value={paletteSearch}
            onChange={(e) => setPaletteSearch(e.target.value)}
            placeholder={t("contrast.searchPlaceholder")}
            className="mb-3 w-full rounded-2xl border border-black/8 bg-white px-4 py-2.5 text-sm text-neutral-950 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8"
          />
          <div className="grid max-h-48 grid-cols-6 gap-1.5 overflow-y-auto sm:grid-cols-8">
            {filteredColors.map((color) => {
              const colorHex = rgbToHex(hslToRgb(color.hue, color.saturation, color.lightness));
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => handleSelectColor(color)}
                  title={`${color.name} — ${colorHex}`}
                  className="aspect-square rounded-lg border border-black/8 transition hover:scale-110 hover:shadow-md"
                  style={{ backgroundColor: colorHex }}
                />
              );
            })}
          </div>
          {filteredColors.length === 0 && (
            <p className="py-4 text-center text-sm text-neutral-400">{t("contrast.noResults")}</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export function ContrastCheckerPage() {
  const { t } = useLocale();
  const [fgHex, setFgHex] = useState("#1A1A2E");
  const [bgHex, setBgHex] = useState("#F5F5F0");

  const wcag = useMemo(() => evaluateWcag(fgHex, bgHex), [fgHex, bgHex]);

  const handleSwap = () => {
    setFgHex(bgHex);
    setBgHex(fgHex);
  };

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        {/* Hero section */}
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute -right-10 top-0 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="pointer-events-none absolute left-0 top-10 h-48 w-48 rounded-full bg-sky-200/30 blur-3xl" />
          <div className="relative mx-auto max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              {t("contrast.badge")}
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              {t("contrast.title")}
            </h1>

            <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-neutral-600 sm:text-lg">
              {t("contrast.description")}
            </p>
          </div>
        </section>

        {/* Color pickers */}
        <section className="grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <ColorPickerPanel label={t("contrast.foreground")} hex={fgHex} onHexChange={setFgHex} />

          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={handleSwap}
              title={t("contrast.swap")}
              className="rounded-full border border-black/8 bg-white/85 p-3 text-neutral-600 shadow-sm transition hover:bg-neutral-950 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          <ColorPickerPanel label={t("contrast.background")} hex={bgHex} onHexChange={setBgHex} />
        </section>

        {/* Results */}
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)]">
          {/* Live preview */}
          <div className="rounded-[1.75rem] border border-black/6 bg-white/80 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-neutral-950">
                {t("contrast.livePreview")}
              </h2>
              <div className="flex items-center gap-2">
                <div className="rounded-full border border-black/6 bg-neutral-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
                  {wcag.ratio} : 1
                </div>
                <div className="rounded-full border border-black/6 bg-neutral-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500" title="APCA Lightness Contrast (approximate)">
                  APCA {wcag.apca > 0 ? "+" : ""}{wcag.apca}
                </div>
              </div>
            </div>

            <div
              className="mt-5 overflow-hidden rounded-[1.4rem] border border-black/6"
              style={{ backgroundColor: bgHex }}
            >
              <div className="space-y-4 p-6 sm:p-8">
                <h3
                  className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl"
                  style={{ color: fgHex }}
                >
                  {t("contrast.headingSample")}
                </h3>
                <p className="text-base leading-7 sm:text-lg" style={{ color: fgHex }}>
                  {t("contrast.bodySample")}
                </p>
                <p className="text-sm leading-6" style={{ color: fgHex }}>
                  {t("contrast.smallSample")}
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <span
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium"
                    style={{ color: fgHex, borderColor: fgHex }}
                  >
                    {t("contrast.buttonOutline")}
                  </span>
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
                    style={{ backgroundColor: fgHex, color: bgHex }}
                  >
                    {t("contrast.buttonFilled")}
                  </span>
                </div>
              </div>
            </div>

            {/* Reversed preview */}
            <div
              className="mt-3 overflow-hidden rounded-[1.4rem] border border-black/6"
              style={{ backgroundColor: fgHex }}
            >
              <div className="p-6 sm:p-8">
                <p className="text-sm leading-6" style={{ color: bgHex }}>
                  {t("contrast.reversed")}
                </p>
              </div>
            </div>
          </div>

          {/* WCAG results */}
          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-black/6 bg-white/80 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                {t("contrast.contrastRatio")}
              </div>
              <div className="mt-3 text-5xl font-bold tracking-[-0.04em] text-neutral-950">
                {wcag.ratio}
                <span className="text-lg font-medium text-neutral-400"> : 1</span>
              </div>
              <div className="mt-3 text-sm leading-6 text-neutral-600">
                {wcag.ratio >= 7
                  ? t("contrast.excellent")
                  : wcag.ratio >= 4.5
                    ? t("contrast.good")
                    : wcag.ratio >= 3
                      ? t("contrast.moderate")
                      : t("contrast.poor")}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-black/6 bg-white/80 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <div className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                {t("contrast.wcagCompliance")}
              </div>
              <div className="space-y-2">
                <WcagBadge label={t("contrast.normalText")} level="AA (4.5:1)" result={wcag.aaNormal} />
                <WcagBadge label={t("contrast.largeText")} level="AA (3:1)" result={wcag.aaLarge} />
                <WcagBadge label={t("contrast.normalText")} level="AAA (7:1)" result={wcag.aaaNormal} />
                <WcagBadge label={t("contrast.largeText")} level="AAA (4.5:1)" result={wcag.aaaLarge} />
                <WcagBadge label={t("contrast.uiComponents")} level="AA (3:1)" result={wcag.aaUi} />
              </div>
            </div>
          </div>
        </section>

        {/* Color blindness simulation */}
        <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
            {t("contrast.colorBlindness")}
          </div>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            {t("contrast.colorBlindnessDesc")}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {([
              { name: "Normal", simulate: (r: number, g: number, b: number) => [r, g, b] as const },
              { name: "Protanopia", simulate: (r: number, g: number, b: number) => [0.567*r+0.433*g, 0.558*r+0.442*g, 0.242*g+0.758*b] as const },
              { name: "Deuteranopia", simulate: (r: number, g: number, b: number) => [0.625*r+0.375*g, 0.7*r+0.3*g, 0.3*g+0.7*b] as const },
              { name: "Tritanopia", simulate: (r: number, g: number, b: number) => [0.95*r+0.05*g, 0.433*g+0.567*b, 0.475*g+0.525*b] as const },
            ] as const).map(({ name, simulate }) => {
              const fgR = parseInt(fgHex.slice(1, 3), 16);
              const fgG = parseInt(fgHex.slice(3, 5), 16);
              const fgB = parseInt(fgHex.slice(5, 7), 16);
              const bgR = parseInt(bgHex.slice(1, 3), 16);
              const bgG = parseInt(bgHex.slice(3, 5), 16);
              const bgB = parseInt(bgHex.slice(5, 7), 16);
              const [sfr, sfg, sfb] = simulate(fgR, fgG, fgB);
              const [sbr, sbg, sbb] = simulate(bgR, bgG, bgB);
              const simFg = `rgb(${Math.round(sfr)},${Math.round(sfg)},${Math.round(sfb)})`;
              const simBg = `rgb(${Math.round(sbr)},${Math.round(sbg)},${Math.round(sbb)})`;
              return (
                <div key={name} className="rounded-[1.2rem] border border-black/6 overflow-hidden">
                  <div className="p-4" style={{ backgroundColor: simBg }}>
                    <div className="text-lg font-semibold" style={{ color: simFg }}>Aa</div>
                    <div className="mt-1 text-sm" style={{ color: simFg }}>Sample text</div>
                  </div>
                  <div className="bg-neutral-50 px-4 py-2 text-xs font-medium text-neutral-700">{name}</div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-black/6 bg-neutral-950 p-5 text-white shadow-[0_18px_48px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white dark:text-neutral-950">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-white/40 dark:text-neutral-400">
            {t("contrast.ctaLabel")}
          </div>
          <p className="mt-2 text-lg font-semibold tracking-[-0.02em]">
            {t("contrast.ctaTitle")}
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60 dark:text-neutral-500">
            {t("contrast.ctaDesc")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/packs/dark-mode-ui-kit/"
              className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-950 transition hover:bg-neutral-200 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800"
            >
              {t("contrast.darkModeKit")}
            </Link>
            <Link
              href="/packs/"
              className="rounded-full border border-white/16 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/80 transition hover:border-white/30 hover:text-white dark:border-black/16 dark:text-neutral-600 dark:hover:border-black/30 dark:hover:text-neutral-950"
            >
              {t("contrast.browseAllPacks")}
            </Link>
            <Link
              href="/free-pack/"
              className="rounded-full border border-white/16 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/80 transition hover:border-white/30 hover:text-white dark:border-black/16 dark:text-neutral-600 dark:hover:border-black/30 dark:hover:text-neutral-950"
            >
              {t("contrast.freeDownload")}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
