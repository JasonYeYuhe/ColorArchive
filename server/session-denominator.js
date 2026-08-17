/**
 * Counting visits instead of counting rows — and the two dates that make a
 * naive session count lie.
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
 * SQL fragment counting distinct visits, falling back to the row id when a
 * session is missing so pre-instrumentation rows collapse to one visit each
 * rather than to a single shared NULL bucket. Without the COALESCE, every
 * session-less row in the window counts as ONE visit in total — which would turn
 * trap 1 from an under-count into a catastrophic one.
 */
const DISTINCT_VISITS = `COUNT(DISTINCT COALESCE(NULLIF(session_id,''), 'row'||id))`;

/**
 * Returns a human-readable caveat when the requested window reaches back past
 * either date, or null when the window is clean. Callers print it next to the
 * number; the point is that the reader never sees a session count without also
 * seeing why it might be wrong.
 */
function windowCaveats(days, now = new Date()) {
  const start = new Date(now.getTime() - days * 86400000).toISOString().slice(0, 10);
  const notes = [];
  if (start < SESSION_ID_SINCE) {
    notes.push(
      `window starts ${start}, before session_id existed (${SESSION_ID_SINCE}) — visits before that date are counted one-per-event, so totals are inflated and per-visit ratios are understated`,
    );
  }
  if (start < GUIDES_EVENTS_RETIRED) {
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
  windowCaveats,
};
