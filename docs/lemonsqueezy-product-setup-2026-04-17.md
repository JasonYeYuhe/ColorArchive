# Lemon Squeezy Product Setup — 2026-04-17

> **Status:** Previous LS products were cleared after store approval. This doc has everything needed to recreate them.
>
> **Workflow:**
> 1. Jason creates 3 products in LS dashboard using the specs below
> 2. Jason copies each product's variant UUID and sends them back
> 3. Claude updates `src/lib/checkout-config.ts:79-83` with new UUIDs + all price display strings in one commit
> 4. Single push → one Vercel build → LS live

## Store info
- Store slug: `colorarchive`
- Webhook endpoint: `/api/webhook` (already implemented, secret set in `.env.local` as `LEMONSQUEEZY_WEBHOOK_SECRET`)
- All three products should be in the same store under **ColorArchive Pro**

---

## Product 1 — Pro Monthly

| Field | Value |
|---|---|
| Product name | `ColorArchive Pro — Monthly` |
| Product type | Subscription |
| Billing interval | Monthly |
| Price (primary) | **$6.99 USD** |
| Price (JPY) | ¥499 if LS supports multi-currency per variant; otherwise skip |
| Trial | 3 days |
| Description | Unlimited AI palette generations, unlimited exports in all formats, WCAG audit reports, full design token generation (50–950 scale). Cancel anytime. |
| Thank-you redirect | `https://colorarchive.org/thanks` |
| Cancel redirect | `https://colorarchive.org/cancel` |
| Tax category | SaaS / Software (LS handles this automatically if MoR) |
| Downloadable? | **NO** (pure SaaS access) |
| Custom checkout fields | None |

## Product 2 — Pro Yearly

| Field | Value |
|---|---|
| Product name | `ColorArchive Pro — Yearly` |
| Product type | Subscription |
| Billing interval | Yearly |
| Price (primary) | **$49.99 USD** (save 33% vs monthly) |
| Price (JPY) | ¥3,999 |
| Trial | 3 days |
| Description | All Pro features billed yearly — save 33% vs monthly. Unlimited AI palette generations, unlimited exports, WCAG audit reports, full design token generation. |
| Thank-you redirect | `https://colorarchive.org/thanks` |
| Cancel redirect | `https://colorarchive.org/cancel` |
| Downloadable? | NO |

## Product 3 — Pro Lifetime  **[NEW PRICE]**

| Field | Value |
|---|---|
| Product name | `ColorArchive Pro — Lifetime` |
| Product type | One-time purchase (NOT subscription) |
| Price (primary) | **$199.99 USD** (was $99.99 — raised per portfolio review) |
| Price (JPY) | ¥19,999 (was ¥9,999) |
| Early bird? | Up to you — if you keep early bird framing, set regular price at $249.99 / ¥24,999. Or drop early bird, just launch at $199.99. Recommend: drop early bird for cleaner messaging. |
| Description | One-time purchase for permanent Pro access. All current + future features. No recurring charges. 7-day refund window. |
| Thank-you redirect | `https://colorarchive.org/thanks` |
| Cancel redirect | `https://colorarchive.org/cancel` |
| Downloadable? | NO |

---

## After creating — send these back

> ⚠️ **Superseded 2026-09-03 (A5).** This section used to ask for three variant **UUIDs**
> and said they went into an `lsVariantIds` map at `checkout-config.ts:79-83`. **There has
> never been such a map at HEAD** (that line is the tail of `refundPolicy`), and no
> variant-id code path exists anywhere in the repo. Following the old instructions would
> send you looking for a symbol that does not exist. What the code actually reads is three
> **full buy-link URLs**, from env vars. Use the steps below instead.

Copy each plan's **buy link** (a URL, not a UUID) out of Lemon Squeezy:

**LS dashboard → Products → ColorArchive Pro → click the variant → Share → copy link.**

It looks like `https://colorarchive.lemonsqueezy.com/buy/<uuid>` — note `/buy/`, whereas the
current shared product link is `/checkout/buy/`. Send them back in this format:

```
monthly:  https://colorarchive.lemonsqueezy.com/buy/<uuid>
yearly:   https://colorarchive.lemonsqueezy.com/buy/<uuid>
lifetime: https://colorarchive.lemonsqueezy.com/buy/<uuid>
```

They go into these env vars (Vercel → Project → Settings → Environment Variables, and
`.env.local` for local dev). They are `NEXT_PUBLIC_*`, so they are baked in at build time —
**a Vercel redeploy is required for a change to take effect**:

```
NEXT_PUBLIC_PRO_MONTHLY_CHECKOUT_URL
NEXT_PUBLIC_PRO_YEARLY_CHECKOUT_URL
NEXT_PUBLIC_PRO_LIFETIME_CHECKOUT_URL
```

Leaving any of them blank is safe: `getCheckoutUrl()` falls back to the shared product URL
(`checkout-config.ts`), which is exactly today's behaviour — a variant picker on the LS page.
Filling them in is what stops the pressed plan being discarded at the checkout boundary.

Still outstanding if lifetime pricing is revisited:
1. `src/lib/checkout-config.ts` → `proSubscriptionConfig.lifetime` price strings
2. `src/components/support-page.tsx` → FAQ answer about lifetime price
3. Commit as a single commit per the one-commit-per-push rule, push to trigger one Vercel build
4. Smoke-test each of the three checkout URLs

## Webhook check after go-live

After new products are live, do a $0.50 test purchase (or LS test mode) and verify:
- Webhook fires to `/api/webhook`
- User's subscription is recorded in Supabase `subscriptions` table
- Pro features unlock in the UI

## If you want to skip lifetime for now

Portfolio review flagged lifetime as a long-term liability. Alternative: only create monthly + yearly, drop lifetime entirely. SaaS revenue is smoother. If you want to go this route, tell me and I will:
- Remove `lifetime` from `ProPlan` type and `proSubscriptionConfig`
- Remove Lifetime card from `pro-page.tsx`
- Update support/terms/refund-policy pages to remove lifetime references
