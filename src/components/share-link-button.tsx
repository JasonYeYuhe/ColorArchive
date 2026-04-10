"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/src/components/locale-provider";
import { SITE_URL } from "@/src/lib/site-config";

interface ShareLinkButtonProps {
  href: string;
  label?: string;
}

export function ShareOnXButton({ text, href }: { text: string; href: string }) {
  const { t } = useLocale();

  function handleShare() {
    const url = new URL(href, typeof window !== "undefined" ? window.location.origin : SITE_URL).toString();
    const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=550,height=420");
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-400 dark:hover:bg-white dark:hover:text-neutral-950"
    >
      {t("share.shareOnX")}
    </button>
  );
}

export function ShareLinkButton({ href, label }: ShareLinkButtonProps) {
  const { t } = useLocale();
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
      className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-400 dark:hover:bg-white dark:hover:text-neutral-950"
    >
      {copied ? t("share.linkCopied") : (label ?? t("share.shareLink"))}
    </button>
  );
}
