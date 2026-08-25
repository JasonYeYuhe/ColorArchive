#!/usr/bin/env node
/**
 * One-shot decision report: does Design Notes continue?
 *
 * Scheduled for 2026-08-10, NOT 2026-08-09 as docs/human-todo.md first said.
 * The recruitment slot shipped 2026-07-25 (f4170cd) and the crawler filter went
 * live 2026-07-26, so the first COMPLETE clean day is 07-27 and the fourteenth
 * is 08-09 — which does not finish until 00:00 UTC on 08-10. traffic-truth.cjs
 * excludes the current day by design (never extrapolate a partial day), so a run
 * on the 9th sees thirteen days and refuses to conclude. Measured on 08-02: it
 * printed "6/14 clean days", i.e. 07-27..08-01 with 08-02 excluded. Off-by-one
 * dates are how this project has repeatedly ended up concluding from partial
 * data; this comment exists so the next person can re-derive it rather than
 * trust it.
 *
 * WHY THIS EXISTS AT ALL: the question is parked, not answered, and a dated note
 * in a long document is not a mechanism. The owner should receive the numbers
 * without having to remember to go and get them.
 *
 * WHAT IT IS NOT: it does not decide anything and it does not touch the list.
 * It reports, frames the two readings, and stops.
 */

const path = require("path");
const { execFileSync } = require("child_process");

const SERVER_DIR = path.resolve(__dirname, "..");

// MUST come before RESEND_API_KEY is read below. The crontab invokes a bare
// `node scripts/...` with no environment, so without this the script would run
// happily, print a perfect report, and email nobody — the exact silent no-op
// this codebase keeps having to fix. gate-report.cjs:30 does the same thing for
// the same reason.
require(path.join(SERVER_DIR, "node_modules/dotenv")).config({
  path: path.join(SERVER_DIR, ".env"),
});

const db = require(path.join(SERVER_DIR, "db"));
const { Resend } = require(path.join(SERVER_DIR, "node_modules/resend"));

const FROM = process.env.MAIL_FROM || "hello@colorarchive.org";
const OWNER_EMAIL = process.env.GATE_REPORT_TO || "yyyyy.yeyuhe@gmail.com";
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Recruitment slot live from this date; crawler filter live from the 26th, so
// the first trustworthy complete day is the 27th.
const SLOT_LIVE_FROM = "2026-07-25";
const FIRST_CLEAN_DAY = "2026-07-27";

// The window this one-shot is allowed to fire in. The cron line is 0 9 10 8 *,
// which re-fires every August 10th forever; a plain date guard makes that
// harmless instead of clever. A few days of slack so a droplet reboot or a
// missed run does not lose the report entirely.
const FIRE_FROM = "2026-08-10";
const FIRE_UNTIL = "2026-08-17";

// --force runs the report outside its window, --dry-run prints without mailing.
// Both exist so this could be verified the day it was written instead of being
// discovered broken on the one morning it was supposed to work.
const FORCE = process.argv.includes("--force");
const DRY = process.argv.includes("--dry-run");

const today = new Date().toISOString().slice(0, 10);
if (FORCE && (today < FIRE_FROM || today > FIRE_UNTIL)) {
  console.log(`[design-notes-decision] --force: running outside ${FIRE_FROM}..${FIRE_UNTIL} (today ${today}).`);
}
if (!FORCE && (today < FIRE_FROM || today > FIRE_UNTIL)) {
  console.log(
    `[design-notes-decision] ${today} is outside ${FIRE_FROM}..${FIRE_UNTIL} — stale one-shot, doing nothing. ` +
      `Safe to delete this script and its crontab line.`,
  );
  process.exit(0);
}

/* ---------------- measurement ---------------- */

// Yesterday in UTC — the last COMPLETE day. Everything below is bounded by it.
const lastCompleteDay = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

const q = (sql, ...args) => db.prepare(sql).get(...args);

const notesSubs = q(
  `SELECT COUNT(*) AS n FROM subscribers
    WHERE notes_subscribed = 1 AND COALESCE(is_test, 0) = 0`,
).n;

const totalSubs = q(`SELECT COUNT(*) AS n FROM subscribers`).n;

// Two views of guide interest, never one. Pageviews are the inflatable measure
// (22.5% self-identified crawler share before filtering, plus a UA-invisible
// flood); interaction sessions are gated on a person doing something. If these
// two disagree, believe the sessions — that lesson is why traffic-truth.cjs
// exists.
const guideViews = q(
  `SELECT COUNT(*) AS n FROM pageviews
    WHERE path LIKE '/guides/%' AND DATE(created_at) BETWEEN ? AND ?`,
  FIRST_CLEAN_DAY,
  lastCompleteDay,
).n;

const guideSessions = q(
  `SELECT COUNT(DISTINCT session_id) AS n FROM events
    WHERE path LIKE '/guides/%' AND session_id IS NOT NULL
      AND DATE(created_at) BETWEEN ? AND ?`,
  FIRST_CLEAN_DAY,
  lastCompleteDay,
).n;

// THE DENOMINATOR THAT ACTUALLY ANSWERS THE QUESTION.
//
// Pageviews measure arrival; this measures whether the recruitment slot was
// SEEN. `email_form_impression` is fired by src/lib/use-impression.ts, which
// requires the element to be 50% visible for one continuous second — so a
// session counted here scrolled to the form and stopped on it. On /guides/*
// the only email form is the Design Notes one (guide-detail-page.tsx passes
// `notes` to CotdSubscribeForm), so the path filter makes this specific.
//
// Measured 2026-08-02 over the first six clean days: 140 impressions across 122
// distinct sessions, against 0 signups. That is the honest ratio. Quoting 431
// pageviews instead would understate the problem by counting people who never
// scrolled far enough to be asked.
const formImpressionSessions = q(
  `SELECT COUNT(DISTINCT session_id) AS n FROM events
    WHERE event_name = 'email_form_impression' AND path LIKE '/guides/%'
      AND session_id IS NOT NULL AND DATE(created_at) BETWEEN ? AND ?`,
  FIRST_CLEAN_DAY,
  lastCompleteDay,
).n;

const cleanDays = q(
  `SELECT COUNT(DISTINCT DATE(created_at)) AS n FROM pageviews
    WHERE DATE(created_at) BETWEEN ? AND ?`,
  FIRST_CLEAN_DAY,
  lastCompleteDay,
).n;

const delivered = q(`SELECT COUNT(*) AS n FROM design_notes_deliveries`).n;

// traffic-truth.cjs is the agreed arbiter of whether the window is even
// readable. Run it and quote it verbatim rather than re-implementing its rules
// here — two implementations of the same rule is how they drift apart.
let trafficTruth;
try {
  trafficTruth = execFileSync(
    process.execPath,
    [path.join(SERVER_DIR, "scripts", "traffic-truth.cjs")],
    { cwd: SERVER_DIR, encoding: "utf8", timeout: 120000 },
  ).trim();
} catch (err) {
  trafficTruth = `(traffic-truth.cjs failed to run: ${err && err.message})`;
}

const slotDays = Math.round(
  (Date.parse(lastCompleteDay) - Date.parse(SLOT_LIVE_FROM)) / 86400000,
);

/* ---------------- the report ---------------- */

const verdict =
  notesSubs === 0
    ? "STILL ZERO — the format or the pitch is the problem, not the plumbing."
    : `${notesSubs} subscriber(s) — the slot does convert. Do not retire the format.`;

// Rule of three: with zero events in n trials, the 95% upper bound on the true
// rate is about 3/n. It turns "we saw nothing" into "it cannot be better than
// this", which is the form a decision actually needs — a weekly newsletter that
// converts under 2% of the people who stop and look at its signup form is not
// a pitch problem you can rewrite your way out of.
//
// Only meaningful while the numerator is 0; once someone subscribes the real
// rate is estimable and this line stops being printed.
const ceilingLine =
  notesSubs === 0 && formImpressionSessions > 0
    ? `  Best case, 95% confidence: the true signup rate is under ${((3 / formImpressionSessions) * 100).toFixed(1)}% ` +
      `(rule of three, 0 of ${formImpressionSessions}).`
    : `  Observed rate: ${notesSubs}/${formImpressionSessions || "?"} of sessions that saw the form.`;

const lines = [
  "DESIGN NOTES — the decision parked on 2026-08-02",
  "",
  `Headline: ${verdict}`,
  "",
  "NUMBERS (complete UTC days only, " + FIRST_CLEAN_DAY + " .. " + lastCompleteDay + ")",
  `  notes_subscribed = 1 ......... ${notesSubs}   (of ${totalSubs} subscribers total)`,
  `  SESSIONS THAT SAW THE FORM ... ${formImpressionSessions}   <- the denominator that matters`,
  ceilingLine,
  `  guide pageviews .............. ${guideViews}   (arrival, not exposure — weaker)`,
  `  guide interaction sessions ... ${guideSessions}`,
  `  clean days in window ......... ${cleanDays}`,
  `  recruitment slot live for .... ${slotDays} days (since ${SLOT_LIVE_FROM}, commit f4170cd)`,
  `  issues actually delivered .... ${delivered}`,
  "",
  "WHAT THIS NUMBER IS AND IS NOT",
  "  The pipeline was verified end to end on 2026-08-02 — capture surface on guide",
  "  detail pages, the write path in routes/subscribe.js, the sender, and the Friday",
  "  cron. So a zero here is a verdict on the format or the pitch. It is not a bug",
  "  report, and looking for a bug in the plumbing again would be wasted effort.",
  "",
  "TWO READINGS, OPPOSITE RESPONSES — pick one, do not split the difference",
  "  1. The pitch is wrong (position, heading, or the promise of one email a week)",
  "     -> rewrite the slot on guide detail pages and give it another fortnight.",
  "  2. Guide readers do not want weekly email",
  "     -> retire the format. W31 is approved but unsent and recorded no delivery",
  "        row, so nothing is sunk and nothing is wasted by stopping.",
  "",
  "TRAFFIC-TRUTH OUTPUT (verbatim — it refuses to conclude on a thin window, and",
  "that refusal is the point)",
  "",
  trafficTruth,
  "",
  "--",
  "One-shot report from server/scripts/design-notes-decision.cjs. It fires once and",
  "then no-ops; the script and its crontab line can be deleted after you decide.",
];

const body = lines.join("\n");
console.log(body);

(async () => {
  if (DRY) {
    console.log("[design-notes-decision] --dry-run: printed above, nothing sent.");
    return;
  }
  if (!resend) {
    console.error("[design-notes-decision] no RESEND_API_KEY — printed above, no email sent.");
    return;
  }
  try {
    await resend.emails.send({
      from: `ColorArchive <${FROM}>`,
      reply_to: FROM,
      to: OWNER_EMAIL,
      subject: `Design Notes decision — ${notesSubs} subscriber(s) after ${slotDays} days`,
      text: body,
    });
    console.log(`[design-notes-decision] emailed ${OWNER_EMAIL}`);
  } catch (err) {
    console.error("[design-notes-decision] send failed:", err && err.message);
    process.exitCode = 1;
  }
})();
