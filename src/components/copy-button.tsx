"use client";

import { useEffect, useRef, useState } from "react";

import { writeClipboard } from "@/src/lib/clipboard";
import { track } from "@/src/lib/track";

interface CopyButtonProps {
  value: string;
  label: string;
  copiedLabel?: string;
  variant?: "pill" | "compact";
  className?: string;
  /**
   * What to call this button in analytics, when `label` is not a stable name.
   * The swatch variant passes the hex itself as its label, which would make
   * every distinct colour its own event category.
   */
  trackAs?: string;
  /**
   * Called only after a CONFIRMED clipboard write — never on a failed one, so a
   * caller cannot react to a copy the visitor did not get. Receives the same
   * `format` the analytics event carries. Added 2026-09-03 so the word tool can
   * offer a next step at the moment a colour is taken away, which is the only
   * moment measured demand actually exists (58% of copies on that page are the
   * bare hex; the paid exports are 3.6%).
   */
  onCopied?: (format: string) => void;
}

export function CopyButton({
  value,
  label,
  copiedLabel,
  variant = "pill",
  className,
  trackAs,
  onCopied,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => { clearTimeout(timerRef.current); }, []);

  const handleCopy = async () => {
    const format = trackAs ?? label;
    const result = await writeClipboard(value);

    if (!result.ok) {
      // The other half of the metric. Previously this branch was an empty catch,
      // so a browser that refused the write was indistinguishable from a visitor
      // who never clicked — see src/lib/clipboard.ts for why that made the
      // take-away rate unusable. Reading `color_copied` alone is still wrong;
      // the honest denominator is `copied + failed`.
      track("color_copy_failed", { format, variant, reason: result.reason });
      return;
    }

    setCopied(true);
    timerRef.current = setTimeout(() => setCopied(false), 1400);
    // Fired only on a confirmed write, and deliberately after setCopied: a copy
    // that failed shows no confirmation to the user and must not show one in the
    // funnel either. This was the single missing step between "generated a
    // palette" and "took it away to use it" — every other event already existed.
    //
    // The copied string is not sent. It is only ever a colour here, but the
    // component is generic and props_json is readable by the admin surface;
    // the funnel needs the count, not the contents.
    track("color_copied", { format, variant });
    onCopied?.(format);
  };

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className={
          className ??
          // The compact variant was a bare 10px text line box — roughly a 14px
          // tall hit area, under the 24px WCAG 2.2 AA minimum (2.5.8) and far
          // under the 44px comfortable-touch figure. The negative margins cancel
          // the padding visually, so every existing layout is unchanged while the
          // target grows to ~30px. focus-visible:ring gives it a keyboard
          // indicator it never had.
          "-mx-2 -my-2 rounded-md px-2 py-2 font-mono text-[10px] uppercase tracking-wider text-neutral-500 transition hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-100 dark:focus-visible:ring-white"
        }
        title={`Copy ${value}`}
      >
        {copied ? (copiedLabel ?? "\u2713") : label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={
        className ??
        "rounded-full border border-black/8 bg-white px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white dark:hover:text-neutral-950"
      }
    >
      {copied ? (copiedLabel ?? `${label} copied`) : `Copy ${label}`}
    </button>
  );
}
