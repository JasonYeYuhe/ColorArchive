"use client";

import { useEffect, useState } from "react";
import type { ColorRecord } from "@/src/types/color";

interface ColorCardProps {
  color: ColorRecord;
}

export function ColorCard({ color }: ColorCardProps) {
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

  return (
    <article className="group overflow-hidden rounded-[1.6rem] border border-black/6 bg-white/86 shadow-[0_18px_48px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_64px_rgba(15,23,42,0.11)]">
      <div
        className="swatch-shadow h-36 w-full border-b border-black/6 sm:h-40"
        style={{ backgroundColor: color.hex }}
        aria-hidden="true"
      />

      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-semibold tracking-[-0.02em] text-neutral-950">
              {color.name}
            </div>
            <div className="mt-1 text-xs uppercase tracking-[0.16em] text-neutral-400">
              {color.family}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopy}
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
                onClick={handleCopy}
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
      </div>
    </article>
  );
}
