"use client";

import { useEffect, useState } from "react";

import { writeClipboard } from "@/src/lib/clipboard";
import { track } from "@/src/lib/track";

interface CopyActionButtonProps {
  copiedLabel?: string;
  label: string;
  value: string;
  /**
   * Analytics name for this button. Required in practice even though the type
   * allows omitting it: two of the four call sites both pass label="Copy", so
   * without it they collapse into one indistinguishable bucket — the same
   * cardinality mistake as `label={color.hex}`, just in the other direction.
   */
  trackAs?: string;
}

export function CopyActionButton({
  copiedLabel,
  label,
  value,
  trackAs,
}: CopyActionButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  const handleCopy = async () => {
    // This component emitted NOTHING before 2026-08-25, which is worse than the
    // silent-catch bug next door in copy-button.tsx: these four call sites are
    // the whole-palette exports (Copy CSS / Copy Tailwind on the 256 collection
    // pages, the brand-system export, the dark-mode pair export) — plausibly the
    // highest-intent "took it away to use it" action on the site. None of them
    // has ever appeared in `color_copied`, so the 2.8% take-away rate was
    // computed with this population missing from the numerator entirely.
    const format = trackAs ?? label;
    const result = await writeClipboard(value);

    if (!result.ok) {
      setCopied(false);
      track("color_copy_failed", { format, variant: "action", reason: result.reason });
      return;
    }

    setCopied(true);
    track("color_copied", { format, variant: "action" });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
    >
      {copied ? copiedLabel ?? `${label} copied` : label}
    </button>
  );
}
