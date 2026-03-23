# Human TODO — ColorArchive

> Things the autopilot can't do. Jason handles these when he picks up the project.
> Last updated: 2026-03-23

## High Priority
- [ ] Add real payment provider to `src/lib/checkout-config.ts` — *commerce is currently non-functional; Lemon Squeezy or Stripe integration needed*
- [ ] Verify Vercel builds are now succeeding — *check Vercel dashboard after the big run push (ce9198d) to confirm /combinations/ deploys correctly*
- [ ] Review collections with renamed IDs — `moonlit-garden`, `dark-botanical`, `copper-verdigris` replaced duplicates; check if any external links or marketing materials referenced the old IDs

## Medium Priority
- [ ] Configure TikTok admin page (`app/admin/tiktok/`) — *exists as untracked file; unclear if it should be staged and deployed*
- [ ] Review and stage `src/components/launch-page.tsx`, `waitlist-page.tsx`, `terms-page.tsx` — *several components exist as untracked files; decide if these should be deployed*
- [ ] Figma plugin: `figma-plugin/package-lock.json` is untracked — should be committed if the plugin is actively maintained
- [ ] Verify newsletter `featuredCollectionId` references are valid — *some older issues may reference renamed collections (midnight-garden, copper-patina)*; no automated check exists
- [ ] Add color ID validation to autopilot SKILL.md — *autopilot continues to accidentally use combination IDs as collection IDs; a validation step would prevent this*

## Low Priority / Nice to Have
- [ ] Add Stripe/LS webhooks to server for order fulfillment automation — *currently manual*
- [ ] Review `src/lib/i18n-merged.ts`, `i18n-part1.ts`, `i18n-part2.ts` — *untracked files; unclear if these are working drafts or obsolete*
- [ ] Seasonal collection: spring-2026 assets exist in downloads but no corresponding collection page — *consider adding a seasonal palette page*
- [ ] Add more combinations to /combinations/ — *started with 30; could expand to 50+ over future runs*

## Done
- [x] Fix collections build error (18 invalid color IDs) — completed 2026-03-23 autopilot
- [x] Fix duplicate collection IDs (midnight-garden ×3, copper-patina ×2) — completed 2026-03-23 autopilot
- [x] Fix notes page prerender failure (15 links with url instead of href) — completed 2026-03-23 autopilot
- [x] Add Image Color Extractor tool (/image-palette/) — completed 2026-03-23 big run
- [x] Add Design Token Generator — completed earlier big run
- [x] Add Color Combinations Library (/combinations/) — completed 2026-03-23 big run
- [x] Next run trigger: big run is due — completed 2026-03-23 big run (was flagged in previous todo)
