import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

/**
 * A signup form must actually put the reader on the list its copy promises.
 *
 * /notes/ told readers "Get new issues by email — delivered when they land" and
 * rendered <EmailCaptureForm source="notes-list" />. That component POSTed only
 * { email, source }, and POST /subscribe defaults `notes` to false, so everyone
 * who signed up was written to `subscribers` belonging to NO list. They could
 * never receive an issue.
 *
 * The damage was zero — measured, not assumed: not one row in `subscribers` has
 * source 'notes-list' or 'notes-latest', so nobody ever used the form. But
 * notes_subscribed = 0 across all 12 subscribers is precisely why the weekly
 * cron had nobody to send to, and it made "the newsletter has no audience" look
 * like a demand problem when it was a wiring problem.
 *
 * This is the same shape as the alarms this repo keeps finding: a thing that
 * reports success while doing nothing.
 */
describe("an email form joins the list its copy promises", () => {
  function walk(dir: string, out: string[] = []): string[] {
    for (const entry of readdirSync(dir)) {
      if (entry === "node_modules" || entry === "__tests__" || entry.startsWith(".")) continue;
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full, out);
      else if (/\.tsx$/.test(full)) out.push(full);
    }
    return out;
  }

  const FILES = [...walk(join(ROOT, "src", "components")), ...walk(join(ROOT, "app"))];

  /**
   * Usages that are deliberately NOT newsletter signups, with the reason. An
   * allowlist rather than a copy-sniffing heuristic: the rule should fail when
   * someone adds a new form and forgets, not quietly pass because the wording
   * dodged a regex.
   */
  const NOT_A_LIST: Record<string, string> = {
    "src/components/free-resources-page.tsx":
      "download gate — asks for an email to send the free files, promises no recurring issues",
  };

  it("every EmailCaptureForm either joins a list or is a declared non-list form", () => {
    const offenders: string[] = [];

    for (const file of FILES) {
      const rel = file.slice(ROOT.length + 1);
      const body = readFileSync(file, "utf8");
      if (!body.includes("<EmailCaptureForm")) continue;

      // Each usage: from the tag to its closing "/>".
      for (const m of body.matchAll(/<EmailCaptureForm[\s\S]*?\/>/g)) {
        const usage = m[0];
        const joinsList = /(^|\s)notes(\s|=|\n)/.test(usage) || /(^|\s)cotd(\s|=|\n)/.test(usage);
        if (joinsList) continue;
        if (NOT_A_LIST[rel]) continue;
        offenders.push(
          `${rel}: <EmailCaptureForm> joins no list. Pass \`notes\` (or \`cotd\`), or add the ` +
            `file to NOT_A_LIST with the reason it is not a newsletter signup.`,
        );
      }
    }

    expect(offenders, offenders.join("\n")).toEqual([]);
  });

  it("the form is capable of joining the notes list at all", () => {
    // Pins the fix itself: the prop must exist AND be forwarded to /subscribe.
    // Without the second half the prop would type-check, read correctly at every
    // call site, and still send nothing — which is the original bug wearing a
    // different hat.
    const body = readFileSync(join(ROOT, "src/components/email-capture-form.tsx"), "utf8");
    expect(body, "notes prop missing").toMatch(/notes\?:\s*boolean/);
    const payload = /body:\s*JSON\.stringify\(\{[\s\S]*?\}\)/.exec(body)?.[0] ?? "";
    expect(payload, "`notes` is never sent to /subscribe").toMatch(/(^|\s)notes,/m);
  });

  it("the declared non-list form really does not promise recurring issues", () => {
    // Guards the allowlist against becoming a place to hide a broken promise.
    for (const [rel, reason] of Object.entries(NOT_A_LIST)) {
      const body = readFileSync(join(ROOT, rel), "utf8");
      expect(
        /new issues by email|delivered when they land|every week|weekly issue/i.test(body),
        `${rel} is allowlisted as "${reason}" but its copy promises recurring issues`,
      ).toBe(false);
    }
  });
});
