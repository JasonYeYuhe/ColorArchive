/**
 * Tests for server/session-denominator.js — the caveat boundaries and the SQL
 * that must never silently become COUNT(*).
 *
 * Run with:
 *   node --test server/__tests__/session-denominator.test.js
 *
 * Context (2026-08-17): both assertions here exist because the first version of
 * this module got them wrong and adversarial review caught it.
 *
 *  - The date comparison used a strict `<`. Both breakpoints happened partway
 *    through their day (session_id at 14:50 UTC, the guides change at 18:25
 *    UTC), so a window starting ON the breakpoint date contains hours of the old
 *    behaviour and must still warn. A strict `<` passed exactly those windows in
 *    silence — the single most likely window to be wrong was the one guaranteed
 *    not to say so.
 *
 *  - The visit expression fell back to `'row'||id` for rows with no session,
 *    which turned one storage-blocked tab firing N events into N visits, and
 *    would degrade the whole metric back into a row count if instrumentation
 *    ever regressed. A test that only checked "it returns a number" would have
 *    passed both bugs, so this one asserts the shape of the SQL itself.
 */

const test = require("node:test");
const assert = require("node:assert");

const {
  SESSION_ID_SINCE,
  GUIDES_EVENTS_RETIRED,
  GUIDES_PAGELOAD_EVENT_ADDED,
  NOT_PAGE_LOAD,
  DISTINCT_VISITS,
  SESSIONLESS_EVENTS,
  windowCaveats,
} = require("../session-denominator");

// A fixed "now" so these never depend on the day they run.
const at = (iso) => new Date(`${iso}T12:00:00Z`);

test("a window starting exactly on the session_id date still warns", () => {
  // 2026-08-17 minus 22 days = 2026-07-26, the breakpoint day itself. session_id
  // only began at 14:50 UTC that day, so the window really does contain
  // session-less hours.
  const notes = windowCaveats(22, at("2026-08-17"));
  assert.ok(notes, "expected caveats, got null");
  assert.ok(
    notes.some((n) => n.includes(SESSION_ID_SINCE)),
    `expected a session_id caveat, got: ${JSON.stringify(notes)}`,
  );
});

test("a window starting exactly on the guides-retirement date still warns", () => {
  const notes = windowCaveats(7, at("2026-08-17"));
  assert.ok(notes, "expected caveats, got null");
  assert.ok(
    notes.some((n) => n.includes(GUIDES_EVENTS_RETIRED)),
    `expected a guides caveat, got: ${JSON.stringify(notes)}`,
  );
});

test("a fully clean window returns null rather than an empty array", () => {
  // Callers do `(caveats ?? []).map(...)`; an empty array and null must not both
  // be possible, or "no caveats" and "caveats not computed" become the same.
  //
  // The fixture moved from 2026-09-01 to 09-05 when the 2026-08-31 breakpoint was
  // added: a 3-day window ending 09-01 starts on 08-29 and therefore really does
  // span 08-31. The test's intent (a window past every breakpoint) is unchanged.
  const notes = windowCaveats(3, at("2026-09-05"));
  assert.strictEqual(notes, null);
});

test("a breakpoint in the future of the window is NOT reported", () => {
  // The regression this blocks, and it shipped once: the checks tested only
  // `start <= date`, which is equivalent to "spans" only while every breakpoint is
  // in the past. When 2026-08-31 was added, a window ending 2026-08-17 began
  // warning about a change that had not happened yet.
  const notes = windowCaveats(60, at("2026-08-17"));
  assert.ok(
    !notes.some((n) => n.includes(GUIDES_PAGELOAD_EVENT_ADDED)),
    `window ended before the breakpoint but warned about it: ${JSON.stringify(notes)}`,
  );
});

test("the page-load breakpoint is reported once the window spans it", () => {
  const notes = windowCaveats(10, at("2026-09-05"));
  assert.ok(notes, "expected caveats, got null");
  assert.ok(
    notes.some((n) => n.includes(GUIDES_PAGELOAD_EVENT_ADDED)),
    `expected a page-load caveat, got: ${JSON.stringify(notes)}`,
  );
});

test("the page-load filter excludes the mount-time event and nothing else", () => {
  // `w1_assigned` fires on mount with no dwell and no gesture, so it is not
  // engagement; `w1_card_interact` and `page_read` both require a human and must
  // stay in. A filter that grew to cover them would quietly re-run the 2026-08-10
  // undercount.
  assert.match(NOT_PAGE_LOAD, /w1_assigned/);
  assert.doesNotMatch(NOT_PAGE_LOAD, /w1_card_interact|page_read|word_generated/);
  assert.match(NOT_PAGE_LOAD, /^event_name NOT IN \(/);
});

test("both breakpoints are reported when the window spans both", () => {
  const notes = windowCaveats(60, at("2026-08-17"));
  assert.strictEqual(notes.length, 2);
});

test("the visit expression counts sessions only — never row ids", () => {
  // The regression this blocks: any fallback that mints a synthetic id per row
  // makes DISTINCT_VISITS approach COUNT(*) as session coverage drops.
  assert.ok(/COUNT\(DISTINCT/.test(DISTINCT_VISITS), DISTINCT_VISITS);
  assert.ok(
    !/row.*\|\|.*id|COALESCE\([^)]*id/i.test(DISTINCT_VISITS),
    `visit count must not fall back to a per-row id: ${DISTINCT_VISITS}`,
  );
});

test("session-less events are countable separately", () => {
  // The point of removing the fallback is that the missing rows stay visible.
  assert.ok(/SUM\(/.test(SESSIONLESS_EVENTS), SESSIONLESS_EVENTS);
});
