# ColorArchive — Project Structure

> Keep this file up to date when adding pages, components, data files, or server routes.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router, `output: "export"`) |
| Styling | Tailwind CSS 4 |
| Hosting | GitHub Pages (static) |
| Backend | Node.js / Express on DigitalOcean Droplet (143.198.85.72) |
| Database | SQLite (better-sqlite3) |
| Email | Resend |
| Commerce | Lemon Squeezy |
| Analytics | Umami Cloud |
| i18n | Custom (`src/lib/i18n.ts`) — EN / ZH |

---

## Directory Tree

```
ColorArchive/
├── app/                          # Next.js App Router (Server Components + metadata)
│   ├── layout.tsx                # Root layout: providers, analytics, head tags
│   ├── page.tsx                  # Homepage /
│   ├── sitemap.ts                # Auto-generates sitemap.xml (2134+ URLs)
│   ├── robots.ts                 # robots.txt
│   ├── globals.css               # Tailwind base + custom utilities
│   │
│   ├── all-colors/               # /all-colors/ — full color grid
│   ├── colors/[slug]/            # /colors/:id/ — 2016 static color detail pages
│   ├── collections/              # /collections/ + /collections/[slug]/
│   ├── families/                 # /families/ + /families/[slug]/
│   ├── packs/                    # /packs/ + /packs/[slug]/
│   ├── guides/                   # /guides/ + /guides/[slug]/
│   ├── notes/                    # /notes/ + /notes/[slug]/ + /notes/tags/[tag]/
│   ├── search/                   # /search/
│   ├── contrast/                 # /contrast/ — WCAG contrast checker
│   ├── free-pack/                # /free-pack/ — free sample download page
│   ├── palette/                  # /palette/?ids=... — shareable palette viewer
│   ├── spectrum/                 # /spectrum/ — hue spectrum explorer
│   ├── word-to-color/            # /word-to-color/ — word → color algorithm
│   ├── recent/                   # /recent/ — recently viewed colors
│   ├── favorites/                # /favorites/ — saved colors
│   ├── surprise/                 # /surprise/ — random color discovery
│   ├── waitlist/                 # /waitlist/ — product updates signup
│   ├── updates/                  # /updates/ — public changelog
│   ├── launch/                   # /launch/ — Product Hunt launch page
│   ├── about/                    # /about/
│   ├── support/                  # /support/
│   ├── product-examples/         # /product-examples/ — pack proof page
│   ├── thanks/                   # /thanks/ — post-purchase confirmation
│   ├── cancel/                   # /cancel/ — checkout cancel landing
│   ├── login/                    # /login/ — magic link auth
│   ├── pinterest/callback/       # /pinterest/callback/ — Pinterest OAuth redirect handler
│   ├── admin/orders/             # /admin/orders/ — internal order dashboard
│   ├── analytics/                # /analytics/ — internal analytics dashboard
│   ├── trending/                 # /trending/ — weekly trending colors
│   ├── convert/                  # /convert/ — color format converter (HEX↔RGB↔HSL↔HSB↔CMYK)
│   ├── palette-generator/        # /palette-generator/ — seed color → 5 harmony palettes
│   ├── gradient/                  # /gradient/ — CSS gradient generator (linear/radial)
│   ├── harmonies/                 # /harmonies/ — color harmonies calculator (6 harmony types + color wheel)
│   ├── compare/                   # /compare/ — side-by-side two-color comparison tool
│   ├── tints/                     # /tints/ — tints & shades generator (11-step tonal scale, CSS/Tailwind/Sass/JSON export)
│   ├── mixer/                     # /mixer/ — Color Mixer (RGB/HSL/OKLCH interpolation, 11-step blend, CSS vars/JSON/color-mix() export)
│   ├── combinations/              # /combinations/ — Color Combinations Library
│   ├── tokens/                    # /tokens/ — Design Token Generator
│   ├── packs/quiz/                # /packs/quiz/ — interactive pack recommendation quiz
│   ├── brand-generator/           # /brand-generator/ — AI brand palette generator
│   ├── mood-palette/              # /mood-palette/ — AI mood palette generator
│   ├── color-quiz/                # /color-quiz/ — Color personality quiz
│   ├── image-palette/             # /image-palette/ — Image color extractor
│   ├── identify/                  # /identify/ — Color finder (camera/image/eyedropper)
│   ├── preview/                   # /preview/ — Palette UI preview (5 scenes + dark mode)
│   ├── mesh-gradient/             # /mesh-gradient/ — Mesh gradient generator
│   ├── stories/                   # /stories/ — Color stories (cultural/psychological)
│   ├── today/                     # /today/ — Color of the Day
│   ├── colorblind/                # /colorblind/ — Color blindness simulator
│   ├── wcag-audit/                # /wcag-audit/ — Full WCAG audit matrix
│   ├── brand/                     # /brand/ — Brand palette system builder
│   ├── tools/                     # /tools/ — All tools listing page
│   ├── api-docs/                  # /api-docs/ — Public API documentation
│   ├── pro/                       # /pro/ — Pro subscription pricing page
│   ├── projects/                  # /projects/ — Cloud project library
│   ├── projects/shared/[shareId]/ # /projects/shared/:id — Public shared project view
│   ├── account/                   # /account/ — User account dashboard
│   ├── use-cases/                 # /use-cases/ — Color palettes by industry (10 use cases)
│   │   └── [slug]/               # 10 static industry detail pages
│   ├── analyze/                   # /analyze/ — Brand color analyzer (URL extraction)
│   ├── famous-palettes/           # /famous-palettes/ — Famous color palettes reference library
│   ├── admin/tiktok/              # /admin/tiktok/ — TikTok publishing admin
│
├── src/
│   ├── components/               # "use client" UI components (one per page + shared)
│   │   ├── hero-section.tsx              # Homepage above-fold hero
│   │   ├── hero-section-below-fold.tsx   # Homepage below-fold (lazy loaded)
│   │   ├── color-archive-page.tsx        # Main archive (homepage color browsing)
│   │   ├── all-colors-page.tsx           # Full color grid
│   │   ├── color-detail-page.tsx         # Individual color page (2016 pages)
│   │   ├── color-card.tsx                # Color swatch card
│   │   ├── color-grid.tsx                # Virtualized grid of color cards
│   │   ├── color-spectrum.tsx            # Spectrum strip UI
│   │   ├── selected-color-panel.tsx      # Slide-in panel for quick color actions
│   │   ├── filter-toolbar.tsx            # Sort/filter controls
│   │   ├── archive-empty-state.tsx       # No-results empty state
│   │   ├── family-overview.tsx           # Color family cards grid
│   │   ├── family-detail-page.tsx        # Individual family page
│   │   ├── families-page.tsx             # All families listing
│   │   ├── collection-detail-page.tsx    # Curated collection detail
│   │   ├── collections-page.tsx          # All collections listing
│   │   ├── pack-detail-page.tsx          # Individual pack product page
│   │   ├── palette-packs-page.tsx        # All packs listing + comparison
│   │   ├── free-pack-page.tsx            # Free sample download page
│   │   ├── guide-detail-page.tsx         # SEO guide article page
│   │   ├── guides-page.tsx               # All guides listing
│   │   ├── note-detail-page.tsx          # Newsletter issue page
│   │   ├── notes-page.tsx                # All notes listing
│   │   ├── tag-notes-page.tsx            # Notes filtered by tag
│   │   ├── search-explorer-page.tsx      # Search page
│   │   ├── contrast-page.tsx             # WCAG contrast checker
│   │   ├── palette-page.tsx              # Shared palette viewer
│   │   ├── palette-builder-tray.tsx      # Floating palette builder (fixed bottom)
│   │   ├── spectrum-explorer-page.tsx    # Spectrum explorer
│   │   ├── word-color-generator-page.tsx # Word → color tool
│   │   ├── recent-colors-page.tsx        # Recently viewed
│   │   ├── favorites-page.tsx            # Saved favorites
│   │   ├── random-discovery-page.tsx     # Surprise page
│   │   ├── email-capture-form.tsx        # Reusable email signup form
│   │   ├── site-header.tsx               # Global nav header
│   │   ├── site-footer.tsx               # Global footer
│   │   ├── locale-provider.tsx           # i18n context + useLocale() hook
│   │   ├── theme-provider.tsx            # Dark/light mode context
│   │   ├── auth-provider.tsx             # Auth session context
│   │   ├── page-tracker.tsx              # Client-side page view tracking
│   │   ├── ph-launch-banner.tsx          # Product Hunt launch banner
│   │   ├── seasonal-countdown.tsx        # Seasonal pack countdown
│   │   ├── structured-data-script.tsx    # JSON-LD schema injection
│   │   ├── copy-action-button.tsx        # Reusable copy-to-clipboard button
│   │   ├── favorite-button.tsx           # Add/remove favorite button
│   │   ├── share-link-button.tsx         # Share / share on X buttons
│   │   ├── pinterest-save-button.tsx    # Save to Pinterest button + board picker modal
│   │   ├── pinterest-callback-page.tsx  # Pinterest OAuth callback handler
│   │   ├── recommended-colors-section.tsx # Related colors suggestions
│   │   ├── local-archive-hub.tsx         # Local storage color hub
│   │   ├── theme-toggle.tsx              # Dark/light mode toggle
│   │   ├── login-page.tsx                # Magic link login page
│   │   ├── waitlist-page.tsx             # Waitlist signup page
│   │   ├── updates-page.tsx              # Changelog page
│   │   ├── launch-page.tsx               # PH launch page
│   │   ├── about-page.tsx                # About page
│   │   ├── support-page.tsx              # Support page
│   │   ├── product-examples-page.tsx     # Product proof page
│   │   ├── thanks-page.tsx               # Post-purchase page
│   │   ├── cancel-page.tsx               # Checkout cancel page
│   │   ├── admin-orders-page.tsx         # Internal orders dashboard
│   │   ├── analytics-page.tsx            # Internal analytics dashboard
│   │   ├── trending-page.tsx             # Weekly trending colors page
│   │   ├── color-converter-page.tsx      # Color format converter (HEX↔RGB↔HSL↔HSB↔CMYK)
│   │   ├── palette-generator-page.tsx   # Palette generator (5 harmony types from seed color)
│   │   ├── gradient-generator-page.tsx  # CSS gradient generator (linear/radial)
│   │   ├── color-harmonies-page.tsx    # Color harmonies calculator (6 types + SVG color wheel)
│   │   ├── color-compare-page.tsx      # Two-color comparison tool
│   │   ├── tints-shades-page.tsx        # Tints & shades generator (11-step scale, CSS/Tailwind/Sass/JSON export)
│   │   ├── copy-upsell-toast.tsx       # Subtle upsell toast after 5th copy
│   │   ├── pack-quiz-page.tsx           # Interactive pack recommendation quiz
│   │   ├── back-to-top.tsx              # Floating back-to-top button
│   │   ├── colorblind-page.tsx          # Color blindness simulator
│   │   ├── error-boundary.tsx           # Global error boundary component
│   │   ├── brand-generator-page.tsx     # AI brand palette generator
│   │   ├── mood-palette-page.tsx        # AI mood palette generator
│   │   ├── color-quiz-page.tsx          # Color personality quiz
│   │   ├── image-palette-page.tsx       # Image color extractor (k-means)
│   │   ├── color-finder-page.tsx        # Color finder (camera/image/eyedropper)
│   │   ├── palette-preview-page.tsx     # Palette UI preview (5 scenes + dark mode)
│   │   ├── mesh-gradient-page.tsx       # Mesh gradient generator
│   │   ├── color-stories-page.tsx       # Color stories page
│   │   ├── color-of-day-page.tsx        # Color of the Day
│   │   ├── wcag-audit-page.tsx          # WCAG audit matrix
│   │   ├── token-generator-page.tsx     # Design token generator
│   │   ├── tools-page.tsx              # All tools listing
│   │   ├── api-docs-page.tsx           # API documentation
│   │   ├── pro-page.tsx                # Pro pricing page
│   │   ├── pro-gate.tsx                # Export gating component (Free: 1/day, Pro: unlimited)
│   │   ├── upgrade-modal.tsx           # Pro upgrade modal + useUpgradeModal hook
│   │   ├── projects-page.tsx           # Cloud projects list
│   │   ├── shared-project-page.tsx     # Public shared project view
│   │   ├── save-to-project.tsx         # "Save to Projects" button (used across 8+ pages)
│   │   ├── account-page.tsx            # Account dashboard (tier, usage, referral)
│   │   ├── palette-critique-panel.tsx  # AI design critique panel
│   │   ├── url-analyzer-page.tsx       # Brand color analyzer (URL extraction)
│   │   ├── use-cases-page.tsx          # Color palettes by industry index
│   │   └── use-case-detail-page.tsx    # Individual industry palette guide
│   │   ├── referral-card.tsx           # Referral link + credits display
│   │   └── ai-usage-badge.tsx          # AI usage counter badge
│   │
│   ├── data/
│   │   ├── colors.ts                     # Algorithmic generation of 3,066 colors
│   │   │                                 # (36 hues × 14 lightness × 6 chroma + 3 neutral groups × 14)
│   │   ├── color-stories.json            # Color stories (cultural/psychological content)
│   │   └── newsletter-issues.json        # 249 newsletter issues
│   │
│   ├── lib/
│   │   ├── color-utils.ts                # HSL↔RGB↔HEX, family classification,
│   │   │                                 # sorting, analogous/complementary/tonal,
│   │   │                                 # fuzzy search, WCAG contrast pairings
│   │   ├── collections.ts                # 126 curated palette collections
│   │   ├── palette-packs.ts              # 7 product pack definitions + metadata
│   │   ├── guides.ts                     # 230+ SEO landing guides
│   │   ├── newsletter-issues.ts          # Newsletter data helpers + tagToSlug
│   │   ├── i18n.ts                       # EN/ZH translations (~710+ keys)
│   │   ├── palette-builder.ts            # localStorage palette + subscriptions,
│   │   │                                 # Tailwind/Figma/StyleDict exports, naming
│   │   ├── favorites.ts                  # localStorage favorites + subscriptions
│   │   ├── recent-colors.ts              # localStorage recent history
│   │   ├── pinterest.ts                  # Pinterest OAuth + API proxy helpers
│   │   ├── checkout-config.ts            # Lemon Squeezy checkout URLs + Pro subscription config
│   │   ├── auth-client.ts               # Client API: session, projects, usage, referral, types
│   │   ├── brand-palette.ts             # Single-hex → 11-step design system + semantic colors
│   │   ├── color-relationships.ts       # Color relationships (analogous, complementary, triadic, tonal)
│   │   ├── color-contrast.ts            # WCAG contrast ratio + relative luminance
│   │   ├── color-of-day.ts              # Deterministic daily color selection
│   │   ├── license-tiers.ts             # License tier definitions
│   │   ├── color-family-pages.ts         # Color family page slug/metadata
│   │   ├── colorblind.ts                 # Viénot (1999) color blindness simulation matrices
│   │   ├── combinations.ts               # 30+ curated color combinations (complementary, analogous, triadic, monochromatic, neutral+accent)
│   └── word-color.ts                 # Deterministic word→color hash
│   │
│   └── types/
│       └── color.ts                      # ColorRecord, ColorFamily, SortOption
│
├── server/                               # Express backend — DO Droplet
│   ├── index.js                          # Entry point, routes registration
│   ├── email.js                          # Resend email functions (11 types incl. Pro upsell)
│   ├── email-scheduler.js                # Hourly cron: Day-3/7/14/21/30 follow-ups + COTD + A/B
│   ├── db.js                             # SQLite setup (subscribers, orders, sessions, users,
│   │                                     #   projects, ai_usage, user_preferences)
│   ├── auth.js                           # Magic link + Google OAuth auth, tier management
│   ├── catalog.js                        # Pack catalog data
│   ├── colors.js                         # Server-side 3,066 color generation (mirrors client)
│   ├── ai-rate-limit.js                  # AI rate limiting middleware (anon 3/day, free 10/day,
│   │                                     #   pro unlimited, credit consumption)
│   ├── api-rate-limit.js                 # API rate limiting middleware (60/1k/10k per hour)
│   ├── ig-scheduler.js                   # Instagram auto-posting scheduler
│   ├── ig-image-generator.js             # Instagram image generation
│   └── routes/
│       ├── subscribe.js                  # POST /subscribe — email capture + referral tracking
│       ├── webhook.js                    # POST /webhook — Lemon Squeezy events
│       ├── auth.js                       # Magic link + Google OAuth + session (with tier)
│       ├── me.js                         # GET /me, /me/usage, /me/referral, /me/api-key,
│       │                                 #   /me/preferences, /me/orders
│       ├── projects.js                   # CRUD /projects + GET /projects/shared/:id
│       ├── ai.js                         # POST /ai/brand-palette, /ai/mood-palette,
│       │                                 #   /ai/name-color, /ai/critique, /ai/analyze-url
│       ├── admin.js                      # GET /admin/* — orders dashboard
│       ├── analytics.js                  # GET /analytics/* — internal stats
│       ├── pageviews.js                  # POST /pageviews — page tracking
│       ├── og.js                         # GET /og — OG image generation
│       └── instagram.js                  # Instagram API (OAuth, publish, media feed)
│
├── public/
│   └── downloads/                        # Pack download files (.zip, .swatches)
│       ├── free-palette-pack.zip
│       ├── palette-pack-vol-1.zip
│       ├── dark-mode-ui-kit.zip
│       ├── content-creator-bundle.zip
│       ├── brand-starter-kit.zip
│       ├── complete-archive.zip
│       ├── seasonal-spring-2026.zip
│       └── colorarchive.swatches         # Procreate swatch file
│
├── figma-plugin/                         # Figma plugin (browse + insert colors)
│   ├── manifest.json                     # Plugin manifest
│   ├── code.js                           # Main thread (apply-fill, create-style)
│   └── ui.html                           # Plugin UI (search, family tabs, grid)
│
├── docs/                                 # Internal ops documentation
├── scripts/                              # Build utilities (generate-downloads.mjs)
├── CLAUDE.md                             # Guide for Claude Code sessions
├── STRUCTURE.md                          # This file
├── PRODUCT_MEMO.md                       # Product and commerce notes
└── ROADMAP.md                            # Feature roadmap
```

---

## Key Patterns

### Page + Component Split
Every page in `app/` is a Server Component (metadata only). The actual UI lives in `src/components/*-page.tsx` marked `"use client"`. Example:
```
app/colors/[slug]/page.tsx  →  src/components/color-detail-page.tsx
```

### Static Generation
`generateStaticParams()` in dynamic routes pre-renders all pages at build time. 3,066 color pages + family/collection/pack/guide/note pages = ~3,200+ total pages.

### localStorage Persistence
Three independent stores, each with a subscription pattern for cross-component reactivity:
- `palette-builder.ts` — current palette (up to 8 colors)
- `favorites.ts` — saved colors
- `recent-colors.ts` — browsing history

### i18n
`src/lib/i18n.ts` exports a `t(key, locale)` function. The `useLocale()` hook (from `locale-provider.tsx`) gives components `{ t, locale }`. Locale stored in `localStorage` as `colorarchive-locale`. Supported: `en`, `zh`.

### Email Nurture Sequence
Triggered by `email-scheduler.js` running hourly on the DO droplet:
- **Day 0** — Free pack download link (`sendFreePackEmail`)
- **Day 3** — How to use CSS tokens + Dark Mode UI Kit upsell
- **Day 7** — Full catalog overview (all 7 packs)
- **Day 14** — 10% discount code `FIRSTPACK`
- **Day 21** — Creative inspiration email
- **Day 30** — Final conversion email
- **On AI limit hit** — Pro upsell email (max 1/day per user)
- **Daily** — Color of the Day (COTD) for opted-in subscribers

Each follow-up uses A/B subject-line variants (deterministic hash on email). Variant assignment stored in `ab_variant` column; per-stage variant tracked in `follow_up_Xd_variant`.

### Pro Subscription & Monetization
- **Tier system**: anonymous (3 AI/day) → free (10 AI/day, 3 projects) → Pro (unlimited)
- **ProGate**: Export gating on token generator, WCAG audit, image palette, palette builder, preview
- **Referral credits**: +5 AI credits per referred signup, credits consumed before tier limits
- **API tiering**: 60/hr (anonymous) → 1,000/hr (free key) → 10,000/hr (Pro key)
- **Upgrade triggers**: 429 rate limit → modal + email; ProGate lock → /pro link

---

## Content Counts (as of 2026-03-24)

| Content | Count |
|---------|-------|
| Colors | 3,066 (3,024 chromatic + 42 neutral grays) |
| Saturation bands | 6 (Faint 10%, Muted 18%, Soft 34%, Clear 54%, Vivid 74%, Pure 92%) |
| Neutral groups | 3 (Warm Gray, Cool Gray, True Gray) |
| Collections | 126 |
| Palette packs | 7 (USD $9–$129) |
| SEO guides | 230+ |
| Newsletter issues | 249 |
| Color families | 9 |
| Industry use cases | 10 (saas-tech, healthcare, luxury, food, finance, education, creative, sustainability, beauty, nonprofit) |
| Tool pages | 23+ (converter, contrast, spectrum, word-to-color, palette-generator, gradient, harmonies, compare, colorblind, tints, mixer, combinations, brand-generator, mood-palette, color-quiz, image-palette, identify, preview, mesh-gradient, wcag-audit, tokens, analyze, name) |
| AI endpoints | 5 (brand-palette, mood-palette, name-color, critique, analyze-url) |
| i18n keys | ~750+ (EN/ZH) |
