/**
 * Xiaohongshu (小红书) daily mood-palette image generator.
 *
 * Output:  1242 × 1656 (3:4 vertical — XHS native aspect for best feed render)
 *
 * Unlike the Instagram single-swatch template, XHS users save posts to
 * "配色灵感" (color inspiration) boards and strongly prefer multi-color
 * palettes they can reference. Each day's image shows:
 *   - 1 primary color (the COTD)
 *   - 2 analogous companions (±24° hue)
 *   - 1 complementary accent (+180° hue)
 *
 * This gives each day three times the visual variety of the IG template
 * and makes the feed feel distinct day-over-day even beyond the hue
 * diversity added by COTD v2 (see docs/color-of-day-redesign.md).
 *
 * Images are saved to server/generated/ and served via Express static
 * middleware — same pattern as ig-image-generator.js.
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const GENERATED_DIR = path.join(__dirname, "generated");
const XHS_W = 1242;
const XHS_H = 1656;

if (!fs.existsSync(GENERATED_DIR)) {
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
}

const SITE_DOMAIN = (process.env.FRONTEND_ORIGIN || "https://colorarchive.org")
  .replace(/^https?:\/\//, "")
  .replace(/\/$/, "");

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function textColorFor(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.5 ? "#1a1a1a" : "#ffffff";
}

function subtextColorFor(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.5 ? "#555555" : "#cccccc";
}

/* ────────────────────────────────────────────
 *  Palette builder — defensive fallbacks
 * ──────────────────────────────────────────── */

/**
 * Build a 4-color mood palette anchored on `base`.
 * Returns { primary, analogous1, analogous2, complementary }.
 *
 * Uses the existing `getAnalogous` (±24° hue, tight L/S tolerance) first
 * and progressively widens tolerance on failure. Falls back to any
 * non-duplicate color at the target hue if strict matching fails.
 *
 * Guarantees: all 4 slots are filled with distinct color IDs.
 */
function buildMoodPalette(base, allColors) {
  // Widen-tolerance nearest-neighbor at a specific hue
  function findAtHue(targetHue, excludeIds, lTol, sTol) {
    const candidates = allColors
      .filter((c) => !excludeIds.has(c.id))
      .map((c) => {
        const dH = Math.min(
          Math.abs(c.hue - targetHue),
          360 - Math.abs(c.hue - targetHue)
        );
        const dL = Math.abs(c.lightness - base.lightness);
        const dS = Math.abs(c.saturation - base.saturation);
        return { c, dH, dL, dS };
      })
      .filter((x) => x.dH <= 15 && x.dL <= lTol && x.dS <= sTol)
      .sort((a, b) => a.dH + a.dL / 2 - (b.dH + b.dL / 2));
    return candidates[0] ? candidates[0].c : null;
  }

  // Tolerance ladder — try strict then widen
  const tolerances = [
    [10, 16],
    [18, 24],
    [30, 40],
    [100, 100],
  ];

  function resolveAtHue(targetHue, excluded) {
    for (const [lTol, sTol] of tolerances) {
      const hit = findAtHue(targetHue, excluded, lTol, sTol);
      if (hit) return hit;
    }
    return null;
  }

  const excluded = new Set([base.id]);
  const plus24 = (base.hue + 24) % 360;
  const minus24 = (base.hue - 24 + 360) % 360;
  const comp = (base.hue + 180) % 360;

  // Sequential fill that guarantees 4 distinct IDs even if every
  // tolerance tier fails. Each picked color (from resolveAtHue OR the
  // last-resort scan) is added to `excluded` so the next slot can't
  // duplicate it. Gemini-flagged: previously all-fallback slots could
  // collapse onto the same `fill` color.
  function fillNext() {
    return allColors.find((c) => !excluded.has(c.id) && c.saturation > 30);
  }
  function resolveOrFill(targetHue) {
    const hit = resolveAtHue(targetHue, excluded) || fillNext();
    // Final safety net — if even `fillNext` runs out, return primary
    // so the SVG template never sees undefined (5,446 colors make this
    // astronomically unlikely, but fail-safe).
    const picked = hit || base;
    excluded.add(picked.id);
    return picked;
  }

  const analogous1 = resolveOrFill(plus24);
  const analogous2 = resolveOrFill(minus24);
  const complementary = resolveOrFill(comp);

  return { primary: base, analogous1, analogous2, complementary };
}

/* ────────────────────────────────────────────
 *  SVG template (1242 × 1656)
 * ──────────────────────────────────────────── */

/**
 * Layout:
 *   Y=0..120    Top header band (off-white)
 *   Y=120..960  Main swatch (840 px tall)  — primary color
 *   Y=960..1380 Companion band (420 px)     — 3 equal columns
 *   Y=1380..1656 Footer band (off-white)
 */
function xhsMoodPaletteSvg(palette, dateStr) {
  const p = palette.primary;
  const tcPrimary = textColorFor(p.hex);
  const scPrimary = subtextColorFor(p.hex);

  const companions = [palette.analogous1, palette.analogous2, palette.complementary];
  const colW = XHS_W / 3;

  const companionBands = companions
    .map((c, i) => {
      const x = i * colW;
      const tc = textColorFor(c.hex);
      const sc = subtextColorFor(c.hex);
      return `
    <rect x="${x}" y="960" width="${colW}" height="420" fill="${c.hex}"/>
    <text x="${x + colW / 2}" y="1130" text-anchor="middle"
          font-family="'PingFang SC', 'Hiragino Sans GB', 'Noto Sans CJK SC', 'Noto Sans SC', system-ui, sans-serif"
          font-size="36" font-weight="600" fill="${tc}">${escapeXml(c.name)}</text>
    <text x="${x + colW / 2}" y="1188" text-anchor="middle"
          font-family="ui-monospace, 'SF Mono', Menlo, monospace"
          font-size="32" fill="${sc}">${escapeXml(c.hex)}</text>
    <text x="${x + colW / 2}" y="1250" text-anchor="middle"
          font-family="system-ui, sans-serif"
          font-size="22" font-weight="400" fill="${sc}" opacity="0.75">${escapeXml(c.family)}</text>`;
    })
    .join("");

  // Companion role labels — faint micro-type above each band
  const roleLabels = ["ANALOGOUS +24°", "ANALOGOUS −24°", "COMPLEMENTARY"]
    .map(
      (label, i) =>
        `<text x="${i * colW + colW / 2}" y="1010" text-anchor="middle"
               font-family="system-ui, sans-serif" font-size="18" letter-spacing="3"
               font-weight="500" fill="${textColorFor(companions[i].hex)}" opacity="0.55">${label}</text>`
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${XHS_W}" height="${XHS_H}" viewBox="0 0 ${XHS_W} ${XHS_H}">
  <!-- Header band -->
  <rect x="0" y="0" width="${XHS_W}" height="120" fill="#f8f6f2"/>
  <text x="${XHS_W / 2}" y="56" text-anchor="middle"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="26" font-weight="500" letter-spacing="6" fill="#1a1a1a">COLOR ARCHIVE</text>
  <text x="${XHS_W / 2}" y="92" text-anchor="middle"
        font-family="'PingFang SC', 'Hiragino Sans GB', 'Noto Sans CJK SC', 'Noto Sans SC', system-ui, sans-serif"
        font-size="22" font-weight="400" fill="#666666">今日色卡 · ${escapeXml(dateStr)}</text>

  <!-- Main primary swatch -->
  <rect x="0" y="120" width="${XHS_W}" height="840" fill="${p.hex}"/>

  <!-- Tiny label top-left of swatch -->
  <text x="60" y="200" font-family="system-ui, sans-serif"
        font-size="22" letter-spacing="4" font-weight="500"
        fill="${tcPrimary}" opacity="0.55">TODAY</text>

  <!-- Primary color name — large, centered vertically -->
  <text x="${XHS_W / 2}" y="540" text-anchor="middle"
        font-family="'PingFang SC', 'Hiragino Sans GB', 'Noto Sans CJK SC', 'Noto Sans SC', system-ui, sans-serif"
        font-size="88" font-weight="700" fill="${tcPrimary}">${escapeXml(p.name)}</text>

  <!-- Hex code -->
  <text x="${XHS_W / 2}" y="624" text-anchor="middle"
        font-family="ui-monospace, 'SF Mono', Menlo, monospace"
        font-size="54" font-weight="500" fill="${scPrimary}">${escapeXml(p.hex)}</text>

  <!-- Divider -->
  <rect x="${XHS_W / 2 - 80}" y="668" width="160" height="2" fill="${tcPrimary}" opacity="0.22"/>

  <!-- Family label -->
  <text x="${XHS_W / 2}" y="720" text-anchor="middle"
        font-family="system-ui, sans-serif"
        font-size="32" fill="${scPrimary}" opacity="0.85">${escapeXml(p.family)}</text>

  <!-- HSL values -->
  <text x="${XHS_W / 2}" y="768" text-anchor="middle"
        font-family="ui-monospace, 'SF Mono', Menlo, monospace"
        font-size="26" fill="${scPrimary}" opacity="0.6">H ${p.hue}°  ·  S ${p.saturation}%  ·  L ${p.lightness}%</text>

  <!-- Companion bands (3 equal columns) -->
  ${companionBands}

  <!-- Companion role labels -->
  ${roleLabels}

  <!-- Footer band -->
  <rect x="0" y="1380" width="${XHS_W}" height="276" fill="#f8f6f2"/>
  <text x="${XHS_W / 2}" y="1464" text-anchor="middle"
        font-family="'PingFang SC', 'Hiragino Sans GB', 'Noto Sans CJK SC', 'Noto Sans SC', system-ui, sans-serif"
        font-size="32" font-weight="500" fill="#1a1a1a">MOOD PALETTE · 配色灵感</text>
  <text x="${XHS_W / 2}" y="1508" text-anchor="middle"
        font-family="system-ui, sans-serif"
        font-size="22" fill="#777777">Primary + 2 Analogous + 1 Complementary</text>
  <text x="${XHS_W / 2}" y="1590" text-anchor="middle"
        font-family="system-ui, sans-serif"
        font-size="26" font-weight="500" letter-spacing="2" fill="#1a1a1a">${SITE_DOMAIN}/today/</text>
</svg>`;
}

/* ────────────────────────────────────────────
 *  SVG → PNG
 * ──────────────────────────────────────────── */

async function svgToPngBuffer(svgString) {
  return sharp(Buffer.from(svgString)).png({ quality: 92 }).toBuffer();
}

async function svgToPngFile(svgString, outputPath) {
  await sharp(Buffer.from(svgString)).png({ quality: 92 }).toFile(outputPath);
  return outputPath;
}

/* ────────────────────────────────────────────
 *  Public API
 * ──────────────────────────────────────────── */

/**
 * Generate XHS mood-palette image for a given date's COTD.
 * Returns a PNG buffer — caller decides where to write it (HTTP response, file).
 */
async function generateXhsImageBuffer({ dateStr, color, allColors }) {
  const palette = buildMoodPalette(color, allColors);
  const svg = xhsMoodPaletteSvg(palette, dateStr);
  return svgToPngBuffer(svg);
}

/** Generate + persist to server/generated/, return absolute path. */
async function generateXhsImageFile({ dateStr, color, allColors }) {
  const palette = buildMoodPalette(color, allColors);
  const svg = xhsMoodPaletteSvg(palette, dateStr);
  const filename = `xhs-${dateStr}.png`;
  const filepath = path.join(GENERATED_DIR, filename);
  await svgToPngFile(svg, filepath);
  return { filepath, filename, palette };
}

/**
 * Remove `xhs-*.png` files in GENERATED_DIR older than `maxAgeMs`
 * (default 30 days). Defence-in-depth against the disk-fill DoS vector
 * on GET /xhs/:date.png (route already bounds requestable dates, but
 * this keeps the cache from accumulating indefinitely).
 */
function cleanOldXhsFiles(maxAgeMs = 30 * 24 * 60 * 60 * 1000) {
  const cutoff = Date.now() - maxAgeMs;
  let cleaned = 0;
  for (const file of fs.readdirSync(GENERATED_DIR)) {
    if (!file.startsWith("xhs-") || !file.endsWith(".png")) continue;
    const fp = path.join(GENERATED_DIR, file);
    try {
      if (fs.statSync(fp).mtimeMs < cutoff) {
        fs.unlinkSync(fp);
        cleaned++;
      }
    } catch {
      /* ignore races */
    }
  }
  if (cleaned > 0) console.log(`[xhs-image] Cleaned ${cleaned} old files`);
}

module.exports = {
  generateXhsImageBuffer,
  generateXhsImageFile,
  buildMoodPalette,
  cleanOldXhsFiles,
  XHS_W,
  XHS_H,
  GENERATED_DIR,
};
