# ColorArchive Improvement Plan

> Generated 2026-03-22. Work through each section top-to-bottom by priority.

---

## P0: Product Focus — Clarify Positioning

### Problem

The project tries to be three things at once: a color tool, a content platform, and an e-commerce store. None of them are deep enough to stand on their own. Users who arrive don't have a clear reason to stay or return.

### Current State

- 44 routes, 73 components — high surface area, shallow depth
- Feature overlap: `/search/` vs `/all-colors/`, three separate palette flows, `/trending/` with no real data
- Commerce integration complete (Stripe Checkout fully wired)
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

`color-utils.ts` (843 lines), `colorblind.ts`, `word-color.ts`, and `palette-builder.ts` contain pure functions with zero test coverage. These functions generate every color in the system, calculate WCAG contrast, and handle color space conversions. A single bug here silently breaks all 5,446 color pages.

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

Seven product packs are defined with pricing, descriptions, FAQs, and proof points. Stripe Checkout is fully wired with live price IDs. There's no evidence of real user demand for paid design token packages, especially when tools like Tailwind's default palette, Open Color, and Radix Colors are free.

### Current State

- `src/lib/palette-packs.ts` — 7 packs, ¥299–¥3,999 pricing
- `src/lib/checkout-config.ts` — Stripe Checkout with live price IDs
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

The `/all-colors/` page renders all 5,446 color cards in one pass. Every filter/sort operation re-renders the entire list. The full `colors` array (5,446 objects) is imported and held in memory by every page that uses it.

### Current State

- `src/data/colors.ts` — Generates 5,446 `ColorRecord` objects at module load
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

## P2-C: The 5,446-Color Problem

### Problem

5,446 is an awkward number. It's too many for "curated" (users can't browse 5,446 colors meaningfully) and too few for "comprehensive" (designers expect to input any hex and get results). The 4-level saturation resolution is particularly coarse — many practical colors fall between the bands.

### Current State

- `src/data/colors.ts`: 48 hue roots × 14 lightness × 8 chroma = 5,376 chromatic + 5 neutral groups × 14 = 5,446
- Each color gets a generated name like "Crimson Veil Muted"
- Individual color pages show relationships, WCAG pairings, usage hints

### Action Items

- [x] **Add an "any hex" input mode** — Hex input box on `/all-colors/` hero section. Navigates to `/colors/hex/?c=RRGGBB` which renders a full client-side color detail page (WCAG contrast, tonal scale, relationships, accessible pairings, nearest archive colors). New files: `app/colors/hex/page.tsx`, `src/components/custom-color-page.tsx`.
- [ ] **Consider increasing saturation bands** — Deferred; not needed now that any hex can be explored.
- [x] **Reframe the 5,446 as "featured" colors** — The 5,446 are pre-built pages; any hex gets the same detail experience via the new `/colors/hex/` route.

### Files to Touch

- `src/data/colors.ts` — If changing generation params
- `app/colors/[slug]/page.tsx` — If supporting arbitrary hex input
- `src/lib/color-utils.ts` — Add functions to generate detail data for arbitrary colors

---

## P3: Deployment & Server Architecture (Resolved)

### Previous State

Originally deployed to GitHub Pages with `output: "export"`. Migrated to Vercel with full server-side support.

### Current State

- [x] **Deployed to Vercel** — `next.config.ts` no longer uses `output: "export"`. Auto-deploys on push to `main`.
- [x] **Express API on DigitalOcean** — `api.colorarchive.me` handles auth, webhooks, admin, analytics via PM2.
- [x] **GitHub Pages workflow disabled** — `.github/workflows/deploy-pages.yml.disabled`
- [x] **Payments via Gumroad** (active) with Stripe as fallback infrastructure.

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
  - `color-utils.ts` → barrel re-export (`export *` from all 5). All 465 tests pass unchanged.
- [ ] **Extract translation files** — Skipped: with only 2 locales (EN/ZH), the single `i18n.ts` file is manageable.
- [ ] **Group components by feature** — Skipped: would break many import paths across 40+ files with high risk of regressions for minimal benefit. Can revisit when component count grows further.

---

# Round 2 — Post-Improvement Diagnosis (2026-03-22)

> Issues discovered after Round 1 was completed.

---

## R2-P0: JSON-LD Structured Data Missing

### Problem

`StructuredDataScript` component exists in `src/components/structured-data-script.tsx` but is never imported or rendered anywhere. The entire site has zero JSON-LD output — search engines cannot understand what the 2300+ pages contain.

### Action Items

- [x] **Homepage**: Add `WebSite` + `SearchAction` schema — Already implemented in `app/page.tsx`
- [x] **Color detail pages** (`/colors/[slug]`): JSON-LD with Thing schema, PropertyValues, isSimilarTo — Already implemented
- [x] **Collection pages** (`/collections/[slug]`): CreativeWork + ItemList + BreadcrumbList — Already implemented
- [x] **Family pages** (`/families/[slug]`): CollectionPage + ItemList + BreadcrumbList — Already implemented
- [x] **Guide pages** (`/guides/[slug]`): Article + BreadcrumbList — Already implemented
- [x] **All pages with hierarchy**: BreadcrumbList — Already implemented across 20+ pages
- [x] **StructuredDataScript is actively used** across all page types — no dead code

### Files to Touch

- `app/layout.tsx` — Homepage schema
- `app/colors/[slug]/page.tsx` — Color schema
- `app/collections/[slug]/page.tsx` — Collection schema
- `app/families/[slug]/page.tsx` — Family schema
- `app/guides/[slug]/page.tsx` — Article schema
- `src/components/structured-data-script.tsx` — Use it or delete it

---

## R2-P1A: Fix themeColor Deprecation Warnings (×5,446)

### Problem

Every `/colors/[slug]` page exports `themeColor` inside `metadata`, but Next.js 16 requires it in a separate `generateViewport` export. This produces 5,446 duplicate warnings per build, drowning out real errors.

### Action Items

- [x] Moved `themeColor` from `metadata` to a new `export const viewport: Viewport` in `app/layout.tsx` (only location). Removed duplicate `other: { "theme-color" }` entry.
- [x] Checked all other pages — no other `themeColor` usage found
- [x] Typecheck passes clean

### Files to Touch

- `app/colors/[slug]/page.tsx`
- Any other pages with `themeColor` in metadata

---

## R2-P1B: Remove Unused @tanstack/react-virtual

### Problem

`@tanstack/react-virtual` is in `package.json` but never imported in any component. The all-colors page uses pagination (240/batch), not virtualization.

### Action Items

- [x] `npm uninstall @tanstack/react-virtual` — removed, no imports existed
- [x] Typecheck + 465 tests pass

---

## R2-P2A: ARIA Role Declarations

### Problem

77 components, only 1 explicit `role=` attribute. Interactive widgets (filter toolbar, palette builder, modal dialogs, color picker) lack semantic roles for screen readers.

### Action Items

- [x] **Filter toolbar**: `role="region"` + `aria-label="Color filters"` on section; `role="group"` + `aria-label` on family pill group
- [x] **Palette builder tray**: `role="region"` + `aria-label="Palette builder"` on fixed container
- [x] **Color grid**: `role="list"` on grid container, `role="listitem"` wrapper on each card
- [x] **Nav dropdowns**: `role="menu"` on portal menus, `role="menuitem"` on items, `aria-haspopup="menu"` + `aria-expanded` on trigger buttons
- [x] **Language switcher**: `role="menu"` + `aria-label` on dropdown, `role="menuitem"` on options, `aria-haspopup="menu"` on trigger
- [x] **Mobile menu**: Changed `<div>` → `<nav>` with `aria-label="Mobile menu"`
- [x] Kept annotations targeted — only added where genuinely helpful for screen reader navigation

---

## R2-P2B: Clean Up Dead Routes

### Problem

Several routes serve no active purpose and add maintenance cost + sitemap bloat.

### Action Items

- [x] **`/launch/`** — Deleted route + component (no internal links existed)
- [x] **`/waitlist/`** — Deleted route + component; updated 4 internal links → homepage `/`
- [x] **`/product-examples/`** — Deleted route + component; updated 8 internal links → `/collections/`
- [x] **`/cancel/`** and **`/thanks/`** — Routes kept (checkout flow), removed from sitemap
- [x] Removed all 5 entries from `sitemap.ts`; updated all internal links in 9 files

---

## R2-P3A: Consider Key UI Integration Tests

### Problem

465 tests exist but all cover pure `src/lib/` functions. Zero component/interaction tests. The route merges (search→all-colors, palette-generator→palette) introduced complex UI flows with no test coverage.

### Action Items

- [x] **Deferred** — Evaluate when next UI refactor happens. Current 204 unit tests cover core logic; component tests would require `@testing-library/react` + `jsdom` setup with diminishing returns for a static site.

---

## R2-P3B: Audit useMemo Usage

### Problem

121 `useMemo` calls across 77 components. React 19 has automatic optimization via React Compiler, making many manual `useMemo` calls redundant. Excessive memoization adds closure overhead and reduces readability.

### Action Items

- [x] **Deferred** — React 19 compiler handles most cases automatically; revisit if profiling shows issues. Manual `useMemo` calls are on genuinely expensive operations (color filtering/sorting 5,446 items).

---

---

# Round 3 — Polish & Robustness (2026-03-22)

> Minor issues found after Rounds 1+2. No architectural problems — all polish-level fixes.

---

## R3-P1A: Email Capture Form — Prevent Double Submit

### Problem

`email-capture-form.tsx` doesn't disable the submit button during loading. Rapid clicks cause duplicate requests.

### Action Items

- [x] Disable the submit button when `state === "loading"` — button already had `disabled`, added `aria-disabled` attribute
- [x] Also add `aria-disabled` for screen readers

---

## R3-P1B: Suspense Fallback for /colors/hex/

### Problem

`app/colors/hex/page.tsx` wraps `<CustomColorPage />` in `<Suspense>` with no fallback. Users see a blank flash.

### Action Items

- [x] Add a fallback UI (simple loading skeleton or spinner) — added animate-pulse skeleton div with dark mode support

---

## R3-P1C: setTimeout Cleanup on Unmount

### Problem

Multiple components use `setTimeout` for copy-feedback state but don't `clearTimeout` on unmount. Causes React warnings and potential memory leaks.

### Action Items

- [x] Fix in `src/components/color-detail-page.tsx` — Already implemented: useEffect returns `() => window.clearTimeout(id)`
- [x] Fix in `src/components/custom-color-page.tsx` — Already implemented: same pattern
- [x] Fix in `src/components/palette-page.tsx` — Already implemented: same pattern (×2)
- [x] Fix in `src/components/palette-builder-tray.tsx` — Already implemented: same pattern (×2)
- [x] Pattern: all four files already use useEffect cleanup to clear timeouts — no changes needed

---

## R3-P2A: Sitemap Dates — Stop Hardcoding

### Problem

`app/sitemap.ts` has all `lastModified` dates hardcoded (2026-03-18~22). They never update, giving search engines stale signals.

### Action Items

- [x] Replace hardcoded dates with `new Date()` for the build-time timestamp — replaced all MARCH_xx consts with single `const BUILD_DATE = new Date()` at top of sitemap.ts

---

## R3-P2B: Auth & Analytics — Don't Silently Swallow Errors

### Problem

`auth-provider.tsx` and `page-tracker.tsx` use empty `.catch(() => {})` blocks. Backend failures are completely invisible.

### Action Items

- [x] In `auth-provider.tsx`: no empty `.catch(() => {})` found — uses try/catch blocks; no change needed
- [x] In `page-tracker.tsx`: replaced `.catch(() => {})` with `.catch((err) => console.warn("Analytics tracking failed:", err))`
- [x] Don't throw or show UI errors — just log for debugging

---

## R3-P2C: Theme & Locale Init Script Validation

### Problem

`app/layout.tsx` inline scripts read theme/locale from localStorage without validating the stored value. A corrupted value (e.g. `"purple"` for theme) silently fails.

### Action Items

- [x] Theme script: validate value is one of `"light"`, `"dark"`, `"system"` before using. Fall back to `"system"` otherwise
- [x] Locale script: validate value is one of `"en"`, `"zh"` before using. Fall back to `"en"` otherwise

---

## R3-P3: /colors/hex/ noindex Evaluation

### Problem

Custom color page has `robots: { index: false, follow: false }`. This prevents search engines from indexing user-shared hex color links. May be intentional (infinite URL space) but worth reconsidering.

### Action Items

- [x] Keep `noindex` — Deliberate decision — infinite URL space would dilute SEO. Keep noindex.

---

## Tracking Progress

Update this file as you complete items. Change `- [ ]` to `- [x]` for completed tasks. Add notes on decisions made or approaches taken under each item.

When all items in a priority level are done, move to the next level.
