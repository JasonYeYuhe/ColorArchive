# Human TODO — ColorArchive

> Things the autopilot can't do. Jason handles these when he picks up the project.
> Last updated: 2026-03-22 (autopilot normal run)

## High Priority
- [ ] Submit Figma plugin for Community review — requires manual interaction in the Figma desktop app (publish flow, screenshots, description)
- [ ] Set up Google Search Console for colorarchive.com — verify site ownership and submit sitemap to index new guide pages
- [ ] Update Lemon Squeezy checkout URLs in `src/lib/checkout-config.ts` when new products go live — autopilot cannot access LS dashboard

- [ ] Submit /convert/ to Google Search Console once indexed — verify it ranks for "hex to rgb converter" type queries and monitor click-through rate

## Medium Priority
- [ ] Add real product screenshots to pack detail pages — currently using placeholder/generated images; real screenshots improve conversion
- [ ] Review A/B email subject line variants in `server/email.js` before enabling in production — copy needs human tone check
- [ ] Register domain aliases or redirects (e.g. colorarchive.io → colorarchive.com) if desired for SEO
- [ ] Set up proper analytics funnel in Umami Cloud — create goals for checkout clicks, pack downloads, newsletter signups

## Low Priority / Nice to Have
- [ ] Create social preview images (OG images) for newsletter issue pages — currently using generic OG
- [ ] Add a favicon set (16px, 32px, 180px apple-touch-icon) — current favicon may be basic
- [ ] Review and update Privacy Policy / Terms of Service if Lemon Squeezy integration changes data handling
- [ ] Consider setting up Cloudflare in front of GitHub Pages for better edge caching and analytics

## Done
- [x] Set real Figma plugin ID in manifest — completed 2026-03-21
- [x] Fix Figma manifest allowedDomains (add https://) — completed 2026-03-21
- [x] Switch analytics to Umami Cloud — completed earlier
