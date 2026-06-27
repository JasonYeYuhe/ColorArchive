#!/usr/bin/env node
/**
 * Weekly exit-gate report → emailed to the owner.
 * Reuses the exact GET /analytics/gate SQL + the §0 decision matrix
 * (dev-plan-2026-06-22-auditor §0 / dev-plan-2026-06-19 §5).
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

const OWNER_EMAIL = process.env.GATE_REPORT_TO || "yyyyy.yeyuhe@gmail.com";
const FROM = process.env.FROM_EMAIL || "hello@colorarchive.org";
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const db = new Database(path.join(SERVER_DIR, "data.db"), { readonly: true });

const GENERIC = new Set(["hackernews", "organic-search", "direct", "unknown", "reddit"]);
const isGeneric = (ch) => GENERIC.has(ch) || ch.startsWith("referral:");

function gate(days) {
  const since = `-${days} days`;
  const byCh = (sql) => db.prepare(sql).all(since).map((r) => ({ channel: r.channel || "unknown", count: r.count }));
  const preorderUv = byCh(
    `SELECT COALESCE(NULLIF(channel,''),'unknown') channel, COUNT(*) count FROM pageviews
     WHERE datetime(created_at) >= datetime('now', ?) AND path LIKE '/preorder%' GROUP BY channel ORDER BY count DESC`);
  const paywall = byCh(
    `SELECT COALESCE(NULLIF(channel,''),'unknown') channel, COUNT(*) count FROM events
     WHERE datetime(created_at) >= datetime('now', ?) AND event_name IN ('word_paywall_hit','word_paywall_restored')
     GROUP BY channel ORDER BY count DESC`);
  // Real orders — exclude owner/QA test-mode rows so a test charge can't falsely
  // satisfy the PROCEED threshold (matches analytics.js gate numerator).
  const ordersTotal = db.prepare(`SELECT COUNT(*) c FROM orders WHERE datetime(created_at) >= datetime('now', ?) AND COALESCE(is_test,0)=0`).get(since).c;
  // The gate's PROCEED criterion is Auditor PRE-orders specifically — an unrelated
  // pack/Pro sale must not satisfy "≥10 real pre-orders". ordersTotal is context.
  const preorderOrders = db.prepare(`SELECT COUNT(*) c FROM orders WHERE datetime(created_at) >= datetime('now', ?) AND COALESCE(is_test,0)=0 AND pack_id='preorder-auditor'`).get(since).c;
  const ordersByProduct = db.prepare(
    `SELECT product, COUNT(*) c FROM orders WHERE datetime(created_at) >= datetime('now', ?) AND COALESCE(is_test,0)=0 GROUP BY product ORDER BY c DESC`).all(since);
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
  return { days, uvTotal, qualUv, pwTotal, ordersTotal, preorderOrders, ordersByProduct, emailReserves, ctaClicks, preorderViews };
}

function verdict(g) {
  const floorMet = g.qualUv >= 500 || g.pwTotal >= 1000;
  if (floorMet && g.preorderOrders >= 10) return { tag: "PROCEED", msg: "Demand validated → build the Auditor (M1)." };
  if (floorMet) return { tag: "STOP", msg: "Floor met but <10 real Auditor pre-orders → no demand; off-ramp." };
  return { tag: "STOP", msg: "Floor not met (qualified UV <500 AND paywall <1000) → acquisition not there yet." };
}

const g = gate(30);
const v = verdict(g);
const ts = new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";

const text = [
  `ColorArchive exit-gate weekly report — ${ts}`,
  ``,
  `VERDICT: ${v.tag} — ${v.msg}`,
  ``,
  `Window: last ${g.days} days`,
  `  Qualified /preorder UV : ${g.qualUv}   (target 500)   [raw UV ${g.uvTotal}]`,
  `  Paywall triggers        : ${g.pwTotal}   (target 1000)`,
  `  Auditor pre-orders      : ${g.preorderOrders}   (target 10 — gate criterion)`,
  `  All orders (any product): ${g.ordersTotal}   (context)`,
  `  Email reservations      : ${g.emailReserves}   (secondary signal, not the gate count)`,
  `  /preorder views         : ${g.preorderViews}`,
  ``,
  `On-site CTA clicks by surface (preorder_cta_click):`,
  ...(g.ctaClicks.length ? g.ctaClicks.map((r) => `  ${r.src}: ${r.c}`) : [`  (none yet)`]),
  ``,
  `Orders by product:`,
  ...(g.ordersByProduct.length ? g.ordersByProduct.map((r) => `  ${r.product}: ${r.c}`) : [`  (none)`]),
  ``,
  `Decision rule (dev-plan-2026-06-19 §5): real pre-orders >=10 -> build the Auditor (M1);`,
  `still ~0 after traffic is connected -> evidence-based off-ramp. Tripwire ~07-02 (qualified`,
  `UV <250 -> change channel/add volume/paid micro-sponsor); hard gate ~07-15.`,
  `Full funnel: admin GET /analytics/gate.`,
].join("\n");

const row = (label, val, target) =>
  `<tr><td style="padding:6px 0;color:#6b7280">${label}</td><td style="padding:6px 0;text-align:right;font-weight:700">${val}</td><td style="padding:6px 0;text-align:right;color:#9ca3af">${target || ""}</td></tr>`;
const tag = v.tag === "PROCEED" ? "#059669" : "#b45309";
const html = `
  <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;color:#111">
    <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;margin:0 0 6px">Exit-gate weekly · ${ts}</p>
    <div style="display:inline-block;background:${tag};color:#fff;font-weight:800;letter-spacing:1px;padding:6px 14px;border-radius:999px;font-size:13px">${v.tag}</div>
    <p style="color:#374151;line-height:1.6;margin:12px 0 18px">${v.msg}</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:8px">
      ${row("Qualified /preorder UV", g.qualUv, "/ 500")}
      ${row("Paywall triggers", g.pwTotal, "/ 1000")}
      ${row("Auditor pre-orders", g.preorderOrders, "/ 10")}
      ${row("All orders (any product)", g.ordersTotal, "")}
      ${row("Email reservations (secondary)", g.emailReserves, "")}
      ${row("/preorder views", g.preorderViews, "")}
    </table>
    <p style="margin:18px 0 6px;font-weight:700;font-size:13px;color:#111">On-site CTA clicks by surface</p>
    <div style="color:#374151;font-size:13px;line-height:1.7">${g.ctaClicks.length ? g.ctaClicks.map((r) => `${r.src}: <strong>${r.c}</strong>`).join("<br>") : "(none yet)"}</div>
    <p style="margin:18px 0 6px;font-weight:700;font-size:13px;color:#111">Orders by product</p>
    <div style="color:#374151;font-size:13px;line-height:1.7">${g.ordersByProduct.length ? g.ordersByProduct.map((r) => `${r.product}: <strong>${r.c}</strong>`).join("<br>") : "(none)"}</div>
    <hr style="border:none;border-top:1px solid #eee;margin:22px 0">
    <p style="color:#9ca3af;font-size:12px;line-height:1.6">
      Rule (dev-plan-2026-06-19 §5): real pre-orders ≥10 → build the Auditor; still ~0 after traffic is
      connected → evidence-based off-ramp. Tripwire ~07-02, hard gate ~07-15. Full funnel: admin /analytics/gate.
    </p>
  </div>`;

try {
  fs.appendFileSync(path.join(SERVER_DIR, "logs/gate-report.log"), `\n[${ts}] ${v.tag} | qualUV=${g.qualUv} paywall=${g.pwTotal} preorders=${g.preorderOrders} allOrders=${g.ordersTotal} reserves=${g.emailReserves} views=${g.preorderViews} cta=${JSON.stringify(g.ctaClicks)}\n`);
} catch (e) { console.error("log write failed:", e.message); }

(async () => {
  console.log(text);
  if (!resend) { console.error("No RESEND_API_KEY — printed only, no email sent."); return; }
  const r = await resend.emails.send({
    from: `ColorArchive <${FROM}>`,
    reply_to: FROM,
    to: OWNER_EMAIL,
    subject: `[ColorArchive] Exit-gate weekly: ${v.tag} — UV ${g.qualUv}/500, pre-orders ${g.preorderOrders}/10`,
    text,
    html,
  });
  if (r.error) { console.error("Resend error:", JSON.stringify(r.error)); process.exit(1); }
  console.log(`\nEmailed report to ${OWNER_EMAIL} (id=${r.data && r.data.id}).`);
})();
