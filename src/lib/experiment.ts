"use client";

/**
 * Client-side A/B arm assignment. Currently one experiment: W1, the in-body
 * word→colour card on guide pages (dev-plan-2026-08-31-next §5 W1).
 *
 * WHY CLIENT-SIDE AND NOT MIDDLEWARE
 * Guides are `dynamicParams = false` + `generateStaticParams` — 333 pages baked
 * at build time and served from the CDN. A middleware split would have to vary
 * the cache key per arm, which doubles the CDN population and pulls every guide
 * request through the edge for an experiment that changes one card. The house
 * pattern for "decide on the client without a hydration mismatch" already exists
 * (src/components/word-intent-probe.tsx): render nothing on the server, decide in
 * an effect. This module is the decision, not the rendering.
 *
 * WHY localStorage AND NOT sessionStorage
 * The arm has to outlive the tab. `ca_sid` (the analytics session id) is
 * sessionStorage and dies with the tab, but `ca_attr_v1` (first-touch landing
 * path — the field the read-out groups by) is localStorage and never expires.
 * If the arm re-rolled per tab, one browser could contribute a control session
 * and a treatment session under the SAME first-touch landing path, and the two
 * arms would be contaminated with each other. Matching `ca_attr_v1`'s lifetime is
 * what keeps arm and landing page from ever disagreeing.
 *
 * WHY NOT A COOKIE
 * src/components/cookie-policy-page.tsx §2 enumerates exactly one cookie
 * (`ca_session`, strictly-necessary auth) and rests the no-banner position on
 * that enumeration being complete. An experiment bucket is not strictly
 * necessary, so putting it in a cookie would move the site's consent posture for
 * the sake of a card. localStorage is disclosed in §3 alongside `ca_attr_v1`.
 *
 * WHAT `persisted:false` MEANS AND WHY IT RIDES ALONG
 * A browser that can READ localStorage but not WRITE it (some private modes,
 * hardened builds, quota exhaustion) re-rolls the coin on every full document
 * load. Those browsers land in both arms over a visit and are the one population
 * that can silently contaminate the read-out. They cannot be prevented, so they
 * are COUNTED instead: every assignment event carries `persisted`, and the
 * analysis excludes `persisted:false` sessions rather than discovering them
 * afterwards. This is the same discipline as `_dropped` in src/lib/track.ts —
 * a loss that cannot be stopped is made visible instead of hidden.
 */

export type Arm = "control" | "card";

/** Bump the suffix to start a NEW experiment; never reuse a key across questions. */
const W1_KEY = "ca_w1_v1";

export interface Assignment {
  arm: Arm;
  /** False when the coin could not be written down, i.e. it may re-roll. */
  persisted: boolean;
}

/**
 * An unbiased coin. `Math.random()` would do statistically, but `crypto` is
 * already required on this page (src/lib/session-id.ts uses randomUUID) and
 * removes the question entirely.
 */
function flip(): Arm {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
      const buf = new Uint8Array(1);
      crypto.getRandomValues(buf);
      return (buf[0] & 1) === 0 ? "control" : "card";
    }
  } catch {
    // Fall through to Math.random below.
  }
  return Math.random() < 0.5 ? "control" : "card";
}

function isArm(value: unknown): value is Arm {
  return value === "control" || value === "card";
}

/**
 * Read this browser's W1 arm, assigning it on the first call of the browser's
 * lifetime. SSR-safe (returns control, unpersisted) and never throws.
 *
 * Reads localStorage FIRST, then sessionStorage, then rolls. The sessionStorage
 * copy is not a second source of truth — it is the write-through that keeps a
 * localStorage-write failure from re-rolling the coin within one tab, which is
 * the difference between "some browsers are excluded" and "some browsers appear
 * in both arms".
 */
export function getW1Arm(): Assignment {
  if (typeof window === "undefined") return { arm: "control", persisted: false };

  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(W1_KEY);
  } catch {
    // Storage unreadable. Try the per-tab copy before rolling.
  }
  if (!stored) {
    try {
      stored = window.sessionStorage.getItem(W1_KEY);
    } catch {
      /* neither store is readable — roll and report persisted:false */
    }
  }
  if (isArm(stored)) return { arm: stored, persisted: true };

  const arm = flip();
  let persisted = false;
  try {
    window.localStorage.setItem(W1_KEY, arm);
    persisted = true;
  } catch {
    /* private mode / quota — the sessionStorage write below still holds the tab */
  }
  try {
    window.sessionStorage.setItem(W1_KEY, arm);
  } catch {
    /* nothing left to try; `persisted:false` is the honest report */
  }
  return { arm, persisted };
}
