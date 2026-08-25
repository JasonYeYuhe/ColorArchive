#!/usr/bin/env node
/**
 * Design Notes — weekly issue sender.
 *
 * The delivery half of the Design Notes pipeline:
 *
 *   1. A scheduled cloud agent DRAFTS an issue into docs/design-notes/ with
 *      `status: draft` in its frontmatter and pushes it (docs/*.md is in the
 *      Vercel ignore list, so drafting costs no build).
 *   2. A human reads it and flips the frontmatter to `status: approved`.
 *   3. This script mails approved-and-unsent issues to the notes list.
 *
 * Step 3 is deliberately incapable of sending anything that a person has not
 * approved: a `draft` issue is skipped, full stop. We just spent a session
 * cleaning up a product that outlived its promise — an unreviewed newsletter
 * going out under the brand is the same failure with a shorter fuse.
 *
 * Run: node scripts/send-design-notes.cjs [--dry-run] [--issue=<slug>]
 */

const path = require("path");
const fs = require("fs");
const SERVER_DIR = path.resolve(__dirname, "..");
require(path.join(SERVER_DIR, "node_modules/dotenv")).config({ path: path.join(SERVER_DIR, ".env") });
const Database = require(path.join(SERVER_DIR, "node_modules/better-sqlite3"));
const { Resend } = require(path.join(SERVER_DIR, "node_modules/resend"));

const DB_PATH = process.env.DB_PATH || path.join(SERVER_DIR, "data.db");
const ISSUES_DIR = process.env.DESIGN_NOTES_DIR || path.join(SERVER_DIR, "design-notes");
const SITE_URL = process.env.SITE_URL || "https://colorarchive.org";
const FROM = process.env.FROM_EMAIL || "hello@colorarchive.org";
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const DRY = process.argv.includes("--dry-run");
const onlyIssue = (process.argv.find((a) => a.startsWith("--issue=")) || "").split("=")[1] || null;

const db = new Database(DB_PATH);
db.exec(`CREATE TABLE IF NOT EXISTS design_notes_sent (
  slug TEXT PRIMARY KEY,
  subject TEXT,
  recipients INTEGER,
  sent_at TEXT NOT NULL DEFAULT (datetime('now'))
)`);
// Per-recipient ledger. Issue-level tracking alone is wrong in both directions:
// a crash mid-run would re-mail everyone already served on the next cron, and a
// transient per-address failure would be silently written off forever. This row
// is written immediately after each successful send, so a re-run resumes exactly
// where it stopped.
db.exec(`CREATE TABLE IF NOT EXISTS design_notes_deliveries (
  slug TEXT NOT NULL,
  email TEXT NOT NULL,
  sent_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (slug, email)
)`);

/* ---------------- issue loading ---------------- */

/** Minimal frontmatter parser — key: value pairs between --- fences. */
function parseIssue(file) {
  const raw = fs.readFileSync(file, "utf8");
  const m = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw);
  if (!m) return null;
  const meta = {};
  for (const line of m[1].split("\n")) {
    const kv = /^([a-zA-Z_]+):\s*(.*)$/.exec(line.trim());
    if (kv) meta[kv[1]] = kv[2].replace(/^["']|["']$/g, "").trim();
  }
  return { meta, body: m[2].trim(), slug: path.basename(file, ".md") };
}

// An issue is named YYYY-Www.md (the convention the drafting routine follows and
// docs/design-notes/README.md states). Matching the name POSITIVELY rather than
// blocklisting README.md is deliberate: every .md in this directory was being
// parsed as a mailable issue, so any prose file that ever happens to contain a
// line reading `status: approved` gets mailed to the list. README.md survives
// today only because its example line is `status: draft   # → approved, ...`,
// which is luck, not a guard — and the next TEMPLATE.md or IDEAS.md would not
// have that luck. The allowlist closes the whole class.
const ISSUE_SLUG_RE = /^\d{4}-W\d{2}$/;

function loadApproved() {
  if (!fs.existsSync(ISSUES_DIR)) return [];
  const files = fs.readdirSync(ISSUES_DIR).filter((f) => f.endsWith(".md"));

  // Say what was skipped. A genuine issue with a typo'd filename must not vanish
  // in silence — that is the same failure shape as a dropped analytics write that
  // returns 204: invisible to everyone, including us.
  const skipped = files.filter((f) => !ISSUE_SLUG_RE.test(path.basename(f, ".md")));
  if (skipped.length) {
    console.log(
      `[design-notes] ignoring ${skipped.length} non-issue file(s) in ${ISSUES_DIR}: ${skipped.join(", ")} (expected YYYY-Www.md)`,
    );
  }

  return files
    .filter((f) => ISSUE_SLUG_RE.test(path.basename(f, ".md")))
    .map((f) => parseIssue(path.join(ISSUES_DIR, f)))
    .filter((i) => i && i.meta.status === "approved")
    .filter((i) => (onlyIssue ? i.slug === onlyIssue : true))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

/* ---------------- rendering ---------------- */

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Tiny markdown → HTML for the subset the drafts use: ##/### headings, **bold**,
 * `code`, [links](url), bullet lists, paragraphs. Everything is escaped BEFORE
 * inline formatting is applied, so issue text can never inject markup.
 */
function renderBody(md) {
  const inline = (t) =>
    esc(t)
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" style="color:#4f46e5;">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, '<code style="background:#f3f4f6;padding:1px 5px;border-radius:4px;font-size:13px;">$1</code>');

  const out = [];
  let list = null;
  for (const line of md.split("\n")) {
    const t = line.trim();
    if (!t) {
      if (list) { out.push(`<ul style="margin:0 0 16px;padding-left:20px;color:#4b5563;font-size:14px;line-height:1.7;">${list.join("")}</ul>`); list = null; }
      continue;
    }
    const bullet = /^[-*]\s+(.*)$/.exec(t);
    if (bullet) { (list ||= []).push(`<li style="margin-bottom:6px;">${inline(bullet[1])}</li>`); continue; }
    if (list) { out.push(`<ul style="margin:0 0 16px;padding-left:20px;color:#4b5563;font-size:14px;line-height:1.7;">${list.join("")}</ul>`); list = null; }
    const h = /^(#{2,3})\s+(.*)$/.exec(t);
    if (h) {
      const size = h[1].length === 2 ? 18 : 15;
      out.push(`<p style="font-size:${size}px;font-weight:600;color:#1f2328;margin:22px 0 8px;">${inline(h[2])}</p>`);
      continue;
    }
    out.push(`<p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 14px;">${inline(t)}</p>`);
  }
  if (list) out.push(`<ul style="margin:0 0 16px;padding-left:20px;color:#4b5563;font-size:14px;line-height:1.7;">${list.join("")}</ul>`);
  return out.join("\n");
}

function renderHtml(issue, to) {
  const unsub = `${SITE_URL}/unsubscribe/?email=${encodeURIComponent(to)}`;
  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1f2328;">
    <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;margin:0 0 6px;">ColorArchive Design Notes</p>
    <p style="font-size:22px;font-weight:600;line-height:1.35;margin:0 0 20px;">${esc(issue.meta.title || "Design Notes")}</p>
    ${renderBody(issue.body)}
    <hr style="border:none;border-top:1px solid #eee;margin:26px 0;">
    <p style="color:#9ca3af;font-size:12px;line-height:1.6;margin:0;">
      You get this because you asked for Design Notes on <a href="${SITE_URL}" style="color:#9ca3af;">colorarchive.org</a>.
      One email a week. <a href="${unsub}" style="color:#9ca3af;">Unsubscribe</a> any time.
    </p>
  </div>`;
}

/* ---------------- send ---------------- */

(async () => {
  const issues = loadApproved();
  if (issues.length === 0) {
    console.log("[design-notes] no approved issues (drafts are skipped by design).");
    return;
  }

  const allRecipients = db
    .prepare(
      `SELECT id, email FROM subscribers
        WHERE notes_subscribed = 1 AND COALESCE(is_test,0) = 0`,
    )
    .all();

  const alreadySent = db.prepare(
    "SELECT 1 FROM design_notes_deliveries WHERE slug = ? AND email = ?",
  );
  const recordDelivery = db.prepare(
    "INSERT OR IGNORE INTO design_notes_deliveries (slug, email) VALUES (?, ?)",
  );

  for (const issue of issues) {
    // Resume semantics: only address people this issue has not reached yet.
    const pending = allRecipients.filter((r) => !alreadySent.get(issue.slug, r.email));
    if (pending.length === 0) {
      console.log(`[design-notes] "${issue.slug}" — all ${allRecipients.length} recipient(s) already served.`);
      continue;
    }

    const subject = issue.meta.subject || issue.meta.title || "ColorArchive Design Notes";
    console.log(`\n[design-notes] issue "${issue.slug}" → ${pending.length} pending of ${allRecipients.length}`);
    console.log(`  subject: ${subject}`);

    if (DRY) {
      console.log("  --dry-run: not sending, not recording.");
      continue;
    }
    if (!resend) {
      console.error("  No RESEND_API_KEY — aborting so the issue stays unsent.");
      process.exit(1);
    }

    let ok = 0;
    for (const r of pending) {
      try {
        const res = await resend.emails.send({
          from: `ColorArchive <${FROM}>`,
          reply_to: FROM,
          to: r.email,
          subject,
          text: `${issue.meta.title || "Design Notes"}\n\n${issue.body}\n\n—\nUnsubscribe: ${SITE_URL}/unsubscribe/?email=${encodeURIComponent(r.email)}`,
          html: renderHtml(issue, r.email),
        });
        if (res.error) throw new Error(res.error.message);
        // Record BEFORE moving on: a crash on the next address can never cost
        // this one a duplicate.
        recordDelivery.run(issue.slug, r.email);
        db.prepare("UPDATE subscribers SET notes_last_sent = date('now') WHERE id = ?").run(r.id);
        ok++;
      } catch (err) {
        // Left unrecorded on purpose — the next run retries just this address.
        console.error(`  failed for ${r.email}:`, err?.message || err);
      }
    }

    const served = allRecipients.filter((r) => alreadySent.get(issue.slug, r.email)).length;
    db.prepare(
      "INSERT OR REPLACE INTO design_notes_sent (slug, subject, recipients) VALUES (?, ?, ?)",
    ).run(issue.slug, subject, served);
    console.log(`  sent ${ok} now · ${served}/${allRecipients.length} served in total`);
  }
})();
