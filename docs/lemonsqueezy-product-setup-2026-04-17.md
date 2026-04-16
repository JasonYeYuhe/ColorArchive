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

Please copy-paste each product's variant UUID from LS dashboard in this format:

```
monthly:  <UUID>
yearly:   <UUID>
lifetime: <UUID>
```

Variant UUID looks like: `59d0c0b3-a368-440b-942c-0c53a8f3d64b` (36 chars with dashes). You find it on the product's page in LS, usually in the URL or in a "Variant ID" field.

Once you send these, I will:
1. Update `src/lib/checkout-config.ts:79-83` — `lsVariantIds` map
2. Update `src/lib/checkout-config.ts:45-50` — lifetime price strings to ¥19,999 / $199.99
3. Update `src/lib/checkout-config.ts:49` — `regularPrice` (or remove if you drop early bird)
4. Update `src/components/support-page.tsx:21` — FAQ answer about lifetime price
5. Commit as a single commit per one-commit-per-push rule, push to trigger one Vercel build
6. Smoke-test the checkout URLs

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
