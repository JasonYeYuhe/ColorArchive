# Handoff — Claude Code → Codex

Last updated: 2026-03-19

## This Session Summary

### Done
- All 6 Lemon Squeezy products live with checkout URLs (JPY pricing)
- Resend domain verified (colorarchive.me) — email delivery working
- Fixed email.js: proper error handling (was silently returning ok:true on Resend 403)
- Added plain text fallback + reply_to header to reduce spam scoring
- Updated priceHint from USD to JPY across all 6 palette packs
- New ColorSpectrum component: full HSL canvas on /all-colors page (hover/click to copy hex, saturation slider)
- colorarchive.org domain bought and redirecting to colorarchive.me
- PRODUCT_MEMO.md updated with all progress

### Pending / Next Steps
- LS store review — close Test mode after approval
- Mobile interaction bugs (some elements can obstruct content)
- Open Graph enhancement (limited by static export)
- Email deliverability will improve over time as domain reputation builds
- Newsletter content sequences (monthly curated palettes)
- Consider Figma plugin, recommendation system

### Server State (DigitalOcean)
- IP: 143.198.85.72 (SSH as root)
- Domain: api.colorarchive.me (HTTPS via Let's Encrypt)
- Stack: Node.js + Express + SQLite + Resend
- PM2 process: `colorarchive-server`
- Routes: POST /subscribe, POST /webhook/ls, GET /analytics, GET /health
- Server code is at `/root/ColorArchive/server/` — after local changes, push to git and `ssh root@143.198.85.72 "cd /root/ColorArchive && git pull && cd server && npm install && pm2 restart colorarchive-server"`

### Key Files
- `PRODUCT_MEMO.md` — full project memo (read this first)
- `src/lib/checkout-config.ts` — all checkout URLs and commerce config
- `src/lib/palette-packs.ts` — 6 product definitions
- `server/email.js` — Resend email templates
- `server/routes/subscribe.js` — email capture endpoint
- `server/routes/webhook.js` — LS payment webhook
- `scripts/generate-downloads.mjs` — ZIP bundle generation (prebuild)

### Codex Handoff Protocol
When the user says "换claude" (switch to Claude Code):
1. Update this HANDOFF.md with your session summary (what you did, what's pending)
2. Update PRODUCT_MEMO.md if anything significant changed
3. Commit and push all changes
4. Give the user a message they can paste to Claude Code that says: "从codex交接回来了，请先读 HANDOFF.md 和 PRODUCT_MEMO.md"
