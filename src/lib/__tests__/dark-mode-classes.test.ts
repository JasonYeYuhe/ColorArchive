import { readdirSync, readFileSync, statSync } from "fs";
import { describe, expect, it } from "vitest";

/**
 * Two `dark:` utilities of the same kind on one element is always a bug.
 *
 * app/globals.css declares `@custom-variant dark (&:where(.dark, .dark *))`, so a
 * `dark:` utility compiles to `.dark\:foo:where(.dark, .dark *)`. `:where()`
 * contributes zero specificity, which means `dark:text-a` and `dark:text-b` on
 * the same element are a specificity TIE — the winner is whichever Tailwind
 * happens to emit later in the stylesheet, not the one written last in the class
 * attribute. So the rendered colour is not readable from the source at all.
 *
 * This is not hypothetical. A regex sweep that appended dark variants by pattern
 * produced exactly this: its rule for `text-neutral-500` emitted
 * `text-neutral-500 dark:text-neutral-400`, and then its rule for
 * `text-neutral-400` matched INSIDE `dark:text-neutral-400` (\b matches after the
 * colon) and appended again. Some elements ended up with three. The visible
 * result was white-on-white panels at 1.00:1 and a search field where you could
 * not see your own typing.
 *
 * The hand-check that followed only looked for ADJACENT duplicates and therefore
 * missed `dark:text-neutral-600 … other classes … dark:text-white`, which was
 * still invisible text. This test matches across the whole class string.
 */

// The property each utility sets. Two utilities that set the same property on the
// same element conflict; `dark:text-white` and `dark:bg-black` obviously do not.
const CONFLICTING_PREFIXES = [
  "dark:text",
  "dark:bg",
  "dark:border",
  "dark:ring",
  "dark:placeholder",
  "dark:hover:text",
  "dark:hover:bg",
  "dark:hover:border",
] as const;

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const path = `${dir}/${entry}`;
    if (statSync(path).isDirectory()) {
      out.push(...sourceFiles(path));
    } else if (path.endsWith(".tsx")) {
      out.push(path);
    }
  }
  return out;
}

/**
 * Pull out every className string literal, including template literals and the
 * branches of a ternary inside one — a conflict can hide in a single branch.
 */
function classStrings(source: string): string[] {
  const out: string[] = [];
  for (const match of source.matchAll(/className=(?:"([^"]*)"|\{`([\s\S]*?)`\})/g)) {
    const raw = match[1] ?? match[2] ?? "";
    // A template literal can hold several alternatives; each ${...} branch is its
    // own element state, so split on the interpolation boundaries and test the
    // static runs plus each quoted branch separately.
    out.push(raw);
    for (const branch of raw.matchAll(/"([^"]*)"/g)) out.push(branch[1]);
  }
  return out;
}

function conflictsIn(classString: string): string[] {
  // Only the static runs matter — a `${cond ? "a" : "b"}` never applies both.
  const staticPart = classString.replace(/\$\{[\s\S]*?\}/g, " ");
  const tokens = staticPart.split(/\s+/).filter(Boolean);
  const found: string[] = [];

  for (const prefix of CONFLICTING_PREFIXES) {
    const hits = tokens.filter((token) => {
      if (!token.startsWith(`${prefix}-`)) return false;
      // `dark:text-*` must not swallow `dark:text-xs` style utilities, nor claim
      // `dark:hover:text-*` which has its own entry.
      const rest = token.slice(prefix.length + 1);
      if (prefix === "dark:text" && /^(xs|sm|base|lg|xl|\dxl|left|center|right)$/.test(rest)) return false;
      if (!prefix.includes("hover") && token.startsWith(`${prefix.replace("dark:", "dark:hover:")}-`)) return false;
      return true;
    });
    if (hits.length > 1) found.push(`${prefix}: ${hits.join(" + ")}`);
  }
  return found;
}

describe("dark mode classes", () => {
  it("no element sets the same dark: property twice", () => {
    const offenders: string[] = [];
    for (const file of [...sourceFiles("src"), ...sourceFiles("app")]) {
      const source = readFileSync(file, "utf8");
      for (const classString of classStrings(source)) {
        for (const conflict of conflictsIn(classString)) {
          offenders.push(`${file}\n    ${conflict}`);
        }
      }
    }
    expect(
      offenders,
      `elements with conflicting dark: utilities (the winner is stylesheet order, not class order):\n${offenders.join("\n")}`,
    ).toEqual([]);
  });

  /**
   * A bare `hover:bg-x` is (0,2,0); `dark:bg-y` is (0,1,0) because :where() adds
   * nothing. So hovering an element in dark mode flips it back to its light-mode
   * colour unless a `dark:hover:` partner exists.
   *
   * A RATCHET, NOT A CLEAN BILL. There are 74 of these across ~15 components and
   * they predate this test — the dark-mode work that introduced most of them
   * happened long before anyone noticed the specificity interaction. Fixing all
   * of them at once would mean touching fifteen live components for a hover
   * state, which is exactly the opportunistic cleanup that turned a previous
   * dark-mode pass into a series of regressions. So: the count may fall, never
   * rise. New work has to get it right; the backlog is written up in
   * docs/human-todo.md and can come down component by component.
   */
  const HOVER_VIOLATION_BASELINE = 74;

  it(`no NEW element lets a hover:* state outrank its dark: counterpart (ratchet at ${HOVER_VIOLATION_BASELINE})`, () => {
    // Covers background AND border. Both bit this codebase in the same week: a
    // button whose hover made it darker than its own panel, and a card whose
    // hover border vanished, leaving no affordance at all.
    const PROPERTIES = ["bg", "border"] as const;
    const offenders: string[] = [];
    for (const file of [...sourceFiles("src"), ...sourceFiles("app")]) {
      const source = readFileSync(file, "utf8");
      for (const classString of classStrings(source)) {
        const tokens = classString.replace(/\$\{[\s\S]*?\}/g, " ").split(/\s+/).filter(Boolean);
        for (const property of PROPERTIES) {
          const hasDark = tokens.some((t) => new RegExp(`^dark:${property}-`).test(t));
          const hasLightHover = tokens.some((t) => new RegExp(`^hover:${property}-`).test(t));
          const hasDarkHover = tokens.some((t) => new RegExp(`^dark:hover:${property}-`).test(t));
          if (hasDark && hasLightHover && !hasDarkHover) {
            offenders.push(`${file}: ${tokens.filter((t) => t.includes(`${property}-`)).join(" ")}`);
          }
        }
      }
    }
    expect(
      offenders.length,
      offenders.length > HOVER_VIOLATION_BASELINE
        ? `hover:bg-* outranks dark:bg-* on ${offenders.length - HOVER_VIOLATION_BASELINE} NEW element(s):\n${offenders.join("\n")}`
        : `ratchet can be lowered to ${offenders.length}`,
    ).toBeLessThanOrEqual(HOVER_VIOLATION_BASELINE);
  });
});
