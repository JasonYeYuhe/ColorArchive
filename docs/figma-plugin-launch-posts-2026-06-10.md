# Figma Plugin Launch — manual post drafts (2026-06-10)

> Status: **DRAFTS — not posted.** Jason posts these manually (account trust).
> Plugin: https://www.figma.com/community/plugin/1616829363158218051
> Images ready in `figma-plugin/listing-assets/` (hero / inspect / export 1920×960, IG 1080², Pin 1000×1500).
> Already auto-posted 2026-06-10: X (tweet 2064653503738659311) + Instagram (media 18598880383063302). Pinterest & Facebook blocked on re-auth (see human-todo).

---

## 1. Product Hunt (launch update on the existing ColorArchive page, or standalone launch)

**Name:** ColorArchive for Figma

**Tagline options (pick one, ≤60 chars):**
1. `5,446 curated colors, WCAG checks & brand scales in Figma`
2. `A color library that lives inside Figma & FigJam`
3. `Browse, apply & export 5,446 curated colors in Figma`

**Description (≤260 chars):**
ColorArchive's full library — 5,446 algorithmically curated colors — now inside Figma & FigJam. Search by name/hex/family, apply fills, create paint styles, check WCAG contrast on any layer, generate 30-style brand scales, export CSS/Tailwind/JSON. Free.

**First comment (maker):**
Hey hunters 👋

We just shipped ColorArchive as a Figma plugin. The library is 5,446 colors generated from a 48-hue × 14-lightness × 8-chroma system (plus 70 neutral grays), so every color has consistent siblings — which makes palette work in Figma actually systematic instead of eyedropper-roulette.

What it does:
• Browse/search all 5,446 colors without leaving the canvas
• One-click fills and `ColorArchive/Family/Name` paint styles
• Select any layer → instant WCAG contrast vs white/black with AAA/AA badges
• "Generate Brand Scale" turns one fill into 30 Primary/Neutral/Semantic styles
• Export filtered sets as CSS variables, Tailwind config, or JSON
• Works in FigJam too (fills, export, inspect)

It's free. Pro accounts can sync saved palettes into Figma via API key, but everything above needs no account at all.

Would love feedback — especially on what export formats you'd want next (OKLCH? SwiftUI?).

**Gallery:** use `carousel-1-hero.png`, `carousel-2-inspect.png`, `carousel-3-export.png`.

---

## 2. Indie Hackers (product update post)

**Title:** ColorArchive is now a Figma plugin — 5,446 colors, WCAG checks, brand scales

**Body:**

Shipped a milestone this week: ColorArchive (my curated color library, 5,446 colors) passed Figma's review and is live on Figma Community.

Why a plugin: distribution. The site gets ~100–250 PV/day from SEO, but designers live inside Figma. A Community listing is a discovery surface where the product demos itself — every install is a designer trying the library inside their actual workflow.

The launch version does:
- Browse/search 5,446 colors (48 hues × 14 lightness × 8 chroma + neutrals)
- Apply fills, create paint styles, generate 30-style brand scales from any fill
- WCAG contrast badges for any selected layer
- CSS/Tailwind/JSON export
- FigJam support

Build notes for anyone shipping a Figma plugin:
1. **The plugin UI iframe is a `data:` URL** — `localStorage` always throws. One unguarded access killed our whole UI script and cost us a review cycle. Persist via `figma.clientStorage` (main thread) instead.
2. **Every code publish = a full re-review.** Bundle changes; listing text/images don't re-trigger review.
3. Reviews test FigJam even if your plugin is Design-first — gate editor-specific APIs (`figma.createPaintStyle` doesn't exist in FigJam).

Free plugin, Pro hook is palette sync via API key. UTM-tagged links so I can actually measure install → visit → signup → purchase in PostHog.

Plugin: https://www.figma.com/community/plugin/1616829363158218051

Ask: if you use Figma, an install + honest review helps the Community ranking a lot 🙏

---

## 3. Reddit drafts (Jason posts; do NOT astroturf — disclose it's your product)

**r/FigmaDesign** (flair: Resource/Plugin; disclose maker status)

Title: `I built a free plugin that puts 5,446 curated colors + WCAG contrast checks inside Figma`

Body:
Maker here. ColorArchive started as a web color library; the Figma plugin just passed review. It gives you the full 5,446-color system in the editor: search by name/hex/family, one-click fills and paint styles, WCAG contrast (AAA/AA badges vs white/black) for any selected layer, a 30-style brand-scale generator, and CSS/Tailwind/JSON export. Works in FigJam too. It's free — feedback very welcome, especially missing export formats.
Link: https://www.figma.com/community/plugin/1616829363158218051

**r/web_design or r/UI_Design** (softer angle)

Title: `Free Figma plugin for WCAG-checked color palettes (5,400+ curated colors)`

Body: similar to above, lead with the accessibility angle: instant contrast ratios on selection, AA/AAA badges, "use best text color" one-click fix. Disclose maker status. Link the plugin + colorarchive.org.

---

## 4. Newsletter / weekly roundup mention (for next autopilot roundup)

One-liner to include: "ColorArchive is now on Figma Community — all 5,446 colors, WCAG contrast checks, and brand-scale generation inside Figma & FigJam, free: https://www.figma.com/community/plugin/1616829363158218051"
