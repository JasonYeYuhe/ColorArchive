#!/usr/bin/env node
/**
 * W1 read-out — the in-body word→colour card on guide pages.
 *
 *   node /root/ColorArchive/server/scripts/w1-readout.cjs [--since '-42 days']
 *
 * NOT on cron and deliberately so: this prints a decision, and a decision that
 * arrives weekly invites reading it weekly. The stopping rule is pre-registered
 * in docs/dev-plan-2026-08-31-next.md §9.6. Run it when the rule says to.
 *
 * ─── WHY THE PRIMARY IS "REACHED THE TOOL" AND NOT "GENERATED A WORD" ───────
 *
 * The obvious criterion — `word_generated` on the tool page — is BROKEN FOR THIS
 * EXPERIMENT, and it fails in the direction that would have got the card deleted.
 *
 * The card's CTA hands the reader's word over as `/word-to-color/?q=<word>`. The
 * tool treats an inbound `?q=` as the visitor's LANDING WORD
 * (word-color-generator-page.tsx:284-297), and the landing word is free: it is
 * pre-seeded into the counted set (:203) and the commit path returns on
 * `if (counted.has(norm)) return` (:435-436) BEFORE the emit at :465. So a
 * treatment reader who clicks through and gets exactly what the card promised
 * emits NO `word_generated` at all.
 *
 * The control has no equivalent silent success. A control reader arrives at a
 * bare `/word-to-color/`, lands on the default word "quiet luxury", and has to
 * type something real to get any value — which DOES emit.
 *
 * So the better the card works, the fewer conversions the obvious criterion
 * records. That bias points straight into the pre-registered
 * "<3x → remove the card" band. Measured on prod, the two criteria differ by 2.5x
 * on the same population (guide-landing sessions, 30d: 5 reached the tool, 2
 * generated there).
 *
 * `path` is the fix and it costs nothing: `track()` already stamps
 * `window.location.pathname` on every event (src/lib/track.ts:92), and prod
 * confirms the column is populated (1,930 rows on `/word-to-color/` in 7 days).
 * "Reached the tool" is also the thing W1 is actually about — it is a ROUTING
 * intervention, not a generation intervention.
 *
 * ─── THE OTHER FOUR GUARDS ──────────────────────────────────────────────────
 *
 *   1. The denominator is `w1_assigned`, emitted by the card's wrapper in BOTH
 *      arms — not a `landing_path` inference. The plan's original §8 query used
 *      `landing_path`, which src/lib/attribution.ts persists as FIRST-TOUCH for
 *      the browser's lifetime with no TTL, so "landed on a guide" really meant
 *      "this browser's first-ever page was a guide", possibly months ago.
 *   2. `page_read` qualifies engagement. Root layout, both arms, arm-independent.
 *   3. `persisted = true` drops browsers that re-roll their arm; those appear in
 *      both arms and contaminate both.
 *   4. The clustering caveat below is printed every run rather than filed away —
 *      arms are per-browser, sessions are per-tab, so the z-test's independence
 *      assumption is not exactly true and its p is optimistic.
 */
const path = require("path");
const SERVER_DIR = "/root/ColorArchive/server";
const Database = require(path.join(SERVER_DIR, "node_modules/better-sqlite3"));

const argSince = process.argv.indexOf("--since");
/**
 * The default is the EXPERIMENT'S OWN START, not a rolling 42 days.
 *
 * A relative default silently truncates the front of the experiment the later it is
 * run: on day 50 a "-42 days" window has already discarded the first 8 days of both
 * arms, and it discards more every day after. Since the stopping rule allows reading
 * on day 42 OR at 589/arm — whichever lands first — a late read is the expected case,
 * not the exception. Anchoring to MIN(created_at) of w1_assigned makes the window the
 * whole experiment by construction. `--since` still overrides for ad-hoc slices.
 */
const SINCE = argSince > -1 ? process.argv[argSince + 1] : null;

const db = new Database(path.join(SERVER_DIR, "data.db"), { readonly: true });

/**
 * Make SQLite validate the window before anything queries with it. SQLite's
 * modifier grammar makes the leading sign OPTIONAL, so `--since '42 days'` is a
 * FUTURE offset, and an unparseable one yields NULL — either way every query
 * returns zero rows and the script would report that as "not enough data yet".
 * A typo must fail loudly, not read as a null result.
 */
let SINCE_MOD = SINCE;
if (SINCE_MOD === null) {
  const first = db
    .prepare("SELECT MIN(created_at) t FROM events WHERE event_name='w1_assigned'")
    .get().t;
  if (!first) {
    console.log("\nNo w1_assigned rows yet — the experiment has not started collecting.\n");
    process.exit(0);
  }
  // One extra day of slack so the very first rows cannot fall outside a boundary.
  const days = Math.ceil((Date.now() - Date.parse(first + "Z")) / 86400000) + 1;
  SINCE_MOD = `-${days} days`;
  console.log(`(window: experiment start ${first} → now, i.e. ${SINCE_MOD})`);
}
const win = db.prepare("SELECT datetime('now', ?) t, datetime('now') n").get(SINCE_MOD);
if (!win.t || win.t >= win.n) {
  console.error(`--since '${SINCE_MOD}' resolves to ${win.t ?? "NULL"}, which is not in the past.`);
  console.error(`Use a negative SQLite modifier, e.g. --since '-42 days'.`);
  process.exit(1);
}

const ARMS = ["control", "card"];

/** The arm's qualifying sessions: assigned, engaged, stable arm. */
const SESSION_SET = `
    FROM events a
   WHERE a.event_name = 'w1_assigned'
     AND datetime(a.created_at) >= datetime('now', ?)
     AND COALESCE(a.session_id,'') <> ''
     AND json_extract(a.props_json,'$.arm') = ?
     AND COALESCE(json_extract(a.props_json,'$.persisted'), 1) = 1
     AND EXISTS (SELECT 1 FROM events r
                  WHERE r.session_id = a.session_id AND r.event_name = 'page_read')`;

const denom = db.prepare(`SELECT COUNT(DISTINCT a.session_id) c ${SESSION_SET}`);

/**
 * `>= a.created_at` ON EVERY NUMERATOR — this is not tidiness, it decides the verdict.
 *
 * `ca_sid` is per-TAB with no inactivity timeout, so one session can span the tool
 * AND a guide in either order. Without a lower bound, a reader who used
 * /word-to-color/ first and wandered into a guide afterwards counts as "the guide
 * routed them to the tool". Measured on the control base the day this shipped:
 * 5/394 qualified, of which 1 was a pre-guide tool visit — so ~0.25pp of pure
 * floor, present in BOTH arms.
 *
 * A constant floor under both arms is not harmless, because §9.6 thresholds on the
 * RATIO and a floor compresses it deterministically: a card producing a genuine
 * 3.4x lift reads as (1.02%*3.4 + 0.25%) / 1.27% = 2.9x, which lands in the
 * pre-registered "2–3.4x = treat as negative → remove the card" band. The bound
 * turns "did this session ever touch the tool" into "did it touch the tool AFTER
 * the guide", which is the only version of the question W1 is asking.
 */
const AFTER_ASSIGNMENT = `AND %s.created_at >= a.created_at`;

/** PRIMARY: the session reached the tool AFTER seeing the guide. Immune to the landing-word rule. */
const reached = db.prepare(`
  SELECT COUNT(DISTINCT a.session_id) c ${SESSION_SET}
     AND EXISTS (SELECT 1 FROM events p
                  WHERE p.session_id = a.session_id AND p.path LIKE '/word-to-color%'
                    ${AFTER_ASSIGNMENT.replace("%s", "p")})`);

/** Same session set, intersected with an event (optionally a surface). */
const numer = db.prepare(`
  SELECT COUNT(DISTINCT a.session_id) c ${SESSION_SET}
     AND EXISTS (SELECT 1 FROM events g
                  WHERE g.session_id = a.session_id
                    AND g.event_name = ?
                    ${AFTER_ASSIGNMENT.replace("%s", "g")}
                    AND (? = '' OR COALESCE(json_extract(g.props_json,'$.surface'),'word_tool') = ?))`);

/** The card's own CTA click. Treatment-only by construction; a funnel step, not a criterion. */
const cardClick = db.prepare(`
  SELECT COUNT(DISTINCT a.session_id) c ${SESSION_SET}
     AND EXISTS (SELECT 1 FROM events k
                  WHERE k.session_id = a.session_id
                    AND k.event_name = 'guide_tool_click'
                    ${AFTER_ASSIGNMENT.replace("%s", "k")}
                    AND json_extract(k.props_json,'$.placement') = 'w1_card')`);

/** Day 0 is the first `w1_assigned` ever — the event does not exist before deploy. */
const elapsed = db.prepare(
  `SELECT julianday('now') - julianday(MIN(created_at)) d FROM events WHERE event_name='w1_assigned'`,
).get().d;

function zTest(x1, n1, x2, n2) {
  if (!n1 || !n2) return null;
  const pooled = (x1 + x2) / (n1 + n2);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2));
  if (!se) return null;
  const z = (x2 / n2 - x1 / n1) / se;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-(z * z) / 2);
  const p = 2 * (d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))));
  return { z, p: Math.min(1, Math.max(0, p)) };
}

const pct = (x, n) => (n ? ((100 * x) / n).toFixed(2) + "%" : "—");
const TARGET_N = 589; // 6 weeks × 425/arm/month ÷ 4.33 — see dev-plan §9.4
const STOP_DAYS = 42;

console.log(`\nW1 — in-body word→colour card on /guides/*   (window: ${SINCE_MOD})`);
console.log(`Pre-registered rule: docs/dev-plan-2026-08-31-next.md §9.6`);
console.log(`  stop at ${STOP_DAYS} days OR ${TARGET_N}/arm, whichever first`);
console.log(`  >=3.4x = ship  ·  <2x = remove the card  ·  2-3.4x = treat as negative\n`);

const rows = ARMS.map((arm) => ({
  arm,
  d: denom.get(SINCE_MOD, arm).c,
  reached: reached.get(SINCE_MOD, arm).c,
  tool: numer.get(SINCE_MOD, arm, "word_generated", "word_tool", "word_tool").c,
  any: numer.get(SINCE_MOD, arm, "word_generated", "", "").c,
  click: cardClick.get(SINCE_MOD, arm).c,
}));

console.log("arm       sessions   →reached tool   →generated(tool) →generated(any) →card CTA");
for (const r of rows) {
  console.log(
    `${r.arm.padEnd(9)} ${String(r.d).padStart(8)}   ` +
      `${String(r.reached).padStart(4)} ${pct(r.reached, r.d).padStart(7)}   ` +
      `${String(r.tool).padStart(4)} ${pct(r.tool, r.d).padStart(7)}   ` +
      `${String(r.any).padStart(4)} ${pct(r.any, r.d).padStart(7)}  ` +
      `${String(r.click).padStart(4)} ${pct(r.click, r.d).padStart(7)}`,
  );
}

const [c, k] = rows;
console.log("\nPRIMARY — reached /word-to-color/ (the criterion the ?q= handoff cannot suppress):");
if (c.d && k.d) {
  const cr = c.reached / c.d;
  const lift = cr > 0 ? k.reached / k.d / cr : null;
  const stat = zTest(c.reached, c.d, k.reached, k.d);
  console.log(
    `  control ${pct(c.reached, c.d)}   card ${pct(k.reached, k.d)}   ` +
      `lift ${lift === null ? "n/a (control is 0)" : lift.toFixed(1) + "x"}` +
      (stat ? `   z=${stat.z.toFixed(2)} p=${stat.p.toFixed(4)}` : ""),
  );
} else {
  console.log("  not enough data yet");
}

console.log("\nSECONDARY — generated ON THE TOOL. Reported, never the criterion: an inbound");
console.log("  ?q= word is the free landing word and emits nothing, so this UNDER-counts the");
console.log("  card arm specifically. A card-arm win here is strong; a null here is not news.");
console.log(`  control ${pct(c.tool, c.d)}   card ${pct(k.tool, k.d)}`);
console.log("SECONDARY — generated anywhere, including inside the card:");
console.log(`  control ${pct(c.any, c.d)}   card ${pct(k.any, k.d)}`);

const smaller = Math.min(c.d, k.d);
const days = elapsed === null ? 0 : Math.floor(elapsed);
console.log(`\nSTOP CHECK — ${days}/${STOP_DAYS} days elapsed · ${smaller}/${TARGET_N} sessions in the smaller arm`);
console.log(
  days >= STOP_DAYS || smaller >= TARGET_N
    ? "  *** A stop condition is met. Decide now, per §9.6. Do not extend the window. ***"
    : "  keep running",
);

console.log("\nCAVEAT — clustering, now MEASURED rather than feared:");
console.log("  The arm is per BROWSER (localStorage), the count is per TAB (sessionStorage), so one");
console.log("  browser can contribute several correlated sessions to one arm and the z-test's");
console.log("  independence assumption is not exactly true. Measured on this site's real data the");
console.log("  design effect is ~1.05 — a ~2.3% inflation of the standard error, because sessions");
console.log("  per browser here are very close to 1. That is NOT enough to discard a borderline");
console.log("  result: at n=589/arm the experiment buys exactly 3.4x at 80% power, so throwing away");
console.log("  p=0.048 costs far more than the 2.3% it would correct. Read p at face value and");
console.log("  subtract a little confidence, rather than applying a rule. The lift ratio is");
console.log("  unaffected by clustering either way; only the p is.");

/**
 * The `a` side is COLLAPSED TO ONE ROW PER SESSION before the join. Joining
 * `events a` to `events e` on session_id alone multiplies every one of a session's
 * events by that session's number of `w1_assigned` rows — and N>1 happens for
 * exactly one population: browsers that cannot write sessionStorage, whose
 * once-per-visit guard falls back to a module flag covering a single document
 * load. Those are also the browsers likeliest to be dropping beacons. So the
 * un-deduplicated version inflated `events/session` and `_dropped` hardest for the
 * very sessions this block exists to detect, and if one arm drew more of them it
 * would manufacture the asymmetry it is supposed to be watching for.
 */
const health = db.prepare(`
  SELECT arm, COUNT(*) events, COUNT(DISTINCT e.session_id) sessions,
         SUM(COALESCE(json_extract(e.props_json,'$._dropped'),0)) dropped
    FROM (SELECT session_id, MIN(json_extract(props_json,'$.arm')) arm
            FROM events
           WHERE event_name='w1_assigned' AND datetime(created_at) >= datetime('now', ?)
             AND COALESCE(session_id,'') <> ''
           GROUP BY session_id) a
    JOIN events e ON e.session_id = a.session_id
   GROUP BY arm`).all(SINCE_MOD);
console.log("\nHEALTH — asymmetric event loss would invalidate the comparison:");
for (const h of health) {
  console.log(`  ${String(h.arm).padEnd(8)} ${(h.events / (h.sessions || 1)).toFixed(1)} events/session   _dropped=${h.dropped}`);
}
const unstable = db.prepare(
  `SELECT COUNT(DISTINCT session_id) c FROM events
    WHERE event_name='w1_assigned' AND datetime(created_at) >= datetime('now', ?)
      AND COALESCE(json_extract(props_json,'$.persisted'), 1) = 0`).get(SINCE_MOD).c;
console.log(`  ${unstable} sessions excluded for an unstable arm (persisted:false)\n`);
