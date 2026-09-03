/**
 * Counting visits instead of counting rows — and the four things that make this
 * number narrower than the word "session" suggests.
 *
 * WHAT THE UNIT ACTUALLY IS: AN ENGAGED TAB LIFETIME.
 * Not a session in the analytics sense, and not a unique visitor. `ca_sid` lives
 * in sessionStorage (src/lib/session-id.ts), so it is per-TAB and has no
 * inactivity timeout. Two independent reviews (Gemini 3.7 Flash and Codex,
 * 2026-08-17) landed on the same objection, and it is right: the bias runs in
 * BOTH directions and which way it points depends on the person.
 *   - One reader opening three articles in three tabs = three "visits" (up).
 *   - One tab left open and returned to over days = one "visit" (down). This is
 *     not hypothetical: session a87b4589 spans 2026-08-01 to 08-15.
 * It is therefore fit for dividing one count by another WITHIN this dataset, and
 * unfit as a headline "how many people". PostHog cannot cross-check it either —
 * PostHog sessionises on 30-minute inactivity with a 24-hour cap, a different
 * definition, so a disagreement between the two would prove nothing about
 * either. (The plan's §1 item 3 assumed it would; it does not.)
 *
 * AND `events` IS NOT PURELY INTERACTION-GATED. Impression events fire from an
 * IntersectionObserver once an element is merely visible (src/lib/use-impression.ts),
 * and this table was 84% `recruit_banner_impression` at its peak. A JS-executing
 * crawler can manufacture those. "Harder to fake than pageviews" is true;
 * "impossible to fake" is not.
 *
 * WHY THE DENOMINATOR CHANGED
 * Every ratio on this site used to divide by `pageviews`. That table has no
 * caller identifier at all, and 2026-07-27's audit measured what it actually
 * contains: 97% of colour-page traffic and ~70% of guide traffic is automated,
 * and `word-to-color`'s pageviews were the most inflated of all — 454 of ~500
 * from four addresses. Bots are 22.5% of `pageviews` but 1.5% of `events`,
 * because an event needs someone to actually click or type. So `events` is the
 * honest denominator, and `COUNT(DISTINCT session_id)` is the honest unit: one
 * person generating forty palettes is one visit, not forty.
 *
 * TRAP 1 — THE COLUMN IS YOUNGER THAN THE TABLE.
 * `session_id` has existed in the schema since the table was created and was
 * NULL in every row until 2026-07-26 14:50:43 UTC. A 30-day window run today
 * therefore covers eight days in which every session is invisible, and
 * COUNT(DISTINCT session_id) silently under-reports against COUNT(*) for
 * exactly those days. Any report that spans SESSION_ID_SINCE must say so rather
 * than print a number that looks like a decline.
 *
 * TRAP 2 — /guides/ STOPPED EMITTING EVENTS ON 2026-08-10.
 * e401e0f retired the Design Notes recruitment form from guide detail pages.
 * That form fired `email_form_impression`, which was the ONLY event a guide page
 * produced for a reader who just read. Guide "sessions" therefore fell from ~21
 * a day to ~2.5 the moment it shipped, while `/guides/` pageviews stayed flat at
 * 50-85 a day — the readers never left. An events-based denominator measures
 * ENGAGED sessions, and a page with nothing to engage with scores near zero
 * however many people read it. Do not read the guides series as a traffic
 * collapse; it is an instrumentation change, and it is the standing limitation
 * of this denominator rather than a bug to be fixed by adding a page-load event
 * (that would re-admit precisely the automated traffic the switch was made to
 * exclude).
 */

/** First row with a non-NULL session_id, measured on the production DB. */
const SESSION_ID_SINCE = "2026-07-26";

/** The day guide pages stopped emitting a read-only event (e401e0f). */
const GUIDES_EVENTS_RETIRED = "2026-08-10";

/** The day guide pages started emitting one again — `w1_assigned` (W1, 7716be8). */
const GUIDES_PAGELOAD_EVENT_ADDED = "2026-08-31";

/**
 * TRAP 4 — EVENTS THAT FIRE ON PAGE LOAD ARE NOT ENGAGEMENT, AND ONE NOW EXISTS.
 *
 * The doctrine above warns, in as many words, against "adding a page-load event
 * (that would re-admit precisely the automated traffic the switch was made to
 * exclude)". On 2026-08-31 W1 added exactly one: `w1_assigned` fires from a mount
 * effect on every /guides/ page, in BOTH arms, with no dwell and no interaction —
 * because it is an experiment's DENOMINATOR and must not depend on the behaviour
 * being measured. That is correct for the experiment and wrong for this file's
 * unit, and both things are true at once.
 *
 * The size of it, measured the day it shipped: /guides/ had 1,703 pageviews and
 * 605 event-emitting sessions over 30 days. `w1_assigned` reaches into that
 * ~1,100-session gap, against a site-wide engaged-visit count of 2,912 — a
 * 15-20% step change in the headline number, on a date when nothing about
 * readership changed. That is the 2026-08-10 incident run backwards, and it would
 * be just as wrong to read as a recovery as the drop was to read as a collapse.
 *
 * So visit counts that are not already filtered to a specific event name must
 * subtract this. Callers append `AND ${NOT_PAGE_LOAD}`; anything counting a
 * single named event is unaffected and needs no change.
 *
 * Add to this list only events that fire without a human doing something. An
 * impression event does NOT belong here — `use-impression.ts` requires 50%
 * visibility for a continuous second, which is a weaker bar than a click but a
 * real one, and the doctrine above already accounts for it.
 */
// `figma_plugin_open` (2026-09-03) fires when the Figma plugin is opened, before
// the designer does anything, and carries an install id in session_id. It is not a
// website visit at all, so leaving it out of this list would let plugin opens count
// as engaged visits in every site-wide number — the 2026-08-10 `w1_assigned`
// incident again, on a different metric. W1 itself is unaffected either way: every
// W1 query is anchored on `w1_assigned` AND a `page_read` in the same session, and a
// plugin session has neither.
const PAGE_LOAD_EVENTS = ["w1_assigned", "figma_plugin_open"];

const NOT_PAGE_LOAD = `event_name NOT IN (${PAGE_LOAD_EVENTS.map((e) => `'${e}'`).join(",")})`;

/**
 * TRAP 3 — WHAT A MISSING session_id MUST NOT DO.
 * The first version of this file counted `COALESCE(NULLIF(session_id,''),
 * 'row'||id)`, reasoning that pre-instrumentation rows should each count as one
 * visit rather than collapsing into a single shared NULL bucket. Adversarial
 * review (Codex, 2026-08-17) showed that choice fails in the direction that
 * matters: session-id.ts returns null whenever storage is unavailable — Safari
 * private mode, embedded webviews, hardened browsers — and promises in its own
 * comment that this only ever UNDER-counts. The row-id fallback made it
 * over-count instead, turning one storage-blocked tab firing N events into N
 * visits. Worse, it degrades silently: if instrumentation ever regresses to
 * mostly-NULL, this expression quietly becomes COUNT(*) again, which is the
 * exact metric the switch to sessions was made to escape.
 *
 * So visits count only rows that actually carry a session, and the session-less
 * remainder is reported alongside instead of being folded in. A number that is
 * missing data is fine; a number that hides how much is not.
 */
const DISTINCT_VISITS = `COUNT(DISTINCT NULLIF(session_id,''))`;

/** Events in the window with no session at all — report next to any visit count. */
const SESSIONLESS_EVENTS = `SUM(CASE WHEN COALESCE(session_id,'')='' THEN 1 ELSE 0 END)`;

/**
 * Returns a human-readable caveat when the requested window reaches back past
 * either date, or null when the window is clean. Callers print it next to the
 * number; the point is that the reader never sees a session count without also
 * seeing why it might be wrong.
 */
function windowCaveats(days, now = new Date()) {
  const start = new Date(now.getTime() - days * 86400000).toISOString().slice(0, 10);
  const today = now.toISOString().slice(0, 10);
  /**
   * A breakpoint matters only when it falls INSIDE the window — at or after the
   * start AND at or before the end. The two original checks tested `start <= date`
   * alone, which is equivalent only while every breakpoint is safely in the past.
   * The 2026-08-31 one broke that assumption the day it was added: a window ending
   * 2026-08-17 does not span it, but `start <= "2026-08-31"` is still true, so it
   * warned about a change that had not happened yet. Caught by
   * server/__tests__/session-denominator.test.js — the "spans both" case went to 3.
   */
  const spans = (date) => start <= date && date <= today;
  const notes = [];
  // `<=`, not `<`. Both breakpoints happened partway through their day —
  // session_id at 14:50 UTC, the guides change at 18:25 UTC — so a window
  // starting ON the breakpoint date still contains hours of the old behaviour.
  // Comparing dates with a strict `<` silently passed exactly those windows.
  if (spans(SESSION_ID_SINCE)) {
    notes.push(
      `window starts ${start}, before session_id existed (${SESSION_ID_SINCE}) — events before that date carry no session and are EXCLUDED from the visit count entirely, so this number covers only part of the window`,
    );
  }
  if (spans(GUIDES_EVENTS_RETIRED)) {
    notes.push(
      `window spans ${GUIDES_EVENTS_RETIRED}, when /guides/ stopped emitting a read-only event (e401e0f) — guide sessions drop ~90% on that date with no change in guide readership`,
    );
  }
  // The mirror image of the line above, and just as easy to misread — in the
  // flattering direction this time, which is the one nobody questions.
  if (spans(GUIDES_PAGELOAD_EVENT_ADDED)) {
    notes.push(
      `window spans ${GUIDES_PAGELOAD_EVENT_ADDED}, when /guides/ started emitting a page-load event again (\`w1_assigned\`, W1) — any UNFILTERED visit count steps up ~15-20% on that date with no change in readership. Counts in this report already exclude it; a hand-written query must add \`AND ${NOT_PAGE_LOAD}\``,
    );
  }
  return notes.length ? notes : null;
}

module.exports = {
  SESSION_ID_SINCE,
  GUIDES_EVENTS_RETIRED,
  GUIDES_PAGELOAD_EVENT_ADDED,
  PAGE_LOAD_EVENTS,
  NOT_PAGE_LOAD,
  DISTINCT_VISITS,
  SESSIONLESS_EVENTS,
  windowCaveats,
};
