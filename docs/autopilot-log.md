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

