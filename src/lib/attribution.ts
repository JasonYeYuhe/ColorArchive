/**
 * First-touch acquisition attribution — the exit-gate's source-of-truth for "where did
 * this visitor come from". Captured ONCE on the first page the browser ever loads, then
 * persisted in localStorage so it survives in-site navigation and return visits.
 *
 * Why first-touch + persisted (not read-at-submit): the funnel events the exit gate reads
 * (`word_paywall_*`, `preorder_*`) and the conversion forms fire deep in the site, long
 * after the UTM params have fallen off the URL. Reading `searchParams` at submit time
 * (the old per-form approach) loses attribution for anyone who clicks around before
 * converting — so the funnel could never be split by channel. This module captures the
 * landing context exactly once and hands the same value to every downstream event.
 *
 * The derived `channel` is the field the exit gate actually keys on: it lets us tell a
 * qualified ICP source (a11y / design-systems / LinkedIn / direct outreach) apart from
 * generic-traffic gawkers (HN / broad subreddits / organic search), so a "500 UV met but
 * 0 preorders" reading can be diagnosed as "fed the wrong people" vs. "no demand".
 *
 * SSR-safe and never throws (Safari private mode throws on localStorage).
 */

const STORAGE_KEY = "ca_attr_v1";

export interface Attribution {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  referrer: string | null;
  referrerDomain: string | null;
  landingPath: string | null;
  channel: string;
  firstSeen: string;
}

const EMPTY: Attribution = {
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
  utmTerm: null,
  utmContent: null,
  referrer: null,
  referrerDomain: null,
  landingPath: null,
  channel: "direct",
  firstSeen: "",
};

function hostOf(url: string): string | null {
  try {
    const h = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    return h || null;
  } catch {
    return null;
  }
}

function isOwnDomain(host: string | null): boolean {
  if (!host) return false;
  return (
    host.endsWith("colorarchive.org") ||
    host.endsWith("colorarchive.me") ||
    host === "localhost" ||
    host.startsWith("127.")
  );
}

/**
 * Map the raw landing context to a small, ICP-readable channel bucket. A UTM tag (set by
 * the operator on every distribution link) wins; otherwise we classify by referrer host;
 * otherwise it's direct. Unknown UTM tags / referrers are preserved verbatim (`utm:foo`,
 * `referral:bar.com`) so no campaign is silently dropped.
 */
export function classifyChannel(
  utmSource: string | null,
  utmMedium: string | null,
  referrerDomain: string | null,
): string {
  const s = (utmSource || "").toLowerCase().trim();
  const m = (utmMedium || "").toLowerCase().trim();

  if (s) {
    if (/linkedin|lnkd/.test(s)) return "linkedin";
    if (/twitter|^x$|x\.com/.test(s)) return "x";
    if (/reddit/.test(s)) return "reddit";
    if (/hacker|^hn$|ycombinator/.test(s)) return "hackernews";
    if (/producthunt|product-hunt|^ph$/.test(s)) return "producthunt";
    if (/news?letter|email|mailing|crm|resend/.test(s) || /email|newsletter/.test(m)) return "email";
    if (/slack/.test(s)) return "slack";
    if (/discord/.test(s)) return "discord";
    if (/facebook|^fb$/.test(s)) return "facebook";
    if (/instagram|^ig$/.test(s)) return "instagram";
    if (/pinterest/.test(s)) return "pinterest";
    if (/telegram|^tg$|t\.me/.test(s)) return "telegram";
    if (/a11y|accessib/.test(s)) return "a11y-community";
    if (/design.?system|design.?ops|dropops/.test(s)) return "design-systems";
    return `utm:${s.slice(0, 24)}`;
  }

  const d = referrerDomain;
  if (d) {
    if (isOwnDomain(d)) return "direct"; // self-referral on first touch ≈ attribution missed
    if (/(^|\.)(google|bing|duckduckgo|yahoo|ecosia|brave|baidu)\./.test(d)) return "organic-search";
    if (/(^|\.)(t\.co|twitter\.com|x\.com)$/.test(d)) return "x";
    if (/reddit\.com$/.test(d)) return "reddit";
    if (/(news\.ycombinator\.com|hn\.algolia)/.test(d)) return "hackernews";
    if (/(linkedin\.com|lnkd\.in)$/.test(d)) return "linkedin";
    if (/producthunt\.com$/.test(d)) return "producthunt";
    if (/(facebook\.com|fb\.com)$/.test(d)) return "facebook";
    if (/instagram\.com$/.test(d)) return "instagram";
    if (/pinterest\./.test(d)) return "pinterest";
    if (/(^|\.)(t\.me|telegram\.(org|me))$/.test(d)) return "telegram";
    if (/(github\.com|github\.io)$/.test(d)) return "github";
    if (/slack\.com$/.test(d)) return "slack";
    if (/(discord\.com|discord\.gg)$/.test(d)) return "discord";
    return `referral:${d.slice(0, 40)}`;
  }

  return "direct";
}

// Redact email-like substrings from free-text UTM values before they are persisted (first
// party SQLite stores these in plaintext) or sent to PostHog. Mirrors posthog.ts scrubPII so
// a crafted ?utm_source=someone@example.com link can't smuggle PII into the analytics store.
const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

function capture(): Attribution {
  const params = new URLSearchParams(window.location.search);
  const get = (k: string) => {
    const v = params.get(k);
    return v ? v.replace(EMAIL_RE, "[redacted]").slice(0, 120) : null;
  };

  const referrer = (document.referrer || "").slice(0, 512) || null;
  const referrerDomain = referrer ? hostOf(referrer) : null;
  const utmSource = get("utm_source");
  const utmMedium = get("utm_medium");

  return {
    utmSource,
    utmMedium,
    utmCampaign: get("utm_campaign"),
    utmTerm: get("utm_term"),
    utmContent: get("utm_content"),
    referrer,
    referrerDomain,
    landingPath: window.location.pathname.slice(0, 200),
    channel: classifyChannel(utmSource, utmMedium, referrerDomain),
    firstSeen: new Date().toISOString(),
  };
}

let memo: Attribution | null = null;

/**
 * Read the persisted first-touch attribution, capturing + storing it on the first call of
 * the browser's lifetime. Memoized per page load. Returns a safe empty value on the server
 * and if storage is unavailable.
 */
export function getAttribution(): Attribution {
  if (typeof window === "undefined") return EMPTY;
  if (memo) return memo;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<Attribution>;
      memo = { ...EMPTY, ...parsed };
      return memo;
    }
  } catch {
    /* storage unreadable — fall through to capture (won't persist, but still attributes this session) */
  }

  const fresh = capture();
  memo = fresh;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  } catch {
    /* private mode — keep the in-memory value for this session */
  }
  return fresh;
}

/**
 * Compact, snake_cased subset for first-party events + pageviews (matches the server
 * column names). Null/empty fields are omitted to keep beacons small.
 */
export function attributionEventProps(): Record<string, string> {
  const a = getAttribution();
  const out: Record<string, string> = { channel: a.channel };
  if (a.utmSource) out.utm_source = a.utmSource;
  if (a.utmMedium) out.utm_medium = a.utmMedium;
  if (a.utmCampaign) out.utm_campaign = a.utmCampaign;
  if (a.referrerDomain) out.referrer_domain = a.referrerDomain;
  if (a.landingPath) out.landing_path = a.landingPath;
  return out;
}

/**
 * camelCase shape for the /subscribe + checkout attribution body. Sourced from the
 * persisted first-touch value so subscriber/order attribution no longer depends on the
 * UTM still being in the URL at submit time.
 */
export function attributionForSubscribe(): {
  landingPath: string | null;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
} {
  const a = getAttribution();
  return {
    landingPath: a.landingPath,
    referrer: a.referrer,
    utmSource: a.utmSource,
    utmMedium: a.utmMedium,
    utmCampaign: a.utmCampaign,
    utmTerm: a.utmTerm,
    utmContent: a.utmContent,
  };
}

// Capture first-touch at client module-eval — the earliest possible moment, before any React
// effect runs. This matters because some pages rewrite the URL on mount (e.g. /word-to-color
// does router.replace(`?q=…`), stripping inbound utm_*); if the first getAttribution() call
// happened from one of those effects it would read the already-rewritten URL and lose the
// real landing attribution. Module-eval precedes hydration + effects, so the landing URL is
// intact here. Idempotent + guarded; never throws.
if (typeof window !== "undefined") {
  try {
    getAttribution();
  } catch {
    /* never break import */
  }
}
