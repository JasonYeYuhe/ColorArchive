# Backlink / distribution drafts — 2026-06-14

> Ready-to-post drafts to seed backlinks for the new embed widgets + word-to-color
> pages. Code side (badge engine, fixed attribution link, discoverable embed page)
> shipped 2026-06-14. These are the human/autopilot side. Post 1 per day-ish to
> avoid same-link spam filters. Always disclose you're the maker where the sub
> requires it.

---

## 1. Dev.to / Hashnode article (technical, evergreen — strongest durable backlink)

**Title:** I built a free, embeddable color widget (and a 5,446-color archive) — here's how the embed works

**Tags:** webdev, css, design, showdev

**Body outline:**
- The itch: needed named, consistent colors + a way to drop a live color reference into docs/blogs.
- The archive: 5,446 algorithmically-named colors (48 hue roots × 14 lightness × 8 chroma + neutrals), every page with hex/RGB/HSL/CMYK + WCAG contrast.
- The embed: two options — an interactive iframe widget, and a **zero-JS HTML color badge** you paste anywhere. Show the badge `<a>` snippet (it's a real, styled link).
- Bonus: word-to-color (deterministic word → hex), e.g. link to `/word-to-color/ocean/`.
- Links (do-follow): https://colorarchive.org/embed/embed-code/ , https://colorarchive.org/word-to-color/ , https://colorarchive.org/all-colors/
- Honest maker note at the end.

## 2. Show HN

**Title:** Show HN: ColorArchive – 5,446 named colors, word-to-color, and an embeddable color badge

**Text:** A free color reference: every color has a page with hex/RGB/HSL/CMYK + WCAG contrast, plus a deterministic word→color tool and a paste-anywhere HTML color badge. No signup. Feedback welcome — especially on the embed formats. https://colorarchive.org/

## 3. Reddit — r/web_design or r/webdev (value-first, disclose maker)

> Check each sub's self-promo rules; lead with the useful thing, not the pitch.

**Title:** A free HTML color badge you can paste into a blog/README (no JS, no iframe)

**Body:** Short — describe the badge (real `<a>` link, inline styles, renders anywhere), link the embed page (https://colorarchive.org/embed/embed-code/), mention the 5,446-color archive + word-to-color. "I built this — happy to take feedback on the formats."

## 4. Pinterest (autopilot already posts here)

- Pin the per-word color pages + collections with the dynamic OG images (now live for word-to-color/brands/regions/stories/use-cases). Each pin → a backlink + referral.

## 5. Free-tool / widget directories (submit once each — durable backlinks)

- alternativeto.net (already partially done — see project memory)
- saashub.com (done per memory; ensure embed/widget mentioned)
- There's-an-AI-for-that / free-for-dev style lists, "awesome-design-tools" GitHub lists (PR to add ColorArchive under color tools)
- CSS/!-design galleries that accept tool submissions

## Future code extensions (not yet built)
- Palette embed badge on collection detail pages + the word-to-color generator (more
  embeddable surface than single colors). Builder already exists:
  `buildPaletteBadgeHtml` in `src/components/embed-badge-button.tsx`.
