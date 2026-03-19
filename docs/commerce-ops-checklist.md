# Commerce Ops Checklist

Last updated: 2026-03-19

## Lemon Squeezy

Complete these steps for the live store:

1. Open `app.lemonsqueezy.com` and disable `Test mode` at `Settings -> Store`.
2. Open each of the 7 products and set:
   - `Thank you URL`: `https://colorarchive.me/thanks/`
   - `Cancel URL`: `https://colorarchive.me/cancel/`
3. Confirm pricing is correct:
   - Seasonal: Spring 2026: `¥99`
   - Palette Pack Vol. 1: `¥299`
   - Dark Mode UI Kit: `¥499`
   - Creator Bundle: `¥799`
   - Brand Color Starter Kit: `¥999`
   - Complete Archive Token Set: `¥1,499`
   - All Access Bundle: `¥2,799`
4. Confirm discount code `FIRSTPACK` is still active and valid on all products.

## Purchase Smoke Test

Run one real or test-card flow after the settings update:

1. Open one single-pack checkout URL from `src/lib/checkout-config.ts`.
2. Complete checkout.
3. Verify the browser returns to `https://colorarchive.me/thanks/`.
4. Verify the buyer receives:
   - receipt email
   - download email
5. Open `/login/` and confirm order history and resend actions look correct.
6. Repeat a second pass by cancelling checkout and verify return to `https://colorarchive.me/cancel/`.

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
