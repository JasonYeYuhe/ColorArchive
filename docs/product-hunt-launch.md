# Product Hunt Launch — ColorArchive

Last updated: 2026-03-20

## Tagline (≤60 chars)

> 2,016 curated colors with ready-to-use design tokens

## Description (≤260 chars)

> A calm, searchable color archive with 2,016 curated shades. Browse by family, build palettes, check WCAG contrast, and export production-ready tokens for Figma, CSS, Tailwind, and Style Dictionary. Free sample pack included.

## First Comment (Maker Story)

Hi Product Hunt! I built ColorArchive because I got tired of copying hex values from random generators into half-broken token files.

ColorArchive is a library of 2,016 algorithmically generated colors organized by hue family, lightness, and chroma. Every color has a detail page with tonal companions, complementary pairings, and one-click copy for hex, RGB, HSL, and CSS custom properties.

The real product is the token pipeline. Every color exports as CSS variables, Tailwind config, Figma-ready JSON, Style Dictionary tokens, SCSS maps, and more. We also ship curated palette packs — brand starter kits, dark mode UI kits, seasonal collections — as structured downloads you can drop into a design system without reformatting anything.

The entire frontend is a static Next.js site on GitHub Pages with zero backend dependencies for browsing. There's a free sample pack if you want to try the file quality before buying. Would love your feedback on the archive, the tools, and the token exports.

## Gallery Screenshots (prepare these)

1. **Homepage hero** — Full archive grid with spectrum strip and stats bar
2. **Color detail page** — Single color with tonal strip, palette moves, nearest neighbors
3. **Contrast checker** — WCAG AA/AAA live preview with two colors
4. **Collection detail** — Curated palette with editorial note and export preview
5. **Pack detail page** — Product page with deliverables, FAQ, and checkout CTA
6. **Palette Builder** — User-built palette with share URL and export options
7. **Word → Color** — Experimental tool showing generated color from text input
8. **Spectrum Explorer** — Hue × lightness matrix view

## Launch-Day UTM Template

```
?utm_source=producthunt&utm_medium=referral&utm_campaign=launch
```

Apply to all inbound links from PH listing:
- Homepage: `https://colorarchive.me/?utm_source=producthunt&utm_medium=referral&utm_campaign=launch`
- Launch page: `https://colorarchive.me/launch/?utm_source=producthunt&utm_medium=referral&utm_campaign=launch`
- Free pack: `https://colorarchive.me/free-pack/?utm_source=producthunt&utm_medium=referral&utm_campaign=launch`

## Launch-Day Checklist

- [ ] Set `PH_LAUNCH_ACTIVE = true` in `src/components/ph-launch-banner.tsx`
- [ ] Update PH listing URL in the banner component
- [ ] Build and deploy
- [ ] Post first comment on PH
- [ ] Share on X with product link
- [ ] Monitor analytics for PH traffic source
- [ ] After launch week: set `PH_LAUNCH_ACTIVE = false` and redeploy

## Topics / Tags for PH

- Design Tools
- Color
- Developer Tools
- Open Source
- Figma

## Pricing to Highlight

- Free: Browse archive, use tools, download free sample pack
- Packs: ¥99 – ¥1,499
- All Access Bundle: ¥2,799 (32% savings)
