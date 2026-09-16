/**
 * The X/Facebook daily post script, exercised for real in --dry-run.
 *
 * It replaced a scheduled task that had a model rewrite the posting code every day from
 * a task file last edited 2026-06-16. Over 60 days that produced 2 missing days, 2
 * duplicated days and one WRONG COLOUR (2026-08-12), because the task file still
 * described the superseded `dayHash` formula — while every run reported success.
 */

const test = require("node:test");
const assert = require("node:assert");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const { getColorOfDay } = require("../colors");

const SCRIPT = path.join(__dirname, "..", "..", "scripts", "post-daily-color.cjs");
const run = (date) =>
  execFileSync("node", [SCRIPT, "--dry-run", `--date=${date}`], { encoding: "utf8", timeout: 20000 });

test("the colour posted is the one getColorOfDay picks, not the old dayHash", () => {
  for (const date of ["2026-08-12", "2026-09-16", "2027-01-01"]) {
    const expected = getColorOfDay(date);
    const out = run(date);
    assert.ok(
      out.includes(expected.name) && out.includes(expected.hex),
      `${date}: expected ${expected.name} ${expected.hex}; the script said:\n${out.split("\n")[0]}`,
    );
  }
});

test("the tweet carries no link — a link costs 13x under X's pricing", () => {
  const out = run("2026-09-16");
  const tweet = out.split("--- X (dry run, not posted) ---")[1].split("---")[0];
  assert.ok(!/https?:\/\//.test(tweet), "the tweet contains a URL");
  assert.ok(!/colorarchive\.(org|me)/i.test(tweet), "the tweet contains a bare domain, which X auto-links");
});

test("the Facebook post does carry the colour's link", () => {
  const date = "2026-09-16";
  const out = run(date);
  assert.ok(out.includes(`https://colorarchive.org/colors/${getColorOfDay(date).id}/`));
});

test("the tweet is measured with X's WEIGHTED count and stays under the limit", () => {
  // Most characters weigh 2; only a few ranges weigh 1. A template that measured 278 by
  // code points was exactly 280 weighted — at the limit, invisible to `.length`.
  for (const date of ["2026-09-16", "2026-12-25", "2027-06-30"]) {
    const m = /tweet: (\d+) weighted chars/.exec(run(date));
    assert.ok(m, "the script no longer reports a weighted count");
    assert.ok(Number(m[1]) <= 280, `${date}: ${m[1]} weighted chars`);
  }
});

test("a dry run posts nothing and writes no state", () => {
  const fs = require("node:fs");
  const state = path.join(process.env.HOME, ".claude", "scheduled-tasks", "daily-color-post", ".posted.json");
  const before = fs.existsSync(state) ? fs.readFileSync(state, "utf8") : null;
  run("2026-09-16");
  const after = fs.existsSync(state) ? fs.readFileSync(state, "utf8") : null;
  assert.equal(after, before, "--dry-run modified the post log");
});
