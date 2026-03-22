# Human TODO — ColorArchive

> Things the autopilot can't do. Jason handles these when he picks up the project.
> Last updated: 2026-03-23

## High Priority
- [ ] **Verify Color Mixer page renders correctly** — `/mixer/` was just launched. Visit the page to confirm the color picker, OKLCH interpolation, export panel, and presets all work as expected. The component was pre-built but not yet wired to a route until this run.
- [ ] **Add Mixer to main navigation** — Color Mixer is in the Tools hub and sitemap but not in the site header nav dropdown. Consider adding it under the "Tools" nav group alongside Tints & Shades.
- [ ] **Terms page** — `app/terms/` and `src/components/terms-page.tsx` exist as untracked files but have no route. Decide if this should be launched or if the existing Privacy Policy covers the needed legal requirements.
- [ ] **TikTok admin page** — `app/admin/tiktok/` and `src/components/tiktok-admin-page.tsx` exist as untracked files. Review and decide whether to commit or remove these files.

## Medium Priority
- [ ] **Configure real payment provider** — `src/lib/checkout-config.ts` still has Lemon Squeezy / Stripe placeholder URLs. Integrate a real checkout provider to enable actual pack sales.
- [ ] **Pinterest OAuth app approval** — The Pinterest integration added recently routes through the backend proxy (CORS fix) but requires Pinterest app review for production-level API access. Submit the app for review in the Pinterest developer portal.
- [ ] **Figma plugin marketplace submission** — The Figma plugin is built and functional but may not be published to the Figma Community. Consider submitting for review.
- [ ] **i18n audit** — STRUCTURE.md still mentioned EN/JA but the actual i18n has been switching toward EN/ZH. Confirm the intended language pair and clean up any remaining Japanese strings if ZH is the target.
- [ ] **Color collection color IDs** — The two new collections (sage-terrarium, dusk-coral) use descriptive color IDs (sage-mist-soft, moss-tone-muted, etc.) that need to match actual color slugs in the 2016-color archive. Verify these IDs resolve to real colors or fix the references.

## Low Priority / Nice to Have
- [ ] **Add Color Mixer to hero section** — The homepage hero section lists featured tools. Adding the Color Mixer would increase discoverability for the new tool.
- [ ] **A/B test email subject lines** — The email scheduler has A/B variant support. Check `/analytics/ab-results` to see if there's enough data to determine winning variants and update the copy.
- [ ] **Logo assets** — `colorarchive_logo_v1_assets/` contains logo files that are untracked. Decide if these should be committed to the repo or kept only in design files.

## Done
- [x] Pinterest Save button + OAuth integration — completed 2026-03-22
- [x] Pinterest API CORS fix via backend proxy — completed 2026-03-22
- [x] Privacy policy updated for Pinterest API — completed 2026-03-22
- [x] Color Mixer tool launch at /mixer/ — completed 2026-03-23
- [x] Tints & Shades Generator — completed (autopilot-big, earlier run)
- [x] Color Blindness Simulator — completed (autopilot-big, earlier run)
- [x] Color Tools Hub at /tools/ — completed (autopilot-big, earlier run)
- [x] REST API + API docs at /api-docs/ — completed (earlier session)
- [x] Figma plugin build pipeline fix — completed (earlier session)
