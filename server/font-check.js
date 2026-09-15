/**
 * Can this machine actually draw text into an image?
 *
 * WHY THIS EXISTS. ig-image-generator.js renders SVG <text> through sharp, which
 * asks fontconfig for a font. The Azure VM production moved to on 2026-08-29 had
 * no fontconfig and no fonts at all — the old droplet did, implicitly, because
 * Ubuntu images usually ship fonts-dejavu-core. So every glyph became a tofu box.
 * sharp does not fail when that happens: it logs "Fontconfig error: Cannot load
 * default config file" to stderr and returns a perfectly valid PNG full of □□□.
 * Instagram accepted all of them. Seventeen daily feed posts (2026-08-30 through
 * 09-15) and as many Stories went out with no readable text before anyone noticed.
 *
 * Nothing in the pipeline could have caught it: the render succeeded, the upload
 * succeeded, the caption (rendered by Instagram, not us) was fine. The only defence
 * is to refuse to render when the machine cannot draw text, so a future migration
 * fails loudly and posts nothing, instead of quietly publishing garbage every day.
 *
 * Fix on a new host:  apt-get install -y --no-install-recommends fontconfig fonts-dejavu-core
 * (DejaVu is what the pre-migration posts were rendered in.)
 */

const fs = require("fs");
const { execFileSync } = require("child_process");

function defaultRun() {
  return execFileSync("fc-match", ["-f", "%{file}", "sans-serif"], {
    encoding: "utf8",
    timeout: 5000,
    stdio: ["ignore", "pipe", "ignore"],
  });
}

/**
 * @returns {{ok: boolean, reason: string}}
 * Only enforced on linux, where production runs. Elsewhere it reports ok without
 * checking, so a developer running the generator locally is not blocked.
 */
function fontsAvailable({ run = defaultRun, platform = process.platform, exists = fs.existsSync } = {}) {
  if (platform !== "linux") return { ok: true, reason: `not checked on ${platform}` };
  let file;
  try {
    file = String(run() || "").trim();
  } catch (err) {
    return {
      ok: false,
      reason: err && err.code === "ENOENT" ? "fc-match is not installed (package: fontconfig)" : `fc-match failed: ${err && err.message}`,
    };
  }
  if (!file) return { ok: false, reason: "fontconfig resolved no font for sans-serif" };
  if (!exists(file)) return { ok: false, reason: `fontconfig points at a file that does not exist: ${file}` };
  return { ok: true, reason: file };
}

module.exports = { fontsAvailable };
