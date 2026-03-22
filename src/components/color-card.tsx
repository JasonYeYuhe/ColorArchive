"use client";

import Link from "next/link";
import { memo, useEffect, useState } from "react";
import { FavoriteButton } from "@/src/components/favorite-button";
import { useLocale } from "@/src/components/locale-provider";
import { addToPalette, getPaletteIds, subscribeToPalette, MAX_SIZE } from "@/src/lib/palette-builder";
import type { ColorRecord } from "@/src/types/color";

interface ColorCardProps {
  color: ColorRecord;
  isSelected?: boolean;
  onSelect?: (colorId: string) => void;
}

export const ColorCard = memo(function ColorCard({ color, isSelected = false, onSelect }: ColorCardProps) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);
  const [inPalette, setInPalette] = useState(false);
  const [paletteSize, setPaletteSize] = useState(0);

  useEffect(() => {
    const update = (ids: string[]) => {
      setInPalette(ids.includes(color.id));
      setPaletteSize(ids.length);
    };
    const initial = getPaletteIds();
    update(initial);
    return subscribeToPalette(update);
  }, [color.id]);

  useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(color.hex);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const handleSelect = () => {
    onSelect?.(color.id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleSelect();
        }
      }}
      className={`group cursor-pointer overflow-hidden rounded-[1.6rem] border bg-white/90 shadow-[0_18px_48px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_64px_rgba(15,23,42,0.11)] focus:outline-none focus:ring-4 focus:ring-neutral-900/10 dark:bg-neutral-900/80 dark:shadow-none ${
        isSelected ? "border-neutral-950/14 ring-2 ring-neutral-900/6 dark:border-white/14" : "border-black/6 dark:border-white/10"
      }`}
      aria-label={`${t("color.select")} ${color.name}`}
      aria-pressed={isSelected}
    >
      <div className="relative">
        <div
          className="swatch-shadow h-36 w-full border-b border-black/6 sm:h-40"
          style={{ backgroundColor: color.hex }}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between gap-3">
          <div className="rounded-full border border-white/30 bg-white/18 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/92 backdrop-blur-md">
            {color.family}
          </div>
          <div className="rounded-full border border-white/30 bg-black/18 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white backdrop-blur-md">
            H {color.hue}
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
              {color.name}
            </div>
            <div className="mt-1 text-xs uppercase tracking-[0.16em] text-neutral-400 dark:text-neutral-500">
              {color.hsl}
            </div>
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              void handleCopy();
            }}
            className="rounded-full border border-black/8 bg-neutral-950 px-3 py-1.5 text-xs font-medium tracking-[0.08em] text-white transition hover:bg-neutral-800 focus:outline-none focus:ring-4 focus:ring-neutral-900/10"
            aria-label={`Copy ${color.hex} to clipboard`}
          >
            {copied ? t("color.copied") : t("color.copy")}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <FavoriteButton colorId={color.id} />
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              addToPalette(color.id);
            }}
            disabled={inPalette || paletteSize >= MAX_SIZE}
            title={inPalette ? t("color.alreadyInPalette") : paletteSize >= MAX_SIZE ? `${t("color.paletteFull")} (${MAX_SIZE})` : t("color.addToPalette")}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-4 focus:ring-neutral-900/10 ${
              inPalette
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : paletteSize >= MAX_SIZE
                  ? "cursor-not-allowed border-black/8 bg-neutral-50 text-neutral-300"
                  : "border-black/8 bg-white text-neutral-600 hover:border-neutral-950/10 hover:bg-neutral-950 hover:text-white"
            }`}
            aria-label={inPalette ? t("color.inPalette") : t("color.addToPalette")}
          >
            {inPalette ? `✓ ${t("color.inPalette")}` : `+ ${t("color.addToPalette")}`}
          </button>
        </div>

        <dl className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-neutral-400 dark:text-neutral-500">Hex</dt>
            <dd>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void handleCopy();
                }}
                className="font-medium text-neutral-950 transition hover:text-neutral-600 focus:outline-none dark:text-white dark:hover:text-neutral-400"
                aria-label={`Copy hex value ${color.hex}`}
              >
                {color.hex}
              </button>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-neutral-400 dark:text-neutral-500">RGB</dt>
            <dd className="font-medium text-neutral-950 dark:text-white">{color.rgb}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2 pt-1">
          <span className="rounded-full border border-black/6 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-500 dark:border-white/10 dark:bg-white/8 dark:text-neutral-400">
            Sat {color.saturation}%
          </span>
          <span className="rounded-full border border-black/6 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-500 dark:border-white/10 dark:bg-white/8 dark:text-neutral-400">
            Light {color.lightness}%
          </span>
          <span className="rounded-full border border-black/6 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-500 dark:border-white/10 dark:bg-white/8 dark:text-neutral-400">
            {color.family}
          </span>
        </div>

        <div className="flex justify-end pt-1">
          <Link
            href={`/colors/${color.id}/`}
            onClick={(event) => event.stopPropagation()}
            className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-400 dark:hover:bg-white dark:hover:text-neutral-950"
          >
            {t("color.openDetail")}
          </Link>
        </div>
      </div>
    </div>
  );
});
