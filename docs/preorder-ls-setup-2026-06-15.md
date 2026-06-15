# $49 Pre-order — Lemon Squeezy setup kit (2026-06-15)

> Purpose: flip `/preorder/` from the **email-reservation fallback** to the **real,
> card-required $49 test**. This is the prerequisite for the WTP kill criterion
> (<10 real card pre-orders in 30 days → designer-Pro theory not validated).
> The page already auto-detects the URL — **the only thing left is in your LS account.**

The code side is done: `src/lib/checkout-config.ts` reads
`NEXT_PUBLIC_PREORDER_CHECKOUT_URL`. When it's set, `src/components/preorder-page.tsx`
swaps the email form for a card button automatically. No code change needed from you.

---

## Step 1 — create the product in Lemon Squeezy (~5 min)

LS dashboard → **Products → New product**:

| Field | Value |
|-------|-------|
| Name | `ColorArchive Accessibility Auditor — Pre-order` |
| Pricing model | **Single payment** (one-time, NOT subscription) |
| Price | **$49 USD** |
| Description (paste) | *Pre-order the ColorArchive Accessibility Auditor at the founder price of $49 (regularly $99 at launch). Audit an entire palette or design system for WCAG + color-blindness in one pass, get accessible auto-fixes from the 5,446-color archive, and export a report + corrected tokens. Ships Q3 2026 — full refund if we don't ship by then.* |
| Category / type | Digital product |

Optional but recommended:
- Turn on **"Collect customer name"** so the order list is legible.
- In the product's **confirmation / redirect** setting, send buyers to
  `https://colorarchive.org/thanks/` (the existing success page).

## Step 2 — copy the checkout URL

On the product page → **Share** (or the "…" menu) → copy the **Buy link**. It looks like:
`https://colorarchive.lemonsqueezy.com/checkout/buy/<UUID>`
(same store slug `colorarchive` as the existing Pro product, different UUID.)

## Step 3 — set the env var in Vercel + redeploy

Vercel → project **ColorArchive** → **Settings → Environment Variables**:

- Key: `NEXT_PUBLIC_PREORDER_CHECKOUT_URL`
- Value: the Buy link from Step 2
- Environment: **Production** (tick Preview too if you want to test on a preview URL first)

Then **Deployments → … → Redeploy** the latest production deployment (env vars only take
effect on a new build; this is a one-page change so the build is cheap).

> It's `NEXT_PUBLIC_*`, so the value is baked into the client bundle at build time — that's
> fine, a checkout URL is not a secret. Just remember a redeploy is required for it to apply.

## Step 4 — verify (1 min)

Open `https://colorarchive.org/preorder/`. You should now see a black
**"Pre-order — $49 (founder price)"** button instead of the email field. Click it → it
should open the LS checkout in a new tab. (Don't complete a real purchase yourself; LS
test mode or just confirming the redirect is enough.)

---

## How to read the signal (so you don't need me to query the DB each time)

**Real card pre-orders** = paid orders for this product in the **Lemon Squeezy → Orders**
dashboard. That is the number the kill criterion counts. (Email reservations do NOT count.)

**Funnel events** (first-party + PostHog), to see where people drop:
- `preorder_view` → `preorder_cta_click {from}` → `preorder_checkout_clicked` → `preorder_checkout_redirected`

First-party query (SSH to the Droplet), the same one I ran today:
```bash
ssh root@143.198.85.72 'sqlite3 /root/ColorArchive/server/data.db \
  "SELECT date(created_at) d, event_name, COUNT(*) FROM events \
   WHERE event_name LIKE \"preorder%\" GROUP BY d, event_name ORDER BY d DESC;"'
```
PostHog: project 456902, filter events by name prefix `preorder`.

---

## ⚠️ Reality check (measured 2026-06-15)

As of today the funnel has **0 events** — not because tracking is broken (it isn't;
`pageviews` is at ~800–1000/day and `track()` events land in the DB), but because
**`/preorder/` is getting no traffic.** It's only linked from `/pro/`, `/palette-audit/`,
and `/wcag-audit/`, which are themselves low-traffic.

So turning on the card test is necessary but **not sufficient** — it needs traffic to read.
The two levers that feed it:
1. **The word-to-color WTP paywall** (shipped 2026-06-15) routes the #1 traffic page toward
   Pro — a related paid surface that finally has volume behind it.
2. **Posting the distribution drafts** (`docs/backlink-distribution-drafts-2026-06-14.md`)
   — real external traffic. Still human-only.

## Not in scope here (separate decision, still pending)

The Pro `priceUsd` ↔ JPY mismatch in `src/lib/checkout-config.ts` (¥499 listed as $6.99,
¥19,999 as $199.99) is unrelated to this $49 USD pre-order and is still your call — see
`docs/human-todo.md`. I did not touch it.
