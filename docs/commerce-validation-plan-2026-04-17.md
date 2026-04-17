# Commerce Launch Validation — Dev Plan (2026-04-17)

## Why this, why now

Today we shipped ColorArchive Pro on Lemon Squeezy and closed a P0
security hole in the webhook forwarder. But we have **never run a
real end-to-end purchase through the stack** — not in test mode, not
with a real card. Every piece has been exercised in isolation:

- HMAC signature verification (compile-checked only)
- `/api/webhook` → `/webhooks/subscription-checkout` forwarder (smoke
  tested with a manual curl using the internal secret)
- DB writes to `users`/`orders`/`subscribers` (exercised by Phase 0
  incident curl, not a real LS event)
- Receipt email send via Resend (never sent a real one from the LS path)
- Pro flag flipping in a live browser session (never observed)

Any one of these breaking silently at go-live = revenue on the floor.
Phase 3c's admin dashboard now surfaces the metrics, but until we
actually fire a real LS event we don't know what to trust.

Plus: Gemini flagged during Phase 3c that test-mode orders will
pollute `recent_orders` and 7-day counts once they arrive. I deferred
this as "we don't have test data yet" — but *running* the test is
exactly the activity that creates that data. So this plan loops both
together.

## Non-goals (explicitly deferred)

- ❌ OAuth redirect-URI sweep across Google / Twitter / GitHub etc.
  That's valuable (we caught Pinterest's stale `.me` URI today) but
  it's a separate audit theme.
- ❌ Pro feature usage telemetry / churn signals. Premature without
  paying customers.
- ❌ Paddle / PayPal fallback activation. Already scaffolded; wait
  until we need it.
- ❌ iOS IAP changes. In Apple Review already.
- ❌ New Pro features. Sprint 2 is complete; don't drift.

## Codex review resolution (2026-04-17)

Codex verdict: **ship-with-changes**. Two P0 bugs found in the EXISTING
code that this plan didn't know about:

1. **P0** — `subscription-checkout` never calls
   `sendOrderConfirmationEmail`. Only the Stripe-era
   `order-completed` route does. Every LS purchase today succeeds
   payment-wise but silently skips the receipt email. Every Pro
   buyer gets nothing in their inbox. **Phase A now fixes this.**

2. **P0** — `subscription_updated` contract mismatch. Vercel forwards
   `renewsAt`/`endsAt`, Express reads `currentPeriodEnd`/
   `cancelAtPeriodEnd`. Different names = updates silently fail.
   **Phase A now fixes this too.**

3. **P1** — capture one real LS payload at the Next.js layer BEFORE
   running synthetic replay, so Phase B validates against reality
   not my model. **Phase A now adds raw-payload capture.**

4. **P1** — Resend for ops alerts = single-vendor risk. Switch to
   Slack webhook. **Phase D revised.**

5. **P1** — Phase C should also cancel a subscription, not just buy.
   **Phase C extended.**

The plan is reorganized below with these fixes folded in.

## Plan — 4 phases

### Phase A — Fix existing P0s + test-mode instrumentation (~3h)

Two fix buckets combined because they all touch the same webhook
path and must be validated together.

**P0 FIXES (Codex-caught, pre-existing):**
- Add `sendOrderConfirmationEmail()` call to
  `/webhooks/subscription-checkout` so LS buyers actually receive a
  receipt. Adapt the message for subscriptions (no download URL;
  thank-you + manage-billing link instead).
- Align `subscription_updated` payload contract. Either:
  (a) change Next.js forwarder to send `currentPeriodEnd` +
      `cancelAtPeriodEnd`, or
  (b) change Express to accept `renewsAt`/`endsAt`.
  Going with (b) because it keeps the Next.js side LS-shape-pure
  (future other-provider adapters can reuse the same Next shape).

**INSTRUMENTATION:**
- `app/api/webhook/route.ts`:
  - Read `attrs.test_mode` from LS events, forward as
    `testMode: bool`
  - **Raw payload capture** (new, per Codex P1): on every event,
    POST the raw body + headers to `/webhooks/raw-log` on Express
    so we have a real payload file to replay from in Phase B.
- `server/routes/webhook.js`:
  - Accept `testMode` on all three subscription handlers
  - New `/raw-log` endpoint (bearer-gated via INTERNAL secret) that
    writes raw events to `server/.ls-event-log.jsonl`, capped at
    last 50 events, rolling
- `server/db.js` — migrations (idempotent):
  - `ALTER TABLE orders ADD COLUMN is_test INTEGER DEFAULT 0`
  - `ALTER TABLE users ADD COLUMN is_test INTEGER DEFAULT 0`
  - `ALTER TABLE subscribers ADD COLUMN is_test INTEGER DEFAULT 0`
    (per Codex — downstream metrics may use subscriber growth)
  - Wrap in try/catch so existing columns don't throw
- `server/routes/admin.js`:
  - `/autopilot-status` excludes `is_test=1` rows by default
  - Expose `?includeTest=true` query param for verifying test
    purchases
  - Response includes a `test_rows_hidden_count` field so dashboard
    can surface a visible badge
- Admin page (`admin-autopilot-page.tsx`):
  - "Show test rows" toggle
  - Amber chip on test rows
  - "N test rows hidden" badge when filter is active

**Verification:** unit-check migrations are idempotent. Dashboard
shows 0 test orders before any real one fires. SSH curl verifies
raw-log captures anonymous event (after first real webhook fires).

**Risk mitigation:** migrations run in `server/db.js` at module-load
BEFORE route binding. Codex confirmed: Express requires db.js at top
level, then binds routes, then `app.listen()`. No race.

### Phase B — Synthetic webhook validation (~2.5h, fully automatable)

**Goal:** prove the full HMAC + forwarder + fulfillment + email chain
works without waiting for a real buyer. One script that generates
correctly-signed LS payloads, fires them at prod, observes each step.

**Changes:**
- `scripts/validate-ls-webhook.mjs` — standalone Node script that:
  - Loads `LEMONSQUEEZY_WEBHOOK_SECRET` from local `.env.local`
  - Crafts 4 synthetic payloads (subscription_created Monthly,
    subscription_created Yearly, order_created Lifetime,
    subscription_cancelled) matching the real LS v1 event shape +
    `test_mode: true`
  - Computes SHA-256 HMAC, sends to `https://colorarchive.org/api/webhook`
  - After each send, queries
    `GET /admin/autopilot-status?includeTest=true` (session-auth, we
    pass a pre-captured session cookie) to verify the DB row landed
    correctly
  - Prints a pass/fail grid for all 4 events

**Verification:** Script exits 0 only if all 4 events produce the
expected effect. Re-runs are idempotent (same event_id → dedup).

**Known risks / things to check:**
- HMAC verification path in `verifySignature` (Phase 0) — the synthetic
  payload must match LS's exact `event.meta + event.data` shape or
  signature fails
- Internal secret — script doesn't need it; Vercel does the forwarding
- Email send — Resend will actually send a real email. Target a
  burner inbox we control, not a real-looking buyer address. Plan's
  script uses `test+ls-validation@colorarchive.org` as the To address
  so Namecheap forwarding routes it to our inbox for visual inspection
- Test-mode LS events may or may not include a real `customer_id` —
  check that the DB row handles the missing case

**What this can catch that Phase A alone can't:**
- HMAC signature mismatch (would have been silent in prod)
- `order_created` Lifetime branch's variant-name detection logic
  (currently `attrs.first_order_item?.variant_name?.includes("lifetime")
  ?? attrs.variant_name?.includes("lifetime") ?? false`) — brittle
  path if LS payload shape drifts
- Fulfillment-failure 500 → what does LS actually do on our non-200?
  Answer: retries with exponential backoff. We should verify our 500
  path is non-lossy (webhook will be re-delivered).

### Phase C — User-driven real test purchase (~30min user time, I observe)

**Goal:** final go-live gate. Human clicks "Buy" in the live LS
checkout with the test card. I watch logs + DB + email in real time,
document what happens.

**Steps (user):**
1. In LS dashboard, enable "Test mode"
2. Visit
   `https://colorarchive.lemonsqueezy.com/checkout/buy/771b252b-14d2-45ed-b4d5-b9f39f0883f8`
3. Pick Monthly. Pay with test card `4242 4242 4242 4242`, any
   future expiry, any CVC
4. Ping me when the redirect lands on `/thanks`

**I verify (while user goes through it):**
- `pm2 logs colorarchive-server -f` shows the webhook flow in real
  time (I tail it)
- DB row appears in `orders` + `users.tier='pro'`, both with
  `is_test=1`
- Resend logs show the receipt email was sent
- User's browser shows the Pro-active state on the `/thanks` page

**Repeat for Yearly + Lifetime** (3 total test purchases, each ~2min
of actual user time). Document the 3 in
`docs/ls-commerce-validation-2026-04-17.md` (extending the Phase 0 doc).

### Phase D — Webhook failure alerting (~1.5h, optional)

**Goal:** if a future webhook 500s in prod, we learn about it without
grepping logs. Simple email alert to the admin.

**Changes:**
- `server/routes/webhook.js` — on any fulfillment error in the
  internal-forwarded path, send `sendOperatorAlertEmail()` via the
  existing Resend client. Include the event_id, endpoint, error.
- Rate limit: one alert per minute max, to avoid email storms on a
  persistent bug.

Skip if Phase C reveals issues we need to fix first; ship only after
Phase A–C green.

## Rollout

- Phase A: one commit, one Vercel push, SSH pull + pm2 restart. Small.
- Phase B: second commit (the validation script), local execution
  (not deployed), same-repo. I run it, capture output, update the
  validation doc.
- Phase C: human execution, no code commits unless we find bugs. If
  bugs, hotfix commits go through the same AI-review loop.
- Phase D: one commit if we decide to ship.

Each phase gets a Gemini 3 Pro review between commit and merge, per
the user's requested cadence.

## Risks I want Codex to pressure-test

1. **Real revenue risk during validation.** Anything I do in Phases
   A–B touches live prod. Codex should check whether Phase A's
   `is_test` migration has any race with an incoming real webhook
   during the pm2 restart window. My plan: do the migration inside
   the Express boot, before route binding, so no request can be
   accepted mid-migration.
2. **Synthetic payload shape.** LS v1 events nest a lot of fields.
   If my synthetic differs from real, HMAC passes (I sign whatever
   I send) but fulfillment crashes on missing fields, and we'd
   think the path works when it doesn't. Phase C with a real LS
   event is the cross-check — is that enough or should Phase B also
   replay a captured real LS payload from the first real purchase?
3. **Rate limits.** Firing 4 synthetic webhooks in quick succession —
   any rate limiter that might 429 us?
4. **Dashboard filter default.** I'm defaulting the admin dashboard
   to hide test rows. Is that the right default or should the
   default show all and let operator opt out?
5. **Email CC safety.** Phase B sends real emails to a route we
   control. Any risk of misrouting to buyer@example.invalid or
   similar by accident? Mitigation: script uses a single hardcoded
   To address.

## Open questions

1. Is the `LEMONSQUEEZY_WEBHOOK_SECRET` on Vercel actually the same
   one LS Dashboard shows? Both were set 14 days ago, no drift
   indicator. Phase B implicitly tests this because HMAC would fail
   otherwise.
2. Does LS retry 500s? Confirmed yes per LS docs — Phase D should
   still have minimal idempotency so dedup kicks in after retry.
3. Should test_mode purchases count toward Product Hunt / review
   metrics? Answer: no, filter everywhere they surface.

## Scope calibration

This is a smaller plan than the autopilot theme. Intentional. Commerce
validation is the higher-urgency gap but a smaller surface. After this
lands we can pick the next theme (OAuth sweep, Pro telemetry, mobile
polish).
