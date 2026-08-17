import { describe, expect, it } from "vitest";

import rawIssues from "@/src/data/newsletter-issues.json";
import { newsletterIssues, issuePublishedAt, issueUpdatedAt } from "@/src/lib/newsletter-issues";
import { RESTORED_NOTES, RESTORED_SLUGS } from "@/src/lib/notes-restored";

/**
 * The guard for the retraction bug.
 *
 * Twice now a change to how issues are filtered has turned indexed, traffic-
 * earning pages into 404s without anyone noticing for months: 2026-03-31
 * (d0f6903, 303 URLs) and 2026-08-08 (f8cc6a3, 15 more). Both times the change
 * was locally correct — "don't publish future-dated content" — and both times
 * the damage was invisible because nothing in the repo recorded which URLs the
 * public already had.
 *
 * These assertions are that record. The guard deliberately does NOT consult
 * production analytics: a build that reaches for live data and a secret to
 * decide what to publish fails in the wrong direction, and fails silently when
 * the credential expires. The evidence is committed instead, in
 * notes-restored.ts, and the build only checks internal consistency with it.
 */
describe("restored notes stay reachable", () => {
  const served = new Map(newsletterIssues.map((i) => [i.slug, i]));
  const all = new Map((rawIssues as { slug: string }[]).map((i) => [i.slug, i]));

  it("serves every URL listed as restored", () => {
    const missing = RESTORED_NOTES.map((n) => n.slug).filter((s) => !served.has(s));
    expect(missing, `restored URLs that would 404: ${missing.join(", ")}`).toEqual([]);
  });

  it("lists only slugs that exist in the dataset", () => {
    const unknown = RESTORED_NOTES.map((n) => n.slug).filter((s) => !all.has(s));
    expect(unknown, `restored slugs with no issue: ${unknown.join(", ")}`).toEqual([]);
  });

  it("marks every restored issue with an explicit published status", () => {
    // Without `status`, a restored issue is served only while its scheduling
    // date happens to be in the past — which for cohort A is 2027 onward, i.e.
    // never. The status flag is what makes the restoration deliberate.
    const unflagged = RESTORED_NOTES
      .map((n) => served.get(n.slug))
      .filter((i): i is NonNullable<typeof i> => Boolean(i))
      .filter((i) => i.status !== "published");
    expect(unflagged.map((i) => i.slug)).toEqual([]);
  });

  it("never shows a reader, or a crawler, a date in the future", () => {
    // The bug this replaces: `date` doubled as the publication date, so a
    // restored 2028 issue would have announced itself as published in 2028 and
    // modified in 2028 — in OG, in JSON-LD, and in the sitemap.
    const today = new Date().toISOString().slice(0, 10);
    const future = newsletterIssues.filter(
      (i) => issuePublishedAt(i) > today || issueUpdatedAt(i) > today
    );
    expect(future.map((i) => `${i.slug} (${issuePublishedAt(i)}/${issueUpdatedAt(i)})`)).toEqual([]);
  });

  it("keeps the evidence honest", () => {
    // A slug earns its place here by measured demand, so an entry with no
    // requests at all is either a typo or someone restoring on a hunch.
    const unsupported = RESTORED_NOTES.filter((n) => n.requests30d < 1);
    expect(unsupported.map((n) => n.slug)).toEqual([]);
    expect(RESTORED_SLUGS.size).toBe(RESTORED_NOTES.length);
  });
});
