# ColorArchive — Project Structure

> Keep this file up to date when adding pages, components, data files, or server routes.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router; SSG + ISR + dynamic routes — NOT static export) |
| Styling | Tailwind CSS 4 |
| Hosting | Vercel (auto-deploy on push to `main`; `vercel.json` ignoreCommand skips docs/.claude-only pushes) |
| Backend | Node.js / Express on DigitalOcean Droplet (143.198.85.72) |
| Database | SQLite (better-sqlite3, WAL) |
| Email | Resend |
| Commerce | Lemon Squeezy (Merchant of Record; JPY). Apple IAP on iOS. Stripe deprecated |
| Analytics | PostHog (product) + first-party `events`/`pageviews` (Droplet SQLite) + New Relic RUM + Sentry |
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
│   ├── 20040303/                 # /20040303/ — personal page, noindex, not in sitemap.
│   │                             #   Renders with NO site chrome (src/lib/bare-routes.ts)
│   ├── all-colors/               # /all-colors/ — full color grid
│   ├── colors/[slug]/            # /colors/:id/ — 3,066 of 5,446 prerendered, rest on-demand ISR
│   │   ├── opengraph-image.tsx   #   1200×630 OG/Twitter card (force-dynamic)
│   │   └── pin-image/route.tsx   #   1000×1500 (2:3) PINTEREST-ONLY image + 5-tone palette.
│   │                             #   Separate from the OG image on purpose; s-maxage=1y.
│   ├── collections/              # /collections/ + /collections/[slug]/
│   ├── families/                 # /families/ + /families/[slug]/
│   ├── packs/                    # /packs/ + /packs/[slug]/
│   ├── guides/                   # /guides/ + /guides/[slug]/
│   ├── notes/                    # /notes/ + /notes/[slug]/ (+ per-note opengraph-image.tsx) + /notes/tags/[tag]/
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
│   ├── screen-test/               # /screen-test/ — Display check hub (black/white level, uniformity, screen report)
│   │   ├── dead-pixel/            # /screen-test/dead-pixel/ — Dead/stuck pixel test
│   │   └── color-screens/         # /screen-test/color-screens/ — Fullscreen solid color screens (?color= hex or archive id)
│   ├── tailwind-colors/           # /tailwind-colors/ — HEX→Tailwind class matcher + v4 palette browser
│   ├── css-filter/                # /css-filter/ — Black→any-color CSS filter chain generator
│   ├── color-wheel/               # /color-wheel/ — Interactive harmony wheel (archive-snapped)
│   ├── color-temperature/         # /color-temperature/ — Kelvin→RGB converter with lighting presets
│   ├── dark-mode-colors/          # /dark-mode-colors/ — Light→dark palette converter (CSS/Tailwind export)
│   ├── ios/                      # /ios/ — App Store landing page for the iOS companion app
│   ├── duotone/                   # /duotone/ — Two-color image effect (local canvas processing)
│   ├── paint-mix/                 # /paint-mix/ — Paint mixing recipe calculator (subtractive approx)
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
│   ├── decades/                   # /decades/ — Color palettes by decade (1920s–2020s, 11 eras)
│   ├── seasonal/                  # /seasonal/ — Color by Season (Spring/Summer/Autumn/Winter, 4 seasons × 6 colors)
│   ├── trends/                   # /trends/ — Color Trends 2026 (8 trend palettes with design guidance)
│   ├── admin/tiktok/              # /admin/tiktok/ — TikTok publishing admin
│   ├── brands/                    # /brands/ + /brands/[slug]/ — Famous brand color palettes (51 brands × hex codes, programmatic SEO)
│   ├── regions/                   # /regions/ + /regions/[slug]/ — Color palettes by region & culture (12 cultures with named pigment sources, programmatic SEO)
│   ├── journal/                   # /journal/ — Color Journal: daily check-in + streak (localStorage-first)
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
│   │   ├── guide-word-card.tsx           # W1 (2026-08-31): in-body word→colour card spliced
│   │   │                                 #   after the first article section, plus its A/B
│   │   │                                 #   wrapper. Mounts in BOTH arms and emits
│   │   │                                 #   `w1_assigned` (the denominator) once per visit;
│   │   │                                 #   only the card itself is arm-dependent. NEVER
│   │   │                                 #   spends the paywall's free quota and NEVER emits
│   │   │                                 #   `word_generated` for the prefilled seed word —
│   │   │                                 #   read the header before touching either.
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
│   │   ├── word-intent-probe.tsx         # One-tap "what are you making?" probe (dev-plan 08-22 §5.2)
│   │   ├── recent-colors-page.tsx        # Recently viewed
│   │   ├── favorites-page.tsx            # Saved favorites
│   │   ├── random-discovery-page.tsx     # Surprise page
│   │   ├── email-capture-form.tsx        # Reusable email signup form
│   │   ├── site-header.tsx               # Global nav header
│   │   ├── site-footer.tsx               # Global footer
│   │   ├── locale-provider.tsx           # i18n context + useLocale() hook
│   │   ├── theme-provider.tsx            # Dark/light mode context
│   │   ├── auth-provider.tsx             # Auth session context
│   │   ├── page-tracker.tsx              # First-party page view tracking (backend /pageviews) + first-touch channel/UTM
│   │   ├── posthog-provider.tsx          # PostHog init + $pageview/tool_used per route (no-op w/o key)
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
│   │   ├── analytics-page.tsx            # Internal analytics dashboard + exit-gate funnel by channel (GateFunnel)
│   │   ├── trending-page.tsx             # Weekly trending colors page
│   │   ├── color-converter-page.tsx      # Color format converter (HEX↔RGB↔HSL↔HSB↔CMYK)
│   │   ├── palette-generator-page.tsx   # Palette generator (5 harmony types from seed color)
│   │   ├── gradient-generator-page.tsx  # CSS gradient generator (linear/radial)
│   │   ├── color-harmonies-page.tsx    # Color harmonies calculator (6 types + SVG color wheel)
│   │   ├── color-compare-page.tsx      # Two-color comparison tool
│   │   ├── tints-shades-page.tsx        # Tints & shades generator (11-step scale, CSS/Tailwind/Sass/JSON export)
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
│   │   ├── screen-test-page.tsx         # Screen test hub (facts report + all subtests + wizard + hue game)
│   │   ├── dead-pixel-test-page.tsx     # Dead/stuck pixel fullscreen cycler
│   │   ├── color-screens-page.tsx       # Fullscreen color screens utility
│   │   ├── screen-test/fullscreen-stage.tsx  # Shared fullscreen engine (wake lock, iOS fallback)
│   │   ├── screen-test/pattern-canvas.tsx    # DPR-exact canvas for pixel-precise patterns
│   │   ├── screen-test/canvas-stages.tsx     # Gamma / banding / sharpness stages
│   │   ├── screen-test/archive-stages.tsx    # Archive color-distance pairs + hue-arrangement game
│   │   ├── screen-test/wedge-stages.tsx      # Near-black / near-white step wedges (hub + wizard)
│   │   ├── screen-test/extra-stages.tsx      # Burn-in check + multitouch tester
│   │   ├── screen-test/wizard.tsx            # Guided test wizard + canvas PNG report card + hash share
│   │   ├── tailwind-colors-page.tsx     # HEX→Tailwind matcher + palette browser
│   │   ├── css-filter-page.tsx          # CSS filter chain generator
│   │   ├── color-wheel-page.tsx         # Interactive harmony wheel
│   │   ├── color-temperature-page.tsx   # Kelvin→RGB converter
│   │   ├── dark-mode-colors-page.tsx    # Light→dark palette converter
│   │   ├── ios-page.tsx                 # /ios/ landing page (features + what stays web-only)
│   │   ├── app-store-link.tsx           # The single App Store link component; fires app_store_click on click only
│   │   ├── duotone-page.tsx             # Duotone image effect
│   │   ├── paint-mix-page.tsx           # Paint mixing recipes
│   │   ├── token-generator-page.tsx     # Design token generator
│   │   ├── tools-page.tsx              # All tools listing
│   │   ├── api-docs-page.tsx           # API documentation
│   │   ├── pro-page.tsx                # Pro pricing page
│   │   ├── pro-gate.tsx                # Export gating (Free: 3/day, Pro: unlimited). Reads the ONE
│   │   │                                 #   shared AuthProvider session — never its own fetch —
│   │   │                                 #   and defers to pro-gate-policy.ts for the decision.
│   │   ├── upgrade-modal.tsx           # Pro upgrade modal + useUpgradeModal hook
│   │   ├── projects-page.tsx           # Cloud projects list
│   │   ├── shared-project-page.tsx     # Public shared project view
│   │   ├── save-to-project.tsx         # "Save to Projects" button (used across 8+ pages)
│   │   ├── account-page.tsx            # Account dashboard (tier, usage, referral)
│   │   ├── palette-critique-panel.tsx  # AI design critique panel
│   │   ├── url-analyzer-page.tsx       # Brand color analyzer (URL extraction)
│   │   ├── use-cases-page.tsx          # Color palettes by industry index
│   │   ├── brands-index-page.tsx       # Brand palettes index (grouped by category)
│   │   ├── brand-detail-page.tsx       # Single brand detail (palette, CSS export, archive matches, siblings)
│   │   ├── color-origins-section.tsx   # "Color Origins" — heritage / cultures / wild / reads section, used on every color detail page
│   │   ├── journal-page.tsx            # /journal/ — daily check-in calendar + streak tiles + entry list (B1+B3 merged)
│   │   ├── journal-calendar-grid.tsx   # Sunday-first month grid + MonthPicker + useMonthNav hook (used by both live UI and PNG export)
│   │   ├── journal-export-button.tsx   # 1080×1080 PNG export of the journal month (Free gets watermark, Pro is clean)
│   │   ├── log-to-journal-button.tsx   # "Save to journal" toggle button, used on color detail + /today/
│   │   ├── brands-using-color-section.tsx # Reverse-index "Brands using a similar color" block, on every color detail page
│   │   ├── regions-index-page.tsx      # /regions/ index, grouped by continent
│   │   ├── region-detail-page.tsx      # /regions/[slug]/ — palette + cultural context + archive matches + references
│   │   ├── regions-using-color-section.tsx # Reverse-index "Cultures using a similar color" block, on every color detail page
│   │   └── use-case-detail-page.tsx    # Individual industry palette guide
│   │   ├── referral-card.tsx           # Referral link + credits display
│   │   ├── ai-usage-badge.tsx          # AI usage counter badge
│   │   └── color-decades-page.tsx      # Color by Decade page (11 decades × 6 colors)
│   │
│   ├── data/
│   │   ├── colors.ts                     # Algorithmic generation of 3,066 colors
│   │   │                                 # (36 hues × 14 lightness × 6 chroma + 3 neutral groups × 14)
│   │   ├── color-stories.json            # Color stories (cultural/psychological content)
│   │   └── newsletter-issues.json        # 349 newsletter issues
│   │
│   ├── lib/
│   │   ├── color-utils.ts                # HSL↔RGB↔HEX, family classification,
│   │   │                                 # sorting, analogous/complementary/tonal,
│   │   │                                 # fuzzy search, WCAG contrast pairings
│   │   ├── screen-test.ts                # Screen-test data + capability detection,
│   │   │                                 # gamma/banding math, archive pairs, hue game,
│   │   │                                 # wizard result hash codec
│   │   ├── color-difference.ts           # sRGB→CIE Lab (D65), ΔE76 + CIEDE2000,
│   │   │                                 # plain-language interpretation
│   │   ├── tailwind-colors.ts            # Tailwind v4 palette (generated from the package)
│   │   ├── css-filter.ts                 # Black→color filter chain SPSA solver (seeded)
│   │   ├── color-temperature.ts          # Kelvin→RGB (Tanner Helland fit) + presets
│   │   ├── duotone.ts                    # Luma→two-color-ramp LUT + in-place apply
│   │   ├── paint-mix.ts                  # Subtractive-approx paint recipe solver
│   │   ├── collections.ts                # 259 curated palette collections
│   │   ├── palette-packs.ts              # 7 product pack definitions + metadata
│   │   ├── guides.ts                     # 317 SEO landing guides
│   │   ├── newsletter-issues.ts          # Newsletter data helpers + tagToSlug.
│   │   │                                 # Publishes ONLY on status === "published".
│   │   │                                 # `date` is a scheduling slot and publishes
│   │   │                                 # nothing: 292 issues dated to 2033 were
│   │   │                                 # queued to go live by themselves, and GSC
│   │   │                                 # shows 0 clicks / 0 impressions for every
│   │   │                                 # year cohort of them (checked 2026-08-18)
│   │   ├── newsletter-date.ts            # issuePublishedAt / issueUpdatedAt.
│   │   │                                 # NO data import — client components use it,
│   │   │                                 # so it must not pull the issue dataset in
│   │   ├── notes-restored.ts             # 15 previously-public /notes/ URLs served
│   │   │                                 # again. Evidence is Search Console + days
│   │   │                                 # public — NOT pageview referrals, which put
│   │   │                                 # 8 wrong entries here on bot traffic once.
│   │   │                                 # Guarded by notes-restored.test.ts
│   │   ├── format-money.ts               # The one money formatter. Takes MINOR units.
│   │   │                                 # Replaced three near-copies that each divided
│   │   │                                 # a major-unit figure by 100 ($3.47 -> $0.03)
│   │   ├── i18n.ts                       # EN/ZH translations (~710+ keys)
│   │   ├── palette-builder.ts            # localStorage palette + subscriptions,
│   │   │                                 # Tailwind/Figma/StyleDict exports, naming
│   │   ├── favorites.ts                  # localStorage favorites + subscriptions
│   │   ├── recent-colors.ts              # localStorage recent history
│   │   ├── pinterest.ts                  # Pinterest OAuth + API proxy helpers
│   │   ├── checkout-config.ts            # THE source of truth for every price on the site. Lemon
│   │   │                                 #   Squeezy checkout + Pro pricing (¥499/¥3,999/¥19,999)
│   │   │                                 #   + the closed Auditor pre-order. Guarded by
│   │   │                                 #   src/lib/__tests__/price-copy.test.ts.
│   │   ├── plan-limits.ts                # Free-tier numbers the UI states out loud. /projects said
│   │   │                                 #   "n/5 free" while the server refused the 4th. Pinned to
│   │   │                                 #   the server constant by plan-limits.test.ts.
│   │   ├── pro-gate-policy.ts            # Pure: when the export gate locks, when a click costs
│   │   │                                 #   a credit. Unknown entitlement never locks and never
│   │   │                                 #   charges — a failed session request is not an
│   │   │                                 #   anonymous customer (2026-07-20 incident shape).
│   │   ├── auth-client.ts               # Client API: session, projects, usage, referral, types
│   │   ├── track.ts                      # Fire-and-forget events → backend /events + PostHog; merges first-touch attribution; a REFUSED sendBeacon (returns false, never throws) retries over keepalive fetch and what still cannot be delivered is counted into `_dropped` on the next successful event
│   │   ├── clipboard.ts                  # The ONLY clipboard write path. Returns {ok} | {ok:false, reason}
│   │   │                                 #   instead of throwing, so copy-button.tsx and
│   │   │                                 #   copy-action-button.tsx can emit `color_copy_failed`.
│   │   │                                 #   Before 2026-08-25 both swallowed failures in an empty
│   │   │                                 #   catch, so `color_copied` could not tell "nobody wanted
│   │   │                                 #   it" from "the browser refused" — and embedded webviews
│   │   │                                 #   (IG/X/LINE), which have no clipboard API, are exactly
│   │   │                                 #   the traffic /word-to-color/ receives. Deliberately has
│   │   │                                 #   NO execCommand fallback: repairing the copy would
│   │   │                                 #   destroy the measurement being taken. `reason` is a
│   │   │                                 #   closed set — never widen it to err.message.
│   │   ├── attribution.ts                # First-touch UTM/referrer/landing (localStorage) → derived `channel` bucket; eager capture
│   │   ├── posthog.ts                    # PostHog product-analytics singleton (cookieless, no-op w/o key); phRegister super-props
│   │   ├── session-id.ts                 # Ephemeral per-tab id (sessionStorage `ca_sid`) → the
│   │   │                                 #   previously-always-NULL events.session_id column, so
│   │   │                                 #   analytics ratios are per VISIT. Deliberately NOT a
│   │   │                                 #   persistent identifier. Disclosed in /cookie-policy/.
│   │   ├── experiment.ts                 # 50/50 arm assignment (`ca_w1_v1`, localStorage — same
│   │   │                                 #   lifetime as `ca_attr_v1` so arm and landing page
│   │   │                                 #   cannot disagree). Reports `persisted:false` for
│   │   │                                 #   browsers that re-roll. Disclosed in /cookie-policy/.
│   │   ├── guide-seed-word.ts            # Guide → prefill word for the W1 card. 278/333 use the
│   │   │                                 #   guide's own subject tag, 55 fall back to a curated
│   │   │                                 #   seed. SERVER-ONLY (its caller needs guides.ts).
│   │   ├── use-impression.ts             # useImpression() — fires once per page view when an
│   │   │                                 #   element is 50% visible for 1 continuous SECOND. The
│   │   │                                 #   exposure denominator for the AI gate. Re-observes on
│   │   │                                 #   pathname change (client-side nav reuses the node, so
│   │   │                                 #   without that only the first page of a session counts).
│   │   ├── brand-palette.ts             # Single-hex → 11-step design system + semantic colors
│   │   ├── color-relationships.ts       # Color relationships (analogous, complementary, triadic, tonal)
│   │   ├── color-contrast.ts            # WCAG contrast ratio + relative luminance
│   │   ├── color-of-day.ts              # Deterministic daily color selection (v2: golden-angle hue rotation, integer-exact across Node/TS/Swift)
│   │   ├── license-tiers.ts             # License tier definitions
│   │   ├── color-family-pages.ts         # Color family page slug/metadata
│   │   ├── colorblind.ts                 # Viénot (1999) color blindness simulation matrices
│   │   ├── combinations.ts               # 30+ curated color combinations (complementary, analogous, triadic, monochromatic, neutral+accent)
│   │   ├── brand-palettes.ts             # 51 famous-brand palettes across 9 categories (Apple/Google/Notion/Stripe/Anthropic/OpenAI/HuggingFace/Adobe/Canva/Webflow/Framer/Sephora/Lululemon/Patagonia/Glossier/Aesop/Uniqlo/Disney+/PlayStation/Nintendo/Douyin/Xiaohongshu/Bilibili/Zhihu/JD/Taobao/Meituan/Didi/Alipay/Cloudflare/etc.) for programmatic SEO
│   │   ├── region-palettes.ts            # 18 region/culture palettes across 6 continents (Japan/Morocco/Greece/Italy/Mexico/India/Scandinavia/China/Korea/Egypt/Iceland/Vietnam/France-Paris/Brazil/Turkey-Istanbul/England-London/Ireland/Australia) with named pigment sources + cultural context
│   │   ├── color-region-matches.ts       # Reverse index: given any hex, find region-catalog colors within distance threshold
│   │   ├── color-origins.ts              # 10 family heritage articles (Heritage / Cultures / In the wild / How it reads) + per-color modifier prose generator
│   │   ├── color-journal.ts              # Daily check-in (localStorage): one entry/day, streak calc, subscribe pattern, calendar grid generator
│   │   ├── color-brand-matches.ts        # Reverse index: given any hex, find brand-catalog colors within distance threshold (used by every color detail page)
│   │   ├── export-watermark.ts           # SVG watermark helper (Free/anon get "colorarchive.org" stamp on exports; Pro is clean)
│   ├── app-store.ts                  # APP_STORE_URL + listing facts; URL verified live 2026-09-05 (200 → /us/app/colorarchive-color-tools/id6761363087)
│   └── word-color.ts                 # Deterministic word→color hash
│   │
│   └── types/
│       └── color.ts                      # ColorRecord, ColorFamily, SortOption
│
├── server/                               # Express backend — DO Droplet
│   ├── index.js                          # Entry point, routes registration
│   ├── email.js                          # Resend email functions (13 types incl. Pro upsell,
│   │                                     #   pre-order reserve + pre-order purchase confirmation)
│   ├── email-scheduler.js                # Hourly cron: Day-3/7/14/21/30 follow-ups + COTD + A/B.
│   │                                     #   Day 3/7/14/30 are RETIRED behind PACK_MAILS_ENABLED
│   │                                     #   (they sell deleted packs). Day 21 is kept — it sells
│   │                                     #   nothing and is the useful one.
│   ├── db.js                             # SQLite setup (subscribers, orders, sessions, users,
│   │                                     #   projects, ai_usage, user_preferences)
│   ├── auth.js                           # Magic link + Google OAuth auth, tier management
│   ├── catalog.js                        # Pack catalog data. NOTE: packPath points at /packs/*,
│   │                                     #   which 301s to /pro/ — the storefront was deleted in
│   │                                     #   00d7a04. Fulfilment (downloadPath) still works.
│   ├── entitlement.js                    # Pure: what a subscription lifecycle event does to a
│   │                                     #   user's tier and clock. LS "cancelled" means "will not
│   │                                     #   renew", NOT "access ends now"; both webhook paths used
│   │                                     #   to revoke immediately. Never returns pro + NULL clock.
│   ├── pricing.js                        # Pro prices for the CommonJS side, mirrored from
│   │                                     #   src/lib/checkout-config.ts and pinned to it by
│   │                                     #   price-copy.test.ts. Never type a price into email.js.
│   ├── colors.js                         # Server-side 3,066 color generation (mirrors client)
│   ├── ai-rate-limit.js                  # AI rate limiting middleware (anon 3/day, free 10/day,
│   │                                     #   pro unlimited, credit consumption)
│   ├── api-rate-limit.js                 # API rate limiting middleware (60/1k/10k per hour)
│   ├── client-ip.js                      # getClientIp / getRateLimitKey / isLoopbackIp. Shared by
│   │                                     #   EVERY rate limiter + /ai/usage. IPv6 keyed by /64 so a
│   │                                     #   suffix rotation can't mint buckets. Read the header
│   │                                     #   comment before touching: from 2026-04 to 07-26 nginx
│   │                                     #   omitted X-Forwarded-For and every per-IP limit here
│   │                                     #   collapsed into ONE global bucket.
│   ├── ai-budget.js                      # Global daily Gemini spend breaker ($0.50/day, cost
│   │                                     #   RESERVED before the call so concurrency can't outrun
│   │                                     #   it) + recordModelOutcome/modelHealth → /health aiModel
│   ├── bot-detect.js                     # Bot filter for the analytics WRITE path only. Two
│   │                                     #   independent filters: UA match (22.5% of pageview
│   │                                     #   writes) + 300/day/caller cap (the UA-invisible half).
│   │                                     #   ~31% of writes were never human. NEVER mount on a
│   │                                     #   money or account route.
│   ├── session-denominator.js            # The denominator every ratio on this site should use:
│   │                                     #   distinct VISITS from `events`, not rows from
│   │                                     #   `pageviews`. Documents the two dates that make a naive
│   │                                     #   session count lie — session_id starts 2026-07-26, and
│   │                                     #   /guides/ stopped emitting a read-only event 2026-08-10
│   │                                     #   (e401e0f), which drops guide sessions ~90% with no
│   │                                     #   change in readership. windowCaveats() prints both.
│   ├── deploy/
│   │   └── nginx-colorarchive.conf       # The live nginx site config, in git. It was NOT in git,
│   │                                     #   which is how a four-month outage went unnoticed.
│   ├── ssrf-guard.js                     # assertSafeUrl() — blocks private/loopback/link-local/
│   │                                     #   metadata IPs (v4+v6) for /ai/analyze-url
│   ├── ig-scheduler.js                   # Instagram auto-posting scheduler
│   ├── ig-image-generator.js             # Instagram image generation
│   └── routes/
│       ├── subscribe.js                  # POST /subscribe — email capture + referral tracking
│       │                                 #   (per-IP rate limited; welcome mail only on first insert;
│       │                                 #   source='preorder' → reserve mail, no COTD opt-in)
│       ├── webhook.js                    # Internal webhooks from Next.js /api/webhook (LS forwarder):
│       │                                 #   /webhooks/order-completed (packs + Auditor pre-order w/
│       │                                 #   is_test + attribution), /subscription-checkout (Pro/lifetime)
│       ├── auth.js                       # Magic link + Google OAuth + session (with tier)
│       ├── me.js                         # GET /me, /me/usage, /me/referral, /me/api-key,
│       │                                 #   /me/preferences, /me/orders
│       ├── projects.js                   # CRUD /projects + GET /projects/shared/:id
│       ├── ai.js                         # POST /ai/brand-palette, /ai/mood-palette,
│       │                                 #   /ai/name-color, /ai/critique, /ai/analyze-url,
│       │                                 #   GET /ai/usage (public, includes anonymous IP-tracked quota)
│       ├── admin.js                      # GET /admin/* — orders dashboard
│       ├── analytics.js                  # GET /analytics/* — internal stats; /analytics/gate =
│       │                                 #   exit-gate funnel (is_test-filtered; orders.preorder is the
│       │                                 #   PROCEED criterion; emailReserves secondary signal).
│       │                                 #   Denominators are VISITS from events, never pageviews.
│       ├── pageviews.js                  # POST /pageviews — page tracking
│       ├── og.js                         # GET /og — OG image generation
│       └── instagram.js                  # Instagram API (OAuth, publish, media feed)
│   └── scripts/                          # Operational scripts (run on droplet via cron / manually)
│       ├── gate-report.cjs               # Weekly report → owner email (cron Mon 09:00 UTC).
│       │                                 #   2026-07-26: repurposed from the cancelled Auditor
│       │                                 #   exit-gate to the AI kill-gate; requires computeAiGate
│       │                                 #   from ai-gate-report.cjs (ONE decision rule, not two)
│       ├── ai-gate-report.cjs            # AI kill-gate (dev-plan-2026-07-26-ai §8). CLI + module.
│       │                                 #   Wilson interval + a one-sided binomial DELETE band so
│       │                                 #   LOW USAGE CAN FAIL THE GATE (n=150 → ≤1 click deletes).
│       │                                 #   Earlier drafts made sample size a precondition, which
│       │                                 #   made the gate unfalsifiable.
│       ├── conversion-digest.cjs         # Daily money/funnel digest (cron 08:00 UTC); silent on
│       │                                 #   dead days except a Monday heartbeat. Funnel steps are
│       │                                 #   counted per VISIT, with raw event rows alongside.
│       ├── fix-order-attribution.cjs     # One-off: Gumroad's 100x amount bug, and the 6 of 8 order
│       │                                 #   rows that are the owner's own addresses. --apply to write
│       ├── send-interview-invites.cjs    # §4 interview invitations. Two letters (customer vs
│       │                                 #   subscriber); dry-run by default; ledger prevents repeats
│       ├── send-design-notes.cjs         # Weekly Design Notes sender — approved-only, per-recipient
│       │                                 #   delivery ledger so a crash resumes
│       ├── verify-preorder.cjs           # Repeatable integration check for the pre-order loop
│       │                                 #   (order-completed + gate + /subscribe; self-cleans)
│       └── send-preorder-broadcast.cjs   # Manual pre-order announcement to subscribers
│                                         #   (dry-run by default; --send; CAN-SPAM unsubscribe)
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
- **Day 0** — Free pack download link (`sendFreePackEmail`). The ¥2,799 All Access Bundle
  upsell was removed 2026-08-18: it quoted a price for a deleted SKU to *every* new subscriber.
- **Day 3** — 🚫 RETIRED — CSS tokens + Dark Mode UI Kit upsell (prices deleted packs)
- **Day 7** — 🚫 RETIRED — full catalog overview, 7 pack prices (all deleted)
- **Day 14** — 🚫 RETIRED — 10% code `FIRSTPACK` on deleted packs
- **Day 21** — **Kept** — three concrete things to build with a palette. Sells nothing; its
  stray `/packs/` link now points at `/pro/`.
- **Day 30** — 🚫 RETIRED — Complete Archive pitch (deleted product; also claimed "2016 colors")

> **Why four are retired (2026-08-18).** Commit `00d7a04` deleted the pack storefront and
> left a 301 from `/packs/*` to `/pro/`. These three mails still quoted prices — and
> disagreed with each other about them (Palette Pack Vol. 1 was ¥599 on day 3/7 and ¥499
> on day 14). A recipient was quoted a number, clicked "View pack →", and landed on a page
> selling a ¥499/mo subscription. Same rule that closed the Auditor pre-order: **a sell
> surface must not outlive the thing it sells.** `00d7a04` already migrated this product to
> a pure subscription; these mails were the leftover nobody switched off. Flip
> `PACK_MAILS_ENABLED` in `email-scheduler.js` to bring all four back unchanged.
> **Fulfilment is unaffected**: past buyers' downloads are static files.
- **On AI limit hit** — Pro upsell email (max 1/day per user)
- **Daily** — Color of the Day (COTD) for opted-in subscribers

Each follow-up uses A/B subject-line variants (deterministic hash on email). Variant assignment stored in `ab_variant` column; per-stage variant tracked in `follow_up_Xd_variant`.

### Pro Subscription & Monetization
- **Tier system**: anonymous (3 AI/day) → free (10 AI/day, 3 projects) → Pro (unlimited)
- **ProGate**: 20 export gates across 9 components (token generator, WCAG audit, image palette,
  palette builder/preview, collections, brand generator). All 20 read the single AuthProvider
  session; the lock/charge decision is `src/lib/pro-gate-policy.ts`. The word-to-color paywall and
  the three SVG-watermark call sites use the same module — the paywall previously ran its own
  `fetchSession()` raced against a 4s timeout and armed against Pro on a slow connection, and the
  watermark branded a subscriber's file if they exported before the session resolved.
- **One expiry rule, server-side**: `users.tier` is a cached column only a webhook writes, so a
  read path that does not compare it against `pro_expires_at` will hand out stale access.
  `server/entitlement.js` `effectiveTier()` is that comparison; `auth.js` and `api-rate-limit.js`
  both call it, because they used to answer differently — the same lapsed account could be free
  on the web and Pro on the API.
- **The rule that governs every paid gate**: *"I don't know yet" is not "no."* Until entitlement
  is genuinely known — not loading, not errored — a gate neither locks nor charges. Deliberately
  generous while the backend is unreachable, because the cost is not symmetric: over-serving a
  stranger costs a few files, blocking a subscriber costs the subscriber (2026-07-20).
- **Refund terms** live in `refundPolicy` (checkout-config). `/support` and the 特定商取引法
  disclosure both derive from it — they used to contradict each other (7-day guarantee vs
  "digital goods are non-refundable"), which `price-copy.test.ts` now prevents.
- **Cancellation ≠ expiry**: Lemon Squeezy `cancelled` means "will not renew"; access continues
  to `ends_at`, and LS sends `subscription_expired` when it truly ends. `server/entitlement.js`
  owns that distinction and both webhook paths share it, since LS fires them in no fixed order.
  /support and /account both promise the customer exactly this in writing.
- **Referral credits**: +5 AI credits per referred signup, credits consumed before tier limits
- **API tiering**: 60/hr (anonymous) → 1,000/hr (free key) → 10,000/hr (Pro key) —
  ⚠️ **defined but NOT mounted.** `apiRateLimit` in `server/api-rate-limit.js` is exported and
  never used by any route (verified 2026-08-19), so no request is tier-limited today. This line
  described it as a live control for months. Treat it as a capability, not a guarantee.
- **Upgrade triggers**: 429 rate limit → modal + email; ProGate lock → /pro link

---

## Content Counts (as of 2026-06-15)

> **2026-06-15 WTP batch** (`src/components/word-color-generator-page.tsx`,
> `cotd-subscribe-form.tsx`):
> - **Word-to-color free-preview paywall (LIVE)** — after 5 distinct user-typed words,
>   the generated palette + exports gate behind a `/pro/` CTA + an email-unlock escape
>   hatch (`CotdSubscribeForm` gained an `onSuccess` callback; unlock persists in
>   `localStorage`). Client-side & counts only NEW words, so the initial `?q=`/default
>   word, shared links, crawlers, and the 474 static `[word]` pages are unaffected
>   (SEO-safe). Toggle via `WORD_PAYWALL_ENABLED` / `FREE_GENERATIONS` constants. Fires
>   `word_paywall_hit` / `word_paywall_pro_click` / `word_paywall_email_unlock`.
> - **$49 pre-order enablement kit**: `docs/preorder-ls-setup-2026-06-15.md` (LS product
>   + `NEXT_PUBLIC_PREORDER_CHECKOUT_URL` + verify + how to read the signal). Code side
>   was already done; only the LS-account step remains for the owner.
> - Measured: first-party funnel had **0 preorder events / 0 reservations** since the
>   06-14 launch — pipeline is healthy (~800–1000 PV/day), but `/preorder/` simply has no
>   traffic yet. The paywall + posting the distribution drafts are what feed it.

> **2026-06-14 SEO/exposure batch** (`src/lib/color-guide-links.ts`, `guide-seo.ts`,
> `word-to-color-seeds.ts`, `og-card.tsx`, `scripts/indexnow-ping.mjs`):
> - **Color pages now link out to 3 relevant guides each** (was 0) — internal-link
>   authority to push page-2 guides up.
> - **474 static per-word pages** at `/word-to-color/[word]/` (+ dynamic OG), linked
>   from a hub on the generator index, targeting the site's #1 query family.
> - **Guide FAQ + query-optimized titles** for the top ~12 guides (FAQPage JSON-LD).
> - **Guide slugs deduped** at module load (`guides.ts` tail) — 31 dead duplicate
>   objects (21 colliding slugs) dropped; build-time warn guards regressions.
> - **Dynamic OG** added for word-to-color, brands, regions, families (color/guide/
>   collection already had it). **IndexNow** auto-pings Bing/ChatGPT on prod deploy.
> - Hero color-of-the-day fixed to use canonical `getColorOfDay()`.
> - **Backlink engine**: static HTML color-badge (`src/components/embed-badge-button.tsx`)
>   on every color page + the embed landing; fixed the broken widget attribution link;
>   `/embed/embed-code/` now in sitemap + footer (was an orphan). CWV pass: Sentry Replay
>   off, gtag lazyOnload, stale PH banner off.
> - **Conversion**: removed a fabricated Pro testimonial (→ honest trust row); `¥`→`JP¥`
>   on /pro/ + upgrade modal (RMB-misread fix); email capture on the /word-to-color/
>   dead-end (`CotdSubscribeForm` gained `source`/`heading` props). Open decisions for the
>   owner: reconcile `priceUsd` vs JPY in checkout-config + run a real WTP test
>   (see docs/human-todo.md).
> - **WTP experiment**: `/preorder/` landing (`src/components/preorder-page.tsx`,
>   `preorderConfig` in checkout-config) — pre-order the "Accessibility Auditor" Pro feature
>   ($49 founder). Card-required when `NEXT_PUBLIC_PREORDER_CHECKOUT_URL` is set; email
>   fallback otherwise. noindex (time-boxed). Fires `preorder_*` funnel events. Entry points:
>   `/pro/` + contextual `AuditorPreorderCta` on `/palette-audit/` and `/wcag-audit/`
>   (tracked via `preorder_cta_click {from}` for source attribution).

> Counts verified 2026-08-31. They drift every time autopilot adds content — regenerate with:
> `npx esbuild <entry>.ts --bundle --platform=node --format=cjs --alias:@=$PWD --outfile=/tmp/c.cjs && node /tmp/c.cjs`
> importing `landingGuides` / `collections` / `colors` and printing `.length` (vitest cannot load these here).

| Content | Count |
|---------|-------|
| Colors | 5,446 (5,376 chromatic + 70 neutral grays) |
| Word-to-color pages | 474 static (`/word-to-color/[word]/`) |
| Saturation bands | 6 (Faint 10%, Muted 18%, Soft 34%, Clear 54%, Vivid 74%, Pure 92%) |
| Neutral groups | 3 (Warm Gray, Cool Gray, True Gray) |
| Collections | 261 |
| Palette packs | 7 (USD $9–$129) |
| SEO guides | 333 (364 authored, 31 dropped by the duplicate-slug dedupe in guides.ts) |
| Newsletter issues | 350 |
| Color families | 9 |
| Industry use cases | 10 (saas-tech, healthcare, luxury, food, finance, education, creative, sustainability, beauty, nonprofit) |
| Tool pages | 33+ (converter, contrast, spectrum, word-to-color, palette-generator, gradient, harmonies, compare, colorblind, tints, mixer, combinations, brand-generator, mood-palette, color-quiz, image-palette, identify, preview, mesh-gradient, wcag-audit, tokens, analyze, name, screen-test ×3, tailwind-colors, css-filter, color-wheel, color-temperature, dark-mode-colors, duotone, paint-mix) |
| AI endpoints | 5 (brand-palette, mood-palette, name-color, critique, analyze-url) |
| i18n keys | 931 (EN/ZH) |
