import { describe, expect, it } from "vitest";

import { formatMinorCurrency } from "@/src/lib/format-money";

/**
 * The regression these lock down shipped to production and survived four months:
 * the site's only real order, $3.47, rendered in the admin dashboard as $0.03.
 *
 * The first assertion is that exact row. If someone reintroduces the
 * zero-decimal-means-no-divide shortcut, this file fails immediately rather than
 * four months later when somebody squints at a revenue tile.
 */
describe("formatMinorCurrency", () => {
  it("renders the one real order correctly", () => {
    // orders row: amount=3, amount_minor=347, currency=usd.
    expect(formatMinorCurrency(347, "usd")).toBe("$3.47");
  });

  it("divides yen by 100 as well, and shows no decimals", () => {
    // The old code skipped the divisor for zero-decimal currencies, which is
    // what disguised the bug: JPY rows looked correct while every decimal
    // currency was shown at 1/100 of its value. LS scales JPY by 100 too.
    expect(formatMinorCurrency(18700, "jpy")).toBe("¥187");
    expect(formatMinorCurrency(29900, "jpy")).toBe("¥299");
  });

  it("keeps sub-unit precision rather than rounding to the major unit", () => {
    // `orders.amount` throws away the cents (347 -> 3). Reading amount_minor is
    // the whole point; assert the cents actually survive.
    expect(formatMinorCurrency(1299, "usd")).toBe("$12.99");
    expect(formatMinorCurrency(5, "usd")).toBe("$0.05");
  });

  it("does not crash on a missing currency", () => {
    // Older rows predate consistent currency stamping.
    expect(formatMinorCurrency(347, "")).toBe("$3.47");
  });

  it("totals zero as zero, not as an empty string", () => {
    expect(formatMinorCurrency(0, "usd")).toBe("$0.00");
    expect(formatMinorCurrency(0, "jpy")).toBe("¥0");
  });
});
