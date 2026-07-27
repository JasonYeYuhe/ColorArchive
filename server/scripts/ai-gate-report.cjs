#!/usr/bin/env node
/**
 * AI gate report — the thing that lets docs/dev-plan-2026-07-26-ai.md §8 actually
 * be decided instead of argued about.
 *
 * Run:  node server/scripts/ai-gate-report.cjs [--days 30]
 *
 * WHY THIS EXISTS AND WHAT IT IS ALLOWED TO SAY
 * The AI features get 29 pageviews a month across three tool pages, and
 * `ai_generated` has fired 30 times in four months (Apr 1, May 10, Jun 13, Jul 6).
 * The question is whether to keep five AI endpoints or delete them. That decision
 * deserves a number, and a number deserves an error bar — which is why this prints
 * a Wilson confidence interval next to every ratio and REFUSES to print a ratio at
 * all below a minimum sample. A gate that reports "33%" off three events is how a
 * project talks itself into keeping something.
 *
 * THE THRESHOLD IN THE PLAN WAS UNREACHABLE, AND IS REPLACED HERE.
 * §8 originally asked for ">=100 successful generations" in 30 days. Peak observed
 * is 13/month, so that bar could not be cleared even if the feature doubled four
 * times over — an unreachable threshold is indistinguishable from no gate. The
 * decision is therefore keyed on the EXPOSURE->REQUEST rate on colour-detail, the
 * one AI surface with enough traffic for a ratio to mean anything (6,133 views/30d
 * versus 29 across all three tool pages combined), and the keep-rate is reported
 * as indicative only, never as a deciding number.
 *
 * WHAT THE DENOMINATOR IS, PRECISELY
 * COUNT(DISTINCT session_id) over `ai_module_impression` — visits where the module
 * actually entered the viewport (IntersectionObserver, src/lib/use-impression.ts),
 * not pageviews. The AI card on colour-detail sits well below the fold, so
 * pageviews would understate the rate badly. The honest limitation, stated so
 * nobody has to rediscover it: this is exposure CONDITIONAL ON SCROLL DEPTH. It
 * answers "of the people who saw it, how many used it" and NOT "of everyone who
 * landed, how many used it".
 *
 * TWO DATA BOUNDARIES THIS REPORT REFUSES TO CROSS SILENTLY
 *  1. Bot filtering started 2026-07-26 (server/bot-detect.js). Before that, ~28.6%
 *     of rows in these tables were self-identified crawlers, and impression-style
 *     events were the worst affected. Windows that reach back past that date are
 *     flagged as contaminated.
 *  2. session_id started being populated 2026-07-26 (the column existed but was
 *     NULL in all 4,690 prior rows). Rows without one cannot be de-duplicated, so
 *     they are EXCLUDED from distinct-visit counts and reported separately — an
 *     under-count, which is the safe direction.
 */

const path = require("path");
const Database = require(path.join(__dirname, "..", "node_modules", "better-sqlite3"));

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "..", "data.db");
const db = new Database(DB_PATH, { readonly: true });

// The date bot filtering and session_id population went live. Anything before is
// a different measurement regime and cannot be compared like-for-like.
const CLEAN_DATA_FROM = "2026-07-26";

const args = process.argv.slice(2);
const daysArg = args.indexOf("--days");
const DAYS = daysArg >= 0 ? Math.max(1, parseInt(args[daysArg + 1], 10) || 30) : 30;

// 150 viewable impressions is the smallest sample at which observing NO clicks
// rejects a true 3% rate (p=0.010; one click p=0.058). An earlier draft used 1,000,
// justified by Wilson interval width — which sounds more rigorous and is worse,
// because it made low usage undecidable rather than damning. See deleteBand().
// Colour-detail should reach 150 in roughly two weeks.
//
// 50 requests before the KEEP-rate is even shown: at n=50, p=0.15 the interval is
// about +/-10pp — only good enough to tell "most people keep it" from "almost
// nobody does". Hence indicative, never deciding.
const MIN_IMPRESSIONS_TO_DECIDE = 150;
const MIN_REQUESTS_FOR_KEEP_RATE = 50;

const TARGET_RATE = 0.03; // the rate worth keeping the feature for

/**
 * P(X <= k) for X ~ Binomial(n, p). Computed iteratively from the pmf so it stays
 * exact at the small n this gate actually runs at; no factorials, no overflow.
 */
function binomCdf(k, n, p) {
  if (k < 0) return 0;
  if (k >= n) return 1;
  let term = Math.pow(1 - p, n); // pmf at 0
  let sum = term;
  for (let i = 1; i <= k; i++) {
    term *= ((n - i + 1) / i) * (p / (1 - p));
    sum += term;
  }
  return Math.min(1, sum);
}

/**
 * The DELETE band: the largest observed click count that would be too unlikely if
 * the true rate were TARGET_RATE.
 *
 * THIS IS THE FIX FOR THE ORIGINAL GATE'S FATAL FLAW. Both §8's first draft
 * (">=100 successful generations") and this script's own first draft (">=1000
 * impressions before any verdict") made the sample bar a PRECONDITION for judging
 * whether usage exists. That is unfalsifiable by construction: no demand means the
 * sample never arrives, the gate never fires, and the feature lives forever on a
 * technicality. Exactly the failure mode that kept the Auditor alive for months.
 *
 * A one-sided binomial test inverts it. At n=150, if the true click rate were 3%,
 * seeing 0 clicks has probability 0.010 and 1 click 0.058 — so "almost nobody used
 * it" becomes a positive finding at a sample we will actually reach in about two
 * weeks, not a stalemate. Low usage now DELETES rather than deferring.
 */
function deleteBand(n, p = TARGET_RATE, alpha = 0.10) {
  let k = -1;
  for (let candidate = 0; candidate < n; candidate++) {
    if (binomCdf(candidate, n, p) < alpha) k = candidate;
    else break;
  }
  return k; // clicks <= k => DELETE. -1 means n is too small to reject anything.
}

/**
 * Wilson score interval. Chosen over the textbook normal approximation because
 * that one is actively wrong at small n and low p — it happily produces negative
 * lower bounds, which is exactly the regime this report lives in.
 */
function wilson(successes, total, z = 1.96) {
  if (total === 0) return { low: 0, high: 0, point: 0 };
  const p = successes / total;
  const z2 = z * z;
  const denom = 1 + z2 / total;
  const centre = p + z2 / (2 * total);
  const spread = z * Math.sqrt((p * (1 - p)) / total + z2 / (4 * total * total));
  return {
    point: p,
    low: Math.max(0, (centre - spread) / denom),
    high: Math.min(1, (centre + spread) / denom),
  };
}

const pct = (x) => `${(x * 100).toFixed(2)}%`;

const since = new Date(Date.now() - DAYS * 86400000).toISOString().slice(0, 19).replace("T", " ");

// Every surface that actually calls a model. /ai/analyze-url is deliberately
// absent: it makes zero model calls (a regex scraper mounted under /ai), so
// counting it would pad the denominator with a non-AI tool.
//
// critique_panel has hasKeepSignal:false because there is genuinely nothing to
// copy from a prose critique — reporting 0% there would read as rejection when it
// is really absence. Its exposure is also different in KIND: the panel only mounts
// inside the parent page's `result &&` branch, so its denominator is "visits that
// already generated something", not "visits that scrolled to it".
const GATE_SURFACES = [
  ["color_detail", "colour-detail  /ai/name-color   (6,133 views/30d — the deciding surface)"],
  ["mood_palette", "mood-palette   /ai/mood-palette"],
  ["brand_generator", "brand-generator /ai/brand-palette"],
  ["critique_panel", "critique panel /ai/critique  (exposure = reached it, not scrolled to it)", { hasKeepSignal: false }],
];

/**
 * Distinct visits, and raw event count, for one event name in the window.
 *
 * `windowSince` is a parameter, not the module-level `since`: computeAiGate() is
 * exported and can be called with a different window than the CLI's --days, and
 * silently ignoring that argument would report the wrong period under a correct
 * heading — the worst kind of reporting bug.
 */
function counts(eventName, surface, windowSince) {
  const surfaceClause = surface ? `AND json_extract(props_json, '$.surface') = @surface` : "";
  const row = db
    .prepare(
      `SELECT
         COUNT(*)                                            AS rows_total,
         COUNT(DISTINCT CASE WHEN session_id IS NOT NULL
                             THEN session_id END)            AS visits,
         SUM(CASE WHEN session_id IS NULL THEN 1 ELSE 0 END) AS rows_without_session
       FROM events
       WHERE event_name = @eventName
         AND created_at >= @since
         ${surfaceClause}`
    )
    .get({ eventName, since: windowSince, surface });
  return {
    rows: row.rows_total || 0,
    visits: row.visits || 0,
    unattributed: row.rows_without_session || 0,
  };
}

function surfaceReport(surface, label, { hasKeepSignal = true } = {}, windowSince = since) {
  const impressions = counts("ai_module_impression", surface, windowSince);
  const requests = counts("ai_generate_click", surface, windowSince);
  const succeeded = counts("ai_generated", surface, windowSince);
  const kept = hasKeepSignal ? counts("ai_result_copied", surface, windowSince) : null;

  const lines = [];
  lines.push(`  ${label}`);
  lines.push(
    `    saw the module      ${String(impressions.visits).padStart(6)} visits  (${impressions.rows} events)`
  );
  lines.push(`    asked for a result  ${String(requests.visits).padStart(6)} visits`);
  lines.push(`    got one back        ${String(succeeded.visits).padStart(6)} visits`);
  if (kept) {
    lines.push(`    copied it           ${String(kept.visits).padStart(6)} visits`);
  } else {
    lines.push(`    copied it           ${"n/a".padStart(6)}  (nothing on this surface is copyable)`);
  }

  if (impressions.visits === 0) {
    lines.push(`    -> no exposure recorded yet; nothing to conclude`);
    return { lines, decidable: false, impressions, requests, succeeded, kept };
  }

  const ci = wilson(requests.visits, impressions.visits);
  const band = deleteBand(impressions.visits);
  lines.push(
    `    -> exposure→request ${pct(ci.point)}  95% CI ${pct(ci.low)}–${pct(ci.high)}  (n=${impressions.visits})`
  );
  if (band >= 0) {
    lines.push(
      `       delete band at this n: ${requests.visits} clicks vs threshold ${band}` +
        ` (≤${band} rejects a true ${pct(TARGET_RATE)} rate at p<0.10)`
    );
  } else {
    lines.push(
      `       n=${impressions.visits} is too small to reject anything yet — no verdict either way`
    );
  }

  if (kept) {
    if (requests.visits >= MIN_REQUESTS_FOR_KEEP_RATE) {
      const k = wilson(kept.visits, requests.visits);
      lines.push(
        `       request→copy ${pct(k.point)}  95% CI ${pct(k.low)}–${pct(k.high)}  (n=${requests.visits}, INDICATIVE ONLY)`
      );
    } else {
      lines.push(
        `       request→copy: withheld, only ${requests.visits} requests (need ${MIN_REQUESTS_FOR_KEEP_RATE} for the number to mean anything)`
      );
    }
  }

  return { lines, decidable: impressions.visits >= MIN_IMPRESSIONS_TO_DECIDE, impressions, requests, succeeded, kept };
}

function main() {
  const windowStartsBeforeCleanData = since.slice(0, 10) < CLEAN_DATA_FROM;

  console.log("");
  console.log("AI GATE REPORT");
  console.log(`window: last ${DAYS} days (since ${since} UTC)`);
  console.log("");

  if (windowStartsBeforeCleanData) {
    console.log("  ⚠ WINDOW REACHES BEFORE 2026-07-26.");
    console.log("    Before that date ~28.6% of rows in these tables were self-identified");
    console.log("    crawlers, and session_id was NULL in every row — so distinct-visit");
    console.log("    counts are under-stated and event counts are over-stated for the");
    console.log("    earlier part of this window. Not comparable to a clean window.");
    console.log("");
  }

  const results = {};
  console.log("BY SURFACE");
  for (const [surface, label, opts] of GATE_SURFACES) {
    const r = surfaceReport(surface, label, opts || {});
    results[surface] = r;
    r.lines.forEach((l) => console.log(l));
    console.log("");
  }

  // The verdict rests on colour-detail alone, on purpose. It is the only surface
  // where the sample can reach a size that supports a conclusion; averaging it
  // with three surfaces that see single-digit visits would let noise outvote data.
  // ONE verdict, ONE code path. This block used to re-implement the ladder inline
  // and still referenced DECIDE_RATE_INVEST / DECIDE_RATE_DELETE — constants that
  // were renamed to TARGET_RATE during the binomial rewrite and no longer exist.
  // It never threw because the zero-impression branch above short-circuits, so the
  // crash was scheduled for the exact moment the gate first became decidable. A
  // second copy of a decision rule is how the report and the email drift apart.
  const gate = computeAiGate(DAYS);
  console.log("VERDICT");
  console.log(`  ${gate.tag}`);
  for (const line of gate.msg.match(/.{1,72}(\s|$)/g) || [gate.msg]) {
    console.log(`  ${line.trim()}`);
  }
  const results2 = gate.surfaces;

  const legacy = db
    .prepare(
      `SELECT COUNT(*) c FROM events
        WHERE event_name = 'ai_generated'
          AND (props_json IS NULL OR json_extract(props_json, '$.surface') IS NULL)`
    )
    .get().c;
  if (legacy > 0) {
    console.log(
      `  note: ${legacy} historical ai_generated events carry no 'surface' prop (fired before`
    );
    console.log("  2026-07-26) so they match no surface above. They are real successes — the");
    console.log("  all-time trend was Apr 1, May 10, Jun 13, Jul 6 — just not attributable.");
  }

  const unattributed = Object.values(results2).reduce(
    (n, r) => n + (r ? r.impressions.unattributed : 0),
    0
  );
  if (unattributed > 0) {
    console.log("");
    console.log(`  note: ${unattributed} impression events had no session_id (storage blocked,`);
    console.log("  or recorded before 2026-07-26) and are excluded from visit counts.");
    console.log("  This under-counts exposure, so the real rate is no higher than reported.");
  }

  console.log("");
}

/**
 * The verdict, as data rather than printed text.
 *
 * Exported so server/scripts/gate-report.cjs — the script that already runs every
 * Monday at 09:00 UTC and already emails the owner — can carry this decision
 * instead of a second cron line and a second artifact nobody remembers to run.
 * That script is currently emailing a weekly verdict about the Auditor product,
 * which was cancelled on 2026-07-24: repurposing it REMOVES a misleading email
 * rather than adding a new one.
 *
 * One implementation, two callers. The Wilson interval and the minimum-sample
 * refusal must not exist in two copies that can drift apart.
 */
// The gate window is CUMULATIVE FROM GATE_START, never rolling.
//
// This shipped as a rolling 30 days and that was a third instance of the same
// failure the whole gate exists to prevent. At the surface's real rate — about 2
// exposed sessions a day once crawler traffic stopped being counted — a rolling
// 30-day window asymptotes at n≈60 and stays there. deleteBand(60) is -1: too small
// to reject anything. So the report would have printed NOT ENOUGH DATA forever,
// which is precisely the "gate that cannot fail" this file's header condemns.
//
// Cumulative from the day the instrumentation went live, n only ever grows, so the
// delete band eventually becomes reachable no matter how thin the traffic is.
const GATE_START = "2026-07-26";

function computeAiGate(days = null) {
  const windowSince = days
    ? new Date(Date.now() - days * 86400000).toISOString().slice(0, 19).replace("T", " ")
    : `${GATE_START} 00:00:00`;

  const surfaces = {};
  for (const [surface, , opts] of GATE_SURFACES) {
    const hasKeep = !(opts && opts.hasKeepSignal === false);
    surfaces[surface] = {
      impressions: counts("ai_module_impression", surface, windowSince),
      requests: counts("ai_generate_click", surface, windowSince),
      succeeded: counts("ai_generated", surface, windowSince),
      kept: hasKeep ? counts("ai_result_copied", surface, windowSince) : null,
    };
  }

  const d = surfaces.color_detail;
  const ci = wilson(d.requests.visits, d.impressions.visits);
  const band = deleteBand(d.impressions.visits);
  const keptVisits = d.kept ? d.kept.visits : 0;

  // KEEP is a conjunction on purpose. A percentage alone can be carried by two
  // enthusiastic sessions; requiring that several DIFFERENT visits both asked and
  // kept the output means the signal has to be broad, not just favourable.
  const keepQualifies =
    ci.low > TARGET_RATE && d.requests.visits >= 5 && keptVisits >= 3;

  let tag;
  let msg;
  if (d.impressions.visits === 0) {
    tag = "NO DATA";
    msg =
      "No AI module exposure recorded on colour-detail. If this persists more than a few days after deploy, the instrumentation is broken, not the feature — check that ai_module_impression reaches the events table.";
  } else if (band >= 0 && d.requests.visits <= band) {
    // The gate can now FAIL on a small sample, which is the whole point.
    tag = "DELETE AI";
    msg = `${d.requests.visits} request(s) from ${d.impressions.visits} viewable impressions. If the true rate were ${pct(
      TARGET_RATE
    )} this result would occur less than 10% of the time, so it is not bad luck. Remove five endpoints, three routes, ~1,200 lines and a shared API key.`;
  } else if (keepQualifies) {
    tag = "KEEP AND INVEST";
    msg = `exposure→request ${pct(ci.point)} (lower bound ${pct(ci.low)} clears ${pct(
      TARGET_RATE
    )}), ${d.requests.visits} requesting visits and ${keptVisits} that kept the result.`;
  } else if (band < 0) {
    tag = "NOT ENOUGH DATA";
    msg = `${d.impressions.visits} viewable impressions — too few to reject a ${pct(
      TARGET_RATE
    )} rate even at zero clicks (need ${MIN_IMPRESSIONS_TO_DECIDE}). Do not act on the raw percentage.`;
  } else {
    tag = "KEEP, DO NOT INVEST";
    msg = `exposure→request ${pct(ci.point)} (CI ${pct(ci.low)}–${pct(ci.high)}) — above the delete band but short of the keep bar${
      keptVisits < 3 ? `, and only ${keptVisits} visit(s) kept a result` : ""
    }. Leave it working; spend effort elsewhere.`;
  }

  return {
    days,
    since: windowSince,
    contaminatedWindow: windowSince.slice(0, 10) < CLEAN_DATA_FROM,
    surfaces,
    decider: { ...d, ci, band, decidable: band >= 0 },
    minImpressions: MIN_IMPRESSIONS_TO_DECIDE,
    tag,
    msg,
  };
}

if (require.main === module) {
  try {
    main();
  } finally {
    db.close();
  }
} else {
  module.exports = { computeAiGate, wilson, pct, MIN_IMPRESSIONS_TO_DECIDE };
}
