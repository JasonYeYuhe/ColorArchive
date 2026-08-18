import { createRequire } from "module";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

import { proSubscriptionConfig, preorderConfig, refundPolicy } from "@/src/lib/checkout-config";

/**
 * Any price the site states must be the price the site charges.
 *
 * This is copy-counts.test.ts applied to money instead of inventory, and it
 * exists for the same reason: nobody types a wrong price on purpose, but a
 * price lives in one file and the prose that quotes it lives in six others.
 *
 * Measured on 2026-08-18, all of it live:
 *
 *   "$4.99/month"      ×3 in server/email.js   against $3.49 (¥499)
 *   JSON-LD Offers     hardcoded 499/3999/19999 — this is what Google quotes
 *   upgrade modal      hardcoded JP¥499 / JP¥3,999 / "Save 33%"
 *   /support FAQ       hardcoded ¥19,999 (≈ $129)
 *   teamPlanConfig     a whole ¥1,499/¥11,999 plan with no checkout at all
 *
 * The emails were the expensive ones: server/ is CommonJS and cannot import
 * the TypeScript config, so the price was retyped by hand and then went stale
 * silently. server/pricing.js is the sanctioned mirror; the first test here is
 * what keeps a mirror from becoming a second source of truth.
 */

const require_ = createRequire(import.meta.url);
const ROOT = join(__dirname, "..", "..", "..");

describe("server/pricing.js mirrors checkout-config", () => {
  const { proPricing } = require_(join(ROOT, "server", "pricing.js"));

  for (const plan of ["monthly", "yearly", "lifetime"] as const) {
    it(`${plan} matches`, () => {
      const truth = proSubscriptionConfig[plan];
      const mirror = proPricing[plan];
      expect(mirror, `server/pricing.js is missing "${plan}"`).toBeTruthy();
      expect(mirror.price).toBe(truth.price);
      expect(mirror.priceUsd).toBe(truth.priceUsd);
      expect(mirror.currency).toBe(truth.currency);
    });
  }

  it("carries no plan that checkout-config does not sell", () => {
    // A price in the mirror with no plan behind it is the ghost-SKU shape:
    // teamPlanConfig sat in checkout-config for months, priced, with no
    // checkout, no ProPlan member, and no page.
    expect(Object.keys(proPricing).sort()).toEqual(["lifetime", "monthly", "yearly"]);
  });
});

/* ------------------------------------------------------------------ */

/** Every yen amount the product is allowed to say out loud. */
const ALLOWED_YEN = new Set(
  [
    proSubscriptionConfig.monthly.price,
    proSubscriptionConfig.yearly.price,
    proSubscriptionConfig.lifetime.price,
    preorderConfig.price,
    preorderConfig.regularPrice,
  ].map((s) => s.replace(/[^0-9]/g, "")),
);

/**
 * Decorative amounts that are not prices. Kept deliberately narrow — file AND
 * value — so it cannot quietly absorb a real price that drifts into one of
 * these files.
 */
const NOT_A_PRICE: Array<{ file: string; value: string; why: string }> = [
  {
    file: "src/components/palette-preview-page.tsx",
    value: "48200",
    why: "mock 'Total Revenue' figure inside the dashboard UI preview mockup",
  },
];

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "__tests__" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(full)) out.push(full);
  }
  return out;
}

/** Strip // and /* *​/ comments so a comment ABOUT a price (including the one
 *  documenting the deleted Team Pro plan) is not read as the site quoting it. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const SOURCE_FILES = [...walk(join(ROOT, "src", "components")), ...walk(join(ROOT, "app"))];

describe("no page states a yen price the site does not charge", () => {
  it("every ¥ amount in app/ and src/components/ is a real price", () => {
    const offenders: string[] = [];

    for (const file of SOURCE_FILES) {
      const rel = file.slice(ROOT.length + 1);
      const body = stripComments(readFileSync(file, "utf8"));
      for (const match of body.matchAll(/¥\s?([0-9][0-9,]*)/g)) {
        const digits = match[1].replace(/,/g, "");
        if (ALLOWED_YEN.has(digits)) continue;
        if (NOT_A_PRICE.some((e) => rel === e.file && e.value === digits)) continue;
        offenders.push(`${rel}: ¥${match[1]}`);
      }
    }

    expect(offenders, `unrecognised yen amounts — add to checkout-config or fix the copy:\n${offenders.join("\n")}`).toEqual([]);
  });
});

describe("trial length", () => {
  it("every '<N>-day free trial' claim matches trialDays", () => {
    const truth = proSubscriptionConfig.monthly.trialDays;
    expect(proSubscriptionConfig.yearly.trialDays).toBe(truth);

    const files = [...SOURCE_FILES, join(ROOT, "src", "lib", "i18n.ts")];
    const offenders: string[] = [];

    for (const file of files) {
      const rel = file.slice(ROOT.length + 1);
      const body = readFileSync(file, "utf8");
      const patterns = [
        /([0-9]+)[- ]day free trial/g,
        /free trial for ([0-9]+) days/g,
        /Pro free for ([0-9]+) days/g,
        /免费试用 Pro ([0-9]+) 天/g,
      ];
      for (const re of patterns) {
        for (const m of body.matchAll(re)) {
          if (Number(m[1]) !== truth) offenders.push(`${rel}: "${m[0]}" but trialDays is ${truth}`);
        }
      }
    }

    expect(offenders, offenders.join("\n")).toEqual([]);
  });
});

describe("outbound email", () => {
  it("server/email.js quotes no hand-typed monthly price", () => {
    // The exact 2026-08-18 defect: three mails said "$4.99/month" while the
    // site charged ¥499 ≈ $3.49. Prices in email must come from
    // server/pricing.js, which the first suite pins to checkout-config.
    const body = readFileSync(join(ROOT, "server", "email.js"), "utf8");
    const literals = [...body.matchAll(/\$[0-9]+(?:\.[0-9]{2})?\s*\/\s*month/g)].map((m) => m[0]);
    expect(literals, `hardcoded monthly price in server/email.js: ${literals.join(", ")}`).toEqual([]);
    expect(body).toContain("monthlyBlurb");
  });
});

describe("refund policy", () => {
  /**
   * /support advertised a "7-day money-back guarantee on all Pro purchases"
   * while /commerce-disclosure — the 特定商取引法 notice, which is the legally
   * operative one — said digital goods were non-refundable. Both pages now
   * derive the window from checkout-config, and this fails if either grows a
   * second number.
   */
  const PAGES = [
    "src/components/support-page.tsx",
    "src/components/commerce-disclosure-page.tsx",
  ];

  it("neither page hardcodes a refund window", () => {
    const offenders: string[] = [];
    for (const rel of PAGES) {
      const body = readFileSync(join(ROOT, rel), "utf8");
      for (const m of body.matchAll(/([0-9]+)[- ](?:day|days)\b(?=[^\n]*(?:refund|money-back))/gi)) {
        if (Number(m[1]) !== refundPolicy.moneyBackDays) {
          offenders.push(`${rel}: "${m[0]}" but refundPolicy.moneyBackDays is ${refundPolicy.moneyBackDays}`);
        }
      }
      for (const m of body.matchAll(/購入日から ([0-9]+) 日/g)) {
        if (Number(m[1]) !== refundPolicy.moneyBackDays) {
          offenders.push(`${rel}: 日本語 "${m[0]}" but refundPolicy.moneyBackDays is ${refundPolicy.moneyBackDays}`);
        }
      }
    }
    expect(offenders, offenders.join("\n")).toEqual([]);
  });

  it("the commerce disclosure no longer claims Pro is simply non-refundable", () => {
    // The exact contradiction, pinned: this page is the legally operative one,
    // so it must not deny a guarantee the site advertises.
    const body = readFileSync(join(ROOT, "src/components/commerce-disclosure-page.tsx"), "utf8");
    expect(body).toContain("refundPolicy.moneyBackDays");
    expect(body).not.toContain("Digital goods are non-refundable.");
  });
});
