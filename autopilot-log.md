
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
