import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

/**
 * A PRO badge may not sit on top of text the visitor can already read.
 *
 * ─── WHAT WENT WRONG (measured 2026-09-08) ─────────────────────────────────
 *
 * `ProGate`'s locked branch renders `{children}` inside
 * `opacity-40 pointer-events-none` (pro-gate.tsx:193). It dims; it does not
 * withhold. On /palette/ that was compounded: the gate wrapped only the
 * <CopyButton>, while the payload itself rendered in a plain <pre> OUTSIDE the
 * gate, with a black "PRO" pill above it. Three formats — Tailwind, Figma
 * tokens, Style Dictionary — were fully legible, fully selectable, and labelled
 * as a paid feature. The same shape existed in palette-export-panel.tsx, where
 * four of six format tabs carried a PRO badge over a shared, always-rendered
 * <pre>. Pro was selling a copy button, not data.
 *
 * ─── WHAT THIS GUARD ACTUALLY CHECKS, AND WHAT IT DOES NOT ─────────────────
 *
 * It does NOT try to prove statically that a payload sits outside its gate.
 * That was attempted and abandoned on purpose: the three leak shapes in this
 * repo alone are <CopyButton value={x}> inside the gate with {x} in a sibling
 * <pre>; a `const copyButton = (<button onClick={handleCopy}>…)` passed as
 * children; and a <pre> nested *inside* the gate (token-generator-page.tsx:565,
 * which is CORRECT and which a naive file-level regex reports as a leak). A
 * detector that silently misses two of three shapes is worse than none, because
 * green then reads as "no leaks".
 *
 * So it checks the two things it can check honestly:
 *
 *   1. NO PRO BADGE IN ANY FILE THAT GATES. The 0d decision was that the badge
 *      is the false part, not the preview — the preview is deliberate, and
 *      real server-side gating was explicitly declined (dev-plan-2026-09-08
 *      §4) because its cost cannot be sized. So the invariant that survives is:
 *      if a file has a ProGate, it must not also assert "PRO" as a label.
 *      brand-system-panel.tsx keeps its honest "Pro" pill precisely because it
 *      has no ProGate — its whole panel is gated by the caller.
 *
 *   2. THE GATE INVENTORY IS PINNED. Adding or removing a ProGate changes this
 *      test, which forces the badge question to be answered for the new gate
 *      rather than defaulted. This is a review trigger, not a proof.
 */

const ROOT = join(__dirname, "..", "..", "..");
const COMPONENTS = join(ROOT, "src", "components");

/** file -> number of <ProGate> usages. Update deliberately, never to get green. */
const GATE_INVENTORY: Record<string, number> = {
  "brand-generator-page.tsx": 2,
  "bulk-export-button.tsx": 1,
  "collection-detail-page.tsx": 2,
  "dark-mode-pairs-card.tsx": 1,
  "image-palette-page.tsx": 2,
  "palette-export-panel.tsx": 1,
  "palette-generator-page.tsx": 1,
  "palette-page.tsx": 7,
  "palette-preview-page.tsx": 2,
  "pro-page.tsx": 1,
  "token-generator-page.tsx": 1,
  "wcag-audit-page.tsx": 2,
};

/** A rendered "PRO"/"Pro" pill: the text sitting alone between two JSX tags. */
const BADGE = />\s*(?:PRO|Pro)\s*</g;

function gateFiles(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of readdirSync(COMPONENTS)) {
    if (!f.endsWith(".tsx")) continue;
    const body = readFileSync(join(COMPONENTS, f), "utf8");
    if (body.includes("<ProGate")) out[f] = body;
  }
  return out;
}

describe("Pro badges never label already-visible payloads", () => {
  const files = gateFiles();

  it("the gate inventory matches the manifest exactly", () => {
    const actual: Record<string, number> = {};
    for (const [f, body] of Object.entries(files)) {
      actual[f] = (body.match(/<ProGate\b/g) ?? []).length;
    }
    expect(
      actual,
      "A ProGate was added or removed. Decide whether its payload is genuinely " +
        "withheld before updating this manifest — that decision is the point of " +
        "the test, not the number."
    ).toEqual(GATE_INVENTORY);
  });

  it("no file that gates also renders a PRO badge", () => {
    for (const [f, body] of Object.entries(files)) {
      const found = body.match(BADGE) ?? [];
      expect(
        found.length,
        `${f} contains a "PRO" badge and a <ProGate>. ProGate only dims its ` +
          `children (opacity-40), so a badge here is a claim the code does not ` +
          `enforce. Either withhold the payload for real, or drop the badge.`
      ).toBe(0);
    }
  });

  it("the guard is looking at real files (it can fire)", () => {
    // Guards against the vacuum failure: if gateFiles() ever returns {} — a
    // moved directory, a renamed component — every assertion above passes
    // trivially. This repo has shipped that mistake before.
    expect(Object.keys(files).length).toBe(Object.keys(GATE_INVENTORY).length);
    expect(Object.keys(files).length).toBeGreaterThan(0);
  });
});
