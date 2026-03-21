
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
