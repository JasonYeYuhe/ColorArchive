"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FavoriteButton } from "@/src/components/favorite-button";
import { ShareLinkButton } from "@/src/components/share-link-button";
import { useLocale } from "@/src/components/locale-provider";
import { addRecentColor } from "@/src/lib/recent-colors";
import { writeClipboard } from "@/src/lib/clipboard";
import { track } from "@/src/lib/track";
import type { ColorRecord } from "@/src/types/color";

interface SelectedColorPanelProps {
  color: ColorRecord | null;
  nearbyColors: readonly ColorRecord[];
  onSelectColor: (colorId: string) => void;
}

interface CopyActionProps {
  /**
   * Kept as a union rather than `string` on purpose: it rides out as the
   * `value_kind` analytics prop, so it must stay a bounded set of literals.
   */
  label: "hex" | "rgb" | "hsl";
  value: string;
}

/**
 * LOCAL SHADOW of the shared, already-tracked `CopyButton` — this is one of the
 * copy points that the site-wide `color_copied` series missed for exactly that
 * reason. If a new call site is added, or this is ever replaced, the tracking
 * below must come with it: an untracked copy point does not read as "nobody
 * copied", it reads as nothing at all.
 */
function CopyAction({ label, value }: CopyActionProps) {
  const [copied, setCopied] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  const handleCopy = async () => {
    const result = await writeClipboard(value);

    if (result.ok) {
      setCopied(true);
      track("color_copied", {
        format: "archive-swatch",
        variant: "compact",
        value_kind: label,
      });
      return;
    }

    setCopied(false);
    track("color_copy_failed", {
      format: "archive-swatch",
      variant: "compact",
      value_kind: label,
      reason: result.reason,
    });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-400 dark:hover:bg-white dark:hover:text-neutral-950"
    >
      {copied ? `${label} ${t("panel.copied")}` : `${t("panel.copy")} ${label}`}
    </button>
  );
}

export function SelectedColorPanel({
  color,
  nearbyColors,
  onSelectColor,
}: SelectedColorPanelProps) {
  const { t } = useLocale();

  useEffect(() => {
    if (!color) {
      return;
    }

    addRecentColor(color.id);
  }, [color]);

  if (!color) {
    return null;
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(22rem,0.8fr)]">
      <div className="overflow-hidden rounded-[1.8rem] border border-black/6 bg-white/82 shadow-[0_20px_56px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-neutral-900/80">
        <div
          className="relative h-64 border-b border-black/6 sm:h-72"
          style={{ backgroundColor: color.hex }}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.14),transparent_45%,rgba(17,24,39,0.08))]" />
          <div className="absolute left-5 top-5 rounded-full border border-white/30 bg-white/18 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/92 backdrop-blur-md">
            {t("panel.selectedColor")}
          </div>
          <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                {color.name}
              </div>
              <div className="mt-2 text-sm uppercase tracking-[0.2em] text-white/75">
                {color.family} · Hue {color.hue}
              </div>
            </div>
            <div className="rounded-2xl border border-white/24 bg-black/16 px-4 py-3 text-right text-white backdrop-blur-md">
              <div className="text-xs uppercase tracking-[0.16em] text-white/70">Hex</div>
              <div className="mt-1 text-xl font-semibold tracking-[0.04em]">{color.hex}</div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3 dark:border-white/10 dark:bg-white/8">
              <div className="text-xs uppercase tracking-[0.16em] text-neutral-400 dark:text-neutral-500">RGB</div>
              <div className="mt-1 font-medium text-neutral-950 dark:text-white">{color.rgb}</div>
            </div>
            <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3 dark:border-white/10 dark:bg-white/8">
              <div className="text-xs uppercase tracking-[0.16em] text-neutral-400 dark:text-neutral-500">HSL</div>
              <div className="mt-1 font-medium text-neutral-950 dark:text-white">{color.hsl}</div>
            </div>
            <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3 dark:border-white/10 dark:bg-white/8">
              <div className="text-xs uppercase tracking-[0.16em] text-neutral-400 dark:text-neutral-500">{t("panel.balance")}</div>
              <div className="mt-1 font-medium text-neutral-950 dark:text-white">
                S {color.saturation}% · L {color.lightness}%
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            <CopyAction label="hex" value={color.hex} />
            <CopyAction label="rgb" value={color.rgb} />
            <CopyAction label="hsl" value={color.hsl} />
            <FavoriteButton colorId={color.id} />
            <ShareLinkButton href={`/colors/${color.id}/`} />
            <Link
              href={`/colors/${color.id}/`}
              className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-400 dark:hover:bg-white dark:hover:text-neutral-950"
            >
              {t("panel.openDetail")}
            </Link>
            <Link
              href="/recent/"
              className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-400 dark:hover:bg-white dark:hover:text-neutral-950"
            >
              {t("panel.recentTrail")}
            </Link>
          </div>
        </div>
      </div>

      <aside className="rounded-[1.8rem] border border-black/6 bg-white/78 p-5 shadow-[0_20px_56px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-neutral-900/80">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              {t("panel.nearbyPicks")}
            </div>
            <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">
              {t("panel.moreFrom")} {color.family}
            </h3>
          </div>
          <div className="rounded-full border border-black/6 bg-neutral-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500 dark:border-white/10 dark:bg-white/8 dark:text-neutral-400">
            {nearbyColors.length} {t("panel.related")}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {nearbyColors.map((nearbyColor) => {
            const isCurrent = nearbyColor.id === color.id;

            return (
              <button
                key={nearbyColor.id}
                type="button"
                onClick={() => onSelectColor(nearbyColor.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                  isCurrent
                    ? "border-neutral-950/12 bg-neutral-950 text-white dark:border-white/14 dark:bg-white dark:text-neutral-950"
                    : "border-black/6 bg-white hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/12"
                }`}
              >
                <span
                  className="h-11 w-11 rounded-2xl border border-black/6 shadow-sm"
                  style={{ backgroundColor: nearbyColor.hex }}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className={`block truncate font-medium ${isCurrent ? "text-white dark:text-neutral-950" : "text-neutral-950 dark:text-white"}`}>
                    {nearbyColor.name}
                  </span>
                  <span className={`mt-1 block text-sm ${isCurrent ? "text-white/70 dark:text-neutral-500" : "text-neutral-500 dark:text-neutral-400"}`}>
                    {nearbyColor.hex} · {nearbyColor.hsl}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </aside>
    </section>
  );
}
