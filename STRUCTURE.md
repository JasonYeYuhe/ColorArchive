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
│   └── combinations/              # /combinations/ — Color Combinations Library (30+ curated 2-5 color combos, filter by harmony type)
│   └── tokens/                    # /tokens/ — Design Token Generator (primary/neutral/semantic scales, CSS/Tailwind/SCSS/JSON export)
│   └── packs/quiz/                # /packs/quiz/ — interactive pack recommendation quiz
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
│   │   ├── colorblind-page.tsx          # Color blindness simulator (4 deficiency types, palette mode)
│   │   └── error-boundary.tsx           # Global error boundary component
│   │
│   ├── data/
│   │   ├── colors.ts                     # Algorithmic generation of all 2016 colors
│   │   │                                 # (hue roots × lightness bands × chroma bands)
│   │   └── newsletter-issues.json        # 130 newsletter issues (Issue 001–129+)
│   │
│   ├── lib/
│   │   ├── color-utils.ts                # HSL↔RGB↔HEX, family classification,
│   │   │                                 # sorting, analogous/complementary/tonal,
│   │   │                                 # fuzzy search, WCAG contrast pairings
│   │   ├── collections.ts                # 51 curated palette collections
│   │   ├── palette-packs.ts              # 7 product pack definitions + metadata
│   │   ├── guides.ts                     # 88 SEO landing guides
│   │   ├── newsletter-issues.ts          # Newsletter data helpers + tagToSlug
│   │   ├── i18n.ts                       # EN/ZH translations (~710+ keys)
│   │   ├── palette-builder.ts            # localStorage palette + subscriptions,
│   │   │                                 # Tailwind/Figma/StyleDict exports, naming
│   │   ├── favorites.ts                  # localStorage favorites + subscriptions
│   │   ├── recent-colors.ts              # localStorage recent history
│   │   ├── pinterest.ts                  # Pinterest OAuth + API proxy helpers
│   │   ├── checkout-config.ts            # Lemon Squeezy checkout URLs
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
│   ├── email.js                          # Resend email functions:
│   │                                     #   sendFreePackEmail (Day-0)
│   │                                     #   sendFollowUp3DayEmail
│   │                                     #   sendFollowUp7DayEmail
│   │                                     #   sendFollowUp14DayEmail
│   │                                     #   sendWaitlistConfirmationEmail
│   │                                     #   sendOrderConfirmationEmail
│   │                                     #   sendMagicLinkEmail
│   ├── email-scheduler.js                # Hourly cron: Day-3/7/14 follow-ups + A/B variants
│   ├── db.js                             # SQLite setup (subscribers, orders, sessions)
│   ├── auth.js                           # Magic link auth logic
│   ├── catalog.js                        # Pack catalog data
│   └── routes/
│       ├── subscribe.js                  # POST /subscribe — email capture
│       ├── webhook.js                    # POST /webhook — Lemon Squeezy events
│       ├── auth.js                       # POST /auth/request, GET /auth/verify
│       ├── me.js                         # GET /me — session user info
│       ├── admin.js                      # GET /admin/* — orders dashboard
│       ├── analytics.js                  # GET /analytics/* — internal stats
│       ├── pageviews.js                  # POST /pageviews — page tracking
│       └── og.js                         # GET /og — OG image generation
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
`generateStaticParams()` in dynamic routes pre-renders all pages at build time. 2016 color pages + family/collection/pack/guide/note pages = ~2134 total pages.

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

Each follow-up uses A/B subject-line variants (deterministic hash on email). Variant assignment stored in `ab_variant` column; per-stage variant tracked in `follow_up_Xd_variant`. Results available via `GET /analytics/ab-results`.

---

## Content Counts (as of 2026-03-23)

| Content | Count |
|---------|-------|
| Colors | 2016 |
| Collections | 68 |
| Palette packs | 7 |
| SEO guides | 113 |
| Newsletter issues | 166 |
| Color families | 9 |
| Tool pages | 15 (converter, contrast, spectrum, word-to-color, surprise, palette-generator, gradient, harmonies, compare, quiz, colorblind, tints, mixer, combinations) |
| i18n keys | ~710+ (EN/ZH) |
