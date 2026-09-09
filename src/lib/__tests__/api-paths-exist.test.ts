import { readdirSync, readFileSync } from "fs";
import { describe, expect, it } from "vitest";

/**
 * Every API path the client calls must be a path the server actually mounts.
 *
 * WHY THIS EXISTS. The homepage newsletter form POSTed to
 * `${API_URL}/api/newsletter/subscribe` for its whole life. Express mounts
 * `/subscribe`; there has never been an `/api/newsletter/*`. So every submission
 * 404'd and showed "Something went wrong", and the resulting empty list was read
 * as "nobody wants the newsletter" rather than "the form is broken". Nothing
 * caught it: typecheck cannot see across the process boundary, the component
 * rendered fine, and the failure only existed at runtime in a visitor's browser.
 *
 * This is a cheap, structural check of the one thing that was wrong: the first
 * path segment. It cannot verify a handler's behaviour, and it deliberately only
 * looks at literal paths — a computed path is invisible to it.
 */

const SEGMENT = /\$\{API_URL\}\/([a-zA-Z0-9._-]+)/g;

function sourceFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name === "node_modules" || e.name.startsWith(".")) continue;
      const full = `${dir}/${e.name}`;
      if (e.isDirectory()) walk(full);
      else if (/\.(ts|tsx)$/.test(e.name) && !e.name.endsWith(".test.ts")) out.push(full);
    }
  };
  walk("src");
  walk("app");
  return out;
}

function mountedRoots(): Set<string> {
  const index = readFileSync("server/index.js", "utf8");
  const roots = new Set<string>();
  for (const m of index.matchAll(/app\.use\(\s*["']\/([a-zA-Z0-9._-]+)/g)) roots.add(m[1]);
  // Routes registered directly rather than via a router mount.
  for (const m of index.matchAll(/app\.(get|post|put|delete)\(\s*["']\/([a-zA-Z0-9._-]+)/g)) roots.add(m[2]);
  return roots;
}

describe("client API paths exist on the server", () => {
  it("every ${API_URL}/<segment> the client calls is mounted by server/index.js", () => {
    const mounted = mountedRoots();
    expect(mounted.size, "parsed no routes from server/index.js — did the mount idiom change?").toBeGreaterThan(5);

    const offenders: string[] = [];
    for (const file of sourceFiles()) {
      const src = readFileSync(file, "utf8");
      for (const m of src.matchAll(SEGMENT)) {
        if (!mounted.has(m[1])) offenders.push(`${file} -> \${API_URL}/${m[1]}`);
      }
    }
    expect(
      offenders,
      `these client calls target paths the API server does not mount, so they 404 at runtime:\n  ${offenders.join("\n  ")}`,
    ).toEqual([]);
  });
});
