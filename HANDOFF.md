# Handoff — Claude Code → Codex

Last updated: 2026-03-19

## This Session Summary

### Done (Claude Code — SEO + Conversion pass)

**Previously done (prior Claude Code session):**
- ACO, Procreate .swatches, Framer tokens, nested Figma tokens added to generate-downloads.mjs
- Mobile palette-builder-tray fix (50vh mobile / 70vh sm+)
- Admin orders search/filter/pagination (server + frontend)
- Analytics buyer drilldown endpoint + UI
- Newsletter Issue 002, 003; tag landing pages; clickable tags
- Google login UX (loading spinner, styled error)
- checkout-config.ts annotated with live status

**This session — SEO & conversion improvements:**
- **Color detail pages**: H1 added to hero color name (was a div!), meta title targets "hex color code" searches (absolute, bypasses layout template), description leads with hex, breadcrumb JSON-LD, Section headers promoted to H2 semantic tags (Tonal strip, Palette moves, Nearest neighbors, About this color, Recent trail), "About this color" section enriched with CSS custom property snippet, family label in hero + aside header now links to `/families/[slug]`
- **Product CTA panel** on every color detail page: dark "Ready to build" section with links to /packs/, /free-pack/, /collections/
- **Homepage**: WebSite (with SearchAction) + Organization JSON-LD added
- **All collection, family, pack, notes detail, tag pages**: breadcrumb JSON-LD added, titles fixed to absolute (bypass layout template), keyword-targeted
- **Notes detail page**: Article JSON-LD (headline, datePublished, keywords), end-of-latest-issue subscribe CTA using EmailCaptureForm
- **Collections page**: "Take this palette further" dark CTA panel added after export preview
- **Site footer**: expanded with /collections/, /families/, /notes/, /free-pack/ links; removed thin user-state links
- **Word-to-color**: "Find in archive" panel links to /search?hex= and /all-colors/ after generation
- **Sitemap**: all /notes/tags/[tag] routes added; canonical URLs updated to consistent trailing-slash format
- **All list pages**: improved titles and descriptions (search, all-colors, collections, packs, families, notes, spectrum, about, product-examples, updates, waitlist, free-pack, word-to-color)
- **User-state pages** (/favorites, /recent, /palette): noindex added
- Layout keywords updated to target high-intent design queries

### Pending / Next Steps
- LS store review — close Test mode (manual: app.lemonsqueezy.com → Settings → Store)
- Google login full callback test — have allowlist admin do one real first login
- Server is already up to date (was updated last session manually)
- `/notes` can continue expanding: more issues drive newsletter SEO
- Design exports: Procreate/ACO/Framer formats exist; open: Framer plugin integration docs
- Color archive main grid (/) renders 2016 colors without virtualization — consider performance work
- Admin orders: buyer-level drilldown still pending (click email → their orders)

### Server State (DigitalOcean)
- IP: 143.198.85.72 (SSH as root)
- Domain: api.colorarchive.me (HTTPS via Let's Encrypt)
- Stack: Node.js + Express + SQLite + Resend
- PM2 process: `colorarchive-server`
- Routes:
  - POST /subscribe
  - POST /webhook/ls
  - GET /analytics (with source/days filters)
  - GET /analytics/buyers (buyer drilldown)
  - GET /health
  - GET /admin/orders (search/filter/pagination)
  - POST /admin/orders/:orderId/resend
- Deploy: `ssh root@143.198.85.72 "cd /root/ColorArchive && git pull && cd server && npm install && pm2 restart colorarchive-server"`
- Server is current — no pending deploys

### Key Files
- `PRODUCT_MEMO.md` — full project memo
- `app/colors/[slug]/page.tsx` — color detail SEO (title, JSON-LD, breadcrumbs)
- `src/components/color-detail-page.tsx` — H1, H2 tags, CSS snippet, family links, product CTA
- `src/components/collections-page.tsx` — product CTA panel
- `src/components/note-detail-page.tsx` — Article JSON-LD, subscribe CTA
- `src/components/word-color-generator-page.tsx` — archive links after generation
- `src/components/site-footer.tsx` — expanded navigation
- `app/sitemap.ts` — complete sitemap including tag routes
- `scripts/generate-downloads.mjs` — ACO, Procreate, Framer, nested Figma exports
- `src/lib/checkout-config.ts` — commerce config (all 6 products live)
- `src/lib/palette-packs.ts` — 6 product definitions
- `src/lib/newsletter-issues.ts` + `src/data/newsletter-issues.json` — 3 issues + tag helpers
- `server/routes/analytics.js` — analytics + /buyers endpoint
- `server/routes/admin.js` — admin orders with search/filter/pagination

### Codex Handoff Protocol
When the user says "换claude" (switch to Claude Code):
1. Update this HANDOFF.md with your session summary (what you did, what's pending)
2. Update PRODUCT_MEMO.md if anything significant changed
3. Commit and push all changes
4. Give the user a message they can paste to Claude Code that says: "从codex交接回来了，请先读 HANDOFF.md 和 PRODUCT_MEMO.md"
