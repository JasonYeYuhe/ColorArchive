import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

import { FREE_PROJECT_LIMIT } from "@/src/lib/plan-limits";

/**
 * The client may state a limit only if the server enforces that same limit.
 *
 * Measured 2026-08-19: /projects rendered "{n}/5 free" while
 * server/routes/projects.js rejected the 4th save with "Free accounts can save
 * up to 3 projects." The counter and the refusal disagreed by two, on the
 * screen whose whole job is to sell the upgrade.
 */
const ROOT = join(__dirname, "..", "..", "..");

describe("free-tier limits match the server", () => {
  it("FREE_PROJECT_LIMIT equals the server's constant", () => {
    const server = readFileSync(join(ROOT, "server", "routes", "projects.js"), "utf8");
    const m = server.match(/FREE_PROJECT_LIMIT\s*=\s*(\d+)/);
    expect(m, "could not find FREE_PROJECT_LIMIT in server/routes/projects.js").toBeTruthy();
    expect(FREE_PROJECT_LIMIT).toBe(Number(m![1]));
  });

  it("the projects page states no other number", () => {
    // Catches a hardcoded "/5" creeping back in beside the derived value.
    const page = readFileSync(join(ROOT, "src", "components", "projects-page.tsx"), "utf8");
    const hardcoded = [...page.matchAll(/\{projects\.length\}\/(\d+)/g)].map((m) => m[1]);
    expect(hardcoded, `projects-page.tsx hardcodes /${hardcoded.join(", /")}`).toEqual([]);
    expect(page).toContain("FREE_PROJECT_LIMIT");
  });
});
