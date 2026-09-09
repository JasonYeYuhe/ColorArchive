import { readdirSync, readFileSync } from "fs";
import { describe, expect, it } from "vitest";

/**
 * Every paid surface must treat an UNRESOLVED session as "maybe Pro", not "not Pro".
 *
 * AuthProvider starts at tier="anonymous" and reports a FAILED session request the
 * same way, so `tier === "pro"` alone is false for a paying subscriber whenever the
 * round-trip is slow or fails. ProGate and the word paywall learned this the
 * expensive way and consult `sessionError`; the journal PNG export did not, and
 * burned "Made with colorarchive.org" into a subscriber's export with nothing
 * afterwards to tell them. That was the fifth surface to miss the same rule.
 *
 * This checks the cheap structural half: a component that gates on tier === "pro"
 * and renders a watermark must at least reference sessionError. It cannot prove the
 * logic is right — only that the signal was not ignored outright.
 */

const WATERMARK = "Made with colorarchive.org";

function componentFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name === "node_modules" || e.name.startsWith(".")) continue;
      const full = `${dir}/${e.name}`;
      if (e.isDirectory()) walk(full);
      else if (/\.tsx$/.test(e.name)) out.push(full);
    }
  };
  walk("src");
  walk("app");
  return out;
}

describe("paid surfaces fail open on an unresolved session", () => {
  it("every component that watermarks on tier also consults sessionError", () => {
    const offenders = componentFiles().filter((f) => {
      const src = readFileSync(f, "utf8");
      if (!src.includes(WATERMARK)) return false;
      if (!/tier\s*===\s*"pro"/.test(src)) return false;
      return !src.includes("sessionError");
    });
    expect(
      offenders,
      `these components decide the watermark from tier alone, so a paying subscriber whose ` +
        `session request is slow or fails gets watermarked:\n  ${offenders.join("\n  ")}`,
    ).toEqual([]);
  });
});
