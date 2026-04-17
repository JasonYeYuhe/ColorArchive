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
