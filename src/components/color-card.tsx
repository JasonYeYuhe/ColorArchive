"use client";

import { useEffect, useState } from "react";
import type { ColorRecord } from "@/src/types/color";

interface ColorCardProps {
  color: ColorRecord;
  isSelected?: boolean;
  onSelect?: (colorId: string) => void;
}

export function ColorCard({ color, isSelected = false, onSelect }: ColorCardProps) {
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
    <article
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleSelect();
        }
      }}
      className={`group overflow-hidden rounded-[1.6rem] border bg-white/90 shadow-[0_18px_48px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_64px_rgba(15,23,42,0.11)] focus:outline-none focus:ring-4 focus:ring-neutral-900/10 ${
        isSelected ? "border-neutral-950/14 ring-2 ring-neutral-900/6" : "border-black/6"
      }`}
      aria-label={`Select ${color.name}`}
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
            <div className="text-base font-semibold tracking-[-0.02em] text-neutral-950">
              {color.name}
            </div>
            <div className="mt-1 text-xs uppercase tracking-[0.16em] text-neutral-400">
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
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <dl className="space-y-2 text-sm text-neutral-600">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-neutral-400">Hex</dt>
            <dd>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void handleCopy();
                }}
                className="font-medium text-neutral-950 transition hover:text-neutral-600 focus:outline-none"
                aria-label={`Copy hex value ${color.hex}`}
              >
                {color.hex}
              </button>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-neutral-400">RGB</dt>
            <dd className="font-medium text-neutral-950">{color.rgb}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2 pt-1">
          <span className="rounded-full border border-black/6 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-500">
            Sat {color.saturation}%
          </span>
          <span className="rounded-full border border-black/6 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-500">
            Light {color.lightness}%
          </span>
          <span className="rounded-full border border-black/6 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-500">
            {color.family}
          </span>
        </div>
      </div>
    </article>
  );
}
