/**
 * The single clipboard write path, and the reason a write failed.
 *
 * ── WHY THIS EXISTS (2026-08-25) ─────────────────────────────────────────────
 *
 * Both copy components used to do this:
 *
 *   try { await navigator.clipboard.writeText(value); track("color_copied", …) }
 *   catch { \/* noop *\/ }
 *
 * so the event fired ONLY after `writeText` resolved. Every failure was swallowed,
 * which made "17 copies in 21 days" unreadable in an unknown direction: we could
 * not tell "nobody wanted to take a value away" from "lots of people tried and the
 * browser refused". Those two findings call for opposite work, so the metric could
 * not be used to decide anything.
 *
 * The failure is not hypothetical or rare. `navigator.clipboard` is undefined in
 * a non-secure context and in several embedded webviews — and `/word-to-color/`
 * is the page that takes social traffic, where Instagram / X / LINE in-app
 * browsers are exactly that population. Note the shape: when `navigator.clipboard`
 * is undefined, `navigator.clipboard.writeText` throws a synchronous TypeError
 * *inside* the try, so the empty catch was swallowing the single case we most
 * needed to see.
 *
 * This is the third instance of one bug shape in this repo — `track("export")`
 * fired only on successful export, `track("color_copied")` only on a resolved
 * write, and `CopyActionButton` fired nothing at all. The rule that comes out of
 * it: an event that only fires on the success path cannot distinguish "no demand"
 * from "broken", so it must never be the evidence for a product decision.
 *
 * ── DELIBERATELY NOT A FALLBACK ──────────────────────────────────────────────
 *
 * This module measures; it does not repair. Adding a `document.execCommand`
 * fallback here would convert failures into successes and destroy the very
 * measurement we are taking — we would still not know the failure rate, only that
 * it had been papered over. Ship the counter, read it after 14 days, and *then*
 * decide whether a fallback is warranted. If the failure rate is high the fix is
 * an ordinary bug fix, not a product judgement.
 */

/**
 * Bounded set on purpose. `reason` is an analytics dimension, and this repo has
 * already polluted one (`format`) by feeding it runtime values — every distinct
 * colour became its own category and the dimension stopped being groupable.
 * Never widen this to raw `err.message`: unbounded cardinality, and messages can
 * carry text we have no reason to collect.
 */
export type CopyFailureReason =
  /** No `navigator.clipboard.writeText` at all — the embedded-webview case. */
  | "no-api"
  /** Served over a non-secure context, which is why the API is absent. */
  | "insecure-context"
  /** The API exists and the browser or user refused the write. */
  | "denied"
  /** Anything else, including a rejected write with no useful name. */
  | "error";

export type CopyResult = { ok: true } | { ok: false; reason: CopyFailureReason };

/** `DOMException.name` values that mean "refused", not "unavailable". */
const DENIED_ERROR_NAMES = new Set(["NotAllowedError", "SecurityError"]);

/**
 * Copy `value` to the clipboard, reporting *why* it failed rather than throwing.
 *
 * Never throws: callers are click handlers, and a rejected copy must not surface
 * as an unhandled rejection. Returning a result instead of a boolean is what lets
 * the caller emit a `reason` — a bare boolean would reproduce the original bug in
 * a new shape, telling us it failed but not whether the browser was even capable.
 */
export async function writeClipboard(value: string): Promise<CopyResult> {
  // Missing API and insecure context are the same observation from two angles —
  // report the more specific one when we can see it. Checked BEFORE the call
  // because `navigator.clipboard.writeText` on an undefined `clipboard` throws a
  // TypeError that is indistinguishable from a genuine write failure downstream.
  if (typeof navigator === "undefined" || typeof navigator.clipboard?.writeText !== "function") {
    const insecure = typeof window !== "undefined" && window.isSecureContext === false;
    return { ok: false, reason: insecure ? "insecure-context" : "no-api" };
  }

  try {
    await navigator.clipboard.writeText(value);
    return { ok: true };
  } catch (err) {
    const name = err instanceof Error ? err.name : "";
    return { ok: false, reason: DENIED_ERROR_NAMES.has(name) ? "denied" : "error" };
  }
}
