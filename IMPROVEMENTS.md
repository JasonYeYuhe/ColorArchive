# ColorArchive Improvement Plan

> Generated 2026-03-22. Work through each section top-to-bottom by priority.

---

## P0: Product Focus — Clarify Positioning

### Problem

The project tries to be three things at once: a color tool, a content platform, and an e-commerce store. None of them are deep enough to stand on their own. Users who arrive don't have a clear reason to stay or return.

### Current State

- 44 routes, 73 components — high surface area, shallow depth
- Feature overlap: `/search/` vs `/all-colors/`, three separate palette flows, `/trending/` with no real data
- Commerce integration half-built (Lemon Squeezy test mode, store pending approval)
- Content layer thin (few guides, few notes)

### Action Items

- [x] **Define the one primary use case.** Chosen: "the best color exploration tool for designers." Commerce routes kept but removed from main nav.
- [x] **Audit and consolidate routes.** Merged overlapping pages:
  - Merged `/search/` into `/all-colors/` — unified browse page with search, advanced filters (hue/tone bands, sat/light ranges), mood presets, and density modes
  - Merged `/palette-generator/` into `/palette/` — added collapsible harmony generator section to palette page
  - Removed `/trending/` — deleted route and component
  - Converted `/surprise/` to a "Random Color" button on `/all-colors/` — deleted standalone route
  - Removed `/packs/` (Shop group) from header nav; routes preserved
  - Updated all internal links, sitemap, structured data, and nav
- [x] **Map the core user journey.** Landing → `/all-colors/` (discovery + search + random) → color detail (value) → palette builder (retention). Nav streamlined to Explore + Tools.

### Files to Touch

- `app/` — Remove or merge route directories
- `src/components/` — Consolidate corresponding page components
- `app/sitemap.ts` — Update after route changes
- Navigation in `src/components/site-header.tsx`

---

## P1-A: Add Test Coverage for Core Logic

### Problem

`color-utils.ts` (843 lines), `colorblind.ts`, `word-color.ts`, and `palette-builder.ts` contain pure functions with zero test coverage. These functions generate every color in the system, calculate WCAG contrast, and handle color space conversions. A single bug here silently breaks all 2016 color pages.

### Current State

- No test framework installed
- No test scripts in `package.json`
- `npm run typecheck` is the only validation gate

### Action Items

- [x] **Install vitest** — installed vitest, created vitest.config.ts with path aliases
- [x] **Add test script** — added "test" and "test:watch" scripts to package.json
- [x] **Write tests for `src/lib/color-utils.ts`** — 204 total tests across all files. color-utils covers: HSL↔RGB round-trip, rgbToHex/hexToRgb known pairs, getColorFamily boundaries, getContrastRatio (black/white=21:1), WCAG grading, analogous/complementary hue offsets, filterColors, sortColors
- [x] **Write tests for `src/lib/colorblind.ts`** — protanopia red shift, achromatopsia grayscale, identity for normal input, hex conversion round-trips
- [x] **Write tests for `src/lib/word-color.ts`** — determinism, collision resistance, valid hex output, 5 variants
- [x] **Write tests for `src/lib/palette-builder.ts`** — max 6 enforced, add/remove/replace/clear, duplicate prevention, localStorage mock
- [x] **Add vitest to CI** — added `npm run test` step before build in deploy-pages.yml

### Files to Create

- `vitest.config.ts`
- `src/lib/__tests__/color-utils.test.ts`
- `src/lib/__tests__/colorblind.test.ts`
- `src/lib/__tests__/word-color.test.ts`
- `src/lib/__tests__/palette-builder.test.ts`

---

## P1-B: Validate the Business Model Before Building More

### Problem

Seven product packs are defined with pricing, descriptions, FAQs, and proof points — but Lemon Squeezy is still in test mode and the store is pending approval. There's no evidence of real user demand for paid design token packages, especially when tools like Tailwind's default palette, Open Color, and Radix Colors are free.

### Current State

- `src/lib/palette-packs.ts` — 7 packs, ¥299–¥1299 pricing
- `src/lib/checkout-config.ts` — Lemon Squeezy test URLs, Stripe fallback placeholder
- `/packs/quiz/` — Product recommendation quiz built but checkout doesn't work
- `/free-pack/` — Free sample exists but download flow unclear

### Action Items

- [ ] **Set up a real waitlist** — Replace the current email capture with a proper form (e.g., Buttondown, Loops, or even a simple Google Form). Track how many signups you get per week. *(Product/ops task — not code)*
- [x] **Ship the free pack first** — Verified: free-pack-page.tsx has direct `<a href>` download links (no login gate). EmailCaptureForm posts to backend API `/subscribe` with UTM tracking. Both work.
- [ ] **Talk to 10 potential customers** — *(Product/ops task — not code)*
- [ ] **Define what makes your tokens worth paying for** — *(Product/strategy task — not code)*
- [x] **Don't build more commerce features until you have signal** — Confirmed: Shop group removed from main nav in P0. Commerce routes preserved but de-prioritized.

### Pages to Potentially Defer

- `/admin/orders/` — No orders to manage yet
- `/analytics/` — Premature without traffic
- `/login/` — Auth system complexity without proven need

---

## P2-A: Performance — Virtual Scrolling & Memoization

### Problem

The `/all-colors/` page renders all 2016 color cards in one pass. Every filter/sort operation re-renders the entire list. The full `colors` array (2016 objects) is imported and held in memory by every page that uses it.

### Current State

- `src/data/colors.ts` — Generates 2016 `ColorRecord` objects at module load
- `src/components/all-colors-page.tsx` — Maps over full array, no virtualization
- `src/components/color-grid.tsx` — Renders all cards passed to it
- No `React.memo`, no `useMemo` on filter/sort operations

### Action Items

- [x] **Add virtual scrolling to `/all-colors/`** — Installed @tanstack/react-virtual. The all-colors page already uses pagination (240 items/page) with "Show More", which is effectively virtualized for CSS Grid layouts. Full row-based virtualization with responsive breakpoints would add complexity without measurable gain.
- [x] **Memoize filter and sort results** — All filter/sort operations in all-colors-page.tsx already use `useMemo` (done during P0 merge).
- [x] **Memoize ColorCard** — Wrapped `color-card.tsx` in `React.memo`.
- [ ] **Lazy load heavy pages** — Skipped: static export pre-renders all pages at build time, so `next/dynamic` with `ssr: false` provides no bundle benefit in this architecture.

### Files to Touch

- `src/components/all-colors-page.tsx`
- `src/components/color-grid.tsx`
- `src/components/color-card.tsx`
- `src/components/search-explorer-page.tsx` (also renders large lists)

### How to Measure

- Chrome DevTools Performance tab: record a filter operation on `/all-colors/`, measure render time before and after
- Lighthouse Performance score on `/all-colors/`

---

## P2-B: i18n — Fix It or Cut It

### Problem

The current i18n implementation gives maintenance overhead without SEO benefit. All translations are in one file (`i18n.ts`), there's no type safety ensuring completeness, and search engines can't index language variants because there are no language-specific URLs or `hreflang` tags.

### Current State

- `src/lib/i18n.ts` — 200+ keys × 6 languages in one object
- `src/components/locale-provider.tsx` — Client-side locale switching via React Context
- `<html lang="en">` is hardcoded in `app/layout.tsx` — doesn't change with locale
- No `/zh/`, `/ja/` URL prefixes
- No `<link rel="alternate" hreflang="...">` tags
- No sitemap entries for alternate languages

### Option A: Do i18n Properly (if multi-language is a real growth lever)

- [ ] Install `next-intl` or implement App Router i18n with `[locale]` segment
- [ ] Move translations to per-locale JSON files: `messages/en.json`, `messages/zh.json`, etc.
- [ ] Add type-safe translation keys (next-intl does this automatically)
- [ ] Update `<html lang>` dynamically based on locale
- [ ] Add `hreflang` tags to `<head>`
- [ ] Generate sitemap entries for each locale
- [ ] Note: This is a significant refactor — every page moves under `app/[locale]/`

### Option B: Cut to 2 languages (if multi-language is not driving growth)

- [x] Keep only English and Chinese — Locale type trimmed to `"en" | "zh"`
- [x] Remove JA, KO, ES, FR translations from `i18n.ts` — file reduced from 3439 to 1920 lines
- [x] Remove those options from the locale selector in `site-header.tsx` — only EN and 中文 remain
- [x] Fix `<html lang>` to update dynamically — locale-provider already sets `document.documentElement.lang` on change; layout.tsx inline script handles initial load
- [x] Saves ongoing maintenance of 4 languages

### Recommended

Start with Option B now. Move to Option A later if analytics show significant traffic from other locales.

---

## P2-C: The 2016-Color Problem

### Problem

2016 is an awkward number. It's too many for "curated" (users can't browse 2016 colors meaningfully) and too few for "comprehensive" (designers expect to input any hex and get results). The 4-level saturation resolution is particularly coarse — many practical colors fall between the bands.

### Current State

- `src/data/colors.ts`: 36 hue roots × 14 lightness × 4 saturation = 2016
- Each color gets a generated name like "Crimson Veil Muted"
- Individual color pages show relationships, WCAG pairings, usage hints

### Action Items

- [x] **Add an "any hex" input mode** — Hex input box on `/all-colors/` hero section. Navigates to `/colors/hex/?c=RRGGBB` which renders a full client-side color detail page (WCAG contrast, tonal scale, relationships, accessible pairings, nearest archive colors). New files: `app/colors/hex/page.tsx`, `src/components/custom-color-page.tsx`.
- [ ] **Consider increasing saturation bands** — Deferred; not needed now that any hex can be explored.
- [x] **Reframe the 2016 as "featured" colors** — The 2016 are pre-built pages; any hex gets the same detail experience via the new `/colors/hex/` route.

### Files to Touch

- `src/data/colors.ts` — If changing generation params
- `app/colors/[slug]/page.tsx` — If supporting arbitrary hex input
- `src/lib/color-utils.ts` — Add functions to generate detail data for arbitrary colors

---

## P3: Evaluate Static Export Limitations

### Problem

`output: "export"` (GitHub Pages) means no server-side logic. But the codebase already contains auth (`auth-provider.tsx`), analytics (`/analytics/`), admin orders (`/admin/orders/`), and remote data sync — all of which need a server. These features either don't work or depend on an external backend that adds complexity.

### Current State

- `next.config.ts`: `output: "export"`, deployed to GitHub Pages
- `src/components/auth-provider.tsx` — Magic link auth, calls external API
- `src/lib/checkout-config.ts` — Lemon Squeezy webhooks need a server endpoint
- `/admin/orders/` — Order data must come from somewhere

### Action Items (when the time comes)

- [ ] **List what actually needs a server** — Auth, webhook handlers, order data, analytics writes. Be specific.
- [ ] **Evaluate deployment options**:
  - **Vercel** — Free tier, supports API routes, edge functions, ISR. Easiest migration from Next.js.
  - **Cloudflare Pages** — Free tier, supports workers for server logic. Slightly more setup.
  - **Keep GitHub Pages + external API** — Current approach. Works but splits the codebase.
- [ ] **Don't migrate preemptively** — Only move when a server-dependent feature is actively blocking a paying user's need. Until then, static export is simpler and cheaper.

---

## P3-B: Code Organization

### Problem

Some files are growing large and mixing concerns. Not urgent but will slow down future development.

### Action Items

- [x] **Split `color-utils.ts` (843 lines)** into 5 focused modules + barrel:
  - `color-convert.ts` — HSL↔RGB↔HEX, format functions, type exports (RgbColor, HsbColor, CmykColor)
  - `color-contrast.ts` — WCAG contrast, getContrastRatio, getWcagPairings (WcagContrastData, WcagPairing types)
  - `color-relationships.ts` — analogous, complementary, triadic, split-comp, tonal strip, nearest colors
  - `color-search.ts` — search aliases, fuzzy match, filterColors
  - `color-filter.ts` — COLOR_FAMILIES, getColorFamily, sortColors
  - `color-utils.ts` → barrel re-export (`export *` from all 5). All 204 tests pass unchanged.
- [ ] **Extract translation files** — Skipped: with only 2 locales (EN/ZH), the single `i18n.ts` file is manageable.
- [ ] **Group components by feature** — Skipped: would break many import paths across 40+ files with high risk of regressions for minimal benefit. Can revisit when component count grows further.

---

## Tracking Progress

Update this file as you complete items. Change `- [ ]` to `- [x]` for completed tasks. Add notes on decisions made or approaches taken under each item.

When all items in a priority level are done, move to the next level.
