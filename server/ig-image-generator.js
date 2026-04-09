/**
 * Instagram image generator — creates PNG images from SVG templates using sharp.
 *
 * Output:
 *   Story:  1080 × 1920 (9:16 vertical)
 *   Post:   1080 × 1080 (1:1 square)
 *
 * Images are saved to server/generated/ and served via Express static middleware.
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const GENERATED_DIR = path.join(__dirname, "generated");
const STORY_W = 1080;
const STORY_H = 1920;
const POST_W = 1080;
const POST_H = 1080;

// Ensure output directory exists
if (!fs.existsSync(GENERATED_DIR)) {
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
}

// Bare domain for watermark text in generated images
const SITE_DOMAIN = (process.env.FRONTEND_ORIGIN || "https://${SITE_DOMAIN}")
  .replace(/^https?:\/\//, "")
  .replace(/\/$/, "");

function escapeXml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Pick text color (light/dark) based on background luminance. */
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
 *  Story Templates (1080 × 1920)
 * ──────────────────────────────────────────── */

/** Color of the Day — full-bleed swatch with name, hex, and branding. */
function colorOfDayStorySvg(color) {
  const tc = textColorFor(color.hex);
  const sc = subtextColorFor(color.hex);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${STORY_W}" height="${STORY_H}" viewBox="0 0 ${STORY_W} ${STORY_H}">
  <rect width="${STORY_W}" height="${STORY_H}" fill="${color.hex}"/>

  <!-- Top branding -->
  <text x="540" y="240" text-anchor="middle" font-family="system-ui, -apple-system, Helvetica, sans-serif" font-size="28" font-weight="400" letter-spacing="6" fill="${sc}" opacity="0.6">COLOR ARCHIVE</text>

  <!-- Color name -->
  <text x="540" y="860" text-anchor="middle" font-family="system-ui, -apple-system, Helvetica, sans-serif" font-size="72" font-weight="700" fill="${tc}">${escapeXml(color.name)}</text>

  <!-- Hex code -->
  <text x="540" y="950" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="48" fill="${sc}">${escapeXml(color.hex)}</text>

  <!-- Divider -->
  <rect x="440" y="1000" width="200" height="2" fill="${tc}" opacity="0.2"/>

  <!-- Color family -->
  <text x="540" y="1060" text-anchor="middle" font-family="system-ui, -apple-system, Helvetica, sans-serif" font-size="30" font-weight="400" fill="${sc}" opacity="0.7">${escapeXml(color.family)}</text>

  <!-- HSL values -->
  <text x="540" y="1120" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="26" fill="${sc}" opacity="0.5">H ${color.hue}°  S ${color.saturation}%  L ${color.lightness}%</text>

  <!-- Bottom CTA -->
  <text x="540" y="1700" text-anchor="middle" font-family="system-ui, -apple-system, Helvetica, sans-serif" font-size="24" font-weight="500" fill="${tc}" opacity="0.5">${SITE_DOMAIN}</text>

  <!-- "Color of the Day" label -->
  <text x="540" y="1760" text-anchor="middle" font-family="system-ui, -apple-system, Helvetica, sans-serif" font-size="22" font-weight="300" letter-spacing="4" fill="${sc}" opacity="0.4">COLOR OF THE DAY</text>
</svg>`;
}

/** Palette Story — 5 horizontal color bands with names. */
function paletteStorySvg(paletteColors, title) {
  const bandH = Math.floor(1400 / paletteColors.length);
  const startY = 260;

  const bands = paletteColors.map((c, i) => {
    const y = startY + i * bandH;
    const tc = textColorFor(c.hex);
    const sc = subtextColorFor(c.hex);
    return `
    <rect x="0" y="${y}" width="${STORY_W}" height="${bandH}" fill="${c.hex}"/>
    <text x="80" y="${y + bandH / 2 - 10}" font-family="system-ui, -apple-system, Helvetica, sans-serif" font-size="36" font-weight="600" fill="${tc}">${escapeXml(c.name)}</text>
    <text x="80" y="${y + bandH / 2 + 30}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="28" fill="${sc}">${escapeXml(c.hex)}</text>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${STORY_W}" height="${STORY_H}" viewBox="0 0 ${STORY_W} ${STORY_H}">
  <rect width="${STORY_W}" height="${STORY_H}" fill="#111111"/>

  <!-- Title area -->
  <text x="540" y="120" text-anchor="middle" font-family="system-ui, -apple-system, Helvetica, sans-serif" font-size="28" font-weight="400" letter-spacing="6" fill="#888888">COLOR ARCHIVE</text>
  <text x="540" y="190" text-anchor="middle" font-family="system-ui, -apple-system, Helvetica, sans-serif" font-size="48" font-weight="700" fill="#ffffff">${escapeXml(title)}</text>

  ${bands}

  <!-- Footer -->
  <text x="540" y="1820" text-anchor="middle" font-family="system-ui, -apple-system, Helvetica, sans-serif" font-size="24" fill="#666666">${SITE_DOMAIN}</text>
</svg>`;
}

/* ────────────────────────────────────────────
 *  Post Templates (1080 × 1080)
 * ──────────────────────────────────────────── */

/** Featured Color Post — square swatch with details. */
function colorPostSvg(color) {
  const tc = textColorFor(color.hex);
  const sc = subtextColorFor(color.hex);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${POST_W}" height="${POST_H}" viewBox="0 0 ${POST_W} ${POST_H}">
  <rect width="${POST_W}" height="${POST_H}" fill="${color.hex}"/>

  <!-- Top branding -->
  <text x="540" y="120" text-anchor="middle" font-family="system-ui, -apple-system, Helvetica, sans-serif" font-size="24" font-weight="400" letter-spacing="6" fill="${sc}" opacity="0.5">COLOR ARCHIVE</text>

  <!-- Color name -->
  <text x="540" y="480" text-anchor="middle" font-family="system-ui, -apple-system, Helvetica, sans-serif" font-size="64" font-weight="700" fill="${tc}">${escapeXml(color.name)}</text>

  <!-- Hex -->
  <text x="540" y="560" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="44" fill="${sc}">${escapeXml(color.hex)}</text>

  <!-- Divider -->
  <rect x="440" y="600" width="200" height="2" fill="${tc}" opacity="0.15"/>

  <!-- Family + HSL -->
  <text x="540" y="660" text-anchor="middle" font-family="system-ui, -apple-system, Helvetica, sans-serif" font-size="28" fill="${sc}" opacity="0.6">${escapeXml(color.family)}  ·  H${color.hue} S${color.saturation} L${color.lightness}</text>

  <!-- Bottom -->
  <text x="540" y="1000" text-anchor="middle" font-family="system-ui, -apple-system, Helvetica, sans-serif" font-size="22" fill="${tc}" opacity="0.4">${SITE_DOMAIN}</text>
</svg>`;
}

/** Palette Post — 5-color grid layout. */
function palettePostSvg(paletteColors, title) {
  const swatchH = 160;
  const startY = 200;
  const gap = 8;

  const bands = paletteColors.map((c, i) => {
    const y = startY + i * (swatchH + gap);
    const tc = textColorFor(c.hex);
    const sc = subtextColorFor(c.hex);
    return `
    <rect x="60" y="${y}" width="960" height="${swatchH}" rx="12" fill="${c.hex}"/>
    <text x="100" y="${y + swatchH / 2 + 6}" font-family="system-ui, -apple-system, Helvetica, sans-serif" font-size="32" font-weight="600" fill="${tc}">${escapeXml(c.name)}</text>
    <text x="960" y="${y + swatchH / 2 + 6}" text-anchor="end" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="28" fill="${sc}">${escapeXml(c.hex)}</text>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${POST_W}" height="${POST_H}" viewBox="0 0 ${POST_W} ${POST_H}">
  <rect width="${POST_W}" height="${POST_H}" fill="#111111"/>

  <!-- Title -->
  <text x="540" y="80" text-anchor="middle" font-family="system-ui, -apple-system, Helvetica, sans-serif" font-size="22" font-weight="400" letter-spacing="5" fill="#888888">COLOR ARCHIVE</text>
  <text x="540" y="145" text-anchor="middle" font-family="system-ui, -apple-system, Helvetica, sans-serif" font-size="42" font-weight="700" fill="#ffffff">${escapeXml(title)}</text>

  ${bands}

  <!-- Footer -->
  <text x="540" y="1040" text-anchor="middle" font-family="system-ui, -apple-system, Helvetica, sans-serif" font-size="20" fill="#555555">${SITE_DOMAIN}</text>
</svg>`;
}

/* ────────────────────────────────────────────
 *  SVG → PNG conversion
 * ──────────────────────────────────────────── */

async function svgToPng(svgString, outputFilename) {
  const outputPath = path.join(GENERATED_DIR, outputFilename);
  await sharp(Buffer.from(svgString)).png({ quality: 90 }).toFile(outputPath);
  console.log(`[ig-image] Generated: ${outputFilename}`);
  return outputFilename;
}

/* ────────────────────────────────────────────
 *  Public API
 * ──────────────────────────────────────────── */

async function generateColorOfDayStory(color) {
  const filename = `story-cotd-${Date.now()}.png`;
  return svgToPng(colorOfDayStorySvg(color), filename);
}

async function generatePaletteStory(paletteColors, title) {
  const filename = `story-palette-${Date.now()}.png`;
  return svgToPng(paletteStorySvg(paletteColors, title), filename);
}

async function generateColorPost(color) {
  const filename = `post-color-${Date.now()}.png`;
  return svgToPng(colorPostSvg(color), filename);
}

async function generatePalettePost(paletteColors, title) {
  const filename = `post-palette-${Date.now()}.png`;
  return svgToPng(palettePostSvg(paletteColors, title), filename);
}

/** Remove generated files older than maxAgeMs (default: 7 days). */
function cleanOldFiles(maxAgeMs = 7 * 24 * 60 * 60 * 1000) {
  const cutoff = Date.now() - maxAgeMs;
  let cleaned = 0;
  for (const file of fs.readdirSync(GENERATED_DIR)) {
    if (file.startsWith(".")) continue; // skip .post-log.json and other dotfiles
    const filepath = path.join(GENERATED_DIR, file);
    const stat = fs.statSync(filepath);
    if (stat.mtimeMs < cutoff) {
      fs.unlinkSync(filepath);
      cleaned++;
    }
  }
  if (cleaned > 0) console.log(`[ig-image] Cleaned ${cleaned} old files`);
}

module.exports = {
  generateColorOfDayStory,
  generatePaletteStory,
  generateColorPost,
  generatePalettePost,
  cleanOldFiles,
  GENERATED_DIR,
};
