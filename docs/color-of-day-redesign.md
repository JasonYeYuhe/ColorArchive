# Color-of-the-Day Selection Redesign

**Author:** Claude (remote session)
**Date:** 2026-04-19
**Status:** Approved (Codex + Gemini 2.5 Pro) with one mandatory revision — integer arithmetic (see §10)
**Related files:** `server/colors.js`, `src/lib/color-of-day.ts`

---

## 1. Problem

Users posting daily COTD images (Xiaohongshu, Pinterest, Instagram) report that **the colors look too similar from day to day** — consecutive days are dominated by the same hue family, so the feed feels monotonous.

### Root cause (empirical)

Current algorithm (`server/colors.js:176`):

```js
const heroColors = colors.filter(c =>
  c.lightness >= 30 && c.lightness <= 75 && c.saturation >= 34
); // 1,440 of 5,446 colors

function getColorOfDay(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  return heroColors[Math.abs(hash) % heroColors.length];
}
```

Two compounding failures:

1. **Weak hash + sequential input.** `YYYY-MM-DD` strings differ by 1 character day-to-day, so `djb2`-style bit-shift hash produces nearly-sequential outputs. Result: `hash % 1440` lands in **adjacent indices** day-to-day.
2. **Array ordered by generation.** `heroColors` is a filtered slice of `colors`, which is generated `root × lightness × chroma`. So adjacent indices share the **same hue root**.

**Observed effect:** 2026-04-01 through 04-09 (9 consecutive days) all fall within Clover / Emerald / Mint (H115–130°). Then sapphire days, then orange days. The whole feed trails through hue-adjacent clusters.

### Non-goals

- **Not fixing:** per-platform image templates (solid swatch + hex). The user complaint is the **color selection**, not the visual framing.
- **Not fixing:** hero filter itself (lightness 30–75, saturation ≥34). Keeping this constraint preserves the "visually punchy" character.

---

## 2. Design goals

1. **Hue diversity:** consecutive days differ by ≥60° in hue (visibly different family).
2. **Determinism preserved:** same date → same color, everywhere (server, Next.js, iOS). No history state, no database dependency.
3. **Full-wheel coverage:** over any ~12-day window, hit every hue family at least once.
4. **Backward compatible API:** `getColorOfDay(dateStr)` signature unchanged. Only the internal algorithm changes.
5. **Fast:** O(N) scan per call on 1,440 items (<1ms). No precomputation needed.

---

## 3. Chosen approach — Golden-angle + hue-bucket hybrid (Option A+C)

Endorsed by Codex review 2026-04-19.

### Algorithm

```
EPOCH = 2026-01-01 (UTC midnight)
daysSinceEpoch = floor((dateUTC - EPOCH) / 86400000)

// Primary: golden-angle hue rotation
// 137.5° is the irrational golden angle — low-discrepancy sequence,
// guarantees maximal spread on the hue wheel.
targetHue = (daysSinceEpoch * 137.508) mod 360

// Secondary: rotate lightness and saturation on independent cycles
// Different irrational-ish multipliers decorrelate the three channels.
targetLight = 42 + ((daysSinceEpoch * 23) mod 100) * 0.33   // 42..75
targetSat   = 55 + ((daysSinceEpoch * 29) mod 100) * 0.37   // 55..92

// Find nearest hero color under weighted circular distance
for each c in heroColors:
  dHue   = circularHueDistance(c.hue, targetHue) / 180    // normalize to 0..1
  dLight = abs(c.lightness - targetLight) / 100           // 0..1
  dSat   = abs(c.saturation - targetSat) / 100            // 0..1
  score  = 0.60 * dHue + 0.25 * dLight + 0.15 * dSat

return argmin(score)
```

Where:

```
circularHueDistance(a, b) = min(|a - b|, 360 - |a - b|)
```

This is the **shortest angular arc** on the hue wheel — critical because hue 0° and 359° are neighbors, not opposites.

### Why this works

| Property | Reason |
|---|---|
| Day N vs N+1 ≥60° apart | Golden angle = 137.508° step. Nearest-neighbor snap perturbs by ≤ some ε, but unless the target lands in a hue gap, day-to-day hue delta stays ≥ ~100°. |
| Full wheel in ~13 days | `13 × 137.508° = 1787.6° ≡ 347.6° mod 360°` → covers every 30° arc at least once. |
| No long same-family runs | Even if nearest-neighbor snapping pulls two nearby targets into the same bucket occasionally, golden-angle guarantees the *next* target is far away. |
| Deterministic | Pure function of `dateStr`. No state, no DB. All clients (Next.js, Droplet, iOS) compute same result. |
| Hue-wheel correct | Circular distance handles the 0°/360° seam. |
| Weighted by hue | 0.60 hue / 0.25 lightness / 0.15 saturation — hue dominates because that's the axis humans read first as "different color." |

### Epoch choice

`2026-01-01 UTC` is arbitrary but fixed. Once shipped, **never change** — changing the epoch shifts every future day's color.

### Timezone note

The `dateStr` input is already `YYYY-MM-DD` in the caller's local context. We convert to UTC midnight consistently — same as today. No user-visible change.

---

## 4. Rejected alternatives

| Option | Why rejected |
|---|---|
| **B — Deterministic shuffle (Fisher-Yates with fixed seed)** | Only hides the problem. Two adjacent shuffled slots can still be visually similar by chance. No guarantee of hue spread. |
| **D — Memory-based avoidance (exclude recent 7-day hues)** | Breaks pure determinism. Requires a shared history log readable from all consumers (server, Next.js SSG, iOS). Fragile. Codex: "不值得为了保证无重复牺牲纯确定性." |
| **Pure random with daily seed** | Same failure mode as Option B. No variety guarantee. |
| **Cycle through 1,440-item shuffled list** | Takes 4 years to revisit any color — too infrequent for "color of the day" to feel like the archive is alive. Golden-angle cycles through hues every ~13 days but still picks *different specific colors* each visit. |

---

## 5. Cross-platform diversification (Phase 2 — optional)

**Scope:** not required for this change. Raised for discussion, can ship later.

Currently every platform posts **the same COTD** on the same day. Options to consider **after** the core selection fix is deployed and observed:

### 5a. Xiaohongshu mood palette (recommended, easy)
Instead of a solid-color swatch, XHS posts a **4-color mood palette** on the COTD color's hue family:
- 1 primary (the COTD itself)
- 2 analogous (±24° hue)
- 1 accent (complementary, -180°)

This matches XHS audience expectations (users there save "配色灵感" not single swatches) and each day's palette feels visually distinct even if the anchor hue were ever similar.

Implementation: reuse existing `getAnalogous()` + `getComplementary()` in `server/colors.js`. New XHS image template in `server/xhs-image-generator.js`.

### 5b. Instagram complementary pair (optional)
IG Story shows COTD + its complementary color side-by-side — doubles the visual interest without changing the daily selection.

### 5c. Same base color everywhere (keep)
Codex confirmed: platforms should **share the same base color** for a given day. Different *variants* (palette, pair, single) are fine, but the anchor is the same — cross-platform followers see a coherent "today is this color."

---

## 6. Implementation plan

### Phase 1 (this PR) — core selection fix

**Files to change:**

1. **`server/colors.js`** (authoritative)
   - Replace `getColorOfDay()` with golden-angle + weighted-nearest-neighbor
   - Add internal helper `circularHueDistance(a, b)`
   - Add `EPOCH_MS = Date.UTC(2026, 0, 1)` constant
   - Keep export signature identical

2. **`src/lib/color-of-day.ts`** (Next.js / SSG mirror)
   - Mirror the exact same algorithm
   - Pure TS port, no Node-specific APIs
   - Add unit-style assertions in comments: "Day 0 → hue ~0°, Day 1 → hue ~137.5°, Day 2 → hue ~275°, Day 13 → hue ~7.6°"

3. **`ios/ColorArchive/ViewModels/ColorStore.swift`** (iOS mirror)
   - Port same algorithm to Swift
   - Matching epoch, matching weights
   - Swap out any existing COTD logic

**Verification:**
- `npm run typecheck`
- Manual: log out first 30 days of new selections, inspect hue spread. Expect **no** 3+ consecutive days in same hue bucket.
- Manual: confirm server and Next.js outputs match byte-for-byte for 30 sample dates.

**Risk:** Every existing COTD-derived artifact (stored Pinterest pins, IG posts, sent newsletters) referenced the OLD colors. Going forward, those stored references stay valid (they point to specific color IDs) — only *future* days get new selections. **No migration needed.**

**Observability:** Add a one-line log when server starts: `[colors] COTD algorithm: golden-angle v2 (epoch 2026-01-01)`.

### Phase 2 (follow-up, not in this PR)

- XHS mood palette generator + image template
- Optional IG complementary pair variant
- Post 30-day observation: confirm hue variance metric (stdev of circular-hue-distance between consecutive days) is > 60°

---

## 7. Testing

No automated test suite in repo (per CLAUDE.md). Manual verification:

1. **Type check:** `npm run typecheck`
2. **Parity check:** small Node script that calls both `server/colors.js#getColorOfDay` and the TS version for 30 dates, asserts they return identical color IDs.
3. **Diversity check:** generate 30 consecutive days, compute circular hue distance between day N and N+1, assert:
   - Min gap ≥ 45°
   - Mean gap ≥ 100°
   - No 3 consecutive days share the same color root (e.g. not 3× Clover in a row)
4. **Manual spot check:** plot 30 days as swatches, eyeball test.

Gate: if any of these fail, revise before merging.

---

## 8. Rollout

- Single commit on `main`
- Vercel auto-deploys Next.js
- Droplet needs PM2 restart: `ssh root@143.198.85.72 'cd /root/colorarchive/server && git pull && pm2 restart colorarchive-api'`
- iOS mirror lands in a separate build (v1.2), not blocking.

---

## 9. Open questions (for Gemini review)

1. Is `0.60 / 0.25 / 0.15` the right hue / lightness / saturation weight, or should hue dominate even more (e.g. 0.75 / 0.15 / 0.10)?
2. Golden angle 137.508° — should we use a slightly different irrational step (e.g. 222.5° = 360° − 137.5°) to vary direction of travel? Functionally equivalent, just asking.
3. Should the saturation/lightness secondary rotations use **different** multipliers per weekday to avoid the `daysSinceEpoch * 23 mod 100` landing on suspicious patterns when tested against small N?
4. Any edge case with `Date.UTC` and DST-adjacent dates we should worry about? (I believe no — `YYYY-MM-DD` → UTC midnight is well-defined.)
5. Is skipping Phase 2 (XHS mood palette) acceptable for this PR, or should we bundle it?

---

## 10. Review outcomes (Codex + Gemini 2.5 Pro)

**Codex** (second-opinion, 2026-04-19): endorsed Option A+C hybrid. Warnings: distance metric **must** use circular (shortest-arc) hue distance; weights ~0.6/0.25/0.15 are reasonable. Rejected Option D (history-based). ✅ Incorporated.

**Gemini 2.5 Pro** (design review, 2026-04-19): approved with one **mandatory** change —

> **Replace floating-point sequence generation with scaled integer arithmetic.** `daysSinceEpoch * 137.508` evaluated in JS (IEEE 754) vs Swift (IEEE 754 but different intrinsics) can drift after thousands of days due to rounding, causing platforms to pick *different* colors on the same date. Use:
>
> ```
> GOLDEN_ANGLE_SCALED = 137508       // 137.508 × 1000
> HUE_MOD = 360000                   // 360 × 1000
> targetHueScaled = (daysSinceEpoch * GOLDEN_ANGLE_SCALED) mod HUE_MOD
> targetHue = targetHueScaled / 1000   // float for distance calc only
> ```
>
> Apply the same integer-first approach to lightness and saturation.

Also recommended:
- Answers to §9: keep 0.60/0.25/0.15 weights; golden angle direction doesn't matter; current L/S multipliers are fine; `Date.UTC` handling is correct; **skip Phase 2 in this PR**.
- Add hardcoded regression test cases for days 1/100/1000/10000 so all platforms can assert parity.

### Final algorithm (integer-first)

```
EPOCH_MS        = Date.UTC(2026, 0, 1)               // 1767225600000
daysSinceEpoch  = floor((dateUTC - EPOCH_MS) / 86400000)   // signed int

// Pure integer (no FP drift across platforms)
targetHueScaled = ((daysSinceEpoch * 137508) mod 360000 + 360000) mod 360000
targetLight     = 42 + ((daysSinceEpoch * 23) mod 34 + 34) mod 34    // 42..75
targetSat       = 55 + ((daysSinceEpoch * 29) mod 38 + 38) mod 38    // 55..92

// Convert to float ONLY for distance comparison
targetHue = targetHueScaled / 1000.0

// Weighted circular-distance nearest-neighbor
bestScore = +∞; best = heroColors[0]
for each c in heroColors:
  hDiff  = abs(c.hue - targetHue)
  dHue   = min(hDiff, 360 - hDiff) / 180.0
  dLight = abs(c.lightness - targetLight) / 100.0
  dSat   = abs(c.saturation - targetSat) / 100.0
  score  = 0.60*dHue + 0.25*dLight + 0.15*dSat
  if score < bestScore: bestScore = score; best = c
return best
```

Notes:
- `((x mod m) + m) mod m` handles negative `daysSinceEpoch` (dates before epoch), required in JS/Swift where `%` can return negative.
- For `daysSinceEpoch` up to ~6 × 10¹⁰, the multiplication fits safely inside JS `Number` (2⁵³) and Swift `Int64`. Non-issue for any realistic use.
- Ties in score are broken by array order (first match wins). Stable across platforms as long as all three use the same `colors` list — which they do (generated algorithmically from identical tables).

### Parity regression fixtures (recorded 2026-04-19 after implementation)

These must match across Node / TS / Swift. Generated by `scripts/verify-cotd.mjs`:

| Date | daysSinceEpoch | targetHue | Expected color ID |
|------|----------------|-----------|-------------------|
| 2020-01-01 | -2192 | (pre-epoch) | `orchid-core-clear` |
| 2025-12-31 | -1 | 222.492° | `cobalt-radiant-clear` |
| 2026-01-01 | 0 | 0.0° | `crimson-velvet-clear` |
| 2026-04-19 | 108 | — | `lime-velvet-vivid` |
| 2027-01-01 | 365 | — | `jade-silk-vivid` |
| 2028-02-29 | 790 | — | `mint-silk-clear` |
| 2035-07-04 | 3471 | — | `magenta-velvet-pure` |
| 2099-12-31 | 27027 | — | `jade-silk-bright` |

### Measured diversity (30-day sample starting 2026-04-19)

| Metric | Target | Actual |
|--------|--------|--------|
| Min hue gap (consecutive days) | ≥45° | **130°** |
| Mean hue gap | ≥100° | **137.6°** |
| Max hue gap | — | 140° |
| 3-consecutive-days same root | 0 | **0** |

First 7 days of new algorithm, for comparison against the 9-day Clover/Emerald/Mint run of the old:

```
2026-04-19  lime-velvet-vivid         H 90° (green)
2026-04-20  indigo-silk-clear         H230° (indigo)
2026-04-21  scarlet-radiant-pure      H  5° (red)
2026-04-22  celadon-core-bright       H145° (seafoam)
2026-04-23  mulberry-silk-vivid       H280° (purple)
2026-04-24  citrine-tone-clear        H 60° (yellow)
2026-04-25  azure-core-clear          H200° (blue)
```
