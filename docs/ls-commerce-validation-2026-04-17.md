# Lemon Squeezy Commerce Validation — Phase 0 (2026-04-17)

## Summary

**Status: CRITICAL BUG FOUND AND FIXED.** The Express webhook route was
wide open to the public internet — any unauthenticated POST to
`https://api.colorarchive.org/webhooks/subscription-checkout` could mint
Pro access for any email. No prior exploitation found in the database
(0 fraudulent Pro users at time of discovery).

## How it was found

Phase 0 validation of the Lemon Squeezy purchase flow surveyed env
configuration as the first step. Two findings immediately stood out:

1. `INTERNAL_WEBHOOK_SECRET` was **not set on the Droplet** — only
   `LS_WEBHOOK_SECRET` (unrelated name), `RESEND_API_KEY` were found
2. `NODE_ENV` was **not set on the Droplet**, so Node defaulted to
   `undefined`

Looking at `server/routes/webhook.js:11-27`:

```js
function verifyInternal(req, res, next) {
  if (!INTERNAL_SECRET) {
    if (process.env.NODE_ENV === "production") {
      return res.status(500).json({ error: "Server misconfiguration" });
    }
    console.warn("[webhook] INTERNAL_WEBHOOK_SECRET not set — allowing request (dev mode)");
    return next();   // ← the hole
  }
  // ... normal check
}
```

With `INTERNAL_SECRET` empty AND `NODE_ENV !== "production"`, **every**
`/webhooks/*` request hit the "dev mode allow" branch and was accepted
without any authentication.

## Reproduction

```bash
curl -sS -X POST "https://api.colorarchive.org/webhooks/subscription-checkout" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.invalid","plan":"monthly","subscriptionId":"fake","provider":"lemonsqueezy"}'
# → {"ok":true} status:200

# Confirmed the DB updated:
sqlite3 data.db "SELECT id, email, tier FROM users WHERE email='test@example.invalid'"
# → 6|test@example.invalid|pro
```

One curl, one row of fraudulent Pro access. No rate limit, no
attribution, no email verification.

## Fix

Three simultaneous changes applied on the Droplet via SSH:

1. Set a new 32-byte-hex `INTERNAL_WEBHOOK_SECRET` (value kept local)
2. Set `NODE_ENV=production` so even a future secret clear can't trip
   the dev-mode bypass
3. Restarted `pm2 restart colorarchive-server --update-env`

The same secret was set in Vercel's production env via
`vercel env add INTERNAL_WEBHOOK_SECRET production`, so the Next.js
webhook forwarder in `app/api/webhook/route.ts:30-36` adds a matching
`x-internal-secret` header when forwarding.

## Verification

After the fix:

```bash
# Unauth attempt
curl -sS -X POST api.colorarchive.org/webhooks/subscription-checkout ...
# → {"error":"Unauthorized"} status:401  ✓

# Authed with correct secret
curl -sS -H "x-internal-secret: $SECRET" -X POST ... ✓ 200
```

Database cleanup: 2 test rows (both `*@example.invalid`) deleted from
users, orders, subscribers tables. Final state: 4 legitimate users,
0 Pro users (no real paying customers yet).

During this session I also **rotated `ADMIN_API_TOKEN`** after
accidentally echoing the previous value in a debug grep output. The
old token is now rejected. Scope was limited (only gated Pinterest
admin routes + Instagram /publish — no commerce impact) but rotated
as hygiene.

## What still needs manual verification

The Vercel environment change doesn't take effect until a deploy.
This commit push forces one. After the deploy completes:

- **User must do one test-mode purchase** in LS to confirm the full
  chain works end-to-end. Without this, we can't rule out a second
  latent bug in the signature verification or the backend handlers.
- In LS dashboard, **verify the `LEMONSQUEEZY_WEBHOOK_SECRET`** set
  there matches the one in Vercel production env (it was set 14 days
  ago and nothing indicates drift, but untested).

## Detections we should add (follow-up, Phase 3c territory)

- Alert if a non-test `/webhooks/*` POST returns non-200 in prod
- Daily count of new Pro users vs. paid LS orders in the last 24h —
  any delta indicates fraud or webhook drops

## Timeline

- 11:34 UTC — exploit confirmed
- 11:37 UTC — Droplet secret + NODE_ENV set, pm2 restarted
- 11:40 UTC — ADMIN_API_TOKEN rotated after leak
- 11:42 UTC — Vercel env var added
- 11:42 UTC — DB cleaned
- 11:45 UTC — this doc committed to trigger Vercel redeploy

---

## Post-P0 — Phase A + B commerce validation (same day, 13:00 UTC)

After the P0 fix, ran the full commerce-validation plan
(`docs/commerce-validation-plan-2026-04-17.md`). Codex caught TWO
more pre-existing P0s during plan review, both fixed inline:

1. `/webhooks/subscription-checkout` never sent a receipt email
   (`server/routes/webhook.js` only called `sendOrderConfirmationEmail`
   on the legacy Stripe `/order-completed` route). Added a new
   `sendProSubscriptionEmail()` function + wired it into the LS path.
2. `subscription_updated` contract mismatch. Vercel forwards
   `renewsAt`/`endsAt`; Express was reading `currentPeriodEnd`/
   `cancelAtPeriodEnd`. Aligned Express to accept both shapes.

Plus:
- Added `is_test` columns on orders/users/subscribers (Gemini P1) so
  synthetic test rows don't pollute real metrics.
- `/admin/autopilot-status` defaults to hiding `is_test=1` rows;
  `?includeTest=true` to show them. Admin page gained a checkbox +
  amber "test" chip.
- Added `/webhooks/raw-log` endpoint that captures forwarded LS
  payloads to `server/.ls-event-log.jsonl` (rolling, cap 50 entries,
  0o600). Gives the validator script a real payload to replay
  against in the future.
- Wrote `scripts/validate-ls-webhook.mjs` — HMAC-signs 5 synthetic
  events (Monthly/Yearly subscription_created, Lifetime order_created,
  subscription_updated active, subscription_cancelled) and fires at
  prod. Supports `--replay` against a captured real payload with
  byte-faithful resigning.

### First full-chain validation — 13:14 UTC (passed)

Ran `node scripts/validate-ls-webhook.mjs`. All 5 events returned
200. DB check:
- `users` row created with tier=pro, is_test=1
- 3 `orders` rows: Monthly 499 JPY, Yearly 3999, Lifetime 19999 —
  all is_test=1
- `subscribers` row with source=lemonsqueezy-subscription, is_test=1
- PM2 logs show 3 successful receipt email sends via Resend
- `subscription_updated` correctly populated period + cancelAtEnd
  fields
- `subscription_cancelled` correctly downgraded

Test rows cleaned immediately after; prod DB back to 0 Pro users
awaiting the first real buyer.

---

## Phase C — user-driven real test purchase (TODO)

Final go-live gate. Human-in-the-loop because LS test-mode checkouts
require clicking through the LS-hosted page with a test card.

### Steps

1. In the LS dashboard, toggle **Test mode** on (left-side rail →
   the store profile → Settings → "Test mode"). All checkouts done
   while in test mode produce real events that hit our webhook but
   no real money moves.

2. In an **incognito** window (avoid cached Pro state), open:
   ```
   https://colorarchive.lemonsqueezy.com/checkout/buy/771b252b-14d2-45ed-b4d5-b9f39f0883f8
   ```

3. Pick **Monthly**. Pay with test card `4242 4242 4242 4242`,
   any future expiry, any CVC, any ZIP.

4. Expect to land on `https://colorarchive.org/thanks/`.

5. Jason pings Claude (or anyone present): "Monthly done."
   Claude tails `pm2 logs colorarchive-server` and reports whether
   the webhook reached Express, the DB row landed, and the email
   fired.

6. Repeat with **Yearly** and **Lifetime**.

7. Cancel the Monthly subscription from the LS test-mode dashboard.
   Confirm the `/admin/autopilot/` dashboard's `recent_orders` shows
   the cancel event (via subscription_updated fields).

8. Delete the 3 test rows from the DB after all observations captured:

   ```bash
   ssh root@143.198.85.72 "sqlite3 /root/ColorArchive/server/data.db \
     'DELETE FROM orders WHERE is_test = 1;
      DELETE FROM users WHERE is_test = 1;
      DELETE FROM subscribers WHERE is_test = 1;'"
   ```

### Why this is still needed after Phase B passed

Phase B proved our fulfillment chain handles HMAC-signed, valid
payloads through to DB + email. It did NOT prove:
- Real LS-hosted checkout flow actually triggers the webhook (could
  be misconfigured in dashboard)
- Thanks-page redirect renders Pro-active state to the browser
- Payment processor (LS) sees a successful test charge
- Return-customer flow on second attempt

Those four surface areas are only exercised by a real end-to-end
purchase through the LS-hosted checkout page.
