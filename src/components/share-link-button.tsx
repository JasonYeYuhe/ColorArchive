"use client";

import { useEffect, useState } from "react";

interface ShareLinkButtonProps {
  href: string;
  label?: string;
}

export function ShareOnXButton({ text, href }: { text: string; href: string }) {
  function handleShare() {
    const url = new URL(href, typeof window !== "undefined" ? window.location.origin : "https://colorarchive.me").toString();
    const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=550,height=420");
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
    >
      Share on X
    </button>
  );
}

export function ShareLinkButton({ href, label = "Share link" }: ShareLinkButtonProps) {
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
      const absoluteUrl = new URL(href, window.location.origin).toString();
      await navigator.clipboard.writeText(absoluteUrl);
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
      {copied ? "Link copied" : label}
    </button>
  );
}
