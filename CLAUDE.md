# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start development server
npm run build      # Build static export to out/
npm run typecheck  # Run TypeScript type checking (no emit)
```

There is no test suite. Use `typecheck` to validate changes.

## Architecture

**ColorArchive** is a fully static Next.js app (App Router, static export) deployed to GitHub Pages. It has no backend — all logic runs client-side.

### Data & Core Logic

- `src/data/colors.ts` — Generates all 2016 colors algorithmically (hue roots × lightness bands × chroma bands). Never stored externally.
- `src/lib/color-utils.ts` — Pure functions for HSL↔RGB↔HEX conversion, color family classification, filtering, sorting, and finding color relationships (analogous, complementary, tonal companions).
- `src/types/color.ts` — Core `ColorRecord` interface and enums (`ColorFamily`, `SortOption`).

### Page & Component Pattern

Pages in `app/` are Next.js Server Components. Each page imports a corresponding `*-page.tsx` component from `src/components/` that holds the actual UI and is marked `"use client"`. This keeps the App Router data/metadata layer separate from interactive client logic.

Dynamic routes (e.g., `app/colors/[slug]/page.tsx`) use `generateStaticParams()` to pre-render all 2016 color pages at build time.

### Persistence (localStorage)

`src/lib/favorites.ts` and `src/lib/recent-colors.ts` manage browser localStorage. Both use a subscription pattern (`subscribeTo*()` returns an unsubscribe function) with custom events for cross-component reactivity and `StorageEvent` for cross-tab sync.

### Content / Commerce

- `src/lib/collections.ts` — 5 curated palette collections (editorial metadata + color IDs).
- `src/lib/palette-packs.ts` — 3 product pack definitions (audience, deliverables, FAQ, proof points).
- `src/lib/checkout-config.ts` — Checkout provider + URL placeholders (Lemon Squeezy / Stripe). This is where to update commerce config when integrating a real payment provider.
- `src/lib/word-color.ts` — Deterministic word→color hash algorithm (string hash → hue/saturation/lightness → 5 color variants).

### Styling

Tailwind CSS 4 with utility-first classes. Key design patterns:
- Frosted glass panels via backdrop blur utilities
- Inset `swatch-shadow` class defined in `app/globals.css` for color card depth
- `sm:` and `lg:` breakpoints for responsive layout

### Static Export Notes

`next.config.ts` sets `output: "export"` and `trailingSlash: true`. Next.js image optimization is disabled (`unoptimized: true`). The built site goes to `out/` and is deployed via `.github/workflows/deploy-pages.yml` on push to `main`.

## Session Coordination (Autopilot ↔ Remote Control)

This repo uses **two concurrent Claude Code session types** that must not run simultaneously:
- **Autopilot**: Automated scheduled runs (prefixed `[autopilot]`)
- **Remote Control**: Human-driven interactive sessions

Coordination uses `.claude/session-lock.json`. **Every session MUST follow this protocol:**

### Before starting any work

1. Read `.claude/session-lock.json`
2. If `active` is not `null` and `lockedBy` is a different session type → **STOP. Do not proceed.** Print a message like: "⏸ Session locked by {lockedBy} since {lockedAt}. Waiting." and exit without making changes.
3. If `active` is `null` → acquire the lock by writing your session type.

### Acquiring the lock

Write `.claude/session-lock.json` with:
```json
{
  "active": true,
  "lockedBy": "autopilot" or "remote",
  "lockedAt": "<ISO timestamp>",
  "message": "<brief description of what you're doing>"
}
```

### Releasing the lock — AUTOMATIC

**Every session MUST automatically release the lock after its final commit+push.** This is not optional — do it immediately after pushing, before ending the session. Reset `.claude/session-lock.json` to:
```json
{
  "active": null,
  "lockedBy": null,
  "lockedAt": null,
  "message": null
}
```
Then commit and push this file together with your work, or as a separate small commit right after.

### Rules by session type

**Autopilot sessions:**
- MUST check the lock FIRST before doing anything
- If locked by "remote" → do nothing, exit gracefully, make zero changes
- When starting, write lock with `"lockedBy": "autopilot"` and `"message"` describing the planned run
- After commit+push → **automatically** release the lock (write null values + commit+push)

**Remote Control sessions:**
- MUST check the lock FIRST before doing anything
- If locked by "autopilot" → inform user: "⚠️ Autopilot is currently running: {message}. Please wait for it to finish or manually clear `.claude/session-lock.json`."
- When starting, write lock with `"lockedBy": "remote"`
- After commit+push → **automatically** release the lock (write null values + commit+push)
