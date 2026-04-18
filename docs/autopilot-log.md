## 2026-04-18 06:45 UTC — ESLint + Prettier config (auto-dev rotation, focus_priority #2)

Added ESLint 9 flat config + Prettier 3. eslint.config.mjs, .prettierrc, .prettierignore, package.json devDeps + scripts. 506 tests pass. ESLint surfaces 174 pre-existing issues (not regressions).

---

## 2026-03-22 01:44 — Newsletter 039–042, 3 SEO guides, 20 search aliases, day-30 email (commit e649c5f)

**Run type:** Normal (3rd run since last big run)

**Categories:** A. SEO & Content, D. Data, E. Server & Email

### Category A — Newsletter Issues 039–042
- **Issue 039** (Sep 3): "How color creates visual hierarchy without touching your typefaces"
  — value contrast as primary hierarchy driver, saturation as emphasis tool, surface color technique
  — Featured: Editorial Warmth + Brand Starter Kit
- **Issue 040** (Sep 10): "Saturation control: the underused variable in palette refinement"
  — saturation misalignment diagnosis, two-tier saturation systems, muted colors as precision
  — Featured: Quiet Luxury + Palette Pack Vol. 1
- **Issue 041** (Sep 17): "Color and component states: building interactive color systems"
  — state color pre-planning, lightness-shift model, disabled state accessibility
  — Featured: Nocturne Tech + Dark Mode UI Kit
- **Issue 042** (Sep 24): "Seasonal palette shifts: how to adapt your core system for campaign content"
  — brand extension vs replacement, accent-first seasonal approach, lightness matching
  — Featured: Blossom Season + Seasonal Spring 2026
- Total newsletter issues: 43 (was 39)

### Category A — 3 New SEO Landing Guides
- **architecture-color-palette** (priority 61): near-neutral framing for portfolio brands, material references as palette method, cross-scale (digital/print/built) specification. Featured: Concrete Modernism
- **startup-brand-color-palette** (priority 59): 3-color minimum viable palette, category color differentiation, dark-first structural advantage. Featured: Nocturne Tech
- **fashion-color-palette** (priority 57): brand color that creates space for merchandise, editorial context effects, seasonal accent flexibility system. Featured: Blossom Season
- Total guides: 32 (was 29)

### Category D — 20 New SEARCH_ALIASES
- Material/architecture: cement, concrete, stone, mineral
- Fashion/style: fashion, chic, couture, runway
- Mood/aesthetic: cheerful, romantic, mysterious, serene
- Industry/context: medical, spa, food, cafe, startup, portfolio

### Category E — Day-30 Follow-up Email
- Added `SUBJECT_VARIANTS.day30` (A: "Your ColorArchive palette — one month on", B: "The pack that pays for itself in one project")
- New `sendFollowUp30DayEmail()` function — catalog conversion angle, features Complete Archive and Brand Starter Kit with direct links
- Added DB columns `follow_up_30d_sent` + `follow_up_30d_variant` in db.js
- Added day-30 scheduler block in email-scheduler.js
- Completes 3/7/14/21/30-day follow-up sequence
- Server deployed to DO droplet (pm2 restarted)

**Files modified:**
- src/data/newsletter-issues.json (+4 issues)
- src/lib/guides.ts (+3 guides)
- src/lib/color-utils.ts (+20 aliases)
- server/email.js (+day-30 function + subject variants)
- server/email-scheduler.js (+day-30 scheduler)
- server/db.js (+2 columns)

**Commit:** e649c5f


## 2026-03-22 — Normal Run: i18n, Newsletter Issues 035–038, 2 New Collections (commit c43e0d5)

**Run type:** Normal

**Categories:** B. i18n Coverage, A. SEO & Content, D. Data & Collections

### Category B — i18n Coverage
- Added harmonies page translation keys: `harmonies_title`, `harmonies_subtitle`, `seed_color`, `invalid_hex` (EN + JA)
- Added 15 new `compare.*` translation keys for Color Compare page (EN + JA) in preparation for future i18n integration
- Total new translation keys: 18 pairs

### Category A — Newsletter Issues 035–038
- **Issue 035** (Jul 16): "Designing palettes that work for colorblind users without sacrificing character" — role redundancy, deuteranopia testing, Nordic Frost case study
- **Issue 036** (Jul 23): "How color functions as wayfinding in complex interfaces" — spatial color memory, chromatic navigation systems, Nocturne Tech application
- **Issue 037** (Aug 13): "Yellow in UI: the most misused accent color" — perceptual brightness paradox, three legitimate use cases, muted amber as editorial anchor
- **Issue 038** (Aug 20): "How brand color recognition actually works" — contextual memory mechanics, hue ownership in category, cross-medium specification
- Total newsletter issues: 39 (was 35)

### Category D — Collections
- Added **Concrete Modernism**: cerulean-whisper → sapphire-pearl → azure-tone → cobalt-dusk → indigo-shadow. Cool blue-gray palette for architecture portfolios, minimal SaaS, editorial systems
- Added **Blossom Season**: rose-whisper → blush-pearl → orchid-bloom → peony-silk → plum-tone. Spring florals for beauty brands, wedding design, seasonal campaigns
- Total collections: 16 (was 14)

**Files modified:**
- src/lib/i18n.ts (+29 lines)
- src/data/newsletter-issues.json (+136 lines)
- src/lib/collections.ts (+40 lines)

**Commit:** c43e0d5

## 2026-03-21 — BIG RUN: Color Converter Tool /convert/ (commit 3d571cd)

**Run type:** Big (5th run trigger — 4 normal runs since last big)

**Feature:** Full color format converter at `/convert/` — HEX ↔ RGB ↔ HSL ↔ HSB/HSV ↔ CMYK

**What was built:**
- New page `/convert/` with full metadata, structured data (WebApplication + BreadcrumbList), and sitemap entry at priority 0.82
- Interactive converter: 5 input modes (HEX, RGB, HSL, HSB, CMYK) — enter any format, all others update in real time
- Live color swatch preview with auto-contrast hex label
- Copy buttons for each format output (HEX, RGB, HSL, HSB, CMYK, CSS snippet)
- CSS custom property snippet ready for stylesheets
- "Nearest archive color" — perceptual nearest-neighbor search across all 2016 archive colors, linking to detail page
- 10 preset swatches for quick color loading
- Color format reference section (5 cards explaining each model)
- Full EN/JA i18n: nav.convert + 11 converter.* keys
- Added to site nav under Tools group

**New conversion utilities in src/lib/color-utils.ts:**
- `hexToRgb()` — parse 3- or 6-char hex → {r,g,b}
- `rgbToHsl()` — RGB → HSL
- `rgbToHsb()` — RGB → HSB/HSV
- `rgbToCmyk()` — RGB → CMYK
- `findNearestArchiveColor()` — perceptual nearest-neighbor over full 2016-color archive

**Files modified:**
- app/convert/page.tsx (new)
- src/components/color-converter-page.tsx (new, ~400 lines)
- src/lib/color-utils.ts (+115 lines of new functions)
- src/components/site-header.tsx (added /convert/ to nav + type union)
- src/lib/i18n.ts (added nav.convert + 11 converter.* keys EN+JA)
- app/sitemap.ts (added /convert/ at priority 0.82)
- STRUCTURE.md (updated tree + content counts)

**SEO rationale:** "hex to rgb converter" and similar queries have very high search volume. The /convert/ page is optimized for these with descriptive title, meta description, and structured data.

**Commit:** 3d571cd

## 2026-03-21 10:15 — Content & Collections: Newsletter Issues 028–030 + 2 Collections (commit 4c1bb6c)

**Run type:** Normal

**Categories:** A. SEO & Content, D. Data & Collections

**Changes:**
- Added Issue 028: "Color temperature as a communication tool" (May 28, 2026)
  - Covers warm/cool signaling, category associations, warm-accent-on-cool-base pattern
  - Featured: Editorial Warmth collection + Brand Starter Kit
- Added Issue 029: "Muted vs. desaturated" (June 4, 2026)
  - Covers perceptual difference, lightness as hidden variable, building cohesive muted palettes
  - Featured: Quiet Luxury collection + Content Creator Bundle
- Added Issue 030: "Hue span constraints" (June 11, 2026)
  - Covers palette bloat, hue span as governing constraint, extending palettes responsibly
  - Featured: Forest Terrain collection + Palette Pack Vol. 1
- Added Terracotta Loft collection: warm clay/ember/rust/amber/linen tones for interior/architecture/artisan
- Added Ocean Abyss collection: deep teal/aqua/cerulean/cobalt for fintech/data/sci-fi products
- Total collections: 14 (was 12), total newsletter issues: 31 (was 28)

**Files modified:**
- src/data/newsletter-issues.json
- src/lib/collections.ts

**Commit:** 4c1bb6c

## 2026-03-21 — Content: Newsletter Issues 025–027 (commit 77d62d5)

**Category:** A. SEO & Content

**Changes:**
- Added 3 new newsletter issues for May 2026 (Issues 025, 026, 027)
- Issue 025: Five-color palette constraint (systems rationale, cognitive limits)
- Issue 026: Dark mode saturation (simultaneous contrast, Bezold-Brücke shift)
- Issue 027: Color naming as systems design (semantic vs descriptive token names)

**Files modified:**
- src/data/newsletter-issues.json

**Commit:** 77d62d5

## 2026-03-21 00:01 — SEO & Search (commit 67802a9)

**Category:** A. SEO & Content + D. Data

**Changes:**
- Added 3 new SEO landing guides: minimalist-color-palette, retro-color-palette, color-palette-for-print-design
- Expanded SEARCH_ALIASES with 17 new semantic search terms (spring, autumn, fall, winter, summer, tropical, desert, nordic, japanese, luxury, natural, minimal, vibrant, dreamy, retro, tech)

**Files modified:**
- src/lib/guides.ts
- src/lib/color-utils.ts

**Commit:** 67802a9

## 2026-03-21 — Normal Run: Content, Search & Palette (commit 307b3d9)

**Run type:** Normal (3rd run since last big)

**Categories:** A. SEO & Content, D. Data & Collections

### Category A — Newsletter Issues 031–034
- **Issue 031** (2026-06-18): "Value contrast does more work than hue contrast — and most palettes get this backwards" — lightness-first design, grayscale test, value architecture
- **Issue 032** (2026-06-25): "The 60-30-10 ratio is a heuristic, not a law" — proportional color logic, accent overuse, interface distribution
- **Issue 033** (2026-07-02): "Why semantic color tokens are worth the extra naming effort" — two-layer token model, semantic categories, theme switching
- **Issue 034** (2026-07-09): "Color transition strategy: how to animate between palette states" — perceptual paths, theme fade timing, interactive state asymmetry
- Total newsletter issues: 35 (was 31)

### Category A — 2 new SEO guides
- **wedding-color-palette** (priority 72): Multi-substrate cohesion, anchor neutrals first, photography grading considerations. Targets "wedding color palette ideas" queries.
- **color-grading-palette** (priority 68): Photography/video grade looks mapped to palette structures, brand consistency, content creator social feeds. Targets "color grading palette photography" queries.
- Total guides: 28 (was 26)

### Category D — SEARCH_ALIASES expansion (+18 terms)
New aliases: moody, soft, clean, elegant, playful, urban, coastal, botanical, wedding, coffee, lavender, sage, terracotta, monochrome, halloween, christmas (18 terms, bringing total to ~52)

### Category D — MOOD_WORDS/SCENE_WORDS expansion
- MOOD_WORDS: each of 9 keys expanded from 5 to 8 words (new: Petal, Apricot, Honey, Sienna, Rye, Garnet, Maroon, Umber, Powder, Haze, Cerulean, Cove, Cobalt, Indigo, Reef, Alabaster, Cream, Birch, Gravel, Dune, Pewter, Obsidian, Graphite)
- SCENE_WORDS: each of 5 keys expanded from 5 to 8 words (new: Column, Frame, Field, Grove, Shore, Ridge, Accord, Contrast, Pairing, Market, Revue, Atlas, Archive, Drift)

**Files modified:**
- src/data/newsletter-issues.json
- src/lib/guides.ts
- src/lib/color-utils.ts
- src/lib/palette-builder.ts

**Commit:** 307b3d9

## 2026-03-22 — Big Run: Color Blindness Simulator (commit 137345e)

**Run type:** BIG (5 normal runs since last big run: 3d571cd Color Converter)

### New feature: /colorblind/ — Color Blindness Simulator

Complete accessibility tool for designers to simulate how colors appear
under 4 types of color vision deficiency.

**Algorithm:** Viénot et al. (1999) linearized sRGB matrix transforms
- Deuteranopia: missing M (green-sensitive) cones — red/green confusion
- Protanopia: missing L (red-sensitive) cones — red darkened, red/green confusion
- Tritanopia: missing S (blue-sensitive) cones — blue/yellow confusion
- Achromatopsia: no cone function — luminance-only perception

**Features:**
- Single color mode: hex text + color picker → original + 4 simulations in swatch cards
- Palette batch mode: paste up to 8 hex codes → full simulation table
- Pair distinguishability checker: shows which color pairs are at risk under each deficiency type
- Design tips section, related tool links
- JSON-LD structured data (WebApplication + BreadcrumbList)
- Added to site nav tools group with EN/JA i18n key

**Content additions:**
- Newsletter Issues 043–045 (color blindness, color temperature, background as color decision)
- New SEO guide: color-blind-friendly-palette (priority 80, Accessibility category)

**Files created:**
- src/lib/colorblind.ts
- src/components/colorblind-page.tsx
- app/colorblind/page.tsx

**Files modified:**
- src/components/site-header.tsx
- src/lib/i18n.ts
- app/sitemap.ts
- src/data/newsletter-issues.json (46 total, was 43)
- src/lib/guides.ts (32 total, was 31)

**Commit:** 137345e

## 2026-03-22 — Normal Run: UI Polish, Newsletter 046-049, SEO Guides (commit 97bdb01)

**Run type:** Normal (1st run since last big run)

**Categories:** F. UI/UX, A. SEO & Content

### Category F — UI/UX Polish

**Color Blindness Simulator added to homepage feature callouts:**
- `hero-section.tsx`: Feature callouts grid changed from `sm:grid-cols-2` to `sm:grid-cols-2 lg:grid-cols-3`. New teal-themed card added for `/colorblind/` with `hero.colorblindSimulator`, `hero.colorblindDesc`, `hero.tryColorblind` i18n keys.
- `site-footer.tsx`: `/colorblind/` link added to footer navigation chips.
- `i18n.ts`: Three new `hero.colorblind*` keys added with EN + JA translations.
- Human-todo item closed: "Consider adding /colorblind/ to homepage feature grid"

### Category A — Newsletter Issues 046–049

- **Issue 046** (2026-11-05): "Typography and color: how type weight changes the palette you need" — typographic mass effect, contrast requirements at weight/size, warm vs. cool type on tinted backgrounds
- **Issue 047** (2026-11-12): "Color in motion: how animation changes what palettes need to do" — static vs. animated color perception, hover state motion calibration, transition interpolation paths
- **Issue 048** (2026-11-19): "Color meaning is cultural: what your palette communicates across regions" — limits of universal psychology, regional associations (East Asia, Middle East, Western), cultural neutrality vs. specificity
- **Issue 049** (2026-12-03): "How to document a color palette so the next designer can use it" — three-layer documentation, semantic naming as living docs, real-world usage examples
- Total newsletter issues: **50** (was 46)

### Category A — 3 New SEO Guides

- **color-palette-for-social-media** (priority 70, Brand & Marketing): feed recognition speed, platform-aware calibration, minimal three-role palette structure
- **neutral-color-palette** (priority 69, Interface Systems): gray color cast bias, 6+ lightness step requirement, neutral/accent temperature relationships
- **earth-tone-color-palette** (priority 67, Brand & Marketing): definition of earth tones, muddiness failure mode and lightness variation, contemporary design contexts
- Total guides: **35** (was 32)

**Files modified:**
- src/lib/i18n.ts
- src/components/hero-section.tsx
- src/components/site-footer.tsx
- src/data/newsletter-issues.json
- src/lib/guides.ts

**Commit:** 97bdb01

## 2026-03-22 — Normal Run: Guides Dedup, Newsletter 050-053, New Guides, New Collections (commit 2ef08b4)

**Run type:** Normal (3rd run since last big run)

**Categories:** Bug Fix, A. SEO & Content, D. Data & Collections

### Bug Fix — Duplicate Guide Entries Removed
Discovered and removed two duplicate guide entries that had been added in a previous run:
- `color-palette-for-social-media` appeared twice with different category/priority/featured collection
- `earth-tone-color-palette` appeared twice with different categories
Removed the shorter, older versions; kept the newer more detailed versions.
Unique guide count: 37 (after dedup from 39 apparent entries)

### Category A — Newsletter Issues 050–053
- **Issue 050** (2026-12-10): "Color contrast for accessibility: what WCAG actually requires and why it matters" — luminance ratio vs. perceptual difference, where WCAG applies, designing for contrast from the start
- **Issue 051** (2026-12-17): "Print vs. screen: why your colors look different and how to manage the gap" — additive/subtractive physics, gamut gap by hue region, multi-media palette strategy
- **Issue 052** (2026-12-24): "Dark mode is not just inverted light mode" — why inversion fails, elevation model (surfaces get lighter as they rise), accent color adjustment for dark surfaces
- **Issue 053** (2027-01-07): "Color naming systems: why the words you use for colors shape how teams use them" — position vs. semantic names, two-layer token architecture (primitives + semantics), practical conventions
Total newsletter issues: **54** (was 50)

### Category A — 3 New SEO Guides
- **color-psychology-branding** (priority 82, Brand & Marketing): research vs. myths, distinctiveness vs. association, defensible color decisions in briefs
- **color-palette-for-e-commerce** (priority 78, Web Design): product photography compatibility, CTA hierarchy, checkout palette simplification
- **color-temperature-palette** (priority 75, Color Theory): warm/cool as spatial cues, dominant temperature with opposing accent, temperature within single hue
Total guides: **37** (was 34 unique)

### Category D — 2 New Collections
- **golden-hour**: Amber whisper soft → honey bloom clear → citrine silk soft → amber velvet muted → ember shadow muted. Warm amber/honey/citrine for photography and editorial.
- **twilight-bloom**: Orchid whisper soft → violet pearl clear → iris bloom clear → plum silk soft → mulberry nocturne muted. Purple-violet palette for beauty, creative, and wedding editorial.
Total collections: **18** (was 16)

**Files modified:**
- src/data/newsletter-issues.json
- src/lib/guides.ts (removed duplicates + added 3 guides)
- src/lib/collections.ts

**Commit:** 2ef08b4

## 2026-03-22 — Normal Run: Newsletter 054-057, New Guides, New Collections (commit 629cf0c)

**Run type:** Normal (3rd run since last big run: Color Blindness Simulator 137345e)

**Categories:** A. SEO & Content, D. Data & Collections

### Category A — Newsletter Issues 054–057

- **Issue 054** (2027-01-14): "Color in data visualization: why chart palettes need different rules" — categorical vs. sequential vs. diverging palette types, why branding palettes fail data viz tests, designing accessible chart palettes for color-blind audiences
- **Issue 055** (2027-01-21): "Monochromatic palette strategy: getting the most out of a single hue" — why single-hue constraints improve design skills, building 6+ lightness step systems, when to add accent colors in monochromatic contexts
- **Issue 056** (2027-02-04): "Designing color systems for mobile apps: constraints that change the rules" — OLED display impact on background decisions, real-world contrast beyond WCAG, semantic token architecture for system-level dark mode switching
- **Issue 057** (2027-02-11): "Working with pastel palettes: softness without weakness" — two-layer contrast system (pastels as surfaces, dark anchors for text), temperature coherence in pastel collections, avoiding washed-out failure mode
Total newsletter issues: **58** (was 54)

### Category A — 3 New SEO Guides

- **monochromatic-color-palette** (priority 73, Color Theory): single-hue system architecture, saturation management, saturation-based accent step, when monochromatic approach is right
- **color-palette-for-apps** (priority 76, Web Design): brand-to-app system gap (5 colors → 50 values), interactive state derivation logic, semantic token architecture for maintainability and theme switching
- **pastel-color-palette** (priority 71, Color Theory): two-layer pastel system, contrast architecture with near-black anchors, temperature-coherent pastel palette construction
Total guides: **43** (was 40)

### Category D — 2 New Collections

- **desert-canyon**: Warm terracotta, sandstone, coral ember, and garnet anchor tones. For Southwest-inspired brands, hospitality, food, and interior design. Colors: apricot-whisper-soft, ember-pearl-soft, coral-bloom-muted, ember-tone-muted, garnet-ink-muted.
- **midnight-forest**: Deep emerald, jade, teal, and mossy green tones. For sustainable brands, wellness retreats, and architectural practices. Colors: seafoam-whisper-soft, jade-bloom-clear, emerald-silk-soft, teal-tone-muted, moss-nocturne-muted.
Total collections: **20** (was 18)

**Files modified:**
- src/data/newsletter-issues.json (58 issues, was 54)
- src/lib/guides.ts (43 guides, was 40)
- src/lib/collections.ts (20 collections, was 18)

**Commit:** 629cf0c

## 2026-03-22 — Normal Run: Bug Fix, Newsletter 058-061, 3 New Guides, Email A/B Variants, Accessibility (commit decec50)

**Run type:** Normal (4th run since last big run: Color Blindness Simulator)

**Categories:** Bug Fix, A. SEO & Content, E. Server & Email, C. Code Quality

### Critical Bug Fix — email-scheduler.js day-30 emails never sent

Discovered that the day-30 follow-up email code was placed **outside** the `runFollowUps()` function body due to a premature closing brace at line 125. This meant day-30 emails had never been sent since the scheduler was written. Fix: removed the stray `}` so the day-30 block correctly executes inside `runFollowUps()`.

### Category E — Email A/B Testing Improvements

- Added **variant C** subject lines to all 5 follow-up email sequences:
  - day3 C: "Your free palette pack — getting started"
  - day7 C: "One palette library, every format you need"
  - day14 C: "A discount for your first ColorArchive pack — use FIRSTPACK"
  - day21 C: "Practical color: three real starting points"
  - day30 C: "What designers do after the free pack"
- Updated `ensureVariant()` call in scheduler to use 3 variants (A/B/C)
- Server redeployed to DO droplet

### Category A — Newsletter Issues 058–061

- **Issue 058** (2027-02-18): "Designing with gradients: when they help and when they hurt" — interpolation mechanics (RGB vs OKLCH), light source logic, gradient vs flat test
- **Issue 059** (2027-02-25): "Color for logo design: constraints that make logos work" — black-first design principle, four production tests (CMYK, Pantone, small size, context), single-color logo system
- **Issue 060** (2027-03-04): "Color in photography: how photos and palettes interact in design" — temperature compatibility, desaturation strategy, duotone unification, color grading brief
- **Issue 061** (2027-03-11): "Color for presentations: slides, decks, and pitch materials" — near-neutral backgrounds, 7:1 contrast for projection variability, four-color deck system, dark vs light palette choice
Total newsletter issues: **62** (was 58)

### Category A — 3 New SEO Guides

- **gradient-color-palette** (priority 69, Color Theory): interpolation paths and OKLCH, systematic gradient palette approach, contextual gradient use rules
- **logo-color-palette** (priority 72, Brand & Marketing): black-first logo design, four production tests, single-color logo system with Pantone guidance
- **color-palette-for-presentations** (priority 68, Web Design): projection contrast requirements, four-color deck system, dark vs light presentation palette guide
Total guides: **46** (was 43)

### Category C — Accessibility: gradient-generator-page.tsx

- Added `aria-pressed` to Linear/Radial gradient type toggle buttons (screen readers can now announce active state)
- Added `htmlFor`/`id` associations for all label/input pairs (Color 1, Color 2, Angle)
- Added `aria-label` to color picker inputs and angle range slider

**Files modified:**
- server/email-scheduler.js (critical bug fix: day-30 inside function + 3-variant support)
- server/email.js (variant C subject lines for all 5 follow-up sequences)
- src/data/newsletter-issues.json (62 issues, was 58)
- src/lib/guides.ts (46 guides, was 43)
- src/components/gradient-generator-page.tsx (accessibility improvements)

**Commit:** decec50

## 2026-03-22 — Big Run: Color Tools Hub /tools/ (commit 4c2e127)

**Run type:** Big Run (triggered: 4 normal runs since last big run)

**Feature:** New `/tools/` index page — comprehensive hub for all 11 color tools

### What was built

**New page: /tools/**
A dedicated landing page that showcases every free color tool on ColorArchive, organized into 4 categories:
- **Accessibility**: Contrast Checker, Color Blindness Simulator
- **Color Analysis**: Color Converter, Color Compare, Color Harmonies
- **Creative Tools**: Gradient Generator, Palette Generator, Palette Builder
- **Exploration**: Word → Color, Spectrum View, Surprise Me

Each tool card shows an icon, name, description, and "Open tool" CTA with hover animation. Category anchor links in the header allow jumping to a section directly.

**SEO features:**
- Schema.org `CollectionPage` + `ItemList` structured data (11 items)
- Breadcrumb structured data
- Canonical URL, OG/Twitter meta tags
- Added to sitemap with priority 0.88

**Homepage integration:**
- Added a "Free tools for working with color" section to `hero-section-below-fold.tsx`, showcasing 6 key tools in a compact card grid above the Notes section
- "Browse all tools →" CTA

**Nav integration:**
- "All Tools" link added at top of Tools nav group (desktop + mobile menus)
- `/tools` added to `currentPath` union type in `SiteHeader`

**i18n:**
- 35 new translation keys for EN + JA (tool names, descriptions, categories, headings, CTAs)

### Files modified
- app/tools/page.tsx (new — route + metadata + structured data)
- src/components/tools-page.tsx (new — full page component)
- src/components/site-header.tsx (currentPath type + nav link)
- src/components/hero-section-below-fold.tsx (tools section added)
- src/lib/i18n.ts (35 new translation keys)
- app/sitemap.ts (/tools/ entry)

**Commit:** 4c2e127

## 2026-03-22 — Normal Run: Newsletter 062-065, 2 New Collections, Search Aliases, 2 New Guides (commit 62445d0)

**Run type:** Normal (1st run since last big run: Color Tools Hub /tools/)

**Categories:** A. SEO & Content, D. Data & Collections

### Category A — Newsletter Issues 062–065

- **Issue 062** (2027-03-18): "Color in typography: how typeface color and palette work together" — near-black text temperature, 4-role typographic system, link color palette integration, colored headings when they work vs fail
- **Issue 063** (2027-03-25): "Color naming for design systems: tokens that communicate intent" — 3-layer naming model, primitive vs semantic separation, dark mode naming pitfalls, common naming failures
- **Issue 064** (2027-04-01): "Color and wayfinding: spatial color for navigation and signage systems" — hue distinctiveness requirement, color ceiling at 8 categories, 7:1 contrast floor, physical→digital translation
- **Issue 065** (2027-04-08): "Color in motion: animation, transitions, and temporal color design" — OKLCH interpolation for smooth transitions, 100–120ms timing sweet spot, directional hue shift meaning, page transition patterns
Total newsletter issues: **66** (was 62)

### Category D — 2 New Color Collections

- **arctic-dawn**: "Arctic Dawn" — Pale icy blues, cool lavenders, whispered frost tones. Colors: iris-whisper-soft, azure-veil-muted, cobalt-mist-soft, sapphire-bloom-soft, indigo-dusk-muted. For tech products, wellness apps, premium editorial.
- **golden-hour**: "Golden Hour" — Warm amber, honey, coral tones capturing late afternoon light. Colors: citrine-pearl-soft, honey-bloom-clear, amber-bloom-vivid, coral-silk-clear, ember-tone-soft. For food/beverage brands, creative agencies, consumer lifestyle.
Total collections: **22** (was 20)

### Category D — 29 New Search Aliases

Added 7 groups of semantic search aliases:
- **Food & beverage**: chocolate, espresso, caramel, matcha, blueberry, cherry
- **Cosmic/space**: space, galaxy, cosmic, nebula
- **Nature/garden**: meadow, garden, floral, alpine
- **Textiles**: linen, canvas, denim, velvet
- **Weather**: storm, thunder, fog, haze
- **Gemstones**: amethyst, emerald, sapphire, ruby, topaz
Total aliases: ~117 (was ~88)

### Category A — 2 New SEO Guides

- **color-typography-hierarchy** (priority 67, UI/UX Design): near-black text temperature selection, 4-role typographic color system, link color palette integration
- **design-token-color-naming** (priority 71, Design Systems): two-tier primitive/semantic naming model, dark mode token naming, 4 common naming mistakes with fixes
Total guides: **49** (was 47)

**Files modified:**
- src/data/newsletter-issues.json (66 issues, was 62)
- src/lib/collections.ts (22 collections, was 20)
- src/lib/color-utils.ts (~117 aliases, was ~88)
- src/lib/guides.ts (49 guides, was 47)

**Commit:** 62445d0

## 2026-03-22 — Normal Run: Newsletter 066-069, 2 Guides, Collection Bug Fix, Search Aliases, A11y (commit b787319)

**Run type:** Normal (2nd run since last big run: Color Tools Hub /tools/)

**Categories:** A. SEO & Content, C. Code Quality, D. Data & Collections

### Bug Fix: Duplicate Collection ID + Double-Comma Syntax Error

Two pre-existing bugs were found and fixed:
1. **Duplicate collection ID**: `golden-hour` appeared twice in `collections.ts` — the newer entry (added by the previous autopilot run) was renamed to `harvest-glow` with appropriate title/description updates. Collection count remains 22 but the duplicate is now resolved.
2. **Double-comma in guides.ts**: The previous autopilot run's insertion into the `landingGuides` array created `  },,` (two commas), causing TypeScript to infer `| undefined` for one array element. Fixed by removing the extra comma.

### Category A — Newsletter Issues 066–069

- **Issue 066** (2027-04-15): "Color in brand identity: building a proprietary color system from scratch" — 5-role framework (primary/secondary/neutral/text/functional), anchor-color derivation method, contrast+CMYK+colorblindness production tests
- **Issue 067** (2027-04-22): "Color psychology in UX: what color actually affects in digital products" — contrast-first hierarchy, what conversion color research actually shows, reliable cross-cultural associations, reinforce-don't-replace UX principle
- **Issue 068** (2027-04-29): "Color maintenance in design systems: keeping palettes consistent as products scale" — scheduled token audits, translation drift (HSL→RGB→HEX rounding), near-duplicate token problem, unauthorized token creation prevention via linting
- **Issue 069** (2027-05-06): "Color and print production: CMYK, Pantone matching, screen-to-press" — out-of-gamut colors, CMYK file setup, rich black vs pure black, building a print-safe color system
Total newsletter issues: **70** (was 66)

### Category A — 2 New SEO Guides

- **brand-color-system-design** (priority 72, Brand): How to design a proprietary brand color system from scratch — 5-role framework, anchor-color tonal range derivation, production testing (contrast/CMYK/colorblindness)
- **color-psychology-ux-design** (priority 73, UI/UX Design): Color psychology in UX design evidence-based guide — contrast-first hierarchy, cross-cultural associations, reinforce-don't-replace principle
Total guides: **51** (was 49)

### Category C — Accessibility Improvements

- **color-compare-page.tsx**: Added `aria-label` to swap button (was title-only), `aria-label` to hex text input and native color picker inputs in ColorPanel, `aria-live="polite"` + `aria-atomic="true"` on contrast ratio readout (so screen readers announce ratio changes)
- **color-harmonies-page.tsx**: Added `aria-pressed` to harmony type selector buttons (complementary, analogous, etc.)

### Category D — 30+ New Search Aliases

Added 10 new alias groups:
- **Interior design**: marble, brass, copper, oak, walnut, loft
- **Seasonal/holiday**: valentine, thanksgiving
- **Trend aesthetics**: cottagecore, darkacademia, grandmillennial, goblincore
- **Design styles**: brutalist, glassmorphism, neumorphism
- **Wellness**: zen, meditation, tropical_forest, arctic
- **Beverages**: wine, whiskey, mint_tea
- **Digital context**: saas, fintech, healthtech, ecommerce, gaming
Total aliases: ~150+ (was ~117)

### Files modified
- src/data/newsletter-issues.json (70 issues, was 66)
- src/lib/collections.ts (harvest-glow renamed from duplicate golden-hour)
- src/lib/guides.ts (51 guides; double-comma bug fixed + 2 new guides)
- src/lib/color-utils.ts (~150 aliases, was ~117)
- src/components/color-compare-page.tsx (aria-label, aria-live)
- src/components/color-harmonies-page.tsx (aria-pressed)

**Commit:** b787319

## 2026-03-22 — BIG RUN: Tints & Shades Generator + Newsletter 070-073 + 2 Guides (commit 78c17ac)

**Run type:** Big Run (4th normal run since last big run `4c2e127`)

**Categories:** F. New Page/Feature, A. SEO & Content, B. i18n Coverage

### New Feature: /tints/ — Tints & Shades Generator

Built a full 11-step tonal color scale generator (steps 50–950) as a new tool page.

**Algorithm:**
- Tints (50–400): smoothstep lightness interpolation toward 97%, saturation fades from base_S*0.08 at step 50 to full at step 500
- Base (500): exact input color
- Shades (600–950): smoothstep toward 7% lightness with slight saturation reduction

**Features:**
- Native color picker + hex text input with validation
- 8 color presets (Ocean Blue, Emerald, Rose, Amber, Violet, Teal, Slate, Orange)
- Custom palette name for export variable naming
- Hover-activated swatch strip tooltips with HEX, RGB, HSL, WCAG contrast vs white/black
- Full table: per-step hex/RGB/HSL, WCAG contrast badges (green/amber/grey)
- Export: CSS custom properties, Tailwind config, Sass variables, JSON
- "Copy All" + per-cell copy buttons

**Integration:**
- Added to tools hub (tools-page.tsx, Creative Tools category, "New" badge)
- Updated tools/page.tsx: 12-tool structured data, updated descriptions
- Added /tints to site-header.tsx currentPath type
- Added /tints/ to sitemap.ts (priority 0.85)
- i18n: tools.tints.name + tools.tints.desc (EN + JA); subheading updated to "Twelve free tools"

### Category A — Newsletter Issues 070–073

- **Issue 070** (2027-05-13): Tints, shades, and tones — how to build a complete color scale. Tint/shade/tone definitions in HSL terms; WCAG contrast patterns across the scale; saturation management for vivid vs muted hues; brand color anchoring at the natural step.
- **Issue 071** (2027-05-20): Color in motion — animated color transitions and timing. RGB gray problem (interpolate in HSL/LCH instead); semantic timing (0–50ms confirmation, 100–200ms feedback, 250–400ms scene change); CSS variable interpolation for dark mode transitions.
- **Issue 072** (2027-05-27): Color consistency across devices — display calibration and profiles. Uncalibrated vs ICC-profiled displays; sRGB as web standard; P3 wide-gamut handling; practical calibration workflow for design teams.
- **Issue 073** (2027-06-03): Color in data visualization — sequential, diverging, categorical. Three scale types; rainbow scale failures (perceptual unevenness, color-blind issues); accessible categorical palette construction; chart type color rules.
Total newsletter issues: **74** (was 70)

### Category A — 2 New SEO Guides

- **tints-shades-color-scale** (priority 74, Design Systems): 5 sections — tint/shade/tone definitions, WCAG per-step analysis, brand color anchoring, saturation management, export formats
- **data-visualization-color-palettes** (priority 75, Color Theory): 5 sections — three scale types, rainbow scale problems, accessible categorical palettes, chart type rules, color-not-sole-differentiator principle
Total guides: **53** (was 51)

**Files modified (10):**
- app/tints/page.tsx (new)
- src/components/tints-shades-page.tsx (new, 370 lines)
- src/components/site-header.tsx (+ /tints type)
- src/components/tools-page.tsx (+ tints entry)
- app/tools/page.tsx (12 tools, updated structured data)
- src/lib/i18n.ts (tints keys + updated count)
- src/lib/guides.ts (2 new guides)
- src/data/newsletter-issues.json (70 → 74 issues)
- app/sitemap.ts (+ /tints/)
- STRUCTURE.md (updated counts and tree)

**Commit:** 78c17ac

## 2026-03-22 — Normal Run: Newsletter 074-077 + 2 Guides + 2 Collections + Search Aliases (commit c643798)

**Run type:** Normal Run (1st normal run since last big run `78c17ac`)

**Categories:** A. SEO & Content, D. Data & Collections

### Category A — Newsletter Issues 074–077

- **Issue 074** (2027-06-10): Color and typography — why font color matters. Off-black selection (range #1a1a1a–#333333), temperature matching between text and surface, secondary text WCAG contrast failures.
- **Issue 075** (2027-06-17): RGB vs CMYK vs HSL — which color mode to design in. Additive vs subtractive color, CMYK gamut limitations, HSL as the design-decision model, OKLCH for advanced work.
- **Issue 076** (2027-06-24): Color accessibility beyond contrast ratios — links (underline requirement), focus indicators (WCAG 2.2 SC 2.4.11), red/green status patterns for color-blind users.
- **Issue 077** (2027-07-01): Color and cultural context — regional color associations (red in China vs. West), white/black reversal in East Asia, 3-question framework for international design.
Total newsletter issues: **78** (was 74)

### Category A — 2 New SEO Guides

- **analogous-color-palette** (priority 71, Color Theory): Analogous color range selection (30–90°), saturation control, UI and branding application, vs. complementary schemes
- **color-palette-for-healthcare** (priority 70, Industry Palettes): Why blue dominates healthcare, avoiding sterile aesthetics, red/green status encoding, WCAG AAA targeting, 4-layer system
Total guides: **55** (was 53)

### Category D — 2 New Color Collections

- **sunset-terrace**: Warm rose (rose-bloom-vivid), coral (coral-silk-vivid), ember, amber, apricot-pearl — for hospitality, lifestyle, food/beverage brands. Tags: Warm, Romantic, Sunset.
- **deep-tide**: Dark cerulean-dusk, teal-velvet, azure-shadow, sapphire-dusk, cobalt-nocturne — for fintech, marine orgs, premium tech. Tags: Deep, Ocean, Authoritative.
Total collections: **24** (was 22)

### Category D — 13 New Search Aliases

- Healthcare: `healthcare`, `wellness`
- Food: `clay`, `ceramic`, `latte`
- Fashion/beauty: `mauve`, `dusty_rose`, `nude`, `champagne`, `taupe`
- Interior: `slate`, `charcoal`
- Nature: `dusk`, `dawn`

Also fixed: pre-existing typecheck error in i18n-part1.ts (unclosed object literal)

### Files modified (4)
- src/data/newsletter-issues.json (78 issues, was 74)
- src/lib/guides.ts (+2 guides)
- src/lib/collections.ts (+2 collections)
- src/lib/color-utils.ts (+13 unique new search aliases)

**Commit:** c643798

## 2026-03-22 — Normal Run: Newsletter 078-081 + 2 Guides + 2 Collections + Search Aliases (commit 1886a0b)

**Run type:** Normal Run (2nd normal run since last big run `78c17ac`)

**Categories:** A. SEO & Content, D. Data & Collections

### Category A — Newsletter Issues 078–081

- **Issue 078** (2027-07-08): Dark mode color design — surface layering (3-4 lightness steps), desaturated accents for dark backgrounds, text hierarchy with lightness+opacity, border strategies, semantic colors in dark context.
- **Issue 079** (2027-07-15): Color in packaging design — the three reading distances (3m category, 1m brand, 30cm trust), category color conventions and when to break them, CMYK gamut limits and PMS specification, color-on-material behavior.
- **Issue 080** (2027-07-22): Warm vs cool neutrals — how to detect temperature in HSL, warm neutrals for consumer/wellness/food contexts, cool neutrals for developer/analytics/fintech, mixing temperatures correctly, neutral-brand color interaction.
- **Issue 081** (2027-07-29): Color psychology in marketing — debunking fabricated statistics, category fit research (Labrecque & Milne), red's consistent arousal effect and context dependency, gender-color research limitations.
Total newsletter issues: **82** (was 78)

### Category A — 2 New SEO Guides

- **dark-mode-color-palette** (priority 76, UI/UX Design): 5 sections — surface layering, accent desaturation for dark backgrounds, text hierarchy (lightness+opacity), borders/dividers in dark mode, semantic colors
- **neutral-color-palettes** (priority 73, UI/UX Design): 5 sections — detecting neutral temperature via HSL, warm neutral contexts, cool neutral contexts, applying temperature consistently, neutrals and brand color interaction
Total guides: **57** (was 55)

### Category D — 2 New Collections

- **morning-ceramic**: Warm off-whites and barely-there naturals (apricot-whisper-soft, honey-veil-muted, amber-pearl-muted, olive-whisper-muted, coral-pearl-muted) — for Japandi, artisan, and minimal wellness brands
- **forest-depths**: Deep botanical greens at shadow threshold (emerald-shadow-clear, jade-velvet-soft, moss-shadow-clear, leaf-shadow-soft, teal-shadow-muted) — for premium herbal, biophilic, and luxury wellness brands
Total collections: **26** (was 24)

### Category D — 13 New Search Aliases

- Packaging/material: `packaging`, `artisan`, `handmade`
- Aesthetic/lifestyle: `japandi`, `wabi_sabi`, `biophilic`
- Brand/industry: `herbalist`, `natural_beauty`, `organic`, `apothecary`
- Architecture/space: `japandi_interior`, `scandi`

**Files modified (4):**
- src/data/newsletter-issues.json (82 issues, was 78)
- src/lib/guides.ts (+2 guides)
- src/lib/collections.ts (+2 collections)
- src/lib/color-utils.ts (+13 search aliases)

**Commit:** 1886a0b

## 2026-03-22 — Normal Run: Newsletter 082-085 + 2 Guides + 2 Collections + Search Aliases (commit a5b8070)

**Run type:** Normal Run (3rd normal run since last big run `78c17ac`)

**Categories:** A. SEO & Content, D. Data & Collections

### Category A — Newsletter Issues 082–085

- **Issue 082** (2027-08-05): Color in animation — CSS color space interpolation (OKLCH vs RGB for vivid midpoints), easing curves and perceived speed quality, state color communication, dark mode animation calibration.
- **Issue 083** (2027-08-12): Color naming systems — Pantone for brand/print accuracy, NCS for architecture/interior Europe, RAL for industrial/architectural finishes, Munsell for fine arts and science.
- **Issue 084** (2027-08-19): The 60-30-10 rule — the principle behind proportions (ground/structure/focus), UI application (60% neutral, 30% structural, 10% accent), data viz exception, valid intentional violations.
- **Issue 085** (2027-08-26): Color in email design — Outlook bgcolor vs CSS limitations, Apple Mail dark mode automatic inversion and fix with @media prefers-color-scheme, Gmail inline style requirement, render-test matrix.
Total newsletter issues: **86** (was 82)

### Category A — 2 New SEO Guides

- **gradient-color-design** (priority 74, UI/UX Design): 5 sections — OKLCH vs RGB interpolation, two-color vs multi-stop gradients, gradient direction and spatial hierarchy, mesh gradient technique, gradients in brand systems
- **color-for-e-commerce** (priority 71, Industry Palettes): 5 sections — product photography background, CTA color and conversion research, premium vs value color positioning, category color conventions, seasonal/promotional color management
Total guides: **67** (was 65)

### Category D — 2 New Collections

- **electric-mint**: Vivid mint (mint-core-vivid), seafoam (seafoam-core-vivid), jade (jade-radiant-clear), teal (teal-tone-vivid), lagoon (lagoon-bloom-clear) — for fintech, sustainability, and tech startup brands needing clean energetic green
- **rose-quartz**: Soft rose-pearl (rose-pearl-soft), blush-mist (blush-mist-muted), peony-bloom (peony-bloom-soft), magenta-tone (magenta-tone-muted), rose-silk (rose-silk-muted) — for beauty, wellness, spa, and feminine editorial identities
Total collections: **28** (was 26)

### Category D — 24 New Search Aliases

- Color trends: `electric`, `neon_green`, `mint_green`, `powder_blue`, `dusty_blue`
- Fashion/beauty: `rose_gold`, `cobalt_blue`
- Lifestyle: `dark_academia`, `tech_startup`, `premium`, `luxury_brand`
- Animation/motion: `gradient`, `animation`
- Email/marketing: `email`, `newsletter`, `marketing`
- Design systems: `token`, `design_system`, `brand_color`
- Photography: `portrait`, `product_photo`
- Seasonal: `monsoon`, `harvest`

### Files modified (4)
- src/data/newsletter-issues.json (86 issues, was 82)
- src/lib/guides.ts (+2 guides via moreGuides export)
- src/lib/collections.ts (+2 collections via push)
- src/lib/color-utils.ts (+24 search aliases)

**Commit:** a5b8070

## 2026-03-22 — Normal Run: Newsletter 086-089 + 2 Guides + 2 Collections + Search Aliases (commit 9bf17c2)

**Run type:** Normal Run (4th normal run since last big run `78c17ac`)

**Categories:** A. SEO & Content, D. Data & Collections

### Category A — Newsletter Issues 086–089

- **Issue 086** (2027-09-02): Color for data storytelling — sequential vs diverging vs categorical palettes, salience management for equal-weight categories, color blindness requirements (deuteranopia ~8% male), rendering environment fidelity, consistent dashboard color assignment.
- **Issue 087** (2027-09-09): Color grading for photographers — workflow order (exposure first, then color), HSL targeting for skin/sky/foliage, split toning shadow/highlight relationships, building consistent editorial LUT-based style, category color conventions (portrait, architecture, food, travel).
- **Issue 088** (2027-09-16): The case for off-white in UI — why pure white causes fatigue (halation from screen luminance), warm vs cool off-white temperature choice, multi-surface off-white systems (base/raised/recessed), dark mode off-black at L:10-18%, practical hex values for each register.
- **Issue 089** (2027-09-23): Color in spatial computing/XR — passthrough AR transparency constraint (visionOS glass material system), luminance management in headsets (lower peak brightness than phones), chromatic aberration and edge treatment, visionOS vibrancy/adaptive color, chromatic depth cuing (warm=advance, cool=recede).
Total newsletter issues: **90** (was 86)

### Category A — 2 New SEO Guides

- **color-palette-for-real-estate** (priority 69, Industry Palettes): 5 sections — trust palette psychology, luxury green-cream-gold system, proptech/digital-first differentiation, boutique agency editorial approach, regional environmental anchoring
- **color-for-packaging-design** (priority 68, Brand Design): 5 sections — CMYK vs RGB gamut reality, Pantone specification (when/why), shelf impact at distance (3 reading distances), material substrate behavior, regulatory and accessibility requirements
Total guides: **69** (was 67)

### Category D — 2 New Collections

- **spiced-amber**: amber-velvet-clear, ember-tone-soft, honey-silk-soft, coral-dusk-muted, apricot-velvet-muted — warm autumn/artisan palette for harvest campaigns, food brands, warm editorial
- **cerulean-depth**: cobalt-dusk-clear, cerulean-shadow-clear, azure-velvet-soft, sapphire-nocturne-muted, teal-shadow-soft — enterprise/corporate tech palette with authority without consumer-app brightness
Total collections: **30** (was 28)

### Category D — 22 New Search Aliases

- Real estate & property: `real_estate`, `property`, `luxury_home`, `coastal_home`, `farmhouse`, `modern_home`
- Packaging & print: `packaging_design`, `print_design`, `pantone`, `shelf`
- Data visualization: `data_viz`, `dashboard`, `chart`, `analytics`
- Photography: `photo_grade`, `film_look`, `split_tone`

**Files modified (4):**
- src/data/newsletter-issues.json (90 issues, was 86)
- src/lib/guides.ts (+2 guides via extraGuides3 export)
- src/lib/collections.ts (+2 collections)
- src/lib/color-utils.ts (+22 search aliases)

**Commit:** 9bf17c2

## 2026-03-23 — Big Run: Color Mixer tool + Newsletter 090-093 + 2 Guides + 2 Collections (commit eba613b)

**Run type:** Big Run (5th run since last big run `78c17ac` — threshold reached)

**Categories:** Color Mixer Tool Launch, A. SEO & Content, D. Data & Collections

### Color Mixer — New Tool at /mixer/

A full-featured color interpolation and blending tool built on existing untracked components:
- **Blend modes:** RGB (direct channel), HSL (hue/saturation/lightness), OKLCH (perceptually uniform)
- **11-step gradient** with individual swatch copy buttons
- **8 color presets** (Ocean Depth, Sunset, Forest, Lavender Mist, Ember, Slate to Snow, Mint to Navy, Mocha Rose)
- **Gradient preview bar** showing the complete blend
- **CSS color-mix() snippet** for the 50% midpoint
- **Export panel:** CSS custom properties, JSON hex array, all-step color-mix() declarations
- **Related tools** navigation

**Integration:**
- `app/mixer/page.tsx` — Next.js route with full SEO metadata (title, description, OpenGraph, Twitter) + WebApplication + BreadcrumbList structured data
- `src/components/site-header.tsx` — added `/mixer` to currentPath union type
- `src/components/tools-page.tsx` — added Color Mixer card in Creative Tools section with "New" badge
- `app/tools/page.tsx` — updated count 12→13, added mixer to structured data ItemList
- `src/lib/i18n.ts` — added `tools.mixer.name` and `tools.mixer.desc` in EN+ZH
- `app/sitemap.ts` — added `/mixer/` at priority 0.85

### Category A — Newsletter Issues 090–093

- **Issue 090** (2027-09-30): Color in print and packaging — CMYK dot gain, Pantone spot colors vs CMYK builds, coated vs uncoated stock behavior, substrate color effects on ink perception, UV varnish/foil/soft-touch finish impacts
- **Issue 091** (2027-10-07): Color in wayfinding — hospital, airport, and transit color systems, discriminability requirements, hue-based vs value-based zone coding, luminance contrast at distance, ISO 7010 emergency color standards
- **Issue 092** (2027-10-14): Typography and color — typeface thermal classification (humanist warm, geometric cool), type-color pairing strategies (harmony vs tension), optical weight alignment, colored body text rules
- **Issue 093** (2027-10-21): Color naming and brand identity — descriptive vs evocative naming, Pantone Color of the Year strategy, Apple's color naming vocabulary, proprietary naming systems, design token semantic naming

Total newsletter issues: **94** (was 90)

### Category A — 2 New SEO Guides

- **color-for-social-media** (priority 67, Digital Design): Instagram brand consistency, TikTok first-half-second immediacy, Pinterest warm-aspirational grid, cross-platform color adaptation framework, algorithm vs brand identity
- **oklch-color-space-guide** (priority 66, Developer Tools): OKLCH vs HSL/RGB comparison, three-axis explanation (L/C/H), tonal scale generation workflow, CSS syntax + browser support, WCAG accessibility with OKLCH, linking to Color Mixer tool

Total guides: **71** (was 69)

### Category D — 2 New Collections

- **sage-terrarium**: sage-mist-soft, moss-tone-muted, fern-velvet-soft, stone-green-muted, eucalyptus-bloom-soft — muted sage/moss/stone greens for wellness, botanical, slow-living brands
- **dusk-coral**: coral-glow-soft, blush-mist-soft, terracotta-tone-muted, peach-silk-soft, rose-copper-muted — warm coral/blush/terracotta for editorial beauty, women's lifestyle, wedding/event design

Total collections: **32** (was 30)

**Files modified (12):**
- app/mixer/page.tsx (new)
- src/components/mixer-page.tsx (new — was untracked)
- src/lib/color-mix.ts (new — was untracked)
- src/components/site-header.tsx (+/mixer to currentPath type)
- src/components/tools-page.tsx (+mixer tool card)
- app/tools/page.tsx (updated metadata + structured data)
- src/lib/i18n.ts (+mixer i18n keys EN+ZH)
- app/sitemap.ts (+/mixer/ URL)
- src/lib/guides.ts (+extraGuides4 with 2 guides)
- src/lib/collections.ts (+sage-terrarium, +dusk-coral)
- src/data/newsletter-issues.json (94 issues, was 90)
- STRUCTURE.md (updated counts, added /mixer/)

**Commit:** eba613b

## 2026-03-23 — Normal Run: Newsletter 098-101, Collections, Search Aliases (commit 9c98352)

**Run type:** Normal (run #1 since last big run `eba613b`)

**Categories:** A. SEO & Content, D. Data & Collections, C. Code Quality (search aliases)

### Category A — Newsletter Issues 098–101

- **Issue 098** (2027-10-28): Color in motion design — why static color rules break in animation, easing and color interpolation (RGB vs OKLCH transitions), temporal contrast, brand motion color systems with desaturation guidelines
- **Issue 099** (2027-11-04): Color for illustrators — master palette systems (15-25 color working palettes), limited palette discipline, atmospheric vs local color thinking, digital workflow (Procreate swatches, value-first approach)
- **Issue 100** (2027-11-11): Cross-cultural color design — universal color associations (blue/calm is genuinely universal), where cultural variation matters (finance, food, healthcare), practical global palette review process
- **Issue 101** (2027-11-18): Type on color mechanics — how WCAG luminance formula works, chromatic vibration from complementary hues, dark mode halation with pure white, practical guidelines beyond minimum compliance

Total newsletter issues: **102** (was 94)

### Category D — 2 New Collections

- **aurora-veil**: indigo-velvet-soft, violet-tone-soft, teal-bloom-soft, cerulean-mist-soft, sapphire-dusk-soft — cool blue-indigo-violet palette for tech, premium digital, and creative studio brands
- **desert-amber**: amber-tone-muted, honey-velvet-muted, ember-silk-muted, coral-dusk-muted, olive-bloom-muted — warm earthy muted palette for artisan food, ceramics, and sustainable lifestyle

Total collections: **37** (was 32)

### Category C — 40+ New Search Aliases

New semantic aliases covering: nursery/baby/kids, athletic/sport/fitness, kitchen/bakery/pastry/sourdough, futuristic/holographic/ai_design, avocado/mango/citrus/berry/peach, music/podcast/concert, instagram/tiktok/content_creator, aurora/northern_lights/borealis, earthy/clay_earth/amber_warm, mid_century/art_deco/bauhaus, marine/deep_sea/lagoon, stationery/letterpress/journal

Total aliases: ~290 (was ~250)

### Bonus — 2 SEO Guides (from stash)

- **monochromatic-color-palette-guide** (extraGuides5): single-hue depth building, lightness/saturation curves, WCAG compliance in tonal scales
- **dark-mode-color-design-guide**: included from previous stashed work

Total guides: **70**

**Files modified (5):**
- src/data/newsletter-issues.json (102 issues, was 94)
- src/lib/collections.ts (+aurora-veil, +desert-amber)
- src/lib/color-search.ts (+40 new semantic aliases)
- src/lib/guides.ts (+2 guides from stash)
- STRUCTURE.md (updated counts)

**Commit:** 9c98352

## 2026-03-23 — Normal Run: Newsletter 094-097, Collections, Search Aliases, Guides + Cleanup (commit 1cc22d1)

**Run type:** Normal Run (post-big-run cleanup + content additions)

**Context:** This session ran concurrently with two other autopilot sessions, creating coordination challenges. The big run (eba613b) completed first, adding the Color Mixer tool. Multiple concurrent sessions then each added content, leading to some duplicate commits (the stash mechanism shared content between sessions). This session focused on:

1. **Content additions (A/D):** Added newsletter issues 094-097 (Color in motion design, Monochromatic palette mastery, Dark mode theory, Data viz color rules) — these were committed via stash by the other concurrent session (9c98352)
2. **Data additions (D):** Added 2 collections (arctic-minimal, amber-manuscript) — also committed via stash by concurrent session
3. **Search aliases (C):** Added 35+ new aliases (cyberpunk, oklch, monochromatic, arctic_blue, dark_mode, etc.) — also committed via stash
4. **Guides (A):** Added 2 guides (monochromatic-color-palette-guide, dark-mode-color-design-guide) — committed via stash by concurrent session
5. **Duplicate fix:** Replaced duplicate Issue 098 (Color in motion design — same topic as 094) with a new topic: Color in AI-generated design (prompting for palettes, AI model color biases, post-generation correction workflow)
6. **STRUCTURE.md cleanup:** Updated SEO guides count (70→73), fixed i18n language references (JA→ZH throughout)

### Current State After This Run

- Total newsletter issues: **102** (including Issue 098 on AI design replacing duplicate)
- Total collections: **37** (aurora-veil, desert-amber, arctic-minimal, amber-manuscript added in this cycle)
- Total SEO guides: **73**
- New search aliases: ~290+ total
- Color Mixer tool: Live at /mixer/ (completed in big run eba613b)

**Files modified (2):**
- src/data/newsletter-issues.json (Issue 098 replaced with AI-generated design topic)
- STRUCTURE.md (guide count, i18n language fix)

**Commit:** 1cc22d1


## 2026-03-23 — Normal Run: Newsletter 102-105, 2 Collections, Email Improvements (commit a9916ee)

**Run type:** Normal (run #4 since last big run `eba613b`)

**Categories:** A. SEO & Content (newsletter), D. Data & Collections, E. Server & Email

### Category A — Newsletter Issues 102–105 (December 2027)

- **Issue 102** (dec-2027-color-in-healthcare-ui, 2027-12-03): Color in healthcare/medical interfaces — trust palettes with cool blues, the red inflation pitfall in severity hierarchies, WCAG AAA targets for clinical contexts, testing for variable lighting conditions in healthcare environments
- **Issue 103** (dec-2027-color-forecasting-workflow, 2027-12-10): Practical color forecasting for product designers — reading design system changelogs, plugin/template marketplaces as trend signals, building 3-year palette lifespans, separating core from accent color layers in token architecture
- **Issue 104** (dec-2027-color-ecommerce-conversion, 2027-12-17): Color for e-commerce conversion — debunking the orange button myth (contrast > hue), product photography background research (warm off-white for premium, pure white for value), designing a testable token architecture for CRO
- **Issue 105** (dec-2027-managing-color-fatigue, 2027-12-24): Managing color fatigue in long-running brands — diagnosing internal vs. external fatigue, partial refresh strategy (accent layer vs. core palette), when full refresh is warranted (competitive convergence, accessibility failures, repositioning)

Total newsletter issues: **106** (was 102)

### Category D — 2 New Collections

- **cobalt-morning**: Cool cobalt/sapphire blues from pale mist to deep velvet — for productivity tools, SaaS dashboards, focus-oriented UI. Colors: cobalt-mist-muted, azure-pearl-soft, cerulean-tone-soft, cobalt-velvet-clear, sapphire-shadow-soft
- **sage-fog**: Soft sage greens, muted moss, and quiet jade for wellness brands, editorial reading interfaces, and calm digital products. Colors: moss-whisper-muted, leaf-silk-soft, olive-mist-muted, jade-bloom-soft, seafoam-tone-muted

Total collections: **39** (was 37)

### Category E — Server Email Improvements

- **D-variant subject lines**: Added a 4th variant (D) to all 5 follow-up email stages:
  - day3 D: "CSS variables, Figma tokens, and JSON — all in the pack"
  - day7 D: "The 2016-color library — organized for real projects"
  - day14 D: "A week left to use FIRSTPACK — 10% off any pack"
  - day21 D: "What 2016 colors give you that 5 could not"
  - day30 D: "Still building with the free pack? Here is what comes next"
- **sendNewsletterIssueAlert()**: New email function for broadcasting new newsletter issues to subscribers. Includes: eyebrow, title, summary, top-3 highlights in a card, CTA button, unsubscribe link, text + HTML versions

**Files modified (4):**
- src/data/newsletter-issues.json (106 issues, was 102)
- src/lib/collections.ts (+cobalt-morning, +sage-fog, now 39 collections)
- server/email.js (+D variants for all stages, +sendNewsletterIssueAlert function)
- STRUCTURE.md (updated counts)

**Commit:** a9916ee


## 2026-03-23 — Big Run: Newsletter fix + 4 issues + 3 guides + 2 collections (commit 55fb5f9)

**Run type:** Big Run (5th run since last big run `eba613b` — threshold reached)

**Categories:** A. SEO & Content (newsletter + guides), D. Data & Collections

### Category A — Newsletter Fix + Issues 106–109 (January 2028)

**Bug fix:** Issues 102-105 (December 2027) were in the wrong position — prepended to the start of the JSON array (index 0-3) instead of appended to the end. Fixed ordering so they follow Issues 098-101 correctly.

- **Issue 106** (jan-2028-color-in-game-ui, 2028-01-07): Color in game UI — HUD peripheral vision design, item rarity color conventions (Diablo 2 origin), damage type multi-channel redundancy, color accessibility in competitive games (colorblind modes at Riot, Valve)
- **Issue 107** (jan-2028-black-in-ui-design, 2028-01-14): Choosing black in digital interfaces — halation from pure black on OLED, when to use pure #000000, tinted blacks coordinated to brand hue direction, surface elevation with lightness increments in dark mode
- **Issue 108** (jan-2028-color-financial-data-viz, 2028-01-21): Color in financial data viz — making red-green accessible (redundant channels), extended semantic palette (6 states), conditional formatting density problem, dark mode for trading dashboards
- **Issue 109** (jan-2028-color-cultural-sensitivity, 2028-01-28): Color and cultural sensitivity — which meanings are universal vs. culturally specific, red's financial inversion (red=gain in East Asia), religious significance of saffron/green/purple, building culturally adaptable color token systems

Total newsletter issues: **110** (was 106, +4 this run)

### Category A — SEO Guides (+3, now 76)

- **color-wheel-guide**: Six harmonic relationships (complementary, analogous, triadic, tetradic, split-complementary, square), UI palette construction from fixed primary hue, hue temperature and psychological weight — targets 'color wheel guide for designers'
- **color-for-mobile-app-design**: OLED dark mode battery optimization, ambient lighting range on mobile, tap target state distinctions, platform color conventions (iOS/Android), safe area and system UI integration — targets 'color for mobile app design'
- **color-temperature-guide**: Physics of warm/cool light (Kelvin), spatial advancement/recession effects, tinted neutral palettes, mixed temperature palettes and productive tension — targets 'warm vs cool colors design'

### Category D — 2 New Collections (now 41)

- **terracotta-fired**: Warm ember/coral/amber tones at midrange lightness — for artisan goods, boutique hospitality, earthy lifestyle brands. Colors: ember-tone-soft, coral-silk-soft, apricot-bloom-soft, amber-tone-muted, crimson-velvet-soft
- **nordic-morning**: Pale blue mists and cool whisper whites — for Scandinavian/hygge-influenced, wellness, and minimalist SaaS brands. Colors: azure-mist-soft, cerulean-whisper-muted, cobalt-pearl-soft, iris-mist-muted, teal-mist-soft

### Current State After This Run

- Total newsletter issues: **110** (Issues 001–109, plus ordering bug fixed for 102-105)
- Total collections: **41** (terracotta-fired, nordic-morning added)
- Total SEO guides: **76** (color-wheel-guide, color-for-mobile-app-design, color-temperature-guide added)

**Files modified (4):**
- src/data/newsletter-issues.json (110 issues, ordering fixed, 4 new Jan 2028 issues)
- src/lib/collections.ts (+terracotta-fired, +nordic-morning, now 41 collections)
- src/lib/guides.ts (+3 guides in extraGuides6, now 76 total)
- STRUCTURE.md (updated all counts)

**Commit:** 55fb5f9


## 2026-03-23 — Normal Run: Newsletter 110-113 + 2 collections + search aliases (commit 51635c7)

**Run type:** Normal (run #1 since last big run `55fb5f9`)

**Categories:** A. SEO & Content (newsletter), D. Data & Collections (collections + search aliases)

### Category A — Newsletter Issues 110–113 (February 2028)

- **Issue 110** (feb-2028-color-print-vs-screen, 2028-02-04): Color in print vs. screen — RGB/CMYK gamut mismatch, which colors fall through it (electric blues, cyan-greens), soft-proofing workflow with ICC profiles, total ink coverage limits for different paper stocks, building a cross-media brand palette with PMS references
- **Issue 111** (feb-2028-neutral-scales-design-systems, 2028-02-11): Building a neutral scale that works in a design system — warm vs. cool undertone choice relative to brand primary, step density (10-12 steps), chromatic neutral technique (2-6% HSL saturation added to coordinate with primary hue), testing checklist
- **Issue 112** (feb-2028-color-typography-legibility, 2028-02-18): Color and typography legibility — WCAG 2.1 formula limitations, APCA (WCAG 3.0) for edge cases, chromatic aberration in saturated text, weight/size interaction (semibold improves legibility at low contrast), building a complete type color system with semantic tokens
- **Issue 113** (feb-2028-gradient-design-guide, 2028-02-25): Gradient design guide — why sRGB gradients go muddy (non-perceptual interpolation), OKLCH gradient interpolation (93% browser support), hue direction in OKLCH (shorter/longer arc, increasing/decreasing keywords), stop placement for premium gradient quality, production CSS pattern with @supports fallback

Total newsletter issues: **114** (was 110, +4 this run)

### Category D — 2 New Collections (now 43)

- **midnight-garden**: Deep jewel tones at low lightness — violet-nocturne-soft, plum-shadow-clear, garnet-nocturne-muted, teal-shadow-soft, mulberry-ink-soft. For luxury dark-mode UI, nocturnal editorial, premium entertainment brands. Colors retain chromatic identity at 14-28% lightness.
- **powder-room**: Barely-there pastels — blush-whisper-soft, peony-pearl-soft, rose-whisper-muted, iris-mist-muted, orchid-pearl-muted. For beauty/cosmetics, wellness, wedding platforms. The iris-mist-muted bridges pink to lavender for wider beauty brand versatility.

Total collections: **43** (was 41)

### Category D — SEARCH_ALIASES additions (+45 new entries)

New semantic search aliases added to `src/lib/color-search.ts`:
- Print/media: print, cmyk, offset
- Gradients/light effects: gradient_mesh, duotone, overlay, stained_glass, prism, iridescent
- Materials: frosted_glass, brushed_metal, anodized, gold_leaf, silver, platinum, rose_quartz
- Environmental: canyon, prairie, tundra
- Digital aesthetics: lofi, y2k, aura, cottagecore_green
- Evening/atmospheric: golden_hour, twilight, afterglow
- Design contexts: saas_dashboard, landing_page, mobile_ui
- Botanical: succulent, palm, fern
- Color descriptors: neon_coral, electric_purple, deep_teal, dusty_green
- Skin/beauty: tan, bronze, ivory_skin

**Files modified (3):**
- src/data/newsletter-issues.json (114 issues, was 110)
- src/lib/collections.ts (+midnight-garden, +powder-room, now 43 collections)
- src/lib/color-search.ts (+45 new SEARCH_ALIASES entries)

**Commit:** 51635c7


## 2026-03-23 — Normal Run: Newsletter 114-117 + 2 collections + 3 guides + email variants (commit 3a0c87c)

**Run type:** Normal (run #2 since last big run `55fb5f9`)

**Categories:** A. SEO & Content (newsletter + guides), D. Data & Collections, E. Server & Email

### Category A — Newsletter Issues 114–117 (March 2028)

- **Issue 114** (mar-2028-color-brand-identity, 2028-03-04): Building a brand color system — primary/secondary/accent architecture, temperature harmony, chromatic neutrals, testing the system before committing to production
- **Issue 115** (mar-2028-color-forecasting, 2028-03-11): Color forecasting — how trend agencies (WGSN, Pantone) aggregate signals, macro/medium/short trend cycle timescales, using trend data as directional input, counter-trend differentiation opportunities
- **Issue 116** (mar-2028-color-packaging-design, 2028-03-18): Color in packaging — shelf presence and competitive differentiation, SKU color system planning, print production variables (substrate, ink coverage, ICC profiles), metamerism under different retail lighting
- **Issue 117** (mar-2028-color-token-naming, 2028-03-25): Color token naming conventions — semantic vs. literal tokens, W3C tier model (global/alias/component), multi-theme naming that doesn't encode visual values, token evolution and deprecation patterns

Total newsletter issues: **118** (was 114, +4 this run)

### Category A — 3 New SEO Guides (now 79)

- **color-contrast-accessibility-guide**: WCAG 2.1 formula mechanics and limitations, APCA/WCAG 3.0 comparison, proactive accessible palette design at token level, dark mode contrast considerations (halation, polarity effects) — targets 'color contrast accessibility guide designers'
- **color-in-data-visualization**: Categorical/sequential/diverging encoding types, colorblind accessibility (8% of men affected), rainbow scale problems and perceptually uniform alternatives, contextual color for reference lines and emphasis — targets 'color in data visualization design'
- **saturation-chroma-design-guide**: HSL saturation vs OKLCH perceptual chroma, why equal HSL saturation looks unequal across hues, saturation gradients for hierarchy, muted palettes and chromatic neutrals, saturation and harmonic balance — targets 'saturation chroma color design guide'

### Category D — 2 New Collections (now 45)

- **copper-patina**: Warm copper through oxidized bronze-green — amber-tone-soft, terracotta-silk-muted, sage-bloom-muted, teal-mist-soft, honey-bloom-muted. For artisan goods, premium hardware, material-forward brand identities. The palette traces the color lifecycle of copper from freshly polished to fully oxidized.
- **coastal-haze**: Soft maritime blues and weathered grays — cerulean-whisper-muted, azure-mist-soft, cobalt-pearl-soft, teal-mist-soft, seafoam-whisper-soft. For travel, hospitality, coastal real estate, and calm-first digital products. Designed as background/surface colors rather than accent colors.

### Category E — Email A/B Subject Line Variants

Added E and F variants to all 5 follow-up email sequences (day3/7/14/21/30 — now 6 variants each):
- day3 E: "Quick start: your palette pack in 3 minutes" / F: "Turn your free palette into a working design system"
- day7 E: "Seven packs. One for every type of project." / F: "From landing pages to dark mode — your palette options"
- day14 E: "A thank-you: use FIRSTPACK for 10% off" / F: "FIRSTPACK — 10% off, 7 days, yours to use"
- day21 E: "Three ways designers put palette packs to work" / F: "A landing page, a moodboard, and a social template — in one palette"
- day30 E: "One month in — what the full library gives you" / F: "Ready for more than the free pack? Two options."

### Current State After This Run

- Total newsletter issues: **118** (Issues 001–117)
- Total collections: **45** (copper-patina, coastal-haze added)
- Total SEO guides: **79** (3 new in extraGuides7)

**Files modified (5):**
- src/data/newsletter-issues.json (118 issues, was 114)
- src/lib/collections.ts (+copper-patina, +coastal-haze, now 45 collections)
- src/lib/guides.ts (+3 guides in extraGuides7, now 79 total)
- server/email.js (SUBJECT_VARIANTS expanded to E+F for all 5 day sequences)
- STRUCTURE.md (updated all counts)

**Commit:** 3a0c87c


## 2026-03-23 — Normal Run: Newsletter 122-125 + 2 collections + 3 guides (commit eb972a1)

**Run type:** Normal (run #3 since last big run `55fb5f9`)

**Categories:** A. SEO & Content (newsletter + guides), D. Data & Collections

### Category A — Newsletter Issues 122–125 (Apr–May 2028)

- **Issue 122** (apr-2028-color-game-ui, 2028-04-29): Color in game UI design — HUDs on variable backgrounds (color + non-color redundancy), health bar urgency thresholds (yellow at 30%, red at 15-20%), environmental color complementary to UI accents, inventory rarity tiers, minimap color grammar, elemental damage color language, adaptive vs fixed UI art direction
- **Issue 123** (may-2028-color-cultural-meaning, 2028-05-06): Color across cultures — red (luck vs. danger), white/black (mourning vs. purity variance), green (Islamic sacred vs. Western eco vs. Chinese financial loss), religious/ceremonial associations, gender color coding evolution, limits of universal preference surveys
- **Issue 124** (may-2028-saas-dashboard-color, 2028-05-13): Color for SaaS dashboards — semantic-first color systems (semantic > series > surface), achromatic baseline discipline, ergonomic background lightness (L96-98% / L8-12%), table row states, dark mode re-specification, time series color continuity registries
- **Issue 125** (may-2028-color-motion-animation, 2028-05-20): Color and motion — pulsing amplification and the one-element rule, transition speed semantics (80-120ms responsive vs 400-600ms ambient), hue arc limits for gradient animation (120-180 degrees), loading state colors (skeleton vs spinner), success/error animation arcs, time-of-day color temperature adaptation, prefers-reduced-motion implementation

Total newsletter issues: **126** (was 122, +4 this run)

### Category A — 3 New SEO Guides (now 85)

- **color-psychology-marketing-guide**: What emotion research actually shows (saturation/arousal/valence), perceived appropriateness over absolute preference, trust built through consistency not hue, A/B evidence on conversion (contrast > color), saturation-premium paradox — targets 'color psychology marketing design'
- **startup-brand-color-guide**: 5 criteria for primary color (distinctive, appropriate, scalable, accessible, reproducible), category convention vs. break decision framework, primary color works at small scale first, color consistency over color choice, 14-color minimal system spec — targets 'startup brand color guide design'
- **color-in-typography-design-guide**: Near-black not pure black for body text (L8-16%), 5-tier typographic color system, secondary text at L35-50% (4.5:1 to 7:1), colored text functional uses only, heading color as single-entry-point strategy, dark mode typographic color re-specification — targets 'color in typography design guide legibility'

### Category D — 2 New Collections (now 49)

- **aurora-borealis**: Vivid celestial palette — cobalt-core-vivid, teal-tone-vivid, mint-core-vivid, violet-nocturne-clear, plum-radiant-clear. For premium tech products, gaming, atmospheric editorial, and dark-background digital experiences. Designed for dark backgrounds only — loses celestial quality on white. The palette works as linear gradients between adjacent hues to suggest aurora sweep.
- **berry-harvest**: Autumnal fruit palette — ruby-radiant-soft, plum-silk-soft, rose-bloom-vivid, peony-bloom-vivid, mulberry-nocturne-muted. For seasonal editorial, wine/spirits, artisan food, and autumn fashion. The vivid entries are accents; mulberry-nocturne-muted is small-quantity dark tone (header bands, footers).

### Current State After This Run

- Total newsletter issues: **126** (Issues 001–125)
- Total collections: **49** (aurora-borealis, berry-harvest added)
- Total SEO guides: **85** (3 new in extraGuides9)

**Files modified (3):**
- src/data/newsletter-issues.json (126 issues, was 122)
- src/lib/collections.ts (+aurora-borealis, +berry-harvest, now 49 collections)
- src/lib/guides.ts (+3 guides in extraGuides9, now 85 total)

**Commit:** eb972a1

## 2026-03-23 — Big Run: Design Token Generator + Content Batch (commit ec82fbd)

**Run type:** Big (5th run since last big run `55fb5f9`)

**Categories:** New Tool Feature + A. SEO & Content + D. Data & Collections

### New Feature: Design Token Generator (/tokens/)

Added a full new tool page at `/tokens/` — the 14th color tool on ColorArchive.

**What it does:**
- Takes any brand color hex as input + a custom variable name
- Generates 6 color scales × 11 steps (50–950) = 66 total tokens:
  - **Primary** — built from the user's brand color (scale-generated, step 500 = input color)
  - **Neutral** — same hue as primary at 10% saturation for harmonious grays
  - **Success** (green), **Warning** (amber), **Error** (red), **Info** (blue) — fixed semantic hues
- Interactive swatch strips for all 6 scales
- Per-scale detail table with HEX, RGB, HSL, contrast vs white (W), contrast vs black (B)
- WCAG contrast badges: green = AA pass (≥4.5:1), amber = large text only (≥3:1), grey = fail
- Export in 4 formats: CSS custom properties, Tailwind config, SCSS variables, JSON (W3C DTCG format)
- 8 color presets, native color picker, and custom variable name input
- Usage guide section explaining 3-tier token architecture and dark mode strategy

**Files created:**
- `app/tokens/page.tsx` — Next.js Server Component with metadata + structured data
- `src/components/token-generator-page.tsx` — Full client component (700+ lines)

**Files updated:**
- `src/components/site-header.tsx` — added `/tokens` to currentPath type union
- `src/components/tools-page.tsx` — added token generator as 14th tool entry
- `src/lib/i18n.ts` — added `tools.tokens.name` + `tools.tokens.desc` (EN + ZH)
- `app/tools/page.tsx` — updated description count 13→14, added to structured data list
- `app/sitemap.ts` — added `/tokens/` URL at priority 0.85

### Category A — 4 Newsletter Issues (now 130)

- **Issue 126** (may-2028-color-in-illustration, 2028-05-27): Color in illustration — limited vs. complex palettes, chromatic weight mechanics, shadow color strategies (multiply/complementary/ambient), expressive color beyond accuracy
- **Issue 127** (jun-2028-subscription-brand-color, 2028-06-03): Subscription brand color — recurring context vs. one-time packaging, unboxing color sequence, seasonal variant strategy, digital vs. physical specification
- **Issue 128** (jun-2028-warm-cool-bias-ui, 2028-06-10): Warm vs. cool bias in UI — background temperature mechanics, trust-warmth tradeoff, dark mode temperature specification, neutral scale hue strategy
- **Issue 129** (jun-2028-color-neurodiversity, 2028-06-17): Color and neurodiversity — saturation thresholds for sensory sensitivity, ADHD chromatic complexity, reduced stimulation modes via CSS variables

### Category A — 3 New SEO Guides (now 88)

- **design-token-color-system-guide**: Three-tier token architecture (primitive/semantic/component), token naming conventions, multi-theme specification, scale resolution, semantic role mapping — targets 'design token color system guide designers'
- **color-palette-for-landing-pages**: CTA color (contrast > hue), landing page color hierarchy, trust vs. conversion color treatment, above/below fold strategy — targets 'color palette for landing page conversion'
- **color-in-icon-design-guide**: Single-color vs. multi-color icons, semantic icon color, small-scale contrast thresholds, currentColor vs. fixed color strategies — targets 'color in icon design icon color system'

### Category D — 2 New Collections (now 51)

- **desert-minerals**: Terracotta, rust, warm amber, dusty sage, sand buff — for Southwest/regional brands, artisan ceramics, earthy wellness. The sage creates the specific desert temperature contrast.
- **midnight-garden**: Deep navy, forest shadow, dusty rose, warm cream, soft charcoal — for luxury fashion, dark editorial, evening product brands. All five entries are deliberately muted — no vivid colors.

### Current State After This Run

- Total newsletter issues: **130** (Issues 001–129)
- Total collections: **51** (desert-minerals, midnight-garden added)
- Total SEO guides: **88** (3 new in extraGuides10)
- Total tool pages: **14** (/tokens/ added)

**Files modified (11):**
- app/tokens/page.tsx (new)
- src/components/token-generator-page.tsx (new)
- src/components/site-header.tsx (+/tokens type)
- src/components/tools-page.tsx (+token generator entry)
- src/lib/i18n.ts (+tokens keys)
- app/tools/page.tsx (+count, +structured data)
- app/sitemap.ts (+/tokens/ URL)
- src/data/newsletter-issues.json (130 issues, was 126)
- src/lib/collections.ts (+desert-minerals, +midnight-garden, now 51)
- src/lib/guides.ts (+3 guides in extraGuides10, now 88)
- STRUCTURE.md (updated all counts)

**Commit:** ec82fbd

## 2026-03-23 — Normal Run: Newsletter 130-133 + Collections + Guides (commit f3df3b6)

**Run type:** Normal (1st run since last big run `ec82fbd`)

**Categories:** A. SEO & Content + D. Data & Collections

### Category A — 4 Newsletter Issues (now 134 total)

- **Issue 130** (jun-2028-color-in-wayfinding, 2028-06-24): Color coding cognitive limits (6-8 max), colorblind constraints for wayfinding (avoid sole red-green pair), contrast requirements for physical substrates (target 7:1), digital vs. physical specification differences
- **Issue 131** (jul-2028-hdr-displays-color, 2028-07-01): P3 color space encompassing 25% more colors than sRGB, tone mapping SDR/HDR artifacts, CSS Color Level 4 progressive enhancement (`@supports` with P3 values), photography workflow for wide-gamut assets
- **Issue 132** (jul-2028-data-viz-color, 2028-07-08): Three palette types (sequential/categorical/diverging), luminance channel for reliable quantitative encoding, Okabe-Ito colorblind-safe palette, gray+accent highlighting strategy
- **Issue 133** (jul-2028-color-naming-design-systems, 2028-07-15): Three-tier token model (primitive/semantic/component), dark mode collapse as broken semantic layer symptom, role-based naming patterns that age well, component token trigger criteria

### Category D — 2 New Collections (now 53 total)

- **copper-patina**: Ember-tone-muted, apricot-bloom-soft, olive-tone-muted, jade-mist-soft, teal-shadow-muted — aged metal and verdigris aesthetic for artisan jewelry, architecture, craft brands
- **tropical-resort**: Lagoon-bloom-clear, aqua-silk-vivid, coral-pearl-soft, apricot-pearl-soft, blush-whisper-muted — warm-weather travel and lifestyle, resort marketing

### Category D — 3 New SEO Guides (now 91 total)

- **data-visualization-color-guide**: Sequential/categorical/diverging palette theory, OKLCH for perceptually uniform ramps, colorblind safety — targets 'data visualization color palette design'
- **wayfinding-color-systems-guide**: Cognitive limits for color codes, colorblind constraints, substrate testing, digital vs. physical specification — targets 'color wayfinding environmental signage'
- **wide-gamut-hdr-color-design-guide**: When P3 matters (saturation threshold), CSS Color Level 4 syntax, OKLCH chroma for gamut-aware palette building — targets 'wide gamut color design P3 HDR'

### Category D — Search Aliases (20+ new entries)

Added: wayfinding, signage, transit, navigation, infographic, visualization, graph, patina, verdigris, oxidized, aged_metal, resort, caribbean, beach_club, vivid_brand, wide_gamut, primitive, semantic, component

### Current State After This Run

- Total newsletter issues: **134** (Issues 001–133, 4 new)
- Total collections: **53** (copper-patina, tropical-resort added)
- Total SEO guides: **91** (3 new in extraGuides11)
- Total search aliases: ~220+ entries

**Files modified (4):**
- src/data/newsletter-issues.json (134 issues, was 130)
- src/lib/collections.ts (+copper-patina, +tropical-resort, now 53)
- src/lib/guides.ts (+3 guides in extraGuides11, now 91)
- src/lib/color-search.ts (+20 aliases)

**Commit:** f3df3b6

## 2026-03-23 — Normal Run: Newsletter 134-137 + Collections + Guides (commit 49d2dc4)

**Run type:** Normal (2nd run since last big run `ec82fbd`)

**Categories:** A. SEO & Content + D. Data & Collections

### Category A — 4 Newsletter Issues (now 138 total)

- **Issue 134** (jul-2028-film-color-grading-designers, 2028-07-22): Film color grading for designers — three-zone grading model (lift/gamma/gain), teal-and-orange analysis, how to extract brand palettes from graded reference imagery, LUT and film stock specification for photography briefs
- **Issue 135** (aug-2028-startup-brand-color, 2028-07-29): Startup brand color — competitor color mapping, 'own the space' principle, saturation strategy (vivid/mid/muted), four stress tests before committing (app icon, dark mode, WCAG, print)
- **Issue 136** (aug-2028-chromatic-neutrals, 2028-08-05): The case for chromatic neutrals — why pure gray reads as undesigned, warm vs cool neutral construction, mixed-temperature neutral systems for brand and UI
- **Issue 137** (aug-2028-packaging-color-hierarchy, 2028-08-12): Color hierarchy in packaging — three-level system (brand anchor/category line/variant), shelf-impact vs in-hand experience tension, print substrate constraints, Pantone specification strategy

### Category D — 2 New Collections (now 55 total)

- **studio-neutral**: amber-veil-muted, coral-whisper-muted, ember-pearl-muted, cerulean-mist-muted, cobalt-whisper-muted — photographer studio neutrals for product catalogues, minimal editorial, and clean UI
- **northern-lights**: lagoon-bloom-vivid, teal-silk-vivid, violet-shadow-soft, cobalt-ink-muted, cerulean-veil-muted — aurora borealis atmospheric palette for Nordic brands, tech launches, night-sky experiences

### Category D — 3 New SEO Guides (now 94 total, extraGuides12)

- **film-color-grading-for-designers**: Three-zone grading model, teal-and-orange analysis, palette extraction from reference, LUT briefing — targets 'film color grading design brand photography'
- **chromatic-neutrals-guide**: Why pure gray fails, warm/cool neutral construction, mixed-temperature systems — targets 'chromatic neutral palette warm gray cool gray design system'
- **startup-brand-color-guide**: Competitor color mapping, defensibility dimensions, saturation strategy, four stress tests — targets 'startup brand color guide choosing brand color early stage'

### Category D — Search Aliases (~235+ entries)

Added: grading, film, cinematic, lut, warm_gray, cool_gray, chromatic_neutral, corporate, variant, seamless, backdrop

### Current State After This Run

- Total newsletter issues: **138** (Issues 001–137, 4 new)
- Total collections: **55** (studio-neutral, northern-lights added)
- Total SEO guides: **94** (3 new in extraGuides12)
- Total search aliases: ~235+ entries

**Files modified (4):**
- src/data/newsletter-issues.json (138 issues, was 134)
- src/lib/collections.ts (+studio-neutral, +northern-lights, now 55)
- src/lib/guides.ts (+3 guides in extraGuides12, now 94)
- src/lib/color-search.ts (+11 aliases)

**Commit:** 49d2dc4

## 2026-03-23 — Normal Run: Newsletter 138-141 + Collections + Guides (commit 55f2854)

**Run type:** Normal (3rd run since last big run `ec82fbd`)

**Categories:** A. SEO & Content + D. Data & Collections

### Category A — 4 Newsletter Issues (now 142 total)

- **Issue 138** (aug-2028-color-material-design, 2028-08-19): Material color specification — substrate effects on perception (gloss vs matte: 5-8 lightness point difference, 15-20% saturation shift), finish specification in GU, Pantone series selection by material type (Coated/Uncoated/Plastics/Metallics/Textile), translucent and metallic/pearlescent surface challenges, production-first brand workflow
- **Issue 139** (aug-2028-color-naming-systems, 2028-08-26): Design system color naming — descriptive vs semantic vs functional strategies, the three-tier hybrid architecture (primitives/semantic/component tokens), dark mode as the definitive naming quality stress test, failure mode analysis for each approach
- **Issue 140** (sep-2028-color-and-motion, 2028-09-02): Color in motion — chromatic flicker (WCAG 2.3.1, Harding Test), saturation amplification through transition, OKLCH for correct animation interpolation (vs sRGB gray-mud problem), perceptually consistent hover states, skeleton screen color rules
- **Issue 141** (sep-2028-color-psychology-product, 2028-09-09): Color psychology research — button color/conversion evidence (contrast not hue), cultural/context variability of color-emotion associations, extended session ambient color (cool dark mode = focus, warm light mode = browsing), managing stakeholder color mythology

### Category D — 2 New Collections (now 57 total)

- **desert-dusk**: ember-tone-soft, apricot-bloom-soft, olive-tone-muted, amber-shadow-soft, cobalt-mist-soft — Southwest arid landscape aesthetic for artisan ceramics, ranch hospitality, natural wellness
- **midnight-garden**: emerald-shadow-soft, violet-shadow-muted, plum-velvet-muted, jade-tone-muted, blush-whisper-muted — dark botanical palette for luxury fragrance, gothic editorial, dark-mode premium brands

### Category D — 3 New SEO Guides (now 97 total, extraGuides13)

- **material-color-specification-guide**: Pantone series selection by substrate, finish specification (GU at 60°), production-first brand workflow — targets 'color specification physical production packaging print pantone'
- **color-in-motion-animation-guide**: CSS OKLCH interpolation, perceptually consistent hover states in OKLCH space, skeleton screen color rules with easing/timing guidance — targets 'color animation css transition oklch hover states loading skeleton screen design'
- **color-psychology-product-design-guide**: Evidence-based principles for trust/attention/conversion, three research-backed rules, managing stakeholder mythology — targets 'color psychology product design UX research trust brand conversion evidence'

### Category D — Search Aliases (~255+ entries)

Added: gloss, matte_finish, velvet_texture, substrate, metallic_sheen, translucent, adobe, southwest, sagebrush, canyon_palette, arid, high_desert, gothic, dark_botanical, apothecary_dark, moody_palette, skeleton_screen, hover_state, cta_color, trust, urgency, luxury_dark, calm_palette, energy_palette

### Current State After This Run

- Total newsletter issues: **142** (Issues 001–141, 4 new)
- Total collections: **57** (desert-dusk, midnight-garden added)
- Total SEO guides: **97** (3 new in extraGuides13)
- Total search aliases: ~255+ entries

**Files modified (4):**
- src/data/newsletter-issues.json (142 issues, was 138)
- src/lib/collections.ts (+desert-dusk, +midnight-garden, now 57)
- src/lib/guides.ts (+3 guides in extraGuides13, now 97)
- src/lib/color-search.ts (+24 aliases)

**Commit:** 55f2854

## 2026-03-23 — Big Run: Image Color Extractor + Newsletter 142-145 + Collections + Guides (commit 2cf62a3)

**Run type:** Big Run (4th run since last big run `ec82fbd`)

**Categories:** New Tool + A. SEO & Content + D. Data & Collections

### New Feature: Image Color Extractor (/image-palette/)

Built a complete client-side image color extraction tool:
- **app/image-palette/page.tsx**: Next.js route with SEO metadata, structured data (WebApplication schema), breadcrumbs, canonical URL
- **src/components/image-palette-page.tsx** (~300 lines): Pure client-side component using Canvas API
- **Algorithm**: Quantize-then-k-means in weighted RGB space — samples up to 10,000 pixels, clusters with adjustable k (4-12 colors), finds closest ColorArchive color by Euclidean RGB distance
- **Features**: Drag-and-drop upload, 4 sample images for quick demo, per-color hex/RGB/HSL display, percentage-of-image readout, archive match with link to color detail page, export in HEX/RGB/HSL/CSS/JSON formats, copy-to-clipboard
- **Privacy**: All processing is client-side — no images leave the browser
- **Integration**: Added to tools page, site-header nav, sitemap, i18n (EN + ZH)

### Category A — 4 Newsletter Issues (now 146 total)

- **Issue 142** (sep-2028-color-from-photography, 2028-09-16): Extracting brand color from photography — dominant vs anchor vs accent extraction, the four-scene consistency test, production correction steps (saturation -10-20%, lightness normalization, temperature calibration)
- **Issue 143** (oct-2028-color-in-data-visualization, 2028-09-23): Color in data visualization — the four semantic roles (categorical/sequential/diverging/highlight), perceptual uniformity requirement for sequential scales, categorical palette construction, red-green deficiency constraints
- **Issue 144** (oct-2028-print-color-management, 2028-09-30): Print color management — screen-to-print gamut gap, CMYK ink limits and TIC, neutral gray instability, Pantone vs CMYK, the 6-value brand color specification
- **Issue 145** (oct-2028-color-systems-at-scale, 2028-10-07): Color systems at scale — token tier architecture, change frequency and versioning, color drift detection via linting and variable audits, lightweight governance patterns

### Category D — 2 New Collections (now 59 total)

- **data-dashboard**: cobalt-tone-vivid, teal-ink-muted, amber-glow-soft, crimson-tone-soft, slate-tone-muted — perceptually balanced categorical palette for analytics dashboards, designed for lightness-distinguishable data encoding
- **film-neutral**: amber-veil-muted, pearl-blush-soft, slate-veil-muted, cobalt-shadow-muted, obsidian-tone-soft — analog photography/cinema color register for photography portfolios, film production brands, heritage aesthetics

### Category D — 3 New SEO Guides (now 100 total, extraGuides14)

- **extracting-color-from-photography-guide**: Dominant vs anchor extraction, four-scene test, production correction workflow — targets 'extract color from image photo brand color photography palette reference'
- **color-for-data-visualization-guide**: Four semantic dataviz roles, OKLCH/CIELAB for sequential scales, categorical palette construction — targets 'data visualization color palette chart color scheme categorical sequential diverging dashboard'
- **image-color-extraction-tools-guide**: Complete extraction-to-production workflow, failure modes and solutions — targets 'image color extraction tool workflow extract palette from photo design'

### Current State After This Run

- Total newsletter issues: **146** (Issues 001–145, 4 new)
- Total collections: **59** (data-dashboard, film-neutral added)
- Total SEO guides: **100** (3 new in extraGuides14) ← reached 100 guides!
- New tool: Image Color Extractor at /image-palette/

**Files modified (9):**
- app/image-palette/page.tsx (new)
- src/components/image-palette-page.tsx (new, ~300 lines)
- src/components/site-header.tsx (+currentPath type, +nav item)
- src/components/tools-page.tsx (+image-palette tool card)
- src/lib/i18n.ts (+nav.imagePalette, +tools.imagePalette.name/desc EN+ZH)
- app/sitemap.ts (+/image-palette/ route)
- src/data/newsletter-issues.json (4 new issues, now 146)
- src/lib/collections.ts (+data-dashboard, +film-neutral, now 59)
- src/lib/guides.ts (+3 guides in extraGuides14, now 100)

**Commit:** 2cf62a3

## 2026-03-23 — Normal Run: Newsletter 146-150 + Collections + Guides + Critical Build Fixes (commit 84db35d)

**Run type:** Normal (1st run since last big run `2cf62a3`)

**Categories:** A. SEO & Content + D. Data & Collections + Bug Fixes (critical)

### Critical Bug Fixes

**Collections build error (was breaking Vercel deploy on every push since ~Mar 23):**
- 18 invalid color IDs replaced in collections.ts — these used non-existent roots (frost, sage, slate, terracotta, charcoal, cream, forest, navy, obsidian, rust, pearl-as-root) or invalid lightness labels (glow). The static build was crashing at collections module initialization with "Unknown color id: frost-veil-soft". Since this was the FIRST error, it masked all subsequent issues.
- Replacements: frost→cerulean, sage→moss, slate→cobalt, terracotta→ember, charcoal→cobalt-ink, cream→amber, forest→emerald, navy→cobalt, obsidian→cobalt-ink, rust→ember, pearl-blush-soft→blush-pearl-soft, amber-glow→amber-bloom
- Also detected and fixed via systematic ID validation script

**Duplicate collection IDs (causing getCollectionById to always return first match):**
- midnight-garden: appeared 3 times with 3 different palettes — renamed 2nd to "moonlit-garden", 3rd to "dark-botanical"
- copper-patina: appeared 2 times — renamed 2nd to "copper-verdigris"

**Notes page prerender failure (15 links using url instead of href):**
- Issues 094-098 (nov-2027 series) had `url` field instead of `href` in their links arrays
- `<Link href={undefined}>` during static generation caused "Cannot destructure property 'auth'" error
- Fixed all 15 affected links across 5 newsletter issues

### Category A — 4 Newsletter Issues (now 150 total)

- **Issue 146** (oct-2028-color-accessibility-beyond-wcag, 2028-10-14): WCAG 2.1 vs APCA — contrast ratio formula limitations, APCA Lc values by font size/weight, dual-standard audit strategy
- **Issue 147** (oct-2028-color-typography-interaction, 2028-10-21): Color and typography — luminance hierarchy first principle, temperature contrast (cool recedes, warm advances), achromatic body text rule (saturation ≤12%)
- **Issue 148** (nov-2028-color-environmental-sustainability, 2028-10-28): Sustainable color design — OLED pixel energy (23% battery difference dark/light), print TIC/GCR, muted palettes as sustainability choice
- **Issue 149** (nov-2028-color-in-packaging-design, 2028-11-04): Packaging color — substrate gamut selection, finish effects (matte darkens 4-8L, gloss adds 3-7C), spot vs. process decision framework

### Category D — 2 New Collections (now 60 total)

- **velvet-dusk**: plum-shadow-clear, mulberry-ink-soft, violet-mist-muted, rose-nocturne-muted, orchid-shadow-muted — luxury evening/beauty palette for premium cosmetics and dark editorial
- **coastal-fog**: cobalt-veil-muted, cerulean-mist-muted, moss-mist-muted, cobalt-shadow-muted, blush-pearl-soft — muted maritime fog palette for coastal and tech brands

### Category D — 3 New SEO Guides (now 103 total, extraGuides15)

- **packaging-color-design-guide**: Substrate selection, finish specification, spot vs process decision — targets 'packaging design color substrate print production pantone cmyk specification'
- **color-typography-readability-guide**: Luminance hierarchy, temperature contrast, chromatic body text rules — targets 'color typography readability hierarchy text contrast design system accessible'
- **color-accessibility-apca-guide**: WCAG 2.1 vs APCA dual-standard audit, Lc thresholds — targets 'color accessibility wcag apca contrast ratio 2025 standard audit accessible design'

### Category D — Search Aliases (~275+ entries)

Added: packaging_color, kraft_packaging, spot_color, print_production, evening_palette, beauty_palette, cosmetics, fragrance, coastal_fog, maritime, overcast, fog_palette, nordic_coastal, high_contrast, accessible, wcag, body_text, heading_color, text_hierarchy

### Current State After This Run

- Total newsletter issues: **150** (Issues 001–149, 4 new)
- Total collections: **60** (velvet-dusk, coastal-fog added; 3 renamed IDs fixed)
- Total SEO guides: **103** (3 new in extraGuides15)
- Build: **now passing** (was broken since at least early Mar 23 runs)

**Files modified (4):**
- src/data/newsletter-issues.json (4 new + 15 link href fixes, now 150)
- src/lib/collections.ts (2 new, 3 duplicate ID fixes, 18 invalid color ID fixes)
- src/lib/guides.ts (+3 guides in extraGuides15, now 103)
- src/lib/color-search.ts (+19 aliases)

**Commit:** 84db35d

## 2026-03-23 — Normal Run: Newsletter 151-154 + Collections + Guides + Aliases (commit 82373af)

**Run type:** Normal (3rd run since last big run `2cf62a3`)

**Categories:** A. SEO & Content + D. Data & Collections

### Category A — 4 Newsletter Issues (now 154 total)

- **Issue 151** (nov-2028-color-in-data-visualization, 2028-11-11): Sequential/diverging/categorical palette types, colorblind validation (deuteranopia, protanopia, tritanopia), grayscale test methodology
- **Issue 152** (nov-2028-documenting-color-systems, 2028-11-18): Three-layer documentation framework — base palette (designers), semantic tokens (engineers), composition rules (QA/accessibility). Token naming philosophy (descriptive vs semantic). Documentation that gets used (Storybook, Figma annotations)
- **Issue 153** (dec-2028-color-mobile-ui, 2028-11-25): OLED optimization, touch state contrast (20-30% shift vs 10% desktop), pixel density perceptual differences, 5:1 minimum contrast for sunlight readability, adapting desktop palettes for mobile
- **Issue 154** (dec-2028-color-consistency-cross-platform, 2028-12-02): sRGB vs P3 gamut differences, display color profiles (ColorSync), CSS display-p3 color space, print-to-screen consistency, Pantone/Lab as device-independent reference

### Category D — 2 New Collections (now 62 total)

- **golden-hour**: amber-bloom-clear, apricot-silk-soft, honey-bloom-muted, ember-core-soft, amber-velvet-soft — warm late-afternoon light palette for lifestyle, food photography, and artisan brands
- **digital-night**: cobalt-ink-muted, indigo-shadow-soft, violet-nocturne-muted, iris-core-vivid, sapphire-ink-soft — high-contrast cool-dark palette for developer tools, AI interfaces, and night-mode technical products

### Category A — 3 New SEO Guides (now 106 total, extraGuides16)

- **data-visualization-color-guide**: Sequential/diverging/categorical types, colorblind validation, grayscale test — targets 'data visualization color palette sequential diverging categorical chart accessible colorblind'
- **color-system-documentation-guide**: Three-layer doc framework, token naming (descriptive vs semantic), Storybook/Figma docs — targets 'color system documentation design tokens semantic naming'
- **mobile-ui-color-guide**: OLED optimization, touch state contrast, desktop-to-mobile adaptation — targets 'mobile UI color design OLED dark mode contrast touch states'

### Category D — Search Aliases (405 total, 7 new unique)

Added: chart_color, oled_dark, warm_light, photography, developer_tool, terminal, ai_interface

### Bug Fixes

None needed — build and tests clean.

### Current State After This Run

- Total newsletter issues: **154** (Issues 001–154, 4 new)
- Total collections: **62** (golden-hour, digital-night added)
- Total SEO guides: **106** (3 new in extraGuides16)
- Search aliases: **405** total (7 new unique)
- Typecheck: ✓ (1 type error fixed: Guide → LandingGuide)
- Tests: ✓ 204/204 passing

**Files modified (4):**
- src/data/newsletter-issues.json (4 new issues, now 154)
- src/lib/collections.ts (2 new, now 62)
- src/lib/guides.ts (3 guides in extraGuides16, now 106; fixed Guide→LandingGuide type)
- src/lib/color-search.ts (7 new unique aliases, 405 total)

**Commit:** 82373af

## 2026-03-23 — Normal Run: Newsletter 155-158 + Collections + Guides + Aliases (commit 4f4cba9)

**Run type:** Normal (3rd run since last big run `2cf62a3`)

**Categories:** A. SEO & Content + D. Data & Collections

### Category A — 4 Newsletter Issues (now 158 total)

- **Issue 155** (dec-2028-color-psychology-in-marketing, 2028-12-09): Color psychology in marketing — what research actually says vs myths; fit-contrast-convention practical framework; why CTA button color is really about contrast not psychology
- **Issue 156** (dec-2028-color-wayfinding-systems, 2028-12-16): Environmental graphic design principles for wayfinding — London Underground single-meaning rule, zone vs path coding, 7 rules for digital wayfinding color, healthcare and transit lessons
- **Issue 157** (dec-2028-color-token-architecture, 2028-12-23): Design token architecture — primitive/semantic/component tiers, CSS custom properties vs DTCG format, maintainable dark mode through token structure, Style Dictionary
- **Issue 158** (dec-2028-color-in-illustration, 2028-12-30): Color in illustration — 5-8 color professional constraint, hue shifting for shadow/light, flat vs rendered palette logic, brand illustration color governance

### Category D — 2 New Collections (now 64 total)

- **terracotta-workshop**: ember-tone-muted, coral-silk-muted, apricot-pearl-soft, honey-velvet-soft, amber-bloom-clear — earthy mineral palette for ceramics, craft brands, and artisan products
- **fresh-herb**: mint-whisper-soft, seafoam-mist-soft, jade-silk-clear, moss-bloom-muted, leaf-tone-clear — botanical warm-green palette for health, wellness, and organic food brands

### Category A — 3 New SEO Guides (now 109 total, extraGuides17)

- **color-psychology-marketing-guide**: Fit-contrast-convention framework, CTA color research demystified — targets 'color psychology marketing branding conversion CTA button color brand identity trust consumer behavior'
- **color-wayfinding-systems-guide**: Zone vs path coding, environmental design principles, 7 digital wayfinding rules — targets 'color wayfinding navigation signage system design hospital airport transit map zone coding'
- **color-token-architecture-guide**: Primitive/semantic tiers, CSS custom properties, DTCG format, maintainability principles — targets 'design tokens color token architecture CSS variables semantic tokens primitive tokens dark mode Tailwind Style Dictionary DTCG'

### Category D — Search Aliases (416 total, 11 new unique)

Added: cta_button, conversion, trust_color, navigation_color, zone_color, craft, pottery, herb, supplement, fresh_green
(Deduplicated against existing: marketing, brand_color, wayfinding, signage, botanical, terracotta, wellness, ceramic, artisan already existed)

### Current State After This Run

- Total newsletter issues: **158** (Issues 001–158, 4 new)
- Total collections: **64** (terracotta-workshop, fresh-herb added)
- Total SEO guides: **109** (3 new in extraGuides17)
- Search aliases: **416** total (11 new unique)
- Typecheck: ✓ clean (0 errors)
- Tests: ✓ 204/204 passing

**Files modified (4):**
- src/data/newsletter-issues.json (4 new issues, now 158)
- src/lib/collections.ts (2 new collections, now 64)
- src/lib/guides.ts (3 guides in extraGuides17, now 109)
- src/lib/color-search.ts (11 new unique aliases, 416 total)

**Commit:** 4f4cba9

## 2026-03-23 — Big Run: Color Combinations Library + Newsletter 159-166 + 4 Guides + 3 Collections (commit ce9198d)

**Run type:** Big Run (4th normal run since last big run `2cf62a3`)

**Categories:** New Feature + A. SEO & Content + D. Data & Collections

### New Feature: Color Combinations Library (/combinations/)

Built end-to-end new page at /combinations/ with 30+ curated color combinations:

**src/lib/combinations.ts** — Data library with 30+ combinations:
- Type-safe `ColorCombination` and `HarmonyType` interfaces
- 30 named combinations: Cobalt & Amber, Teal & Coral, Indigo & Citrine, Violet & Lime, Rose & Jade, Ocean Gradient, Sunset Palette, Forest Floor, Twilight Sequence, Ember to Crimson, Primary Soft, Vivid Triad, Muted Triad, Sage & Warm, Indigo Split, Stone & Teal, Navy & Gold, Blush & Charcoal, Warm White & Cobalt, Sand & Terracotta, Cobalt Spectrum, Rose Scale, Green Depths, Midnight Studio, Noir & Blush, Forest Noir, Spring Pastels, Cotton Sky, Herb Garden, Mauve & Sage
- Each has: id, name, description, useCase, harmonyType (6 types), tags, colorIds, colors

**src/components/combinations-page.tsx** — Full client component:
- Sticky filter bar: harmony type pills + style tags
- Grid of combination cards (2-3 columns responsive)
- Cards show: expandable swatches, name, harmony badge, description, use case, hex copy buttons, color links, style tags
- Bottom CTA linking to Palette Generator, Harmony Calculator, Contrast Checker
- Dark mode support throughout

**app/combinations/page.tsx** — Server component with metadata + JSON-LD schema

**site-header.tsx** — Added `/combinations` to currentPath type union + nav item under Tools section

**app/sitemap.ts** — Added /combinations/ URL (priority 0.85)

**src/lib/i18n.ts** — Added nav.combinations (EN/ZH) and tools.combinations.name/desc keys

**src/components/tools-page.tsx** — Added combinations as tool entry in creative category

### Category A — 8 Newsletter Issues (now 166 total)

- **Issue 159** (jan-2029-color-and-attention): Spotlight principle, luminance contrast > hue contrast, F-pattern color placement, mistakes that create distraction, muted-base rule
- **Issue 160** (jan-2029-color-naming-systems): Physical/perceptual/structural/semantic naming layers; the four-layer naming stack
- **Issue 161** (jan-2029-dark-mode-color-design): Palette split architecture, saturation adjustments for dark surfaces, shadow/elevation in dark mode, APCA vs WCAG for dark mode
- **Issue 162** (jan-2029-color-in-data-charts): Categorical/sequential/diverging palette types, why brand palettes fail in charts, colorblind testing
- **Issue 163** (feb-2029-color-trend-2029): Earthy saturation, technical blue/violet, complex greens, black's return, personalization over trend
- **Issue 164** (feb-2029-color-and-brand-trust): Labrecque & Milne (2012) research, fit matters more than hue, consistency as trust signal, contrast/legibility as trust
- **Issue 165** (feb-2029-building-accessible-color-systems): 5-step process for accessible color systems from scratch — scale architecture, semantic tokens, pair testing, documentation
- **Issue 166** (mar-2029-color-in-motion): OKLCH vs RGB/HSL interpolation, duration thresholds (100/300ms), dark-to-light perception asymmetry, saturation pulses for attention

### Category A — 4 New SEO Guides (now 113 total, extraGuides18)

- **color-combinations-guide**: 60-30-10 rule, harmony types, complementary/analogous tips, neutrals role — targets combinations/harmony SEO
- **monochromatic-color-palette-guide**: Scale construction, chroma variation, contrast challenges, professional warmth technique
- **color-in-packaging-design-guide**: Shelf impact, CMYK gamut, category conventions, material/finish interactions, digital-to-physical translation
- **neutral-color-palette-guide**: Warm vs cool neutrals, scale construction, semantic neutral tokens for design systems

### Category D — 3 New Collections (now 68 total, extraCollections18)

- **cobalt-spectrum**: 5-step cobalt monochromatic system (whisper→silk→core→dusk→ink) for professional design systems
- **stone-and-teal**: 4 warm olive neutrals (veil→whisper→mist→tone) + teal-core-clear accent — architect's minimal palette
- **rose-scale**: 5-step rose monochromatic (whisper→bloom→core→velvet→shadow) for beauty/bridal brand systems

### Bug Fixes

- Fixed invalid featuredCollectionId references in new newsletter issues (combination IDs mistakenly used as collection IDs; corrected to valid collection IDs)
- Fixed extraGuides18 missing required LandingGuide fields (category, eyebrow, priority)
- Fixed erroneous `createCombination: undefined as never` line in collections.ts

### Current State After This Run

- Total newsletter issues: **166** (Issues 001–166, 8 new)
- Total collections: **68** (cobalt-spectrum, stone-and-teal, rose-scale added)
- Total SEO guides: **113** (4 new in extraGuides18)
- Tool pages: **15** (combinations added)
- Typecheck: ✓ clean
- Tests: ✓ 204/204 passing

**Files modified/created (11):**
- src/lib/combinations.ts (NEW — 337 lines, 30+ combinations)
- src/components/combinations-page.tsx (NEW — 264 lines)
- app/combinations/page.tsx (NEW)
- src/components/site-header.tsx (currentPath type + nav entry)
- app/sitemap.ts (+/combinations/ URL)
- src/lib/i18n.ts (nav.combinations + tools.combinations keys)
- src/components/tools-page.tsx (+combinations tool entry)
- src/data/newsletter-issues.json (8 new issues, now 166)
- src/lib/guides.ts (4 guides in extraGuides18, now 113)
- src/lib/collections.ts (3 new, now 68)
- STRUCTURE.md (updated counts)

**Commit:** ce9198d

## 2026-03-26 — Normal Run: Newsletter 167-171 + 3 Guides + 2 Collections + Search Aliases (commit 2d4a941)

### Category A — 5 Newsletter Issues (now 171 total)

- **mar-2029-color-and-typography**: Color and typography readability relationship — optical weight, warm-on-warm conflicts, color-coding hierarchy
- **mar-2029-color-in-product-photography**: Building a photography house style — shadow color as brand signal, LAB-specified backgrounds, LUT encoding
- **mar-2029-seasonal-color-planning**: 12-month brand color calendar — core + seasonal accent model, industry differences, planning methodology
- **mar-2029-dark-mode-color-strategy**: Beyond inverting light themes — OLED-specific considerations, elevation system, saturation reduction
- **apr-2029-color-for-conversion**: What A/B tests reveal about CTA colors — contrast vs. color, expectation/context, secondary CTA hierarchy

### Category A — 3 New SEO Guides (now 116 total, extraGuides19)

- **color-contrast-accessibility-guide**: WCAG 2.1, APCA model, non-text contrast, building accessible palettes — targets accessibility SEO
- **color-token-naming-guide**: Primitive/semantic/component three-layer system, naming patterns, avoiding token sprawl — targets design systems SEO
- **logo-color-guide**: Reproduction test, CMYK gamut, Pantone spot colors, logo color longevity — targets brand identity SEO

### Category D — 2 New Collections (now 70 total, extraCollections19)

- **ink-and-gold**: Deep indigo-ink base + warm amber accents — luxury editorial palette for fintech, publishing, premium dark interfaces
- **moss-linen**: Pale olive-linen whites + soft moss greens — organic naturalist palette for wellness, sustainability, botanical brands

### Category D — Search Aliases (now 454 total, 38 new)

- Linen/textile aliases: linen_white, raw_linen, natural_white, unbleached, parchment_warm
- Neutral descriptors: mushroom, putty, greige, warm_white, off_white
- Color temperature: warm_palette, cool_palette, neutral_palette, temperature_balanced
- Editorial/ink aliases: editorial_dark, luxury_editorial, magazine, newspaper
- Pastel family: pastel_pink, pastel_blue, pastel_green, pastel_yellow, pastel_purple, candy_pastel
- Festival/celebration: festival, celebration, party, wedding_palette, graduation
- Architecture styles: organic_architecture, sustainable_design, biophilic_design, green_building
- UI states: onboarding, empty_state, success_state, warning_state, error_state, info_state

### Current State After This Run

- Total newsletter issues: **171** (Issues 001–171, 5 new)
- Total collections: **70** (ink-and-gold, moss-linen added)
- Total SEO guides: **116** (3 new in extraGuides19)
- Search aliases: **454** (38 new)
- Typecheck: ✓ clean

**Files modified (4):**
- src/data/newsletter-issues.json (5 new issues, now 171)
- src/lib/guides.ts (3 guides in extraGuides19, now 116)
- src/lib/collections.ts (2 new, now 70)
- src/lib/color-search.ts (38 new aliases, now 454)

**Commit:** 2d4a941

## 2026-03-26 — Normal Run: Newsletter 172-176 + 3 Guides + 3 Collections (commit 7614963)

### Category A — 5 Newsletter Issues (now 176 total)

- **apr-2029-color-grading-photography**: Three-zone model (shadows/midtones/highlights), complementary color in grading, saturation and emotional register, applying grading logic to interface design
- **apr-2029-brand-color-evolution**: Four signals that a color needs changing, the equity question, smooth vs. sharp transitions, practical transition architecture
- **may-2029-color-ar-vr**: VR display characteristics (OLED, field of view), the field-of-view fatigue problem, AR overlay constraints, what transfers from flat design
- **may-2029-color-environmental-design**: Scale effect in physical spaces, natural light cycles, material and finish interactions, wayfinding color principles
- **may-2029-color-typography-hierarchy**: Lightness-importance relationship, color as hierarchy layer, weight-color tradeoff, 5-level type color scale

### Category A — 3 New SEO Guides (now 119 total, extraGuides20)

- **ecommerce-color-guide**: Product background psychology, category color language, checkout palette strategy, urgency color conventions, full e-commerce color system — targets e-commerce/conversion SEO
- **social-media-color-guide**: Grid-as-design-unit, platform-specific color behaviors (Instagram/LinkedIn/TikTok/Pinterest), signature palette building, adapting across content types — targets social media/content SEO
- **color-illustration-guide**: Restricted palette principle, value structure first methodology, temperature contrast for depth, building a color voice — targets illustration/digital art SEO

### Category D — 3 New Collections (now 73 total, extraCollections20)

- **twilight-lavender**: iris-veil-muted through plum-ink-muted — meditative violet/purple palette for wellness, beauty, premium nighttime digital products
- **chalk-and-coral**: ember-veil + apricot-veil + coral-silk/tone + ember-shadow — warm approachable palette for creative studios, lifestyle editorial
- **slate-and-sage**: cobalt-veil/pearl/tone/ink + moss-silk — composed professional palette for architecture, real estate, premium B2B

### Current State After This Run

- Total newsletter issues: **176** (Issues 001–176, 5 new)
- Total SEO guides: **119** (3 new in extraGuides20)
- Total collections: **73** (3 new in extraCollections20)
- Build: ✓ clean
- Typecheck: ✓ clean

**Files modified (3):**
- src/data/newsletter-issues.json (5 new issues, now 176)
- src/lib/guides.ts (3 guides in extraGuides20, now 119)
- src/lib/collections.ts (3 new, now 73)

**Commit:** 7614963

## 2026-03-26 — BIG RUN: Color Use Cases Feature + Newsletter 177-184 + 5 Guides + 5 Collections (commit 0e48595)

### BIG RUN — New Feature: Color Palettes by Industry (/use-cases/)

Added a complete new section with 10 industry-specific color palette guides:
- **SaaS & Tech**: Cerulean/Arctic/Slate palettes, trust + clarity focus
- **Healthcare & Wellness**: Teal/Sage/Lavender, calm + reassuring
- **Luxury & Premium**: Quiet luxury/ink-and-gold, restraint + authority
- **Food & Beverage**: Terracotta/Golden/Fresh herb, appetite + warmth
- **Finance & Fintech**: Ocean/Midnight/Nordic, stability + confidence
- **Education & E-Learning**: Golden/Arctic/Studio, focus + encouragement
- **Creative & Design Studios**: Chalk-coral/Aurora/Dark botanical, boldness
- **Sustainability & Environment**: Forest/Sage/Moss, grounded + honest
- **Beauty & Fashion**: Quiet luxury/Rose quartz/Twilight lavender
- **Nonprofit & Social Impact**: Sage/Chalk-coral/Nordic, purpose + warmth

Each use case has: color family recommendations, families to avoid, 4 key principles, tone summary, curated collection links, related guide links, and cross-links to other industries.

**New files (5):**
- `src/lib/use-cases.ts` — Data file with 10 UseCase objects
- `app/use-cases/page.tsx` — Index route
- `app/use-cases/[slug]/page.tsx` — Detail route (10 static pages, dynamicParams=false)
- `src/components/use-cases-page.tsx` — Index client component
- `src/components/use-case-detail-page.tsx` — Detail client component

**Updated files (6):**
- `src/components/site-header.tsx` — Added `/use-cases` to type union + nav link "By Industry"
- `app/sitemap.ts` — Added /use-cases/ index + 10 detail URLs
- `src/lib/i18n.ts` — Added nav.useCases key (EN: "By Industry", ZH: "按行业")
- `src/data/newsletter-issues.json` — 8 new issues
- `src/lib/guides.ts` — 5 new guides in extraGuides21
- `src/lib/collections.ts` — 5 new collections in extraCollections21

### Category A — 8 Newsletter Issues (now 184 total)

- **may-2029-color-negative-space**: Background color theory, off-white taxonomy, dark mode negative space, component design
- **jun-2029-color-motion-animation**: Temporal contrast, easing curves, saturation in motion, reduced motion a11y
- **jun-2029-color-data-visualization**: Perceptual uniformity, sequential vs. diverging scales, categorical color, a11y in charts
- **jun-2029-cultural-color-meanings**: Red across cultures, white mourning in East Asia, green in Islam, designing for translation
- **jun-2029-color-print-vs-screen**: Gamut problem, Pantone spot colors, ICC profiles, brand color documentation
- **jul-2029-color-microinteractions**: Hover state logic, focus ring design, loading/progress color, success/error feedback
- **jul-2029-seasonal-palette-design**: Core vs. seasonal model, color calendar, production timeline, e-commerce seasonal cycles
- **jul-2029-color-system-auditing**: Inventory audit, consolidation, accessibility audit, token review

### Category A — 5 New SEO Guides (now 124 total, extraGuides21)

- **color-for-healthcare-design**: Clinical hue families, reserved red, WCAG AAA target, accessibility in health
- **rebranding-color-guide**: When to change, equity preservation, transition palette, documentation
- **color-temperature-guide**: Warm vs. cool theory, spatial effects, industry temperature conventions
- **dark-mode-palette-guide**: Elevation model, near-black backgrounds, saturation reduction, accent adjustment
- **color-saturation-guide**: Chroma bands, saturation contrast tool, saturation fatigue, premium design

### Category D — 5 New Collections (now 78 total, extraCollections21)

- **glacier-melt**: Azure veil + aqua mist + cerulean ink — Arctic precision for tech and premium water brands
- **amber-library**: Honey/amber warmth — publishing, education, knowledge products
- **concrete-bloom**: True gray + single rose bloom — architecture, property, urban lifestyle
- **verdigris-copper**: Teal patina + ember copper — craft spirits, artisan goods, heritage brands
- **dusk-violet**: Orchid/plum twilight — premium beauty, evening venues, fragrance

### Current State After This Run

- Total newsletter issues: **184** (Issues 001–184, 8 new)
- Total SEO guides: **124** (5 new in extraGuides21)
- Total collections: **78** (5 new in extraCollections21)
- New pages: **12** (1 index + 10 use case detail + 1 route group)
- Typecheck: ✓ clean

**Files modified (11):**
- app/sitemap.ts
- app/use-cases/[slug]/page.tsx (new)
- app/use-cases/page.tsx (new)
- src/components/site-header.tsx
- src/components/use-case-detail-page.tsx (new)
- src/components/use-cases-page.tsx (new)
- src/data/newsletter-issues.json
- src/lib/collections.ts
- src/lib/guides.ts
- src/lib/i18n.ts
- src/lib/use-cases.ts (new)

**Commit:** 0e48595

---

## 2026-03-26 — Normal Run

**Run type:** Normal
**Commit:** 6d8d96e
**Typecheck:** ✓ clean

### Category A — 5 New Newsletter Issues (now 189 total)

- **jul-2029-color-environmental-wayfinding**: Wayfinding and environmental color — scale effects, zone isolation, metamerism, material finish
- **aug-2029-typography-color-interface**: Typography-color interface — weight and apparent value, color as hierarchy signal, font rendering, line length fatigue
- **aug-2029-ecommerce-conversion-color**: E-commerce conversion color — CTA contrast vs hue, trust palette, urgency/scarcity signals, photography alignment
- **aug-2029-semantic-token-naming**: Semantic color tokens — primitive/semantic/component layers, naming rules, dark mode as correctness test
- **aug-2029-gradient-design-principles**: Gradients in UI — what gradients communicate, muddy middle / OKLCH interpolation, functional patterns, gradient tokens

### Category A — 5 New SEO Guides (now 129 total, extraGuides22)

- **ecommerce-color-guide**: E-commerce color strategy — CTA contrast, trust palette selection, urgency signals, photography alignment
- **wayfinding-color-design**: Environmental wayfinding color — scale effects, zone isolation, metamerism, material/finish constraints
- **color-token-naming-guide**: Semantic token naming — primitive/semantic/component hierarchy, naming mistakes, dark mode test
- **gradient-design-guide**: Gradient design — temporal contrast, OKLCH muddy-middle fix, functional gradient patterns, gradient tokens
- **color-and-motion-guide**: Color and motion — temporal contrast, easing and color, loading state color, reduced motion equivalents

### Category D — 4 New Collections (now 82 total, extraCollections22)

- **sand-dune**: Warm apricot/honey dune tones — Mediterranean hospitality, organic lifestyle, wellness retreats
- **nordic-morning**: Ice-pale blues and cool gray — Scandinavian-aesthetic brands, productivity tools, healthcare tech
- **ember-hearth**: Firelit amber/ruby embers — home goods, candle brands, cozy hospitality
- **mint-laboratory**: Clean mint/seafoam on clinical white — health tech, clean beauty, science-backed wellness

### Files modified (3)
- src/data/newsletter-issues.json
- src/lib/guides.ts
- src/lib/collections.ts

---

## 2026-03-26 — Normal Run

**Run type:** Normal
**Commit:** d664310
**Typecheck:** ✓ clean

### Category A — 5 New Newsletter Issues (now 194 total)

- **sep-2029-accessible-color-in-data-tables**: Contrast matrices for all row state backgrounds, WCAG 1.4.1 row encoding without color dependence, status icons in dense tables, color density management
- **sep-2029-color-in-onboarding-flows**: Progressive color introduction, forward-looking progress indicators, error calibration (amber before red), completion color moments
- **sep-2029-color-and-typography-pairing**: How weight changes apparent color via negative space, serif vs. sans-serif lightness response, display type on backgrounds, cross-platform rendering
- **sep-2029-color-system-documentation**: Four documentation layers (decision/semantic/implementation/usage), documentation proximity to code, changelog discipline, automated consistency enforcement
- **oct-2029-color-in-mobile-ui**: OLED true black vs LCD near-black dark mode, iOS/Android platform color conventions, touch-target affordance without hover states

### Category A — 5 New SEO Guides (now 134 total, extraGuides23)

- **color-in-data-tables-guide**: Accessible enterprise data tables — WCAG 1.4.1 row encoding, contrast matrices, status color conventions
- **onboarding-color-design-guide**: UX onboarding flows — progressive color, progress momentum, error calibration, completion moments
- **color-typography-pairing-guide**: Color-type interactions — apparent color by weight, serif vs sans-serif, cross-platform rendering
- **color-system-documentation-guide**: Design system docs — four layers, changelog discipline, automated enforcement
- **mobile-ui-color-guide**: Mobile color design — OLED dark mode, iOS/Android conventions, touch affordance

### Category B — i18n for Use-Cases Pages

- Added 13 new translation keys in `src/lib/i18n.ts` for use-cases UI strings (EN + ZH)
- Updated `UseCasesPage` to use `t()` with locale detection + `colorarchive-locale-change` event listener
- Updated `UseCaseDetailPage` to use `t()` for all section headings and navigation strings

### Category E — Email Improvements

- **Bug fix**: `sendProUpsellEmail` used `FROM_EMAIL` (the env var name literal) instead of `FROM` (the declared variable) — would have caused a ReferenceError in production
- **New function**: `sendReferralWelcomeEmail(to, { referrerName })` — welcome email for users who signed up via a referral link; includes feature list, Explore CTA, and Pro upsell panel; exported from `module.exports`

### Files Modified (6)

- `src/data/newsletter-issues.json` — 5 new issues
- `src/lib/guides.ts` — extraGuides23 (5 guides)
- `src/lib/i18n.ts` — 13 new i18n keys for use-cases
- `src/components/use-cases-page.tsx` — i18n integration
- `src/components/use-case-detail-page.tsx` — i18n integration
- `server/email.js` — FROM_EMAIL bug fix + sendReferralWelcomeEmail


---

## 2026-03-26 — Normal Run

**Run type:** Normal
**Commit:** ebf9981
**Typecheck:** ✓ clean

### Category A — 5 New Newsletter Issues (now 199 total)

- **oct-2029-color-in-ai-interfaces**: Generative state vs loading state, streaming text opacity treatment, confidence encoding, AI refusal state visual containers, dark-mode-first for AI products
- **oct-2029-print-to-digital-color**: Pantone-to-hex translation, color profiles and P3 gamut, paper-white vs screen-white, environmental/signage color, cross-medium brand color spec
- **oct-2029-color-in-video-streaming-ui**: Dark-first rationale, thumbnail color chaos containment, restrained brand color signal, text-over-image scrim tokens, progress/state density
- **nov-2029-financial-data-color**: Red/green convention + a11y failure, trust vs brand color, categorical chart color, progressive disclosure color, urgency/alert hierarchy
- **nov-2029-ambient-display-color**: Luminance APL management, environmental color harmony, peripheral vision motion limits, time-of-day color temperature shift

### Category A — 5 New SEO Guides (now 139 total, extraGuides24)

- **ai-interface-color-guide**: AI generative states, streaming text treatment, confidence without numbers, refusal/system message styling, dark-first design
- **print-to-digital-color-guide**: Pantone translation, P3 gamut awareness, paper-to-screen gap, environmental color, cross-medium brand spec
- **financial-ui-color-guide**: Red/green a11y failure, trust vs brand color, categorical chart system, progressive disclosure color, urgency color hierarchy
- **video-streaming-ui-color-guide**: Dark-first design principles, thumbnail chaos management, restrained brand color use, scrim design tokens, state and density
- **ambient-display-color-guide**: Luminance APL, environmental harmony, peripheral motion thresholds, time-of-day color temperature

### Category D — 4 New Collections (now 86 total, extraCollections23)

- **solar-terracotta**: Warm apricot-coral-amber fired-clay palette — ceramics, artisan craft, natural skincare, warm-climate hospitality
- **deep-ocean**: Pale coastal cerulean through abyssal cobalt navy — maritime, water products, professional services
- **pearl-cloud**: Cool-tinted pearl whites through silvery gray — premium tech, luxury retail, high-end editorial
- **golden-harvest**: Warm citrine-honey-amber harvest palette — food, agriculture, artisan, natural lifestyle brands

### Files modified (3)
- src/data/newsletter-issues.json — 5 new issues (195-199)
- src/lib/guides.ts — extraGuides24 (5 guides)
- src/lib/collections.ts — extraCollections23 (4 collections)


---

## 2026-03-26 — Big Run

**Run type:** Big (4 normal runs since last big run)
**Commit:** d8615e7
**Typecheck:** ✓ clean

### New Feature: Color Name Generator (/name/)

A complete new tool accessible at `/name/` that analyzes any hex color and generates:
- Poetic/evocative name (e.g. "Pale Sage Mist") using hue family word pools, lightness descriptors, saturation modifiers
- Alternate name variants (2 additional names)
- CSS custom property name (e.g. `--color-sage-soft`)
- Tailwind-compatible class name (e.g. `sage-200`)
- Sass variable (`$color-sage-soft`)
- Semantic role suggestion (background-subtle, text-primary, interactive-default, etc.)
- WCAG contrast ratios vs white and black with AA/AAA labels
- Color psychology / mood associations per hue family
- Nearest ColorArchive named color via Euclidean RGB distance search across all 3,066 colors
- 8 preset colors for quick exploration
- Color picker + hex text input + URL state (shareable links)

**New files:**
- `src/lib/color-naming.ts` — naming algorithm + word pools + nearestColor()
- `src/components/color-name-page.tsx` — UI component
- `app/name/page.tsx` — App Router page with metadata

**Supporting updates:**
- `src/components/tools-page.tsx` — Added Color Name Generator to tools grid
- `src/components/site-header.tsx` — Added "/name" to currentPath union type
- `app/sitemap.ts` — Added /name/ sitemap entry (priority 0.84)
- `src/lib/i18n.ts` — Added EN+ZH keys: `tools.colorNamer.name`, `tools.colorNamer.desc`

### Category A — 5 New Newsletter Issues (now 204 total)

- **nov-2029-color-naming-systems**: Pantone/Munsell/NCS naming systems, two-tier token model, poetic name alignment
- **dec-2029-dark-mode-color-systems**: Beyond inversion — OLED constraints, semantic tokens, saturation shifts
- **dec-2029-color-in-dashboard-design**: Signal vs noise, categorical parsimony, status color conventions
- **dec-2029-color-and-trust**: Blue shade signals in financial/medical/legal, high-stakes moment conservatism
- **dec-2029-seasonal-color-shifts**: Where seasonal color belongs, brand DNA, semantic token seasonal strategy

### Category A — 5 New SEO Guides (now 144 total, extraGuides25)

- **color-naming-guide**: Primitive vs semantic tiers, poetic names, CSS naming conventions, naming pitfalls
- **dark-mode-color-guide**: OLED constraints, semantic token architecture, saturation management, surface elevation
- **trust-color-guide**: Blue shade signals, high-stakes moment design, differentiation within trust palette
- **dashboard-color-guide**: Categorical parsimony, status conventions, contrast hierarchy, multi-chart consistency
- **seasonal-color-design-guide**: Functional vs promotional zones, brand compatibility, token architecture

### Category D — 4 New Collections (now 90 total, extraCollections24)

- **storm-silver**: Cool cobalt/cerulean/azure at low saturation for enterprise software and precision tech brands
- **blush-garden**: Rose/coral/blush palette for beauty, bridal, wellness, and feminine lifestyle brands
- **dark-academia**: Amber/ember/moss shadows for literary, publishing, and scholarly aesthetic brands
- **coastal-sage**: Seafoam/jade/teal at muted saturation for wellness and Mediterranean hospitality brands

### Files Modified (10)
- `app/name/page.tsx` — new
- `src/components/color-name-page.tsx` — new
- `src/lib/color-naming.ts` — new
- `src/components/tools-page.tsx` — color namer added
- `src/components/site-header.tsx` — /name added
- `app/sitemap.ts` — /name/ entry
- `src/lib/i18n.ts` — colorNamer keys
- `src/data/newsletter-issues.json` — 5 new issues (200-204)
- `src/lib/guides.ts` — extraGuides25 (5 guides, 144 total)
- `src/lib/collections.ts` — extraCollections24 (4 collections, 90 total)


---

## 2026-03-26 — Normal Run

**Run type:** Normal (1st run since last big run)
**Commit:** 12a04a5
**Typecheck:** ✓ clean

### Category A — 5 New Newsletter Issues (now 209 total)

- **jan-2030-gradient-design**: Chromatic vs tonal gradients, mesh gradient chromatic range, CSS color-interpolation-method in OKLab/OKLCH
- **jan-2030-mobile-color-dark**: OLED black artifacts (#000000 halo problem), Display P3 gamut cross-device variance, semantic token two-layer architecture for OS dark mode
- **jan-2030-color-in-saas**: B2B trust-first color architecture, tier color using material metaphors over status colors, pricing page CTA contrast hierarchy
- **jan-2030-typography-color-harmony**: Heavy type + saturated color collision, cross-modal pairing logic, typeface classification and color temperature alignment
- **jan-2030-color-accessibility-beyond-contrast**: Color blindness secondary signals, motion and vestibular accessibility, focus state color and WCAG 2.2

### Category A — 5 New Guides (now 149 total, extraGuides26)

- **gradient-color-guide**: Chromatic vs tonal progressions, mesh gradient design, CSS implementation details
- **mobile-dark-mode-color-guide**: OLED, Display P3, semantic token dark mode architecture
- **saas-color-strategy-guide**: B2B trust colors, tier systems, pricing page color hierarchy
- **typography-color-pairing-guide**: Weight/saturation pairing, colored type contrast, typeface emotional register
- **color-accessibility-beyond-contrast-guide**: Color blindness patterns, motion accessibility, focus state compliance

### Category D — 4 New Collections (now 94 total, extraCollections25)

- **midnight-forge**: Deep charcoal-navy-steel — developer tools, industrial tech, precision manufacturing
- **spring-herb**: Fresh sage-chartreuse-mint — wellness, clean food, natural personal care
- **burnt-clay**: Terra cotta-adobe-rust — ceramic studios, artisan kitchen goods, interior design
- **arctic-white**: Ice-silver-cold-gray — premium tech, Scandinavian design, ultra-minimal products

### Files modified (3)
- src/data/newsletter-issues.json — 5 new issues (205-209)
- src/lib/guides.ts — extraGuides26 (5 guides, 149 total)
- src/lib/collections.ts — extraCollections25 (4 collections, 94 total)

---

## 2026-03-26 — Normal Run

**Run type:** Normal (2nd run since last big run)
**Commit:** 78c427f
**Typecheck:** ✓ clean

### Category A — 5 New Newsletter Issues (now 214 total)

- **feb-2030-color-in-motion**: Temporal color contrast, OKLCH interpolation vs sRGB, easing and color, dark/light mode toggle animation
- **feb-2030-print-vs-digital-color**: Gamut mismatch, complete brand color specification (hex/CMYK/Pantone/Delta-E), cross-media failures, physical materials
- **feb-2030-design-token-color-systems**: Two-tier token architecture, dark mode test, interaction state tokens, naming conventions
- **feb-2030-ecommerce-color-psychology**: Color fit over universal associations, CTA contrast research, trust color evidence, urgency overuse degradation
- **feb-2030-color-in-ai-interfaces**: Generative state color, uncertainty coloring discipline, AI error state nuance, output trust architecture

### Category A — 5 New Guides (now 154 total, extraGuides27)

- **color-in-motion-design-guide**: Temporal contrast, OKLCH interpolation, animation states, dark mode toggle animation
- **print-vs-digital-color-guide**: Gamut intersection, brand color spec, cross-media failure modes, physical media constraints
- **design-token-color-guide**: Primitive/semantic layers, dark mode test, state token vocabulary, naming conventions
- **ecommerce-color-psychology-guide**: Color fit research, CTA contrast, trust architecture, urgency overuse
- **ai-interface-color-guide**: Generation states, uncertainty, error states, output trust building

### Category D — 4 New Collections (now 98 total, extraCollections26)

- **desert-gold**: Warm amber/ochre/sand for artisan goods, natural beauty, heritage craft brands
- **electric-violet**: Deep indigo/electric purple for creative tech, gaming, AI products, entertainment
- **forest-floor**: Deep moss/umber/bark for sustainability, outdoor, organic food, botanical wellness
- **pearl-oyster**: Cream/warm-white/luminous-gray for quiet luxury fashion, premium hospitality, editorial

### Category C — 45 New Search Aliases (color-search.ts)

Added keywords for: motion design, temporal color, color management/print, design tokens, e-commerce conversion, AI interfaces, and new collection identities (desert, violet/indigo, forest, pearl/oyster/quiet luxury)

### Files Modified (4)
- `src/data/newsletter-issues.json` — 5 new issues (210-214)
- `src/lib/guides.ts` — extraGuides27 (5 guides, 154 total)
- `src/lib/collections.ts` — extraCollections26 (4 collections, 98 total)
- `src/lib/color-search.ts` — 45 new search aliases

---

## 2026-03-26 — Normal Run

**Run type:** Normal (3rd run since last big run)
**Commit:** 9eea5d1
**Typecheck:** ✓ clean (fixed 2 duplicate key errors in color-search.ts)

### Category A — 5 New Newsletter Issues (now 219 total)

- **mar-2030-wayfinding-color**: Signage legibility, environmental contrast, redundant encoding for color-blind accessibility, material-specific specification
- **mar-2030-luxury-brand-color**: Restraint vs richness logic, heritage color equity, why black-and-gold fails mature luxury brands, materiality signals
- **mar-2030-data-viz-color**: Sequential/diverging/categorical scale selection, OKLCH for perceptual accuracy, color-blind accessibility testing
- **mar-2030-packaging-color**: Shelf legibility conditions, category color conventions, material-specific specification, finish quality as premium signal
- **mar-2030-sustainable-brand-color**: Aesthetics decoupled from credentials, specificity as differentiator, vivid colors and sustainability, regulatory risk

### Category A — 5 New Guides (now 159 total, extraGuides28)

- **wayfinding-color-guide**: Environmental constraints, category distinctiveness, redundant encoding, material-specific specification
- **luxury-brand-color-guide**: Brand equity vs psychology, materiality encoding, heritage color protection
- **data-visualization-color-guide**: Scale type selection, perceptual accuracy in OKLCH, color-blind accessibility
- **packaging-color-guide**: Shelf simulation, category conventions, material specification, finish as premium signal
- **sustainable-brand-color-guide**: Decoupled aesthetics, specificity as differentiator, vivid sustainability, regulatory risk

### Category D — 4 New Collections (now 102 total, extraCollections27)

- **platinum-edge**: Cool blue-gray and silver for precision tech, luxury hardware, automotive
- **tuscan-clay**: Warm terracotta, muted coral, olive for Mediterranean artisan brands
- **dusk-lavender**: Muted violet and iris for mindfulness, meditation, mental wellness apps
- **bamboo-grove**: Warm jade and olive for spa, organic beauty, botanical wellness

### Category D — 26 New Search Aliases (color-search.ts)

Added unique new terms: environmental, prestige, legacy, refined, choropleth, fmcg, organic_packaging, greenwashing, eco_brand, regenerative, chrome, metallic, tuscan, mediterranean, terracotta_palette, lilac, mindful, bamboo, wellness_green + 7 more

### Files Modified (4)
- `src/data/newsletter-issues.json` — 5 new issues (215-219)
- `src/lib/guides.ts` — extraGuides28 (5 guides, 159 total)
- `src/lib/collections.ts` — extraCollections27 (4 collections, 102 total)
- `src/lib/color-search.ts` — 26 new unique search aliases

---

## Run — 2026-03-26 (Normal Run #4 since last big run)

**Timestamp:** 2026-03-26
**Type:** Normal
**Commit:** 0334cc2
**Categories:** A (Newsletter + Guides), D (Collections + Search Aliases)

### Category A — 5 New Newsletter Issues (now 224 total)

- **apr-2030-fashion-color-forecasting**: How forecasting agencies build palettes, Color of the Year vs strategic palettes, digital micro-trends vs slow traditional cycle
- **apr-2030-color-spatial-memory**: Landmark color in route learning, zone color coding for navigation efficiency, cognitive accessibility design
- **apr-2030-film-color-grading**: Multi-timescale narrative color, teal-and-orange convention critique, saturation as expressive register, lessons for motion designers
- **apr-2030-healthcare-color-design**: Patient preference vs functional requirements, evidence on anxiety reduction, wayfinding as patient safety, color and perceived noise
- **apr-2030-brand-color-dilution**: Production drift mechanisms, sub-brand color architecture, licensing controls, digital-to-physical translation gap

### Category A — 5 New Guides (extraGuides29, now 164 total)

- **fashion-color-forecasting-guide**: Trend pipeline, forecasting agency outputs, strategic timing for designers
- **healthcare-color-design-guide**: Evidence-based clinical color, patient anxiety research, wayfinding safety
- **film-cinematography-color-guide**: Narrative color logic, teal-orange convention, saturation register, motion design lessons
- **spatial-color-design-guide**: Perceived dimensions, spatial memory formation, zone coding efficiency, cognitive accessibility
- **brand-color-consistency-guide**: Production drift, sub-brand architecture, licensing controls, digital-physical translation

### Category D — 4 New Collections (extraCollections28, now 106 total)

- **arctic-aurora**: Ice blue, pale cyan, cool mint — nordic tech/environmental orgs/premium water
- **scorched-earth**: Deep ochre, raw sienna, rust — rugged outdoor, craft spirits, industrial
- **deep-ocean**: Dark navy, teal-black, deep blue — marine tech, enterprise security, naval
- **desert-rose**: Warm blush, dusty peach, sand-pink — contemporary beauty, minimal luxury, fine jewelry

### Category D — 49 New Search Aliases (color-search.ts)

Fashion: forecast, trend, trending_color, coloroftheyear, fashion_palette
Film: film_grade, cinematic_teal, noir, colorgrade, moody_film
Healthcare: clinical, hospital, calming_blue, therapeutic
Spatial: interior_color, room_color, architectural, spatial, wallpaint
Nordic/Arctic: nordic_color, glacial, polar, frost
Ocean: deep_blue, ocean_depth, submarine
Desert: scorched, rust_palette, wildwest
Beauty: blush_palette, beauty_brand, skincare, desert_rose, sun_kissed, feminine_minimal

### Files Modified (4)
- `src/data/newsletter-issues.json` — 5 new issues (220-224)
- `src/lib/guides.ts` — extraGuides29 (5 guides, 164 total)
- `src/lib/collections.ts` — extraCollections28 (4 collections, 106 total)
- `src/lib/color-search.ts` — 49 new unique search aliases

---

## 2026-03-26 — BIG Run (5th run since last big run)

**Run type:** Big Run (1st big run since last big run at d8615e7)
**Commit:** 785895e
**Typecheck:** ✓ clean
**Build:** ✓ clean (first full build in several runs — caught and fixed pre-existing invalid color IDs)

### New Feature: CSS Named Colors Reference (/css-colors/)

Built a complete new tool page for CSS named color keywords:
- Lists all 148 CSS named color keywords with swatches, hex/RGB/HSL values
- Search by name or hex, filter by color family (13 families) or CSS level (CSS1-CSS4)
- Hover swatches show copy buttons for name and hex
- CSS level badges for each color (CSS1/CSS3/CSS4)
- Info cards explaining CSS level history including the rebeccapurple story
- Added to tools page Developer category with `</>` icon
- Added to sitemap with priority 0.85
- Added EN+ZH i18n keys
- Added `/css-colors` to SiteHeader currentPath type
- Related tools links: Color Converter, Contrast Checker, Tints & Shades, Design Tokens

### Category A — 5 New Newsletter Issues (now 229 total)

- **may-2030-css-color-systems**: CSS color history from VGA palette to oklch, rebeccapurple, perceptual uniformity
- **may-2030-color-in-motion-design**: Transition timing semantics, saturation trajectories, color narrative callbacks
- **may-2030-color-and-type-pairing**: Visual weight shifts, temperature matching with typefaces, legibility edge cases
- **may-2030-material-color-psychology**: Matte vs gloss premium signals, metallic material override, translucency luminosity
- **may-2030-color-iteration-prototyping**: Context simulation, paired comparison stakeholder alignment, evaluation criteria

### Category A — 5 New Guides (extraGuides30, now 169 total)

- **css-color-guide**: CSS named colors history, oklch perceptual uniformity, production color spec strategy
- **motion-design-color-guide**: Transition speed semantics, saturation trajectories, color temperature arcs
- **chromatic-typography-guide**: Type weight/temperature interactions, typeface-color pairing tendencies, legibility
- **material-color-guide**: Matte vs gloss, metallic material psychology, translucency luminosity effects
- **color-iteration-process-guide**: Context simulation, paired comparison, systematic evaluation criteria

### Category D — 4 New Collections (extraCollections29, now 110 total)

- **golden-ratio**: Rich amber, warm honey, burnished gold — artisan luxury, fine spirits, architectural materials
- **stone-garden**: Weathered limestone, dry sage, warm gray — Japanese zen, mindfulness, premium ceramics
- **citrus-grove**: Vivid lemon, warm tangerine, electric lime — Mediterranean food, summer editorial, beverage
- **navy-signal**: Deep navy, signal red, crisp white — maritime institutions, menswear, precision instruments

### Category D — 37 New Search Aliases

CSS: css_named, css_color, cornflowerblue, rebeccapurple, goldenrod, chartreuse, aquamarine, periwinkle, celadon, vermillion, cobalt_blue (updated), prussian, phthalo, titanium, tungsten
Motion/Animation: animation_color, ui_animation
Maritime: navy_signal, nautical
Food: lemon, tangerine
Lifestyle: stone_garden, karesansui, meditation (updated)
Typography: typography_color, chromatic_type
Material: material_color, gold_palette, precious_metal

### Build Fixes (pre-existing bugs)

First full `npm run build` in several runs caught:
- Invalid color IDs throughout collections.ts (slate-*, cyan-*, green-*, navy-*, amber-gold/noon/earth/fire/depth/sunrise, cobalt-depth-strong, teal-depth-strong, violet-electric-*, peach-*, rust-*, sage-*, white-pearl-faint, chartreuse-*, indigo-electric-*)
- Root names "slate", "cyan", "green", "navy", "peach", "rust", "sage" don't exist in color catalog
- Lightness bands "gold", "noon", "earth", "fire", "depth", "morning", "afternoon", "electric", "sunrise" are invalid
- Chroma bands "strong", "deep" are invalid
- Replaced all ~35 invalid IDs with valid equivalents (cobalt-*, cool-gray-*, emerald-*, moss-*, apricot-*, aqua-*, ember-*, etc.)
- Also fixed: 25 newsletter issues missing `date` field (caused sitemap RangeError on toISOString)

### Files Modified (11)
- `app/css-colors/page.tsx` — new page route
- `src/components/css-colors-page.tsx` — new client component (148 CSS colors, search/filter)
- `src/components/site-header.tsx` — added /css-colors to currentPath type
- `src/components/tools-page.tsx` — added CSS Named Colors to Developer category
- `app/tools/page.tsx` — updated description count
- `src/lib/i18n.ts` — added cssColors.name/desc EN+ZH keys
- `app/sitemap.ts` — added /css-colors/ with priority 0.85
- `src/data/newsletter-issues.json` — 5 new issues (225-229) + date fixes on 25 prior
- `src/lib/guides.ts` — extraGuides30 (5 guides, now 169 total)
- `src/lib/collections.ts` — extraCollections29 (4 new, now 110) + 35 invalid ID fixes
- `src/lib/color-search.ts` — 37 new aliases (net, after dedup removal)

---

## 2026-03-26 — Normal Run

**Run type:** Normal Run (1st since last big run at 785895e)
**Commit:** 0a8427b
**Typecheck:** ✓ clean

### Category A — 5 New Newsletter Issues (now 234 total)

Topics: June 2030 issue batch covering accessibility, AI tools, cross-cultural color, dark mode systems, and print production.

- **jun-2030-color-accessibility-design**: WCAG contrast ratios, color blindness simulation, building accessible palettes as design input
- **jun-2030-generative-color-ai**: AI exploration vs. human refinement workflow, semantic functional briefs, oklch-based systematic refinement
- **jun-2030-color-cultural-meaning**: Contextual color associations, major cross-cultural differences by hue, blue as globally safe choice, audience research approach
- **jun-2030-dark-mode-color-strategy**: Dark mode as parallel system, semantic token architecture, surface/text value selection, brand color adaptation
- **jun-2030-print-color-production**: CMYK gamut limitations, ICC profile workflow, soft proofing, Pantone specification decisions, print-safe palette building

### Category A — 5 New SEO Guides (extraGuides31, now 174 total)

- **color-accessibility-design-guide**: WCAG, inclusive palettes, color blindness simulation (Accessibility category)
- **dark-mode-color-design-guide**: Semantic tokens, CSS custom properties, dark surface values (Digital Design category)
- **cultural-color-meanings-guide**: Cross-cultural color, global design, cultural association models (Global Design category)
- **print-color-production-guide**: CMYK, ICC profiles, Pantone, screen-to-press gap (Print & Production category)
- **generative-ai-color-guide**: AI palette tools, functional briefs, exploration and refinement workflow (AI Design category)

### Category D — 4 New Collections (extraCollections30, now 114 total)

- **morning-light**: Soft peach, warm cream, pale gold — hospitality, bakery, skincare (apricot, amber, citrine, coral tones)
- **midnight-library**: Deep indigo, dark violet, near-black — premium publishing, luxury tech, intellectual brands
- **lavender-fields**: Soft lavender, pale lilac, quiet violet — wellness, premium beauty, spa
- **deep-forest**: Dark emerald, deep moss, shadow green — premium outdoor, craft spirits, conservation

### Category D — 30 New Search Aliases

Accessibility: a11y, accessible_color, color_blindness, inclusive_design
Dark mode: dark_palette (new, others existed)
Print: offset_print, print_color
Cultural: chinese_color, lunar_new_year, festive_red, japanese_aesthetics, scandinavian_color, mediterranean_color
Warmth/Soft: morning_light, soft_warmth
Editorial: midnight_palette
Lavender/wellness: lavender_palette, lilac_palette, wellness_color, spa_color
Forest/outdoor: forest_green, old_growth
AI/generative: generative_palette, ai_palette, algorithmic

### Files Modified (4)
- `src/data/newsletter-issues.json` — 5 new issues (230-234)
- `src/lib/guides.ts` — extraGuides31 (5 guides, 174 total)
- `src/lib/collections.ts` — extraCollections30 (4 collections, 114 total)
- `src/lib/color-search.ts` — 30 new unique search aliases

---

## 2026-03-26 — Normal Run

**Run type:** Normal Run (2nd since last big run at 785895e)
**Commit:** 1b0bd02
**Typecheck:** ✓ clean

### Category A — 5 New Newsletter Issues (now 239 total)

Topics: July 2030 batch covering hospitality design, sports branding, cognitive science of color, wayfinding systems, and accessibility math.

- **jul-2030-color-in-restaurant-design**: Appetite stimulation vs suppression, dining behavior by format, lighting color temperature, positioning alignment
- **jul-2030-color-sports-branding**: Tribal signaling function, color equity accumulation, rebrand success/failure patterns, new franchise development
- **jul-2030-color-memory-learning**: Isolation effect, arousal encoding, semantic documentation color systems, accessibility in learning materials
- **jul-2030-color-wayfinding-systems**: London Underground principles, discriminability requirements, zone hierarchy, digital navigation translation
- **jul-2030-color-contrast-technical**: WCAG luminance formula, perceptual weighting, calibration techniques, APCA introduction

### Category A — 5 New SEO Guides (extraGuides32, now 179 total)

- **restaurant-color-design-guide**: Hospitality color, appetite psychology, quick service vs fine dining (Interior Design)
- **sports-brand-color-guide**: Tribal identity, rebrand strategy, franchise color development (Brand Strategy)
- **color-memory-learning-guide**: Isolation effect, arousal encoding, semantic color systems (Color Psychology)
- **wayfinding-color-systems-guide**: Environmental design, discriminability, zone hierarchy (Environmental Design)
- **color-theory-fundamentals-guide**: Color wheel, harmony models, value, simultaneous contrast (Color Theory)

### Category D — 4 New Collections (extraCollections31, now 118 total)

- **vintage-americana**: Deep navy + barn red + warm cream — American heritage brands, workwear, craft food
- **tea-ceremony**: Warm cream + aged brown + quiet sage — Japanese wellness, matcha brands, ceramics
- **electric-dreams**: Vivid violet + cobalt + iris + teal — digital creative tools, AI platforms, gaming
- **copper-verdigris**: Copper ember + oxidized jade — craft spirits, architectural metalwork, artisan goods

### Category D — 34 New Search Aliases

Color theory education: analogous, complementary, triadic, split_complementary, tetradic
Interior styles: hygge, maximalist, mid_century_modern
Photography types: street_photography, landscape_photo, food_photography
Cultural palettes: indian_color, african_palette, latin_palette, middle_eastern
Workspace/focus: home_office, workspace, focus_mode
Design movements: constructivism, pop_art, art_nouveau, impressionism
Heritage: vintage_americana, barnwood, tea_ceremony, matcha_palette
Electric/neon: electric_palette, neon_spectrum
Metal/patina: copper_palette (verdigris deduped)

### Files Modified (4)
- `src/data/newsletter-issues.json` — 5 new issues (235-239)
- `src/lib/guides.ts` — extraGuides32 (5 guides, 179 total)
- `src/lib/collections.ts` — extraCollections31 (4 collections, 118 total)
- `src/lib/color-search.ts` — 34 new unique search aliases

---

## 2026-03-26 — Normal Run

**Run type:** Normal Run (3rd since last big run at 785895e)
**Commit:** 9b91174
**Typecheck:** ✓ clean

### Category A — 5 New Newsletter Issues (now 244 total)

Topics: August 2030 batch covering packaging design, adaptive color for dark/light mode, design token architecture, color trend forecasting, and color grading for photography.

- **aug-2030-color-packaging-design**: Shelf psychology, three-second decision window, category color codes, shelf impact vs. brand harmony, physical and digital environments
- **aug-2030-color-dark-light-adaptive**: Why inversion fails, semantic token architecture, surface elevation stack, brand color adaptation, accessibility in adaptive systems
- **aug-2030-design-tokens-color-architecture**: Three-tier token model (primitive/semantic/component), naming principles, multi-mode and multi-theme support, Figma Variables pipeline
- **aug-2030-color-forecasting-trend-cycle**: How forecasting works, Pantone Color of the Year mechanism, trend durability signals, practical adoption strategy
- **aug-2030-color-grading-film-digital**: Grading vocabulary (lift/gamma/gain), shadow lift and the film look, teal-and-orange grade mechanics, LUT workflow for designers

### Category A — 5 New SEO Guides (extraGuides33, now 225 total)

- **packaging-color-design-guide**: Shelf impact, category codes, physical+digital environments (Packaging Design)
- **adaptive-color-systems-guide**: Dark mode semantic tokens, surface elevation, independent a11y checking (Digital Design)
- **design-tokens-color-guide**: Three-tier architecture, role-based naming, multi-mode, Figma pipeline (Design Systems)
- **color-trend-forecasting-guide**: Forecasting process, Pantone mechanism, structural vs. ephemeral trends (Brand Strategy)
- **color-grading-photography-guide**: Film look, shadow lift, teal-orange grade, LUTs for art direction (Photography)

### Category D — 4 New Collections (extraCollections32, now 122 total)

- **solar-flare**: Max-saturation amber, ember, vivid coral — energy brands, summer campaigns, sports nutrition
- **cloud-nine**: Palest blues and near-whites — minimal SaaS, cloud tech, clean interfaces
- **autumn-harvest**: Deep amber, rust, olive, garnet — seasonal, wine, heritage brands, Q4 retail
- **northern-winter**: Ice blue, cerulean, deep indigo — Nordic lifestyle, winter sports, premium winter beauty

### Category D — 31 New Search Aliases

Packaging/retail: consumer_goods, shelf_impact, retail_display
Dark mode/tokens: adaptive_ui, dark_light, mode_switching, semantic_token, variable_color, component_library
Trend forecasting: fashion_forecast, trend_color, pantone_year, color_cycle, emerging_trend
Film/photography: color_grade, cinematic_color, lut_preset, split_toning
Energy/summer: solar_energy, heat_wave, summer_vivid
Minimal/cloud: cloud_minimal, airy_space, clean_digital
Autumn/harvest: harvest_season, autumn_palette, fall_editorial
Nordic/winter: nordic_winter, ice_palette, winter_palette, arctic_palette

### Files Modified (4)
- `src/data/newsletter-issues.json` — 5 new issues (240-244)
- `src/lib/guides.ts` — extraGuides33 (5 guides, 225 total)
- `src/lib/collections.ts` — extraCollections32 (4 collections, 122 total)
- `src/lib/color-search.ts` — 31 new unique search aliases (657 total)

---

## 2026-03-26 — Big Run

**Run type:** Big Run (4th since last big run, triggering big run threshold)
**Commit:** 9db06f5
**Typecheck:** ✓ clean (fixed duplicate search alias keys + missing links fields)

### New Feature: Famous Color Palettes Page (/famous-palettes/)

A comprehensive reference library of 35 iconic color palettes from brands, art movements, films, and design systems — with hex codes, historical context, and direct palette tools integration.

**Data file (src/lib/famous-palettes.ts):**
35 palettes across 5 categories:
- **Brands (13):** Google, Apple, Spotify, Netflix, Meta, Airbnb, Slack, Stripe, Tiffany & Co., Hermès, Chanel, McDonald's, Coca-Cola
- **Art Movements (6):** Bauhaus, De Stijl/Mondrian, Memphis Design, Art Deco, Impressionism, Pop Art
- **Film & Cinema (5):** Wes Anderson, Blade Runner 2049, Grand Budapest Hotel, The Matrix, Mad Max: Fury Road
- **Design Systems (4):** Nord, Solarized, Dracula, IBM Carbon
- **Fashion & Trends (5):** Millennial Pink, Pantone 2024/2023/2022, Classic Navy & Cream

**UI (src/components/famous-palettes-page.tsx):**
- Category filter bar (All + 5 categories with counts)
- Text search across name, description, tags, color names
- Palette cards with animated swatch strips, historical context, click-to-copy hex codes
- Links to ColorArchive color search for each hex
- "Open in Palette Builder" action per palette
- Related tools section at bottom

**SEO (app/famous-palettes/page.tsx):**
- Full metadata with description targeting "famous brand palettes", "Google colors", "Bauhaus palette", etc.
- JSON-LD CollectionPage structured data
- Canonical URL + OpenGraph

### Category A — 5 New Newsletter Issues (now 249 total)

September–October 2030 batch:
- **sep-2030-color-brand-system-architecture**: Brand color system architecture (primitive/semantic/component three-tier model)
- **sep-2030-color-data-visualization**: Data viz color grammar (categorical, sequential, diverging scales, a11y)
- **sep-2030-historical-pigments-colors**: Pigment history — ultramarine, Tyrian purple, verdigris
- **oct-2030-color-negative-space**: Negative space and color restraint (60-30-10 rule)
- **oct-2030-color-user-research**: User research methods for color decisions

### Category A — 5 New SEO Guides (extraGuides34, ~230 total)

- **data-visualization-color-guide**: Categorical/sequential/diverging scales, Okabe-Ito, common errors
- **historical-pigments-color-guide**: Ultramarine, Tyrian purple, pigment chemistry revolution
- **negative-space-color-guide**: 60-30-10 rule, background color as design decision, luxury restraint
- **brand-color-system-architecture-guide**: Three-tier token architecture, semantic tokens, governance
- **color-user-research-guide**: A/B testing, eye-tracking, qualitative research for color

### Category D — 4 New Collections (extraCollections33, now 126 total)

- **digital-primary**: Cobalt, emerald, citrine — tech brand primary triad, Bauhaus-inspired
- **film-noir**: Cool grays and cobalt shadows — premium dark palette, cinematic depth
- **impressionist-garden**: Cerulean, jade, rose, honey — Monet palette, botanical wellness
- **brand-trust**: Deep indigo, warm grays — institutional authority, financial services

### Category D — 30+ New Search Aliases

Data viz: data_color, chart_palette, graph_palette, dataviz, sequential_scale, categorical_palette
Famous brands: google_colors, spotify_green, netflix_red, apple_gray, brand_blue
Design system colors: success_color, warning_color, error_color, info_color, neutral_system
System architecture: token_color, system_color, design_tokens
Historical: renaissance_color, medieval_color, imperial_purple, royal_blue_classic, pigment_blue
Negative space: breathing_room, empty_space, premium_neutral, luxury_neutral, restraint_palette

### Build Fixes

Fixed 2 duplicate search alias keys (chart_color → chart_palette, design_token → design_tokens)
Fixed 5 guides missing required links[] field

### Files Modified (11)
-  — new page route
-  — added /famous-palettes/ with priority 0.88
-  — new client component
-  — added /famous-palettes to currentPath type
-  — added Famous Palettes to Explore category
-  — 5 new issues (245-249)
-  — extraCollections33 (4 collections, 126 total)
-  — 30+ new search aliases
-  — new data file (35 palettes)
-  — extraGuides34 (5 guides)
-  — EN/ZH keys for famous palettes page + tools

---

## 2026-03-26 — Normal Run

**Run type:** Normal Run
**Commit:** cf7a15d
**Typecheck:** ✓ clean (fixed duplicate search alias keys + corrected guides format)

### Category A — 5 New Newsletter Issues (254 total)

Oct–Nov 2030 batch:
- **oct-2030-color-ecommerce-psychology**: Color psychology in e-commerce — what research actually shows about conversion, button color myths, product photography backgrounds
- **nov-2030-color-wayfinding-systems**: Wayfinding color design for hospitals, transit, and campuses — Harry Beck's Underground, NHS hospital systems, zone vs. route color
- **nov-2030-synesthesia-color-perception**: Synesthesia and cross-modal perception — Bouba/Kiki effect, audio-visual alignment, cross-modal brand memory
- **nov-2030-color-forecasting-methodology**: Inside Pantone and WGSN — 18-24 month lead times, self-fulfilling forecasts, cultural shifts behind colors
- **nov-2030-color-typography-pairing**: Fonts and palettes as an integrated system — high-contrast typefaces, geometric sans-serifs, hierarchy through color

### Category A — 5 New SEO Guides (extraGuides35, ~235 total)

- **color-ecommerce-conversion-guide**: Evidence-based e-commerce color decisions (contrast > hue, photography backgrounds, warm/cool strategy)
- **wayfinding-color-systems-guide**: Life-critical wayfinding design principles (uniqueness, stress-state design, zone color)
- **color-typography-pairing-guide**: Font-palette personality alignment (high-contrast needs restraint, geometric sans flexibility)
- **color-trend-forecasting-guide**: Forecasting methodology and cultural shifts (WGSN, Pantone, self-fulfilling predictions)
- **synesthesia-cross-modal-color-guide**: Cross-modal color neuroscience (universal associations, audio-visual alignment, brand memory)

### Category D — 4 New Collections (extraCollections34, 130 total)

- **forest-bathing**: Woodland greens + amber accent — shinrin-yoku wellness palette
- **y2k-digital**: Electric cobalt, iris, lime, magenta — millennium nostalgia palette
- **haute-couture**: Runway neutrals — ivory, bone, warm gray, dark merlot anchor
- **transit-authority**: High-contrast metro line colors — cerulean, amber, ember, emerald, cool gray

### Category D — 30 New Search Aliases (687 total)

E-commerce: add_to_cart, shop_palette, storefront_color, conversion_color
Wayfinding/transit: wayfinding_color, transit_color, signage_color, metro_palette
Cross-modal: sound_color, music_palette, sensory_color, audio_visual
Fashion/runway: runway_palette, couture_color, fashion_neutral, haute_couture
Forest/nature: forest_bath, shinrin_yoku, canopy_green, undergrowth
Y2K/nostalgia: y2k_palette, millennium_color, retro_digital, early_internet

### Build Fixes

- Removed duplicate SEARCH_ALIASES keys: cta_button, conversion_color, navigation_color, old_growth, woodland (already existed from prior runs)
- Corrected extraGuides35 format from wrong interface shape to correct LandingGuide structure

### Files Modified (4)
- `src/data/newsletter-issues.json` — 5 new issues (250-254)
- `src/lib/guides.ts` — extraGuides35 (5 guides, ~235 total)
- `src/lib/collections.ts` — extraCollections34 (4 collections, 130 total)
- `src/lib/color-search.ts` — 30 new unique search aliases (687 total)

---

## 2026-03-26 — Normal Run #2

**Run type:** Normal Run
**Commit:** 6c5f574
**Typecheck:** ✓ clean (fixed 5 duplicate search alias keys)

### Category A — 5 New Newsletter Issues (259 total, Dec 2030 batch)

- **dec-2030-color-memory-nostalgia**: Color-memory neuroscience — autobiographical vs. collective nostalgia, period-accurate palettes, precision over broad category
- **dec-2030-packaging-color-design**: Shelf impact via competitive audit, Pantone vs CMYK, material rendering differences, blue food problem
- **dec-2030-dark-mode-color-systems**: Perceptual inversion failures, OLED #000 vs #121212, semantic token architecture, elevation through surface-lightening
- **dec-2030-color-accessibility-beyond-wcag**: Contrast ratios as floor not ceiling, 8% male color blindness, aging lens yellowing, practical simulation testing
- **dec-2030-fluorescent-neon-design**: DayGlo UV physics, safety association baggage, luxury-neon paradox, sRGB gamut clipping

### Category A — 5 New SEO Guides (extraGuides36, ~240 total)

- **color-memory-nostalgia-guide**: Color psychology → memory science for brand designers (priority 74)
- **packaging-color-design-guide**: Print/production packaging guide — shelf positioning, Pantone spec (priority 73)
- **dark-mode-color-systems-guide**: Dual-mode token architecture, OLED optimization (priority 82)
- **color-accessibility-wcag-guide**: Comprehensive color accessibility beyond contrast (priority 85)
- **fluorescent-neon-colors-guide**: Extreme chroma design — DayGlo, gamut, luxury tension (priority 70)

### Category D — 5 New Collections (extraCollections35, 135 total)

- **dusk-garden**: Evening florals — violet, rose, orchid, plum, amber
- **raw-concrete**: Brutalist architecture grays — cool/warm gray spectrum, 6 gray tones
- **boreal-forest**: Northern forest — spruce, moss, jade, cool gray, frost
- **carnival-lights**: Vivid fair nostalgia — crimson, cobalt, citrine, amber
- **bleached-denim**: Washed denim — indigo, cobalt, azure, cool gray, amber

### Category D — 25 New Search Aliases (737 total)

Memory/nostalgia: memory_color, nostalgic_palette, retro_warmth, faded_memory, childhood_palette
Packaging: packaging_neutral, product_color, shelf_color
Accessibility: high_contrast_color, wcag_color, colorblind_safe
Neon/fluorescent: fluorescent_color, neon_sign, blacklight_color, glow_color
Architecture: concrete_gray, brutalist_color, architectural_neutral, raw_material
Nordic/boreal: boreal_palette, nordic_forest, spruce_green, birch_white

### Build Fixes
- Removed 5 duplicate SEARCH_ALIASES keys: shelf_impact, dark_mode, dark_ui, night_mode, accessible_color (already existed from prior runs)
- Fixed invalid neutral gray IDs (grays don't have chroma suffix): cool-gray-bloom-muted → cool-gray-bloom, etc.

### Files Modified (4)
- `src/data/newsletter-issues.json` — 5 new issues (255-259)
- `src/lib/guides.ts` — extraGuides36 (5 guides, ~240 total)
- `src/lib/collections.ts` — extraCollections35 (5 collections, 135 total)
- `src/lib/color-search.ts` — 25 new unique aliases (737 total)

---

## 2026-03-26 — Normal Run #3

**Run type:** Normal Run
**Commit:** d885d87
**Typecheck:** ✓ clean (fixed 2 duplicate search alias keys: celadon → celadon_glaze, monsoon → monsoon_season)

### Category A — 5 New Newsletter Issues (264 total, Jan 2031 batch)

- **jan-2031-color-grading-photography**: Split toning, HSL panel workflow, building a personal signature palette — presets vs. deliberate grades
- **jan-2031-chromatic-aberration-lens-color**: Why vintage lenses have optical personality — chromatic aberration, uncoated glass warmth, the Leica/Zeiss/Nikon rendering character
- **jan-2031-cultural-color-mourning**: White, purple, gold mourning colors across South Asia, East Asia, Catholic liturgy, West Africa — design implications for cross-cultural work
- **jan-2031-data-visualization-color-principles**: Sequential, diverging, categorical, and highlight palette taxonomy — rainbow palette failure, neutral midpoints, 8-12 color categorical limit
- **jan-2031-natural-dye-indigo-history**: Indigo trade routes, European woad protectionism (death penalty for importers), Bengali Indigo Revolt 1859, BASF synthesis 1897 → blue jeans

### Category A — 5 New SEO Guides (extraGuides37, ~245 total)

- **color-grading-photography-guide**: Split toning + HSL panel workflow for photographers (priority 72)
- **data-visualization-color-guide**: Sequential/diverging/categorical/highlight palette taxonomy (priority 84)
- **mourning-colors-world-cultures-guide**: Cross-cultural mourning color guide for global designers (priority 68)
- **indigo-history-color-trade-guide**: Indigo commodity history, colonialism, synthesis (priority 65)
- **vintage-lens-color-rendering-guide**: Optical character of vintage lenses for photographers (priority 63)

### Category D — 5 New Collections (extraCollections36, 140 total)

- **jazz-club**: Deep amber, warm shadow, ivory — late-night music venue palette
- **polar-expedition**: Ice blue, expedition orange, navy, frost — Arctic adventure palette
- **glazed-ceramic**: Warm ivory, celadon (seafoam), dusty rose, warm gray — studio pottery palette
- **cinema-verité**: Desaturated teal, warm skin (apricot), cool gray — documentary film color
- **monsoon-season**: Deep jade, warm gray, amber, lime — tropical rainfall palette

### Category D — 28 New Search Aliases + SEARCH_CHIPS (760 total)

Jazz/music: jazz_palette, jazz_club, late_night, brass_color, velvet_curtain
Arctic/expedition: polar_palette, expedition_color, arctic_explorer, high_latitude, survival_orange
Ceramics/craft: celadon_glaze, glazed_ceramic, studio_pottery, stoneware, kiln_color
Documentary/film: documentary, verité, handheld_film, available_light
Monsoon/tropical: monsoon_season, tropical_rain, rainforest_floor, humid
New SEARCH_CHIPS groups: Film & Art, Craft, Industry

### Category F — Expanded Palette Builder Word Pools

- **MOOD_WORDS**: 8 → 12 words per zone — added Glacé, Vapour, Fjord, Nocturne, Parchment, Vellum, Ecru, Flint, Basalt, Cinder, Treacle, Ochre, Saffron, etc.
- **SCENE_WORDS**: 8 → 12 words per harmony type — added Canopy, Gradient, Counterpoint, Interval, Triptych, Collection, Passage, etc.

### Files Modified (5)
- `src/data/newsletter-issues.json` — 5 new issues (260-264)
- `src/lib/guides.ts` — extraGuides37 (5 guides, ~245 total)
- `src/lib/collections.ts` — extraCollections36 (5 collections, 140 total)
- `src/lib/color-search.ts` — 28 new aliases + 3 new SEARCH_CHIPS groups (760 total)
- `src/lib/palette-builder.ts` — expanded MOOD_WORDS (8→12) and SCENE_WORDS (8→12)

---

## 2026-03-26 — Big Run #2

**Run type:** Big Run (4th normal since last big run → triggered big run threshold)
**Commit:** 4e655c0
**Typecheck:** ✓ clean (fixed 8 duplicate SEARCH_ALIASES keys from new decade additions)

### New Page: /decades/ — Color Palettes by Decade

A major new reference page covering the signature color palettes of each decade from the 1920s to the 2020s:

- **11 decades** with 6 signature colors each: 1920s Art Deco, 1930s Depression-era, 1940s WWII, 1950s Atomic Age, 1960s Pop Art, 1970s Earth Tones, 1980s Neon, 1990s Grunge, 2000s Y2K, 2010s Flat Design, 2020s Biophilic
- Full cultural context, design movement analysis, historical influence per decade
- Expandable "show context" cards with historical + modern influence notes
- One-click "Open palette →" loads hex codes into palette viewer
- Movement filter bar (11 design movements)
- ZH/EN translations throughout
- Structured data (CollectionPage schema), canonical, OG/Twitter metadata

**Files created (3):**
- `src/lib/color-decades.ts` — 11 decade data structures + movement labels EN/ZH
- `src/components/color-decades-page.tsx` — full UI with filter, cards, expand
- `app/decades/page.tsx` — server component with metadata

### Category A — 5 New Newsletter Issues (269 total, Feb-Mar 2031 batch)

- **feb-2031-1970s-earth-tone-revival**: Why earth tones cycle back every ~45 years — generational distance, nostalgia mechanics, the difference between harvest gold and 2023 terracotta
- **feb-2031-1950s-pastel-atomic-age**: Mid-century pastels as dual-purpose optimism + civil defense color management — the uncanny layer under the cheerfulness
- **feb-2031-1980s-neon-vs-pastels**: Memphis vs Miami Vice — two incompatible 1980s palettes that both read as "the 1980s" because they share structural confidence
- **mar-2031-art-deco-color-revival**: Why Art Deco's palette is permanently available for luxury design — three historical source palettes that carry cross-cultural luxury coding
- **mar-2031-y2k-color-revival-2020s**: Y2K revival as grief and emotional antithesis — reaching for hyperoptimistic aesthetics during pandemic uncertainty

### Category A — 5 New SEO Guides (extraGuides38, ~250 total)

- **1970s-earth-tone-color-guide**: Harvest gold/avocado/burnt orange palette guide (priority 79)
- **1950s-pastel-color-palette-guide**: Mid-century mint/coral/butter yellow guide (priority 76)
- **1980s-neon-color-palette-guide**: Memphis vs Miami Vice, synthwave guide (priority 82)
- **art-deco-color-palette-guide**: Gold/black jewel tone luxury design guide (priority 77)
- **millennial-pink-color-guide**: Millennial pink cultural history + precision guide (priority 84)

### Category D — 5 New Collections (extraCollections37, 145 total)

- **art-deco-gold**: Jazz Age gold, jet black, ivory cream, deep jewel tones
- **atomic-pastels**: 1950s mint, coral, butter yellow, powder blue system
- **harvest-earth**: 1970s harvest gold, avocado green, burnt orange, brown
- **y2k-chrome**: Baby pink, ice blue, chrome silver, digital lime
- **biophilic-calm**: Very Peri blue-violet, sage green, terracotta, warm sand

### Category D — 20 New Search Aliases (color-search.ts)

Decade indexes: "1920s", "1950s", "1960s", "1970s", "1980s", "1990s", "2000s", "2020s"
Era terms: jazz_age, atomic_age, earth_tone, harvest_gold, avocado_green, burnt_orange
Style terms: neon_palette, miami_vice, grunge, millennial_pink, very_peri, sage_green

### Supporting Updates
- `app/sitemap.ts` — /decades/ added at priority 0.87
- `src/components/site-header.tsx` — /decades added to currentPath type union
- `src/components/tools-page.tsx` — decades entry in Explore category
- `src/lib/i18n.ts` — 5 new keys (tools.decades.name/desc, colorDecades.*)

### Files Modified (11 total)
- NEW: `src/lib/color-decades.ts`
- NEW: `src/components/color-decades-page.tsx`
- NEW: `app/decades/page.tsx`
- `app/sitemap.ts`
- `src/components/site-header.tsx`
- `src/components/tools-page.tsx`
- `src/lib/i18n.ts`
- `src/data/newsletter-issues.json` — 5 new issues (265-269)
- `src/lib/guides.ts` — extraGuides38 (5 guides, ~250 total)
- `src/lib/collections.ts` — extraCollections37 (5 collections, 145 total)
- `src/lib/color-search.ts` — 20 new decade aliases

---

## 2026-03-26 — Normal Run #1 (post big-run)

**Run Type:** Normal
**Commit:** 9ef92bc
**Timestamp:** 2026-03-26T02:43:29Z

### Categories Covered
- **A — SEO & Content**: 5 newsletter issues + 5 SEO guides
- **D — Data & Collections**: 5 new collections + 18 search aliases

### Category A — 5 New Newsletter Issues (274 total, Apr–May 2031)

- **apr-2031-blue-corporate-trust**: Why every bank logo is blue — psychological research + convention amplification effect + when to break the convention
- **apr-2031-pantone-color-of-year-business**: How Pantone's CoY works as a business model + coordination mechanism for the design industry
- **apr-2031-color-ux-design-psychology**: Color in UX as cognitive tool (hierarchy, state communication, accessibility) not decoration
- **may-2031-warm-vs-cool-gray-typography**: Warm vs cool gray as foundational palette decision — compatibility implications for accent selection
- **may-2031-food-packaging-color-appetite**: Food packaging color logic — appetite colors, fast food vs fine dining, green and health positioning

### Category A — 5 New SEO Guides (extraGuides39, ~255 total)

- **blue-color-psychology-branding-guide**: Trust science, convention amplification, shade selection, when to break (priority 86)
- **dark-mode-color-palette-guide**: Surface layering, why not true black, semantic tokens (priority 88)
- **restaurant-interior-color-guide**: Appetite colors, fast food vs fine dining, green in fast casual (priority 79)
- **wcag-color-accessibility-guide**: Contrast ratio limitations, CVD design, building accessible systems (priority 91)
- **typography-gray-color-guide**: Warm vs cool gray identification, compatible accent selection (priority 77)

### Category D — 5 New Collections (extraCollections38, 150 total)

- **restaurant-warmth**: Ember/garnet/amber/coral/merlot — appetite and dining energy
- **dark-mode-foundation**: Cobalt ink layer system — structured dark interface palette
- **institutional-trust**: Cobalt ink/dusk/core + cool-gray — financial/healthcare/government branding
- **appetite-vivid**: Crimson/ember/amber/coral/citrine vivid — fast food and snack energy
- **editorial-monochrome**: Cool-gray ink/shadow/mid/tone/whisper — typography-first design

### Category D — 18 New Search Aliases

Food/dining: restaurant, dining, appetite, bistro
UI/UX: ux, interface, ui_design, mobile_app
Monochrome: grayscale, greyscale, mono, black_and_white
Business: business_card, hospitality, interior_design, branding

### Files Modified (4 total)
- `src/data/newsletter-issues.json` — 5 new issues (270–274, 274 total)
- `src/lib/guides.ts` — extraGuides39 (5 guides, ~255 total)
- `src/lib/collections.ts` — extraCollections38 (5 collections, 150 total)
- `src/lib/color-search.ts` — 18 new aliases

---

## 2026-03-26 — Normal Run #2 (post big-run)

**Run Type:** Normal
**Commit:** 9609576
**Timestamp:** 2026-03-26T03:10:00Z

### Categories Covered
- **A — SEO & Content**: 5 newsletter issues + 5 SEO guides
- **D — Data & Collections**: 5 new collections + 10 search aliases

### Category A — 5 New Newsletter Issues (279 total, May–Jul 2031)

- **may-2031-fashion-color-runway-to-retail**: Fashion color forecasting pipeline — how the 18-24 month production lead time shapes what colors appear in stores, and the industry coordination role of Pantone and WGSN
- **jun-2031-seasonal-color-analysis-personal**: Seasonal color analysis (Spring/Summer/Autumn/Winter) — the undertone science behind it, what the system gets right, and its practical limitations
- **jun-2031-color-naming-language-perception**: How language shapes color perception — Russian goluboy/siniy distinction, Berlin/Kay universals, why named colors are processed and recalled differently
- **jun-2031-wayfinding-color-systems-airports**: Wayfinding color design constraints — discriminability, value difference, emotional neutrality principle, healthcare anxiety reduction
- **jul-2031-color-memory-brand-recognition**: How color ownership develops — consistency + ubiquity + time formula, pre-attentive recognition value, protecting color equity

### Category A — 5 New SEO Guides (extraGuides40, ~260 total)

- **fashion-color-palette-guide**: Wardrobe color systems, undertone matching, three-tone method (priority 78)
- **seasonal-color-analysis-guide**: Spring/Summer/Autumn/Winter personal color system with diagnostic guidance (priority 74)
- **brand-color-refresh-guide**: Strategic framework for brand color updates — shade vs. hue change, equity cost, safe alternatives (priority 83)
- **wayfinding-color-systems-guide**: Environmental color design principles, hue+value discriminability, healthcare wayfinding (priority 75)
- **color-memory-brand-recognition-guide**: Pre-attentive recognition science, color equity accumulation, consistency rules (priority 81)

### Category D — 5 New Collections (extraCollections39, 155 total)

- **runway-neutrals**: Warm amber-range neutrals (whisper through velvet) — fashion editorial anchor palette
- **spring-editorial**: Blush/apricot/leaf/citrine/coral — warm editorial spring pastels
- **scandi-winter**: Cobalt whisper/azure/cerulean/cool-gray/amber — Nordic winter system
- **capsule-cool**: Cobalt ink/shadow/cool-gray/cobalt whisper/teal — cool-toned capsule wardrobe
- **nostalgia-amber**: Amber silk/velvet/blush pearl/apricot/warm-gray — analog memory vintage palette

### Category D — 10 New Search Aliases

Fashion: wardrobe, capsule, lookbook
Nordic: scandinavian, minimalist
Nostalgia: nostalgia, nostalgic, memory, analog
(Note: duplicates with existing keys removed — fashion, runway, editorial, nordic, scandi, hygge, retro, wayfinding, signage, environmental were already present)

### Files Modified (4 total)
- `src/data/newsletter-issues.json` — 5 new issues (275–279, 279 total)
- `src/lib/guides.ts` — extraGuides40 (5 guides, ~260 total)
- `src/lib/collections.ts` — extraCollections39 (5 collections, 155 total)
- `src/lib/color-search.ts` — 10 new aliases (deduped from 20 attempted)

---

## 2026-03-26 — Normal Run #3 (post big-run)

**Run Type:** Normal
**Commit:** 8dd07af
**Timestamp:** 2026-03-26T03:40:00Z

### Categories Covered
- **A — SEO & Content**: 5 newsletter issues + 5 SEO guides
- **D — Data & Collections**: 5 new collections + 16 search aliases

### Category A — 5 New Newsletter Issues (284 total, Jul–Aug 2031)

- **jul-2031-color-space-perception-interior**: Color as spatial tool in interiors — warm/cool advance/recede, ceiling height, corridors, open-plan zone definition
- **jul-2031-neon-color-cycles-cultural**: 15-year neon design cycles — reaction formation mechanism, technology enabling role, brand adoption lag
- **aug-2031-color-signage-legibility-system**: Signage color science — value contrast primacy, CVD considerations, retroreflective materials, typography contrast standards
- **aug-2031-color-fatigue-desaturation-trend**: Post-maximalist design contraction — perceptual adaptation, cultural embarrassment, brand survival strategies
- **aug-2031-color-in-data-visualization-encoding**: Data visualization color encoding — sequential vs categorical, rainbow palette failure modes, CVD impact

### Category A — 5 New SEO Guides (extraGuides41, ~265 total)

- **print-color-management-guide**: CMYK vs RGB gamut, ICC profiles, coated vs uncoated paper, soft proofing workflow (priority 82)
- **hospitality-interior-color-guide**: Hotel lobby positioning, restaurant dwell time, guestroom restraint, lighting interaction (priority 76)
- **color-temperature-lighting-design-guide**: CCT Kelvin scale, surface color impact under warm/cool light, photography white balance (priority 79)
- **typographic-color-hierarchy-guide**: Value hierarchy, accent wayfinding, dark mode typography, WCAG contrast standards (priority 77)
- **luxury-packaging-color-guide**: Category color conventions, finish types as luxury signals, saturation rule, unboxing sequence design (priority 80)

### Category D — 5 New Collections (extraCollections40, 160 total)

- **hotel-lobby-warmth**: Amber/honey/ivory/coral — approachable hospitality welcome palette
- **heritage-navy-anchor**: Deep cobalt/navy/cool-gray/ivory — institutional legacy brand anchor
- **spa-stone-calm**: Warm-gray/sage/mint/ivory — wellness and rest environment palette
- **dark-editorial-night**: Ink navy/violet/plum/ivory — fashion editorial dark aesthetic
- **alpine-clarity**: Cerulean/frost/cool-gray/amber — high-altitude outdoor clarity

### Category D — 16 New Search Aliases

Print/press: press_ready, spot_printing, substrate_neutral
Hospitality: hotel_lobby, hotel_room, restaurant_interior, fine_dining, bar_color
Data visualization: sequential_palette, diverging_palette, chart_background
Lighting/environment: warm_interior, cool_interior, daylight_color, candlelight

### Files Modified (4 total)
- `src/data/newsletter-issues.json` — 5 new issues (280–284, 284 total)
- `src/lib/guides.ts` — extraGuides41 (5 guides, ~265 total)
- `src/lib/collections.ts` — extraCollections40 (5 collections, 160 total)
- `src/lib/color-search.ts` — 16 new aliases (1 duplicate deduped)

---

## 2026-03-26 — Normal Run #4 (post big-run)

**Run Type:** Normal
**Commit:** b8cb60f
**Timestamp:** 2026-03-26T04:10:00Z

### Categories Covered
- **A — SEO & Content**: 5 newsletter issues + 5 SEO guides
- **D — Data & Collections**: 5 new collections + 15 search aliases

### Category A — 5 New Newsletter Issues (289 total, Sep–Oct 2031)

- **sep-2031-color-in-motion-design**: Color in motion design — temporal behavior, hue constancy, saturation management for animation contexts
- **sep-2031-cultural-color-mourning-celebration**: Why mourning is white in some cultures and black in others — symbolic logic behind color associations
- **sep-2031-color-in-retail-shelf-design**: Retail shelf color science — warm-color lighting advantage, blocking strategy, e-commerce thumbnail performance
- **oct-2031-color-and-memory-nostalgia**: How technology creates nostalgia palettes — Kodachrome, CRT screens, Polaroid color characteristics
- **oct-2031-color-psychology-children-spaces**: Evidence-based color for children's spaces — natural associative palettes, contrast effects, pediatric healthcare research

### Category A — 5 New SEO Guides (extraGuides42, 270 total)

- **color-in-motion-design-guide**: Animation color saturation, temporal meaning, hue constancy for brand motion (priority 78)
- **retail-packaging-color-guide**: Shelf competition, color blocking strategy, warm-color lighting advantage (priority 81)
- **color-symbolism-across-cultures-guide**: White as mourning, red as celebration, culturally divergent color meanings (priority 79)
- **nostalgia-color-palettes-design-guide**: Era-specific technology color artifacts, selective nostalgia reference (priority 74)
- **color-in-healthcare-environments-guide**: Evidence-based natural palette research, wayfinding, staff vs patient space (priority 77)

### Category D — 5 New Collections (extraCollections41, 164 total)

- **motion-brand-vivid**: Cobalt/cyan/amber on charcoal — brand animation palette
- **natural-earth-packaging**: Sage/terracotta/ivory/warm-gray — natural product packaging
- **pediatric-calm-bright**: Sky/sage/coral/ivory — children's healthcare environments
- **kodachrome-memory**: Amber-shifted reds/warm greens/golden midtones — film nostalgia palette
- **global-celebration-red**: Crimson/vermilion/gold — cultural celebration, Chinese New Year register

### Category D — 15 New Search Aliases

Motion: motion_brand, brand_animation, ui_microinteraction
Retail: retail_shelf, natural_packaging, artisan_product
Healthcare/children: pediatric_color, healthcare_interior, children_space
Cultural/festive: celebration_color, chinese_red, festive_palette, global_red, nostalgia_film

### Files Modified (4 total)
- `src/data/newsletter-issues.json` — 5 new issues (285–289, 289 total)
- `src/lib/guides.ts` — extraGuides42 (5 guides, 270 total)
- `src/lib/collections.ts` — extraCollections41 (5 collections, 164 total)
- `src/lib/color-search.ts` — 15 new aliases (2 deduped/renamed)

---

## 2026-03-26 — Big Run #3 (5th since last big run)

**Run Type:** Big Run (5th normal since last big run → triggered big run threshold)
**Commit:** 6ee75d8
**Timestamp:** 2026-03-26T (big run)

### New Feature: /seasonal/ — Color by Season Page

A comprehensive seasonal color reference page covering all four seasons with curated palettes.

**src/lib/color-seasons.ts** (new):
- 4 seasons: Spring, Summer, Autumn, Winter
- Each season: 6 signature colors with hex codes, role labels
- Full EN/ZH metadata: name, tagline, description, cultural context, design tips
- Nature sources and industry uses (both languages)
- Gradient colors for header display

**src/components/color-seasons-page.tsx** (new):
- Seasonal card grid with swatch strips (hover expand animation)
- Copy hex code buttons per individual color
- "More detail" expand/collapse toggle for cultural context, design tips, nature sources, industry uses
- "Open in Palette Builder" quick action link
- Bottom CTA section with links to collections, decades, stories
- SEO content section with 4 educational subsections
- Full EN/ZH i18n throughout

**app/seasonal/page.tsx** (new):
- Next.js App Router route with full metadata
- Structured data (CollectionPage + BreadcrumbList)
- Canonical URL: /seasonal/

**src/components/site-header.tsx** (modified):
- Added "/seasonal" to SiteHeaderProps currentPath type union

**app/sitemap.ts** (modified):
- Added /seasonal/ entry (priority 0.87, monthly changeFrequency)

### Category A — 5 New Newsletter Issues (290–294, 294 total)

- **oct-2031-seasonal-color-design-strategy**: How brands should build seasonal color systems with structural + accent palettes
- **nov-2031-dark-mode-color-design-principles**: Why palette inversion fails — halation, saturation shifts, elevation systems
- **nov-2031-color-in-wayfinding-signage**: Hospital, transit, and digital navigation color coding principles
- **nov-2031-metallic-color-design-use**: Digital gold gradient construction, metallic accent vs fill rule
- **dec-2031-color-white-space-breathing-room**: How warm vs cool backgrounds affect simultaneous contrast

### Category A — 5 New SEO Guides (extraGuides43, 275 total)

- **seasonal-color-palettes-design-guide**: 4-season design reference, chromatic adaptation theory, seasonal brand systems (priority 84)
- **dark-mode-color-design-guide**: Palette inversion failure, halation, elevation systems, brand color adaptation (priority 86)
- **color-wayfinding-signage-guide**: Categorical distinctness, colorblind accessibility, hospital conventions (priority 78)
- **metallic-color-design-guide**: Digital gold gradient, silver vs gray distinction, print metallic restraint (priority 77)
- **color-background-negative-space-guide**: Simultaneous contrast, warm/cool background effects, why pure white isn't optimal (priority 80)

### Category D — 5 New Collections (extraCollections42, 169 total)

- **spring-blossom-fresh**: Blush bloom soft, mint bloom soft, azure bloom soft, orchid pearl soft — spring pastels
- **summer-coastal-vivid**: Coral bloom vivid, teal tone vivid, amber bloom vivid, sapphire shadow clear — coastal summer
- **autumn-harvest-deep**: Garnet core vivid, ember core vivid, amber silk vivid, jade dusk clear — earth-tone harvest
- **winter-jewel-nocturnal**: Indigo shadow vivid, crimson core vivid, jade dusk clear, amber silk vivid — holiday jewels
- **winter-ice-minimal**: Azure bloom soft, cerulean bloom soft, cobalt mist soft, sapphire pearl soft — Nordic minimal

### Category D — 14 New Search Aliases

Seasonal design: spring_blossom, spring_pastel, spring_campaign, summer_coastal,
summer_tropical, summer_festival, autumn_harvest, autumn_earth, autumn_premium,
winter_holiday, winter_festive, winter_ice, winter_minimal, seasonal_palette

### Files Modified (9 total)
- `app/seasonal/page.tsx` — new seasonal page route
- `src/lib/color-seasons.ts` — seasonal data
- `src/components/color-seasons-page.tsx` — seasonal page UI
- `src/components/site-header.tsx` — added /seasonal type
- `src/data/newsletter-issues.json` — 5 new issues (290–294)
- `src/lib/guides.ts` — extraGuides43 (5 guides, 275 total)
- `src/lib/collections.ts` — extraCollections42 (5 collections, 169 total)
- `src/lib/color-search.ts` — 14 new seasonal aliases
- `app/sitemap.ts` — /seasonal/ entry

---

## Run #5 — 2026-03-26T05:33Z — Normal Run

**Type:** Normal (recovered stale content + new additions)  
**Commit:** 834dec3  
**Categories:** Content, Search, Collections  
**Note:** Stale lock from crashed previous run — recovered 6 newsletter issues + extraGuides44 + extraCollections43 that were pending, then added new content on top.

### Newsletter Issues (300–305)
- `mar-2032-color-in-motion-design` — Color in Motion: How Animation Changes Color Perception
- `mar-2032-color-spatial-design` — Color in Physical Space: Architecture vs Screens
- `mar-2032-accessible-color-beyond-wcag` — Accessible Color Beyond WCAG: What the Standard Misses
- `apr-2032-color-contrast-dark-mode` — Dark Mode Color Design: Why Inverting Light Mode Fails
- `apr-2032-color-data-visualization` — Color in Data Visualization: Encoding Without Confusion
- `apr-2032-color-cultural-variation` — Color Meaning Across Cultures: Global Design Guide

### Guides Added (extraGuides44 + extraGuides45 — 10 total)
- `logo-color-design-guide` (recovered)
- `color-temperature-photography-guide` (recovered)
- `color-in-motion-design-guide` (new)
- `architectural-color-guide` (new)
- `accessible-color-beyond-wcag-guide` (new)
- `dark-mode-color-design-guide` (new)
- `data-visualization-color-guide` (new)

### Collections Added (extraCollections43 + extraCollections44 — 10 total)
- `logo-brand-primary-bold` (recovered)
- `warm-photo-grade` (recovered)
- `social-content-vivid-feed` (recovered)
- `dark-mode-ui-surfaces` (new)
- `aurora-borealis-vivid` (new)
- `warm-architectural-interior` (new)
- `data-viz-sequential-teal` (new)
- `cultural-celebration-east-asia` (new)

### Search Aliases (+36 new)
Architecture, dark mode UI, cultural, UI states (success/error/warning/info), natural phenomena, materials, gemstones, photography imaging.

### Files Changed
- `src/data/newsletter-issues.json` — 6 new issues (305 total)
- `src/lib/guides.ts` — extraGuides44 + extraGuides45 
- `src/lib/collections.ts` — extraCollections43 + extraCollections44
- `src/lib/color-search.ts` — 36 new unique aliases added
- `.claude/session-lock.json` — released

## 2026-03-26 — Big Run #4 (6th since last big run — triggered)

**Type:** Big Run  
**Commit:** 77d880d  
**Timestamp:** 2026-03-26T (post run #5)  
**Categories:** New Feature Page, Content (A), Collections (D)

### New Feature: /industry — Color Palettes by Industry

Built a full reference page at `/industry/` covering 9 major design industries, styled after `/seasonal` and `/decades`.

**Industries covered (9 — 54 signature colors total):**
1. **Technology** — Midnight navy, system blue, intelligence violet (Trust)
2. **Food & Restaurant** — Appetite red, harvest orange, warm amber (Appetite)
3. **Healthcare & Medical** — Clinical teal, wellness sage, sterile white (Calm)
4. **Fashion & Luxury** — Absolute black, warm ivory, heritage plum (Prestige)
5. **Nature & Outdoor** — Deep forest, trail sienna, clay orange (Vitality)
6. **Finance & Banking** — Institutional navy, wealth forest, capital gold (Authority)
7. **Education & Learning** — Knowledge blue, discovery yellow, growth green (Clarity)
8. **Beauty & Cosmetics** — Velvet rose, blush petal, rose gold (Sensuality)
9. **Architecture & Interior** — Terracotta clay, aged concrete, garden sage (Warmth)

**New files:**
- `src/lib/color-industries.ts` — Industry data with full EN/ZH copy, design tips, key brands, colors-to-avoid
- `src/components/color-industries-page.tsx` — Client component with expandable cards + palette builder integration
- `app/industry/page.tsx` — App Router route with CollectionPage + BreadcrumbList structured data

**Also fixed human-todo item:** Added /seasonal and /decades to nav alongside /industry — all three editorial reference pages now discoverable from Explore nav.

### Category A — 4 Newsletter Issues (306–309)
- `may-2032-industry-color-psychology` — Why Every Industry Has Its Own Color Language
- `may-2032-tech-color-design` — The Blue Problem: How Technology's Color Grammar Is Evolving
- `jun-2032-luxury-color-restraint` — Color Restraint as Luxury Signal
- `jun-2032-food-color-appetite` — The Appetite Code: How Color Makes Food Look Better

### Category A — 3 SEO Guides (extraGuides46, 288 total)
- `industry-color-palettes-brand-guide` (priority 92)
- `technology-brand-color-design-guide` (priority 88)
- `fashion-luxury-brand-color-guide` (priority 85)

### Category D — 8 Collections (extraCollections45, 177 total)
- `tech-brand-navy-blue`, `ai-intelligence-violet`, `healthcare-clinical-teal`
- `luxury-restrained-neutral`, `outdoor-earth-forest`, `finance-authority-navy`
- `beauty-rose-plum`, `architecture-terracotta-sage`

### Files Modified (10 total)
- `src/lib/color-industries.ts` — NEW
- `src/components/color-industries-page.tsx` — NEW
- `app/industry/page.tsx` — NEW
- `src/components/site-header.tsx` — /industry type + 3 nav items (industry, seasonal, decades)
- `src/lib/i18n.ts` — 3 new nav keys with EN/ZH
- `app/sitemap.ts` — /industry/ entry
- `src/data/newsletter-issues.json` — 4 new issues (309 total)
- `src/lib/guides.ts` — extraGuides46 (3 guides, 288 total)
- `src/lib/collections.ts` — extraCollections45 (8 collections, 177 total)
- `.claude/session-lock.json` — released

## 2026-03-26 — Normal Run #1 (post big run #4)

**Type:** Normal Run  
**Commit:** 77fd7fa  
**Timestamp:** 2026-03-26T (after big run #4)  
**Categories:** Content (A), Collections (D), Aliases (D)

### Category A — 4 Newsletter Issues (310–313)
- `jul-2032-color-wayfinding` — The Hidden Language of Wayfinding Color
- `jul-2032-gray-return` — The Return of Gray: Chromatic Neutrals in Contemporary Design
- `aug-2032-shelf-impact` — The Shelf Impact System: Packaging Color Psychology
- `aug-2032-color-accessibility` — Designing for Color Blindness: Beyond Contrast Ratios

### Category A — 3 SEO Guides (extraGuides47, 289 total)
- `color-accessibility-guide` (priority 90)
- `wayfinding-color-design-guide` (priority 82)
- `packaging-shelf-impact-color-guide` (priority 87)

### Category D — 6 Collections (extraCollections46, 193 total)
- `midnight-cobalt-violet`, `spring-mint-blush`, `desert-amber-rust`
- `jewel-tones-deep`, `nordic-minimal-frost`, `citrus-vivid-burst`

### Category D — 50+ Search Aliases
New alias groups: craft beer, winery, automotive/EV, esports, streetwear, gender-neutral, festive/cultural occasions (diwali, hanukkah, st_patricks, easter, carnival, mardi_gras), timepieces, biophilic/eco, poster/print design, holiday campaigns (black_friday, mothers_day, etc.)

### Files Modified (4 total)
- `src/data/newsletter-issues.json` — 313 total
- `src/lib/collections.ts` — extraCollections46 (193 total)
- `src/lib/guides.ts` — extraGuides47 (289 total)
- `src/lib/color-search.ts` — ~1336 lines total

## 2026-03-26 — Normal Run #2 (post big run #4)

**Type:** Normal Run  
**Commit:** 46fff43  
**Timestamp:** 2026-03-26T (after big run #4, normal run #1)  
**Categories:** Content (A), Collections (D), Aliases (D)

### Category A — 4 Newsletter Issues (314–317)
- `sep-2032-interior-color-psychology` — The Interior Effect: How Room Color Changes What You Feel and Do
- `sep-2032-color-trend-forecasting` — How Color Trend Forecasting Actually Works
- `oct-2032-color-in-film` — Color Grading as Language: How Film and TV Use Color to Tell Stories
- `oct-2032-data-visualization-color` — Color in Data Visualization: The Rules That Make Charts Readable and Honest

### Category A — 3 SEO Guides (extraGuides48, 292 total)
- `interior-design-color-guide` (priority 89) — Room palette selection across light conditions
- `color-temperature-design-guide` (priority 86) — Warm vs cool colors complete design guide
- `wedding-color-palette-guide` (priority 83) — Wedding colors that photograph well

### Category D — 6 Collections (extraCollections47, 199 total)
- `coastal-morning-mist`, `autumn-harvest-warmth`, `pure-monochrome-system`
- `botanical-foliage-study`, `urban-bold-contrast`, `nordic-wool-warmth`

### Category D — ~50 Search Aliases
New alias groups: real estate/home staging, wedding/events, children's brand, medical/pharma, government/civic, education/academia, fine dining/restaurant, travel/hospitality, yoga/wellness studio

### Files Modified (4 total)
- `src/data/newsletter-issues.json` — 317 total
- `src/lib/collections.ts` — extraCollections47 (199 total)
- `src/lib/guides.ts` — extraGuides48 (292 total)
- `src/lib/color-search.ts` — ~1399 lines total
- `.claude/session-lock.json` — released

## 2026-03-26 — Normal Run #3 (post big run #4)

**Type:** Normal Run  
**Commit:** 4946bfa  
**Timestamp:** 2026-03-26T (after big run #4, normal runs #1 and #2)  
**Categories:** Content (A), Collections (D), Aliases (D)

### Category A — 4 Newsletter Issues (318–321)
- `nov-2032-color-contrast` — Color Contrast in Design: Legibility, Accessibility, and Hierarchy
- `nov-2032-brand-color-evolution` — When Brands Change Their Colors: The Psychology of Visual Identity Pivots
- `dec-2032-craft-materials-color` — Color in Craft: How Materials Determine What Color Can Do
- `dec-2032-color-memory` — Color Memory: Why We Remember Some Colors and Forget Others

### Category A — 3 SEO Guides (extraGuides49, 295 total)
- `brand-identity-color-guide` (priority 91) — Choosing brand primary color: strategy, competitive mapping, functional testing
- `typography-color-pairing-guide` (priority 84) — Typography + color pairing: contrast, temperature, weight tradeoffs
- `dark-mode-color-palette-guide` (priority 88) — Dark mode adaptive color: surfaces, elevation, brand color adaptation, tokens

### Category D — 8 Collections (extraCollections48, 207 total)
- `editorial-black-white-red` — Classic editorial triad: near-black, crisp white, bold crimson
- `mediterranean-tile-blues` — Hand-painted azulejos blues: cobalt, cerulean, azure, teal
- `forest-dusk-palette` — Twilight forest: moss nocturne, deep indigo, amber last-light
- `candy-pop-pastel` — High-energy candy pastels: bubblegum pink, lemon, sky blue, mint, lavender
- `retro-americana-palette` — 1950s diner: cherry red, teal, mustard, cream, chrome
- `minimalist-gray-study` — Refined gray value study from near-white to near-black + blue-gray accent
- `sunbaked-clay-terracotta` — Adobe earth: fired clay orange, dusty adobe red, warm sand, bone
- `deep-ocean-trench` — Abyssal ocean: deep navy, midnight indigo, bioluminescent aqua, seafoam

### Category D — 46 Search Aliases (1451 lines)
New alias groups: UI/light-mode, editorial (magazine, newspaper, poster), materials (ceramic, pottery, terracotta, adobe, clay, wood, linen, wool), psychology (nostalgia, retro aesthetic, y2k, candy, pastel pop), science/nature (bioluminescent, deep sea, ocean trench, forest dusk, twilight, dawn), brand psychology (trustworthy, innovative, premium, approachable, authoritative, playful, sustainable, artisan brand)

### Files Modified (4 total)
- `src/data/newsletter-issues.json` — 321 total
- `src/lib/guides.ts` — extraGuides49 (295 total)
- `src/lib/collections.ts` — extraCollections48 (207 total)
- `src/lib/color-search.ts` — 1451 lines total
- `.claude/session-lock.json` — released

## 2026-03-26 — Normal Run #4 (post big run #4)

**Type:** Normal Run  
**Commit:** ed7de48  
**Timestamp:** 2026-03-26T (after big run #4, normal runs #1, #2, and #3)  
**Categories:** Content (A), Collections (D), Aliases (D)

### Category A — 4 Newsletter Issues (322–325)
- `jan-2033-color-in-architecture` — Color in Architecture: How Buildings Are Colored and Why It Matters
- `jan-2033-color-and-emotion-physiology` — The Physiology of Color and Emotion: What the Research Actually Shows
- `feb-2033-color-in-packaging` — Color in Packaging: The Science of Shelf Impact and Purchase Decisions
- `feb-2033-color-and-digital-accessibility` — Color Accessibility Beyond WCAG: Building Truly Inclusive Color Systems

### Category A — 3 SEO Guides (extraGuides50, 298 total)
- `color-palette-for-logo-design` (priority 93) — Strategic logo color selection: one-color viability, category tradeoffs, PMS spec, real-condition testing
- `color-theory-for-interior-design` (priority 87) — Room light direction, 60-30-10 rule, simultaneous contrast, ceiling color as design tool
- `color-palette-generator-guide` (priority 85) — How HSL-rotation generators work, why outputs need refinement, building a system from generated starting point

### Category D — 8 Collections (extraCollections49, 215 total)
- `golden-hour-warmth` — Amber radiant, apricot silk, rose bloom, honey tone, coral pearl — sunset warm palette
- `japandi-neutral-study` — Warm gray tone, true gray pearl, olive veil, moss mist — Japandi neutrals
- `electric-neon-accent` — Lime pure, fuchsia vivid, aqua vivid, violet vivid, citrine pure — high-voltage neon
- `french-countryside-palette` — Iris pearl muted, true gray bloom, honey bloom, moss whisper, rose mist — Provence
- `midnight-jewel-tones` — Sapphire nocturne, emerald shadow, violet dusk, garnet shadow, cool gray nocturne
- `sage-and-terracotta` — Moss silk, coral tone muted, olive bloom, amber silk muted, warm gray bloom
- `holographic-iridescent` — Iris bloom, aqua bloom, rose bloom, violet mist, true gray whisper — opalescent
- `desert-sunrise-palette` — Rose radiant, amber bloom, coral silk, azure pearl, honey whisper — desert dawn

### Category D — ~50 Search Aliases (1497 lines)
New alias groups: architecture (architectural_color, urban_palette, mediterranean_architecture, scandinavian_design, industrial_aesthetic, facade_color, concrete_palette, brutalist_palette), packaging design (packaging_design_color, premium_packaging, organic_pack, luxury_packaging, sustainable_packaging, food_packaging, beauty_packaging, kids_packaging), accessibility/UI (accessible_palette, high_contrast_palette, wcag_compliant, dark_mode_palette, light_mode_palette, ui_system, design_system_colors), logo/identity (logo_color, brand_identity, wordmark_color, monogram_palette), interior by room (living_room_colors, bedroom_palette, kitchen_colors, bathroom_palette, home_office_colors, nursery_palette), light effects (golden_hour_palette, magic_hour, sunrise_palette), holographic/iridescent (holographic_palette, iridescent_palette, opalescent, metallic_palette, chrome_colors)

### Files Modified (4 total)
- `src/data/newsletter-issues.json` — 325 total
- `src/lib/guides.ts` — extraGuides50 (298 total)
- `src/lib/collections.ts` — extraCollections49 (215 total)
- `src/lib/color-search.ts` — 1497 lines total
- `.claude/session-lock.json` — released

## 2026-03-26 — Big Run #5 (post big run #4)

**Type:** Big Run (5th normal since last big run)
**Commit:** 5f07988
**Timestamp:** 2026-03-26T (after big run #4, normal runs #1–#4)
**Categories:** New Page (Color Trends 2026), Content (A), Collections (D)

### New Feature: /trends — Color Trends 2026 page
- `src/lib/color-trends.ts` — 8 trend entries: Warm Earth Revival, Digital Sage, Quiet Luxury Neutrals, Cobalt Confidence, Neo-Botanica, Evolved Coral, Midnight Plum, Warm Minimalism
- `src/components/color-trends-page.tsx` — Category filter, expandable trend cards, per-color copy buttons, palette preview links, collection cross-links, EN+ZH i18n
- `app/trends/page.tsx` — SEO metadata with CollectionPage + FAQPage structured data
- `src/components/site-header.tsx` — Added `/trends` to currentPath union type
- `app/sitemap.ts` — Added `/trends/` at priority 0.90

### Category A — 4 Newsletter Issues (326–329, total 329)
- `mar-2033-color-in-music` — Synesthesia, chromesthesia, album art, genre color conventions
- `mar-2033-color-naming-linguistics` — World Color Survey, Russian siniy/goluboy, Japanese ao
- `apr-2033-color-in-fashion-beyond-trends` — Signature color systems (Hermès, Louboutin, Tiffany)
- `apr-2033-light-color-photography` — Photography + color: Kodachrome, film emulation, digital

### Category A — 3 SEO Guides (extraGuides51, 301 total)
- `color-trends-2026-design-guide` (priority 96) — Why 2026 leans warm, applying trends strategically
- `color-palette-for-social-media` (priority 90) — Feed palette, thumbnail scale, platform context
- `monochromatic-color-palette-guide` (priority 84) — Tonal scale, contrast, value compression

### Category D — 8 Collections (extraCollections50, 223 total)
- `2026-warm-earth-trend`, `2026-digital-sage-trend`, `2026-quiet-luxury-trend`
- `2026-cobalt-confidence-trend`, `2026-midnight-plum-trend` — Trend-anchored palettes
- `photography-film-emulation`, `synesthetic-sound-palette`, `luxury-perfume-editorial`

### Files Modified (9 total)
- `app/trends/page.tsx` — NEW
- `src/components/color-trends-page.tsx` — NEW
- `src/lib/color-trends.ts` — NEW
- `src/components/site-header.tsx` — +/trends to type union
- `src/data/newsletter-issues.json` — 329 total
- `src/lib/guides.ts` — extraGuides51 (301 total)
- `src/lib/collections.ts` — extraCollections50 (223 total)
- `app/sitemap.ts` — +/trends/
- `STRUCTURE.md` — documented /trends/ route
- `.claude/session-lock.json` — released

## 2026-03-26 — Normal Run #6 (post big run #5)

**Type:** Normal Run  
**Commit:** bca3439  
**Timestamp:** 2026-03-26T (after big run #5, normal run #1)  
**Categories:** Content (A), Collections (D), Aliases (D), Navigation/i18n (B)

### Category A — 4 Newsletter Issues (330–333, Issues 025–028)
- `may-2026-color-and-typography-pairing` — Halation effects from max contrast, warm/cool gray hue personality, weight-contrast interaction, 3-tier text hierarchy
- `may-2026-seasonal-color-transitions` — Psychological basis for seasonal color, stable neutral + seasonal accent model, token architecture, hemisphere complications
- `may-2026-brand-color-persistence` — Why brand colors stick (repetition + distinctiveness), PMS/CMYK/sRGB tolerance specs, Hermès orange evolution, digital-native challenges
- `may-2026-dark-mode-color-systems` — Why inversion fails, surface elevation hierarchy, dark mode accent redefining, testing at real viewing conditions

### Category A — 3 SEO Guides (extraGuides52, 306 total)
- `how-to-choose-colors-for-dark-mode` (priority 94) — Start with surfaces, redefine accents, text tiers, token architecture for maintainable dark mode
- `color-contrast-checker-guide` (priority 91) — WCAG contrast ratio formula, when 4.5:1 vs 3:1 applies, common failures, beyond-compliance targets
- `color-palettes-for-website-design` (priority 92) — Define roles before colors, build from brand hue, integrate accessibility, test in context

### Category D — 8 Collections (extraCollections51, 232 total)
- `coastal-fog-palette` — Marine layer morning muted palette: aqua mist, seafoam pearl, cool gray bloom
- `high-fashion-monochrome` — Complete warm gray spectrum from whisper to shadow for fashion editorial
- `art-deco-gold-black` — 1920s opulence: amber vivid, honey, emerald clear, warm gray ink
- `wabi-sabi-earth` — Imperfect beauty: warm gray pearl, coral bloom muted, olive tone muted, moss dusk
- `tropical-modernist` — Bold tropical meets modernist restraint: fuchsia vivid, emerald clear, true gray whisper
- `gallery-white-study` — Fine art gallery whites: warm veil, cool veil, true veil + whisper variants
- `botanical-ink-palette` — Antique botanical illustration: moss tone, olive silk, coral tone, amber bloom
- `cinematic-neon-noir` — Neo-noir cinema: violet shadow vivid, aqua core vivid, amber tone clear, cobalt nocturne soft

### Category D — ~50 Search Aliases (~1550 lines total)
New alias groups: dark mode UI systems (dark_mode_ui, dark_mode_surface, dark_ui_accent, night_ui), neo-noir/cinematic (neo_noir, neon_noir, cyberpunk_neon, blade_runner, film_noir, cinematic_night), wabi-sabi (wabi_sabi_earth, imperfect_beauty, japanese_earth, zen_palette, pottery_glaze, raku), Art Deco (art_deco_palette, deco_gold, deco_jewel, gatsby_palette, twenties_palette), coastal fog (coastal_fog_morning, marine_layer, foggy_morning, beach_mist, pacific_fog), botanical illustration (botanical_ink, naturalist_palette, field_guide, victorian_botanical, antique_botanical), typography (reading_palette, editorial_text, print_palette, book_design, typographic)

### Category B — Navigation & i18n
- `src/lib/i18n.ts` — Added `nav.trends` key (EN: "Color Trends 2026", ZH: "2026年色彩趋势")
- `src/components/site-header.tsx` — Added `/trends/` to Explore nav group (after /decades/), expanded currentPath type

### Files Modified (6 total)
- `src/data/newsletter-issues.json` — 333 total
- `src/lib/guides.ts` — extraGuides52 (306 total)
- `src/lib/collections.ts` — extraCollections51 (232 total)
- `src/lib/color-search.ts` — ~1550 lines total
- `src/lib/i18n.ts` — +nav.trends key
- `src/components/site-header.tsx` — +/trends/ nav item
- `.claude/session-lock.json` — released

## 2026-03-26 — Normal Run #7 (post big run #5)

**Type:** Normal Run  
**Commit:** 7a198fe  
**Timestamp:** 2026-03-26T (after big run #5, normal run #2)  
**Categories:** Content (A), Collections (D), Aliases (D)

### Category A — 4 Newsletter Issues (334–337, total 337)
- `may-2033-color-and-space-perception` — Color's effect on spatial perception: value drives apparent size, hue drives temperature, biophilic design research, ceiling color strategy
- `may-2033-earth-pigments-color-history` — Pigment economics from ochre to Prussian Blue: how material costs shaped art history, synthetic pigment revolution
- `jun-2033-color-and-time-perception` — Arousal-driven time compression: retail applications, dining environments, digital UX implications, attention modifying factor
- `jun-2033-cross-cultural-color-divergence` — Cross-cultural color divergence for global design: white mourning, yellow associations across markets, green and Islam, practical framework

### Category A — 3 SEO Guides (extraGuides53, 309 total)
- `color-palette-for-app-design` (priority 93) — Semantic roles first, tonal scales, state colors, light+dark from day one, device testing
- `earthy-color-palette-guide` (priority 88) — Earth pigment history, palette architecture (light neutral + accent + green + anchor), digital value management, industry fit
- `color-psychology-marketing-guide` (priority 91) — Appropriateness over symbolism, distinctiveness vs convention-breaking, cultural variation, when color psychology matters

### Category D — 8 Collections (extraCollections52, 240 total)
- `terracotta-studio` — Mediterranean fired clay: coral tone muted, apricot silk, amber bloom, olive faint, warm-gray spectrum
- `northern-forest` — Boreal Canada/Finland: teal shadow, leaf dusk, amber bloom, cool-gray whisper/shadow, aqua faint
- `parisian-salon` — Haussmann apartment patina: rose bloom, blush silk, amber tone muted, cool-gray, plum velvet
- `desert-dusk` — Southwest post-sunset: amber radiant, apricot bloom, violet dusk, iris shadow, warm-gray mist, rose bloom
- `minimal-japanese` — Zen restraint: warm-gray spectrum from whisper to ink, amber faint, moss faint
- `eighties-miami` — Miami Vice palette: fuchsia bloom vivid, aqua bloom clear, teal tone, rose bloom vivid, warm-gray whisper
- `soft-romantic` — Wedding/beauty: blush whisper/bloom, iris whisper, amber whisper, rose veil, warm-gray whisper
- `deep-ocean` — Abyssal marine: aqua shadow vivid, teal nocturne, cobalt nocturne, cool-gray whisper, cobalt ink

### Category D — ~60 Search Aliases (deduped, ~1615 lines total)
New alias groups: terracotta/clay/Mediterranean earth, boreal/northern forest, Parisian/French salon, desert/Southwest/canyon, Japanese minimalism/wabi-sabi/Muji/Zen/Kyoto, 80s Miami, soft romantic/wedding/bridal, deep ocean/marine/abyssal

### Files Modified (6 total)
- `src/data/newsletter-issues.json` — 337 total
- `src/lib/guides.ts` — extraGuides53 (309 total)
- `src/lib/collections.ts` — extraCollections52 (240 total)
- `src/lib/color-search.ts` — ~1615 lines total
- `STRUCTURE.md` — updated counts
- `.claude/session-lock.json` — released

## 2026-03-26 — Normal Run #8 (post big run #5)

**Type:** Normal Run  
**Commit:** 3dd3c8c  
**Timestamp:** 2026-03-26T (after big run #5, normal run #3)  
**Categories:** Content (A), Collections (D), Aliases (D), Email (E)

### Category A — 4 Newsletter Issues (338–341, total 341)
- `jul-2033-color-and-memory` — Encoding specificity in color memory, brand color-memory research, emotional salience for durable recall, experiential vs digital context differences
- `jul-2033-interior-color-systems` — 60-30-10 rule properly demystified (visual dominance not surface area), LRV priority over hue, undertone conflict failures, multi-room color sequencing, ceiling color strategy
- `aug-2033-color-accessibility-beyond-wcag` — Color blindness simulation tools, APCA vs WCAG 2.1 limitations, cognitive accessibility load theory, contrast margin buffer for real-world conditions
- `aug-2033-brand-color-evolution` — Kodak yellow spec management, Apple rainbow→mono strategic shift, McDonald's red demotion, Gap 2010 revert case study

### Category A — 3 SEO Guides (extraGuides54, 312 total)
- `best-colors-for-bedroom-walls` (priority 90) — Sleep science, LRV vs hue priority, tonal/neutral-plus-one/dark room palette structures
- `color-palette-for-logo-design` (priority 93) — Logo≠brand palette, Pantone/CMYK/sRGB/hex discipline, grayscale-first rule, category convention vs distinctiveness
- `warm-color-palette-guide` (priority 89) — Warm hue range 0°-70°, saturation management (muted dominant + vivid accent), warm neutral anchor requirement, industry fit guide

### Category D — 8 Collections (extraCollections53, 248 total)
- `bauhaus-primary` — Itten/Albers primary color theory: crimson/citrine/cobalt/true-gray
- `cyberpunk-neon` — Electric magenta, cyan, violet against near-black neon dark aesthetic
- `stone-and-sage` — Cool gray + moss/leaf mineral restraint for wellness/interiors
- `autumn-harvest` — Amber/ember/citrine/olive at peak fall saturation
- `rose-quartz-mauve` — Dusty rose/mauve/iris in translucent mineral register
- `midnight-garden` — Dark leaf/plum/cobalt botanicals for premium beauty/hospitality
- `vintage-paper` — Amber/warm-gray sepia/heritage document palette
- `citrus-burst` — Citrine/amber/ember/lime vivid food/beverage palette

### Category D — ~80 Search Aliases (~1710 lines total)
New alias groups: Bauhaus/Mondrian/primary, cyberpunk/synthwave/retrowave/vaporwave, stone+sage/mineral/lichen, autumn harvest/fall foliage/pumpkin, rose quartz/mauve/crystal/muted pink, midnight garden/dark botanical/gothic garden, vintage paper/sepia/heritage/parchment, citrus/lemon/lime/tangerine/blood orange, bedroom/sleep palette keywords

### Category E — Email
- `server/email.js`: Added `sendWeeklyDigestEmail()` — weekly round-up email with recent notes + featured collection; properly exported in module.exports

### Files Modified (6 total)
- `src/data/newsletter-issues.json` — 341 total
- `src/lib/guides.ts` — extraGuides54 (312 total)
- `src/lib/collections.ts` — extraCollections53 (248 total)
- `src/lib/color-search.ts` — ~1710 lines total
- `server/email.js` — +sendWeeklyDigestEmail()
- `STRUCTURE.md` — updated counts (341 newsletters, 248 collections, 312 guides)
- `.claude/session-lock.json` — released

## 2026-03-26 — Normal Run #9 (post big run #5)

**Type:** Normal Run  
**Commit:** f6e8ab4  
**Timestamp:** 2026-03-26T (after big run #5, normal run #4)  
**Categories:** Content (A), Collections (D), Aliases (D)

### Category A — 4 Newsletter Issues (342–345, total 345)
- `sep-2033-color-adaptation-and-constancy` — Visual adaptation and color constancy: receptor bleaching mechanism, chromatic adaptation levels (retinal + cortical), illuminant estimation, design implications for controlled viewing environments
- `sep-2033-color-in-wayfinding` — Color as navigation: London Underground history, hospital zone systems, airport symbol vs color tradeoffs, Tokyo Metro vs NYC subway color logic, redundancy principle
- `sep-2033-seasonal-color-transitions` — Seasonal color logic for designers: Pantone forecasting cadence, WGSN 18-24 month lead time, biophilic basis for seasonal preference shifts, interior vs fashion timelines, anticipatory campaign design
- `sep-2033-color-and-typography` — Color and type interaction: optical color/texture of type, saturation shift by typeface weight, contrast polarity differences (dark mode), color hierarchy without size changes, rich black vs K-only in print

### Category A — 3 SEO Guides (extraGuides55, 315 total)
- `color-palette-for-social-media` (priority 92) — Platform-specific color strategy, thumb-stopping contrast in feed context, background color as brand signature, multi-format testing
- `purple-color-palette-guide` (priority 88) — Hue sub-families (violet/indigo/orchid/magenta), saturation management for large areas, dual luxury vs tech associations, industry fit guide
- `dark-color-palette-guide` (priority 90) — Surface layering architecture for dark UI, saturation recalibration, APCA contrast implications, dark branding vs dark UI distinctions

### Category D — 8 Collections (extraCollections54, 256 total)
- `scandinavian-winter` — Cool gray, cerulean, cobalt for Nordic winter light palette
- `golden-hour` — Amber, apricot, coral, rose for magic hour photography
- `forest-bathing` — Leaf, moss, emerald for shinrin-yoku biophilic wellness design
- `industrial-loft` — Warm gray, ember, true gray for raw material/concrete aesthetics
- `tropical-garden` — Fuchsia, lime, teal, ember for maximalist botanical editorial
- `art-nouveau-revival` — Teal, iris, amber, moss for ornamental heritage and brand
- `nordic-summer` — Cerulean, blush, citrine, rose for midsummer Scandinavian palette
- `canyon-dusk` — Ember, apricot, violet for Southwest canyon sunset palette

### Category D — ~80 Search Aliases (~1805 lines total)
New alias groups: scandinavian/nordic winter, golden hour/magic hour, forest bathing/shinrin-yoku/biophilic, industrial/concrete/loft, tropical/maximalist botanical, art nouveau/peacock/ornamental, nordic summer/midsommar, canyon/southwest/desert dusk

### Files Modified (6 total)
- `src/data/newsletter-issues.json` — 345 total
- `src/lib/guides.ts` — extraGuides55 (315 total)
- `src/lib/collections.ts` — extraCollections54 (256 total)
- `src/lib/color-search.ts` — ~1805 lines total
- `STRUCTURE.md` — updated counts (345 newsletters, 256 collections, 315 guides)
- `.claude/session-lock.json` — released
