---
title: "How We Generated 3,066 Colors Algorithmically — No Database Needed"
published: false
description: "A deep dive into how ColorArchive generates a complete color system from three simple arrays using HSL math, human-readable naming, and zero external storage."
tags: [color, design, nextjs, webdev]
---

Most color tools ship with a hand-picked palette of a few hundred swatches stored in a database or JSON file. We took a different approach with [ColorArchive](https://colorarchive.org): every single color is generated at build time from three small arrays and some HSL math. No database, no API call, no JSON blob checked into the repo. Just code.

Here's how — and what we learned along the way.

## The Problem with Curated Palettes

Manually curating colors doesn't scale. You either end up with too few choices (Material Design's 256 colors leave gaps) or an unstructured dump that's hard to navigate. We wanted something systematic: a color space that's dense enough for real design work but organized so every color has a predictable, human-readable name.

The constraint we set for ourselves: **the entire dataset must be reproducible from a single function call with zero external dependencies.**

## Three Arrays, 3,066 Colors

The system breaks down into three dimensions mapped onto HSL (Hue, Saturation, Lightness):

```typescript
// 36 hue roots — one every 10 degrees around the color wheel
const hueCatalog = [
  { hue: 0,   root: "Crimson" },
  { hue: 10,  root: "Ruby" },
  { hue: 20,  root: "Ember" },
  { hue: 30,  root: "Coral" },
  // ... 32 more, through Garnet (340) and Merlot (350)
];

// 14 lightness bands — poetic names for brightness levels
const lightBands = [
  { label: "Veil",     lightness: 98 },
  { label: "Whisper",  lightness: 94 },
  { label: "Mist",     lightness: 90 },
  { label: "Pearl",    lightness: 84 },
  { label: "Bloom",    lightness: 76 },
  { label: "Silk",     lightness: 68 },
  { label: "Tone",     lightness: 60 },
  { label: "Radiant",  lightness: 54 },
  { label: "Core",     lightness: 48 },
  { label: "Velvet",   lightness: 42 },
  { label: "Dusk",     lightness: 34 },
  { label: "Shadow",   lightness: 28 },
  { label: "Nocturne", lightness: 20 },
  { label: "Ink",      lightness: 14 },
];

// 6 chroma bands — saturation intensity
const chromaBands = [
  { label: "Faint", saturation: 10 },
  { label: "Muted", saturation: 18 },
  { label: "Soft",  saturation: 34 },
  { label: "Clear", saturation: 54 },
  { label: "Vivid", saturation: 74 },
  { label: "Pure",  saturation: 92 },
];
```

The math is straightforward: **36 hues x 14 lightness x 6 chroma = 3,024 chromatic colors**. We add 42 neutral grays (3 gray roots x 14 lightness bands, no chroma suffix) to reach **3,066 total**.

## The Generator Function

The entire dataset is created by a single `flatMap` call:

```typescript
const chromatic = hueCatalog.flatMap(({ hue, root }) =>
  toneCatalog.map(({ suffix, saturation, lightness }) => {
    const name = `${root} ${suffix}`;
    const rgb = hslToRgb(hue, saturation, lightness);

    return {
      id: createColorId(name),  // "amber-pearl-muted"
      name,                      // "Amber Pearl Muted"
      hex: rgbToHex(rgb),
      rgb: formatRgb(rgb),
      hsl: formatHsl(hue, saturation, lightness),
      hue,
      saturation,
      lightness,
      family: getColorFamily(hue),
    };
  })
);
```

Every color gets a deterministic ID derived from its name: `amber-pearl-muted`, `cobalt-shadow-vivid`, `emerald-bloom-clear`. The naming convention means you can guess a color's ID without looking it up — if you know the root, lightness band, and chroma band, you know the ID.

## Why HSL Instead of LCH or OKLCH?

We considered perceptually uniform color spaces like OKLCH. They produce more visually consistent results across hues, and they're the future of CSS color. But we chose HSL for pragmatic reasons:

1. **Universal browser support.** HSL works everywhere today without polyfills.
2. **Simpler mental model.** Designers intuitively understand "rotate the hue wheel, slide lightness up/down, adjust saturation." The three-dimensional grid maps cleanly onto three HSL parameters.
3. **Predictable IDs.** Since each axis is independent, you can mentally construct any color in the system.

The tradeoff is that some hues (especially yellows and cyans) appear perceptually brighter than others at the same lightness value. We accepted this because the naming system — Veil through Ink, Faint through Pure — gives designers enough vocabulary to find what they need regardless.

## Static Generation at Scale

Since every color is deterministic, we use Next.js `generateStaticParams()` to pre-render all 3,066 color detail pages at build time:

```typescript
export function generateStaticParams() {
  return colors.map((color) => ({ slug: color.id }));
}
```

This means every color page — with its hex/RGB/HSL values, export snippets, related colors, and accessibility contrast ratios — is a static HTML file served from the CDN. No server-side rendering, no database queries at runtime. The build takes a few minutes, but pages load instantly.

## What This Unlocks

Once your colors are algorithmic, interesting things become possible:

- **Relationships are computable.** Analogous colors are adjacent hue roots. Complementary colors are 180 degrees away. Tonal companions share lightness and chroma but vary in hue. All of this is just math on the same arrays.
- **Export formats are trivial.** Generating CSS custom properties, Tailwind config objects, Figma design tokens, SwiftUI `Color()` calls, or Jetpack Compose values is just a different `map()` over the same dataset.
- **Collections are lightweight.** Our 255+ curated collections are just arrays of color IDs. The actual color data is always derived, never duplicated.
- **Search is instant.** Filtering 3,066 records in memory is fast enough that we don't need a search server. Filter by family, lightness range, or chroma — it's all client-side array operations.

## Lessons Learned

**Naming is the hardest part.** We iterated on the lightness band names more than anything else. Early versions used generic labels like "Light" and "Dark." The poetic names (Veil, Whisper, Nocturne, Ink) turned out to matter for usability — designers remember "Cobalt Nocturne Vivid" far more easily than "Cobalt L20 S74."

**Don't underestimate the grid.** 36 x 14 x 6 sounds small, but 3,066 colors with individual pages, plus hundreds of guides and collections built on top, means your build pipeline and page architecture need to be solid from day one.

**Algorithmic doesn't mean cold.** We were worried a generated color system would feel mechanical. Adding the curated layer on top — editorial collections, design guides, palette packs — brings the warmth. The algorithm handles the grunt work; human taste handles the curation.

## Try It Out

ColorArchive is free to browse, no signup required. Explore the full spectrum, grab export snippets for your stack, or build palettes with the interactive tools.

Check it out at [colorarchive.org](https://colorarchive.org).
