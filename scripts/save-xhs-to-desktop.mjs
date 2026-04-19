#!/usr/bin/env node
/**
 * Generate one day's Xiaohongshu mood-palette PNG into the user's
 * 小红书素材 folder — matches the layout the xiaohongshu-daily routine
 * already uses (~/Desktop/小红书素材/YYYY-MM-DD/图片.png + 文案.txt).
 *
 * Uses the new COTD v2 golden-angle algorithm (server/colors.js) and the
 * mood-palette SVG generator (server/xhs-image-generator.js). Each day's
 * palette = primary + 2 analogous (±24° hue) + 1 complementary (+180°).
 *
 * Prints a JSON summary to stdout so a caller (e.g. the routine skill)
 * can read the palette and generate matching Chinese copy.
 *
 * Usage:
 *   node scripts/save-xhs-to-desktop.mjs                # today
 *   node scripts/save-xhs-to-desktop.mjs 2026-04-21     # specific date
 *   node scripts/save-xhs-to-desktop.mjs --force        # regenerate even if exists
 *   node scripts/save-xhs-to-desktop.mjs --dir /tmp/xhs # custom base dir
 *
 * Output JSON shape (to stdout, final line):
 *   {"date":"2026-04-20","path":"...","primary":{...},"analogous1":{...},
 *    "analogous2":{...},"complementary":{...}}
 */

import { createRequire } from "node:module";
import { homedir, tmpdir } from "node:os";
import { mkdirSync, existsSync, copyFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const require = createRequire(import.meta.url);
const { colors, getColorOfDay } = require("../server/colors.js");
const {
  generateXhsImageFile,
  buildMoodPalette,
  GENERATED_DIR,
} = require("../server/xhs-image-generator.js");

// ── argv parsing ────────────────────────────────────────────
const argv = process.argv.slice(2);
const force = argv.includes("--force");
const dirIdx = argv.indexOf("--dir");
const rawDir =
  dirIdx >= 0 && argv[dirIdx + 1]
    ? argv[dirIdx + 1]
    : join(homedir(), "Desktop", "小红书素材");

// Containment check — resolve to absolute and require it sit under the
// user's home dir or /tmp. Prevents `--dir /etc` or other path-traversal
// abuse from a compromised caller or typo. (Gemini security flag.)
const baseDir = resolve(rawDir);
const allowedRoots = [resolve(homedir()), resolve(tmpdir())];
if (!allowedRoots.some((root) => baseDir === root || baseDir.startsWith(root + "/"))) {
  console.error(
    `[xhs] Refusing --dir outside $HOME or $TMPDIR: ${baseDir}`
  );
  process.exit(3);
}

function todayLocalStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const dateArg = argv.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));
const date = dateArg || todayLocalStr();

// ── generate ────────────────────────────────────────────────
const color = getColorOfDay(date);
if (!color) {
  console.error(`No color for date ${date}`);
  process.exit(2);
}
const palette = buildMoodPalette(color, colors);

const dayDir = join(baseDir, date);
mkdirSync(dayDir, { recursive: true });
const destPath = join(dayDir, "图片.png");

let reused = false;
if (!force && existsSync(destPath)) {
  reused = true;
} else {
  await generateXhsImageFile({ dateStr: date, color, allColors: colors });
  const src = join(GENERATED_DIR, `xhs-${date}.png`);
  copyFileSync(src, destPath);
}

// ── human log to stderr ────────────────────────────────────
const size = Math.round(statSync(destPath).size / 1024);
console.error(
  `[xhs] ${date}  ${palette.primary.name} ${palette.primary.hex}  → ${destPath}  (${size} KB${reused ? ", cached" : ""})`
);
console.error(
  `       companions: ${palette.analogous1.name} (+24°), ${palette.analogous2.name} (-24°), ${palette.complementary.name} (complementary)`
);

// ── machine-readable JSON to stdout ────────────────────────
function slim(c) {
  return {
    id: c.id,
    name: c.name,
    hex: c.hex,
    hue: c.hue,
    saturation: c.saturation,
    lightness: c.lightness,
    family: c.family,
  };
}
process.stdout.write(
  JSON.stringify({
    date,
    path: destPath,
    reused,
    primary: slim(palette.primary),
    analogous1: slim(palette.analogous1),
    analogous2: slim(palette.analogous2),
    complementary: slim(palette.complementary),
  }) + "\n"
);
