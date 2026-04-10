# Commerce Launch Checklist

Last updated: 2026-03-28

## What Codex Can Verify In Repo

- checkout URLs and return-path config are consistent in `src/lib/checkout-config.ts`
- `/thanks/` and `/cancel/` copy matches the intended Stripe Checkout flow
- pack pages, support pages, and public docs describe the current catalog state consistently
- email copy does not contradict the current product catalog

## What You Need To Do Outside The Repo

These steps require Stripe Dashboard / browser access and cannot be completed from code alone.

## Stripe

Complete these steps for store activation and live handoff:

1. Verify all 7 product prices exist in Stripe Dashboard → Products and match `checkout-config.ts`.
2. Verify the 2 subscription prices (monthly ¥499, yearly ¥3,999) exist and match `proSubscriptionConfig`.
3. Confirm the webhook endpoint is configured:
   - URL: `https://colorarchive.org/api/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Confirm `STRIPE_WEBHOOK_SECRET` is set in Vercel environment variables.
5. Confirm `STRIPE_SECRET_KEY` is set in Vercel environment variables.

## Purchase Smoke Test

Run one real or test-card flow after setup:

1. Open one single-pack checkout from the `/packs/` page.
2. Complete checkout with Stripe test card (`4242 4242 4242 4242`).
3. Verify redirect to `/thanks/` after successful payment.
4. Verify the buyer receives confirmation email via the backend webhook fulfillment.
5. Open `/login/` and confirm order history and resend actions look correct.
6. Cancel a checkout and verify redirect to `/cancel/`.

## Record The Result

After the smoke test, note the result in:

- `PRODUCT_MEMO.md` if the commerce state materially changed
- `HANDOFF.md` if the test uncovered a deploy, regression, or follow-up task

## Search Console

1. Verify `https://colorarchive.org/` in Google Search Console.
2. Submit sitemap: `https://colorarchive.org/sitemap.xml`
3. Check:
   - indexing coverage
   - canonical selection
   - mobile usability
   - any accidental indexing of `/favorites/`, `/recent/`, `/palette/`, `/login/`, `/analytics/`

## Post-Update Review

After the above steps, recheck:

- `/thanks/` and `/cancel/` copy in the live site
- bundle pricing and savings messaging on `/packs/` and `/packs/all-access-bundle/`
- free-pack to paid upgrade links
- webhook-driven order emails after a live purchase
