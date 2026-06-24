# ColorArchive Phase-2 dev plan — Accessibility Auditor MVP

> Drafted 2026-06-22, **revised 2026-06-24 per Gemini 3.1 Pro review** (first pass 3.5/10 REVISE →
> all 5 must-fixes applied below) · author: Claude (Opus 4.8)
> Upstream: `dev-plan-2026-06-19.md` (v3 validation/distribution plan). This is its Track C
> ("build the Auditor MVP") as an executable plan for a fresh session.

## 0. GATE — programmatic, not conversational (addresses review must-fix #4)

Building the Auditor before the ~2026-07-15 validation gate is the red line in
`dev-plan-2026-06-19.md` §5. There is **no "ask the owner / override" step** — under deadline
stress that loophole gets used and defeats the gate. Instead:

**The fresh session's M0 (before ANY feature code) is to run the gate check and obey it:**
1. SSH the droplet (`ssh root@143.198.85.72`) and run the exit-gate query — reuse the exact SQL
   in `server/routes/analytics.js` `GET /analytics/gate` (it computes, over the validation window:
   qualified `/preorder` UV by channel **excluding** generic channels [hackernews, organic-search,
   direct, reddit, unknown, referral:*], paywall triggers, and order count). Also read LS live
   orders.
2. Evaluate the matrix:
   | Qualified `/preorder` UV (or paywall) | Real LS pre-orders | Action |
   |---|---|---|
   | ≥500 (or ≥1000 paywall) | ≥10 | **PROCEED** to M1. |
   | ≥500 | <10 | **STOP.** No demand → report off-ramp; write no feature code. |
   | <500 and <1000 paywall | any | **STOP.** Acquisition failed → off-ramp; write no feature code. |
3. If STOP: print the numbers + the off-ramp recommendation and end the session. **Do not build.**

**Bypass requires editing this file** (deleting this §0) and committing it — a deliberate,
auditable act of breaking your own rule, not a one-word chat reply. That is the point.

## 1. One-line goal
Ship the **minimum lovable** version of the pre-ordered "Accessibility Auditor": paste a design
system's colour tokens (with foreground/background roles), get every WCAG-contrast + colour-blind
failure, an accessible archive replacement **per failing pair**, and an exportable remediation
report. It is the paid Pro feature `/preorder` sells.

## 2. MVP scope — faithful to the pre-order promise, but mathematically honest

The pre-order promises: *"whole-palette WCAG + colour-blindness scan, accessible replacements from
the archive, report, fixed token export."* MVP delivers that, with two correctness constraints the
review forced:

1. **Input (role-tagged, capped).** Paste tokens as hex list / CSS custom properties / JSON
   `{name: hex}`; or load a ColorArchive collection. For each token the user marks a **role:
   foreground (text/icon), background (surface), or both.** **Hard cap: 50 tokens in the MVP**
   (perf — see §4). Parse → `{name, hex, role}[]`.
2. **WCAG scan over MEANINGFUL pairs only.** Compute contrast for **foreground × background** pairs
   (NOT a blind N² of every token vs every token) — AA/AAA for normal text, large text, and
   non-text/UI (3:1). Output a severity-ranked list of failing pairs + a pass/fail summary.
3. **Colour-blindness check.** Run colours + failing pairs through the 8-type simulation
   (`src/lib/colorblind.ts`); flag pairs that collapse under any type.
4. **Accessible replacement — PER PAIR, on demand (addresses must-fix #1 + #2).** For a *specific
   failing FG-on-BG pair*, suggest the nearest archive colour (minimal perceptual shift) that makes
   **that pair** pass AA — computed **only when the user expands that pair** (not eagerly for all
   failures), in a **Web Worker**. Show before/after contrast. The user accepts/rejects per pair;
   nothing is auto-applied globally.
5. **Output (NO silent global token rewrite — addresses must-fix #1).**
   - **Remediation report**: failing pairs, the colour-blind flags, and the accepted per-pair
     replacements. Exportable via print-to-PDF (`window.print()` + print stylesheet — no PDF dep).
   - **"Apply & re-scan" loop**: when the user accepts a replacement, re-run the FULL scan so any
     *new* failure the change introduces is caught immediately. Only after a clean re-scan can the
     user **export the corrected token set** (CSS/JSON/hex). We never emit a "fixed" file that was
     never re-validated. (This is the honest version of "fixed token export.")

**Gating + fulfilment is M0, not an afterthought (must-fix #3) — see §5.**

## 3. Reuse map (build ON these; first do a 30-min recon to confirm exact fn names/shapes)
- `src/lib/palette-audit.ts` + `src/components/palette-audit-page.tsx` + the `/palette-audit` /
  `/wcag-audit` routes — the single-palette audit. The Auditor is the Pro **role-aware,
  whole-system** superset. Extend, don't fork.
- `src/lib/colorblind.ts` — 8-type colour-blindness simulation.
- `src/lib/color-utils.ts` — contrast ratio / relative luminance / hex↔rgb / nearest-colour helpers
  (confirm exact exports first).
- `src/data/colors.ts` — the 5,446 archive (source of replacements).
- `src/components/pro-gate.tsx` (`ProGate`) — Pro gating + daily quota.

## 4. Architecture + the REAL performance constraint (addresses must-fix #2)
- **Route**: `/auditor/` (Pro), or a Pro "whole-system" mode on `/palette-audit`. Server Component
  shell + `"use client"` page. **All audit logic is pure client-side functions** over the parsed
  tokens + the archive.
- **The bottleneck is NOT the contrast math** (40k ratios ≈ 5ms). It is the **replacement search**:
  naively, every failing pair × 5,446 archive colours = hundreds of millions of perceptual-distance
  ops → freezes the tab. Therefore: (a) **cap input at 50 tokens**; (b) compute replacements
  **on-demand per pair** (only when the user expands it), never eagerly for all failures; (c) run
  that perceptual-distance search in a **Web Worker** so the main thread never blocks; (d) optional:
  pre-bucket the archive by hue to shrink the search space.
- **Vercel-cost rule (plain version — addresses must-fix #5):** keep ALL logic in pure client-side
  functions. Do **NOT** add `generateStaticParams`, do **NOT** add new ISR or dynamic server
  routes, do **NOT** add Next API routes for the audit. The only backend touch is the existing
  auth/entitlement check. (This avoids re-introducing the Build-CPU / ISR-Write / Function-Invocation
  charges that the 2026-06-20 work cut — see `reference_vercel_cost` / `docs/human-todo.md`.)
- **colors.ts import (plain version — addresses must-fix #5):** import the archive client-side via
  the deterministic generator the way the existing client tool pages do — check how
  `src/components/word-color-generator-page.tsx` (or `all-colors`) imports `src/data/colors.ts`, and
  copy that pattern. Do NOT pass the 5,446-element array down as a serialized server prop (it bloats
  the RSC payload ~1MB).

## 5. Build sequence — fulfilment FIRST (re-ordered per must-fix #3)
- **M0 — Close the commercial loop (BEFORE any UI).** Prove a real LS pre-order grants Pro
  entitlement and that `ProGate` unlocks for that user end-to-end. Map the LS pre-order webhook →
  the Pro tier/entitlement in the DB → `ProGate` recognising it. If this isn't wired, paying buyers
  are locked out (chargebacks). No feature UI until this is verified working.
- **M1 — Input (role-tagged, ≤50) + WCAG scan** → ranked failing-pairs list + summary.
- **M2 — Colour-blind flags + on-demand per-pair archive replacement in a Web Worker.**
- **M3 — Remediation report + "apply & re-scan" loop + corrected-token export (only after a clean
  re-scan).** Print-to-PDF report.
- **M4 — Polish: the auditor's OWN a11y must be exemplary** (keyboard, focus, ARIA, dark mode),
  copy, empty/error states. Then email pre-order buyers it's live + post to the channels that
  converted.

## 6. Explicitly NOT in the MVP (anti-scope-creep)
- **Global multi-variable token re-solve** (recolour the whole system at once so every pair passes
  simultaneously) — this is the corrupt-export trap; MVP only does per-pair fixes + re-scan.
- Inputs > 50 tokens; smart matrix reduction beyond role-constraint + the cap.
- Figma / design-tool plugins or live sync; CI/CD or API access; GitHub Action.
- Auto-applying fixes into a connected source (only suggest + export).
- Team / multi-user, saved audit history, audit diffing.
- A true server-generated branded PDF (print-to-PDF first; upgrade only if buyers ask).
- Full WCAG 2.2 component coverage beyond contrast (focus appearance, target size, etc.).

## 7. Success metric
- Pre-order buyers activate + use it (the honest bar — they paid for this).
- Auditor → Pro conversion lift (PostHog: `tool_used{auditor}` → `upgrade_clicked` → checkout).
- North star: real paying Pro users / MRR. The auditor turns validated demand into revenue.

## 8. Risks
| Risk | Mitigation |
|---|---|
| Build before the gate | §0 programmatic gate; bypass requires editing this file (auditable). |
| Corrupt "fixed" export (N² fallacy) | Role-tagged FG×BG pairs only; per-pair fix + mandatory re-scan before export; no global re-solve (§2, §6). |
| Browser freeze on replacement search | Cap 50 tokens; on-demand per-pair; Web Worker; hue-bucket the archive (§4). |
| Pre-order buyers locked out | Fulfilment is M0, verified end-to-end before any UI (§5). |
| Fresh session wastes context on jargon | §4 spells out the colors.ts import + the no-API/client-only cost rule explicitly. |
| Re-introducing Vercel cost | Pure client-side; no generateStaticParams / ISR / API routes (§4). |

---
*Phase-2 plan, revised per Gemini 3.1 Pro must-fixes. Gate-conditional by design (programmatic).
Pending re-review before handoff.*
