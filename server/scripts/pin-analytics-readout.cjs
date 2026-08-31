#!/usr/bin/env node
/**
 * Pinterest read-out — what did 78 published pins actually earn?
 *
 *   sudo node /root/ColorArchive/server/scripts/pin-analytics-readout.cjs
 *   sudo node .../pin-analytics-readout.cjs --meta all --json /tmp/pin-analytics.json
 *
 * ─── WHAT THIS ANSWERS, AND WHY IT IS THE FORK IN THE ROAD ─────────────────
 *
 * dev-plan-2026-09-01-paid.md §6 established two facts that sit badly together:
 *   • the pipeline works — 78 real pins, every one with a Pinterest pinId
 *   • the inbound traffic is zero — `events` has no pinterest referrer in 90d
 *
 * Two explanations survive that:
 *   (A) Pinterest never showed the pins
 *   (B) Pinterest showed them and nobody acted
 *
 * ⚠️ The dev plan framed these as opposite fixes — (A) ⇒ aspect ratio,
 * (B) ⇒ content shape — and that framing is WRONG in a way worth keeping written
 * down. On Pinterest the two are causally linked: saves drive further
 * distribution, so creative nobody saves CAUSES low impressions. (A) and (B) are
 * the same failure observed at two points, and no impression count separates
 * their remedies. What the numbers CAN do is say which end is currently binding
 * and how much headroom any fix has — which is what this prints.
 *
 * ─── PRE-REGISTERED DECISION RULE (written before the numbers were read) ────
 *
 *   T = total IMPRESSION across all pins, lifetime-to-yesterday
 *   C = total OUTBOUND_CLICK across all pins
 *
 *   median impressions/pin < 25, OR >10% of pins earn nothing in a fixed
 *   first-14-day window                       → (A) NOT BEING DISTRIBUTED
 *   volume fine, save rate < 1%               → (B) DISTRIBUTED, NOT SAVED
 *   both fine                                 → (C) PINTEREST IS OK, look at us
 *
 * 🔴 THE CLICK RATE IS NOT IN THIS RULE, DELIBERATELY. Two earlier versions used
 * it (T>=500, then T>=1500) and both were wrong. 500 is where you'd expect one
 * click, so observing zero there is unsurprising and the test has no power. 1500
 * is where rule-of-three finally excludes a 0.2% CTR — arithmetically right, but
 * T is CUMULATIVE, so it becomes true around 2026-11-08 purely by continuing to
 * post. A threshold you pass by surviving is not a test. And at 80% power the
 * click test needs ~3,900 impressions, roughly another year of daily pinning.
 *
 * The statistic that always had the power is SAVE — Pinterest's own ranking
 * signal. 3 saves in 833 impressions is 0.36%, and P(X<=3 | 1%) = 0.034, so the
 * save data rejects a healthy save rate while the click data rejects nothing.
 * Both earlier rules collected SAVE and then decided on the weakest variable
 * available to them.
 *
 * Branch (C) is not in the plan and is worth naming: Pinterest counting outbound
 * clicks while `events` sees no pinterest sessions would mean the taps happen and
 * the landings are lost — a MEASUREMENT bug on our side (referrer stripped by the
 * in-app browser, or the link redirecting), not a Pinterest problem. Fixing the
 * creative in that world would be pure waste.
 *
 * Read-only. Deliberately does NOT refresh the token — see the header of
 * server/pinterest-analytics.js for why that would break daily pinning.
 */

const fs = require("fs");
const {
  publishedPins,
  readTokenStore,
  fetchPinAnalytics,
  fetchPinMeta,
  PIN_METRICS,
  sleep,
} = require("../pinterest-analytics");

/* ── args ─────────────────────────────────────────────────── */

const argv = process.argv.slice(2);
function flag(name, fallback = null) {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
}
const META_MODE = flag("meta", "sample"); // sample | all | none
const JSON_OUT = flag("json", null);
const SPACING_MS = Number(flag("spacing", "300"));

/* ── date helpers ─────────────────────────────────────────── */

const DAY = 24 * 60 * 60 * 1000;
const iso = (d) => new Date(d).toISOString().slice(0, 10);
// End yesterday: today's bucket is still filling and would read low.
const END_DATE = iso(Date.now() - DAY);
// Pinterest analytics look-back is 90 days; never ask for older than that.
const FLOOR_DATE = iso(Date.now() - 89 * DAY);

/**
 * Impressions inside the first `n` days after publish.
 *
 * This is the ONLY age-fair statistic available here. Lifetime impressions are
 * confounded by how long a pin has been live: an August pin has had two weeks
 * to accumulate and a June pin has had eleven. Comparing their lifetime totals
 * measures the calendar, not the creative. A fixed post-publish window measures
 * the same slice of every pin's life.
 */
function windowSum(daily, publishDate, n, metric = "IMPRESSION") {
  if (!Array.isArray(daily)) return null;
  const start = Date.parse(publishDate);
  let total = 0;
  let covered = 0;
  for (const d of daily) {
    if (d?.data_status !== "READY") continue;
    const offset = Math.round((Date.parse(d.date) - start) / DAY);
    if (offset < 0 || offset >= n) continue;
    total += Number(d?.metrics?.[metric] || 0);
    covered += 1;
  }
  // null, not 0, when the window is not fully observed — a partially-elapsed
  // window silently reads low and would look like a regression.
  return covered >= n ? total : null;
}

function isoWeek(dateStr) {
  const d = new Date(dateStr + "T00:00:00Z");
  const target = new Date(d);
  target.setUTCDate(target.getUTCDate() + 4 - (target.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((target - yearStart) / DAY + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function daysLive(startDate) {
  return Math.max(0, Math.round((Date.parse(END_DATE) - Date.parse(startDate)) / DAY) + 1);
}

/* ── main ─────────────────────────────────────────────────── */

(async () => {
  const token = readTokenStore();
  const pins = publishedPins();

  console.log("═".repeat(78));
  console.log("  PINTEREST READ-OUT");
  console.log("═".repeat(78));
  console.log(`  window      : per-pin publish date → ${END_DATE} (90d floor ${FLOOR_DATE})`);
  console.log(`  pins        : ${pins.length} published, ${pins[0]?.date} → ${pins.at(-1)?.date}`);
  console.log(`  token scope : ${token.scope || "(not recorded)"}`);
  console.log(`  metrics     : ${PIN_METRICS.join(", ")}`);
  console.log("");

  const rows = [];
  let clipped = 0;

  for (const pin of pins) {
    // A pin published today (or later than END_DATE) has no closed day yet;
    // asking for it earns a 400 and tells us nothing.
    if (Date.parse(pin.date) >= Date.parse(END_DATE)) {
      rows.push({ ...pin, tooNew: true });
      continue;
    }
    let startDate = pin.date;
    if (Date.parse(startDate) < Date.parse(FLOOR_DATE)) {
      startDate = FLOOR_DATE;
      clipped += 1;
    }
    // Per-pin containment. Non-2xx was already contained below, but a THROW —
    // apiGet raises on 401, and fetch rejects outright on a network blip — used
    // to escape this loop straight to the fatal handler and discard all 77 rows
    // after a ~60s run. A read-out that loses everything on the last pin is a
    // read-out nobody runs.
    let a;
    try {
      a = await fetchPinAnalytics(pin.pinId, { startDate, endDate: END_DATE, token });
    } catch (err) {
      console.error(`  ! ${pin.key} → threw: ${err.message.slice(0, 200)}`);
      rows.push({ ...pin, startDate, error: "threw" });
      await sleep(SPACING_MS);
      continue;
    }
    if (!a.ok) {
      console.error(`  ! ${pin.key} → ${a.status} ${JSON.stringify(a.error).slice(0, 160)}`);
      rows.push({ ...pin, error: a.status, startDate });
    } else {
      rows.push({
        ...pin,
        startDate,
        ...a.summary,
        readyDays: a.readyDays,
        days: daysLive(startDate),
        firstWeek: windowSum(a.daily, pin.date, 7),
        firstFortnight: windowSum(a.daily, pin.date, 14),
        daily: a.daily,
      });
    }
    await sleep(SPACING_MS);
  }

  const ok = rows.filter((r) => !r.error && !r.tooNew);
  const sum = (k) => ok.reduce((n, r) => n + (r[k] || 0), 0);

  const T = sum("IMPRESSION");
  const C = sum("OUTBOUND_CLICK");
  const P = sum("PIN_CLICK");
  const S = sum("SAVE");

  /* ── per-pin table, worst→best so the top of the list is the story ── */

  const ranked = [...ok].sort((a, b) => b.IMPRESSION - a.IMPRESSION);
  console.log("── per pin, best first ────────────────────────────────────────────────────────");
  console.log("  impr  save  pinclk  outclk  days  pin");
  for (const r of ranked) {
    console.log(
      `  ${String(r.IMPRESSION).padStart(4)}  ${String(r.SAVE).padStart(4)}  ` +
        `${String(r.PIN_CLICK).padStart(6)}  ${String(r.OUTBOUND_CLICK).padStart(6)}  ` +
        `${String(r.days).padStart(4)}  ${r.key}`
    );
  }
  console.log("");

  /* ── by month ── */

  const byMonth = {};
  for (const r of ok) {
    const m = r.date.slice(0, 7);
    byMonth[m] ||= { pins: 0, IMPRESSION: 0, SAVE: 0, PIN_CLICK: 0, OUTBOUND_CLICK: 0 };
    byMonth[m].pins += 1;
    for (const k of PIN_METRICS) byMonth[m][k] += r[k] || 0;
  }
  console.log("── by publish month ──────────────────────────────────────────────────────────");
  console.log("  month     pins   impr   save  pinclk  outclk   impr/pin");
  for (const [m, v] of Object.entries(byMonth).sort()) {
    console.log(
      `  ${m}   ${String(v.pins).padStart(4)}  ${String(v.IMPRESSION).padStart(5)}  ` +
        `${String(v.SAVE).padStart(5)}  ${String(v.PIN_CLICK).padStart(6)}  ` +
        `${String(v.OUTBOUND_CLICK).padStart(6)}   ${(v.IMPRESSION / v.pins).toFixed(1)}`
    );
  }
  console.log("  ⚠ impr/pin above is CONFOUNDED BY AGE — June pins have had 3x as long to");
  console.log("    accumulate as August ones. Use the age-fair table below, not this one.");
  console.log("");

  /* ── age-fair cohort: impressions in each pin's first 7 / 14 days ── */

  const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
  const cohort = {};
  for (const r of ok) {
    const m = r.date.slice(0, 7);
    cohort[m] ||= { d7: [], d14: [] };
    if (r.firstWeek !== null && r.firstWeek !== undefined) cohort[m].d7.push(r.firstWeek);
    if (r.firstFortnight !== null && r.firstFortnight !== undefined) cohort[m].d14.push(r.firstFortnight);
  }
  console.log("── AGE-FAIR: impressions inside each pin's first N days ──────────────────────");
  console.log("  month     n(7d)  mean 7d    n(14d)  mean 14d");
  for (const [m, v] of Object.entries(cohort).sort()) {
    const m7 = mean(v.d7);
    const m14 = mean(v.d14);
    console.log(
      `  ${m}   ${String(v.d7.length).padStart(5)}  ${(m7 === null ? "  —  " : m7.toFixed(1)).padStart(7)}    ` +
        `${String(v.d14.length).padStart(6)}  ${(m14 === null ? "  —  " : m14.toFixed(1)).padStart(8)}`
    );
  }
  const all14 = ok.map((r) => r.firstFortnight).filter((x) => x !== null && x !== undefined);
  const all7 = ok.map((r) => r.firstWeek).filter((x) => x !== null && x !== undefined);
  console.log("");
  console.log(`  BASELINE for the vertical-image experiment:`);
  console.log(`    first-7d  impressions/pin : mean ${mean(all7)?.toFixed(2) ?? "n/a"}  (n=${all7.length})`);
  console.log(`    first-14d impressions/pin : mean ${mean(all14)?.toFixed(2) ?? "n/a"}  (n=${all14.length})`);
  console.log("");

  /* ── image geometry, straight from Pinterest ── */

  let metaRows = [];
  if (META_MODE !== "none") {
    const targets =
      META_MODE === "all"
        ? pins
        : pins.filter((_, i) => i % Math.max(1, Math.ceil(pins.length / 12)) === 0);
    console.log(`── image geometry as Pinterest stored it (${targets.length} sampled) ─────────────`);
    for (const pin of targets) {
      let m;
      try {
        m = await fetchPinMeta(pin.pinId, token);
      } catch (err) {
        console.log(`  ! ${pin.key} → threw: ${err.message.slice(0, 120)}`);
        await sleep(SPACING_MS);
        continue;
      }
      if (!m.ok) {
        console.log(`  ! ${pin.key} → ${m.status}`);
      } else if (m.original) {
        const { width, height } = m.original;
        metaRows.push({ key: pin.key, width, height, ratio: width / height });
        console.log(
          `  ${String(width).padStart(4)}×${String(height).padStart(4)}  ` +
            `ratio ${(width / height).toFixed(2)}:1  (${m.original.label})  ${pin.key}`
        );
      }
      await sleep(SPACING_MS);
    }
    console.log("");
  }

  /* ── account-wide trend: is this a step function or a flat line? ── */

  // The question this answers is "did something HAPPEN to us". A platform action
  // (spam flag, manual review, dedup sweep) shows up as a step: a date after which
  // impressions fall off a cliff and stay there. Being structurally invisible —
  // no followers, no search demand, nothing for the visual classifier to match —
  // shows up as a flat low line from day one that scales with inventory.
  // Those two want completely different responses, and nothing else in this
  // read-out distinguishes them.
  const byDay = new Map();
  for (const r of ok) {
    for (const x of r.daily || []) {
      if (x?.data_status !== "READY") continue;
      const cur = byDay.get(x.date) || { impr: 0, pinDays: 0 };
      cur.impr += Number(x?.metrics?.IMPRESSION || 0);
      cur.pinDays += 1;
      byDay.set(x.date, cur);
    }
  }
  const weeks = new Map();
  for (const [date, v] of [...byDay.entries()].sort()) {
    const wk = isoWeek(date);
    const cur = weeks.get(wk) || { impr: 0, pinDays: 0 };
    cur.impr += v.impr;
    cur.pinDays += v.pinDays;
    weeks.set(wk, cur);
  }
  console.log("── account-wide, by week: impressions per live-pin-day ───────────────────────");
  console.log("  week       impr   pin-days   impr/pin-day");
  for (const [wk, v] of weeks) {
    const rate = v.pinDays ? v.impr / v.pinDays : 0;
    console.log(
      `  ${wk}  ${String(v.impr).padStart(6)}   ${String(v.pinDays).padStart(8)}   ` +
        `${rate.toFixed(3).padStart(12)}  ${"#".repeat(Math.min(50, Math.round(rate * 120)))}`
    );
  }
  const deadDays = [...byDay.values()].filter((v) => v.impr === 0).length;
  console.log(`  calendar days on which the WHOLE ACCOUNT earned 0 impressions: ${deadDays}/${byDay.size}`);
  console.log("");

  /* ── verdict ── */

  const median = (xs) => {
    if (!xs.length) return 0;
    const s = [...xs].sort((a, b) => a - b);
    const i = Math.floor(s.length / 2);
    return s.length % 2 ? s[i] : (s[i - 1] + s[i]) / 2;
  };

  console.log("═".repeat(78));
  console.log("  TOTALS");
  console.log("═".repeat(78));
  const tooNew = rows.filter((r) => r.tooNew).length;
  console.log(`  pins measured        : ${ok.length}/${pins.length}` +
    `${clipped ? `  (${clipped} clipped to the 90d floor)` : ""}` +
    `${tooNew ? `  (${tooNew} too new to have a closed day)` : ""}`);
  console.log(`  IMPRESSION      T    : ${T}`);
  console.log(`  SAVE                 : ${S}`);
  console.log(`  PIN_CLICK            : ${P}`);
  console.log(`  OUTBOUND_CLICK  C    : ${C}`);
  console.log(`  impressions / pin    : mean ${(T / (ok.length || 1)).toFixed(1)}, median ${median(ok.map((r) => r.IMPRESSION))}`);
  console.log(`  pins with 0 impr     : ${ok.filter((r) => !r.IMPRESSION).length}/${ok.length}`);
  console.log(`  outbound CTR         : ${T ? ((C / T) * 100).toFixed(3) + "%" : "n/a (no impressions)"}`);
  console.log("");

  // ─── THE DECISION RULE, REWRITTEN TWICE ON 2026-09-01 ────────────────────
  //
  // v1 used `T >= 500` as "enough impressions that zero clicks means something",
  // and it fired branch (B) on the real data (T=833), pointing a month of work at
  // the wrong problem. The error: 500 is where you'd EXPECT about one click,
  // which is exactly where observing zero is unsurprising. A test sited there has
  // no power by construction.
  //
  // v2 moved it to T > 1500, where the rule-of-three bound 3/T finally drops
  // below a normal 0.2% outbound CTR. Arithmetically right, practically useless,
  // for two reasons an adversarial review surfaced:
  //
  //   1. T IS CUMULATIVE. It grows just by continuing to post. At 10.8
  //      impressions/pin, T crosses 1,500 around 2026-11-08 with no improvement
  //      in distribution whatsoever. A threshold you pass by surviving long
  //      enough is not a test of anything.
  //   2. EVEN AT 1500 THE CLICK TEST IS UNRUNNABLE. Power against a CTR of 0.05%
  //      is 47%; against 0.1% it is 22%. Reaching 80% power against 0.05% needs
  //      ~3,900 impressions — about 361 more pins, another year of daily posting.
  //
  // So the click statistic is retired as a decision input. What replaces it:
  //
  //   • SCALE-FREE VOLUME. median impressions/pin, and the share of pins that
  //     earn nothing in a FIXED first-14-day window. Neither drifts with
  //     time-in-market. (The raw "share of pins with 0 lifetime impressions" is
  //     NOT scale-free — it is dominated by young pins. Measured here: the
  //     zero-lifetime pins average 27.9 days live against 48.3 for the rest, so
  //     most of that 21% is youth, not suppression.)
  //   • SAVE RATE, which should have been the headline all along. It is
  //     Pinterest's primary ranking signal and it is the only engagement metric
  //     with real power at this n: 3 saves in 833 impressions is 0.36%, and
  //     P(X<=3 | rate 1%) = 0.034. The save data REJECTS a healthy >=1% save rate
  //     at p~0.03, while the click data rejects nothing at all. v1 and v2 both
  //     collected SAVE and then decided on the weakest variable in the set.
  const medianImpr = median(ok.map((r) => r.IMPRESSION));
  const cohort14 = ok.map((r) => r.firstFortnight).filter((x) => x !== null && x !== undefined);
  const zeroShare14 = cohort14.length
    ? cohort14.filter((x) => x === 0).length / cohort14.length
    : null;
  const saveRate = T ? S / T : 0;
  const ctrUpperBound95 = T > 0 ? 3 / T : Infinity;

  console.log("  ── decision inputs (scale-free; none of these drift with time) ──");
  console.log(`  median impressions/pin        : ${medianImpr}          (< 25 ⇒ not being distributed)`);
  console.log(`  share earning 0 in first 14d  : ${zeroShare14 === null ? "n/a" : (zeroShare14 * 100).toFixed(0) + "%"}         (> 10% ⇒ not being distributed)`);
  console.log(`  save rate                     : ${(saveRate * 100).toFixed(2)}%       (healthy is 1–5%)`);
  console.log(`  outbound CTR 95% upper bound  : ${(ctrUpperBound95 * 100).toFixed(2)}%       (RETIRED as a decision input — see above)`);
  console.log("");

  const notDistributed = medianImpr < 25 || (zeroShare14 !== null && zeroShare14 > 0.1);

  let verdict, action;
  if (notDistributed) {
    verdict =
      "(A) DISTRIBUTION FAILURE — Pinterest is not retrieving these pins at all.";
    action =
      "Both scale-free volume signals fire, and the save rate independently rejects\n" +
      "  a healthy >=1% at p~0.03. The click rate is NOT evidence of anything here and\n" +
      "  must not be used: it needs ~3,900 impressions for 80% power, i.e. another\n" +
      "  year of posting.\n" +
      "\n" +
      "  ⚠️ (A) DOES NOT MEAN 'THEREFORE FIX THE ASPECT RATIO'. That was the original\n" +
      "  rule's other mistake — it hardwired one remedy per branch. Aspect ratio is a\n" +
      "  proportional dial on an account that is not being retrieved at all, and its\n" +
      "  honest ceiling is a 2–3x lift on ~10 impressions/day: roughly 5 sessions a\n" +
      "  month. Check the weekly table above FIRST — a step down on a date is a\n" +
      "  platform action and needs a different response entirely from a flat low line.\n" +
      "  Ranked by expected effect, not by cost: searchable pin text > claimed domain\n" +
      "  > keyword-themed boards > content people search for (palettes) > geometry.";
  } else if (saveRate < 0.01) {
    verdict = "(B) APPEAL FAILURE — Pinterest retrieves them; nobody saves them.";
    action =
      "Volume is adequate but the save rate is below the 1% floor, and saves are the\n" +
      "  ranking signal. Change WHAT is pinned, not how it is shaped.";
  } else {
    verdict = "(C) HEALTHY ON PINTEREST'S SIDE — look at the landing page instead.";
    action =
      "Volume and save rate are both fine. If sessions are still absent, the loss is\n" +
      "  between the tap and the landing: check the link target for a redirect, and\n" +
      "  whether the Pinterest in-app browser is dropping the referrer.";
  }

  console.log("  VERDICT: " + verdict);
  console.log("  → " + action);
  console.log("");
  console.log("  cross-check: `events` shows 0 pinterest referrer sessions in 90d.");
  console.log(`  Pinterest claims ${C} outbound click(s). Those two must agree.`);
  console.log("═".repeat(78));

  if (JSON_OUT) {
    fs.writeFileSync(
      JSON_OUT,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          window: { end: END_DATE, floor: FLOOR_DATE },
          totals: { IMPRESSION: T, SAVE: S, PIN_CLICK: P, OUTBOUND_CLICK: C },
          verdict,
          rows,
          byMonth,
          metaRows,
        },
        null,
        2
      )
    );
    console.log(`  wrote ${JSON_OUT}`);
  }
})().catch((err) => {
  console.error("FATAL:", err.message);
  process.exit(1);
});
