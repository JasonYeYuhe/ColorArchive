#!/usr/bin/env node
/**
 * One-off broadcast: announce the Accessibility Auditor pre-order to subscribers.
 * SAFE BY DEFAULT — dry-run unless --send is passed.
 *   node send-preorder-broadcast.cjs                  # dry-run: counts + preview, sends NOTHING
 *   node send-preorder-broadcast.cjs --send           # send to ALL subscribers
 *   node send-preorder-broadcast.cjs --send --source=free-pack,waitlist,cotd   # segment
 *   node send-preorder-broadcast.cjs --limit=1 --send --to=you@example.com     # test to one address
 * Droplet-local. CAN-SPAM: includes List-Unsubscribe header + visible unsubscribe link.
 */
const path = require("path");
const fs = require("fs");
const SERVER_DIR = "/root/ColorArchive/server";
require(path.join(SERVER_DIR, "node_modules/dotenv")).config({ path: path.join(SERVER_DIR, ".env") });
const Database = require(path.join(SERVER_DIR, "node_modules/better-sqlite3"));
const { Resend } = require(path.join(SERVER_DIR, "node_modules/resend"));

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const val = (k) => { const a = args.find((x) => x.startsWith(`--${k}=`)); return a ? a.split("=").slice(1).join("=") : null; };
const DO_SEND = has("--send");
const sourceFilter = val("source") ? val("source").split(",").map((s) => s.trim()).filter(Boolean) : null;
const overrideTo = val("to");
const limit = val("limit") ? parseInt(val("limit"), 10) : null;

const FROM = process.env.FROM_EMAIL || "hello@colorarchive.org";
const SITE_URL = process.env.FRONTEND_ORIGIN || "https://colorarchive.org";
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const db = new Database(path.join(SERVER_DIR, "data.db"));

// ---- The email content (the draft) ----
const SUBJECT = "Pre-order the Accessibility Auditor — founder price (¥4,999)";
function buildEmail(to) {
  const unsub = `${SITE_URL}/unsubscribe/?email=${encodeURIComponent(to)}`;
  const preorder = `${SITE_URL}/preorder/`;
  const text = [
    "Audit a whole palette for accessibility — in one pass",
    "",
    "If you've ever had to prove a palette is accessible, you know the slog: checking every",
    "text/background pair for WCAG contrast, simulating color-blindness, then hunting for on-brand",
    "replacements for everything that fails — by hand, one pair at a time.",
    "",
    "We're building the ColorArchive Accessibility Auditor to do that whole pass for you:",
    "",
    "  - Whole-palette WCAG scan — every foreground/background pair, AA and AAA, at once.",
    "  - Color-blindness check across the set — flags pairs that collapse for color-blind users.",
    "  - Accessible auto-fixes — the nearest on-brand color from the 5,446-color archive, per failing pair.",
    "  - A shareable report + corrected token export (CSS / Tailwind / Figma).",
    "",
    "It ships Q3 2026. You can pre-order now at the founder price of ¥4,999 (≈ $33) — half the",
    "¥9,999 launch price. If we don't ship by Q3 2026, you get a full refund, no questions asked.",
    "",
    `Pre-order / see the full feature list: ${preorder}`,
    "",
    "Pre-ordering does two things: it locks your founder price, and it tells us this is worth",
    "building next. If it's useful to you, that signal genuinely decides what we build.",
    "",
    "— ColorArchive",
    SITE_URL,
    "",
    `Unsubscribe: ${unsub}`,
  ].join("\n");

  const html = `
  <div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
    <span style="display:inline-block;background:#fef3c7;color:#92400e;font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;padding:5px 12px;border-radius:999px">Coming soon · pre-order</span>
    <h1 style="font-size:23px;line-height:1.3;margin:16px 0 10px;color:#111">Audit a whole palette for accessibility — in one pass</h1>
    <p style="color:#444;line-height:1.65;font-size:15px">If you've ever had to <strong>prove a palette is accessible</strong>, you know the slog: checking every text/background pair for WCAG contrast, simulating color-blindness, then hunting for on-brand replacements for everything that fails — by hand, one pair at a time.</p>
    <p style="color:#444;line-height:1.65;font-size:15px">We're building the <strong>ColorArchive Accessibility Auditor</strong> to do that whole pass for you:</p>
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:16px;padding:16px 20px;margin:18px 0">
      <ul style="margin:0;padding-left:18px;color:#7c2d12;line-height:1.9;font-size:14px">
        <li><strong>Whole-palette WCAG scan</strong> — every foreground/background pair, AA and AAA, at once.</li>
        <li><strong>Color-blindness check</strong> across the set — flags pairs that collapse for color-blind users.</li>
        <li><strong>Accessible auto-fixes</strong> — the nearest on-brand color from the 5,446-color archive, per failing pair.</li>
        <li><strong>Shareable report</strong> + corrected token export (CSS / Tailwind / Figma).</li>
      </ul>
    </div>
    <div style="text-align:center;margin:8px 0 4px">
      <div style="font-size:13px;color:#6b7280">Founder price · ships Q3 2026 · full refund if we don't ship</div>
      <div style="margin:6px 0 14px"><span style="font-size:30px;font-weight:800;color:#111">¥4,999</span> <span style="color:#9ca3af;text-decoration:line-through">¥9,999</span></div>
      <a href="${preorder}" style="display:inline-block;background:#111;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">Pre-order the Auditor</a>
    </div>
    <p style="color:#666;font-size:13px;line-height:1.6;margin:20px 0 0">Pre-ordering locks your founder price and tells us this is worth building next — that signal genuinely decides what we build.</p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
    <p style="color:#9ca3af;font-size:12px;line-height:1.6">ColorArchive · <a href="${SITE_URL}" style="color:#9ca3af">${SITE_URL.replace(/^https?:\/\//, "")}</a> &nbsp;·&nbsp; <a href="${unsub}" style="color:#9ca3af">Unsubscribe</a></p>
  </div>`;
  return { text, html, unsub };
}

// ---- Recipients ----
let rows;
if (sourceFilter) {
  const ph = sourceFilter.map(() => "?").join(",");
  rows = db.prepare(`SELECT email, source FROM subscribers WHERE source IN (${ph}) ORDER BY created_at ASC`).all(...sourceFilter);
} else {
  rows = db.prepare(`SELECT email, source FROM subscribers ORDER BY created_at ASC`).all();
}
if (limit) rows = rows.slice(0, limit);
if (overrideTo) rows = [{ email: overrideTo, source: "override" }];

const bySource = db.prepare(`SELECT source, COUNT(*) c FROM subscribers GROUP BY source ORDER BY c DESC`).all();

console.log(`\n=== Pre-order broadcast — ${DO_SEND ? "SEND MODE" : "DRY-RUN (no email sent)"} ===`);
console.log(`Subject: ${SUBJECT}`);
console.log(`\nAll subscribers by source:`);
bySource.forEach((r) => console.log(`  ${r.source}: ${r.c}`));
console.log(`\nThis run targets ${rows.length} recipient(s)${sourceFilter ? ` (source in ${sourceFilter.join(",")})` : " (ALL sources)"}${limit ? `, limited to ${limit}` : ""}${overrideTo ? `, override → ${overrideTo}` : ""}.`);
console.log(`\n----- TEXT PREVIEW -----\n${buildEmail("preview@example.com").text}\n------------------------\n`);

if (!DO_SEND) {
  console.log("DRY-RUN complete. Re-run with --send (optionally --source=… / --to=… / --limit=…) to actually send.");
  process.exit(0);
}
if (!resend) { console.error("No RESEND_API_KEY — cannot send."); process.exit(1); }

(async () => {
  let ok = 0, fail = 0;
  for (const r of rows) {
    const { text, html } = buildEmail(r.email);
    try {
      const res = await resend.emails.send({ from: `ColorArchive <${FROM}>`, reply_to: FROM, to: r.email, subject: SUBJECT, text, html });
      if (res.error) { fail++; console.error(`  FAIL ${r.email}: ${JSON.stringify(res.error)}`); }
      else { ok++; if (ok % 25 === 0) console.log(`  …${ok} sent`); }
    } catch (e) { fail++; console.error(`  FAIL ${r.email}: ${e.message}`); }
    await new Promise((res) => setTimeout(res, 600)); // ~1.6/s, gentle on Resend + deliverability
  }
  fs.appendFileSync(path.join(SERVER_DIR, "logs/preorder-broadcast.log"),
    `\n[${new Date().toISOString()}] sent=${ok} fail=${fail} target=${rows.length} source=${sourceFilter ? sourceFilter.join(",") : "all"}\n`);
  console.log(`\nDone. Sent ${ok}, failed ${fail}, of ${rows.length}.`);
})();
