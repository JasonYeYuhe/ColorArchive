"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SaveToProjectButton } from "@/src/components/save-to-project";
import {
  buildPaletteCssExport,
  buildPaletteJsonExport,
  buildPaletteTailwindExport,
  buildPaletteFigmaExport,
  generatePaletteName,
  clearPalette,
  getPaletteIds,
  MAX_SIZE,
  removeFromPalette,
  subscribeToPalette,
} from "@/src/lib/palette-builder";
import { colors as allColors } from "@/src/data/colors";
import { useLocale } from "@/src/components/locale-provider";
import type { ColorRecord } from "@/src/types/color";

function ShareButton({ colorIds }: { colorIds: string[] }) {
  const [copied, setCopied] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleShare = async () => {
    try {
      const url = new URL("/palette", window.location.origin);
      url.searchParams.set("ids", colorIds.join(","));
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleShare()}
      className="rounded-full border border-black/8 bg-neutral-950 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-white transition hover:bg-neutral-800"
    >
      {copied ? t("tray.linkCopied") : t("tray.share")}
    </button>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(timer);
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
      onClick={() => void handleCopy()}
      className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
    >
      {copied ? t("tray.copied") : label}
    </button>
  );
}

export function PaletteBuilderTray() {
  const [paletteIds, setPaletteIds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    setPaletteIds(getPaletteIds());
    return subscribeToPalette(setPaletteIds);
  }, []);

  const paletteColors = paletteIds
    .map((id) => allColors.find((c) => c.id === id))
    .filter((c): c is ColorRecord => Boolean(c));

  if (paletteIds.length === 0) return null;

  const paletteName = generatePaletteName(paletteColors);
  const cssExport = buildPaletteCssExport(paletteColors);
  const jsonExport = buildPaletteJsonExport(paletteColors);
  const tailwindExport = buildPaletteTailwindExport(paletteColors);
  const figmaExport = buildPaletteFigmaExport(paletteColors);

  return (
    <div
      className={`fixed z-40 ${
        isOpen
          ? "inset-x-3 bottom-3 sm:bottom-6 sm:left-1/2 sm:right-auto sm:inset-x-auto sm:-translate-x-1/2"
          : "bottom-3 right-3 sm:bottom-6 sm:left-1/2 sm:right-auto sm:-translate-x-1/2"
      }`}
      role="region"
      aria-label="Palette builder"
    >
      <div className="rounded-[1.6rem] border border-black/10 bg-white/92 shadow-[0_24px_64px_rgba(15,23,42,0.18)] backdrop-blur-xl">
        {isOpen ? (
          <div
            className="max-h-[50vh] overflow-y-auto p-4 sm:max-h-[70vh]"
            style={{ minWidth: "min(100%, 20rem)", maxWidth: "min(calc(100vw - 1.5rem), 28rem)" }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                {t("tray.palette")} · {paletteColors.length}/{MAX_SIZE}
              </div>
              <div className="text-sm font-semibold tracking-[-0.01em] text-neutral-800">
                {paletteName}
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-1 rounded-full border border-black/8 px-3 py-1 text-xs text-neutral-500 hover:bg-neutral-50"
                aria-label="Collapse palette builder"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <span className="hidden sm:inline">{t("tray.collapse")}</span>
              </button>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {paletteColors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => removeFromPalette(c.id)}
                  title={`Remove ${c.name}`}
                  className="group relative flex-1 overflow-hidden rounded-xl border border-black/6 transition hover:border-red-200"
                  style={{ minWidth: "2.5rem", height: "3.5rem", backgroundColor: c.hex }}
                  aria-label={`Remove ${c.name} from palette`}
                >
                  <span className="absolute inset-0 hidden items-center justify-center bg-black/30 text-white group-hover:flex">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>
              ))}
              {Array.from({ length: MAX_SIZE - paletteColors.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex-1 rounded-xl border border-dashed border-black/12 bg-neutral-50"
                  style={{ minWidth: "2.5rem", height: "3.5rem" }}
                />
              ))}
            </div>

            <div className="mt-3 text-[11px] text-neutral-400">
              {t("tray.clickToRemove")}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <CopyButton value={cssExport} label={t("tray.copyCss")} />
              <CopyButton value={jsonExport} label={t("tray.copyJson")} />
              <CopyButton value={tailwindExport} label="Tailwind" />
              <CopyButton value={figmaExport} label="Figma" />
              <ShareButton colorIds={paletteIds} />
              <Link
                href={`/palette?ids=${paletteIds.join(",")}`}
                className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-50"
              >
                {t("tray.viewPalette")}
              </Link>
              <SaveToProjectButton
                palette={paletteColors.map((c) => c.hex)}
                defaultName={paletteName}
              />
              <button
                type="button"
                onClick={clearPalette}
                className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-500 transition hover:border-red-200 hover:text-red-600"
              >
                {t("tray.clearAll")}
              </button>
            </div>

            {paletteColors.length >= 3 && (
              <div className="mt-3 border-t border-black/6 pt-3">
                <Link
                  href="/packs/complete-archive/"
                  className="text-[11px] text-neutral-400 transition hover:text-neutral-600"
                >
                  {t("tray.turnIntoTokenPack")} →
                </Link>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 px-3 py-2.5 sm:px-4 sm:py-3"
            aria-label={t("tray.openPaletteBuilder")}
          >
            <div className="flex gap-1">
              {paletteColors.map((c) => (
                <span
                  key={c.id}
                  className="h-4 w-4 rounded-full border border-white/60 shadow-sm sm:h-5 sm:w-5"
                  style={{ backgroundColor: c.hex }}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-700 sm:text-xs">
              {t("tray.palette")} · {paletteColors.length}
            </span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="text-neutral-400">
              <path d="M2 4.5L6 8.5L10 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
