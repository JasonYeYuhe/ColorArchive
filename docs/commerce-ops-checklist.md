# Commerce Launch Checklist

Last updated: 2026-03-20

## What Codex Can Verify In Repo

- checkout URLs and return-path config are consistent in `src/lib/checkout-config.ts`
- `/thanks/` and `/cancel/` copy matches the intended Lemon Squeezy flow
- pack pages, support pages, and public docs describe the current catalog state consistently
- email copy does not contradict the current product catalog

## What You Need To Do Outside The Repo

These steps require Lemon Squeezy / browser access and cannot be completed from code alone.

## Lemon Squeezy

Complete these steps for store activation and live handoff:

1. If your store has already been approved, use the bottom-left `Test mode` toggle to switch to Live mode. If the store is still under review, Live mode will not be available yet.
2. Open each of the 7 products and check `Confirmation modal`:
   - `Button text`: a clear post-purchase CTA such as `Go to ColorArchive`
   - `Button link`: `https://colorarchive.me/thanks/`
3. Open each of the 7 products and check `Email receipt`:
   - keep the receipt CTA pointing to `https://colorarchive.me/thanks/`
4. Confirm pricing is correct:
   - Seasonal: Spring 2026: `¥99`
   - Palette Pack Vol. 1: `¥299`
   - Dark Mode UI Kit: `¥499`
   - Creator Bundle: `¥799`
   - Brand Color Starter Kit: `¥999`
   - Complete Archive Token Set: `¥1,499`
   - All Access Bundle: `¥2,799`
5. Confirm discount code `FIRSTPACK` is still active and valid on all products.
6. Do not block launch on Lemon Squeezy `Email marketing` or `Broadcasts`. They are optional for this project because operational emails are already handled by the ColorArchive API + Resend flow.

## Purchase Smoke Test

Run one real or test-card flow after the settings update:

1. Open one single-pack checkout URL from `src/lib/checkout-config.ts`.
2. Complete checkout.
3. Verify the post-purchase confirmation flow gives the buyer a clear path to `https://colorarchive.me/thanks/` via the confirmation modal button and/or receipt CTA.
4. Verify the buyer receives:
   - receipt email
   - download email
5. Open `/login/` and confirm order history and resend actions look correct.
6. Repeat a second pass by cancelling checkout and note the actual Lemon Squeezy behavior. Current expectation: there may not be a product-level cancel redirect in the hosted product UI, so this is an observation step rather than a strict pass/fail URL match.

## Record The Result

After the smoke test, note the result in:

- `PRODUCT_MEMO.md` if the commerce state materially changed
- `HANDOFF.md` if the test uncovered a deploy, regression, or follow-up task

## Optional Email Marketing

You do not need to enable Lemon Squeezy `Email marketing` or create a `Broadcast` to launch the current ColorArchive flow.

Use it only if you later want Lemon Squeezy to manage subscriber campaigns directly.

## Search Console

1. Verify `https://colorarchive.me/` in Google Search Console.
2. Submit sitemap: `https://colorarchive.me/sitemap.xml`
3. Check:
   - indexing coverage
   - canonical selection
   - mobile usability
   - any accidental indexing of `/favorites/`, `/recent/`, `/palette/`, `/login/`, `/analytics/`

## Post-Update Review

After the above steps, recheck:

- `/thanks/` and `/cancel/` copy in the live site
- bundle pricing and `Save 32%` messaging on `/packs/` and `/packs/all-access-bundle/`
- free-pack to paid upgrade links
- webhook-driven order emails after a live purchase
