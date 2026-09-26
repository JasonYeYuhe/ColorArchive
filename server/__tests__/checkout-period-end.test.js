/**
 * /webhooks/subscription-checkout must record the provider's next charge date.
 *
 * Until 2026-09-24 it did not, so a new subscription — every trial in particular —
 * had subscription_current_period_end NULL until its first subscription_updated.
 * Both the digest's overdue tripwire and renewal-grace key on that column, so a
 * trial whose first charge Lemon Squeezy never attempted would have gone from
 * "on trial" straight to locked out with nothing said. User 56 (2026-09-23) spent
 * her whole trial invisible that way.
 *
 * Executed against the real handler and schema.
 */

require("./support/route-harness").install();

const test = require("node:test");
const assert = require("node:assert");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const db = require("../db");
const router = require("../routes/webhook");
const { callRoute } = require("./support/route-harness");

const post = (body) => callRoute(router, "post", "/subscription-checkout", { body });
const reset = () => { for (const t of ["orders", "subscribers", "users"]) db.exec(`DELETE FROM ${t}`); };
const row = (email) => db.prepare("SELECT subscription_status AS st, subscription_current_period_end AS cpe, pro_expires_at AS pea FROM users WHERE email = ?").get(email);

// The exact shape app/api/webhook/route.ts forwarded for the 2026-09-23 trial.
const trial = {
  email: "trial@x.com", plan: "monthly", subscriptionId: "2551674", provider: "lemonsqueezy", customerId: "9974502",
  status: "on_trial", trialEndsAt: "2026-09-26T18:58:57.000000Z", renewsAt: "2026-09-26T10:00:00.000000Z", testMode: false,
};

test("a trial checkout records the next charge date and keeps the trial status", () => {
  reset();
  assert.equal(post(trial).code, 200);
  const r = row("trial@x.com");
  assert.equal(r.cpe, "2026-09-26T10:00:00.000Z");
  assert.equal(r.st, "on_trial");
  assert.equal(r.pea, "2026-09-29T18:58:57.000Z", "trial end + 3 days grace, as before");
});

test("the digest's overdue tripwire can now see a trial whose first charge did not happen", () => {
  reset();
  const HOUR = 3600000;
  // Renewal 20 h ago, clock still 2 days out: exactly the window the tripwire exists for.
  post({ ...trial, email: "late-trial@x.com", renewsAt: new Date(Date.now() - 20 * HOUR).toISOString(), trialEndsAt: new Date(Date.now() + 45 * HOUR).toISOString() });
  const src = readFileSync(join(__dirname, "..", "scripts", "conversion-digest.cjs"), "utf8");
  const start = src.indexOf("const overdueRenewals = db.prepare(");
  const open = src.indexOf("`", start);
  const sql = src.slice(open + 1, src.indexOf("`", open + 1)).replace("${REAL}", "COALESCE(is_test, 0) = 0").replace("${gracedExpr}", "NULL");
  const hits = db.prepare(sql).all().map((r) => r.email);
  assert.deepEqual(hits, ["late-trial@x.com"]);
});

test("without a usable renewsAt the column is left as it was", () => {
  reset();
  post(trial);
  const { renewsAt, ...noRenews } = trial;
  post({ ...noRenews, subscriptionId: "2551675" });
  assert.equal(row("trial@x.com").cpe, "2026-09-26T10:00:00.000Z", "a resend without the field must not blank it");
  post({ ...noRenews, renewsAt: "not-a-date", subscriptionId: "2551676" });
  assert.equal(row("trial@x.com").cpe, "2026-09-26T10:00:00.000Z");
  post({ ...noRenews, email: "fresh@x.com" });
  assert.equal(row("fresh@x.com").cpe, null);
});
