# ColorArchive Roadmap

Last updated: 2026-03-20

## Principles

- Keep the core experience lightweight, static-first, and brand-forward.
- Prioritize trust, conversion, and workflow usefulness over feature count.
- Only add product surface area when it creates a clearer reason to visit, stay, or buy.

## Current Priorities

### 1. Commerce Launch Verification

Goal: make the paid catalog feel operationally real, not just visually ready.

Why first:

- The hosted checkout layer is prepared, but the launch still depends on store approval, activation, and one real end-to-end pass.
- Any mismatch across checkout, return URLs, receipts, download emails, and account history directly damages trust.

Codex scope:

- Keep checkout, return-path, and catalog copy consistent across the repo.
- Tighten docs and runbooks so the remaining manual steps are unambiguous.
- Fix trust-breaking messaging mismatches in email, pack surfaces, and public docs.

Needs user:

- Verify all Stripe price IDs match between `checkout-config.ts` and Stripe Dashboard.
- Run one real purchase smoke test and one cancelled checkout pass.

Definition of done:

- All Stripe products and subscriptions are active and correctly priced.
- Successful checkout gives the buyer a clear path to `/thanks/`.
- Cancel behavior is observed and documented accurately.
- Receipt and download emails arrive correctly.
- `/login/` order history and resend actions reflect the purchase.

### 2. Google Login Verification

Goal: verify the first-run auth flow from click to usable account state.

Why next:

- Login is implemented, but trust depends on the first successful real-world pass.
- This also gates confidence in admin allowlist and account-backed favorites sync.

Needs user:

- Complete one first-time Google login with a real allowlisted account.
- Follow `docs/google-auth-checklist.md` during the first smoke test.

### 3. Analytics Decision Layer

Goal: make analytics useful for product and revenue decisions, not just observability.

Targets:

- cohort-over-time views
- retention by source
- buyer-level audit trail
- stronger filtering and search

### 4. Public Content System

Goal: turn `notes`, `guides`, and `updates` into a consistent public publishing layer.

Targets:

- deeper archive structure
- better note-to-guide-to-pack linking
- sustained publishing cadence
- stronger trust and SEO coverage

### 5. Pack Conversion Layer

Goal: help buyers understand which pack to buy and why.

Targets:

- better audience fit framing
- clearer license and usage explanations
- stronger proof, previews, and comparisons

## Next Tier

### 6. Token / Design Tool Integration

- improve Figma / Tokens Studio / CSS / Tailwind handoff paths
- make exports feel like workflow infrastructure, not just downloads

### 7. Trust Surface Expansion

- strengthen `about`, `support`, and product-proof surfaces
- keep public ship history and operational cues consistent

### 8. Cross-Site Recommendation Graph

- extend recommendation logic beyond color detail pages
- connect favorites, recent, families, notes, guides, and packs

### 9. Signature Tooling

- build one or two memorable tools that feel uniquely ColorArchive
- prioritize differentiation over generic utility-page sprawl

### 10. Ongoing Content Expansion

- continue notes, guide, and tag expansion
- keep chronology, sitemap freshness, and public metadata accurate

## Active Sprint

### Sprint: Commerce Launch Verification

In progress now:

1. Align repo copy and lifecycle emails with the actual 7-product catalog.
2. Tighten the launch checklist so the remaining manual store steps are explicit.
3. Prepare the exact user action list needed to finish the external checkout verification.

Repo status update on 2026-03-20:

- Public commerce copy now consistently describes the paid catalog as configured and pending activation, rather than already live.
- Google sign-in now returns through a brief `/login/` success state before forwarding to the requested `next` path.
- Analytics and admin surfaces now have clearer account return links, and public trust pages point to account/orders instead of protected analytics.

## User Action List

These are the actions only you can complete outside the repo:

1. Verify all 9 Stripe prices (7 packs + 2 subscriptions) in Stripe Dashboard.
2. Ensure `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are set in Vercel env vars.
3. Complete one real purchase using Stripe test card after verification.
4. Confirm:
   - buyer is redirected to `/thanks/` after successful checkout
   - receipt email arrives
   - download email arrives
   - `/login/` shows the order
5. Open a checkout and cancel it once, then report the actual behavior you see.
