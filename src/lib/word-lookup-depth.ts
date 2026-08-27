/**
 * How many DISTINCT lookups a visit has made, once the typing is discounted.
 *
 * The word-to-color page commits a word after a 2s idle pause, and the only
 * thing separating "a word" from "a keystroke" is that pause. Anyone who stops
 * to think mid-word commits a fragment: typing "midnight" with one hesitation
 * commits "mid" and then "midnight". The free-quota path already refunds those
 * — a fragment is always a strict prefix of what follows it, so superseding it
 * on commit costs nothing.
 *
 * `word_generated`'s `depth` has to make the same discount or it measures how
 * someone TYPES rather than what they looked up. That is not hypothetical:
 * within four minutes of `depth` going live on 2026-08-27, production session
 * 02b3d2df reported depth 6 against count 4 — a number that reads as "kept
 * going past the paywall" and was nothing of the kind.
 *
 * One deliberate difference from the quota refund: that one exempts the word
 * the visitor landed on, because the landing word is FREE. That is an
 * entitlement rule, not a counting one, so it has no business here — for depth,
 * a landing word typed through is a fragment like any other.
 */

/**
 * Record `word` into `seen`, dropping any fragment it supersedes, and return
 * the number of distinct lookups that leaves.
 *
 * MUTATES `seen` — it is the caller's per-mount ref, and the whole point is
 * that the set carries across calls within one visit.
 *
 * Only strict prefixes are collapsed, and only in the direction typing produces
 * them: "mid" is dropped when "midnight" arrives, never the other way round.
 * Two words that merely share a stem ("lantern" / "lanterns" is a prefix pair,
 * "lantern" / "latern" is not) are the intended and only ambiguity here; a
 * visitor who really did look up both "mid" and "midnight" is counted once.
 * That undercount is deliberate and matches what the quota already charges them.
 */
export function recordLookup(seen: Set<string>, word: string): number {
  for (const older of [...seen]) {
    if (older !== word && word.startsWith(older)) seen.delete(older);
  }
  seen.add(word);
  return seen.size;
}
