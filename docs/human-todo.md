# Human TODO — ColorArchive

> Things the autopilot can't do. Jason handles these when he picks up the project.
> Last updated: 2026-03-23

## High Priority
- [ ] Set up real payment provider (Lemon Squeezy or Stripe) in `src/lib/checkout-config.ts` — *currently placeholder URLs, blocking actual revenue*
- [ ] Configure Pinterest OAuth app credentials — *Pinterest social sharing requires real API keys*
- [ ] Review and publish TikTok admin page (`app/admin/tiktok/`) — *exists as untracked file, needs review before committing*
- [ ] Review and publish terms page (`app/terms/`) — *exists as untracked file, legal content needs human review*

## Medium Priority
- [ ] Set up email sending provider (Postmark/SendGrid) for the server email system — *server/email.js is ready but needs real credentials*
- [ ] Review waitlist page component (`src/components/waitlist-page.tsx`) — *untracked, needs decision on whether to deploy*
- [ ] Review launch page (`src/components/launch-page.tsx`) — *untracked, assess if needed*
- [ ] Add real Figma plugin to Figma Community — *plugin code exists in `figma-plugin/`, needs community submission*
- [ ] Set up analytics tracking (GA4 or Plausible) — *no analytics currently active on frontend*

## Low Priority / Nice to Have
- [ ] Add Open Graph images for individual color pages — *currently uses generic OG image*
- [ ] Consider adding a "Collections" featured section to the homepage — *collections content is strong at 49 entries*
- [ ] Review duplicate download files in `public/downloads/` — *several files have numbered copies (e.g., "complete-archive 2.zip") that may be outdated*
- [ ] Evaluate whether `src/lib/i18n-merged.ts`, `i18n-part1.ts`, `i18n-part2.ts` are used or can be cleaned up — *these appear as untracked files*

## Done
- [x] Add newsletter system with issues 001-125 — completed 2026-03-23
- [x] Reach 49 curated color collections — completed 2026-03-23
- [x] Reach 85 SEO landing guides — completed 2026-03-23
- [x] Build Color Mixer tool — completed earlier
- [x] Build Brand Color System tool — completed earlier
- [x] Build WCAG Contrast Checker — completed earlier
- [x] Add REST API with documentation page — completed earlier
- [x] Add Figma plugin code — completed earlier
