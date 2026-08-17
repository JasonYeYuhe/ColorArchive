"use client";

import { useEffect, useRef, useState } from "react";

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
}

export function CopyButton({
  value,
  label,
  copiedLabel,
  variant = "pill",
  className,
  trackAs,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => { clearTimeout(timerRef.current); }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      timerRef.current = setTimeout(() => setCopied(false), 1400);
      // Fired only after writeText resolves, and deliberately after setCopied:
      // a copy that threw (clipboard permission denied, insecure context, an
      // embedded webview without the API) shows no confirmation to the user and
      // must not show one in the funnel either. This was the single missing step
      // between "generated a palette" and "took it away to use it" — every other
      // event on this path already existed.
      //
      // The copied string is not sent. It is only ever a colour here, but the
      // component is generic and props_json is readable by the admin surface;
      // the funnel needs the count, not the contents.
      track("color_copied", { format: trackAs ?? label, variant });
    } catch {
      /* noop */
    }
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
