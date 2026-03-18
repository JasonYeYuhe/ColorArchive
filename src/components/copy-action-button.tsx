"use client";

import { useEffect, useState } from "react";

interface CopyActionButtonProps {
  copiedLabel?: string;
  label: string;
  value: string;
}

export function CopyActionButton({
  copiedLabel,
  label,
  value,
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
      className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
    >
      {copied ? copiedLabel ?? `${label} copied` : label}
    </button>
  );
}
