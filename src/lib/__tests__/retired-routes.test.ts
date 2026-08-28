import { existsSync, readFileSync } from "fs";
import { describe, expect, it } from "vitest";

/**
 * Routes that were deliberately retired, and must not come back by accident.
 *
 * WHY THIS EXISTS. `/colors/{a}/vs/{b}/` was removed on 2026-08-27 (5506e32,
 * then 879c672) because its ~29.6M pair space with `dynamicParams: true` was
 * generating 8.75M ISR writes a month — $34.99, the single largest line on the
 * Vercel bill. It was replaced with a 308 to the colour's own page, so live
 * search traffic still lands somewhere useful.
 *
 * On 2026-08-28 both files were found back on disk, UNTRACKED, byte-identical
 * to the deleted versions and with their original mtimes intact — a metadata-
 * preserving copy from somewhere, not a git operation (a checkout would have
 * staged them). Nobody would have noticed: untracked files do not ship, so the
 * only symptom is that one `git add -A` re-commits a $35/month regression.
 *
 * AND A ROUTE WOULD WIN. The redirect in next.config.ts is not a safety net
 * here — Next.js resolves a real route before a redirect, so the moment this
 * page.tsx is in a build, the redirect stops firing and the ISR bill comes
 * straight back. That asymmetry is why this is a test and not a comment.
 *
 * IF YOU ARE DELIBERATELY REINSTATING ONE OF THESE: delete its entry here, and
 * read docs/handoff-2026-08-27.md first — the retirement was a cost decision
 * with measured numbers behind it, not a cleanup.
 */
const RETIRED = [
  {
    path: "app/colors/[slug]/vs",
    why: "the /colors/{a}/vs/{b}/ route — 8.75M ISR writes/mo, $34.99. Retired 5506e32 + 879c672, replaced by a 308 in next.config.ts.",
  },
  {
    path: "src/components/color-vs-page.tsx",
    why: "the component behind that route. Harmless alone, but its presence is how the route gets rebuilt.",
  },
];

describe("retired routes stay retired", () => {
  for (const { path, why } of RETIRED) {
    it(`${path} does not exist`, () => {
      expect(existsSync(path), `${path} is back. It was retired because ${why}`).toBe(false);
    });
  }

  it("the replacement redirect is still configured", () => {
    // Deleting the route without this redirect turns live search traffic into
    // 404s — which is the mistake 879c672 exists to correct, so the guard has
    // to cover both halves or it protects the bill at the cost of the users.
    const config = readFileSync("next.config.ts", "utf8");
    expect(config).toContain("/colors/:slug/vs/:slug2");
  });
});
