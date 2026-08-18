/**
 * Entitlement decisions for subscription lifecycle events.
 *
 * Deliberately pure: no db handle, no ambient clock. `routes/webhook.js` owns
 * the SQL; this module owns the only question that was actually wrong — "should
 * this person still have Pro, and until when?"
 *
 * ── THE BUG THIS EXISTS TO PREVENT (2026-08-18) ──────────────────────────────
 *
 * Lemon Squeezy's `cancelled` status does NOT mean "access ends now". It means
 * "this will not renew": the subscription stays valid until `ends_at`, and LS
 * sends a separate `subscription_expired` when the clock actually runs out.
 * Both webhook paths treated `cancelled` as immediate revocation:
 *
 *   POST /webhooks/subscription-cancelled → tier='free', pro_expires_at=NULL
 *   POST /webhooks/subscription-updated   → isPro=false for status 'cancelled',
 *                                           while still writing a FUTURE
 *                                           pro_expires_at that auth.js can
 *                                           never act on (it only downgrades,
 *                                           it never upgrades)
 *
 * Meanwhile the site promises the customer the opposite, in two places:
 *
 *   src/components/account-page.tsx  "Your subscription will not renew.
 *                                     You retain access until the expiry date."
 *   src/components/support-page.tsx  "You keep access until the end of your
 *                                     billing period. No partial refunds."
 *
 * So someone who paid for a month and cancelled on day 2 lost 28 paid days,
 * was told twice in writing that they would not, and was refused a refund in
 * the same sentence. That is the same shape as the 2026-07-20 incident — a
 * paying customer locked out by the site's own entitlement code — and it is
 * why this logic now has tests instead of living inline in a route handler.
 *
 * ── FAIL DIRECTION ───────────────────────────────────────────────────────────
 *
 * When the timestamp is missing, unparseable, or already past, we REVOKE rather
 * than grant. An unbounded `pro_expires_at` is precisely the failure-open hole
 * `subscription-checkout` was written to close; re-opening it here in order to
 * be generous would be the more expensive mistake. Generosity is bounded to the
 * grace window below.
 */

/** Same 3-day grace used by subscription-checkout, the Apple path, and
 *  routes/auth.js. Clock skew and webhook lag must never cut access short. */
const GRACE_DAYS = 3;

/**
 * Longest we will honour an entitlement whose payload carried no date at all.
 * `subscription-checkout` already uses this shape ("Fallback: 35 days for a
 * monthly-ish cycle so even a payload missing both timestamps is never
 * unbounded"); the other write paths did not, and wrote NULL instead.
 *
 * NULL is not "no opinion" here — auth.js expires a user by comparing against
 * pro_expires_at, so `tier='pro'` + `pro_expires_at IS NULL` means Pro forever.
 * A bounded horizon keeps a real subscriber working through a malformed payload
 * while still guaranteeing the clock eventually runs out.
 */
const UNDATED_HORIZON_DAYS = 35;

/** Statuses that mean "currently entitled" on their own, independent of dates.
 *  `past_due` is included on purpose: the provider is still retrying the card,
 *  and cutting someone off mid-dunning is the same mistake in miniature. */
const ACTIVE_STATUSES = ["active", "trialing", "on_trial", "past_due"];

/** LS spells it with two Ls; Stripe spells it with one. Accept both. */
const CANCELLED_STATUSES = ["cancelled", "canceled"];

function parseIso(value) {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}

/** True only when `value` is a timestamp we can trust AND it is still ahead of
 *  us. Missing/garbage input is false — never "assume the future". */
function isFuture(value, now) {
  const ms = parseIso(value);
  return ms !== null && ms > now;
}

/**
 * End of the period the customer has already paid for, plus grace.
 * Returns null for anything we cannot parse, which callers must read as
 * "revoke", never as "no expiry".
 */
function paidThrough(iso, graceDays = GRACE_DAYS) {
  const ms = parseIso(iso);
  if (ms === null) return null;
  return new Date(ms + graceDays * 86400000).toISOString();
}

/**
 * Expiry to pair with a `tier='pro'` write when the provider says the
 * subscription is alive. Never returns null: pairing Pro with a NULL clock is
 * the failure-open hole this module exists to keep closed.
 *
 * @param {string|number|null} value  Provider timestamp, or null/garbage.
 * @param {object=} opts
 * @param {number=} opts.graceDays    0 to take the provider's date verbatim.
 */
function renewalExpiry(value, { now = Date.now(), graceDays = GRACE_DAYS } = {}) {
  const dated = graceDays > 0 ? paidThrough(value, graceDays) : null;
  if (dated) return dated;
  const ms = parseIso(value);
  if (ms !== null) return new Date(ms).toISOString();
  return new Date(now + UNDATED_HORIZON_DAYS * 86400000).toISOString();
}

/**
 * `subscription_cancelled` (customer cancelled — access continues) and
 * `subscription_expired` (the clock ran out — access ends) arrive at the SAME
 * endpoint, distinguished only by `reason`. They are not the same event and
 * must not produce the same entitlement.
 *
 * @param {object}  input
 * @param {string=} input.reason  "expired" for the expiry event; anything else
 *                                (including undefined) is a cancellation.
 * @param {string=} input.endsAt  ISO end of the paid period, from LS `ends_at`.
 * @param {number=} input.now     Injected clock, for tests.
 */
function resolveCancellation({ reason, endsAt, now = Date.now() } = {}) {
  const isExpiry = String(reason || "").toLowerCase() === "expired";
  const keepsAccess = !isExpiry && isFuture(endsAt, now);

  if (!keepsAccess) {
    return {
      tier: "free",
      subscriptionStatus: isExpiry ? "expired" : "cancelled",
      proExpiresAt: null,
      cancelAtPeriodEnd: 1,
      // null means "leave whatever is already stored" — the caller COALESCEs,
      // so an expiry event does not blank out the date the UI displays.
      currentPeriodEnd: parseIso(endsAt) === null ? null : new Date(parseIso(endsAt)).toISOString(),
      keepsAccess: false,
    };
  }

  return {
    tier: "pro",
    subscriptionStatus: "cancelled",
    proExpiresAt: paidThrough(endsAt),
    cancelAtPeriodEnd: 1,
    currentPeriodEnd: new Date(parseIso(endsAt)).toISOString(),
    keepsAccess: true,
  };
}

/**
 * `subscription_updated` carries the provider's own status string. LS fires it
 * alongside `subscription_cancelled`, in no guaranteed order, so this must
 * agree with resolveCancellation() for the same subscription — otherwise the
 * customer's expiry date depends on which webhook happened to land last.
 *
 * @param {object}  input
 * @param {string=} input.status        Provider status.
 * @param {string=} input.periodEndIso  Normalised renews_at / ends_at.
 * @param {number=} input.now           Injected clock, for tests.
 */
function resolveSubscriptionUpdate({ status, periodEndIso, now = Date.now() } = {}) {
  const normalized = typeof status === "string" ? status.toLowerCase() : "";
  const isCancelled = CANCELLED_STATUSES.includes(normalized);
  const withinPaidPeriod = isFuture(periodEndIso, now);
  const isPro = ACTIVE_STATUSES.includes(normalized) || (isCancelled && withinPaidPeriod);

  let proExpiresAt;
  if (isCancelled) {
    // Grace applies on the cancellation branch so that this and
    // resolveCancellation() write the SAME instant for the same subscription.
    proExpiresAt = withinPaidPeriod ? paidThrough(periodEndIso) : null;
  } else if (isPro) {
    // Keep the provider's exact date — subscription-payment deliberately
    // over-extends and relies on this event to snap the clock back to
    // renews_at, so grace here would fight that. The only change from the
    // original behaviour is the null case, which used to write a NULL clock
    // next to tier='pro' and therefore never expired at all.
    proExpiresAt = renewalExpiry(periodEndIso, { now, graceDays: 0 });
  } else {
    proExpiresAt = periodEndIso ?? null;
  }

  return { tier: isPro ? "pro" : "free", proExpiresAt, isPro };
}

module.exports = {
  GRACE_DAYS,
  UNDATED_HORIZON_DAYS,
  renewalExpiry,
  ACTIVE_STATUSES,
  CANCELLED_STATUSES,
  paidThrough,
  isFuture,
  resolveCancellation,
  resolveSubscriptionUpdate,
};
