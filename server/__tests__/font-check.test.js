/**
 * The Instagram renderer must refuse to draw when the machine cannot draw text.
 *
 * On 2026-08-29 production moved to a VM with no fonts. sharp does not fail in that
 * state — it returns a valid PNG in which every glyph is a tofu box — and 17 daily
 * feed posts went out unreadable. See server/font-check.js for the measurements the
 * thresholds below come from.
 */

const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { fontsAvailable, MIN_RATIO, FONT_STACKS } = require("../font-check");

// Ink numbers measured on the production VM, 2026-09-16.
const REAL = { sans: { W: 4683, I: 1330 }, mono: { W: 3471, I: 2274 } };
const TOFU = { W: 288, I: 288 };
const stackName = (family) => Object.keys(FONT_STACKS).find((k) => FONT_STACKS[k] === family);
const inkFrom = (table) => async (text, family) => {
  const row = typeof table === "function" ? table(stackName(family)) : table[stackName(family)] || table;
  return text.startsWith("W") ? row.W : row.I;
};
const probe = (table) => fontsAvailable({ ink: inkFrom(table), useCache: false });

test("real glyphs pass (the fix must not fail closed forever)", async () => {
  const r = await probe(REAL);
  assert.equal(r.ok, true, r.reason);
});

test("placeholder boxes are refused — every character has the same ink", async () => {
  const r = await probe(TOFU);
  assert.equal(r.ok, false);
  assert.match(r.reason, /placeholder boxes/);
});

test("a single broken stack is enough to refuse (hex codes use the monospace stack)", async () => {
  const r = await probe((name) => (name === "mono" ? TOFU : REAL.sans));
  assert.equal(r.ok, false);
  assert.match(r.reason, /mono/);
});

test("zero ink (nothing drawn at all) is refused", async () => {
  assert.equal((await probe({ W: 0, I: 0 })).ok, false);
});

test("the threshold sits between the measured cases", () => {
  assert.ok(REAL.mono.W / REAL.mono.I > MIN_RATIO, "the narrowest real ratio (monospace) must clear MIN_RATIO");
  assert.ok(TOFU.W / TOFU.I < MIN_RATIO, "boxes must fall below MIN_RATIO");
});

test("a probe that throws is a refusal, not a pass", async () => {
  const r = await fontsAvailable({ ink: async () => { throw new Error("vips exploded"); }, useCache: false });
  assert.equal(r.ok, false);
  assert.match(r.reason, /probe render failed/);
});

test("a pass is cached, a failure is not", async () => {
  let n = 0;
  const counting = async (text, family) => { n++; return inkFrom(REAL)(text, family); };
  const t0 = 1_000_000;
  await fontsAvailable({ ink: counting, now: t0 });
  const after = n;
  await fontsAvailable({ ink: counting, now: t0 + 60_000 });
  assert.equal(n, after, "a recent pass should not re-probe");
  require("../font-check").resetFontCheckCache();
});

test("every font-family stack the generator uses is probed", () => {
  const gen = fs.readFileSync(path.join(__dirname, "..", "ig-image-generator.js"), "utf8");
  const used = new Set([...gen.matchAll(/font-family="([^"]+)"/g)].map((m) => m[1]));
  const probed = new Set(Object.values(FONT_STACKS));
  for (const family of used) {
    assert.ok(probed.has(family), `ig-image-generator.js uses "${family}", which font-check.js never probes`);
  }
});

// ---- executing: the guard sits on the real render path ------------------------

const GEN = require.resolve("../ig-image-generator");
const FC = require.resolve("../font-check");

function loadGeneratorWith(result) {
  delete require.cache[GEN];
  require.cache[FC] = { id: FC, filename: FC, loaded: true, exports: { fontsAvailable: async () => result } };
  return require(GEN);
}

const { getColorOfDay } = require("../colors");
const color = getColorOfDay("2026-09-15-post");

test("with no usable fonts, generateColorPost refuses and writes nothing", async () => {
  const gen = loadGeneratorWith({ ok: false, reason: "stub: boxes" });
  const before = new Set(fs.readdirSync(gen.GENERATED_DIR));
  await assert.rejects(() => gen.generateColorPost(color), /no usable fonts/);
  const leaked = fs.readdirSync(gen.GENERATED_DIR).filter((f) => !before.has(f));
  assert.deepEqual(leaked, [], "a refused render must not leave a file in the publicly served generated/ dir");
});

test("with fonts available, generateColorPost still renders (control)", async () => {
  const gen = loadGeneratorWith({ ok: true, reason: "stub: fonts ok" });
  const file = await gen.generateColorPost(color);
  const full = path.join(gen.GENERATED_DIR, file);
  try {
    assert.ok(fs.existsSync(full) && fs.statSync(full).size > 1000, "expected a non-trivial PNG");
  } finally {
    fs.rmSync(full, { force: true });
  }
});
