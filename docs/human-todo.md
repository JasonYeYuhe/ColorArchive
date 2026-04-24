# Human TODO — ColorArchive

> Things the autopilot can't do. Jason handles these when he picks up the project.
> Last updated: 2026-04-24

## Parked from 2026-04-24 review marathon

- [ ] **Frontend Sentry still not capturing events despite 4 layers of fixes.**
      DSN correctly set on Vercel; bundle contains our config + DSN IDs;
      Sentry SDK loaded at runtime; but `Sentry.init()` never creates a
      hub. Likely a @sentry/nextjs v10 + Next.js 16 + Turbopack
      interaction. Next step: enable Sentry `debug: true` in the config
      and inspect console; or open a Sentry support ticket with the
      deploy-id repro. Server-side Sentry on Droplet works fine.
      See [docs/autopilot-log.md](./autopilot-log.md) 2026-04-24 17:50
      for full trail.

- [ ] **React hydration error #418 on /palette-audit/** (possibly
      other pages — unaudited). Surfaced in Chrome MCP during the Sentry
      verification. Separate bug, not caused by Sentry wiring. Candidates:
      locale mismatch, SAMPLE_INPUT render-time divergence, or a Week 3
      a11y change producing different server/client output. Needs fresh
      eyes.

## P0 — Blocking real users today
- [x] **GCP OAuth Console** — ~~add `.org` redirect URI~~ **VERIFIED RESOLVED
      2026-04-24**. Redirect URI, JS origin, and Authorized domain all already
      registered (last used 2026-04-15). Consent screen renders cleanly at
      `https://api.colorarchive.org/auth/google/start`. See
      [docs/oauth-redirect-fix-plan.md](./oauth-redirect-fix-plan.md) top banner for
      verification evidence. If a user still reports the 400, have them hard-refresh
      or clear `accounts.google.com` cookies — cached error page.
- [ ] **StoreKit sandbox purchase test**: open Xcode → run iOS app against sandbox tester
      → attempt Pro purchase. Watch `ssh root@143.198.85.72 'pm2 logs colorarchive-api
      --lines 40 --nostream'` for `[DEPRECATION] apple-purchase got JSON (not JWS)`.
      If that line appears the backend defensive parser is covering for field iOS
      builds — confirm current iOS HEAD sends real JWS, then submit v1.2 to App Store.

## Week 1 done (2026-04-24) — reference only
- [x] LS account-page "Manage subscription" unblocked (provider-aware routing)
- [x] SQLite backups confirmed on Droplet; runbook at [docs/backup-runbook.md](./backup-runbook.md)
- [x] Privacy / Terms / Refund / Commerce-Disclosure / README rewritten to LS + Apple
- [x] Instagram webhook HMAC verified (was unauth'd — plugged 2026-04-24)
- [x] ~~Stripe flow / webhook / price IDs~~ — replaced by Lemon Squeezy; validated 2026-04-17

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
