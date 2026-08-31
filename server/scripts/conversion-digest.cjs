#!/usr/bin/env node
/**
 * Daily conversion digest — the money-funnel watchdog.
 *
 * Born from the 2026-07-20 incident: our first real subscriber signed up, was
 * locked out by a paywall bug, and we only found out ~2 days later by accident.
 * This makes the revenue funnel VISIBLE within a day.
 *
 * High-signal policy: emails the owner only when something in the money funnel
 * actually happened in the window (a paid order, a new subscriber/trial, a
 * completed checkout, or a refund). Silent on dead days — EXCEPT a Monday
 * heartbeat so silence never gets confused with "the cron broke".
 *
 * Run: node scripts/conversion-digest.cjs [--force] [--days=1] [--dry-run]
 *
 * NOTE ON COMPARING TWO OF THESE EMAILS ACROSS 2026-07-26: bot filtering went live
 * that day (server/bot-detect.js) and removed ~31% of writes to the events and
 * pageviews tables — measured, not estimated: in the first clean window 12 of 39
 * POSTs to /pageviews were dropped as automated, with every human request still
 * written. This digest uses a 1-day window and makes no cross-period comparison, so
 * it cannot itself raise a false alarm; the risk is a person putting two emails side
 * by side and reading a correction as a collapse.
 */

const path = require("path");
const SERVER_DIR = path.resolve(__dirname, "..");
require(path.join(SERVER_DIR, "node_modules/dotenv")).config({ path: path.join(SERVER_DIR, ".env") });
const Database = require(path.join(SERVER_DIR, "node_modules/better-sqlite3"));
const { Resend } = require(path.join(SERVER_DIR, "node_modules/resend"));
const { DISTINCT_VISITS, NOT_PAGE_LOAD, windowCaveats } = require(path.join(SERVER_DIR, "session-denominator"));

const DB_PATH = process.env.DB_PATH || path.join(SERVER_DIR, "data.db");
const FROM = process.env.FROM_EMAIL || "hello@colorarchive.org";
const TO = process.env.GATE_REPORT_TO || "yyyyy.yeyuhe@gmail.com";
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const argForce = process.argv.includes("--force");
// Lets this script be run against production data without emailing the owner.
// It reports on money, so "just try it and see" cannot be the way you test it.
const argDryRun = process.argv.includes("--dry-run");
const daysArg = (process.argv.find((a) => a.startsWith("--days=")) || "").split("=")[1];
const WINDOW_DAYS = Number(daysArg) > 0 ? Number(daysArg) : 1;
const since = `-${WINDOW_DAYS} day`;
const REAL = "COALESCE(is_test,0)=0";

// Owner-owned addresses, from .env — deliberately NOT a module (dev-plan
// 2026-08-22 §6; two reviewers called the module + guard-test version
// over-engineering for a nine-row table).
//
// WHY THIS EXISTS AT ALL: the only other copy of this list lives inside
// scripts/fix-order-attribution.cjs, a ONE-SHOT migration that stamps
// is_test=1 at the moment it runs. It therefore cannot see an order that
// arrives after it. That is the whole cause of the 2026-08-21 digest going out
// with the subject "💰 1 payment" for the owner's own ¥549.69 charge on
// 08-20: the row was real and un-flagged, and this report had exactly one
// field to describe it with.
const OWNER_EMAILS = String(process.env.OWNER_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);
const isOwner = (email) => OWNER_EMAILS.includes(String(email || "").toLowerCase());

const db = new Database(DB_PATH, { readonly: true });
const now = new Date();

/* ---------------- money events (drive the send decision) ---------------- */

// ① PROCESSOR PAYMENTS. Every real, non-refunded, non-zero charge in the
// window, owner's own included. This set is deliberately NOT filtered: a charge
// the processor actually took is a fact, and suppressing it because we cannot
// attribute it would let the measurement validate itself (dev-plan §2.2).
const paidOrders = db.prepare(
  `SELECT order_id, email, product, amount, amount_minor, currency, pack_id,
          attributed_source, created_at AS created_raw, substr(created_at,1,16) AS ts
     FROM orders
    WHERE datetime(created_at) >= datetime('now', ?) AND ${REAL} AND COALESCE(refunded,0)=0 AND amount > 0
    ORDER BY created_at DESC`
).all(since);

// ② FIRST-TIME EXTERNAL PAYING CUSTOMERS. Three exclusions, each for its own
// reason: owner rows (not a customer), and any row with an earlier kept-money
// order from the same address (a renewal or a second purchase is not a new
// customer). Counted by DISTINCT EMAIL, not by order row — the 08-18 threshold
// said "≥2 payments", which one person buying twice would have satisfied.
const earlierPaidOrders = db.prepare(
  `SELECT COUNT(*) c FROM orders
    WHERE LOWER(email) = LOWER(?) AND ${REAL} AND COALESCE(refunded,0)=0 AND amount > 0
      AND datetime(created_at) < datetime(?)`
);
const isFirstEver = (o) => earlierPaidOrders.get(o.email, o.created_raw).c === 0;
const newExternalEmails = [
  ...new Set(paidOrders.filter((o) => !isOwner(o.email) && isFirstEver(o)).map((o) => String(o.email).toLowerCase())),
];

// ③ ATTRIBUTION STATUS. Reported per row and never used as an exclusion.
// A missing touchpoint means we failed to record where someone came from; it is
// not evidence the payment is unreal. (The first draft of the plan treated
// "no checkout_* event that day" as a second, independent proof the ¥549.69
// charge was the owner's. It is neither independent nor proof.)
const attributedCount = paidOrders.filter((o) => o.attributed_source).length;

// New web subscribers incl. trials (a trial signup is exactly the signal we
// missed on 07-20 — flag it day one even before any money moves).
const newSubs = db.prepare(
  `SELECT email, subscription_plan AS plan, COALESCE(subscription_status,'unknown') AS status, substr(created_at,1,16) AS ts
     FROM users
    WHERE datetime(created_at) >= datetime('now', ?) AND ${REAL}
      AND payment_provider = 'lemonsqueezy' AND provider_subscription_id IS NOT NULL
    ORDER BY created_at DESC`
).all(since);

const refunds = db.prepare(
  `SELECT order_id, email, product, amount, amount_minor, currency, substr(COALESCE(refunded_at,created_at),1,16) AS ts
     FROM orders
    WHERE refunded = 1 AND refunded_at IS NOT NULL AND ${REAL} AND datetime(refunded_at) >= datetime('now', ?)
    ORDER BY refunded_at DESC`
).all(since);

/* ---------------- funnel context ---------------- */

// Raw event rows. Kept, but never shown alone: one visitor who triggers the
// paywall, reloads, and triggers it again is two rows and one person.
const ev = (name) =>
  db.prepare(`SELECT COUNT(*) c FROM events WHERE event_name = ? AND datetime(created_at) >= datetime('now', ?)`).get(name, since).c;

// Distinct visits — the denominator this funnel should always have used. See
// server/session-denominator.js for why events beat pageviews here, and for the
// two dates that make a raw session count misleading.
const evVisits = (name) =>
  db.prepare(
    `SELECT ${DISTINCT_VISITS} c FROM events WHERE event_name = ? AND datetime(created_at) >= datetime('now', ?)`,
  ).get(name, since).c;

// Everything anyone did on the site in the window, deduplicated by visit. This
// is the number that belongs at the top of every ratio on this site.
// Same guard as gate-report.cjs. This query has no event_name filter, so it is the
// one a new event silently moves — `w1_assigned` fires on every /guides/ mount in
// both arms. Measured 7.4h after W1 shipped: 12 of 146 one-day sessions existed only
// because of it (+8.9%). See TRAP 4 in server/session-denominator.js.
const engagedVisits = db.prepare(
  `SELECT ${DISTINCT_VISITS} c FROM events WHERE datetime(created_at) >= datetime('now', ?)
      AND ${NOT_PAGE_LOAD}`,
).get(since).c;

// Dedupe checkout_success by session so a page refresh can't inflate it (the
// event fires client-side on the /thanks/ landing). Falls back to row id when a
// session_id is missing so nothing is silently collapsed to one.
const distinctCheckoutSuccess = db.prepare(
  `SELECT COUNT(DISTINCT COALESCE(NULLIF(session_id,''), 'row'||id)) c
     FROM events WHERE event_name='checkout_success' AND datetime(created_at) >= datetime('now', ?)`
).get(since).c;

const funnel = {
  paywallHit: evVisits("word_paywall_hit"),
  paywallRestored: evVisits("word_paywall_restored"),
  proBypass: evVisits("word_paywall_pro_bypass"),
  proClick: evVisits("word_paywall_pro_click"),
  checkoutClicked: evVisits("checkout_clicked"),
  checkoutSuccess: distinctCheckoutSuccess,
  copied: evVisits("color_copied"),
  copyFailed: evVisits("color_copy_failed"),
};
// Raw rows alongside, so a step whose count is one busy visitor is visible as one.
const funnelRows = {
  paywallHit: ev("word_paywall_hit"),
  paywallRestored: ev("word_paywall_restored"),
  proBypass: ev("word_paywall_pro_bypass"),
  proClick: ev("word_paywall_pro_click"),
  checkoutClicked: ev("checkout_clicked"),
  copied: ev("color_copied"),
  copyFailed: ev("color_copy_failed"),
};

/* ---------------- copy reliability (added 2026-08-25, W0) ------------------
 *
 * `color_copied` on its own is not a demand signal and never was: until today
 * it fired only after `clipboard.writeText()` RESOLVED, with an empty catch, so
 * "17 copies in 21 days" could not distinguish "nobody wanted to take a value
 * away" from "people tried and the browser refused". Those two readings call
 * for opposite work. `color_copy_failed` is the missing half.
 *
 * THE TRAP THIS BLOCK EXISTS TO AVOID. For the first days after deploy the new
 * event does not exist yet, so a naive `failed / (copied + failed)` prints a
 * confident 0.00% — which reads as "clipboard works fine" when it actually
 * means "no data". That is the exact mistake the event was added to fix, so
 * the ratio is suppressed entirely until at least one attempt of EITHER kind
 * has been seen from a build that can emit both.
 */
const copyAttemptRows = funnelRows.copied + funnelRows.copyFailed;
const copyAttemptVisits = funnel.copied + funnel.copyFailed;
// Has any client on a build that emits the failure event reported in yet? A
// zero here means "not deployed / not yet observed", never "no failures".
const copyFailedFirstSeen = db.prepare(
  "SELECT MIN(created_at) t FROM events WHERE event_name = 'color_copy_failed'",
).get().t;
const copyFailedEverSeen = Boolean(copyFailedFirstSeen);

/* ---------------- delivery loss (added 2026-08-27) -------------------------
 *
 * Everything above this line divides one event count by another, and every one
 * of those counts silently assumed that an event fired is an event recorded.
 * `navigator.sendBeacon` signals refusal by RETURNING FALSE rather than
 * throwing, so src/lib/track.ts discarded that answer for its whole life. What
 * a browser cannot deliver it now counts and confesses as `_dropped` on the
 * next event that does get through.
 *
 * READ THE ZERO CAREFULLY — it is the same trap as color_copy_failed. Nothing
 * emits `_dropped` unless there was a loss AND a later success to carry the
 * report, so an empty result means "nobody reported a backlog", which covers
 * both "no refusals" and "the change is not live in that browser yet". It is
 * never proof that delivery is complete.
 *
 * AND THE FIX IS ITSELF A DISCONTINUITY — say it before someone reads it as
 * growth. The same change also makes a refused beacon RETRY over keepalive
 * fetch, so a browser that was quietly losing events now delivers them. Every
 * count on this site can therefore step up on 2026-08-27 without one extra
 * person doing one extra thing. This is the 2026-08-10 failure wearing the
 * opposite sign, and the number below is the only estimate of its size we get.
 */
const dropped = db.prepare(
  `SELECT COALESCE(SUM(CAST(json_extract(props_json,'$._dropped') AS INTEGER)), 0) lost,
          COUNT(*) reports,
          ${DISTINCT_VISITS} visits
     FROM events WHERE datetime(created_at) >= datetime('now', ?)
      AND json_extract(props_json,'$._dropped') IS NOT NULL`,
).get(since);

/**
 * Second trap, subtler than the first. For some days after the deploy the two
 * events do not come from the same population: a visitor on a cached old bundle
 * still emits `color_copied` but CANNOT emit `color_copy_failed`, so every one
 * of them lands in the denominator and never in the numerator. The measured
 * failure rate is biased DOWNWARD for exactly as long as old bundles are live.
 *
 * There is no way to detect a stale bundle from the events table, so instead of
 * guessing we surface when clean measurement began and let the reader see
 * whether the window is fully covered by it.
 */
const copyWindowFullyCovered =
  copyFailedEverSeen &&
  db.prepare(
    "SELECT datetime(?) <= datetime('now', ?) c",
  ).get(copyFailedFirstSeen, since).c === 1;

/* ---------------- capture funnel (added 2026-07-26) ---------------- */

// Impression → subscribe, per surface. Impressions are viewport-based, so this
// is a real conversion rate rather than pageviews-over-signups.
const captureBySurface = db.prepare(
  `SELECT
     COALESCE(json_extract(props_json,'$.source'),'?') AS surface,
     SUM(CASE WHEN event_name='email_form_impression' THEN 1 ELSE 0 END) AS impressions,
     SUM(CASE WHEN event_name='email_subscribed' AND json_extract(props_json,'$.isNew') IN (1,'true') THEN 1 ELSE 0 END) AS new_subs
   FROM events
   WHERE event_name IN ('email_form_impression','email_subscribed')
     AND datetime(created_at) >= datetime('now', ?)
   GROUP BY surface
   HAVING impressions > 0 OR new_subs > 0
   ORDER BY impressions DESC`,
).all(since);

// Content → tool, and the Pro CTAs that were invisible until 2026-07-25.
//
// SPLIT 2026-08-31, and the split is what keeps this number readable. The W1 card
// (src/components/guide-word-card.tsx) is a FOURTH `guide_tool_click` emitter,
// tagged `placement:"w1_card"`, and it only exists for half of guide readers. Left
// as one unfiltered COUNT(*) this line would step up on deploy day for a purely
// instrumentation reason — and worse, it would be a number driven by an A/B arm,
// so it would move again when the experiment ends. Rows written before 08-31 carry
// no `w1_card` placement, so the first series is continuous across the change.
const contentToTool = db.prepare(
  `SELECT COUNT(*) c FROM events WHERE event_name='guide_tool_click'
     AND datetime(created_at) >= datetime('now', ?)
     AND COALESCE(json_extract(props_json,'$.placement'),'') <> 'w1_card'`).get(since).c;
const contentToToolW1 = db.prepare(
  `SELECT COUNT(*) c FROM events WHERE event_name='guide_tool_click'
     AND datetime(created_at) >= datetime('now', ?)
     AND json_extract(props_json,'$.placement') = 'w1_card'`).get(since).c;
const proCtaClicks = db.prepare(
  `SELECT COALESCE(json_extract(props_json,'$.surface'),'?') AS surface, COUNT(*) c
     FROM events WHERE event_name='pro_cta_click' AND datetime(created_at) >= datetime('now', ?)
    GROUP BY surface ORDER BY c DESC`,
).all(since);
const captureCtaClicks = ev("email_capture_cta_click");

// `upgrade_clicked` — the export/quota gates' own CTA. It has carried a
// `source` prop at every emission site since it was written, but until
// 2026-08-18 nothing on the server ever read it: absent from GATE_EVENTS,
// absent from gate-report, absent from here. The data was being collected and
// thrown away. (The dev plan recorded this as "all clicks land in (none)";
// that bucket belongs to preorder_cta_click, a retired event — the clicks were
// attributed all along, just never queried.)
//
// NOTE ON READING THIS: at this volume these are raw counts, not rates. They
// exist to show a cliff — a source going to zero — not to compare sources.
const upgradeClicks = db.prepare(
  `SELECT COALESCE(json_extract(props_json,'$.source'),'?') AS source, COUNT(*) c
     FROM events WHERE event_name='upgrade_clicked' AND datetime(created_at) >= datetime('now', ?)
    GROUP BY source ORDER BY c DESC`,
).all(since);

// How far people get before the paywall — the drop-off across ordinals says
// whether 5 free lookups is generous or just more than anyone wants.
//
// `counted` is load-bearing here, not decoration. From 2026-08-27 `word_generated`
// also fires for people the quota does not apply to (Pro, already gated, unlocked,
// entitlement unresolved). Those rows carry no `count`, so without this filter
// they would all land in a silent `n = NULL` bucket and read as a sixth ordinal.
// This curve is about spending free lookups, so it wants exactly the rows that
// spent one. Pre-2026-08-27 rows have no `counted` key and all qualify.
//
// `surface` is the same argument one step further out. From 2026-08-31 there is a
// SECOND emitter — the W1 card inside guide articles
// (src/components/guide-word-card.tsx) — which by design never spends quota and so
// never writes `count`. The `counted` filter above therefore already excludes it,
// and this line changes nothing today. It is here because that exclusion is a side
// effect of an entitlement rule rather than a statement about which surface this
// curve measures, and the day someone lets an embed spend quota is the day this
// curve would start counting article readers as paywall progress without saying so.
// Rows written before 08-31 carry no `surface` key and were all tool-page.
const wordDepth = db.prepare(
  `SELECT CAST(json_extract(props_json,'$.count') AS INTEGER) AS n, COUNT(*) c
     FROM events WHERE event_name='word_generated' AND datetime(created_at) >= datetime('now', ?)
      AND COALESCE(json_extract(props_json,'$.counted'), 1) = 1
      AND COALESCE(json_extract(props_json,'$.surface'), 'word_tool') = 'word_tool'
    GROUP BY n ORDER BY n`,
).all(since);

// Webhook-miss tripwire. A HARD alarm only for the unambiguous case — completed
// checkout(s) but literally nothing recorded (no paid order, no new sub/trial).
// A mere gap (checkout_success > recorded) is soft: it's usually an existing
// free user upgrading to a trial (their users.created_at predates the window,
// so they're not in newSubs) or a stray test checkout — worth a glance, not an
// alarm. This is deliberately conservative to keep the digest trustworthy.
const recordedConversions = paidOrders.length + newSubs.length;
const hardWebhookMiss =
  distinctCheckoutSuccess >= 1 && recordedConversions === 0 && paidOrders.length === 0 && newSubs.length === 0;
const softCheckoutGap = distinctCheckoutSuccess > recordedConversions;

/* ---------------- snapshots ---------------- */

const subsByStatus = db.prepare(
  `SELECT COALESCE(subscription_status,'unknown') st, COUNT(*) c
     FROM users WHERE tier='pro' AND payment_provider='lemonsqueezy' AND ${REAL}
    GROUP BY st ORDER BY c DESC`
).all();

// 🔴 STALE-RENEWAL TRIPWIRE — added 2026-08-23, the morning after it was needed.
//
// WHAT HAPPENED: our only paying customer's renewal fell due 2026-08-22 10:00Z
// and Lemon Squeezy never billed it — no invoice, no `past_due`, no
// subscription_payment_failed webhook, `renews_at` never advanced. LS still
// reported the subscription `active`. Meanwhile entitlement.js compares
// `pro_expires_at` against the clock with no grace on the renewal branch, so
// from 10:00Z onward every read path answered "free" and auth.js was one page
// load away from writing tier='free' back to her row. It went unnoticed for
// twenty hours, and it was found by hand, not by this report.
//
// The existing "renewals due within 7d" line could not catch it: it looks
// FORWARD (BETWEEN now AND +7 days), so the instant a renewal date passes, the
// row silently drops out of the only place the digest mentioned it.
//
// This looks BACKWARD instead: a row whose provider status still says the
// subscription is alive, whose access clock has already run out. That pair is
// never normal — it means somebody is paying (or believes they are) and is
// locked out right now.
//
// The status list is kept in step with ACTIVE_STATUSES in server/entitlement.js
// on purpose. If those diverge, this stops describing the thing it is named for.
const staleRenewals = db.prepare(
  `SELECT email,
          COALESCE(subscription_status,'unknown') AS status,
          substr(pro_expires_at,1,19) AS expired_at,
          CAST((julianday('now') - julianday(pro_expires_at)) * 24 AS INTEGER) AS hours_overdue
     FROM users
    WHERE ${REAL} AND tier = 'pro' AND payment_provider = 'lemonsqueezy'
      AND subscription_status IN ('active','trialing','on_trial','past_due')
      AND pro_expires_at IS NOT NULL
      AND datetime(pro_expires_at) < datetime('now')
    ORDER BY pro_expires_at`
).all();

const renewalsDue = db.prepare(
  `SELECT email, substr(pro_expires_at,1,10) AS due
     FROM users WHERE tier='pro' AND ${REAL} AND pro_expires_at IS NOT NULL
       -- Must match how subsByStatus defines a real subscription, which this query
       -- did not. Without these two filters, comped/manual pro grants (their
       -- subscription_status is NULL) counted as upcoming renewals: the digest
       -- announced 3 renewals due 2026-08-03 when the only real one is a single
       -- monthly subscriber due 08-22. Announcing phantom revenue as imminent is
       -- worse than announcing none.
       AND payment_provider='lemonsqueezy' AND subscription_status='active'
       AND datetime(pro_expires_at) BETWEEN datetime('now') AND datetime('now','+7 day')
    ORDER BY pro_expires_at`
).all();

/* ---------------- send decision ---------------- */

const isMonday = now.getUTCDay() === 1;
// staleRenewals is in here deliberately. It is not "activity" — it is the one
// condition where SILENCE is the failure. On a quiet non-Monday this digest
// does not send at all, which is exactly the day a locked-out subscriber would
// go unmentioned.
const hasMoneyActivity =
  paidOrders.length > 0 ||
  newSubs.length > 0 ||
  funnel.checkoutSuccess > 0 ||
  refunds.length > 0 ||
  staleRenewals.length > 0;
const shouldSend = argForce || hasMoneyActivity || isMonday;

/* ---------------- render ---------------- */

const money = (o) => {
  const cur = (o.currency || "jpy").toUpperCase();
  if (cur === "JPY") return `¥${o.amount} JPY`; // zero-decimal, stored as-is
  if (o.amount_minor) return `${(o.amount_minor / 100).toFixed(2)} ${cur}`; // exact
  return `${o.amount} ${cur}`; // decimal currency, pre-amount_minor row — no ¥
};

// One row's worth of the three fields, so that "who paid" and "is this a new
// customer" and "do we know where they came from" can never again collapse into
// a single count. Every excluded row is still PRINTED — the exclusion is a
// label, not a deletion.
const classify = (o) => {
  if (isOwner(o.email)) return "owner — excluded from ②";
  if (!isFirstEver(o)) return "returning / renewal — excluded from ②";
  return "first-time external ✅";
};

const lines = [];
if (staleRenewals.length) {
  lines.push("🔴 LOCKED OUT RIGHT NOW — provider says active, our access clock has expired:");
  for (const r of staleRenewals) {
    lines.push(`  ${r.email}  [${r.status}]  expired ${r.expired_at}Z  (${r.hours_overdue}h ago)`);
  }
  lines.push("  This person is being denied Pro on every read path (web + API), and auth.js will");
  lines.push("  write tier='free' to their row on their next page load. Check the provider first:");
  lines.push("  a renewal that was never attempted is the provider's problem, not a webhook miss.");
}
if (paidOrders.length) {
  lines.push(`💰 ① PROCESSOR PAYMENTS (real charges taken, owner's included): ${paidOrders.length}`);
  for (const o of paidOrders) {
    lines.push(`  ${o.ts}  ${o.email}  ${o.product}  ${money(o)}`);
    lines.push(`      ${classify(o)} · attribution: ${o.attributed_source || "none recorded"}`);
  }
  lines.push(`🧍 ② FIRST-TIME EXTERNAL PAYING CUSTOMERS: ${newExternalEmails.length}`);
  lines.push(`   ${newExternalEmails.length ? newExternalEmails.join(", ") : "(none — every row above is owner, returning, or a renewal)"}`);
  lines.push(`🔗 ③ ATTRIBUTION: ${attributedCount}/${paidOrders.length} of ① carry a recorded source.`);
  lines.push(`   "none recorded" means the touchpoint was not captured. It is NOT evidence the payment is unreal.`);
  if (!OWNER_EMAILS.length) {
    lines.push(`  ⚠ OWNER_EMAILS is unset in server/.env — nobody is being excluded as owner, so ② is overstated by any self-purchase.`);
  }
}
if (newSubs.length) {
  lines.push("🆕 NEW SUBSCRIBERS / TRIALS:");
  for (const s of newSubs)
    lines.push(`  ${s.ts}  ${s.email}  Pro ${s.plan || "?"}  [${s.status}]${isOwner(s.email) ? "  ← owner" : ""}`);
}
if (refunds.length) {
  lines.push("↩︎ REFUNDS / DISPUTES:");
  for (const r of refunds) lines.push(`  ${r.ts}  ${r.email}  ${r.product}  ${money(r)}`);
}
if (hardWebhookMiss) {
  lines.push(`⚠️ CHECK: ${distinctCheckoutSuccess} completed checkout(s) this window but ZERO recorded — a payment may not have reached the DB. Check LS webhook delivery + /webhooks logs.`);
} else if (softCheckoutGap) {
  lines.push(`ℹ️ ${distinctCheckoutSuccess} completed checkouts vs ${recordedConversions} recorded conversion(s) — likely an existing user upgrading (trial) or a test checkout; watch if the gap persists.`);
}

// Visits, with raw event rows in brackets. Counts are per VISIT — the older
// version of this block counted rows, so one visitor reloading the paywall read
// as several people hitting it.
const step = (visits, rows) => `${String(visits).padStart(4)}${rows === undefined ? "" : ` visits (${rows} events)`}`;
const funnelBlock = [
  `engaged visits           : ${engagedVisits}   (anyone who did anything)`,
  `color_copied             : ${step(funnel.copied, funnelRows.copied)}   (took a value away)`,
  `color_copy_failed        : ${step(funnel.copyFailed, funnelRows.copyFailed)}   (clicked, browser refused)`,
  // Per ATTEMPT, not per visit: this is a technical failure rate, so the honest
  // denominator is attempts. The per-visit figure is reported beside it because
  // a missing clipboard API is deterministic per browser — one affected visitor
  // fails every time they click, which inflates the attempt-level rate relative
  // to the share of PEOPLE affected. The two answer different questions.
  !copyFailedEverSeen
    ? `  └ failure rate          :    — no color_copy_failed event has EVER been recorded. That means "not deployed yet / no data", NOT "no failures". Do not read the copy numbers above as a demand signal until this line shows a percentage.`
    : copyAttemptRows === 0
      ? `  └ failure rate          :    — nobody attempted a copy in this window (the event exists, so this one really is "no attempts").`
      : `  └ failure rate          : ${((funnelRows.copyFailed / copyAttemptRows) * 100).toFixed(1)}% of ${copyAttemptRows} attempts · ${((funnel.copyFailed / copyAttemptVisits) * 100).toFixed(1)}% of ${copyAttemptVisits} visits that tried${
          copyWindowFullyCovered
            ? ""
            : `\n    ⚠ measurement only began ${copyFailedFirstSeen} UTC, inside this window. Visitors on a cached older bundle emit color_copied but cannot emit color_copy_failed, so this rate is biased LOW until the window starts after that timestamp.`
        }`,
  dropped.lost === 0
    ? `events never delivered   :    0 reported   (means "no browser reported a backlog" — either no refusals or the 2026-08-27 change not yet live in that browser. NOT proof delivery is complete.)`
    : `events never delivered   : ${String(dropped.lost).padStart(4)} events, self-reported by ${dropped.visits} visits in ${dropped.reports} confessions
    ⚠ a LOWER bound three times over: a browser that never delivers again never reports its backlog; a beacon that returned true was only QUEUED; and events the server accepts-and-discards (bot filter, 200/day cap) answer 200 and are invisible here.`,
  `  ⚠ 2026-08-27 also made a refused beacon retry over fetch. A browser that was`,
  `    silently losing events now delivers them, so counts above may step up on that`,
  `    date with no change in behaviour. Do not read the step as growth.`,
  `word_paywall_hit         : ${step(funnel.paywallHit, funnelRows.paywallHit)}`,
  `word_paywall_restored    : ${step(funnel.paywallRestored, funnelRows.paywallRestored)}`,
  `word_paywall_pro_click   : ${step(funnel.proClick, funnelRows.proClick)}   (paid intent)`,
  `word_paywall_pro_bypass  : ${step(funnel.proBypass, funnelRows.proBypass)}   (Pro recognized — fix working)`,
  `checkout_clicked         : ${step(funnel.checkoutClicked, funnelRows.checkoutClicked)}`,
  `checkout_success         : ${String(funnel.checkoutSuccess).padStart(4)} visits`,
  ...(windowCaveats(WINDOW_DAYS) ?? []).map((c) => `  ⚠ ${c}`),
];

const pct = (n, d) => (d > 0 ? `${((n / d) * 100).toFixed(2)}%` : "—");
const captureBlock = captureBySurface.length
  ? captureBySurface.map(
      (r) =>
        `${String(r.surface).padEnd(16)} ${String(r.impressions).padStart(6)} seen → ${String(r.new_subs).padStart(3)} new  (${pct(r.new_subs, r.impressions)})`,
    )
  : ["(no form impressions yet)"];

const depthBlock = wordDepth.length
  ? wordDepth.map((r) => `  word #${r.n}: ${r.c}`)
  : ["  (no word generations recorded yet)"];

const text = [
  `ColorArchive conversion digest — ${now.toISOString().slice(0, 16)}Z · last ${WINDOW_DAYS}d`,
  ``,
  lines.length ? lines.join("\n") : "No money-funnel activity in the window.",
  ``,
  `Word-to-color → Pro funnel (${WINDOW_DAYS}d):`,
  ...funnelBlock.map((l) => `  ${l}`),
  ``,
  `Email capture — impression → new subscriber (${WINDOW_DAYS}d):`,
  ...captureBlock.map((l) => `  ${l}`),
  `  post-capture CTA clicks: ${captureCtaClicks}`,
  ``,
  `Content → tool (${WINDOW_DAYS}d):`,
  `  guide_tool_click: ${contentToTool}${contentToToolW1 ? `  (+${contentToToolW1} from the W1 card, arm-driven — see dev-plan §9)` : ""}`,
  `  pro_cta_click   : ${proCtaClicks.length ? proCtaClicks.map((r) => `${r.surface}=${r.c}`).join(", ") : "0"}`,
  `  upgrade_clicked : ${upgradeClicks.length ? upgradeClicks.map((r) => `${r.source}=${r.c}`).join(", ") : "0"}`,
  ``,
  `Free lookups used before the paywall (${WINDOW_DAYS}d):`,
  ...depthBlock,
  ``,
  `Active web Pro subs: ${subsByStatus.length ? subsByStatus.map((r) => `${r.st}=${r.c}`).join(", ") : "none"}`,
  renewalsDue.length ? `Renewals due within 7d: ${renewalsDue.map((r) => `${r.email} (${r.due})`).join(", ")}` : `Renewals due within 7d: none`,
  ``,
  `Full funnel: admin /analytics/gate · the Monday report now carries the AI gate (the Auditor exit-gate it used to carry was retired with the product on 2026-07-24).`,
].join("\n");

const subjectBits = [];
// The subject line is the part that gets believed without opening the email, so
// it carries ① and ② together. "1 payment" alone was true of the processor and
// false of the business, and that is exactly how it misled on 2026-08-21.
if (paidOrders.length) {
  const n = paidOrders.length;
  const ext = newExternalEmails.length;
  subjectBits.push(
    `💰 ${n} payment${n > 1 ? "s" : ""} · ${ext ? `🧍 ${ext} new customer${ext > 1 ? "s" : ""}` : "0 new customers"}`,
  );
}
if (newSubs.length) subjectBits.push(`🆕 ${newSubs.length} sub${newSubs.length > 1 ? "s" : ""}`);
if (refunds.length) subjectBits.push(`↩︎ ${refunds.length} refund${refunds.length > 1 ? "s" : ""}`);
if (hardWebhookMiss) subjectBits.push(`⚠️ checkout not recorded`);
// Unshifted, not pushed: if a paying customer is locked out, that is the first
// thing the subject line says, ahead of any good news in the same window.
if (staleRenewals.length) subjectBits.unshift(`🔴 ${staleRenewals.length} locked out`);
const subject = subjectBits.length
  ? `[ColorArchive] ${subjectBits.join(" · ")}`
  : `[ColorArchive] conversion digest — quiet (weekly heartbeat)`;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const html = `
  <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;color:#111">
    <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;margin:0 0 10px">Conversion digest · ${now.toISOString().slice(0, 16)}Z · last ${WINDOW_DAYS}d</p>
    ${
      lines.length
        ? `<pre style="white-space:pre-wrap;font-family:ui-monospace,Menlo,monospace;font-size:13px;line-height:1.7;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:14px;margin:0 0 18px">${esc(lines.join("\n"))}</pre>`
        : `<p style="color:#6b7280;margin:0 0 18px">No money-funnel activity in the window.</p>`
    }
    ${
      // The plaintext part carries this too, but the owner reads the HTML one —
      // the gate-report learned that lesson already (a warning nobody sees is
      // the same as no warning).
      staleRenewals.length
        ? `<div style="margin:0 0 18px;padding:12px 14px;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;color:#7f1d1d;font-size:13px;line-height:1.65">
      <strong>🔴 Locked out right now</strong><br>${staleRenewals
        .map((r) => `${esc(r.email)} — provider says <strong>${esc(r.status)}</strong>, access expired ${esc(r.expired_at)}Z (${r.hours_overdue}h ago)`)
        .join("<br>")}<br>
      Denied Pro on web and API; auth.js writes tier='free' on their next page load.
    </div>`
        : ""
    }
    <p style="margin:0 0 6px;font-weight:700;font-size:13px">Word-to-color → Pro funnel (${WINDOW_DAYS}d)</p>
    <pre style="white-space:pre-wrap;font-family:ui-monospace,Menlo,monospace;font-size:12px;line-height:1.7;color:#374151;margin:0 0 18px">${esc(funnelBlock.join("\n"))}</pre>
    <p style="margin:0 0 6px;font-weight:700;font-size:13px">Email capture — impression → new subscriber (${WINDOW_DAYS}d)</p>
    <pre style="white-space:pre-wrap;font-family:ui-monospace,Menlo,monospace;font-size:12px;line-height:1.7;color:#374151;margin:0 0 18px">${esc(captureBlock.join("\n"))}
post-capture CTA clicks: ${captureCtaClicks}</pre>
    <p style="margin:0 0 6px;font-weight:700;font-size:13px">Content → tool (${WINDOW_DAYS}d)</p>
    <pre style="white-space:pre-wrap;font-family:ui-monospace,Menlo,monospace;font-size:12px;line-height:1.7;color:#374151;margin:0 0 18px">guide_tool_click: ${contentToTool}${contentToToolW1 ? `  (+${contentToToolW1} from the W1 card, arm-driven)` : ""}
pro_cta_click   : ${esc(proCtaClicks.length ? proCtaClicks.map((r) => `${r.surface}=${r.c}`).join(", ") : "0")}
upgrade_clicked : ${esc(upgradeClicks.length ? upgradeClicks.map((r) => `${r.source}=${r.c}`).join(", ") : "0")}</pre>
    <p style="margin:0 0 6px;font-weight:700;font-size:13px">Free lookups used before the paywall (${WINDOW_DAYS}d)</p>
    <pre style="white-space:pre-wrap;font-family:ui-monospace,Menlo,monospace;font-size:12px;line-height:1.7;color:#374151;margin:0 0 18px">${esc(depthBlock.join("\n"))}</pre>
    <p style="color:#374151;font-size:13px;line-height:1.7;margin:0">
      Active web Pro subs: <strong>${subsByStatus.length ? subsByStatus.map((r) => `${esc(r.st)}=${r.c}`).join(", ") : "none"}</strong><br>
      Renewals due within 7d: ${renewalsDue.length ? renewalsDue.map((r) => `${esc(r.email)} (${r.due})`).join(", ") : "none"}
    </p>
    <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
    <p style="color:#9ca3af;font-size:12px;line-height:1.6">Sends only on money-funnel activity (+ a Monday heartbeat). Full funnel: admin /analytics/gate.</p>
  </div>`;

/* ---------------- output / send ---------------- */

(async () => {
  console.log(text);
  if (argDryRun) {
    console.log(`\n[digest] --dry-run: nothing emailed. subject would be: "${subject}"`);
    return;
  }
  if (!shouldSend) {
    console.log("\n[digest] quiet day, no activity — not emailing.");
    return;
  }
  if (!resend) {
    console.error("\n[digest] No RESEND_API_KEY — printed only.");
    return;
  }
  const r = await resend.emails.send({ from: `ColorArchive <${FROM}>`, reply_to: FROM, to: TO, subject, text, html });
  if (r.error) {
    console.error("[digest] Resend error:", JSON.stringify(r.error));
    process.exit(1);
  }
  console.log(`\n[digest] emailed ${TO} (id=${r.data && r.data.id}) subject="${subject}"`);
})();
