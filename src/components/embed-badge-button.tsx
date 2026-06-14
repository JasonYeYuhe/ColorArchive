"use client";

import { useState } from "react";
import { SITE_URL } from "@/src/lib/site-config";

/**
 * Static HTML "color badge" — the real backlink engine.
 *
 * Unlike the iframe widget (whose links live inside the iframe and pass little
 * SEO value to the host page), this produces a self-contained, inline-styled
 * <a> anchor that the user pastes into their own blog/CMS/README. That anchor
 * lives in the HOST page's DOM, so it's a genuine do-follow backlink to
 * ColorArchive — and it renders with zero JS or external CSS.
 */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildColorBadgeHtml(opts: { hex: string; name: string; id: string }): string {
  const url = `${SITE_URL}/colors/${opts.id}/?utm_source=embed&utm_medium=badge&utm_campaign=color`;
  return (
    `<a href="${url}" target="_blank" rel="noopener" ` +
    `style="display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border:1px solid #e5e7eb;border-radius:9999px;font:500 14px system-ui,-apple-system,sans-serif;color:#111;text-decoration:none;background:#fff">` +
    `<span style="width:16px;height:16px;border-radius:4px;background:${opts.hex};border:1px solid rgba(0,0,0,.12)"></span>` +
    `${escapeHtml(opts.name)} &middot; ${opts.hex} &middot; ColorArchive</a>`
  );
}

export function buildPaletteBadgeHtml(opts: { title: string; path: string; hexes: string[] }): string {
  const sep = opts.path.includes("?") ? "&" : "?";
  const url = `${SITE_URL}${opts.path}${sep}utm_source=embed&utm_medium=badge&utm_campaign=palette`;
  const swatches = opts.hexes
    .slice(0, 8)
    .map(
      (hex) =>
        `<span style="display:inline-block;width:32px;height:32px;border-radius:6px;background:${hex}"></span>`,
    )
    .join("");
  return (
    `<div style="display:inline-block;font:500 13px system-ui,-apple-system,sans-serif;border:1px solid #e5e7eb;border-radius:12px;padding:10px;background:#fff">` +
    `<div style="display:flex;gap:4px;margin-bottom:8px">${swatches}</div>` +
    `<a href="${url}" target="_blank" rel="noopener" style="color:#555;text-decoration:none">${escapeHtml(opts.title)} &middot; ColorArchive</a>` +
    `</div>`
  );
}

export function EmbedBadgeButton({ hex, name, id }: { hex: string; name: string; id: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const html = buildColorBadgeHtml({ hex, name, id });
    navigator.clipboard.writeText(html).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      },
      () => setCopied(false),
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy an HTML badge that links back to this color — paste it into a blog or doc"
      className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
    >
      {copied ? "Embed copied" : "Embed"}
    </button>
  );
}
