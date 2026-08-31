/**
 * User-agent based bot detection for the analytics write path.
 *
 * WHY — measured, not assumed. The comfortable belief is that client-side JS
 * beacons are naturally human-only, because a crawler does not run scripts. That
 * is false for this site. Counting POSTs to /events and /pageviews across the
 * available nginx logs (2026-07-12..07-26):
 *
 *   total analytics writes           26,420
 *   from a self-identified crawler    7,567   (28.6%)
 *     AhrefsBot                       3,438
 *     Baiduspider-render              3,404   <- renders JS, fires our beacons
 *     bingbot                         1,258
 *     HeadlessChrome                     84
 *     Bytespider                         11
 *     YandexBot                           2
 *
 * So roughly three in every ten rows of our first-party analytics were never a
 * person. That inflates every denominator we have ever computed, and it lands
 * hardest on exactly the kind of event this project is about to add: an
 * IMPRESSION. The `events` table is currently 84% `recruit_banner_impression`
 * (3,950 of 4,690 rows), which went from 50 in June to 3,900 in July — an
 * observer-fired event on a high-traffic page is precisely what a JS-rendering
 * crawler manufactures at scale. An `ai_module_impression` denominator without
 * this filter would be worthless, and worse, it would look impressive.
 *
 * DROP, don't flag. The alternative was an `is_bot` column, which preserves the
 * rows for auditing. Dropping wins on two grounds: it removes 28.6% of writes
 * from a better-sqlite3 handle that also carries the subscription lifecycle on a
 * 1 vCPU droplet, and it means no future query can forget the filter and quietly
 * report bot numbers as human ones. nginx logs remain the audit trail for bot
 * behaviour.
 *
 * EXPECT A STEP CHANGE. From 2026-07-26 the events and pageviews tables count
 * roughly 28.6% fewer rows per day than before. That is a correction, not a
 * traffic collapse — do not compare a post-07-26 window against an earlier one
 * without accounting for it. The conversion digest says so out loud.
 *
 * This is deliberately UA-only: no fingerprinting, no behavioural scoring, no
 * challenge. It catches crawlers that honestly identify themselves, which is what
 * the measured contamination consists of. A crawler that lies about its UA gets
 * counted as human, and that is an acceptable residual — the goal is an honest
 * denominator, not adversarial bot defence.
 */

const { getRateLimitKey } = require("./client-ip");

// ONE COPY. routes/ai.js used to carry its own and now imports `isBotRequest`
// from here (routes/ai.js:16), so this is the only definition — an older comment
// here said "kept in sync with the copy in routes/ai.js", which was an invitation
// to go and re-create the duplicate.
//
// `lightpanda` added 2026-08-31. It is a headless browser built for AI agents and
// it self-identifies honestly as `Lightpanda/1.0`, which is exactly the population
// the paragraph above says this filter is for — it was simply missing from the
// headless cluster next to puppeteer/playwright.
//
// NOT A BREAKPOINT WORTH WARNING ABOUT, and that was measured before adding it
// rather than assumed: nginx shows 18 POSTs to /events from Lightpanda across
// several days of retained logs, against ~768/day in total from 67 distinct IPs —
// under 1%. So unlike the 2026-07-26 change above (a 28.6% step), no series moves
// visibly here, and no report needs a new caveat. Recorded because "we changed
// what gets counted and told nobody" is how the 08-10 and 08-31 incidents started,
// not because this one is large.
const BOT_UA_RE =
  /bot|spider|crawl|slurp|bingpreview|ahrefs|semrush|mj12|dotbot|petalbot|bytespider|headlesschrome|phantomjs|puppeteer|playwright|lightpanda|python-requests|python-urllib|go-http-client|java\/|okhttp|axios\/|node-fetch|libwww|lwp-|scrapy|curl\/|wget/i;

/**
 * True when the request looks automated.
 *
 * A missing or empty User-Agent counts as a bot: every real browser sends one,
 * and a beacon with no UA is either a script or a privacy tool aggressive enough
 * that we cannot claim it as a measured human either way.
 */
function isBotRequest(req) {
  const ua = req.get ? req.get("user-agent") : req.headers?.["user-agent"];
  if (!ua || typeof ua !== "string" || ua.trim().length === 0) return true;
  return BOT_UA_RE.test(ua);
}

// Rolling visibility without storing a row per bot hit. Logged on a long
// interval rather than per request, so the volume stays observable in PM2 logs
// without adding noise or database writes.
let droppedSinceLastReport = 0;
let reporter = null;

function noteDropped(kind) {
  droppedSinceLastReport += 1;
  if (reporter) return;
  reporter = setInterval(() => {
    if (droppedSinceLastReport > 0) {
      console.log(`[bot-filter] dropped ${droppedSinceLastReport} automated analytics writes in the last hour`);
      droppedSinceLastReport = 0;
    }
  }, 3_600_000);
  // Never hold the event loop open for a counter.
  if (reporter.unref) reporter.unref();
  void kind;
}

/**
 * Express middleware for analytics write routes ONLY.
 *
 * Answers a bot with the route's normal success status so nothing changes from
 * the caller's perspective — a crawler retrying a "failed" beacon would cost more
 * than the write we just avoided. Never mount this on anything a user's money or
 * account depends on.
 */
function rejectBotAnalytics(successStatus = 204) {
  return function botFilter(req, res, next) {
    // UA check ONLY. The daily cap deliberately does not run here — see
    // dailyCapGuard below for why the ordering matters.
    if (isBotRequest(req)) {
      noteDropped(req.path);
      return successStatus === 204 ? res.status(204).end() : res.json({ ok: true });
    }
    return next();
  };
}

/**
 * The daily cap, as its own middleware, mounted AFTER the per-minute limiter.
 *
 * It used to live inside rejectBotAnalytics, which mounts first — so overDailyCap()
 * incremented a caller's daily budget for requests the per-minute limiter was about
 * to reject with 429. Measured on 116.89.59.111 (2026-07-28): 15 writes accepted,
 * then 45 rejected with 429, and 15+45 = exactly the 60/day cap in force at the
 * time. The flooder consumed its entire daily allowance on requests that were never
 * stored, after which the bot filter short-circuited every later request with a
 * success status and the per-minute limiter was never reached again. The two limits
 * were cancelling each other out instead of layering.
 *
 * Correct order: cheap UA reject -> per-minute rate -> daily volume. A request only
 * spends daily budget if it was actually going to be written.
 */
function dailyCapGuard(successStatus = 204) {
  return function capGuard(req, res, next) {
    if (overDailyCap(getRateLimitKey(req))) {
      noteDropped(req.path);
      return successStatus === 204 ? res.status(204).end() : res.json({ ok: true });
    }
    return next();
  };
}

/**
 * Per-caller daily write cap for the analytics tables.
 *
 * WHY A SECOND FILTER — the user-agent one above is necessary and insufficient.
 * Measured over 2026-07-12..07-26 against nginx logs and the live DB:
 *
 *   POST /pageviews accepted writes           18,206
 *     self-identified crawlers (UA-visible)    4,095  (22.5%)  <- caught above
 *     UA-INVISIBLE automated volume           ~9,336  (51.3%)  <- caught here
 *
 * The invisible half is the larger half. One address, 174.173.86.177, wrote
 * 2,781 pageviews and 2,780 events — 5,561 rows from a single caller presenting a
 * perfectly ordinary desktop Chrome user-agent. A regex cannot see that; a volume
 * cap can. This is why the site's headline traffic figure has been overstated by
 * roughly 2.5x: about 59.5% of the 30-day pageviews table is not human.
 *
 * WHAT IT CANNOT DO, stated plainly: it does not stop a distributed rotation.
 * The same window contains a farm of 6,753 distinct IPs, and each one starts at
 * zero. That farm is, however, almost entirely a PAGEVIEW phenomenon — it rendered
 * 6,555 pages and fired exactly ONE interaction event — which is the finding that
 * matters for the AI gate: an interaction-gated event is far harder to manufacture
 * than a page render, so `/events` crawler share measured at 1.5% over the fortnight
 * versus 22.5% for pageviews.
 *
 * DO NOT read that as "the denominator is clean". An earlier version of this comment
 * claimed ~98% bot resistance, and a narrower window refutes the strong form: in the
 * four hours 11:00-14:59 on 2026-07-26, 55 of 84 POSTs to /events carried the
 * AhrefsBot user-agent. The dwell requirement in src/lib/use-impression.ts is a
 * filter, not a guarantee — which is why the gate report also carries concentration
 * guards on per-session and per-day share.
 *
 * CHOSEN CAP: 200 writes/day/caller — a backstop against the egregious, NOT a
 * discriminator. The two populations OVERLAP on daily volume and no single number
 * separates them. From the only COMPLETE day available (2026-07-27):
 *
 *   1194  73.64.29.130     flood
 *    116  103.111.225.188  flood
 *     73  31.223.31.46     REAL — a shared/NAT egress carrying three distinct
 *                          browsers (Samsung Android, macOS Chrome, Android
 *                          Firefox), sequential sessions over 5h17m, peaking at
 *                          only 9/min, with 304 revalidations. Several real people.
 *     55  212.93.144.111   flood
 *     17, 14, 14, 11, 9, 7, ...  real
 *
 * A real caller at 73 sits ABOVE a flood at 55. So this cap is set to catch the
 * 1,000-a-day class and nothing finer; the per-minute limiter in the routes is what
 * actually discriminates, because rate separates cleanly where volume does not.
 *
 * FOURTH VALUE IN THREE DAYS (300 -> 60 -> 30 -> 200) AND THE THIRD ONE WAS THE
 * WORST. I justified 30 with "the largest non-flood caller wrote FOUR" — a
 * distribution taken from a 6.6-hour PARTIAL day, hours after writing
 * server/scripts/traffic-truth.cjs whose stated rule is NEVER EXTRAPOLATE A PARTIAL
 * DAY. At 30, the NAT above would have silently lost 43 of its 73 writes. Any future
 * change to this number must be derived from complete UTC days only.
 *
 * WHY SILENT LOSS IS THE REAL HAZARD: an over-cap caller receives 204, identical to
 * a successful write. That is deliberate — a 429 invites beacon retries — but it
 * means clipping a real visitor produces no client-side signal at all. Hence the
 * attributable logging below: if we are going to drop writes invisibly to the
 * client, they must at least be visible to us.
 */
const DAILY_WRITE_CAP = Number(process.env.ANALYTICS_DAILY_WRITE_CAP) || 200;

// Bounded so an IP-rotation flood cannot turn this defence into a memory leak.
// On overflow we stop tracking NEW callers and let them through: failing open for
// an unknown caller is strictly better than failing closed on a real visitor.
const MAX_TRACKED_CALLERS = 50_000;

let writeCounts = new Map();
let windowDay = new Date().toISOString().slice(0, 10);
let overflowLogged = false;

function overDailyCap(key) {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== windowDay) {
    windowDay = today;
    writeCounts = new Map();
    overflowLogged = false;
  }

  const seen = writeCounts.get(key);
  if (seen === undefined) {
    if (writeCounts.size >= MAX_TRACKED_CALLERS) {
      if (!overflowLogged) {
        overflowLogged = true;
        console.error(
          `[bot-filter] tracking ${writeCounts.size} distinct callers today — cap table full, new callers pass unchecked`
        );
      }
      return false;
    }
    writeCounts.set(key, 1);
    return false;
  }

  if (seen >= DAILY_WRITE_CAP) {
    // Log the transition only, not every subsequent request — but WITH the caller
    // key. The previous version logged neither key nor count, so the cap hits in the
    // pm2 log were unattributable and there was no way to tell a flood from a
    // clipped office NAT after the fact.
    if (seen === DAILY_WRITE_CAP) {
      console.error(
        `[bot-filter] caller ${key} hit the ${DAILY_WRITE_CAP}/day cap — further writes dropped silently (204) until UTC midnight`
      );
      writeCounts.set(key, seen + 1);
    }
    return true;
  }

  writeCounts.set(key, seen + 1);
  return false;
}

module.exports = { isBotRequest, rejectBotAnalytics, dailyCapGuard, overDailyCap, DAILY_WRITE_CAP, BOT_UA_RE };
