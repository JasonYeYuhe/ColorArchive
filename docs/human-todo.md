# Human TODO — ColorArchive

> Things the autopilot can't do. Jason handles these when he picks up the project.
> Last updated: 2026-04-14

## High Priority
- [ ] Test full Stripe purchase flow end-to-end (palette pack + Pro subscription) before marketing push
- [ ] Verify Stripe webhook endpoint is receiving events in production (check Stripe Dashboard → Webhooks → Logs)
- [ ] Confirm all 9 Stripe price IDs in `checkout-config.ts` match live Stripe Dashboard products

## Medium Priority — Domain Migration (Phase 2+)
- [ ] Complete Phase 2 migration day execution (see `docs/domain-migration-checklist.md`)
- [ ] Update DO Droplet `.env` with .org values + restart PM2
- [ ] Update Vercel env vars to .org
- [ ] DNS cutover: point colorarchive.org to Vercel
- [ ] Set up 301 redirects from .me to .org
- [ ] Update Google OAuth redirect URIs in Cloud Console
- [ ] Update Instagram API redirect URI in Meta Developer Console
- [ ] Resend: add colorarchive.org domain + SPF/DKIM/DMARC DNS records
- [ ] Google Search Console: add .org property, submit sitemap, domain change tool
- [ ] Lemon Squeezy webhook: update endpoint URL
- [ ] Update external listings: Product Hunt, Indie Hackers, AlternativeTo

## Medium Priority — Marketing
- [ ] TikTok video review — posted but "in review"; follow up if stuck > 48 hours
- [ ] Twitter/X: Post first content thread now that API is configured
- [ ] Pinterest: Verify boards are populating via RSS integration
- [ ] Product Hunt: respond to comments, request reviews from early users
- [ ] YouTube: Consider posting 2nd video (palette walkthrough or color theory explainer)

## Low Priority / Nice to Have
- [ ] Record demo video showing color search, palette builder, export flow
- [ ] Create affiliate/referral landing page for newsletter subscribers
- [ ] Add Google Analytics / Plausible for traffic visibility

## Done
- [x] YouTube video — published
- [x] Twitter/X API — configured
- [x] Pinterest — integrated
- [x] Product Hunt — live listing created
- [x] /trends page — Color Trends 2026 feature page added
- [x] Server email — weekly digest email template added
- [x] Stripe Checkout — fully integrated for all 7 packs + 2 subscription plans
- [x] Stripe webhook fulfillment — backend notification + email confirmation
- [x] VS Marketplace — extension v0.2.0 published (ColorArchiveorg publisher)
- [x] ASC v1.2 — created version, URLs updated to .org (marketing, support, privacy, review email)
- [x] ASC Privacy Policy URL — updated to colorarchive.org/privacy/
- [x] VS Marketplace DNS TXT record — verified, domain ownership confirmed
- [x] Apple Notifications URLs — Production + Sandbox both updated to api.colorarchive.org
- [x] iOS v1.2 (build 3) — built, uploaded, submitted for App Review (2026-04-14)
