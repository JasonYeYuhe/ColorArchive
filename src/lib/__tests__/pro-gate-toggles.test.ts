import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * A NON-EXPORT CONTROL INSIDE A <ProGate> MUST NOT SPEND A FREE EXPORT.
 *
 * ── the bug this pins (fixed 2026-09-05, F4) ─────────────────────────────────
 * ProGate decides "was this click an export?" with a CSS selector:
 *   EXPORT_TRIGGER = 'button, a, [role="button"], input[type="submit"], …'
 * That matches ANY button in the gated subtree, so a format toggle counts as an
 * export. Switching Preview → CSS → Tailwind to LOOK at the three formats spent
 * all three of the day's free exports and produced nothing.
 *
 * ── why a test and not a comment ─────────────────────────────────────────────
 * Because a comment is exactly what failed. pro-gate.tsx carried the line
 * "(Format toggles also stopPropagation.)" as though it were a property of the
 * system. It was a description of three call sites, and it was false at two
 * others — DarkModePairsCard and BrandSystemPanel — which charged users for
 * eight clicks that exported nothing. Nothing detected that for months.
 *
 * ── what it checks ───────────────────────────────────────────────────────────
 * It follows the RENDER relationship, not just file contents: the components
 * that appear as children of a <ProGate> live in different files from the gate
 * itself, which is precisely why the original comment was wrong about them.
 *
 * ── what it does NOT check ───────────────────────────────────────────────────
 * Only format-toggle setters, only one level of nesting, and only by source
 * regex. A grandchild component, a differently-named setter, or a non-toggle
 * button (a "reset", a "help" popover) would slip through. This is a tripwire
 * for the specific shape that already cost us, not a proof of correctness.
 */

const COMPONENTS_DIR = join(process.cwd(), "src", "components");

/** State setters used for "which export format am I looking at" toggles. */
const FORMAT_SETTERS = ["setFormat", "setExportFormat", "setActiveFormat", "setExportMode"];

function kebab(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function readAll(): Map<string, string> {
  const out = new Map<string, string>();
  for (const f of readdirSync(COMPONENTS_DIR)) {
    if (f.endsWith(".tsx")) out.set(f, readFileSync(join(COMPONENTS_DIR, f), "utf8"));
  }
  return out;
}

const GATE_BLOCK = /<ProGate\b[^>]*>([\s\S]*?)<\/ProGate>/g;

/**
 * The source that is actually inside a gate.
 *
 * Scoping matters, and getting it wrong the naive way produces a FALSE alarm:
 * palette-export-panel.tsx contains a <ProGate>, but the gate wraps only its
 * copy button — the format tabs 20 lines above it are outside, so a click there
 * never reaches ProGate and needs no stopPropagation. Checking "every file that
 * mentions ProGate" flags that line forever and trains people to ignore the test.
 *
 * So: for a file that DECLARES a gate, only the text between the tags counts.
 * For a component RENDERED inside someone else's gate, the whole file counts —
 * it has no way of knowing which of its buttons will end up gated, and those are
 * exactly the two files (DarkModePairsCard, BrandSystemPanel) that regressed.
 */
function gatedRegions(files: Map<string, string>): Map<string, string> {
  const regions = new Map<string, string>();
  const childFiles = new Set<string>();

  for (const [name, src] of files) {
    if (!src.includes("<ProGate")) continue;
    const inside: string[] = [];
    for (const block of src.matchAll(GATE_BLOCK)) {
      inside.push(block[1]);
      for (const child of block[1].matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)) {
        const candidate = `${kebab(child[1])}.tsx`;
        if (files.has(candidate)) childFiles.add(candidate);
      }
    }
    // Keep line numbers meaningful: blank out everything outside a gate rather
    // than concatenating the inside parts.
    const lines = src.split("\n");
    const keep = new Set<number>();
    for (const part of inside) {
      const first = src.slice(0, src.indexOf(part)).split("\n").length - 1;
      part.split("\n").forEach((_, i) => keep.add(first + i));
    }
    regions.set(name, lines.map((l, i) => (keep.has(i) ? l : "")).join("\n"));
  }

  for (const name of childFiles) regions.set(name, files.get(name)!);
  return regions;
}

describe("ProGate: format toggles must not burn a free export", () => {
  const files = readAll();
  const gated = gatedRegions(files);

  it("finds the gated component files at all (guard is not vacuous)", () => {
    // If a refactor renames ProGate or the child components, the scan above
    // silently matches nothing and every assertion below passes on an empty set.
    expect(gated.size).toBeGreaterThan(5);
    expect(gated.has("dark-mode-pairs-card.tsx")).toBe(true);
    expect(gated.has("brand-system-panel.tsx")).toBe(true);
    // And the scoping actually scopes: palette-export-panel gates only its copy
    // button, so its format tabs must NOT be in the checked region.
    expect(gated.get("palette-export-panel.tsx")).not.toContain("setActiveFormat(f.id)");
  });

  it("every format toggle inside a gated subtree calls stopPropagation", () => {
    const offenders: string[] = [];
    for (const [name, region] of gated) {
      const lines = region.split("\n");
      lines.forEach((line, i) => {
        if (!/onClick=\{\(\)\s*=>/.test(line)) return;
        if (!FORMAT_SETTERS.some((s) => line.includes(`${s}(`))) return;
        // `onClick={() => setFormat(f)}` takes no event, so it cannot possibly
        // stop propagation — the click bubbles to ProGate and is counted.
        offenders.push(`${name}:${i + 1}: ${line.trim()}`);
      });
    }
    expect(offenders).toEqual([]);
  });

  it("the two components that regressed still stop propagation explicitly", () => {
    for (const name of ["dark-mode-pairs-card.tsx", "brand-system-panel.tsx"]) {
      const src = files.get(name)!;
      expect(src, `${name} lost its stopPropagation`).toContain("e.stopPropagation()");
    }
  });
});
