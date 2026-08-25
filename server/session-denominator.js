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
  const notes = [];
  // `<=`, not `<`. Both breakpoints happened partway through their day —
  // session_id at 14:50 UTC, the guides change at 18:25 UTC — so a window
  // starting ON the breakpoint date still contains hours of the old behaviour.
  // Comparing dates with a strict `<` silently passed exactly those windows.
  if (start <= SESSION_ID_SINCE) {
    notes.push(
      `window starts ${start}, before session_id existed (${SESSION_ID_SINCE}) — events before that date carry no session and are EXCLUDED from the visit count entirely, so this number covers only part of the window`,
    );
  }
  if (start <= GUIDES_EVENTS_RETIRED) {
    notes.push(
      `window spans ${GUIDES_EVENTS_RETIRED}, when /guides/ stopped emitting a read-only event (e401e0f) — guide sessions drop ~90% on that date with no change in guide readership`,
    );
  }
  return notes.length ? notes : null;
}

module.exports = {
  SESSION_ID_SINCE,
  GUIDES_EVENTS_RETIRED,
  DISTINCT_VISITS,
  SESSIONLESS_EVENTS,
  windowCaveats,
};
