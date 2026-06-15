# Handoff — Growth + Conversion Session (2026-06-14)

Last updated: 2026-06-15 · Author: Claude Code (Opus 4.8) · Branch: `main`

> Purpose: let the next session pick up seamlessly. Read this + `docs/human-todo.md`
> + `docs/dev-plan-2026-05-31.md` (the validated V2 strategy) + `STRUCTURE.md` first.

---

## 2026-06-15 update (remote session)

Confirmed with the owner before coding. Shipped the **last two code-doable WTP probes**;
everything else is now genuinely validation + distribution + time.

- **Looked at real funnel data** (first-party DB on the Droplet): pipeline is healthy
  (`pageviews` ~800–1000/day, `track()` events land), but the **preorder funnel has 0
  events / 0 reservations** since the 06-14 launch — `/preorder/` just gets no traffic
  (it's buried behind low-traffic pages). GSC at T+1 day cannot yet show the 474 word
  pages (indexing takes days–weeks; report lags 2–3 days), so no GSC read yet.
- **word-to-color WTP paywall — BUILT + ENABLED** (owner: "建并直接开"). After 5 distinct
  word lookups the palette/exports gate behind a `/pro/` CTA + email-unlock. SEO-safe
  (counts only new user-typed words; crawlers / shared `?q=` links / the 474 static pages
  never hit it). Toggle: `WORD_PAYWALL_ENABLED` in `word-color-generator-page.tsx`. Events:
  `word_paywall_hit` / `word_paywall_pro_click` / `word_paywall_email_unlock`.
- **$49 pre-order enablement kit**: `docs/preorder-ls-setup-2026-06-15.md` — the only
  remaining step is in the owner's Lemon Squeezy account (create the product, paste the
  URL into Vercel, redeploy). Code side was already done.
- **Owner's immediate move**: do the 5-min LS step above (unlocks the card test), then post
  the distribution drafts (`docs/backlink-distribution-drafts-2026-06-14.md`) to feed both
  funnels. Then let GSC + the funnels mature ~2–3 weeks before the S2 exit-gate decision.

The 2026-06-14 notes below remain accurate as the underlying state.

---

## TL;DR

A 7-deploy session pushed all the **code-executable** growth + conversion levers:
exposure (SEO/GEO/internal links/474 word pages), Core Web Vitals, a backlink engine,
conversion fixes, and a full **willingness-to-pay (WTP) pre-order funnel**. The bottleneck
is now **validation + distribution + time — not code.** Per the original dual-reviewed
audit, the next real signal comes from running the WTP test + user interviews + GSC
maturing, not from more commits.

## What shipped this session (7 deploys, newest first)

| Commit | Lever |
|--------|-------|
| `5e5ac2c` | Auditor pre-order CTA on `/palette-audit/` + `/wcag-audit/` (attributed `preorder_cta_click {from}`) |
| `61c6454` | WTP pre-order landing `/preorder/` (Accessibility Auditor, $49 founder) |
| `174d155` | Conversion: removed fabricated testimonial → honest trust row; `¥`→`JP¥`; email capture on `/word-to-color/` |
| `436eb32` | Backlink engine: static HTML color badge on color pages + embed landing; fixed broken `${SITE_URL}` attribution link; `/embed/embed-code/` into sitemap+footer |
| `d3e483d` | Core Web Vitals: Sentry Replay off (~50KB), gtag `lazyOnload`, stale PH banner off |
| `ee32bb6` | Exposure 2: 474 `/word-to-color/[word]/` pages + index hub, story/use-case OG, GEO `llms.txt` |
| `19c8063` | Exposure 1: color→guide internal links, dedup 21 guide slugs, guide FAQ+CTR titles, IndexNow, hero COTD fix |

All deploys: `typecheck` + `build` green before push; one commit per batch; session lock
released after each.

## Current state / key facts

- **Traffic** (baseline 2026-05-31): ~110–240 PV/day. #1 entry `/word-to-color/`; top guides
  = color-psychology. **ChatGPT is the #2 external source** (AI engines ≈ Google organic).
  GSC: ~26.4K impressions stuck at avg pos ~13 (page 2), 0.8% CTR.
- **Revenue: ~0. Nobody has ever paid for Pro.** Core diagnosis = PMF/traffic mismatch
  (casual info-seekers vs a ¥499/mo designer subscription).
- New surfaces: 474 word pages, color→guide links, guide FAQs, dynamic OG everywhere,
  IndexNow, color-badge backlink engine, `/preorder/` WTP funnel.

## 🔴 NEXT STEPS — prioritized (mostly NOT code)

**1. Human-only, unblocks everything (this week):**
- [ ] **Turn the WTP test into a real card test**: create a $49 Lemon Squeezy
      "Accessibility Auditor — Pre-order" product → set `NEXT_PUBLIC_PREORDER_CHECKOUT_URL`
      in Vercel Production → redeploy. Until then `/preorder/` only collects email
      reservations (weak signal). **Kill criterion: <10 real card pre-orders in 30 days →
      designer-Pro theory not validated; stop building Pro.**
- [ ] **Reconcile pricing**: `priceUsd` in `src/lib/checkout-config.ts` doesn't match the
      JPY amounts (¥499≈$3.34 vs $6.99). Decide real prices + whether to bill USD at all.
      (Code change is trivial once decided.)

**2. Code replacements impossible (this month):**
- [ ] **10 user interviews** — script at `docs/user-interview-script.md`. The only source
      of "who/why/why-pay". This is the V2 plan's core and still not started.
- [ ] **Post the distribution drafts** — `docs/backlink-distribution-drafts-2026-06-14.md`
      (Dev.to / Show HN / Reddit / directories). Real new traffic + backlinks.

**3. Measure (2–3 weeks), then decide at the V2 exit gate (`dev-plan-2026-05-31.md` §7):**
- GSC: are the 474 word pages indexed? did page-2→page-1 move? CTR on top guides?
- Funnel (PostHog): `preorder_cta_click {from}` → `preorder_view` → `preorder_checkout_clicked`.

**Code items available if the user wants them (lower priority / need a decision):**
- word-to-color **paywall after N free uses** (2nd WTP probe) — WILL cut traffic; user must opt in.
- Draft the **interview recruitment copy + channel list** (pure output; offered, not yet done).
- Edge exposure polish: more OG routes (notes/vs), more word seeds, palette embed badge on
  collections (builder `buildPaletteBadgeHtml` already exists).

## Protocol reminders (from CLAUDE.md — follow exactly)

- **Before any work**: `git pull --rebase origin main`; read `.claude/session-lock.json`;
  if locked by autopilot, wait. Acquire lock as `"lockedBy":"remote"` via Bash echo.
- **One commit + one push per batch** (every push = a Vercel build of 4,400+ pages).
  `vercel.json` ignoreCommand skips docs/metadata-only pushes.
- Validate with `npm run typecheck` + `npm run build` before pushing (no test suite).
- **Release the lock** (null values) and include it in the single commit.
- Language: **Chinese or English only**. Minimize manual steps for the user.
- Update `STRUCTURE.md` when pages/components/data/routes change.

## Key files

- WTP: `app/preorder/page.tsx`, `src/components/preorder-page.tsx`,
  `src/components/auditor-preorder-cta.tsx`, `preorderConfig` in `src/lib/checkout-config.ts`
- Word pages: `app/word-to-color/[word]/`, `src/lib/word-to-color-seeds.ts`
- Internal links: `src/lib/color-guide-links.ts`; guide SEO: `src/lib/guide-seo.ts`
- Backlinks: `src/components/embed-badge-button.tsx`, `app/embed/embed-code/`
- IndexNow: `scripts/indexnow-ping.mjs` (postbuild), key `public/c0107a3b9f2d4e8a8b6c1d5e7f0a2b34.txt`
- Strategy: `docs/dev-plan-2026-05-31.md`, `docs/baseline-metrics-2026-05-31.md`,
  `docs/human-todo.md`, `docs/user-interview-script.md`
