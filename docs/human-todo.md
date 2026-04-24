# Human TODO — ColorArchive

> Things the autopilot can't do. Jason handles these when he picks up the project.
> Last updated: 2026-04-24

## Closed from 2026-04-24 review marathon

- [x] **Frontend Sentry** — RESOLVED. The previous session's verification
      method was wrong: @sentry/nextjs v10 does not expose a
      `globalClient` field on `window.__SENTRY__[version]`. The correct
      field is `defaultCurrentScope._client`. Confirmed on current
      production deploy: client is attached (projectId `4511272715812864`),
      transport is bound to the `/monitoring` tunnel, `enabled: true`,
      and a captureMessage ping from the browser produced a POST to the
      tunnel endpoint (verified via `performance.getEntriesByType('resource')`).
      The empty-DSN bug fixed in review round 3 was real — Sentry has
      been capturing since that redeploy. Only the verification was broken.

- [ ] **React hydration error #418 on /palette-audit/** — REOPENED.
      Initial pass with default (English) locale showed 0 errors, so I
      closed it. Follow-up with `localStorage["colorarchive-locale"]="zh"`
      reproduced `Minified React error #418; args[]=HTML` in the console
      on a subsequent reload (stack points to chunk
      `8df248f72ed30c99.js`). Other pages with the same locale
      (`/all-colors/`, `/`) did NOT error — so the mismatch is scoped to
      `/palette-audit/`. On further reloads after fixing locale state
      the error stopped firing, suggesting an intermittent race between
      the head `localeScript` (flips `<html lang>` to `zh` pre-React)
      and LocaleProvider (initial state `"en"`, swaps in `useEffect`).
      Not a blocker for English users; zh users hit it sporadically.
      Next step: add the Chinese-locale path to `e2e/` or manually
      bisect by temporarily removing the head `localeScript` and seeing
      if the error disappears.

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
