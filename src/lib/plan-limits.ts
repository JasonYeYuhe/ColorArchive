/**
 * Free-tier limits that the UI states out loud.
 *
 * The server owns enforcement; this file exists so the client stops guessing.
 * `projects-page.tsx` rendered "{n}/5 free" while server/routes/projects.js has
 * always rejected the 4th with "Free accounts can save up to 3 projects" — so a
 * user watched a counter climb toward 5 and got refused at 4, in a paid-upgrade
 * surface, which is the worst possible place to be caught miscounting.
 *
 * `src/lib/__tests__/plan-limits.test.ts` parses the server file and fails if
 * these drift apart again. Same arrangement as server/pricing.js ↔
 * checkout-config.ts: a mirror is only safe while something checks it.
 */

/** Saved projects a free account may keep. Mirrors FREE_PROJECT_LIMIT in
 *  server/routes/projects.js, which is what actually rejects the request. */
export const FREE_PROJECT_LIMIT = 3;

/**
 * Deliberately NOT re-declared here:
 *   - free daily exports (3) lives in src/components/pro-gate.tsx, which is the
 *     only thing that counts them;
 *   - free daily AI generations (10) is enforced in server/ai-rate-limit.js and
 *     surfaced through its own API response, so the UI never hardcodes it.
 * Add a limit here only when a page needs to SAY the number before the server
 * has had a chance to.
 */
