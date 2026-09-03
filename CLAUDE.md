# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start development server
npm run build      # Build for Vercel deployment
npm run typecheck  # Run TypeScript type checking (no emit)
```

There IS a test suite — 44 files under `src/lib/__tests__/` and `src/__tests__/`, plus 6 under `server/__tests__/`, run in CI by
`npm test` (`vitest run && npm run test:server`).

**The full run does NOT hang.** Measured 2026-09-03 on Node v26.3.0 / vitest 4.1.0:
`npx vitest run` = **44 files, 779 tests, 2.2s**; `npm run test:server` = **70 tests, 0.16s**.
This paragraph previously said the full run hung on this Mac, and before that the file said there
was no test suite at all — both were wrong, and the second was inherited from the first. If a run
ever does hang, measure it before writing that down again.

```bash
npx vitest run                                              # everything, ~2s
npx vitest run src/lib/__tests__/dark-mode-classes.test.ts  # one file, ~200ms
```

After touching a `.tsx`, run at least `dark-mode-classes`, `copy-counts`, `content-links` and
`retired-routes` — those are real gates that will otherwise fail in CI. `npm run typecheck` is
necessary and not sufficient.

## Architecture

**ColorArchive** is a Next.js app (App Router) deployed to Vercel. Backend API runs on a DigitalOcean Droplet (Express + SQLite).

### Data & Core Logic

- `src/data/colors.ts` — Generates all 5,446 colors algorithmically (48 hue roots × 14 lightness bands × 8 chroma bands + 5 neutral gray groups × 14). Never stored externally.
- `src/lib/color-utils.ts` — Pure functions for HSL↔RGB↔HEX conversion, color family classification, filtering, sorting, and finding color relationships (analogous, complementary, tonal companions).
- `src/types/color.ts` — Core `ColorRecord` interface and enums (`ColorFamily`, `SortOption`).

### Color ID Naming Rules (CRITICAL for collections/guides)

All 5,446 color IDs are generated algorithmically. **Do NOT invent color IDs.** Only use IDs that match these exact patterns:

**Chromatic colors (5,376):** `{root}-{lightness}-{chroma}`
- **48 roots:** Crimson, Scarlet, Ruby, Vermillion, Ember, Tangerine, Coral, Apricot, Saffron, Amber, Canary, Citrine, Honey, Chartreuse, Olive, Lime, Moss, Leaf, Clover, Emerald, Mint, Seafoam, Celadon, Jade, Teal, Lagoon, Cyan, Aqua, Cerulean, Azure, Steel, Sapphire, Cobalt, Indigo, Iris, Amethyst, Violet, Orchid, Plum, Mulberry, Magenta, Fuchsia, Mauve, Peony, Rose, Blush, Garnet, Merlot
- **14 lightness bands:** Veil (98), Whisper (94), Mist (90), Pearl (84), Bloom (76), Silk (68), Tone (60), Radiant (54), Core (48), Velvet (42), Dusk (34), Shadow (28), Nocturne (20), Ink (14)
- **8 chroma bands:** Faint (10), Muted (18), Dust (26), Soft (34), Clear (54), Vivid (74), Bright (84), Pure (92)
- Examples: `amber-pearl-muted`, `cobalt-shadow-vivid`, `steel-bloom-dust`, `scarlet-core-bright`

**Neutral grays (70):** `{root}-{lightness}` — **NO chroma suffix**
- **5 roots:** Warm Gray, Taupe Gray, True Gray, Sage Gray, Cool Gray
- **14 lightness bands:** same as above
- Examples: `warm-gray-whisper`, `cool-gray-shadow`, `taupe-gray-tone`, `sage-gray-bloom`

**Common mistakes to avoid:**
- ❌ `warm-gray-whisper-soft` — neutrals have NO chroma suffix → ✅ `warm-gray-whisper`
- ❌ `ivory-pearl-soft` — "Ivory" is not a root → ✅ use `coral-veil-faint` or `amber-veil-faint`
- ❌ `amber-deep-core` — "Deep" is not a lightness band → ✅ `amber-shadow-clear`
- ❌ `apricot-vivid-core` — order is root-lightness-chroma, not root-chroma-lightness → ✅ `apricot-core-vivid`

When creating collections, **always verify** color IDs exist by checking against this naming scheme. The build will fail with `Unknown color id` if any ID is invalid.

### Page & Component Pattern

Pages in `app/` are Next.js Server Components. Each page imports a corresponding `*-page.tsx` component from `src/components/` that holds the actual UI and is marked `"use client"`. This keeps the App Router data/metadata layer separate from interactive client logic.

Dynamic routes use `generateStaticParams()`. `app/colors/[slug]/page.tsx` deliberately pre-renders only a
**subset — 3,066 of the 5,446 colors** — to stay under Vercel's 80 MB deployment-output limit; the other
**2,380 render on demand** (`dynamicParams = true`) and are CDN-cached after first visit. Do not read this
as "every colour page is static": those 2,380 are the ISR-write surface behind the Vercel bill, and the
cache-warmer walks them 250 at a time. `app/guides/[slug]/page.tsx` is the opposite — `dynamicParams = false`,
all 333 guides baked at build time.

### Persistence (localStorage)

`src/lib/favorites.ts` and `src/lib/recent-colors.ts` manage browser localStorage. Both use a subscription pattern (`subscribeTo*()` returns an unsubscribe function) with custom events for cross-component reactivity and `StorageEvent` for cross-tab sync.

### Content / Commerce

- `src/lib/collections.ts` — 261 curated palette collections (editorial metadata + color IDs). Count verified 2026-08-31; it grows with autopilot runs, so re-count rather than trusting this line.
- `src/lib/palette-packs.ts` — 7 product pack definitions (USD $9–$129) + All Access bundle.
- `src/lib/checkout-config.ts` — Stripe Checkout config + Pro subscription pricing (¥499/mo, ¥3,999/yr).
- `src/lib/auth-client.ts` — Client API for auth, projects, usage stats, referral, API keys.
- `src/lib/word-color.ts` — Deterministic word→color hash algorithm (string hash → hue/saturation/lightness → 5 color variants).

### Styling

Tailwind CSS 4 with utility-first classes. Key design patterns:
- Frosted glass panels via backdrop blur utilities
- Inset `swatch-shadow` class defined in `app/globals.css` for color card depth
- `sm:` and `lg:` breakpoints for responsive layout

### Static Export Notes

`next.config.ts` sets `trailingSlash: true`. The site is deployed to Vercel automatically on push to `main`. Backend API at `api.colorarchive.org` runs on a DigitalOcean Droplet via PM2.

## Session Coordination (Autopilot ↔ Remote Control)

This repo uses **two concurrent Claude Code session types** that must not run simultaneously:
- **Autopilot**: Automated scheduled runs (prefixed `[autopilot]`)
- **Remote Control**: Human-driven interactive sessions

Coordination uses `.claude/session-lock.json`. **Every session MUST follow this protocol:**

### Before starting any work

1. Run `git fetch origin && git pull --rebase origin main` to sync with remote.
2. Read `.claude/session-lock.json`
3. Check the lock state:
   - If `active` is `null` → acquire the lock (see below).
   - If `lockedBy` is a **different** session type → **STOP. Do not proceed.** Print: "⏸ Session locked by {lockedBy} since {lockedAt}. Waiting." and exit without making changes.
   - If `lockedBy` is the **same** session type (e.g. autopilot sees an autopilot lock) → check `lockedAt` timestamp. If the lock is **older than 20 minutes**, it is considered **stale** (previous run likely crashed). Force-release the stale lock, run `git pull --rebase origin main` again, then acquire a fresh lock. If the lock is less than 20 minutes old, **STOP** — the previous run is likely still active.

### Acquiring the lock

Use Bash (not the Write tool) to write `.claude/session-lock.json` — this avoids permission prompts:
```bash
echo '{ "active": true, "lockedBy": "autopilot", "lockedAt": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'", "message": "description" }' > .claude/session-lock.json
```

### Releasing the lock — AUTOMATIC

**Every session MUST automatically release the lock after its final commit+push.** This is not optional — do it immediately after pushing, before ending the session. Use Bash to reset `.claude/session-lock.json`:
```bash
echo '{ "active": null, "lockedBy": null, "lockedAt": null, "message": null }' > .claude/session-lock.json
```
Then include this file in your single commit (see batching rule below).

### Rules by session type

**Autopilot sessions:**
- MUST run `git pull --rebase origin main` FIRST before doing anything
- MUST check the lock SECOND
- If locked by "remote" → do nothing, exit gracefully, make zero changes
- If locked by "autopilot" and lock age > 20 min → stale lock, force-release and proceed
- If locked by "autopilot" and lock age ≤ 20 min → do nothing, exit gracefully (previous run still active)
- When starting, write lock with `"lockedBy": "autopilot"` and `"message"` describing the planned run
- After all work is done → release the lock and commit everything in a **single commit+push** (see batching rule below)

**Remote Control sessions:**
- MUST run `git pull --rebase origin main` FIRST before doing anything
- MUST check the lock SECOND
- If locked by "autopilot" → inform user: "⚠️ Autopilot is currently running: {message} (since {lockedAt}). Please wait for it to finish or manually clear `.claude/session-lock.json`."
- If locked by "autopilot" and lock age > 20 min → inform user the lock looks stale, offer to force-release it
- When starting, write lock with `"lockedBy": "remote"`
- After commit+push → **automatically** release the lock (write null values + commit+push)

### Commit batching rule (CRITICAL — saves Vercel build minutes)

**Every push to `main` triggers a full Vercel deployment** that rebuilds 3,000+ static pages. To minimize wasted builds:

**Autopilot MUST make exactly ONE commit and ONE push per run.** The workflow is:

1. Write `.claude/session-lock.json` to acquire lock — **do NOT commit or push yet**
2. Do all content work (newsletters, guides, collections, aliases, etc.)
3. `git add` all content files
4. Update `autopilot-log.md`, `docs/autopilot-log.md`, `docs/human-todo.md` — stage them
5. Write the null lock (release) to `.claude/session-lock.json` — stage it
6. **Single `git commit`** with all changes (content + logs + lock release)
7. **Single `git push`** → triggers exactly ONE Vercel deployment

**Do NOT** make separate commits for lock acquire, content, logs, and lock release. This wastes 3 extra deployments per run.

A `vercel.json` `ignoreCommand` is configured as a safety net — if a push only contains metadata files (lock, logs, human-todo), Vercel will skip the deployment automatically.
