/**
 * SVG export watermark — Free & anonymous users get a small
 * "colorarchive.org" attribution stamped onto their downloaded asset.
 * Pro users get the asset clean.
 *
 * Why: visual exports are the most common artifact users share with
 * teammates and clients. Adding a passive watermark turns every Free
 * download into a small marketing asset (the recipient sees the URL),
 * and removing it becomes a concrete reason to upgrade.
 */
import type { UserTier } from "@/src/lib/auth-client";

const WATERMARK_TEXT = "colorarchive.org";

/**
 * Append a small "colorarchive.org" tag to an SVG string for non-Pro
 * tiers. The watermark uses the SVG's existing dimensions (read from
 * the width attribute) and is positioned in the bottom-right corner
 * with low opacity to avoid being intrusive.
 *
 * For unrecognised SVG shape (no width attr) the function returns the
 * original string untouched — better to ship the asset without a
 * watermark than ship a broken SVG.
 */
export function withSvgWatermark(svg: string, tier: UserTier): string {
  if (tier === "pro") return svg;

  // Only inspect the opening <svg ...> tag — `<rect width="...">` etc.
  // would otherwise satisfy the match.
  const openTagMatch = svg.match(/<svg\b[^>]*>/);
  if (!openTagMatch) return svg;
  const openTag = openTagMatch[0];
  const widthMatch = openTag.match(/\swidth="(\d+(?:\.\d+)?)"/);
  const heightMatch = openTag.match(/\sheight="(\d+(?:\.\d+)?)"/);
  if (!widthMatch || !heightMatch) return svg;

  const w = Number.parseFloat(widthMatch[1]);
  const h = Number.parseFloat(heightMatch[1]);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return svg;

  const fontSize = Math.max(10, Math.min(16, Math.round(Math.min(w, h) * 0.025)));
  const padX = Math.round(w * 0.02);
  const padY = Math.round(h * 0.025);
  const x = w - padX;
  const y = h - padY;

  const watermarkNode =
    `<text x="${x}" y="${y}" text-anchor="end" font-family="system-ui, -apple-system, sans-serif" ` +
    `font-size="${fontSize}" fill="rgba(0,0,0,0.32)" font-weight="500">${WATERMARK_TEXT}</text>`;

  // Insert before the closing </svg> so it's the topmost node and
  // therefore drawn last (visible above any fills above it).
  return svg.replace(/<\/svg>\s*$/, `${watermarkNode}</svg>`);
}

export const EXPORT_WATERMARK_TEXT = WATERMARK_TEXT;
