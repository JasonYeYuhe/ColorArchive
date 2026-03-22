# Human TODO — ColorArchive

> Things the autopilot can't do. Jason handles these when he picks up the project.
> Last updated: 2026-03-23

## High Priority
- [ ] Set up real payment provider (Lemon Squeezy or Stripe) — `src/lib/checkout-config.ts` has placeholder URLs. Commerce is non-functional without this.
- [ ] Connect email subscriber list to newsletter — `sendNewsletterIssueAlert()` is implemented in `server/email.js` but there's no trigger/cron to broadcast new issues to subscribers automatically.
- [ ] Review and publish Pinterest OAuth integration — Pinterest callback route exists at `/pinterest/callback/` but OAuth credentials need to be configured.

## Medium Priority
- [ ] Add Figma plugin to Figma Community marketplace — the plugin exists in `figma-plugin/` but may not be published/updated in the marketplace.
- [ ] Review TikTok admin page (`app/admin/tiktok/`) — exists as untracked file, unclear if it's meant to be committed or is a draft.
- [ ] Review terms page (`app/terms/`) — exists as untracked file, check if it needs to be added to the site and nav.
- [ ] Set up Google Search Console for the GitHub Pages deployment — verifying the site for GSC requires adding a meta tag or file to the repo.
- [ ] Review `src/components/waitlist-page.tsx` (untracked) — appears to be a new waitlist page that hasn't been committed. Decide if it should be added.

## Low Priority / Nice to Have
- [ ] Add a social sharing preview image (OG image) generator — currently using static OG images; a dynamic generator would improve link previews for individual color pages.
- [ ] Consider adding a `/changelog/` or `/updates/` page that's publicly visible — the current `/updates/` route exists but may need content population.
- [ ] Consider a "Color of the Day" feature — could be a simple cron + static page update.
- [ ] Review i18n-merged.ts, i18n-part1.ts, i18n-part2.ts (untracked) — these appear to be draft files for expanded multilingual support. Decide if they should replace or supplement `src/lib/i18n.ts`.

## Done
- [x] Color Mixer tool — completed big run eba613b (2026-03-23)
- [x] Newsletter issue duplicate fix (Issue 098 replaced) — completed 1cc22d1 (2026-03-23)
- [x] Newsletter ordering bug fix (Issues 102-105 at wrong position) — completed 55fb5f9 (2026-03-23)
- [x] Newsletter issues 001-113 — 114 total issues now published (through February 2028)
- [x] 43 curated palette collections — growing collection library
- [x] 76 SEO landing guides — comprehensive coverage
