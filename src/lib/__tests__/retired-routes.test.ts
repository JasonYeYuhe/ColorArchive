import { existsSync, readdirSync, readFileSync } from "fs";
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
  {
    path: "app/api/billing-portal",
    why:
      "the Stripe billing-portal proxy, retired 2026-09-08. Stripe is dead (LS live " +
      "since 2026-04-17; verified 2026-09-08 against production: all 5 rows with a " +
      "subscription are payment_provider='lemonsqueezy', 0 are 'stripe'). It could " +
      "not have worked even if reached: it forwarded the browser cookie to " +
      "api.colorarchive.org, but the session cookie is host-only (no Domain= in " +
      "server/auth.js buildCookie), so the forward carried no session and 401'd, " +
      "and the caller silently ignored the error. Do not revive it as a template " +
      "for a real billing route — the cookie forward is the part that is broken. "+
      "PINNED AS THE DIRECTORY, not route.ts: Next resolves route.{js,jsx,ts,tsx} and "+
      "next.config.ts sets no pageExtensions, so a filename pin is revived by simply "+
      "recreating the handler as route.tsx — byte-identical to the deleted file, and "+
      "the audit of 2026-09-08 confirmed it serves while the guard stays green.",
  },
];

describe("retired routes stay retired", () => {
  for (const { path, why } of RETIRED) {
    it(`${path} does not exist`, () => {
      expect(existsSync(path), `${path} is back. It was retired because ${why}`).toBe(false);
    });
  }

  // The second half of the billing-portal retirement. Deleting the route while a
  // client still POSTs to it turns a silent no-op into a 404 no-op — no better.
  // A guard that only checks the file is a guard for half the defect.
  it("no client code anywhere still calls /api/billing-portal", () => {
    // Scans the WHOLE client tree, not just account-page.tsx. The first version of
    // this guard read that one file, and the 2026-09-08 audit demonstrated two
    // ordinary reintroductions that left it green: moving the call into another
    // component, and hoisting the path into a const.
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        if (e.name === "node_modules" || e.name.startsWith(".")) continue;
        const full = `${dir}/${e.name}`;
        if (e.isDirectory()) walk(full);
        else if (/\.(ts|tsx|js|jsx)$/.test(e.name)) files.push(full);
      }
    };
    walk("src");
    walk("app");

    // Match the PATH as a string literal, wherever it appears in code — a hoisted
    // const is the realistic reintroduction. Comments are stripped first so the
    // retirement's own documentation cannot trip its guard.
    const offenders = files.filter((f) => {
      const code = readFileSync(f, "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/^\s*\/\/.*$/gm, "");
      return /["'`]\/api\/billing-portal/.test(code);
    });
    expect(offenders, `these files still reference the retired route: ${offenders.join(", ")}`).toEqual([]);
  });

  it("the replacement redirect is still configured", () => {
    // Deleting the route without this redirect turns live search traffic into
    // 404s — which is the mistake 879c672 exists to correct, so the guard has
    // to cover both halves or it protects the bill at the cost of the users.
    const config = readFileSync("next.config.ts", "utf8");
    expect(config).toContain("/colors/:slug/vs/:slug2");
  });
});
