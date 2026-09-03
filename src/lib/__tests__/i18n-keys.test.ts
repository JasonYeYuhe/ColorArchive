import { readFileSync, readdirSync, statSync } from "fs";
import { describe, expect, it } from "vitest";

/**
 * Every key a component asks for must exist, in every locale.
 *
 * WHY THIS EXISTS. `t()` does not throw and does not fall back — it RETURNS THE KEY:
 *
 *     export function t(key: string, locale: Locale): string {
 *       const entry = translations[key];
 *       if (!entry) return key;              // <- ships the key name to the visitor
 *       return entry[locale] ?? entry.en ?? key;
 *     }
 *
 * So a missing key is not a crash, a blank, or a build error. It is the literal
 * string `palette_generator_title` rendered as an <h1> on a live page, and nothing
 * anywhere reports it. Found on 2026-09-03 by loading /palette/ in a browser:
 * ELEVEN keys were missing across four components, seven of them on
 * /palette-generator/ alone. They had been shipping to real visitors since d430e38.
 *
 * WHY THE `||` FALLBACKS AT THE CALL SITES DO NOT HELP. Every one of those eleven
 * sites was written as `{t("some_key") || "Some Text"}`. The author expected a
 * fallback; they got dead code, because `t()` returns a non-empty string and `||`
 * therefore never fires. Reading the call site makes the bug look impossible, which
 * is exactly why it survived — the only way to catch this class is from outside.
 *
 * The locale check is here for the same reason: `entry[locale] ?? entry.en` means a
 * key with `en` but no `zh` silently serves English to Chinese readers forever.
 */

const LOCALES = ["en", "zh"] as const;

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const path = `${dir}/${entry}`;
    if (statSync(path).isDirectory()) {
      if (entry === "__tests__") continue;
      out.push(...sourceFiles(path));
    } else if (/\.tsx?$/.test(path)) {
      out.push(path);
    }
  }
  return out;
}

const I18N_PATH = "src/lib/i18n.ts";
const i18nSource = readFileSync(I18N_PATH, "utf8");

/** Keys defined as `"key": { en: "...", zh: "..." }` at the top level of the map. */
function definedKeys(): Map<string, string> {
  const map = new Map<string, string>();
  for (const m of i18nSource.matchAll(/^\s*"([^"]+)":\s*\{([\s\S]*?)\},?\s*$/gm)) {
    map.set(m[1], m[2]);
  }
  return map;
}

/** Every `t("literal")` call across the app, with the file and line that made it. */
function usedKeys(): Map<string, string[]> {
  const used = new Map<string, string[]>();
  for (const file of [...sourceFiles("src"), ...sourceFiles("app")]) {
    if (file.endsWith(I18N_PATH) || file.includes("/lib/i18n.ts")) continue;
    const source = readFileSync(file, "utf8");
    for (const m of source.matchAll(/\bt\(\s*"([^"]+)"\s*\)/g)) {
      const line = source.slice(0, m.index).split("\n").length;
      const at = `${file}:${line}`;
      const list = used.get(m[1]);
      if (list) list.push(at);
      else used.set(m[1], [at]);
    }
  }
  return used;
}

describe("i18n keys", () => {
  const defined = definedKeys();

  it("every key a component calls is defined", () => {
    const missing: string[] = [];
    for (const [key, sites] of usedKeys()) {
      if (!defined.has(key)) {
        missing.push(`  "${key}" — called at ${sites.join(", ")}`);
      }
    }
    expect(
      missing,
      `these keys are not in ${I18N_PATH}, so t() returns the key itself and the ` +
        `raw key name is rendered to visitors (a "|| fallback" at the call site does ` +
        `NOT save you — t() returns a truthy string):\n${missing.join("\n")}`,
    ).toEqual([]);
  });

  it("every defined key has every locale", () => {
    const incomplete: string[] = [];
    for (const [key, body] of defined) {
      for (const locale of LOCALES) {
        if (!new RegExp(`(^|[\\s,{])${locale}\\s*:`).test(body)) {
          incomplete.push(`  "${key}" is missing ${locale}`);
        }
      }
    }
    expect(
      incomplete,
      `entry[locale] ?? entry.en means a missing locale silently serves the wrong ` +
        `language instead of failing:\n${incomplete.join("\n")}`,
    ).toEqual([]);
  });

  it("the guard can actually see the keys it is guarding", () => {
    // Without this, a change to i18n.ts's formatting could make definedKeys()
    // return nothing, and both assertions above would pass vacuously — green
    // meaning "I parsed no keys" rather than "the keys are fine".
    expect(defined.size).toBeGreaterThan(900);
    expect(defined.has("pro.comparison.row1")).toBe(true);
    expect([...usedKeys().keys()].length).toBeGreaterThan(400);
  });
});
