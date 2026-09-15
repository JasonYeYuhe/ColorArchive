/**
 * Can this process actually draw text into an image?
 *
 * WHY THIS EXISTS. ig-image-generator.js renders SVG <text> through sharp. The
 * Azure VM production moved to on 2026-08-29 had no fonts at all (the old droplet
 * had DejaVu, implicitly, from its Ubuntu image). sharp does not fail in that
 * state: it logs "Fontconfig error: Cannot load default config file" to stderr and
 * returns a valid PNG in which every glyph is a tofu box. Instagram accepted every
 * one — 17 daily feed posts (2026-08-30..09-15) and their Stories went out
 * unreadable. Refusing to render is the only defence; posting nothing is the right
 * failure for public content.
 *
 * HOW IT CHECKS — by asking sharp itself, not a stand-in. The first version of this
 * file (commit 3841122) ran `fc-match` and trusted its answer. An audit on
 * 2026-09-16 showed that proves the wrong thing: sharp bundles its own fontconfig
 * inside libvips, so on the production VM hiding fc-match made the guard refuse
 * while sharp drew the real font stacks perfectly — and the converse (fc-match
 * resolving something while sharp draws boxes) is equally possible. So this now
 * renders two probe strings through the same sharp and the same font-family stacks
 * the generator uses, and compares their ink.
 *
 * A placeholder box has the same ink whatever the character, so W and I come out
 * identical. Real glyphs do not. Measured on the production VM 2026-09-16:
 *
 *                 with DejaVu installed      with an empty fontconfig (boxes)
 *   sans  W/I       4683 / 1330 = 3.52           288 / 288 = 1.00
 *   mono  W/I       3471 / 2274 = 1.53           288 / 288 = 1.00
 *
 * MIN_RATIO 1.25 sits well clear of both. The pair of probe renders took 11 ms, and
 * it is async, so unlike the fc-match version it cannot stall the event loop that
 * also serves the payment webhooks. A pass is cached for a few hours; a failure is
 * never cached, so recovery is picked up on the very next render.
 *
 * Fix on a new host:  apt-get install -y --no-install-recommends fontconfig fonts-dejavu-core
 */

// The exact stacks ig-image-generator.js uses. If a new one is added there, add it
// here, or a stack that resolves to nothing would pass this check unexamined.
const FONT_STACKS = {
  sans: "system-ui, -apple-system, Helvetica, sans-serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
};
const MIN_RATIO = 1.25;
const PASS_TTL_MS = 6 * 60 * 60 * 1000;

let lastPassAt = 0;

async function sharpInk(text, family) {
  const sharp = require("sharp");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="80">` +
    `<rect width="480" height="80" fill="#ffffff"/>` +
    `<text x="10" y="58" font-family="${family}" font-size="48" fill="#000000">${text}</text></svg>`;
  const { data, info } = await sharp(Buffer.from(svg)).greyscale().raw().toBuffer({ resolveWithObject: true });
  let dark = 0;
  for (let i = 0; i < data.length; i += info.channels) if (data[i] < 128) dark++;
  return dark;
}

/**
 * @returns {Promise<{ok: boolean, reason: string}>}
 */
async function fontsAvailable({ ink = sharpInk, now = Date.now(), useCache = true } = {}) {
  if (useCache && lastPassAt && now - lastPassAt < PASS_TTL_MS) {
    return { ok: true, reason: "passed recently" };
  }
  const detail = [];
  for (const [name, family] of Object.entries(FONT_STACKS)) {
    let w, i;
    try {
      w = await ink("WWWWWWWW", family);
      i = await ink("IIIIIIII", family);
    } catch (err) {
      return { ok: false, reason: `probe render failed for the ${name} stack: ${err && err.message}` };
    }
    if (!(i > 0 && w > i * MIN_RATIO)) {
      return {
        ok: false,
        reason: `the ${name} font stack draws placeholder boxes, not glyphs (ink W=${w}, I=${i})`,
      };
    }
    detail.push(`${name} W/I=${(w / i).toFixed(2)}`);
  }
  if (useCache) lastPassAt = now;
  return { ok: true, reason: detail.join(", ") };
}

/** Test hook: forget a cached pass. */
function resetFontCheckCache() {
  lastPassAt = 0;
}

module.exports = { fontsAvailable, resetFontCheckCache, FONT_STACKS, MIN_RATIO };
