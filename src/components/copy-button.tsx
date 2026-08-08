"use client";

import { useEffect, useRef, useState } from "react";

interface CopyButtonProps {
  value: string;
  label: string;
  copiedLabel?: string;
  variant?: "pill" | "compact";
  className?: string;
}

export function CopyButton({
  value,
  label,
  copiedLabel,
  variant = "pill",
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => { clearTimeout(timerRef.current); }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      timerRef.current = setTimeout(() => setCopied(false), 1400);
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
