#!/usr/bin/env node
/**
 * Interview invitations — docs/dev-plan-2026-08-15.md §4.
 *
 *   node server/scripts/send-interview-invites.cjs            # dry run, prints everything
 *   node server/scripts/send-interview-invites.cjs --apply    # actually sends
 *
 * WHY INTERVIEWS AND NOT A TEST
 * §4 settled this with a power calculation: telling 0.5% from 1.0% needs ~4,673
 * observations per arm, and this site sees ~870-1,250 engaged visits a month. A
 * quantitative conversion test here cannot return a true answer in under a year,
 * so it would only ever produce a false one. n=5 conversations carry more
 * information than another month of the same telemetry.
 *
 * WHO ACTUALLY GETS THIS — the list is smaller than the plan assumed
 * The plan says "the one paying user + 8 subscribers". `subscribers` does hold 8
 * rows, but three are not people: yyyyy.yeyuhe@gmail.com and
 * yyyyy.yeyuhe@icloud.com are the owner's own addresses and
 * test-debug@colorarchive.me is a debug row. So the real audience is FIVE, one of
 * whom (hayleyjunefry@gmail.com) is both the subscriber list AND the only paying
 * customer the site has ever had — she gets the customer letter, not the
 * subscriber one, and gets it once.
 *
 * Two letters, because the questions differ. The customer knows why she paid; the
 * subscribers are the people who did NOT, which is the more useful half of the
 * question and the half a conversion test cannot ask.
 *
 * Sending is opt-out-respecting: every mail carries the same unsubscribe link the
 * newsletter uses, and the send is logged so nobody is invited twice.
 */

const path = require("path");
const fs = require("fs");
const SERVER_DIR = path.resolve(__dirname, "..");
require(path.join(SERVER_DIR, "node_modules/dotenv")).config({ path: path.join(SERVER_DIR, ".env") });
const Database = require(path.join(SERVER_DIR, "node_modules/better-sqlite3"));
const { Resend } = require(path.join(SERVER_DIR, "node_modules/resend"));

const APPLY = process.argv.includes("--apply");
const DB_PATH = process.env.DB_PATH || path.join(SERVER_DIR, "data.db");
const FROM = process.env.FROM_EMAIL || "hello@colorarchive.org";
const SITE_URL = process.env.SITE_URL || "https://colorarchive.org";
const REPLY_TO = process.env.GATE_REPORT_TO || "yyyyy.yeyuhe@gmail.com";
const LOG = path.join(SERVER_DIR, "logs/interview-invites.log");

const EXCLUDE = new Set(["yyyyy.yeyuhe@gmail.com", "yyyyy.yeyuhe@icloud.com", "test-debug@colorarchive.me"]);

const db = new Database(DB_PATH, { readonly: true });
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// The one real customer: a non-test order with money attached.
const payer = db
  .prepare(
    `SELECT email FROM orders WHERE COALESCE(is_test,0)=0 AND COALESCE(refunded,0)=0 AND amount > 0
      AND email NOT IN ('yyyyy.yeyuhe@gmail.com','yyyyy.yeyuhe@icloud.com')
      ORDER BY created_at DESC LIMIT 1`,
  )
  .get()?.email ?? null;

const subs = db
  .prepare(`SELECT email, source, substr(created_at,1,10) d FROM subscribers WHERE COALESCE(is_test,0)=0 ORDER BY created_at`)
  .all()
  .filter((r) => !EXCLUDE.has(r.email));

const already = fs.existsSync(LOG) ? new Set(fs.readFileSync(LOG, "utf8").split("\n").map((l) => l.split("\t")[1]).filter(Boolean)) : new Set();

const unsub = (to) => `${SITE_URL}/unsubscribe/?email=${encodeURIComponent(to)}`;

function customerLetter(to) {
  return {
    subject: "A question about ColorArchive, from the person who builds it",
    text: `Hi,

I'm the one who builds ColorArchive — it's just me. You're the first person to ever pay for it, which is why I'm writing to you directly rather than sending a survey.

I'm trying to work out what this site should become, and I'd rather ask than guess. Could I have 15 minutes of your time, on a call or just over email, whichever you prefer? Four questions, and honest answers are more useful to me than kind ones:

1. What were you trying to get done when you found ColorArchive?
2. Which page did you actually land on, and what made you keep going?
3. What made you pay — was there a specific moment, or did it just accumulate?
4. What would make you cancel?

If it's easier, reply to this email with a line or two on any of them. That's genuinely enough.

Either way, thank you. Knowing one real person finds this useful has changed what I work on.

— Jason
${SITE_URL}

Unsubscribe: ${unsub(to)}`,
  };
}

function subscriberLetter(to) {
  return {
    subject: "Why didn't ColorArchive work for you? (genuine question, 2 minutes)",
    text: `Hi,

I build ColorArchive — it's a one-person project. You signed up at some point, and then, like almost everyone, didn't come back much. I'd like to understand why, because that's the more useful half of the question and I can't get it from analytics.

Three questions. A one-line answer to any single one is a real help:

1. What were you hoping ColorArchive would do for you?
2. What did you end up using instead?
3. What would have had to be true for you to keep using it?

No pitch attached, and nothing is being sold here. If it turns out the honest answer is "I forgot it existed", that's useful too — please say so.

— Jason
${SITE_URL}

Unsubscribe: ${unsub(to)}`,
  };
}

const queue = [];
if (payer) queue.push({ to: payer, kind: "customer", ...customerLetter(payer) });
for (const s of subs) {
  if (s.email === payer) continue; // she gets the customer letter, once
  queue.push({ to: s.email, kind: `subscriber(${s.source})`, ...subscriberLetter(s.email) });
}

const pending = queue.filter((q) => !already.has(q.to));

console.log(`paying customer : ${payer ?? "(none)"}`);
console.log(`real subscribers: ${subs.length} (from 8 rows; 3 excluded as owner/test)`);
console.log(`already invited : ${already.size}`);
console.log(`to send now     : ${pending.length}\n`);
for (const q of pending) console.log(`  ${q.kind.padEnd(22)} ${q.to}  —  "${q.subject}"`);

if (!APPLY) {
  console.log(`\n--- ${pending[0]?.kind ?? "no"} letter preview ---\n`);
  if (pending[0]) console.log(pending[0].text);
  console.log("\nDRY RUN — nothing sent. Re-run with --apply.");
  process.exit(0);
}
if (!resend) {
  console.error("RESEND_API_KEY missing — cannot send.");
  process.exit(1);
}

(async () => {
  fs.mkdirSync(path.dirname(LOG), { recursive: true });
  for (const q of pending) {
    try {
      const res = await resend.emails.send({
        from: `Jason at ColorArchive <${FROM}>`,
        to: q.to,
        replyTo: REPLY_TO,
        subject: q.subject,
        text: q.text,
        headers: { "List-Unsubscribe": `<${unsub(q.to)}>` },
      });
      const id = res?.data?.id ?? "no-id";
      fs.appendFileSync(LOG, `${new Date().toISOString()}\t${q.to}\t${q.kind}\t${id}\n`);
      console.log(`sent  ${q.to}  (${id})`);
    } catch (err) {
      console.error(`FAIL  ${q.to}  ${err?.message ?? err}`);
    }
  }
})();
