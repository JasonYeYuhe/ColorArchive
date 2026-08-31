const test = require("node:test");
const assert = require("node:assert");

const { BOT_UA_RE } = require("../bot-detect");

/**
 * The UA regex is one line that decides what the entire analytics denominator
 * contains, and it has no other guard. Two directions of failure, both silent:
 *
 *   - too NARROW and automation is counted as people, which is the 2026-07-26
 *     correction (28.6% of rows) arriving late and in pieces;
 *   - too WIDE and real visitors vanish, which reads as a traffic collapse. The
 *     repo has already misread an instrumentation change as exactly that twice
 *     (see server/session-denominator.js TRAP 2 and TRAP 4).
 *
 * The allow-list below is therefore the more important half of this file. Every
 * string in it is a real user agent taken from the production nginx log on
 * 2026-08-31, including the two that look most like a bot to a careless pattern:
 * an Edge UA (contains "Edg") and the Claude desktop browser.
 */

const BLOCKED = [
  // Added 2026-08-31 — a headless browser for AI agents that names itself.
  "Lightpanda/1.0",
  "Mozilla/5.0 (X11; Linux x86_64) Lightpanda/1.0",
  // The rest of the headless cluster it sits beside.
  "Mozilla/5.0 (X11; Linux x86_64) HeadlessChrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11) PhantomJS/2.1.1",
  "Mozilla/5.0 puppeteer",
  "Mozilla/5.0 Playwright/1.40",
  // Self-identifying crawlers.
  "Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)",
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  "Mozilla/5.0 (compatible; bingbot/2.0)",
  // Scripted clients.
  "python-requests/2.31.0",
  "curl/8.4.0",
  "node-fetch/1.0",
  "axios/1.6.2",
  "Go-http-client/2.0",
];

const ALLOWED = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 26_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6.1 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6.1 Safari/605.1.15",
  "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 OPR/134.0.0.0",
  // The Claude desktop browser. It is a person driving it, and it was 13 of the
  // 304 /events writes in one measured day — miscounting it as a bot would be a
  // visible, self-inflicted dent.
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Claude/1.37937.3 Chrome/148.0.7778.280 Safari/537.36",
];

test("every self-identifying automated agent is matched", () => {
  for (const ua of BLOCKED) {
    assert.ok(BOT_UA_RE.test(ua), `should be treated as a bot but was not: ${ua}`);
  }
});

test("no real browser user agent is matched", () => {
  for (const ua of ALLOWED) {
    assert.ok(!BOT_UA_RE.test(ua), `real browser wrongly treated as a bot: ${ua}`);
  }
});

test("the regex is case-insensitive", () => {
  // Production sends "Lightpanda/1.0"; a lowercase pattern without /i would miss
  // it and the omission would look like "we added it and nothing changed".
  assert.ok(BOT_UA_RE.flags.includes("i"), `expected /i, got flags: ${BOT_UA_RE.flags}`);
  assert.ok(BOT_UA_RE.test("LIGHTPANDA/1.0"));
  assert.ok(BOT_UA_RE.test("lightpanda/1.0"));
});

test("the regex is not global — a shared lastIndex would alternate results", () => {
  // BOT_UA_RE is a module-level constant reused across requests. With /g, .test()
  // advances lastIndex and the SAME user agent alternates true/false between
  // calls, so roughly half of one crawler's requests would be recorded.
  assert.ok(!BOT_UA_RE.flags.includes("g"), `regex must not be global: ${BOT_UA_RE.flags}`);
  assert.strictEqual(BOT_UA_RE.test("Lightpanda/1.0"), BOT_UA_RE.test("Lightpanda/1.0"));
});
