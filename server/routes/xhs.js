/**
 * Xiaohongshu daily mood-palette image endpoints.
 *
 *   GET /xhs/today.png       — today's mood-palette PNG (local date, same as web /today/)
 *   GET /xhs/:date.png       — mood-palette PNG for a specific YYYY-MM-DD
 *   GET /xhs/:date.json      — JSON preview: { primary, analogous1, analogous2, complementary }
 *
 * Public. Content is non-sensitive (mirrors the existing /trending endpoint).
 *
 * Caching: images are deterministic from date, so we set a 24-hour
 * Cache-Control. On-disk cache in server/generated/ reused across requests.
 */

const express = require("express");
const fs = require("fs");
const path = require("path");
const { colors, getColorOfDay } = require("../colors");
const {
  generateXhsImageFile,
  buildMoodPalette,
  GENERATED_DIR,
} = require("../xhs-image-generator");

const router = express.Router();
const ONE_DAY = 24 * 60 * 60;

function todayLocalDateStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const MAX_DAYS_AHEAD = 365 * 2;   // 2 years
const MAX_DAYS_BEHIND = 365 * 2;

/**
 * Accept YYYY-MM-DD that's:
 *   - syntactically valid (not Feb 30)
 *   - within ±2 years of today (bounds disk usage — Gemini DoS flag)
 */
function isValidDateStr(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  // Reject dates that roll over (e.g. 2026-02-30 → 2026-03-02)
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== m - 1 ||
    dt.getUTCDate() !== d
  ) {
    return false;
  }
  const today = new Date();
  const todayMs = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const diffDays = (dt.getTime() - todayMs) / 86400000;
  if (diffDays > MAX_DAYS_AHEAD) return false;
  if (diffDays < -MAX_DAYS_BEHIND) return false;
  return true;
}

async function serveXhsPng(dateStr, res) {
  const filename = `xhs-${dateStr}.png`;
  const filepath = path.join(GENERATED_DIR, filename);

  // Reuse on-disk cache when available
  if (!fs.existsSync(filepath)) {
    const color = getColorOfDay(dateStr);
    if (!color) return res.status(404).json({ error: "No color for date" });
    await generateXhsImageFile({ dateStr, color, allColors: colors });
  }

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", `public, max-age=${ONE_DAY}, immutable`);
  res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
  return fs.createReadStream(filepath).pipe(res);
}

router.get("/today.png", async (req, res) => {
  try {
    return await serveXhsPng(todayLocalDateStr(), res);
  } catch (err) {
    console.error("[xhs] today.png error:", err.message);
    return res.status(500).json({ error: "Failed to generate image" });
  }
});

router.get("/:date.png", async (req, res) => {
  const { date } = req.params;
  if (!isValidDateStr(date)) return res.status(400).json({ error: "Invalid date, expected YYYY-MM-DD" });
  try {
    return await serveXhsPng(date, res);
  } catch (err) {
    console.error(`[xhs] ${date}.png error:`, err.message);
    return res.status(500).json({ error: "Failed to generate image" });
  }
});

router.get("/:date.json", (req, res) => {
  const { date } = req.params;
  if (!isValidDateStr(date)) return res.status(400).json({ error: "Invalid date, expected YYYY-MM-DD" });
  try {
    const color = getColorOfDay(date);
    if (!color) return res.status(404).json({ error: "No color for date" });
    const palette = buildMoodPalette(color, colors);
    return res.json({
      date,
      primary: { id: palette.primary.id, name: palette.primary.name, hex: palette.primary.hex, hue: palette.primary.hue, lightness: palette.primary.lightness, saturation: palette.primary.saturation, family: palette.primary.family },
      analogous1: { id: palette.analogous1.id, name: palette.analogous1.name, hex: palette.analogous1.hex, hue: palette.analogous1.hue, family: palette.analogous1.family },
      analogous2: { id: palette.analogous2.id, name: palette.analogous2.name, hex: palette.analogous2.hex, hue: palette.analogous2.hue, family: palette.analogous2.family },
      complementary: { id: palette.complementary.id, name: palette.complementary.name, hex: palette.complementary.hex, hue: palette.complementary.hue, family: palette.complementary.family },
    });
  } catch (err) {
    console.error(`[xhs] ${date}.json error:`, err.message);
    return res.status(500).json({ error: "Failed to build palette" });
  }
});

module.exports = router;
