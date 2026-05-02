
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
