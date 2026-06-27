import { colors as archiveColors } from "@/src/data/colors";
import { hexToRgb, hslToRgb, rgbToHex, rgbToHsl } from "@/src/lib/color-utils";
import type { ColorRecord } from "@/src/types/color";

/**
 * Palette Audit — core algorithm
 *
 * Input: raw text (CSS, Tailwind config, token JSON, or a plain list).
 * Output: one AuditResult with extracted colors, nearest archive matches,
 * intra-palette contrast matrix, near-duplicate clusters, and specific
 * remediation suggestions.
 *
 * Designed to be testable as pure functions — no DOM, no React, no side
 * effects. UI lives in src/components/palette-audit-page.tsx.
 */

export interface ExtractedColor {
  /** Normalized 6-digit hex, uppercase, with leading "#" */
  hex: string;
  /** Raw token from the source (e.g. "#abc", "rgb(50,100,150)", "hsl(...)"). */
  raw: string;
  /** How many times this color appears in the input. */
  count: number;
}

export interface NearestMatch {
  source: ExtractedColor;
  archive: ColorRecord | null;
  /** Perceptual distance between source and archive in HSL-weighted score space. */
  score: number;
  /** Delta-E-ish distance in sRGB space (Euclidean weighted). */
  rgbDistance: number;
}

export interface ContrastPair {
  a: ExtractedColor;
  b: ExtractedColor;
  ratio: number;
  /** "AAA" (>= 7), "AA" (>= 4.5), "AA Large" (>= 3), or "fail" (< 3). */
  grade: "AAA" | "AA" | "AA Large" | "fail";
}

export interface DuplicateCluster {
  /** Source colors within `threshold` RGB distance of each other. */
  members: ExtractedColor[];
  /** Best representative (highest-count member). */
  representative: ExtractedColor;
}

export interface AuditSuggestion {
  kind: "duplicate" | "low-contrast" | "non-archive";
  /** Human-readable issue. */
  message: string;
  /** Affected source colors. */
  colors: ExtractedColor[];
  /** Suggested replacement (ColorArchive ID when applicable). */
  suggestion?: {
    fromHex: string;
    toHex: string;
    archiveId: string;
    archiveName: string;
    rationale: string;
  };
}

export interface AuditResult {
  extracted: ExtractedColor[];
  matches: NearestMatch[];
  duplicates: DuplicateCluster[];
  /** All pairwise contrast checks between extracted colors. */
  contrastMatrix: ContrastPair[];
  /** Contrast pairs that fail AA for normal text (< 4.5). */
  lowContrastPairs: ContrastPair[];
  suggestions: AuditSuggestion[];
  /** True when the input had more unique colors than MAX_AUDIT_COLORS and the
   *  analysis was capped to the most-used ones (keeps the O(n²) contrast matrix
   *  + O(n×archive) matching bounded so a huge paste can't freeze the tab). */
  truncated: boolean;
  /** Short top-line verdict for the UI. */
  summary: {
    totalColors: number;
    /** Unique colors actually analyzed (≤ MAX_AUDIT_COLORS). */
    uniqueColors: number;
    /** Total unique colors found in the input, before any cap. */
    totalUniqueColors: number;
    duplicateGroups: number;
    lowContrastCount: number;
    nonArchiveCount: number;
  };
}

/**
 * Hard cap on how many unique colors we fully analyze. The contrast matrix is
 * O(n²) and archive matching is O(n × 5,446); a pasted token dump with hundreds
 * of colors would otherwise run hundreds of millions of synchronous ops and
 * freeze the page (this is the highest-intent page feeding the pre-order funnel).
 * Colors are ranked by occurrence count, so the cap keeps the most-used ones.
 */
export const MAX_AUDIT_COLORS = 60;

// -------------------------------------------------------------------------
// Color extraction
// -------------------------------------------------------------------------

const HEX_PATTERN = /#([0-9a-fA-F]{3,8})\b/g;
// rgb(0, 0, 0), rgb(0 0 0), rgb(0 0 0 / 0.5), rgba(...) — all handled
const RGB_PATTERN =
  /rgba?\(\s*(\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)(?:\s*[,/]\s*[\d.]+)?\s*\)/g;
const HSL_PATTERN =
  /hsla?\(\s*(\d+(?:\.\d+)?)\s*,?\s*(\d+(?:\.\d+)?)%\s*,?\s*(\d+(?:\.\d+)?)%(?:\s*[,/]\s*[\d.]+)?\s*\)/g;

function normalizeHex(raw: string): string | null {
  const match = raw.match(/^#?([0-9a-fA-F]+)$/);
  if (!match) return null;
  const h = match[1];
  // Expand shorthand #abc → #aabbcc.
  if (h.length === 3) {
    return "#" + h.split("").map((c) => c + c).join("").toUpperCase();
  }
  // Drop alpha if 8-digit (#rrggbbaa) — we audit opaque colors only.
  if (h.length === 8) return "#" + h.slice(0, 6).toUpperCase();
  if (h.length === 6) return "#" + h.toUpperCase();
  return null;
}

/**
 * Parse an arbitrary blob of text and return every hex/rgb/hsl value found.
 * Duplicates are collapsed into a single ExtractedColor with an incremented
 * count so the audit can show which colors dominate the input.
 */
export function extractColorsFromText(input: string): ExtractedColor[] {
  const buckets = new Map<string, ExtractedColor>();

  const push = (raw: string, hex: string) => {
    const existing = buckets.get(hex);
    if (existing) {
      existing.count += 1;
    } else {
      buckets.set(hex, { hex, raw, count: 1 });
    }
  };

  let m: RegExpExecArray | null;

  HEX_PATTERN.lastIndex = 0;
  while ((m = HEX_PATTERN.exec(input)) !== null) {
    const hex = normalizeHex(m[0]);
    if (hex) push(m[0], hex);
  }

  RGB_PATTERN.lastIndex = 0;
  while ((m = RGB_PATTERN.exec(input)) !== null) {
    const r = Math.min(255, Math.max(0, Math.round(Number(m[1]))));
    const g = Math.min(255, Math.max(0, Math.round(Number(m[2]))));
    const b = Math.min(255, Math.max(0, Math.round(Number(m[3]))));
    push(m[0], rgbToHex({ r, g, b }));
  }

  HSL_PATTERN.lastIndex = 0;
  while ((m = HSL_PATTERN.exec(input)) !== null) {
    const rgb = hslToRgb(Number(m[1]), Number(m[2]), Number(m[3]));
    push(m[0], rgbToHex(rgb));
  }

  return Array.from(buckets.values()).sort((a, b) => b.count - a.count);
}

// -------------------------------------------------------------------------
// Matching to ColorArchive
// -------------------------------------------------------------------------

function rgbDistance(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
): number {
  // Weighted Euclidean in sRGB (human perception: green matters most,
  // red middle, blue least). Good enough for "is this nearly the same
  // color" without dragging an OKLAB port into the hot path.
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(2 * dr * dr + 4 * dg * dg + 3 * db * db);
}

function hslScore(aHsl: { h: number; s: number; l: number }, c: ColorRecord): number {
  const hueDiff = Math.min(Math.abs(c.hue - aHsl.h), 360 - Math.abs(c.hue - aHsl.h));
  return hueDiff * 1.8 + Math.abs(c.saturation - aHsl.s) * 0.7 + Math.abs(c.lightness - aHsl.l) * 1.15;
}

/**
 * For each extracted color, find the closest ColorArchive entry.
 * Uses the same HSL-weighted scoring that src/lib/color-relationships.ts
 * uses (so the nearest match here is the same one a user would see on a
 * color-detail page), plus a separate RGB distance so "non-archive" flags
 * can trigger off perceptual closeness rather than only HSL score.
 */
export function matchToArchive(extracted: ExtractedColor[]): NearestMatch[] {
  return extracted.map((source) => {
    const rgb = hexToRgb(source.hex);
    if (!rgb) return { source, archive: null, score: Infinity, rgbDistance: Infinity };
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    let best: ColorRecord | null = null;
    let bestScore = Infinity;
    for (const c of archiveColors) {
      const s = hslScore(hsl, c);
      if (s < bestScore) {
        bestScore = s;
        best = c;
      }
    }
    let bestRgbDist = Infinity;
    if (best) {
      const archiveRgb = hexToRgb(best.hex);
      if (archiveRgb) bestRgbDist = rgbDistance(rgb, archiveRgb);
    }
    return { source, archive: best, score: bestScore, rgbDistance: bestRgbDist };
  });
}

// -------------------------------------------------------------------------
// Contrast + duplicates
// -------------------------------------------------------------------------

function srgbChannel(value: number): number {
  const v = value / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function relativeLuminance(r: number, g: number, b: number): number {
  return (
    0.2126 * srgbChannel(r) +
    0.7152 * srgbChannel(g) +
    0.0722 * srgbChannel(b)
  );
}

export function contrastRatioHex(a: string, b: string): number {
  const ra = hexToRgb(a);
  const rb = hexToRgb(b);
  if (!ra || !rb) return 1;
  const la = relativeLuminance(ra.r, ra.g, ra.b);
  const lb = relativeLuminance(rb.r, rb.g, rb.b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}

function grade(ratio: number): ContrastPair["grade"] {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA Large";
  return "fail";
}

/** Pairwise contrast for every 2-combination of extracted colors. */
export function buildContrastMatrix(extracted: ExtractedColor[]): ContrastPair[] {
  const pairs: ContrastPair[] = [];
  for (let i = 0; i < extracted.length; i++) {
    for (let j = i + 1; j < extracted.length; j++) {
      const a = extracted[i];
      const b = extracted[j];
      const ratio = contrastRatioHex(a.hex, b.hex);
      pairs.push({ a, b, ratio, grade: grade(ratio) });
    }
  }
  return pairs;
}

/**
 * Group colors whose pairwise RGB distance is below `threshold`. A
 * threshold of ~24 catches "#2563EB" vs "#2564EB" style near-dupes that
 * drift into design tokens from copy-paste; 48 catches shade-ladder
 * adjacents that probably should be one token.
 */
export function findDuplicates(
  extracted: ExtractedColor[],
  threshold = 24,
): DuplicateCluster[] {
  const clusters: DuplicateCluster[] = [];
  const claimed = new Set<string>();
  for (const source of extracted) {
    if (claimed.has(source.hex)) continue;
    const rgb = hexToRgb(source.hex);
    if (!rgb) continue;
    const members: ExtractedColor[] = [source];
    claimed.add(source.hex);
    for (const other of extracted) {
      if (claimed.has(other.hex)) continue;
      const otherRgb = hexToRgb(other.hex);
      if (!otherRgb) continue;
      if (rgbDistance(rgb, otherRgb) <= threshold) {
        members.push(other);
        claimed.add(other.hex);
      }
    }
    if (members.length > 1) {
      const representative = members.reduce((a, b) => (a.count >= b.count ? a : b));
      clusters.push({ members, representative });
    }
  }
  return clusters;
}

// -------------------------------------------------------------------------
// Suggestions / top-level audit
// -------------------------------------------------------------------------

/** How tight a source color must be to its nearest archive to be "on-system". */
const ARCHIVE_NEAR_THRESHOLD_RGB = 18;

function buildSuggestions(
  extracted: ExtractedColor[],
  matches: NearestMatch[],
  duplicates: DuplicateCluster[],
  lowContrastPairs: ContrastPair[],
): AuditSuggestion[] {
  const suggestions: AuditSuggestion[] = [];

  for (const cluster of duplicates) {
    const rep = cluster.representative;
    const match = matches.find((m) => m.source.hex === rep.hex)?.archive;
    suggestions.push({
      kind: "duplicate",
      message: `${cluster.members.length} colors within ~24 sRGB units of each other — consolidate to one token.`,
      colors: cluster.members,
      suggestion: match
        ? {
            fromHex: rep.hex,
            toHex: match.hex,
            archiveId: match.id,
            archiveName: match.name,
            rationale: `Replace all ${cluster.members.length} near-duplicates with ${match.name} (${match.id}).`,
          }
        : undefined,
    });
  }

  for (const pair of lowContrastPairs.slice(0, 10)) {
    const severity =
      pair.grade === "fail"
        ? "fails WCAG AA for normal AND large text"
        : "passes AA Large (≥3) but fails AA for normal text (<4.5)";
    suggestions.push({
      kind: "low-contrast",
      message: `Contrast ${pair.ratio}:1 between ${pair.a.hex} and ${pair.b.hex} ${severity}.`,
      colors: [pair.a, pair.b],
    });
  }

  for (const match of matches) {
    if (!match.archive) continue;
    if (match.rgbDistance <= ARCHIVE_NEAR_THRESHOLD_RGB) continue;
    // Only flag the top 8 "not on-system" colors to keep the suggestion
    // list actionable. Users with 50-color systems don't need 50 rows.
    if (suggestions.filter((s) => s.kind === "non-archive").length >= 8) break;
    suggestions.push({
      kind: "non-archive",
      message: `${match.source.hex} is not in the ColorArchive system (nearest: ${match.archive.name}).`,
      colors: [match.source],
      suggestion: {
        fromHex: match.source.hex,
        toHex: match.archive.hex,
        archiveId: match.archive.id,
        archiveName: match.archive.name,
        rationale: `Snap to the nearest named token so it's searchable, documentable, and re-usable.`,
      },
    });
  }

  return suggestions;
}

export function audit(input: string, maxColors: number = MAX_AUDIT_COLORS): AuditResult {
  const allExtracted = extractColorsFromText(input);
  // Cap to the most-used colors BEFORE the expensive matrix/matching steps.
  // extractColorsFromText already sorts by count desc, so slice keeps signal.
  const extracted =
    allExtracted.length > maxColors ? allExtracted.slice(0, maxColors) : allExtracted;
  const truncated = allExtracted.length > extracted.length;
  const matches = matchToArchive(extracted);
  const duplicates = findDuplicates(extracted);
  const contrastMatrix = buildContrastMatrix(extracted);
  // "low-contrast" means "fails WCAG AA for normal text" — strictly ratio < 4.5.
  // Pairs that reach AA Large (≥3) still pass for 18pt+ or bold 14pt+ text and
  // must NOT be flagged as failures or the audit will cry wolf on perfectly
  // compliant heading colors.
  const lowContrastPairs = contrastMatrix
    .filter((p) => p.ratio < 4.5)
    .sort((a, b) => a.ratio - b.ratio);
  const suggestions = buildSuggestions(
    extracted,
    matches,
    duplicates,
    lowContrastPairs,
  );
  const nonArchiveCount = matches.filter(
    (m) => m.archive && m.rgbDistance > ARCHIVE_NEAR_THRESHOLD_RGB,
  ).length;

  return {
    extracted,
    matches,
    duplicates,
    contrastMatrix,
    lowContrastPairs,
    suggestions,
    truncated,
    summary: {
      totalColors: extracted.reduce((a, c) => a + c.count, 0),
      uniqueColors: extracted.length,
      totalUniqueColors: allExtracted.length,
      duplicateGroups: duplicates.length,
      lowContrastCount: lowContrastPairs.length,
      nonArchiveCount,
    },
  };
}
