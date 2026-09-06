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

describe("a quoted price is always marked tax-exclusive", () => {
  /**
   * Lemon Squeezy prices are tax-EXCLUSIVE. Measured 2026-09-06 on the live
   * checkout: cart.tax_inclusive is false, and a JP billing address adds JCT at
   * 10.00% — on the no-trial variant, subtotal 1999900 becomes total 2199890. So
   * a bare "JP¥499 / month" is not what a customer in Japan pays, and until this
   * run every price surface on the site showed exactly that, while
   * /commerce-disclosure had gone as far as affirmatively calling the displayed
   * price 税込.
   *
   * Nothing guarded any of it — grep the rest of this file for 税 or "tax" before
   * this block and you get nothing — so the correction could rot the same silent
   * way the defect arrived. Any file that renders a price from checkout-config
   * must also say, somewhere in the same file, that the figure excludes tax.
   */
  const TAX_MARKERS = ["excl. tax", "excluding tax", "税抜", "税込", "consumption tax", "JCT"];

  it("every component that renders a config price also states the tax basis", () => {
    const offenders: string[] = [];
    for (const file of SOURCE_FILES) {
      const rel = file.slice(ROOT.length + 1);
      const raw = readFileSync(file, "utf8");
      const body = stripComments(raw);
      // Only the surfaces that actually SHOW a price to a visitor. thanks-page
      // parses one into an analytics number without displaying it.
      if (!/proSubscriptionConfig\.(monthly|yearly|lifetime)\.price/.test(body)) continue;
      if (rel.endsWith("thanks-page.tsx")) continue;
      if (!TAX_MARKERS.some((m) => body.includes(m))) {
        offenders.push(`${rel}: renders a price but never says it excludes tax`);
      }
    }
    expect(offenders, offenders.join("\n")).toEqual([]);
  });

  it("the disclosure states the basis, the rate, and does not claim 税込", () => {
    const body = readFileSync(join(ROOT, "src/components/commerce-disclosure-page.tsx"), "utf8");
    expect(body).toContain("税抜");
    expect(body).toContain("JCT");
    // The exact false claim this page shipped until 2026-09-06.
    expect(body).not.toContain("表示された価格（税込）");
  });
});

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
  // refund-policy-page.tsx was NOT in this list until 2026-09-06, even though it
  // is the page that states the guarantee in the most detail and writes the
  // window as a literal three times. The guard was watching the two pages that
  // derive the number and ignoring the one that hardcodes it.
  const PAGES = [
    "src/components/support-page.tsx",
    "src/components/commerce-disclosure-page.tsx",
    "src/components/refund-policy-page.tsx",
    // /pro/ states the window in its trust row as a literal too.
    "src/components/pro-page.tsx",
    // …and the /pro/ FAQ answer lives here, where it was hardcoded as "7-day"
    // AND "7 天" while pointing refund requests at the wrong mailbox.
    "src/lib/i18n.ts",
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
      // Matches the window wherever it is anchored. It used to be pinned to the
      // literal "購入日から", so changing the anchor to 初回のお支払い (2026-09-06,
      // to agree with /refund-policy) would have silently switched this half of
      // the guard off while leaving it green. Deliberately NOT a bare
      // /([0-9]+) 日/ — that would match the "3 日間の無料トライアル" in 支払時期
      // and fail on a number this rule has no opinion about.
      // 简体中文 too. Scoped tightly on purpose: i18n carries both "3 天，随时取消"
      // (the TRIAL, which this rule has no opinion about) and "7 天无理由退款"
      // (the refund window). Requiring 退款 within a few characters separates them.
      // Verified by mutation: changing only the Chinese string turns this red,
      // which it did NOT before this pattern existed.
      for (const m of body.matchAll(/([0-9]+) 天(?=[^\n]{0,6}退款)/g)) {
        if (Number(m[1]) !== refundPolicy.moneyBackDays) {
          offenders.push(`${rel}: 简体中文 "${m[0]}" but refundPolicy.moneyBackDays is ${refundPolicy.moneyBackDays}`);
        }
      }
      for (const m of body.matchAll(/([0-9]+) 日(?:以内|経過後)/g)) {
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
