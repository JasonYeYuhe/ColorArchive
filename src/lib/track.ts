import { API_URL } from "@/src/lib/api-config";
import { phCapture } from "@/src/lib/posthog";
import { attributionEventProps } from "@/src/lib/attribution";
import { getSessionId } from "@/src/lib/session-id";

/** Where the backlog of never-delivered events waits out a page unload. */
const DROPPED_KEY = "ca_ev_dropped";

/**
 * HOW A SILENT LOSS BECOMES A VISIBLE ONE (added 2026-08-27).
 *
 * `navigator.sendBeacon` reports refusal by RETURNING FALSE — it does not throw.
 * The try/catch in `track()` therefore caught nothing, and this function spent
 * its whole life reporting a success it had never had. Beacons are refused for
 * ordinary reasons: the per-origin queue quota (~64KB), unload-time pressure,
 * and hardened or embedded-webview builds that stub the method to a constant
 * `false`. Each of those produced an event that never left the browser, with no
 * counter anywhere that said so — and EVERY ratio on this site inherited it,
 * including the §5 anchor and the AI kill-gate.
 *
 * Two changes, doing different jobs:
 *   1. A refused beacon now FALLS THROUGH to `fetch(…, {keepalive:true})`. That
 *      recovers the event outright wherever the refusal was the method rather
 *      than the quota (the stubbed-webview case), and unlike beacon it answers.
 *   2. What still cannot be delivered is COUNTED, and the count rides out as
 *      `_dropped` on the next event that does get through. A failed send cannot
 *      report its own failure; the next success has to do it for it.
 *
 * The counter lives in localStorage, not a module variable, because the single
 * likeliest moment to lose a beacon is UNLOAD — exactly when a module variable
 * dies with the page and takes the evidence with it.
 *
 * WHAT `_dropped` IS NOT. It is a LOWER bound, in three specific ways, and a
 * reader who treats it as a total will understate the loss:
 *   - a browser that never delivers another event never reports its backlog;
 *   - `sendBeacon` returning true means QUEUED, not delivered, so a transfer
 *     that dies after that point is still invisible here;
 *   - the server answers 200 to events it deliberately discards (bot filter and
 *     the 200/day cap both `res.json({ok:true})`), so those are not in here at
 *     all — read server/bot-detect.js for that population.
 * What it does contain is refusal we can see: a beacon that said no, a network
 * error, and a deliberate 429 from the per-caller write limiter.
 */
let dropped: number | null = null;

function readDropped(): number {
  if (dropped === null) {
    try {
      const n = Number(localStorage.getItem(DROPPED_KEY));
      dropped = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
    } catch {
      // Private mode / storage disabled. Count in memory for this page's life
      // and accept that it will not survive the unload — under-counting is the
      // failure direction this whole file is allowed to have.
      dropped = 0;
    }
  }
  return dropped;
}

function writeDropped(n: number): void {
  dropped = n;
  try {
    if (n > 0) localStorage.setItem(DROPPED_KEY, String(n));
    else localStorage.removeItem(DROPPED_KEY);
  } catch {
    // Storage refused; the in-memory value above still carries this page.
  }
}

/**
 * Fire-and-forget event tracking. Never throws, never blocks UI.
 *
 * Fans out to two destinations that share the same event names:
 *  - the first-party backend `events` table (sendBeacon → /events), and
 *  - PostHog (product analytics: DAU / retention / funnels).
 * PostHog is a no-op until NEXT_PUBLIC_POSTHOG_KEY is configured.
 *
 * Every event carries the browser's first-touch acquisition attribution (channel + UTM +
 * referrer domain). This is what lets the exit-gate funnel be split by source: the same
 * `channel` rides on `word_paywall_*`, `preorder_*`, and every conversion event, so we can
 * tell qualified ICP traffic apart from generic gawkers. Explicit event props win over the
 * attribution fields on the (non-existent) key collision.
 */
export function track(event: string, props?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;

  const enriched = { ...attributionEventProps(), ...(props ?? {}) };

  phCapture(event, enriched);

  const path = window.location.pathname;

  try {
    // sessionId rides along so ratios can be computed per VISIT rather than per
    // event — without it, one enthusiastic scroller looks like fifty visitors.
    // Ephemeral and per-tab; see src/lib/session-id.ts for why it is deliberately
    // not a persistent identifier.
    const owed = readDropped();
    const body = JSON.stringify({
      event,
      // Only present when there is something to confess, so the ordinary event
      // shape is untouched and `_dropped` greps as the anomaly it is.
      props: owed > 0 ? { ...enriched, _dropped: owed } : enriched,
      path,
      sessionId: getSessionId(),
    });
    const url = `${API_URL}/events`;

    // Take the backlog on only once the payload actually exists (a throw in
    // JSON.stringify above must not consume it). Clearing it here rather than on
    // success is what stops two overlapping sends from both reporting the same
    // backlog and driving the counter negative; `lost()` hands it straight back.
    if (owed > 0) writeDropped(0);
    const lost = () => writeDropped(readDropped() + owed + 1);

    // The whole point of this line: a `false` return is a refusal, and it used
    // to be discarded. Falling through on false is what turns it into a retry.
    if (navigator.sendBeacon?.(url, new Blob([body], { type: "application/json" }))) return;

    // Beacon missing, or it refused. `keepalive` gives fetch the same
    // outlive-the-page property beacon has — and it reports back.
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      credentials: "include",
    })
      .then((r) => {
        if (!r.ok) lost();
      })
      .catch(lost);
  } catch {
    // Never let tracking break the app
  }
}

/**
 * Fire `login` on every successful authentication, plus `sign_up` when the account was
 * just created. The magic-link / Google flows don't tell the client whether a user is
 * new, so we infer it from `created_at` recency (a brand-new account was created seconds
 * ago). PostHog also tracks first-seen users on its own; this gives an explicit funnel
 * step the two platforms share by name.
 */
export function trackAuthSuccess(createdAt: string | null | undefined, method: string) {
  track("login", { method });

  if (!createdAt) return;
  const createdMs = new Date(createdAt).getTime();
  if (!Number.isFinite(createdMs)) return;
  // "Just created" = within the last 2 min. The lower bound tolerates ~5 min of
  // client/server clock skew; without it, a device clock running behind the server
  // makes `diff` negative (always < 2min) and marks EVERY login as a sign_up.
  const diff = Date.now() - createdMs;
  if (diff > -5 * 60 * 1000 && diff < 2 * 60 * 1000) {
    track("sign_up", { method });
  }
}
