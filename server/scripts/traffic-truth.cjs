#!/usr/bin/env node
/**
 * Traffic truth report — the same comparison, computed the same way, every time.
 *
 * Run:  node server/scripts/traffic-truth.cjs [--days 14]
 *
 * WHY THIS EXISTS
 * This one number — "how much of our traffic is real" — was revised FOUR times in a
 * single day (2026-07-26/27):
 *
 *   1. "1,025 real-browser writes were 429'd"  -> retracted; 1,024 were one flooder.
 *   2. "~28.6% fewer rows after filtering"     -> ~22% at row level.
 *   3. "~900 human pageviews/day"              -> ~292 once flood IPs were removed.
 *   4. "word-to-color is 45% of human traffic" -> false; its pageviews were the most
 *                                                 flood-inflated on the site.
 *
 * Every revision came from someone computing it slightly differently — grouping by
 * path but not by caller, extrapolating a partial day, or trusting a table that no
 * longer means what its name suggests. Prose in a plan document cannot stop that.
 * A script can. Whatever this prints is the number; if the method is wrong, fix it
 * HERE so the correction propagates instead of being rediscovered.
 *
 * THE TWO RULES IT ENFORCES, both learned the hard way:
 *
 *   1. NEVER JUDGE A SURFACE BY PAGEVIEWS ALONE. /word-to-color/ looked like 45% of
 *      human traffic and was mostly one flooding address. Interaction events are
 *      gated on a real person doing something, so they are far harder to
 *      manufacture: `/events` crawler share measured 1.5% against 22.5% for
 *      pageviews. Both are printed side by side, always.
 *
 *   2. NEVER EXTRAPOLATE A PARTIAL DAY. Only whole UTC days are counted, and the
 *      current day is excluded by name. An earlier estimate scaled 646 rows from a
 *      17-hour window to "~900/day" and was wrong by 3x.
 */

const path = require("path");
const Database = require(path.join(__dirname, "..", "node_modules", "better-sqlite3"));

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "..", "data.db");
const db = new Database(DB_PATH, { readonly: true });

// Filtering went live 14:29 UTC; the step change shows at 20:00 because the
// in-memory cap table starts empty and resident flooders burn a fresh allowance
// first. So the first fully-clean day is the 27th, not the 26th.
const FIRST_CLEAN_DAY = "2026-07-27";

const args = process.argv.slice(2);
const daysArg = args.indexOf("--days");
const DAYS = daysArg >= 0 ? Math.max(1, parseInt(args[daysArg + 1], 10) || 14) : 14;

const today = new Date().toISOString().slice(0, 10);

function q(sql, params = {}) {
  return db.prepare(sql).all(params);
}

// Whole UTC days only, current day excluded — see rule 2.
const dailyPv = q(
  `SELECT date(created_at) d, COUNT(*) c
     FROM pageviews
    WHERE date(created_at) >= date('now', '-' || @days || ' days')
      AND date(created_at) < @today
    GROUP BY d ORDER BY d`,
  { days: DAYS + 1, today }
);

const SURFACE_CASE = `CASE
  WHEN path LIKE '/colors/%'        THEN 'colour-detail'
  WHEN path LIKE '/guides/%'        THEN 'guides'
  WHEN path LIKE '/word-to-color%'  THEN 'word-to-color'
  WHEN path LIKE '/collections/%'   THEN 'collections'
  WHEN path = '/'                   THEN 'home'
  ELSE 'other' END`;

function surfaceSplit(fromDay, toDay) {
  return q(
    `SELECT ${SURFACE_CASE} surface, COUNT(*) pv
       FROM pageviews
      WHERE date(created_at) >= @from AND date(created_at) <= @to
      GROUP BY surface ORDER BY pv DESC`,
    { from: fromDay, to: toDay }
  );
}

const cleanDays = dailyPv.filter((r) => r.d >= FIRST_CLEAN_DAY);
const dirtyDays = dailyPv.filter((r) => r.d < FIRST_CLEAN_DAY);

console.log("");
console.log("TRAFFIC TRUTH");
console.log(`whole UTC days only, ${today} excluded as partial`);
console.log("");

console.log("DAILY PAGEVIEWS");
for (const r of dailyPv) {
  const tag = r.d < FIRST_CLEAN_DAY ? "pre-filter " : "post-filter";
  console.log(`  ${r.d}  ${tag}  ${String(r.c).padStart(6)}`);
}
console.log("");

if (cleanDays.length === 0) {
  console.log("  No complete post-filter day yet. Nothing to compare.");
} else {
  const cleanAvg = cleanDays.reduce((n, r) => n + r.c, 0) / cleanDays.length;
  const dirtyAvg = dirtyDays.length
    ? dirtyDays.reduce((n, r) => n + r.c, 0) / dirtyDays.length
    : null;
  console.log(`  post-filter mean: ${cleanAvg.toFixed(0)}/day over ${cleanDays.length} clean day(s)`);
  if (dirtyAvg) {
    console.log(`  pre-filter mean:  ${dirtyAvg.toFixed(0)}/day over ${dirtyDays.length} day(s)`);
    console.log(`  overstatement:    ${(dirtyAvg / cleanAvg).toFixed(1)}x`);
  }

  // The honesty gate. One day cannot separate a filter effect from a weekday effect
  // — the first attempt at this compared a Friday with a partial Monday and called
  // the difference causal.
  if (cleanDays.length < 14) {
    console.log("");
    console.log(`  ⚠ ${cleanDays.length}/14 clean days. NOT ENOUGH TO CONCLUDE.`);
    console.log("    Fewer than 14 cannot separate the filter's effect from weekday");
    console.log("    variation. Treat the split below as a hint, never as a finding.");
  }
}
console.log("");

console.log("SURFACE SPLIT — PAGEVIEWS (see rule 1: do not judge on these alone)");
if (dirtyDays.length) {
  console.log(`  pre-filter  (${dirtyDays[0].d}..${dirtyDays[dirtyDays.length - 1].d})`);
  for (const r of surfaceSplit(dirtyDays[0].d, dirtyDays[dirtyDays.length - 1].d)) {
    console.log(`    ${r.surface.padEnd(16)} ${String(r.pv).padStart(6)}`);
  }
}
if (cleanDays.length) {
  console.log(`  post-filter (${cleanDays[0].d}..${cleanDays[cleanDays.length - 1].d})`);
  for (const r of surfaceSplit(cleanDays[0].d, cleanDays[cleanDays.length - 1].d)) {
    console.log(`    ${r.surface.padEnd(16)} ${String(r.pv).padStart(6)}`);
  }
}
console.log("");

// Rule 1: the same surfaces judged by interaction instead. session_id has only been
// populated since 2026-07-26, so this is post-filter only by construction.
console.log("SURFACE SPLIT — DISTINCT SESSIONS THAT DID SOMETHING (the trustworthy view)");
const bySession = q(
  `SELECT COALESCE(landing_path, '(unknown)') lp,
          COUNT(DISTINCT session_id) sessions,
          COUNT(*) events
     FROM events
    WHERE session_id IS NOT NULL
      AND date(created_at) >= @first
    GROUP BY lp ORDER BY sessions DESC LIMIT 12`,
  { first: FIRST_CLEAN_DAY }
);
if (bySession.length === 0) {
  console.log("  (no session-attributed events yet)");
} else {
  for (const r of bySession) {
    console.log(`  ${String(r.sessions).padStart(4)} sessions  ${String(r.events).padStart(5)} events  ${r.lp.slice(0, 46)}`);
  }
}
console.log("");

// Concentration: the check that was missing when "~900/day" was reported. If a
// handful of callers account for most of a surface, the surface is not popular.
console.log("CONCENTRATION CHECK — is any one visit dominating?");
const topSessions = q(
  `SELECT session_id, COUNT(*) c
     FROM events
    WHERE session_id IS NOT NULL AND date(created_at) >= @first
    GROUP BY session_id ORDER BY c DESC LIMIT 3`,
  { first: FIRST_CLEAN_DAY }
);
const totalEvents = q(
  `SELECT COUNT(*) c FROM events WHERE session_id IS NOT NULL AND date(created_at) >= @first`,
  { first: FIRST_CLEAN_DAY }
)[0].c;
if (totalEvents > 0) {
  for (const r of topSessions) {
    const share = ((r.c / totalEvents) * 100).toFixed(1);
    const flag = Number(share) > 20 ? "  ← >20% from ONE visit, discount accordingly" : "";
    console.log(`  ${String(r.c).padStart(4)} events (${share}%)${flag}`);
  }
} else {
  console.log("  (no events yet)");
}

console.log("");
console.log("PAGEVIEW-LEVEL CALLER CONCENTRATION cannot be computed from this table —");
console.log("`pageviews` stores no caller identifier, deliberately. To check it, join");
console.log("rows to nginx by timestamp (logs rotate at 14 days):");
console.log("  grep \"$(date -u +%d/%b/%Y)\" /var/log/nginx/access.log \\");
console.log("    | grep 'POST /pageviews' | awk '{print $1}' | sort | uniq -c | sort -rn | head");
console.log("A single address near the top of that list means this report's pageview");
console.log("numbers are inflated and only the session view above should be trusted.");
console.log("");

db.close();
