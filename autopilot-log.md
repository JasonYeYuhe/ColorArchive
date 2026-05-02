
## 2026-05-03 (later) — Sprint 2 v1: Color Journal (B1 + B3 merged) + droplet deploy

**Run type:** Remote (user-requested, "你直接控制 droplet 吧 — 全权负责")

### 1. Droplet deploy of Sprint 1 server changes

SSH'd into the DO droplet (143.198.85.72), located the actual repo at `/root/ColorArchive` (memory had the wrong path), stashed a stale `server/package-lock.json` working-tree change, `git pull origin main` (b9cba9c → 971c5a0, 11 commits), `pm2 restart colorarchive-server` (process name was `colorarchive-server` not `colorarchive-api`). Verified `GET /ai/usage` is live:

```
$ curl -s https://api.colorarchive.org/ai/usage
{"tier":"anonymous","used":0,"limit":3}
```

`AiUsageBadge` will now return real numbers for anonymous visitors site-wide.

### 2. Color Journal v1 (B1 + B3 merged)

Per Gemini review: "Streaks without recorded value collapse fast — merge B1 and B3 into a single check-in surface." This v1 ships exactly that: one journaled color per day, with an optional one-line note, and a streak counter that rewards continuity without punishing a missed day too aggressively.

**Data layer** (`src/lib/color-journal.ts`):
- localStorage-first (Sprint 2 v1 has no cloud sync; queued for v2 once we see real usage shape).
- One entry per local day (last-write-wins for same-day re-saves).
- Hex is snapshotted at write time so deletion of an archive entry won't break old journal entries.
- Notes capped at 280 chars.
- Streak with **grace period**: if today is empty but yesterday is filled, the current streak is preserved (gives the user until end-of-day to log without dread).

**UI**:
- New route `/journal/` — header with 3 streak tiles (current / longest / total), today's entry slot, recent-entries list with inline edit + delete.
- New `<LogToJournalButton>` — toggle button (Save → "Logged today" with checkmark, click again to undo). Pre-mount renders skeleton-shaped HTML to keep SSR/hydrate identical.
- Wired into:
  - color detail page (every one of 5,446 pages)
  - `/today/` (the daily-recommended-color hero)

**Tests** (`src/lib/__tests__/color-journal.test.ts`, 18 cases):
- `previousDay` correctness across month/year boundaries (incl. leap year)
- last-write-wins on same-day re-saves
- note clamping at NOTE_MAX_LENGTH
- empty / single-day / consecutive / grace-period / gap / multi-run streak scenarios

**Files:**
- `src/lib/color-journal.ts` (new)
- `src/lib/__tests__/color-journal.test.ts` (new, 18 tests)
- `src/components/journal-page.tsx` (new)
- `src/components/log-to-journal-button.tsx` (new)
- `app/journal/page.tsx` (new route)
- `app/sitemap.ts` — `/journal/` priority 0.7 daily
- `src/components/site-header.tsx` — `/journal` in `currentPath` union
- `src/components/site-footer.tsx` — Journal chip
- `src/components/color-detail-page.tsx` — LogToJournalButton next to FavoriteButton
- `src/components/color-of-day-page.tsx` — LogToJournalButton (primary variant) in hero
- `STRUCTURE.md`

### Verified

- typecheck clean
- 565 vitest tests pass (547 prior + 18 new journal tests)

### Sprint 2 status

- [x] B1+B3 merged "Color Journal" v1 (localStorage)
- [ ] Cloud sync (logged-in users) — v2
- [ ] Calendar grid view (30/90/365-day) — v2
- [ ] PNG export of journal calendar — v2 (high virality potential per the plan)
- [ ] Streak rewards (Pro 7-day trial at 30 streak; 30% off at 100) — v2

---

## 2026-05-03 — Sprint 1 final: C1 Free/Pro paywall — visible quota + export watermark

**Run type:** Remote (user-requested, "继续吧 — 全权负责")

Closed Sprint 1 by tightening the Free/Pro differentiation per the Gemini-revised plan: not "ban Free users from things they need" (which would just drive them away when DAU is already low) but "make the Free vs Pro contrast visible at the moment of value creation".

### 1. Anonymous AI quota visibility

`AiUsageBadge` previously hid itself for anonymous users — they only learned about the limit by hitting a 429. Fixed by:

- Adding `GET /ai/usage` to the server (public, mirrors the IP-hash identifier logic from `ai-rate-limit.js` so anonymous quota is queryable without auth).
- Adding `fetchAiUsage()` to the client — returns `{ tier, used, limit }`, works for any caller.
- `AiUsageBadge` now renders for anonymous + free users, with a 3-state colour (slate / amber / rose) and a contextual upgrade CTA (`/login` for anon, `/pro` for free).

### 2. Badge on every AI surface

Previously only `brand-generator` and `mood-palette` showed the badge. Added it to:

- `url-analyzer-page.tsx` (Brand Color Analyzer)
- `palette-critique-panel.tsx` (the AI critique CTA, used inside the URL analyzer + palette page)

### 3. Export watermark for non-Pro tiers

The biggest single Free/Pro diff lever, per Gemini's review. New `src/lib/export-watermark.ts` `withSvgWatermark(svg, tier)` helper:

- Pro: returns the SVG untouched.
- Free + anonymous: appends a small "colorarchive.org" tag in the bottom-right corner, scaled to SVG size, before `</svg>`.
- Robust against missing dimensions (returns original; doesn't ship broken SVG).
- Wired into all 3 SVG export paths: single-color swatch (color detail page), shared palette (`/palette`), and image-extracted palette (`/image-palette`).

Two effects in one move:

- Every Free download becomes a passive marketing asset (recipient sees the URL).
- Removing the watermark becomes a concrete, visible reason to upgrade — far more concrete than abstract feature lists.

### 4. ProGate counter rendered upfront

Previously the Free quota counter only appeared *after* the user clicked. Now `<ProGate>` shows `Free: X/3 today · unlock unlimited` (slate), `Last free export today — Go Pro for unlimited` (amber), or `Daily limit hit — Go Pro for unlimited` (still amber, but locked) immediately on mount. Also exported a standalone `<ProGateCounter />` for headers / sidebars (unused yet; available for next sprint).

### Files

- `server/routes/ai.js` — `GET /ai/usage` endpoint
- `src/lib/auth-client.ts` — `fetchAiUsage`, `AiUsage` type
- `src/components/ai-usage-badge.tsx` — anon support + 3-state colour
- `src/components/url-analyzer-page.tsx` — badge in header
- `src/components/palette-critique-panel.tsx` — badge above CTA
- `src/lib/export-watermark.ts` — `withSvgWatermark`, `EXPORT_WATERMARK_TEXT`
- `src/lib/__tests__/export-watermark.test.ts` — 8 new tests
- `src/components/color-detail-page.tsx` — wired watermark into single-swatch SVG
- `src/components/palette-page.tsx` — wired watermark into palette SVG export
- `src/components/image-palette-page.tsx` — wired watermark into image-derived palette SVG
- `src/components/pro-gate.tsx` — upfront counter + tri-state messaging + new `ProGateCounter` export
- `STRUCTURE.md`

### Verified

- `npm run typecheck` clean
- `npx vitest run` — 547 tests pass (539 prior + 8 new watermark tests)

### Sprint 1 status — DONE

- [x] JPY currency labels
- [x] /palette-audit/ React #418 hydration fix
- [x] E2 Brand palettes SEO v1 (24 brand pages)
- [x] D1 Color Origins on all 5,446 color pages
- [x] **C1 Free/Pro paywall — visible AI quota + export watermark + upfront ProGate counter**

### Server next step (manual deploy)

The `GET /ai/usage` endpoint requires a Droplet pull + PM2 restart before the new badge will return real numbers for anonymous users:
```
ssh root@143.198.85.72 'cd /root/colorarchive/server && git pull && pm2 restart colorarchive-api'
```
Until then, `AiUsageBadge` will silently fail-fast (no badge rendered) — same behaviour as before.

### Next: Sprint 2

Per the revised plan: B1 Streak + B3 Color Journal **merged** ("打卡日记" — record today's color + a one-line note, drives daily return).

---

## 2026-05-02 (yet later) — Sprint 1 cont: D1 Color Origins on every color page

**Run type:** Remote (user-requested, "继续做 — 全权负责")

### D1 — Color Origins narrative on all 5,446 color detail pages

Per Gemini review: "D1 (Color Origins) is a stroke of genius — the absolute moat against pure-tool competitors. Make it Wikipedia-grade." Shipped a v1 that gives every one of the 5,446 static color pages ~600+ words of unique narrative content on top of the existing Color Psychology / WCAG / relationships sections.

**Strategy** (avoiding the trap of 5,446 hand-written articles):
- One rich "family heritage" piece per of the 10 color families (the 9 `ColorFamily` values + Neutral). Each piece has 4 sections — **Heritage**, **Across cultures**, **In the wild**, **How it reads** — each 80–500 chars.
- Per-color **modifier prose** generated at runtime from the color's lightness × saturation band (3 × 3 = 9 composite phrasings, plus standalone lightness and saturation reads). Composed with the family piece, every page gets unique copy.

**Source discipline:** psychology claims limited to associations supported by repeated cross-cultural research. Where research is contested or culture-specific, framed as "in [region]" rather than universal.

**Key content choices** (sample):
- Red — opens with cinnabar/Tyrian/cochineal trade, closes with Christian Louboutin's Pantone 18-1663 trademark.
- Blue — leads with the lapis-lazuli scarcity story, ends with "blue is the default of digital trust to the point of UX cliché".
- Green — the John Deere 1837 longest-continuous-brand-color note + the 555nm visual-system efficiency angle.
- Neutral — Vermeer's grays-from-spectrum-not-tube, Apple's "religion of neutrals", Muji's identity-of-no-identity.

**Files:**
- `src/lib/color-origins.ts` — `FAMILY_HERITAGES`, `getOriginFamily`, `getFamilyHeritage`, `getModifierProse`. Pure data + pure helpers, no React.
- `src/components/color-origins-section.tsx` — pure-display section, 4-up grid + a "this particular tone" callout.
- `src/components/color-detail-page.tsx` — injected `<ColorOriginsSection />` directly after the Design Context (Color Psychology) block.
- `src/lib/__tests__/color-origins.test.ts` — 8 new tests: every family covered; every section non-empty; `getOriginFamily` collapses sat<10 to Neutral; classification doesn't throw on any of the 5,446 colors; sample band-matching for extreme high/low saturation cases.

**Verified:** typecheck clean. 539 vitest tests pass (531 prior + 8 new).

**SEO impact estimation:** Each of 5,446 color pages gains roughly 600+ words of curated, family-tagged narrative content. Combined with existing JSON-LD Article schema, the pages should now compete on long-tail searches like "[color name] meaning", "history of [color]", and per-family terms ("history of crimson", "what cobalt means in design").

### Sprint 1 status

- [x] JPY label
- [x] Hydration fix
- [x] E2 Brand palettes v1
- [x] D1 Color Origins v1
- [ ] C1 Free/Pro paywall tightening (next session)

---

## 2026-05-02 (later) — Sprint 1 partial: JPY label + hydration fix + brand palettes SEO v1

**Run type:** Remote (user-requested, "全权负责")

**Context:** Acting on the Gemini-revised plan ([dev-plan-2026-05-02-growth.md](./docs/dev-plan-2026-05-02-growth.md) + [gemini-review-2026-05-02.md](./docs/gemini-review-2026-05-02.md)). Sprint 1 was reordered to put programmatic SEO assets first (longest ramp time → ship earliest).

### 1. JPY currency annotation (quick win)

`¥499` could be misread as RMB by Chinese visitors when it's actually JPY (≈ $6.99 USD). Added explicit `currency: "JPY"` field to `proSubscriptionConfig` and `teamPlanConfig`, and rendered the JPY label + USD equivalent next to every price on `/pro/`, in the upgrade modal, and on `/support/` FAQ.

Files: `src/lib/checkout-config.ts`, `src/components/pro-page.tsx`, `src/components/upgrade-modal.tsx`, `src/components/support-page.tsx`.

### 2. React #418 hydration fix on /palette-audit/ (zh locale)

[docs/human-todo.md](./docs/human-todo.md) had this reopened — intermittent `Minified React error #418` only on `/palette-audit/` under zh locale. Root cause guess from human-todo was a localeScript ↔ LocaleProvider race, but the page itself doesn't use `useLocale()`. Real fix: move the audit-result render tree behind a `mounted` flag so SSR + first hydrate emit the same skeleton, regardless of any race condition (locale, font swap, extension injection).

Files: `src/components/palette-audit-page.tsx`.

### 3. E2 — Brand color palettes SEO landing pages v1

The biggest single growth lever per Gemini's review: programmatic SEO targeting "[Brand X] color palette" long-tail queries.

- **24 brands** across 9 categories (Tech, SaaS, Design, Dev, Social, Media, Consumer, Fintech, China Internet) — Apple, Google, Microsoft, Notion, Linear, Figma, GitHub, Stripe, Vercel, Supabase, Spotify, Netflix, Airbnb, Discord, Slack, X (Twitter), Instagram, TikTok, Reddit, Pinterest, Coca-Cola, Starbucks, McDonald's, Nike, WeChat.
- Each palette includes named colors with role tags (primary/secondary/accent/neutral/background), design rationale, source URL + as-of date, and an unofficial-reference disclaimer with takedown path.
- Detail page renders a "Closest in ColorArchive" link for every brand color (via `findClosestArchiveColor`), turning each brand page into a discovery surface for the 5,446-color archive.
- Static generation: `generateStaticParams()` pre-renders all 24 brand pages + the index. Routes added to `app/sitemap.ts` (priority 0.78 / 0.72).
- Internal linking: footer chip + sibling-brands grid on each detail page.

New routes:
- `app/brands/page.tsx` — index
- `app/brands/[slug]/page.tsx` — 24 detail pages

New components:
- `src/components/brands-index-page.tsx`
- `src/components/brand-detail-page.tsx`

New lib:
- `src/lib/brand-palettes.ts` — typed palette data + helpers

Other:
- `src/components/site-header.tsx` — added `/brands` to `currentPath` union
- `src/components/site-footer.tsx` — added Brands chip
- `STRUCTURE.md` — recorded new routes / components / data file

### Verified

- `npm run typecheck` ✓ (clean)
- `npx vitest run` ✓ (531 tests pass, 19 files)

### What we deliberately did NOT do (per revised plan)

- ❌ A1 Your Year Color (cut by Gemini; ToC virality without retention is a leaky bucket)
- ❌ B1 Streak system (deferred to Sprint 3-4; merge with B3 Color Journal at that point)
- ❌ Figma plugin / VS Code Pro sync (F-track, planned for Sprint 5-6 once SEO + paywall are validated)

### Sprint 1 status

- [x] JPY label
- [x] Hydration fix
- [x] E2 Brand palettes v1
- [ ] D1 Color Origins v1 (next session)
- [ ] C1 Free/Pro paywall tightening (next session)

---

## 2026-05-02 — Growth-oriented dev plan + Gemini 3.1 Pro review

**Run type:** Remote (user-requested)

**Output:**
- [docs/dev-plan-2026-05-02-growth.md](./docs/dev-plan-2026-05-02-growth.md) — 90-day plan reframing focus from "more features" to "viral coefficient + retention + conversion". 3 main tracks (A growth / B retention / C revenue) + 2 side tracks (D signature / E discovery), with Sprint 1–6 schedule, north-star metrics, and explicit "do-not-do" list.
- [docs/gemini-review-2026-05-02.md](./docs/gemini-review-2026-05-02.md) — Gemini Pro review (7.5/10) via `gemini -m pro` stdin pipe. Surfaced 3 must-fix items the original plan missed:
  1. **Cut A1 (Your Year Color)** — ToC-style virality has no LTV when retention is broken; concentrate on A2.
  2. **Promote D1 + E2 (programmatic SEO) to Sprint 1–2** — SEO needs ramp-up time; the longer it waits the longer the dry spell.
  3. **Add F-track: Figma plugin + VS Code extension as the Pro Aha moment** — biggest blind spot. Web-app daily streaks won't beat "ColorArchive Palette syncs into the Figma frame I'm editing right now". Already-built plugin + extension are unused growth assets.

**Other findings worth acting on:**
- B1 (Streak) and B3 (Color Journal) should be **merged** — pure streaks without recorded value collapse fast.
- Pro pricing UI displays `¥499` (JPY) but Chinese users default-read `¥` as RMB. Add `JPY` / `日元` annotation in localized copy.
- E1 (Xiaohongshu content factory) downgraded to "single-template per week", not a full content shop — solo dev can't run it.

**Decision matrix recorded** in the review doc; next session can pick up the revised Sprint plan directly.

**Files modified (3):**
- docs/dev-plan-2026-05-02-growth.md (new)
- docs/gemini-review-2026-05-02.md (new)
- autopilot-log.md (this entry)

---

## 2026-04-19 — Color-of-the-Day v2: golden-angle hue rotation

**Run type:** Remote (user-requested)

**Problem:** Daily COTD selections were visually monotonous — 9 consecutive days (2026-04-01 to 04-09) all fell in the Clover/Emerald/Mint hue family. Root cause: djb2 hash on `YYYY-MM-DD` (which differ by 1 char/day) produced near-sequential hashes → adjacent indices in a root-ordered `heroColors` array → same hue family for 7–9 days in a row.

**Fix:** Replaced the date-hash selection with a golden-angle (137.508°) hue rotation + weighted nearest-neighbor snap with circular hue distance. Integer-first arithmetic (per Gemini 2.5 Pro review) guarantees Node / Next.js / iOS Swift return byte-identical results for any date.

Files:
- `server/colors.js` — new `getColorOfDay()` algorithm
- `src/lib/color-of-day.ts` — mirror
- `ios/ColorArchive/Utils/ColorOfDay.swift` — Swift port with `Int64` math
- `docs/color-of-day-redesign.md` — full design doc (Codex + Gemini review log)
- `scripts/verify-cotd.mjs` — parity + diversity verification

**Verified:**
- Parity: 10/10 sample dates match server vs TS reference (incl. pre-epoch 2020-01-01)
- Diversity (30 days starting 2026-04-19): min consecutive-day hue gap **130°**, mean **137.6°**, zero 3-in-a-row same-root runs
- `npm run typecheck` passes

**Impact:** Instagram, Pinterest, email newsletter, Xiaohongshu manual posts, and iOS app all pick visibly different colors every day going forward. Existing stored references (historical pins, posts) still point to specific color IDs and remain valid.

**Phase 2 (queued, separate PR):** Xiaohongshu mood palette (4-color board with analogous + complementary companions) to further differentiate XHS feed visually. Gemini & Codex both recommended shipping Phase 1 alone first.

**Droplet next step (manual):** `ssh root@143.198.85.72 'cd /root/colorarchive/server && git pull && pm2 restart colorarchive-api'`

---

## 2026-04-18 — Auto-dev Run: Add ESLint + Prettier config

**Run type:** Auto-dev rotation (Group A, slot 2 — ColorArchive)

**Task:** focus_priority #2 — Add ESLint + Prettier config

Added ESLint 9 + Prettier 3 configuration to standardize code quality tooling:
- `eslint.config.mjs` — Flat config with typescript-eslint, @next/eslint-plugin-next, react-hooks, jsx-a11y, prettier integration
- `.prettierrc` — Standard formatting: 100 char width, double quotes, trailing commas
- `.prettierignore` — Excludes .next/, node_modules/, generated files, next-env.d.ts
- `package.json` — Added devDependencies + `lint` / `format` scripts

ESLint surfaces 174 existing issues (106 errors, 68 warnings) — pre-existing findings, not regressions. All 506 Vitest tests pass.

**Next run suggestion:** Fix ESLint errors in batches (jsx-a11y label issues, react-hooks setState-in-effect, typescript-eslint unused-vars).

---

## 2026-04-16 — Auto-dev Run: Newsletter 346-349 (Oct 2033) + 3 collections + 2 guides

**Run type:** Auto-dev rotation (Group A, slot 2 — ColorArchive)

**Categories:** A. SEO & Content (newsletter + guides), D. Data & Collections

### Category A — Newsletter Issues 346–349 (October 2033)

- **Issue 346** (oct-2033-color-in-craft-design, 2033-10-01): Color in craft and artisan design — constraint as a design system, batch variation and dye lot management, ceramic glaze color specification (oxidation vs reduction firing), cross-medium specification (screen to craft)
- **Issue 347** (oct-2033-color-material-perception, 2033-10-07): Surface finish and color perception — specular vs diffuse reflection, why matte appears less saturated than gloss, satin as practical middle ground, transparency and layering effects, building a material reference library
- **Issue 348** (oct-2033-color-urban-environments, 2033-10-14): Color in urban environments — transit system color design (London Underground model), historic district color guidelines, temporary color installation in urban space, color for psychological space design
- **Issue 349** (oct-2033-color-consumer-behavior, 2033-10-21): Color and consumer behavior research — the "85% of purchasing decisions" myth debunked, what attention/categorization research shows, contested quality perception findings, color-category fit as the reliable principle

Total newsletter issues: **349** (was 345, +4 this run)

### Category D — 3 New Collections (now 259)

- **forest-rain**: Pacific Northwest rain forest — moss-dusk-soft, leaf-shadow-muted, jade-velvet-muted, steel-tone-muted, cool-gray-shadow, teal-shadow-soft. After a downpour: saturated mosses against grey-green bark, silver fog light, deep mahogany wet cedar.
- **harvest-amber**: Autumn harvest — amber-tone-soft, honey-dusk-muted, saffron-velvet-muted, ember-shadow-soft, olive-dusk-muted, warm-gray-tone. Gold of ripe wheat, amber of dried corn, burnt sienna of turned earth, barn wood, late-season foliage.
- **night-bloom**: Night-blooming garden — indigo-nocturne-soft, violet-shadow-muted, blush-veil-faint, sage-gray-whisper, amber-whisper-muted, plum-velvet-soft. Deep indigo sky, pale moon-white flowers, muted sage leaves, warm candlelight note.

### Category A — 2 New SEO Guides (now 317)

- **color-in-craft-artisan-design-guide**: Craft color systems — constraint as aesthetic, batch variation, ceramic specification, cross-medium workflows
- **color-surface-finish-perception-guide**: Surface finish and color — matte vs gloss physics, satin middle ground, transparency/layering, material reference library practice

**Files modified (5):**
- src/data/newsletter-issues.json (349 issues, was 345)
- src/lib/collections.ts (+forest-rain, +harvest-amber, +night-bloom, now 259)
- src/lib/guides.ts (+2 guides in extraGuides56, now 317 total)
- STRUCTURE.md (updated all counts)
- autopilot-log.md (this entry)

## 2026-03-23 — Normal Run: Newsletter 118-121 + 2 collections + 3 guides (commit 716e493)

**Run type:** Normal (run #3 since last big run `55fb5f9`)

**Categories:** A. SEO & Content (newsletter + guides), D. Data & Collections

### Category A — Newsletter Issues 118–121 (April 2028)

- **Issue 118** (apr-2028-color-temperature-ui, 2028-04-01): Color temperature in UI design — warm/cool systems as a system-level decision, temperature in neutral colors (highest-leverage decision), handling dark mode temperature, using temperature contrast for state design, and a practical method for measuring and building temperature-aware palettes
- **Issue 119** (apr-2028-color-typeface-pairing, 2028-04-08): Pairing color with typefaces — optical weight concept, building text hierarchy using lightness-first approach, reversed type on dark backgrounds (irradiation effect, warm off-white tip), brand color in type (when and when not to use it), pairing color with typeface categories (high-contrast serif, geometric sans, humanist sans, display)
- **Issue 120** (apr-2028-dark-mode-adaptation, 2028-04-15): Dark mode color adaptation — Helmholtz-Kohlrausch effect (colors appear more vivid at low luminance), halation problem and fixes, surface hierarchy with small lightness steps, maintaining brand identity across themes, status colors in dark mode, 5-point dark mode testing checklist
- **Issue 121** (apr-2028-color-ecommerce, 2028-04-22): Color in e-commerce — trust as prerequisite for purchase, urgency color hierarchy (3 levels), product photography interaction with UI color, add-to-cart button as highest-stakes color decision, price anchoring and promotional color, category page color strategy, color accuracy and return rate relationship

Total newsletter issues: **122** (was 118, +4 this run)

### Category D — 2 New Collections (now 47)

- **desert-terrain**: Warm desert palette — ember-tone-muted, coral-bloom-muted, honey-mist-soft, olive-tone-muted, merlot-dusk-muted. For southwestern aesthetics, earthy editorial, sun-weathered brand identities. Traces the spectrum from terracotta tile to iron-red canyon stone with desert sage as cool counterweight.
- **winter-botanical**: Seasonal botanical palette — emerald-dusk-soft, jade-velvet-muted, leaf-shadow-soft, garnet-radiant-clear, blush-pearl-muted. For seasonal editorial, luxury holiday packaging, garden and plant brand identities. Evokes botanical illustration books in the dormant season: dark evergreen + winter berry + winter sky cream.

Total collections: **47** (was 45)

### Category A — 3 New SEO Guides (now 82)

- **color-gradients-design-guide**: CSS gradient interpolation space and gray-band artifact, tonal vs hue-arc gradients, gradient direction as compositional choice, three-stop technique, gradient backgrounds for UI, mesh gradients, choosing gradient colors from a palette system — targets 'color gradients design guide'
- **oklch-perceptual-color-design-guide**: OKLCH vs HSL perceptual uniformity, L/C/H parameters, building perceptually even lightness scales, equal-chroma multi-hue palettes, OKLCH gradients solving gray-band problem, CSS oklch() browser support, migration strategy from HSL — targets 'oklch color design guide perceptual color space'
- **color-for-mobile-ui-guide**: OLED vs LCD dark mode differences, ambient lighting legibility, touch target color requirements, WCAG at mobile scale, navigation/tab bar color hierarchy, system colors vs brand colors, mobile dark mode optimization — targets 'color for mobile UI design guide'

**Files modified (4):**
- src/data/newsletter-issues.json (122 issues, was 118)
- src/lib/collections.ts (+desert-terrain, +winter-botanical, now 47 collections)
- src/lib/guides.ts (+3 guides in extraGuides8, now 82 total)
- STRUCTURE.md (updated all counts)

**Commit:** 716e493
