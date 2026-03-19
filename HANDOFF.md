# Handoff — Claude Code → Codex

Last updated: 2026-03-19

## This Session Summary

### Done
- Added 3 new design export formats to `scripts/generate-downloads.mjs`:
  - **ACO** (Adobe Photoshop binary format, v1 + v2 with names) — `colorarchive.aco`, `complete-archive.aco`
  - **Procreate .swatches** (ZIP + JSON) — `colorarchive.swatches`, `complete-archive.swatches`
  - **Framer design tokens** (CSS variables with Framer-specific header) — `colorarchive-framer-tokens.css`, `complete-archive-framer-tokens.css`
  - **Figma tokens now nested by family** (better Figma Variables panel organization) — updated `colorarchive-figma-tokens.json`, `complete-archive-figma-tokens.json`
  - New formats added to `complete-archive.zip` and `palette-packs.ts` sampleDownloads
- Fixed mobile `palette-builder-tray`:
  - Reduced max-height from 70vh to 50vh on mobile (sm: still 70vh)
  - Collapse button now shows `×` icon on mobile, "Collapse" text on sm+
- Added admin orders search/filter/pagination:
  - Server (`server/routes/admin.js`): added `?email=`, `?product=`, `?dateFrom=`, `?dateTo=`, `?page=`, `?limit=` query params with SQL LIKE matching
  - Frontend (`src/components/admin-orders-page.tsx`): filter bar (email search, product dropdown, date range), pagination, result count
  - Updated `auth-client.ts` `fetchAdminOrders` to accept filter params
- Added analytics buyer drilldown:
  - New server endpoint `GET /analytics/buyers?source=X&days=N` — returns top 100 buyers with masked email, order count, LTV, first purchase date, products
  - Source cohort rows in analytics UI are now clickable — expands buyer list panel below
- Added 2 new newsletter issues (Issue 002, 003) to `newsletter-issues.json`
- Added tag landing pages:
  - New route `app/notes/tags/[tag]/page.tsx` + `src/components/tag-notes-page.tsx`
  - Tags in `notes-page.tsx` and `note-detail-page.tsx` are now clickable links → `/notes/tags/[slug]`
  - 12 unique tags now have their own static pages
- Improved Google login UX in `login-page.tsx`:
  - Loading spinner on "Continue with Google" button while redirecting
  - Error display now styled as a red alert box with "Try Google sign-in again" action button
- Added comment to `checkout-config.ts` explaining current live status and how to close LS test mode

### Pending / Next Steps
- LS store review — close Test mode after approval (manual: app.lemonsqueezy.com → Settings → Store)
- Google login full callback: have allowlist admin do one real first login to confirm callback → session → redirect works end-to-end
- Admin orders: consider buyer-level drilldown (click email in analytics → jump to their orders in admin)
- `/notes` can continue expanding: more issues, tag landing pages now exist
- Design exports: Procreate `.swatches` now included; still open: Framer plugin integration, Style Dictionary CLI workflow docs
- Figma / Tokens Studio: token JSON is now nested by family and W3C-compliant — ready for Tokens Studio import

### Server State (DigitalOcean)
- IP: 143.198.85.72 (SSH as root)
- Domain: api.colorarchive.me (HTTPS via Let's Encrypt)
- Stack: Node.js + Express + SQLite + Resend
- PM2 process: `colorarchive-server`
- Routes:
  - POST /subscribe
  - POST /webhook/ls
  - GET /analytics (with filters)
  - GET /analytics/buyers (new — buyer drilldown)
  - GET /health
  - GET /admin/orders (now with search/filter/pagination)
  - POST /admin/orders/:orderId/resend
- Server code is at `/root/ColorArchive/server/` — after local changes, push to git and `ssh root@143.198.85.72 "cd /root/ColorArchive && git pull && cd server && npm install && pm2 restart colorarchive-server"`
- **Server needs to be updated** to pick up the new `/analytics/buyers` endpoint and updated `/admin/orders` filter logic

### Key Files
- `PRODUCT_MEMO.md` — full project memo (read this first)
- `scripts/generate-downloads.mjs` — all export format generation (ACO, Procreate, Framer, Figma nested)
- `src/lib/checkout-config.ts` — all checkout URLs and commerce config
- `src/lib/palette-packs.ts` — 6 product definitions + sampleDownloads
- `src/lib/newsletter-issues.ts` + `src/data/newsletter-issues.json` — 4 issues + tag helpers
- `server/routes/analytics.js` — analytics + new /buyers endpoint
- `server/routes/admin.js` — admin orders with search/filter/pagination
- `src/components/admin-orders-page.tsx` — filter UI + pagination
- `src/components/analytics-page.tsx` — buyer drilldown panel
- `app/notes/tags/[tag]/page.tsx` — tag landing route
- `src/components/tag-notes-page.tsx` — tag landing page component
- `src/components/login-page.tsx` — account page + Google login UX

### Codex Handoff Protocol
When the user says "换claude" (switch to Claude Code):
1. Update this HANDOFF.md with your session summary (what you did, what's pending)
2. Update PRODUCT_MEMO.md if anything significant changed
3. Commit and push all changes
4. Give the user a message they can paste to Claude Code that says: "从codex交接回来了，请先读 HANDOFF.md 和 PRODUCT_MEMO.md"
