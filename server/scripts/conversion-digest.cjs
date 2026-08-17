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
 * Run: node scripts/conversion-digest.cjs [--force] [--days=1]
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
const { DISTINCT_VISITS, windowCaveats } = require(path.join(SERVER_DIR, "session-denominator"));

const DB_PATH = process.env.DB_PATH || path.join(SERVER_DIR, "data.db");
const FROM = process.env.FROM_EMAIL || "hello@colorarchive.org";
const TO = process.env.GATE_REPORT_TO || "yyyyy.yeyuhe@gmail.com";
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const argForce = process.argv.includes("--force");
const daysArg = (process.argv.find((a) => a.startsWith("--days=")) || "").split("=")[1];
const WINDOW_DAYS = Number(daysArg) > 0 ? Number(daysArg) : 1;
const since = `-${WINDOW_DAYS} day`;
const REAL = "COALESCE(is_test,0)=0";

const db = new Database(DB_PATH, { readonly: true });
const now = new Date();

/* ---------------- money events (drive the send decision) ---------------- */

const paidOrders = db.prepare(
  `SELECT order_id, email, product, amount, amount_minor, currency, pack_id, substr(created_at,1,16) AS ts
     FROM orders
    WHERE datetime(created_at) >= datetime('now', ?) AND ${REAL} AND COALESCE(refunded,0)=0 AND amount > 0
    ORDER BY created_at DESC`
).all(since);

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
const engagedVisits = db.prepare(
  `SELECT ${DISTINCT_VISITS} c FROM events WHERE datetime(created_at) >= datetime('now', ?)`,
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
};
// Raw rows alongside, so a step whose count is one busy visitor is visible as one.
const funnelRows = {
  paywallHit: ev("word_paywall_hit"),
  paywallRestored: ev("word_paywall_restored"),
  proBypass: ev("word_paywall_pro_bypass"),
  proClick: ev("word_paywall_pro_click"),
  checkoutClicked: ev("checkout_clicked"),
  copied: ev("color_copied"),
};

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
const contentToTool = ev("guide_tool_click");
const proCtaClicks = db.prepare(
  `SELECT COALESCE(json_extract(props_json,'$.surface'),'?') AS surface, COUNT(*) c
     FROM events WHERE event_name='pro_cta_click' AND datetime(created_at) >= datetime('now', ?)
    GROUP BY surface ORDER BY c DESC`,
).all(since);
const captureCtaClicks = ev("email_capture_cta_click");

// How far people get before the paywall — the drop-off across ordinals says
// whether 5 free lookups is generous or just more than anyone wants.
const wordDepth = db.prepare(
  `SELECT CAST(json_extract(props_json,'$.count') AS INTEGER) AS n, COUNT(*) c
     FROM events WHERE event_name='word_generated' AND datetime(created_at) >= datetime('now', ?)
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
const hasMoneyActivity =
  paidOrders.length > 0 || newSubs.length > 0 || funnel.checkoutSuccess > 0 || refunds.length > 0;
const shouldSend = argForce || hasMoneyActivity || isMonday;

/* ---------------- render ---------------- */

const money = (o) => {
  const cur = (o.currency || "jpy").toUpperCase();
  if (cur === "JPY") return `¥${o.amount} JPY`; // zero-decimal, stored as-is
  if (o.amount_minor) return `${(o.amount_minor / 100).toFixed(2)} ${cur}`; // exact
  return `${o.amount} ${cur}`; // decimal currency, pre-amount_minor row — no ¥
};

const lines = [];
if (paidOrders.length) {
  lines.push("💰 PAYMENTS RECEIVED:");
  for (const o of paidOrders) lines.push(`  ${o.ts}  ${o.email}  ${o.product}  ${money(o)}`);
}
if (newSubs.length) {
  lines.push("🆕 NEW SUBSCRIBERS / TRIALS:");
  for (const s of newSubs) lines.push(`  ${s.ts}  ${s.email}  Pro ${s.plan || "?"}  [${s.status}]`);
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
  `  guide_tool_click: ${contentToTool}`,
  `  pro_cta_click   : ${proCtaClicks.length ? proCtaClicks.map((r) => `${r.surface}=${r.c}`).join(", ") : "0"}`,
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
if (paidOrders.length) subjectBits.push(`💰 ${paidOrders.length} payment${paidOrders.length > 1 ? "s" : ""}`);
if (newSubs.length) subjectBits.push(`🆕 ${newSubs.length} sub${newSubs.length > 1 ? "s" : ""}`);
if (refunds.length) subjectBits.push(`↩︎ ${refunds.length} refund${refunds.length > 1 ? "s" : ""}`);
if (hardWebhookMiss) subjectBits.push(`⚠️ checkout not recorded`);
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
    <p style="margin:0 0 6px;font-weight:700;font-size:13px">Word-to-color → Pro funnel (${WINDOW_DAYS}d)</p>
    <pre style="white-space:pre-wrap;font-family:ui-monospace,Menlo,monospace;font-size:12px;line-height:1.7;color:#374151;margin:0 0 18px">${esc(funnelBlock.join("\n"))}</pre>
    <p style="margin:0 0 6px;font-weight:700;font-size:13px">Email capture — impression → new subscriber (${WINDOW_DAYS}d)</p>
    <pre style="white-space:pre-wrap;font-family:ui-monospace,Menlo,monospace;font-size:12px;line-height:1.7;color:#374151;margin:0 0 18px">${esc(captureBlock.join("\n"))}
post-capture CTA clicks: ${captureCtaClicks}</pre>
    <p style="margin:0 0 6px;font-weight:700;font-size:13px">Content → tool (${WINDOW_DAYS}d)</p>
    <pre style="white-space:pre-wrap;font-family:ui-monospace,Menlo,monospace;font-size:12px;line-height:1.7;color:#374151;margin:0 0 18px">guide_tool_click: ${contentToTool}
pro_cta_click   : ${esc(proCtaClicks.length ? proCtaClicks.map((r) => `${r.surface}=${r.c}`).join(", ") : "0")}</pre>
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
