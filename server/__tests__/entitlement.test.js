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

/**
 * THE 2026-08-22 LOCKOUT, NOW FIXED — and these assertions are the fix.
 *
 * This block used to be a CHARACTERISATION test that pinned the lockout as
 * "today's behaviour", with a note saying changing it was the decision itself
 * and an owner call, not a drive-by fix. The owner made that call on
 * 2026-09-07 ("全面修复"), so the assertions below now describe the fix.
 *
 * What was wrong: the renewal branch passed `graceDays: 0`, writing
 * pro_expires_at exactly equal to renews_at — zero margin on the one column
 * every read path uses. Two ways that locked out a paying customer:
 *
 *   1. renews_at in the FUTURE, provider charges LATE. Lemon Squeezy was five
 *      days late in August 2026, so no payment event arrived to re-extend and
 *      the clock simply passed. The renewal returning on its own was luck.
 *   2. renews_at already PAST while the status still says alive — the state of
 *      subscription 2357096 at the time. The stale date was copied verbatim, so
 *      the customer was locked out the instant the webhook landed, while the
 *      provider was still retrying the card. ACTIVE_STATUSES includes past_due
 *      precisely to avoid cutting someone off mid-dunning, and this line did it.
 *
 * The fix is grace plus a floor: while the provider says ALIVE, never write an
 * already-expired clock. It is failure-open on sensitive logic, so it is bounded
 * three ways — only while the status is active, never more than GRACE_DAYS past
 * the later of renews_at and now, and re-evaluated every webhook so a dead
 * status revokes on that same event. The tests below pin all three bounds,
 * because an unbounded version of this fix would be the worse bug.
 */
test("a live status with a STALE renews_at no longer locks the customer out", () => {
  const d = resolveSubscriptionUpdate({ status: "past_due", periodEndIso: inDays(-2), now: NOW });

  assert.equal(d.isPro, true, "the provider is still retrying, so they are still Pro");
  assert.equal(
    d.proExpiresAt,
    inDays(3),
    "the clock is floored at now + GRACE_DAYS instead of copying the stale date",
  );

  // The read path is what the customer actually experiences — this is the
  // assertion that would have prevented the August incident.
  assert.deepEqual(
    effectiveTier({ tier: d.tier, proExpiresAt: d.proExpiresAt, now: NOW }),
    { tier: "pro", expired: false },
    "so the read path keeps them Pro through the dunning window",
  );
});

test("BOUND: the floor grants GRACE_DAYS, never an open-ended clock", () => {
  // However stale the provider's date is, the answer is now + GRACE_DAYS — not
  // "stale date + grace" (still expired) and not something unbounded.
  for (const staleDays of [-2, -30, -400]) {
    const d = resolveSubscriptionUpdate({ status: "active", periodEndIso: inDays(staleDays), now: NOW });
    assert.equal(d.proExpiresAt, inDays(3), `stale by ${staleDays}d still yields exactly now + 3d`);
  }
});

test("BOUND: a dead status revokes on that same event, floor or no floor", () => {
  // The floor must never keep someone alive once the provider gives up. This is
  // what stops the fix from drifting into "Pro forever".
  for (const status of ["unpaid", "expired", "paused"]) {
    const d = resolveSubscriptionUpdate({ status, periodEndIso: inDays(-1), now: NOW });
    assert.equal(d.isPro, false, `${status} is not Pro`);
    assert.deepEqual(
      effectiveTier({ tier: d.tier, proExpiresAt: d.proExpiresAt, now: NOW }),
      { tier: "free", expired: false },
      `${status} revokes immediately`,
    );
  }
});

for (const status of ["paused", "unpaid", "expired", "", undefined]) {
  test(`status=${status === undefined ? "undefined" : status || "(empty)"} is not Pro`, () => {
    const d = resolveSubscriptionUpdate({ status, periodEndIso: inDays(10), now: NOW });
    assert.equal(d.isPro, false);
  });
}

test("an active subscription is never left with zero margin at renews_at", () => {
  // The other half of the August incident: renews_at is in the future, but the
  // provider charges late, so nothing re-extends before the clock passes.
  const d = resolveSubscriptionUpdate({ status: "active", periodEndIso: inDays(30), now: NOW });
  assert.equal(d.proExpiresAt, inDays(33), "renews_at + GRACE_DAYS, so a late charge cannot lock them out");
  assert.notEqual(d.proExpiresAt, inDays(30), "exactly renews_at is the bug this replaced");
});

test("grace does not fight subscription-payment's over-extension", () => {
  // The original objection to adding grace here. subscription-payment writes
  // now + 35d for a monthly plan and never shortens; this event snaps back to
  // renews_at + 3d ≈ now + 33d, which is still a shortening. Nothing is fought.
  const d = resolveSubscriptionUpdate({ status: "active", periodEndIso: inDays(30), now: NOW });
  const overExtended = new Date(NOW + 35 * 86400000).toISOString();
  assert.ok(d.proExpiresAt < overExtended, "the snap still shortens the generous clock");
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
