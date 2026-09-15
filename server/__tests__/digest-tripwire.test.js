/**
 * The subscriber lock-out tripwires in scripts/conversion-digest.cjs.
 *
 * Source-text checks, and deliberately so: the digest is a standalone cron script
 * that runs on require. What is pinned here is structural — the two properties that
 * silently re-blind it if someone "tidies" the SQL. Real behaviour was verified on
 * 2026-09-15 against a copy of the production database, old script vs new, four
 * scenarios; see project memory project_webhook_billing_2026_09_08.md.
 */

const test = require("node:test");
const assert = require("node:assert");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const src = readFileSync(join(__dirname, "..", "scripts", "conversion-digest.cjs"), "utf8");

/** The SQL template literal passed to db.prepare for `const <name> = db.prepare(`. */
function querySql(name) {
  const start = src.indexOf(`const ${name} = db.prepare(`);
  assert.notEqual(start, -1, `${name} query not found — renamed?`);
  const open = src.indexOf("`", start);
  const close = src.indexOf("`", open + 1);
  return src.slice(open + 1, close);
}

test("the locked-out tripwire does not filter on tier", () => {
  const sql = querySql("staleRenewals");
  assert.ok(
    !/\btier\s*=\s*'pro'/.test(sql),
    "staleRenewals filters on tier='pro'. auth.js self-heals an expired row to tier='free' on the " +
      "user's next page load, and a locked-out subscriber loads a page — that is how they find the " +
      "paywall. With this filter the harmed customer vanishes from the query the moment they are " +
      "harmed. Measured 2026-09-15 on a production copy: old script reported 'quiet', new one '1 locked out'.",
  );
  assert.ok(/subscription_status IN/.test(sql), "the tripwire must still key on the provider status");
});

test("the overdue-renewal warning exists and keeps a quiet day from staying silent", () => {
  const sql = querySql("overdueRenewals");
  assert.ok(/subscription_current_period_end/.test(sql), "overdue must key on the renewal date");
  assert.ok(!/\btier\s*=\s*'pro'/.test(sql), "overdue must not filter on tier either");
  const send = src.slice(src.indexOf("const hasMoneyActivity"), src.indexOf("const shouldSend"));
  assert.ok(
    send.includes("overdueRenewals.length"),
    "overdueRenewals is not part of the send decision, so on a quiet non-Monday the digest does " +
      "not email at all — exactly the day an overdue renewal needs to be mentioned",
  );
});

test("the Instagram publish check reads the post log and keeps a quiet day from staying silent", () => {
  assert.ok(src.includes('".post-log.json"'), "the digest no longer reads the scheduler's post log");
  assert.ok(/\$\{kind\}-\$\{igCheckDate\}/.test(src), "the post-log key format must be `${kind}-YYYY-MM-DD`, as ig-scheduler.js writes it");
  const send = src.slice(src.indexOf("const hasOpsAlert"), src.indexOf("const shouldSend") + 120);
  assert.ok(/igProblems\.length/.test(send) && /shouldSend = .*hasOpsAlert/.test(send),
    "igProblems must count toward the send decision, or a stopped Instagram channel is only mentioned on Mondays");
});

test("the post-log key format the digest checks is the one ig-scheduler.js actually writes", () => {
  const sched = readFileSync(join(__dirname, "..", "ig-scheduler.js"), "utf8");
  assert.ok(sched.includes("`story-${todayStr()}`"), "ig-scheduler.js story key format changed");
  assert.ok(sched.includes("`post-${todayStr()}`"), "ig-scheduler.js post key format changed");
});
