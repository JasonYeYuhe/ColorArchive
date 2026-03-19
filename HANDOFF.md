# Handoff — Codex → Claude Code

Last updated: 2026-03-19

## This Session Summary

### Done
- Confirmed Google OAuth web app is live; `GOOGLE_CLIENT_ID / SECRET / REDIRECT_URI` are configured on the server
- Confirmed Google sign-in entry works in a real browser and user completed a real login
- Fixed static export failures by wrapping CSR `useSearchParams` routes with `Suspense` (`/analytics`, `/free-pack`, `/palette`, `/waitlist`)
- Expanded account page:
  - order/download history
  - resend email action
  - receipt / pack page links
  - Personal / Commercial license copy
  - support SLA
  - admin queue preview for allowlisted accounts
- Expanded analytics:
  - protected behind login + `ADMIN_EMAILS`
  - filters for source / landing path / utm_source / utm_medium / utm_campaign / utm_term / utm_content
  - previous-window comparisons
  - source cohort rows
- Added public `/notes` archive improvements:
  - issue tags
  - featured collection / featured pack callouts
  - previous / next issue navigation
- Added recommendation layer on `/favorites` and `/recent`
- Strengthened family detail pages with archive -> collection -> pack upgrade path
- Added new design-tool exports at build time:
  - `colorarchive.gpl`
  - `colorarchive-sketchpalette.json`
  - `colorarchive.ase`
  - complete-archive equivalents
- Added `/admin/orders`:
  - admin-only route
  - recent order queue
  - resend download email
  - direct buyer mailto action
- Updated `PRODUCT_MEMO.md`
- Commit/push/deploy completed:
  - `2280b8f` Add newsletter notes and attributed account analytics
  - `1ff5efa` Fix static export suspense boundaries
  - `d43d431` Expand account, analytics, and export workflows
- GitHub Pages deploy for `d43d431` finished successfully

### Pending / Next Steps
- LS store review — close Test mode after approval
- Mobile interaction bugs (some elements can still obstruct content)
- Email deliverability will improve over time as domain reputation builds
- Buyer/admin tooling can go deeper:
  - add search/filter on `/admin/orders`
  - add buyer-level drilldown from analytics
- `/notes` can keep expanding into a fuller archive:
  - more issues
  - tag landing pages
- More export formats remain open:
  - ACO / Procreate / Framer
- Figma / Tokens Studio integration still not started
- Recent colors are still local-only; not yet synced to account

### Server State (DigitalOcean)
- IP: 143.198.85.72 (SSH as root)
- Domain: api.colorarchive.me (HTTPS via Let's Encrypt)
- Stack: Node.js + Express + SQLite + Resend
- PM2 process: `colorarchive-server`
- Routes:
  - POST /subscribe
  - POST /webhook/ls
  - GET /analytics
  - GET /health
  - GET /admin/orders
  - POST /admin/orders/:orderId/resend
- Server code is at `/root/ColorArchive/server/` — after local changes, push to git and `ssh root@143.198.85.72 "cd /root/ColorArchive && git pull && cd server && npm install && pm2 restart colorarchive-server"`
- Server currently at commit `d43d431`
- Remote stashes exist from deploy safety:
  - `pre-deploy-2026-03-19`
  - `pre-deploy-2026-03-19-b`
  - `pre-deploy-2026-03-19-auth`
  - `pre-deploy-2026-03-19-account`
  - `pre-deploy-2026-03-19-suspense`
  - `pre-deploy-2026-03-19-workflows`

### Key Files
- `PRODUCT_MEMO.md` — full project memo (read this first)
- `src/lib/checkout-config.ts` — all checkout URLs and commerce config
- `src/lib/palette-packs.ts` — 6 product definitions
- `src/lib/license-tiers.ts` — current Personal / Commercial license copy
- `src/lib/newsletter-issues.ts` + `src/data/newsletter-issues.json` — public notes archive data
- `server/email.js` — Resend email templates
- `server/routes/subscribe.js` — email capture endpoint
- `server/routes/webhook.js` — LS payment webhook
- `server/routes/analytics.js` — filtered analytics + cohorts
- `server/routes/admin.js` — admin order queue
- `src/components/login-page.tsx` — account page
- `src/components/analytics-page.tsx` — analytics UI
- `src/components/admin-orders-page.tsx` — admin UI
- `scripts/generate-downloads.mjs` — ZIP bundle generation (prebuild)

### Codex Handoff Protocol
When the user says "换claude" (switch to Claude Code):
1. Update this HANDOFF.md with your session summary (what you did, what's pending)
2. Update PRODUCT_MEMO.md if anything significant changed
3. Commit and push all changes
4. Give the user a message they can paste to Claude Code that says: "从codex交接回来了，请先读 HANDOFF.md 和 PRODUCT_MEMO.md"
