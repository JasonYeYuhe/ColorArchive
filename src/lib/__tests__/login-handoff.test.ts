import { readFileSync } from "fs";
import { describe, expect, it } from "vitest";
import { appLoginHref, canOpenIosApp, planMagicLink } from "../login-handoff";

/**
 * The single-use login token must be redeemed by whoever requested it.
 * Incident and reasoning: src/lib/login-handoff.ts, server/login-link.js.
 */

const EDGE_IOS_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 27_0_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/151.0.4129.72 Version/27.0 Mobile/15E148 Safari/604.1";

describe("planMagicLink", () => {
  it("offers an app-requested link to the app and does not redeem it here", () => {
    expect(planMagicLink("ios", false)).toBe("offer-app");
  });
  it("redeems here once the visitor chooses this browser", () => {
    expect(planMagicLink("ios", true)).toBe("verify-here");
  });
  it("redeems web-requested links here, including every link mailed before the tag existed", () => {
    expect(planMagicLink(null, false)).toBe("verify-here");
    expect(planMagicLink("", false)).toBe("verify-here");
    expect(planMagicLink("android", false)).toBe("verify-here");
  });
});

describe("hand-off helpers", () => {
  it("builds the scheme the iOS app handles (ColorArchiveApp.swift handleDeepLink)", () => {
    expect(appLoginHref("a b/c")).toBe("colorarchive://login?token=a%20b%2Fc");
    const swift = readFileSync("ios/ColorArchive/ColorArchiveApp.swift", "utf8");
    expect(swift).toMatch(/url\.scheme == "colorarchive"/);
    expect(swift).toMatch(/url\.host == "login"/);
    expect(swift).toMatch(/\$0\.name == "token"/);
  });
  it("auto-opens only where the app can exist", () => {
    expect(canOpenIosApp(EDGE_IOS_UA)).toBe(true);
    expect(canOpenIosApp("Mozilla/5.0 (Linux; Android 14) Chrome/126 Mobile")).toBe(false);
    expect(canOpenIosApp("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")).toBe(false);
  });
});

describe("login page wiring", () => {
  const src = readFileSync("src/components/login-page.tsx", "utf8");
  const effectStart = src.indexOf("const loginToken = token;");
  const effect = src.slice(effectStart, src.indexOf("}, [choseBrowser", effectStart));

  it("found the redemption effect (so the checks below are not vacuous)", () => {
    expect(effectStart).toBeGreaterThan(-1);
    expect(effect).toContain("verifyMagicLink(loginToken)");
  });

  it("consults the plan before the already-signed-in shortcut", () => {
    const plan = effect.indexOf("planMagicLink(");
    const signedIn = effect.indexOf("if (user)");
    expect(plan).toBeGreaterThan(-1);
    expect(signedIn).toBeGreaterThan(-1);
    // Someone signed in on this browser who opens an app link is signing the APP in;
    // the shortcut would redirect them and strand the token.
    expect(plan).toBeLessThan(signedIn);
  });

  it("does not let its own cleanup discard a successful verify", () => {
    // setVerifyState("loading") changes a dependency of this effect, so React runs its
    // cleanup mid-request. A cleanup-set `cancelled` flag checked after the await made
    // the page hang on "Signing you in" after every successful web login. Verified by
    // rendering LoginPage (jsdom): verify called once, router.replace never called.
    expect(effect).not.toMatch(/cancelled/);
    expect(effect).not.toMatch(/return \(\) =>/);
    expect(effect).toContain("redeemingTokenRef.current === loginToken");
  });

  it("has no timed fallback that redeems the token while iOS is still asking to open the app", () => {
    expect(effect).not.toMatch(/setTimeout\(r, \d+\)/);
    expect(effect).not.toMatch(/colorarchive:\/\//);
  });
});
