#!/usr/bin/env node
/**
 * Weekly decision report → emailed to the owner. Cron: 0 9 * * 1
 *
 * 2026-07-26: REPURPOSED. Until today this emailed a weekly PROCEED/STOP verdict
 * on the Accessibility Auditor — a product cancelled 2026-07-20 and hard-closed
 * 2026-07-24. It was going to send that verdict again next Monday. A weekly email
 * confidently deciding the fate of something that no longer exists is worse than
 * no email, so the live decision now rides in this slot instead: the AI kill-gate
 * from docs/dev-plan-2026-07-26-ai.md §8.
 *
 * The verdict logic is NOT duplicated here — it is required from
 * scripts/ai-gate-report.cjs so there is exactly one Wilson interval and one
 * minimum-sample rule in the codebase. Net new cron lines: zero. Net new
 * artifacts: zero.
 *
 * The acquisition funnel numbers below are KEPT, but demoted to context. They no
 * longer gate anything; they are here because they are the only place the owner
 * regularly sees them.
 * Droplet-local operational script (like backup-sqlite.sh). Invoked by cron:
 *   0 9 * * 1  /usr/bin/node /root/ColorArchive/server/scripts/gate-report.cjs
 *
 * Kept in version control (server/scripts/) so the gate SQL stays reviewable
 * and in lock-step with server/routes/analytics.js — the is_test filters and
 * the preorder email-reserve secondary numerator MUST match that endpoint.
 */
const path = require("path");
const fs = require("fs");
const SERVER_DIR = "/root/ColorArchive/server";
require(path.join(SERVER_DIR, "node_modules/dotenv")).config({ path: path.join(SERVER_DIR, ".env") });
const Database = require(path.join(SERVER_DIR, "node_modules/better-sqlite3"));
const { Resend } = require(path.join(SERVER_DIR, "node_modules/resend"));
const { computeAiGate } = require(path.join(__dirname, "ai-gate-report.cjs"));
const { DISTINCT_VISITS, windowCaveats } = require(path.join(SERVER_DIR, "session-denominator"));

const OWNER_EMAIL = process.env.GATE_REPORT_TO || "yyyyy.yeyuhe@gmail.com";
const FROM = process.env.FROM_EMAIL || "hello@colorarchive.org";
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const db = new Database(path.join(SERVER_DIR, "data.db"), { readonly: true });

// Same list, same reason, same source as conversion-digest.cjs: the owner's own
// addresses. Both reports read it from .env rather than sharing a module — see
// the long note in conversion-digest.cjs for why the previous mechanism
// (a one-shot is_test=1 migration) silently stopped working on 2026-08-20.
const OWNER_EMAILS = String(process.env.OWNER_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const GENERIC = new Set(["hackernews", "organic-search", "direct", "unknown", "reddit"]);
const isGeneric = (ch) => GENERIC.has(ch) || ch.startsWith("referral:");

function gate(days) {
  const since = `-${days} days`;
  const byCh = (sql) => db.prepare(sql).all(since).map((r) => ({ channel: r.channel || "unknown", count: r.count }));
  // Both denominators are now VISITS from `events`, not rows from `pageviews`.
  // The old preorder figure came from a table with no caller identifier, in which
  // 2026-07-27 measured 97% of colour-page traffic and ~70% of guide traffic as
  // automated — so it counted crawlers as qualified prospects. The paywall figure
  // counted event rows, which double-counts one visitor who reloads: measured on
  // 2026-08-17, word_paywall_restored is 190 rows but 68 visits.
  const preorderUv = byCh(
    `SELECT COALESCE(NULLIF(channel,''),'unknown') channel, ${DISTINCT_VISITS} count FROM events
     WHERE datetime(created_at) >= datetime('now', ?) AND path LIKE '/preorder%' GROUP BY channel ORDER BY count DESC`);
  const paywall = byCh(
    `SELECT COALESCE(NULLIF(channel,''),'unknown') channel, ${DISTINCT_VISITS} count FROM events
     WHERE datetime(created_at) >= datetime('now', ?) AND event_name IN ('word_paywall_hit','word_paywall_restored')
     GROUP BY channel ORDER BY count DESC`);
  const engagedVisits = db.prepare(
    `SELECT ${DISTINCT_VISITS} c FROM events WHERE datetime(created_at) >= datetime('now', ?)`).get(since).c;
  // THE §5 ANCHOR. Deliberately NOT total engaged visits: that unit changed
  // definition on 2026-08-10 when e401e0f removed the only event a read-only
  // guide page emitted, which cost ~550 sessions a month with no change in
  // readership. Thresholds denominated in it would have fired on an
  // instrumentation change — the same way the second draft's 5,000 would have
  // judged the site into retreat using a number picked out of the air.
  // `word_generated` is untouched by that change, untouched by the `page_read`
  // signal added afterwards, and is the one behaviour on this site with real
  // depth (398 sessions / 1,008 events in the 21 clean days to 2026-08-17).
  // It measures the product being used, not a page being instrumented.
  //
  // PINNED TO THE ORIGINAL DEFINITION ON 2026-08-27, and this is the whole point
  // of the `counted` filter. On that date the emit site moved ABOVE the
  // entitlement return that had been suppressing it, so from then on the raw
  // event also covers Pro visits, already-gated returning visits, email-unlocked
  // browsers and sessions whose entitlement had not resolved yet. Left unfiltered
  // this number would step up ~20% overnight for a purely instrumentation reason
  // — the identical failure to 2026-08-10, which is the reason this anchor was
  // chosen over engaged visits in the first place. Rows written before the change
  // carry no `counted` key and were all quota-spending by construction, which is
  // what the COALESCE encodes.
  const wordSessions = db.prepare(
    `SELECT ${DISTINCT_VISITS} c FROM events
      WHERE datetime(created_at) >= datetime('now', ?) AND event_name='word_generated'
        AND COALESCE(json_extract(props_json,'$.counted'), 1) = 1`).get(since).c;
  // The same behaviour with the blind spots restored. Reported BESIDE the anchor,
  // never as the anchor, until it has two clean months of its own: the threshold
  // (≥300/mo) was calibrated against the narrow series and means nothing against
  // a wider one. Measured 2026-08-27 the gap was 554 vs 699 visits over 30 days.
  const wordSessionsAll = db.prepare(
    `SELECT ${DISTINCT_VISITS} c FROM events
      WHERE datetime(created_at) >= datetime('now', ?) AND event_name='word_generated'`).get(since).c;
  // Reading reach, from the signal added 2026-08-17 to replace what 08-10 removed.
  // Reported separately and never added to the series above — see page-tracker.tsx.
  const readSessions = db.prepare(
    `SELECT ${DISTINCT_VISITS} c FROM events
      WHERE datetime(created_at) >= datetime('now', ?) AND event_name='page_read'`).get(since).c;
  // Real orders — exclude owner/QA test-mode rows so a test charge can't falsely
  // satisfy the PROCEED threshold (matches analytics.js gate numerator).
  // "Orders" = kept money only: amount > 0, non-test, not refunded. A ¥0 trial
  // signup is NOT an order (the 07-20 Pro trial printed here as "1 order" and
  // masked the truth); trials are reported separately below.
  const ordersTotal = db.prepare(`SELECT COUNT(*) c FROM orders WHERE datetime(created_at) >= datetime('now', ?) AND COALESCE(is_test,0)=0 AND COALESCE(refunded,0)=0 AND amount > 0`).get(since).c;
  // ② FIRST-TIME EXTERNAL CUSTOMERS — distinct addresses, owner excluded, and a
  // renewal or repeat purchase does not qualify. ordersTotal above stays as ①
  // (what the processor actually took) and is never adjusted downwards: the
  // 2026-08-20 ¥549.69 owner charge was real money, it just was not a customer.
  const newCustomerRows = db
    .prepare(
      `SELECT DISTINCT LOWER(o.email) email FROM orders o
        WHERE datetime(o.created_at) >= datetime('now', ?)
          AND COALESCE(o.is_test,0)=0 AND COALESCE(o.refunded,0)=0 AND o.amount > 0
          AND NOT EXISTS (
            SELECT 1 FROM orders p
             WHERE LOWER(p.email) = LOWER(o.email) AND COALESCE(p.is_test,0)=0
               AND COALESCE(p.refunded,0)=0 AND p.amount > 0
               AND datetime(p.created_at) < datetime(o.created_at))`,
    )
    .all(since)
    .map((r) => r.email);
  const newCustomers = newCustomerRows.filter((e) => !OWNER_EMAILS.includes(e));
  const ownerExcluded = newCustomerRows.filter((e) => OWNER_EMAILS.includes(e));
  // Revenue is summed PER CURRENCY and prefers amount_minor, because `amount` is a
  // truncated integer and this report was printing our only real revenue as "¥3".
  // The actual charge is $3.47 USD: the row is amount=3, amount_minor=347,
  // currency=usd. Two bugs stacked — a 100x truncation and a hardcoded ¥ on a USD
  // sale — on the one number in this email that is money. `amount_minor` was added
  // for exactly this (2026-07-22, commit b506809) and conversion-digest.cjs already
  // uses it; this script never got the same treatment.
  const revenueRows = db.prepare(
    `SELECT UPPER(COALESCE(currency,'?')) cur,
            SUM(COALESCE(amount_minor, amount * 100)) minor
       FROM orders
      WHERE datetime(created_at) >= datetime('now', ?)
        AND COALESCE(is_test,0)=0 AND COALESCE(refunded,0)=0 AND amount > 0
      GROUP BY cur`
  ).all(since);
  // JPY has no minor unit, so LS still sends it x100 and it must be divided like
  // any other currency here — the multiply above keeps pre-amount_minor rows sane.
  const revenueTotal = revenueRows.length
    ? revenueRows.map((r) => `${(r.minor / 100).toFixed(2)} ${r.cur}`).join(" + ")
    : "0";
  // The gate's PROCEED criterion is Auditor PRE-orders specifically — an unrelated
  // pack/Pro sale must not satisfy "≥10 real pre-orders". ordersTotal is context.
  const preorderOrders = db.prepare(`SELECT COUNT(*) c FROM orders WHERE datetime(created_at) >= datetime('now', ?) AND COALESCE(is_test,0)=0 AND pack_id='preorder-auditor'`).get(since).c;
  const ordersByProduct = db.prepare(
    `SELECT product, COUNT(*) c FROM orders WHERE datetime(created_at) >= datetime('now', ?) AND COALESCE(is_test,0)=0 AND COALESCE(refunded,0)=0 AND amount > 0 GROUP BY product ORDER BY c DESC`).all(since);
  // Subscription funnel truth: active web subs/trials by account state, not order rows.
  const proSubs = db.prepare(
    `SELECT COALESCE(subscription_status,'unknown') st, COUNT(*) c FROM users
     WHERE tier='pro' AND payment_provider='lemonsqueezy' AND COALESCE(is_test,0)=0
     GROUP BY st ORDER BY c DESC`).all();
  // Secondary signal: distinct people who left a paid-intent email reservation
  // (subscribers.source='preorder'). Counted to-date, NOT windowed — an upsert that
  // flips an older subscriber to source='preorder' keeps its created_at. Test excluded.
  const emailReserves = db.prepare(
    `SELECT COUNT(*) c FROM subscribers WHERE source='preorder' AND COALESCE(is_test,0)=0`).get().c;
  const ctaClicks = db.prepare(
    `SELECT COALESCE(json_extract(props_json,'$.from'),'(none)') src, COUNT(*) c FROM events
     WHERE datetime(created_at) >= datetime('now', ?) AND event_name='preorder_cta_click' GROUP BY src ORDER BY c DESC`).all(since);
  const preorderViews = db.prepare(
    `SELECT COUNT(*) c FROM events WHERE datetime(created_at) >= datetime('now', ?) AND event_name='preorder_view'`).get(since).c;
  const qualUv = preorderUv.filter((r) => !isGeneric(r.channel)).reduce((n, r) => n + r.count, 0);
  const uvTotal = preorderUv.reduce((n, r) => n + r.count, 0);
  const pwTotal = paywall.reduce((n, r) => n + r.count, 0);
  return { days, uvTotal, qualUv, pwTotal, ordersTotal, revenueTotal, newCustomers, ownerExcluded, preorderOrders, ordersByProduct, proSubs, emailReserves, ctaClicks, preorderViews, engagedVisits, wordSessions, wordSessionsAll, readSessions, caveats: windowCaveats(days) };
}

const g = gate(30);
// The decision this report exists to carry. The old Auditor verdict was removed
// rather than kept alongside: two verdicts in one email means neither gets read.
// No argument = cumulative from GATE_START. Passing 30 here would reinstate the
// rolling window that made the gate permanently undecidable at this traffic level.
const ai = computeAiGate();
const v = { tag: ai.tag, msg: ai.msg };
const ts = new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";

const d = ai.decider;
const aiPct = (x) => `${(x * 100).toFixed(2)}%`;

const text = [
  `ColorArchive weekly decision report — ${ts}`,
  ``,
  `AI GATE VERDICT: ${v.tag}`,
  `  ${v.msg}`,
  ``,
  `AI gate detail (window: ${ai.days ? `last ${ai.days} days` : `cumulative since ${String(ai.since).slice(0, 10)}`}) — docs/dev-plan-2026-07-26-ai.md §8`,
  `  Deciding surface: colour-detail /ai/name-color (the only AI surface with`,
  `  enough traffic for a ratio to mean anything — 6,133 views/30d vs 29 across`,
  `  all three AI tool pages combined).`,
  `    saw the AI module   : ${d.impressions.visits} visits   (need ${ai.minImpressions} to decide)`,
  `    asked for a result  : ${d.requests.visits} visits`,
  `    got one back        : ${d.succeeded.visits} visits`,
  `    copied it           : ${d.kept ? d.kept.visits : "n/a"} visits`,
  `    exposure→request    : ${aiPct(d.ci.point)}   95% CI ${aiPct(d.ci.low)}–${aiPct(d.ci.high)}`,
  `  Decision rule (one-sided binomial, not a bare percentage):`,
  `    DELETE if requests ≤ the delete band for the observed n — the largest count`,
  `      that would happen <10% of the time if the true rate really were 3%.`,
  `      n=150→≤1, n=200→≤2, n=250→≤3, n=300→≤4, n=400→≤7. Check it by hand.`,
  `    KEEP AND INVEST needs all three: Wilson-95 lower bound >3%, ≥5 requesting`,
  `      visits, and ≥3 visits that copied a result. A percentage alone can be`,
  `      carried by two enthusiastic sessions.`,
  `    Otherwise keep but do not invest, or — below n=${ai.minImpressions} — genuinely undecided.`,
  `  This structure exists because the first two drafts of the gate COULD NOT FAIL:`,
  `  they made the sample size a precondition for judging whether usage exists, so`,
  `  zero demand meant the verdict never arrived. Low usage now deletes.`,
  ...(ai.contaminatedWindow
    ? [
        ``,
        `  ⚠ This window reaches before 2026-07-26, when bot filtering and session_id`,
        `    went live. Earlier rows are ~28.6% self-identified crawlers with no`,
        `    session id, so visit counts are under-stated and event counts over-stated.`,
      ]
    : []),
  ``,
  `--- context below: acquisition funnel. NO LONGER A GATE. ---`,
  `The Auditor pre-order gate this report used to carry was retired when the`,
  `product was cancelled (2026-07-20 / hard-closed 07-24). These numbers are kept`,
  `only because this email is where they get seen.`,
  ``,
  `Window: last ${g.days} days`,
  `  ENGAGED VISITS          : ${g.engagedVisits}   (the real size of this site — distinct visits that did anything)`,
  `  word_generated visits   : ${g.wordSessions}  ≈ ${Math.round((g.wordSessions / g.days) * 30)}/month   ← §5 ANCHOR (utility ≥300/mo · shrink <150/mo two months running)`,
  `    └ same, blind spots included: ${g.wordSessionsAll}  ≈ ${Math.round((g.wordSessionsAll / g.days) * 30)}/month   (Pro + already-gated + unlocked + unresolved, visible since 2026-08-27)`,
  `      NOT the anchor. The ≥300 threshold was calibrated against the narrow`,
  `      series above; judging it against this wider one would move the bar`,
  `      without anyone deciding to. Watch the GAP — it is how much usage the`,
  `      anchor cannot see, and it was 26% of the wider number on 2026-08-27.`,
  `  page_read visits        : ${g.readSessions}   (reading reach; 0 until 2026-08-17, not comparable before that)`,
  ...(g.caveats ?? []).map((c) => `    ⚠ ${c}`),
  `  Qualified /preorder UV : ${g.qualUv}   (was target 500 — gate retired)`,
  `  Paywall triggers        : ${g.pwTotal}   (was target 1000 — gate retired)`,
  `  Auditor pre-orders      : ${g.preorderOrders}   (product cancelled; expect 0)`,
  `  ① Payments taken        : ${g.ordersTotal}  — ${g.revenueTotal} total   (processor truth; excludes zero-value trials/tests/refunds)`,
  `  ② New paying customers  : ${g.newCustomers.length}${g.newCustomers.length ? `  (${g.newCustomers.join(", ")})` : ""}   (first-ever payment, owner excluded, renewals excluded)`,
  ...(g.ownerExcluded.length ? [`      excluded as owner: ${g.ownerExcluded.join(", ")}   (real money, not a customer)`] : []),
  ...(OWNER_EMAILS.length ? [] : ["      ⚠ OWNER_EMAILS unset in server/.env — ② excludes nobody as owner"]),
  `  Web Pro subs by status  : ${g.proSubs.length ? g.proSubs.map((r) => `${r.st}=${r.c}`).join(", ") : "none"}`,
  `  Email reservations      : ${g.emailReserves}   (secondary signal, not the gate count)`,
  `  /preorder views         : ${g.preorderViews}`,
  ``,
  `On-site CTA clicks by surface (preorder_cta_click):`,
  ...(g.ctaClicks.length ? g.ctaClicks.map((r) => `  ${r.src}: ${r.c}`) : [`  (none yet)`]),
  ``,
  `Orders by product:`,
  ...(g.ordersByProduct.length ? g.ordersByProduct.map((r) => `  ${r.product}: ${r.c}`) : [`  (none)`]),
  ``,
  `Full funnel: admin GET /analytics/gate.`,
  `Full AI gate breakdown by surface: node server/scripts/ai-gate-report.cjs`,
].join("\n");

const row = (label, val, target) =>
  `<tr><td style="padding:6px 0;color:#6b7280">${label}</td><td style="padding:6px 0;text-align:right;font-weight:700">${val}</td><td style="padding:6px 0;text-align:right;color:#9ca3af">${target || ""}</td></tr>`;
// Amber for every undecided state, green only for an actual decision. A grey-area
// verdict must not be coloured like a win.
const tag = v.tag === "KEEP AND INVEST" ? "#059669" : v.tag === "DELETE AI" ? "#b91c1c" : "#b45309";
const html = `
  <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;color:#111">
    <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;margin:0 0 6px">AI gate · weekly · ${ts}</p>
    <div style="display:inline-block;background:${tag};color:#fff;font-weight:800;letter-spacing:1px;padding:6px 14px;border-radius:999px;font-size:13px">${v.tag}</div>
    <p style="color:#374151;line-height:1.6;margin:12px 0 18px">${v.msg}</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:8px">
      ${row("Saw the AI module (colour-detail)", d.impressions.visits, `/ ${ai.minImpressions}`)}
      ${row("Asked for a result", d.requests.visits, "")}
      ${row("Got one back", d.succeeded.visits, "")}
      ${row("Copied it", d.kept ? d.kept.visits : "n/a", "")}
      ${row("exposure→request", aiPct(d.ci.point), `CI ${aiPct(d.ci.low)}–${aiPct(d.ci.high)}`)}
    </table>
    <p style="margin:18px 0 6px;font-weight:700;font-size:13px;color:#111">Context — acquisition funnel (no longer a gate)</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:8px">
      ${row("Engaged visits", g.engagedVisits, "distinct tab-lifetimes that did anything")}
      ${row("word_generated visits", `${g.wordSessions} (≈${Math.round((g.wordSessions / g.days) * 30)}/mo)`, "§5 anchor — utility ≥300/mo, shrink <150/mo")}
      ${row("└ blind spots included", `${g.wordSessionsAll} (≈${Math.round((g.wordSessionsAll / g.days) * 30)}/mo)`, "context only, NOT the anchor — Pro + gated + unlocked + unresolved, since 2026-08-27")}
      ${row("page_read visits", g.readSessions, "reading reach, new 2026-08-17")}
      ${row("Qualified /preorder UV", g.qualUv, "gate retired")}
      ${row("Paywall triggers", g.pwTotal, "gate retired")}
      ${row("① Payments taken", g.ordersTotal, "processor truth, owner included")}
      ${row("② New paying customers", g.newCustomers.length, g.ownerExcluded.length ? `${g.ownerExcluded.length} owner row(s) excluded` : "first-ever payment, owner + renewals excluded")}
      ${row("Email reservations", g.emailReserves, "")}
    </table>
    ${
      // The caveats have to ride in BOTH renderings. The first version of this
      // change put them only in the plaintext part, and the owner reads the HTML
      // one — a warning nobody sees is the same as no warning.
      (g.caveats ?? []).length
        ? `<div style="margin:10px 0 0;padding:10px 12px;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;color:#7c2d12;font-size:12px;line-height:1.6">
      <strong>Read these numbers with care:</strong><br>${g.caveats.map((c) => `• ${c}`).join("<br>")}
    </div>`
        : ""
    }
    <p style="margin:18px 0 6px;font-weight:700;font-size:13px;color:#111">On-site CTA clicks by surface</p>
    <div style="color:#374151;font-size:13px;line-height:1.7">${g.ctaClicks.length ? g.ctaClicks.map((r) => `${r.src}: <strong>${r.c}</strong>`).join("<br>") : "(none yet)"}</div>
    <p style="margin:18px 0 6px;font-weight:700;font-size:13px;color:#111">Orders by product</p>
    <div style="color:#374151;font-size:13px;line-height:1.7">${g.ordersByProduct.length ? g.ordersByProduct.map((r) => `${r.product}: <strong>${r.c}</strong>`).join("<br>") : "(none)"}</div>
    <hr style="border:none;border-top:1px solid #eee;margin:22px 0">
    <p style="color:#9ca3af;font-size:12px;line-height:1.6">
      Rule (dev-plan-2026-07-26-ai §8): one-sided binomial test, not a bare percentage.
      DELETE if requests fall in the delete band for the observed n (n=150→≤1, 200→≤2, 250→≤3,
      300→≤4, 400→≤7 — the largest count that would occur &lt;10% of the time at a true 3% rate).
      KEEP AND INVEST needs Wilson-95 lower bound &gt;3% AND ≥5 requesting visits AND ≥3 visits that
      copied a result. This shape exists because the earlier drafts could not fail: they made sample
      size a precondition for judging whether usage exists, so zero demand meant no verdict ever
      arrived. Low usage now deletes. Breakdown by surface:
      <code>node server/scripts/ai-gate-report.cjs</code>
    </p>
  </div>`;

try {
  fs.appendFileSync(path.join(SERVER_DIR, "logs/gate-report.log"), `\n[${ts}] AI:${v.tag} | impressions=${d.impressions.visits}/${ai.minImpressions} requests=${d.requests.visits} generated=${d.succeeded.visits} kept=${d.kept ? d.kept.visits : "n/a"} rate=${aiPct(d.ci.point)} ci=${aiPct(d.ci.low)}-${aiPct(d.ci.high)} | ctx qualUV=${g.qualUv} paywall=${g.pwTotal} allOrders=${g.ordersTotal}\n`);
} catch (e) { console.error("log write failed:", e.message); }

(async () => {
  console.log(text);
  if (!resend) { console.error("No RESEND_API_KEY — printed only, no email sent."); return; }
  const r = await resend.emails.send({
    from: `ColorArchive <${FROM}>`,
    reply_to: FROM,
    to: OWNER_EMAIL,
    subject: `[ColorArchive] AI gate: ${v.tag} — impressions ${d.impressions.visits}/${ai.minImpressions}, requests ${d.requests.visits}`,
    text,
    html,
  });
  if (r.error) { console.error("Resend error:", JSON.stringify(r.error)); process.exit(1); }
  console.log(`\nEmailed report to ${OWNER_EMAIL} (id=${r.data && r.data.id}).`);
})();
