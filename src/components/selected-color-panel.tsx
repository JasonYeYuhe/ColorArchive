"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FavoriteButton } from "@/src/components/favorite-button";
import { ShareLinkButton } from "@/src/components/share-link-button";
import { addRecentColor } from "@/src/lib/recent-colors";
import type { ColorRecord } from "@/src/types/color";

interface SelectedColorPanelProps {
  color: ColorRecord | null;
  nearbyColors: readonly ColorRecord[];
  onSelectColor: (colorId: string) => void;
}

interface CopyActionProps {
  label: string;
  value: string;
}

function CopyAction({ label, value }: CopyActionProps) {
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

export function SelectedColorPanel({
  color,
  nearbyColors,
  onSelectColor,
}: SelectedColorPanelProps) {
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
      <div className="overflow-hidden rounded-[1.8rem] border border-black/6 bg-white/82 shadow-[0_20px_56px_rgba(15,23,42,0.06)]">
        <div
          className="relative h-64 border-b border-black/6 sm:h-72"
          style={{ backgroundColor: color.hex }}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.14),transparent_45%,rgba(17,24,39,0.08))]" />
          <div className="absolute left-5 top-5 rounded-full border border-white/30 bg-white/18 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/92 backdrop-blur-md">
            Selected color
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
            <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">RGB</div>
              <div className="mt-1 font-medium text-neutral-950">{color.rgb}</div>
            </div>
            <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">HSL</div>
              <div className="mt-1 font-medium text-neutral-950">{color.hsl}</div>
            </div>
            <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">Balance</div>
              <div className="mt-1 font-medium text-neutral-950">
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
              className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
            >
              Open detail
            </Link>
            <Link
              href="/recent"
              className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
            >
              Recent trail
            </Link>
          </div>
        </div>
      </div>

      <aside className="rounded-[1.8rem] border border-black/6 bg-white/78 p-5 shadow-[0_20px_56px_rgba(15,23,42,0.05)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Nearby picks
            </div>
            <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-neutral-950">
              More from {color.family}
            </h3>
          </div>
          <div className="rounded-full border border-black/6 bg-neutral-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
            {nearbyColors.length} related
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
                    ? "border-neutral-950/12 bg-neutral-950 text-white"
                    : "border-black/6 bg-white hover:bg-neutral-50"
                }`}
              >
                <span
                  className="h-11 w-11 rounded-2xl border border-black/6 shadow-sm"
                  style={{ backgroundColor: nearbyColor.hex }}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className={`block truncate font-medium ${isCurrent ? "text-white" : "text-neutral-950"}`}>
                    {nearbyColor.name}
                  </span>
                  <span className={`mt-1 block text-sm ${isCurrent ? "text-white/70" : "text-neutral-500"}`}>
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
