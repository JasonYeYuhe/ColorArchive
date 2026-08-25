/**
 * Tests for server/entitlement.js — who still has Pro, and until when.
 *
 * Run with:
 *   node --test server/__tests__/entitlement.test.js
 *
 * Context (2026-08-18). Every assertion here exists because the shipped code
 * got it wrong, not because the case is hypothetical:
 *
 *  - Lemon Squeezy's `cancelled` status means "will not renew", not "access
 *    ends now"; the subscription stays valid until `ends_at`. Both webhook
 *    paths revoked immediately, so a customer who cancelled on day 2 of a paid
 *    month lost 28 days they had paid for — while /support said "You keep
 *    access until the end of your billing period. No partial refunds." and
 *    /account said "You retain access until the expiry date."
 *
 *  - `subscription_cancelled` and `subscription_updated` both fire on a
 *    cancellation, in no guaranteed order, and used to compute the expiry
 *    independently. The "both resolvers agree" test below is the one that
 *    catches a fix applied to only one of them.
 *
 *  - The fix must not swing into the opposite failure. A missing or unparseable
 *    timestamp has to REVOKE, never grant an unbounded pro_expires_at — that is
 *    the exact failure-open hole subscription-checkout was written to close.
 *    "tier is never pro without a concrete expiry" is asserted as an invariant.
 */

const test = require("node:test");
const assert = require("node:assert");

const {
  effectiveTier,
  GRACE_DAYS,
  UNDATED_HORIZON_DAYS,
  paidThrough,
  renewalExpiry,
  resolveCancellation,
  resolveSubscriptionUpdate,
} = require("../entitlement");

// A fixed clock so none of this depends on the day it runs.
const NOW = Date.parse("2026-08-18T12:00:00Z");
const inDays = (n) => new Date(NOW + n * 86400000).toISOString();

/* ── cancellation: the customer keeps what they paid for ──────────────────── */

test("cancelling mid-period keeps Pro until the paid period ends", () => {
  const d = resolveCancellation({ endsAt: inDays(28), now: NOW });
  assert.equal(d.tier, "pro", "a cancelled-but-unexpired customer is still Pro");
  assert.equal(d.keepsAccess, true);
  assert.equal(d.subscriptionStatus, "cancelled");
  assert.equal(d.cancelAtPeriodEnd, 1);
  assert.equal(
    d.proExpiresAt,
    new Date(NOW + (28 + GRACE_DAYS) * 86400000).toISOString(),
    "expiry is the period end plus the same grace the rest of the server uses",
  );
});

test("a cancellation surfaces the period end for the UI to display", () => {
  // The old handler never wrote subscription_current_period_end at all, so
  // /account rendered the "you retain access until the expiry date" paragraph
  // with no date beside it. This asserts only the resolver's half of that fix
  // — that the value exists to be written. Whether the handler writes it is
  // not covered here; that lives in routes/webhook.js and has no test harness.
  const d = resolveCancellation({ endsAt: inDays(28), now: NOW });
  assert.equal(d.currentPeriodEnd, inDays(28));
});

/* ── expiry: access really does end ───────────────────────────────────────── */

test("an expiry event revokes even when it carries a future date", () => {
  // reason wins over the timestamp. If this ever inverts, an expired
  // subscription silently keeps Pro forever.
  const d = resolveCancellation({ reason: "expired", endsAt: inDays(28), now: NOW });
  assert.equal(d.tier, "free");
  assert.equal(d.proExpiresAt, null);
  assert.equal(d.subscriptionStatus, "expired", "expired must not be recorded as cancelled");
  assert.equal(d.keepsAccess, false);
});

test("cancelling after the period already ended revokes now", () => {
  const d = resolveCancellation({ endsAt: inDays(-1), now: NOW });
  assert.equal(d.tier, "free");
  assert.equal(d.proExpiresAt, null);
});

/* ── fail direction: missing data revokes, never grants ───────────────────── */

for (const [label, endsAt] of [
  ["missing", undefined],
  ["null", null],
  ["empty string", ""],
  ["unparseable", "not-a-date"],
]) {
  test(`a ${label} ends_at revokes rather than granting unbounded Pro`, () => {
    const d = resolveCancellation({ endsAt, now: NOW });
    assert.equal(d.tier, "free", "must not fail open");
    assert.equal(d.proExpiresAt, null);
  });
}

/* ── subscription_updated: the same question, a different event ───────────── */

test("status=cancelled inside the paid period is still Pro", () => {
  const d = resolveSubscriptionUpdate({ status: "cancelled", periodEndIso: inDays(10), now: NOW });
  assert.equal(d.isPro, true);
  assert.equal(d.tier, "pro");
});

test("Stripe's single-L 'canceled' is handled too", () => {
  const d = resolveSubscriptionUpdate({ status: "canceled", periodEndIso: inDays(10), now: NOW });
  assert.equal(d.isPro, true);
});

test("status=cancelled past the period end is free, with no dangling expiry", () => {
  const d = resolveSubscriptionUpdate({ status: "cancelled", periodEndIso: inDays(-5), now: NOW });
  assert.equal(d.isPro, false);
  assert.equal(
    d.proExpiresAt,
    null,
    "writing a stale future date next to tier=free is how the old code stranded users: auth.js only downgrades, it never upgrades",
  );
});

test("past_due keeps Pro — the card is still being retried", () => {
  const d = resolveSubscriptionUpdate({ status: "past_due", periodEndIso: inDays(3), now: NOW });
  assert.equal(d.isPro, true);
});

for (const status of ["paused", "unpaid", "expired", "", undefined]) {
  test(`status=${status === undefined ? "undefined" : status || "(empty)"} is not Pro`, () => {
    const d = resolveSubscriptionUpdate({ status, periodEndIso: inDays(10), now: NOW });
    assert.equal(d.isPro, false);
  });
}

test("non-cancel statuses keep their previous expiry semantics untouched", () => {
  const d = resolveSubscriptionUpdate({ status: "active", periodEndIso: inDays(30), now: NOW });
  assert.equal(d.proExpiresAt, inDays(30), "grace is only added on the cancellation branch");
});

/* ── the race: both events fire on one cancellation ───────────────────────── */

test("both resolvers write the same expiry for the same cancellation", () => {
  // LS sends subscription_cancelled AND subscription_updated(status=cancelled).
  // Order is not guaranteed, so whichever lands last must not change the
  // answer. A fix applied to only one handler fails here.
  const endsAt = inDays(14);
  const viaCancel = resolveCancellation({ endsAt, now: NOW });
  const viaUpdate = resolveSubscriptionUpdate({ status: "cancelled", periodEndIso: endsAt, now: NOW });
  assert.equal(viaCancel.proExpiresAt, viaUpdate.proExpiresAt);
  assert.equal(viaCancel.tier, viaUpdate.tier);
});

/* ── invariant ───────────────────────────────────────────────────────────── */

test("tier is never 'pro' without a concrete expiry", () => {
  const cases = [
    resolveCancellation({ endsAt: inDays(5), now: NOW }),
    resolveCancellation({ endsAt: null, now: NOW }),
    resolveCancellation({ reason: "expired", endsAt: inDays(5), now: NOW }),
    resolveSubscriptionUpdate({ status: "cancelled", periodEndIso: inDays(5), now: NOW }),
    resolveSubscriptionUpdate({ status: "cancelled", periodEndIso: null, now: NOW }),
  ];
  for (const c of cases) {
    if (c.tier === "pro") {
      assert.ok(c.proExpiresAt, `pro with no expiry is the failure-open hole: ${JSON.stringify(c)}`);
    }
  }
});

test("paidThrough returns null for junk instead of an Invalid Date string", () => {
  assert.equal(paidThrough(null), null);
  assert.equal(paidThrough("nope"), null);
  assert.equal(paidThrough(inDays(0)), new Date(NOW + GRACE_DAYS * 86400000).toISOString());
});

/* ── the opposite failure: Pro that never expires ─────────────────────────── */

test("an active subscription with no date gets a bounded clock, not a NULL one", () => {
  // auth.js expires people by comparing against pro_expires_at, so tier='pro'
  // beside a NULL clock is Pro forever. subscription-checkout already guarded
  // this with a 35-day fallback; subscription_updated and the Apple renewal
  // paths did not, and wrote NULL whenever the payload omitted the date.
  const d = resolveSubscriptionUpdate({ status: "active", periodEndIso: null, now: NOW });
  assert.equal(d.isPro, true, "a real subscriber must not be cut off by a malformed payload");
  assert.ok(d.proExpiresAt, "…but the clock must still exist");
  assert.equal(d.proExpiresAt, new Date(NOW + UNDATED_HORIZON_DAYS * 86400000).toISOString());
});

test("renewalExpiry never returns null, for any input", () => {
  for (const input of [null, undefined, "", "not-a-date", 0, NaN]) {
    assert.ok(
      renewalExpiry(input, { now: NOW }),
      `renewalExpiry(${JSON.stringify(input)}) returned falsy — that becomes an unexpirable Pro account`,
    );
  }
});

test("renewalExpiry honours a real provider date, with grace by default", () => {
  assert.equal(
    renewalExpiry(inDays(30), { now: NOW }),
    new Date(NOW + (30 + GRACE_DAYS) * 86400000).toISOString(),
  );
  assert.equal(
    renewalExpiry(inDays(30), { now: NOW, graceDays: 0 }),
    inDays(30),
    "graceDays:0 takes the provider date verbatim — subscription_updated relies on that to snap the clock back",
  );
});

test("an entitled user is never left without an expiry, across every status", () => {
  for (const status of ["active", "trialing", "on_trial", "past_due", "cancelled"]) {
    for (const periodEndIso of [null, undefined, "junk", inDays(9)]) {
      const d = resolveSubscriptionUpdate({ status, periodEndIso, now: NOW });
      if (d.tier === "pro") {
        assert.ok(
          d.proExpiresAt,
          `status=${status} periodEnd=${periodEndIso} produced pro with no expiry`,
        );
      }
    }
  }
});

/* ── effectiveTier: one answer for every read path ───────────────────────── */

test("an expired Pro row reads as free, and says so", () => {
  const d = effectiveTier({ tier: "pro", proExpiresAt: inDays(-1), now: NOW });
  assert.equal(d.tier, "free");
  assert.equal(d.expired, true, "callers persist the downgrade off this flag");
});

test("an unexpired Pro row stays Pro", () => {
  const d = effectiveTier({ tier: "pro", proExpiresAt: inDays(1), now: NOW });
  assert.equal(d.tier, "pro");
  assert.equal(d.expired, false);
});

test("lifetime (no expiry) is never demoted", () => {
  // A lifetime purchase legitimately has pro_expires_at = NULL. Demoting it
  // would be the exact opposite of the failure this module usually guards.
  for (const v of [null, undefined, ""]) {
    assert.equal(effectiveTier({ tier: "pro", proExpiresAt: v, now: NOW }).tier, "pro");
  }
});

test("an unparseable expiry does not demote a paying customer", () => {
  assert.equal(effectiveTier({ tier: "pro", proExpiresAt: "garbage", now: NOW }).tier, "pro");
});

test("non-pro tiers pass through untouched", () => {
  assert.equal(effectiveTier({ tier: "free", proExpiresAt: inDays(-1), now: NOW }).tier, "free");
  assert.equal(effectiveTier({ tier: null, now: NOW }).tier, "free");
});

test("the API-key path and the session path cannot disagree", () => {
  // api-rate-limit.js used to read `SELECT id, tier` with no expiry check while
  // auth.js compared against pro_expires_at, so one lapsed account was free on
  // the web and Pro on the API. Both now call this, so the only way to
  // reintroduce that split is to stop calling it.
  const row = { tier: "pro", proExpiresAt: inDays(-3) };
  assert.deepEqual(
    effectiveTier({ ...row, now: NOW }),
    effectiveTier({ ...row, now: NOW }),
  );
  assert.equal(effectiveTier({ ...row, now: NOW }).tier, "free");
});
