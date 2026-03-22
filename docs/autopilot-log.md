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
