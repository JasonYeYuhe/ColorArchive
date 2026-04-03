# ColorArchive Business Model Transition Proposal

## Drop Product Packs, Go Pure Subscription + Lifetime

**Date:** 2026-04-03
**Status:** Draft — Pending Review (Gemini + Codex)

---

## 1. Current Model Summary

| Revenue Stream | Pricing | Status |
|---|---|---|
| Palette Pack Vol. 1 | ¥599 one-time | Live (Gumroad) |
| Brand Starter Kit | ¥1,499 one-time | Live |
| Creator Bundle | ¥999 one-time | Live |
| Complete Archive Token Set | ¥2,499 one-time | Live |
| Dark Mode UI Kit | ¥999 one-time | Live |
| Seasonal: Spring 2026 | ¥299 one-time | Live |
| All Access Bundle | ¥3,999 one-time | Live |
| **Pro Monthly** | **¥499/mo** | **Live (Stripe)** |
| **Pro Yearly** | **¥3,999/yr** | **Live (Stripe)** |
| **Pro Lifetime (iOS only)** | **TBD** | **In App Store review** |

**Current complexity:** 7 pack products + 2 subscription tiers + 1 iOS lifetime = 10 SKUs across 2 payment providers (Gumroad + Stripe).

---

## 2. Proposed New Model

**Kill all 7 product packs. Simplify to 3 SKUs:**

| Tier | Price | Platform |
|---|---|---|
| **Pro Monthly** | ¥499/mo ($6.99) | Web (Stripe) + iOS (StoreKit) |
| **Pro Yearly** | ¥3,999/yr ($49.99) | Web (Stripe) + iOS (StoreKit) |
| **Pro Lifetime** | ¥9,999 one-time ($99.99) | Web (Stripe) + iOS (StoreKit) |

**Free tier remains unchanged:** Browse 5,446 colors, copy hex/RGB/HSL, 3-10 AI generations/day, 1 export/day.

---

## 3. What Pro Unlocks (Enhanced)

Move the best pack content into Pro as features rather than downloads:

| Feature | Free | Pro |
|---|---|---|
| Browse all 5,446 colors | Yes | Yes |
| Copy hex/RGB/HSL | Yes | Yes |
| AI palette generation | 3-10/day | Unlimited |
| Export palettes (CSS/Tailwind/JSON) | 1/day | Unlimited |
| **All export formats** (SCSS, SwiftUI, Android, Flutter, Figma tokens, Style Dictionary, CSS-in-JS) | No | Yes |
| **WCAG audit reports** | No | Yes |
| **Full token generator** (50-950 scale) | Preview | Full |
| **Dark mode paired tokens** | No | Yes |
| **Bulk download** (entire collection or archive as ZIP) | No | Yes |
| **Brand usage guides** per collection | No | Yes |
| **Color psychology notes** | No | Yes |
| **AI prompt templates** per palette | No | Yes |
| Image palette save | No | Yes |
| Save projects | Login | Yes |

**Key insight:** The pack content (token files, brand guides, psychology notes, dark mode pairs, AI prompts) becomes an ongoing Pro feature rather than a static download. Users always get the latest version rather than a frozen ZIP.

---

## 4. Why This Is Better

### 4.1 Revenue Model

- **Recurring revenue > one-time sales.** A single Pro yearly subscriber (¥3,999/yr) generates more lifetime value than a one-time All Access Bundle buyer (¥3,999 once, never again).
- **Lifetime option captures "buy once" users.** The ¥9,999 lifetime price is 2.5x the yearly rate — profitable if a user would have subscribed for 2.5+ years, and many users prefer the psychology of "owning" access.
- **No revenue cannibalization.** Currently the ¥3,999 All Access Bundle competes directly with the ¥3,999/yr Pro subscription. Users buy the bundle and skip Pro.

### 4.2 Simplicity

- **10 SKUs → 3 SKUs.** Simpler pricing page, clearer decision for users.
- **One payment provider.** Drop Gumroad entirely, consolidate to Stripe (web) + StoreKit (iOS). Fewer integrations, fewer webhook paths, fewer fulfillment flows.
- **No ZIP file maintenance.** Currently 7 ZIP bundles need to be regenerated when collections change. With Pro, exports are always live and up-to-date.
- **One upgrade path.** Free → Pro. No "should I buy a pack or subscribe?" confusion.

### 4.3 Product Quality

- **Always fresh.** When new collections are added, Pro users get them immediately. Pack buyers are stuck with a frozen ZIP from their purchase date.
- **Cross-platform parity.** iOS app already has this exact model (monthly/yearly/lifetime). Web should match.
- **Better onboarding funnel.** Free trial → Pro conversion is a proven SaaS motion. Pack purchases are impulse-dependent.

### 4.4 Operational Simplicity

- **Remove Gumroad dependency** (saves commission + reduces support surface).
- **Remove pack fulfillment code** (webhook handlers, download email flow, order tracking for packs).
- **Remove 8 pages** (/packs, /packs/[slug] x7, /packs/quiz, /free-pack) — reduces build time and maintenance.
- **Simpler backend** — no need to track individual pack purchases per user, just subscription status.

---

## 5. Migration Plan

### Phase 1: Add Lifetime to Web (1-2 days)
- Add `proLifetime` to `proSubscriptionConfig` in `checkout-config.ts`
- Create Stripe one-time price for lifetime (¥9,999)
- Update Pro page to show 3 options: monthly / yearly / lifetime
- Update UpgradeModal to include lifetime option
- Backend: handle lifetime purchase webhook, set tier to "pro" permanently

### Phase 2: Enhance Pro Features (2-3 days)
- Move pack-exclusive formats into Pro export UI:
  - SwiftUI / Android XML / Flutter / CSS-in-JS exports
  - Style Dictionary / Figma token JSON
  - SCSS maps
- Add bulk download (full collection ZIP, dynamically generated)
- Add dark mode paired token export
- Add brand guide & color psychology as viewable content for Pro users
- Add WCAG audit report download

### Phase 3: Remove Packs (1 day)
- Delete `src/lib/palette-packs.ts`
- Delete `app/packs/`, `app/free-pack/`
- Remove pack components from `src/components/`
- Remove Gumroad config from `checkout-config.ts`
- Remove pack-related webhook handlers
- Remove pack-related Stripe price IDs
- Remove pack ZIP files from `public/downloads/`
- Update sitemap, navigation, footer links
- Set up 301 redirects: `/packs/*` → `/pro`

### Phase 4: Cleanup (1 day)
- Remove Gumroad references from codebase
- Simplify account page (no more order history for packs)
- Update newsletters/guides that reference packs
- Update iOS app marketing to mention web lifetime option
- Deactivate Gumroad products

### Total estimated effort: ~5-7 days

---

## 6. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Existing pack buyers feel cheated | Low (site is new, likely few pack sales) | Offer existing pack buyers a free Pro upgrade for 1 year |
| Some users only want a one-time small purchase (¥299-599) | Medium | Lifetime option at ¥9,999 serves "buy once" mindset. Could also add a "Pro Day Pass" (¥99 for 24h unlimited exports) |
| Loss of low-price-point impulse buys | Medium | Free tier with daily export allowance is the new "try before you buy". The free pack page can become a "free exports" landing page |
| Stripe-only means Apple takes 30% on iOS | Already the case | iOS pricing already accounts for Apple's cut. Web purchases bypass this |
| Users want specific pack content without full Pro | Low | All the pack content becomes Pro features — users get MORE, not less |

---

## 7. Pricing Rationale

| Tier | Price | Comparable SaaS |
|---|---|---|
| Monthly | ¥499/mo (~$7/mo) | Coolors Pro ($5/mo), Adobe Color (free but Adobe CC lock-in) |
| Yearly | ¥3,999/yr (~$50/yr) | Reasonable for design tool, 33% savings vs monthly |
| Lifetime | ¥9,999 (~$100) | ~2.5x yearly. Standard "lifetime = 2-3 years equivalent" pricing. Appeals to indie devs/designers who hate subscriptions |

The lifetime price could also be set at ¥7,999 (2x yearly) for more aggressive conversion, or ¥12,999 (3.25x yearly) for higher margin. ¥9,999 is a good middle ground.

---

## 8. Metrics to Watch Post-Transition

- **Monthly Recurring Revenue (MRR)** — primary KPI
- **Free → Pro conversion rate** — target 2-5% of registered users
- **Lifetime vs subscription split** — if >60% choose lifetime, price may be too low
- **Churn rate** — monthly subscribers canceling
- **Export usage** — are Pro users actually using the enhanced features?

---

## 9. Decision Needed

**Recommended:** Proceed with the transition. The product pack model adds complexity without proportional revenue, and the subscription model aligns with the iOS app's existing architecture.

**Alternative considered:** Keep 1-2 flagship packs (Complete Archive + All Access Bundle) alongside Pro. Rejected because it recreates the same pricing confusion and competes with yearly Pro at identical price points.

---

## 10. Open Questions

1. **Lifetime price:** ¥7,999 / ¥9,999 / ¥12,999? Need to decide before implementation.
2. **Free pack page:** Keep as a lead gen page (free sample exports) or remove entirely?
3. **Existing Gumroad buyers:** How many are there? Do we need a migration path?
4. **Pro trial period:** Should we add a 7-day free trial to reduce friction? Currently trialDays = 0.
5. **Web lifetime payment:** One-time Stripe Checkout session (mode: "payment") vs subscription with 999-year interval?
