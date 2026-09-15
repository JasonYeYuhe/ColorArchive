/**
 * The Instagram renderer must refuse to draw when the machine has no fonts.
 *
 * On 2026-08-29 production moved to a VM with no fontconfig. sharp does not fail
 * in that state — it returns a valid PNG in which every glyph is a tofu box — and
 * 17 daily feed posts went out unreadable. See server/font-check.js.
 */

const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { fontsAvailable } = require("../font-check");

const linux = { platform: "linux" };

test("no fc-match binary means no fonts", () => {
  const r = fontsAvailable({ ...linux, run: () => { const e = new Error("spawn fc-match ENOENT"); e.code = "ENOENT"; throw e; } });
  assert.equal(r.ok, false);
  assert.match(r.reason, /fontconfig/, "the reason should name the package that fixes it");
});

test("fontconfig present but resolving nothing is not ok", () => {
  assert.equal(fontsAvailable({ ...linux, run: () => "" }).ok, false);
});

test("fontconfig pointing at a missing file is not ok", () => {
  assert.equal(fontsAvailable({ ...linux, run: () => "/nope/DejaVuSans.ttf", exists: () => false }).ok, false);
});

test("a resolvable, existing font file is ok (the fix must not fail closed forever)", () => {
  const r = fontsAvailable({ ...linux, run: () => "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf\n", exists: () => true });
  assert.equal(r.ok, true);
});

test("not enforced off linux, so local generation is not blocked", () => {
  assert.equal(fontsAvailable({ platform: "darwin", run: () => { throw new Error("should not run"); } }).ok, true);
});

// ---- executing: the guard sits on the real render path ------------------------

const GEN = require.resolve("../ig-image-generator");
const FC = require.resolve("../font-check");

function loadGeneratorWith(result) {
  delete require.cache[GEN];
  require.cache[FC] = { id: FC, filename: FC, loaded: true, exports: { fontsAvailable: () => result } };
  return require(GEN);
}

const { getColorOfDay } = require("../colors");
const color = getColorOfDay("2026-09-15-post");

test("with no usable fonts, generateColorPost refuses and writes nothing", async () => {
  const gen = loadGeneratorWith({ ok: false, reason: "stub: no fonts" });
  const before = new Set(fs.readdirSync(gen.GENERATED_DIR));
  await assert.rejects(
    () => gen.generateColorPost(color),
    /no usable fonts/,
    "the renderer produced an image on a machine that cannot draw text — that image is a wall of " +
      "tofu boxes, and the scheduler would publish it",
  );
  const leaked = fs.readdirSync(gen.GENERATED_DIR).filter((f) => !before.has(f));
  assert.deepEqual(leaked, [], "a refused render must not leave a file in the publicly served generated/ dir");
});

test("with fonts available, generateColorPost still renders (control)", async () => {
  const gen = loadGeneratorWith({ ok: true, reason: "stub: fonts ok" });
  const file = await gen.generateColorPost(color);
  const full = path.join(gen.GENERATED_DIR, file);
  try {
    assert.ok(fs.existsSync(full), "expected a rendered PNG");
    assert.ok(fs.statSync(full).size > 1000, "expected a non-trivial PNG");
  } finally {
    fs.rmSync(full, { force: true });
  }
});
