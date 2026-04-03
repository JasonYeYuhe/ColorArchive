"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/src/components/auth-provider";

import { API_URL } from "@/src/lib/api-config";
const ZERO_DECIMAL_CURRENCIES = new Set(["JPY", "KRW"]);
type LoadState = "idle" | "loading" | "success" | "error";

interface AnalyticsResponse {
  filters: {
    selected: {
      days: number;
      source: string | null;
      utmCampaign: string | null;
      utmSource: string | null;
      utmMedium: string | null;
      utmTerm: string | null;
      utmContent: string | null;
      landingPath: string | null;
    };
    options: {
      sources: string[];
      utmCampaigns: string[];
      utmSources: string[];
      utmMediums: string[];
      utmTerms: string[];
      utmContents: string[];
      landingPaths: string[];
    };
  };
  subscribers: {
    total: number;
    bySource: Array<{ source: string; count: number }>;
  };
  orders: {
    total: number;
    revenue: number;
  };
  comparisons: {
    subscribers: { current: number; previous: number; delta: number; change: number };
    orders: { current: number; previous: number; delta: number; change: number };
    revenue: { current: number; previous: number; delta: number; change: number };
  };
  sourceCohorts: Array<{
    source: string;
    subscribers: number;
    purchasers: number;
    orders: number;
    revenue: number;
    conversionRate: number;
  }>;
  funnel: {
    freePackSubscribers: number;
    waitlistSubscribers: number;
    purchasers: number;
    freePackPurchasers: number;
    waitlistPurchasers: number;
    freePackConversionRate: number;
    waitlistConversionRate: number;
  };
  series: {
    subscribers: Array<{ day: string; count: number }>;
    orders: Array<{ day: string; count: number; revenue: number }>;
  };
  products: Array<{ product: string; orders: number; revenue: number; currency: string }>;
  recent: {
    subscribers: Array<{
      email: string;
      source: string;
      utm_source?: string | null;
      utm_medium?: string | null;
      utm_campaign?: string | null;
      utm_term?: string | null;
      utm_content?: string | null;
      landing_path?: string | null;
      created_at: string;
    }>;
    orders: Array<{
      email: string;
      product: string;
      amount: number;
      currency: string;
      attributed_source?: string | null;
      attributed_utm_source?: string | null;
      attributed_utm_medium?: string | null;
      attributed_utm_campaign?: string | null;
      attributed_utm_term?: string | null;
      attributed_utm_content?: string | null;
      attributed_landing_path?: string | null;
      created_at: string;
    }>;
  };
}

function formatCurrency(amount: number, currency: string) {
  const normalizedCurrency = currency.toUpperCase();
  const divisor = ZERO_DECIMAL_CURRENCIES.has(normalizedCurrency) ? 1 : 100;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: normalizedCurrency,
    maximumFractionDigits: ZERO_DECIMAL_CURRENCIES.has(normalizedCurrency) ? 0 : 2,
  }).format(amount / divisor);
}

function formatShortDay(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatDelta(change: number) {
  const percent = Math.round(change * 100);
  const sign = percent > 0 ? "+" : "";
  return `${sign}${percent}% vs previous window`;
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-2xl border border-black/8 bg-white px-4 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900/15"
      >
        <option value="all">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function MetricCard({
  label,
  value,
  detail,
  comparison,
}: {
  label: string;
  value: string;
  detail: string;
  comparison: string;
}) {
  return (
    <article className="rounded-[1.7rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-neutral-950">{value}</div>
      <div className="mt-2 text-sm text-neutral-500">{detail}</div>
      <div className="mt-3 text-xs uppercase tracking-[0.14em] text-neutral-400">{comparison}</div>
    </article>
  );
}

function MiniBarChart({
  data,
  colorClass,
  label,
  valueFormatter,
}: {
  data: Array<{ day: string; value: number }>;
  colorClass: string;
  label: string;
  valueFormatter?: (value: number) => string;
}) {
  const maxValue = Math.max(...data.map((entry) => entry.value), 1);

  return (
    <div className="rounded-[1.4rem] border border-black/6 bg-neutral-50 px-4 py-4">
      <div className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">{label}</div>
      <div className="mt-4 flex h-40 items-end gap-2">
        {data.map((entry) => (
          <div key={entry.day} className="flex flex-1 flex-col items-center gap-2">
            <div className="text-[10px] text-neutral-400">
              {valueFormatter ? valueFormatter(entry.value) : entry.value}
            </div>
            <div className="flex h-28 w-full items-end">
              <div
                className={`w-full rounded-t-xl ${colorClass}`}
                style={{
                  height: `${Math.max((entry.value / maxValue) * 100, entry.value > 0 ? 8 : 2)}%`,
                }}
              />
            </div>
            <div className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">
              {formatShortDay(entry.day)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface BuyerEntry {
  emailMasked: string;
  orderCount: number;
  totalRevenue: number;
  firstPurchaseAt: string;
  lastPurchaseAt: string;
  products: string[];
}

export function AnalyticsPage() {
  const { analyticsAccess, status } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<LoadState>("idle");
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [error, setError] = useState("");

  const [buyerSource, setBuyerSource] = useState<string | null>(null);
  const [buyers, setBuyers] = useState<BuyerEntry[]>([]);
  const [buyerState, setBuyerState] = useState<LoadState>("idle");

  const [pageviewData, setPageviewData] = useState<{
    totalViews: number;
    uniquePaths: number;
    topPages: { path: string; views: number }[];
    dailyViews: { date: string; views: number }[];
    topReferrers: { referrer: string; views: number }[];
    deviceBreakdown: { device: string; views: number }[];
  } | null>(null);

  const filters = useMemo(
    () => ({
      days: searchParams.get("days") ?? "14",
      source: searchParams.get("source") ?? "all",
      utmCampaign: searchParams.get("utm_campaign") ?? "all",
      utmSource: searchParams.get("utm_source") ?? "all",
      utmMedium: searchParams.get("utm_medium") ?? "all",
      utmTerm: searchParams.get("utm_term") ?? "all",
      utmContent: searchParams.get("utm_content") ?? "all",
      landingPath: searchParams.get("landing_path") ?? "all",
    }),
    [searchParams],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState("loading");
      setError("");

      const apiSearchParams = new URLSearchParams();
      apiSearchParams.set("days", filters.days);
      if (filters.source !== "all") apiSearchParams.set("source", filters.source);
      if (filters.utmCampaign !== "all") apiSearchParams.set("utm_campaign", filters.utmCampaign);
      if (filters.utmSource !== "all") apiSearchParams.set("utm_source", filters.utmSource);
      if (filters.utmMedium !== "all") apiSearchParams.set("utm_medium", filters.utmMedium);
      if (filters.utmTerm !== "all") apiSearchParams.set("utm_term", filters.utmTerm);
      if (filters.utmContent !== "all") apiSearchParams.set("utm_content", filters.utmContent);
      if (filters.landingPath !== "all") apiSearchParams.set("landing_path", filters.landingPath);

      try {
        const response = await fetch(`${API_URL}/analytics?${apiSearchParams.toString()}`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Sign in to view analytics.");
          }
          if (response.status === 403) {
            throw new Error("This account does not have analytics access.");
          }
          throw new Error(`Analytics request failed with ${response.status}`);
        }

        const payload = (await response.json()) as AnalyticsResponse;
        if (!cancelled) {
          setData(payload);
          setState("success");
        }

        // Also fetch pageview stats (non-blocking)
        try {
          const pvRes = await fetch(`${API_URL}/pageviews/stats?days=${filters.days}`, {
            credentials: "include",
            headers: { Accept: "application/json" },
          });
          if (pvRes.ok && !cancelled) {
            setPageviewData(await pvRes.json());
          }
        } catch { /* pageview stats are optional */ }
      } catch (err) {
        if (!cancelled) {
          setState("error");
          setError(err instanceof Error ? err.message : "Failed to load analytics");
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [
    filters.days,
    filters.landingPath,
    filters.source,
    filters.utmCampaign,
    filters.utmContent,
    filters.utmMedium,
    filters.utmSource,
    filters.utmTerm,
  ]);

  async function handleCohortClick(source: string) {
    if (buyerSource === source) {
      setBuyerSource(null);
      setBuyers([]);
      return;
    }
    setBuyerSource(source);
    setBuyerState("loading");
    try {
      const qs = new URLSearchParams({ source, days: filters.days });
      const res = await fetch(`${API_URL}/analytics/buyers?${qs.toString()}`, {
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const payload = (await res.json()) as { buyers: BuyerEntry[] };
      setBuyers(payload.buyers);
      setBuyerState("success");
    } catch {
      setBuyerState("error");
    }
  }

  function updateFilter(key: string, value: string) {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    router.replace(nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname, {
      scroll: false,
    });
  }

  const dominantCurrency = useMemo(() => data?.recent.orders[0]?.currency ?? "JPY", [data]);
  const topSource = data?.subscribers.bySource[0];

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute left-0 top-0 h-56 w-56 rounded-full bg-sky-200/28 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-8 h-64 w-64 rounded-full bg-emerald-200/24 blur-3xl" />
          <div className="relative mx-auto max-w-5xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-neutral-500">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              Commerce analytics
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              Subscribers, orders, and attributed traffic
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600 sm:text-lg">
              Filter the live analytics feed by source, campaign, landing page, and deeper UTM
              fields to see which capture paths are producing actual buying behavior.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/admin/orders"
                className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Admin orders
              </Link>
              <Link
                href="/login?next=/login"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Account page
              </Link>
              <Link
                href="/notes/"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Notes archive
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-3 rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)] md:grid-cols-2 xl:grid-cols-4">
          <FilterSelect
            label="Range"
            value={filters.days}
            options={["14", "30", "90"]}
            onChange={(value) => updateFilter("days", value)}
          />
          <FilterSelect
            label="Source"
            value={filters.source}
            options={data?.filters.options.sources ?? []}
            onChange={(value) => updateFilter("source", value)}
          />
          <FilterSelect
            label="UTM Campaign"
            value={filters.utmCampaign}
            options={data?.filters.options.utmCampaigns ?? []}
            onChange={(value) => updateFilter("utm_campaign", value)}
          />
          <FilterSelect
            label="UTM Source"
            value={filters.utmSource}
            options={data?.filters.options.utmSources ?? []}
            onChange={(value) => updateFilter("utm_source", value)}
          />
          <FilterSelect
            label="UTM Medium"
            value={filters.utmMedium}
            options={data?.filters.options.utmMediums ?? []}
            onChange={(value) => updateFilter("utm_medium", value)}
          />
          <FilterSelect
            label="UTM Term"
            value={filters.utmTerm}
            options={data?.filters.options.utmTerms ?? []}
            onChange={(value) => updateFilter("utm_term", value)}
          />
          <FilterSelect
            label="UTM Content"
            value={filters.utmContent}
            options={data?.filters.options.utmContents ?? []}
            onChange={(value) => updateFilter("utm_content", value)}
          />
          <FilterSelect
            label="Landing Path"
            value={filters.landingPath}
            options={data?.filters.options.landingPaths ?? []}
            onChange={(value) => updateFilter("landing_path", value)}
          />
        </section>

        {state === "loading" || state === "idle" ? (
          <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-6 text-sm text-neutral-500 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            Loading analytics…
          </section>
        ) : null}

        {state === "error" ? (
          <section className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div>{error}</div>
            {status !== "authenticated" ? (
              <Link
                href="/login?next=/analytics"
                className="mt-4 inline-flex rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
              >
                Sign in
              </Link>
            ) : null}
          </section>
        ) : null}

        {status === "authenticated" && !analyticsAccess && state !== "success" ? (
          <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div>This account is signed in, but analytics access is limited to allowlisted admin emails.</div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/login?next=/login"
                className="inline-flex rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
              >
                Open account
              </Link>
              <Link
                href="/support/"
                className="inline-flex rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
              >
                Support
              </Link>
            </div>
          </section>
        ) : null}

        {data ? (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Subscribers"
                value={String(data.subscribers.total)}
                detail="Filtered subscriber captures in the selected window."
                comparison={formatDelta(data.comparisons.subscribers.change)}
              />
              <MetricCard
                label="Orders"
                value={String(data.orders.total)}
                detail="Attributed orders in the selected window."
                comparison={formatDelta(data.comparisons.orders.change)}
              />
              <MetricCard
                label="Revenue"
                value={formatCurrency(data.orders.revenue, dominantCurrency)}
                detail="Revenue in the selected filter scope."
                comparison={formatDelta(data.comparisons.revenue.change)}
              />
              <article className="rounded-[1.7rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  Top source
                </div>
                <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                  {topSource?.source ?? "n/a"}
                </div>
                <div className="mt-2 text-sm text-neutral-500">
                  {topSource ? `${topSource.count} subscribers in this filter.` : "No source data yet."}
                </div>
              </article>
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  Source cohorts
                </div>
                <div className="mt-4 grid gap-3">
                  {data.sourceCohorts.map((cohort) => (
                    <button
                      key={cohort.source}
                      type="button"
                      onClick={() => void handleCohortClick(cohort.source)}
                      className={`w-full rounded-[1rem] border px-4 py-4 text-left transition ${
                        buyerSource === cohort.source
                          ? "border-neutral-950/20 bg-neutral-100"
                          : "border-black/6 bg-neutral-50 hover:bg-neutral-100"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-neutral-950">{cohort.source}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-neutral-500">
                            {formatPercent(cohort.conversionRate)}
                          </span>
                          <svg
                            width="12" height="12" viewBox="0 0 12 12" fill="none"
                            aria-hidden="true"
                            className={`text-neutral-400 transition-transform ${buyerSource === cohort.source ? "rotate-180" : ""}`}
                          >
                            <path d="M2 4.5L6 8.5L10 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-neutral-500">
                        <span>{cohort.subscribers} subs</span>
                        <span>{cohort.purchasers} purchasers</span>
                        <span>{cohort.orders} orders</span>
                        <span>{formatCurrency(cohort.revenue, dominantCurrency)}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {buyerSource ? (
                  <div className="mt-4 rounded-[1rem] border border-black/8 bg-white p-4">
                    <div className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                      Buyers — {buyerSource}
                    </div>
                    {buyerState === "loading" ? (
                      <div className="text-sm text-neutral-400">Loading buyers…</div>
                    ) : buyerState === "error" ? (
                      <div className="text-sm text-red-500">Could not load buyer list.</div>
                    ) : buyers.length === 0 ? (
                      <div className="text-sm text-neutral-400">No buyers found for this source.</div>
                    ) : (
                      <div className="grid gap-2">
                        {buyers.map((buyer, i) => (
                          <div key={i} className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-black/6 bg-neutral-50 px-3 py-3 text-sm">
                            <div>
                              <div className="font-medium text-neutral-900">{buyer.emailMasked}</div>
                              <div className="mt-1 text-xs text-neutral-400">
                                {buyer.products.join(", ")}
                              </div>
                            </div>
                            <div className="text-right text-xs text-neutral-500">
                              <div>{buyer.orderCount} order{buyer.orderCount !== 1 ? "s" : ""}</div>
                              <div className="font-semibold text-neutral-900">{formatCurrency(buyer.totalRevenue, dominantCurrency)}</div>
                              <div className="mt-1">{buyer.firstPurchaseAt.slice(0, 10)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  Funnel
                </div>
                <div className="mt-4 grid gap-3">
                  <div className="rounded-[1rem] border border-black/6 bg-neutral-50 px-4 py-4">
                    <div className="text-sm font-medium text-neutral-950">Free resources → purchase</div>
                    <div className="mt-2 text-sm text-neutral-500">
                      {data.funnel.freePackPurchasers} of {data.funnel.freePackSubscribers} known
                      free-resources subscribers later purchased.
                    </div>
                    <div className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                      {formatPercent(data.funnel.freePackConversionRate)}
                    </div>
                  </div>
                  <div className="rounded-[1rem] border border-black/6 bg-neutral-50 px-4 py-4">
                    <div className="text-sm font-medium text-neutral-950">Waitlist → purchase</div>
                    <div className="mt-2 text-sm text-neutral-500">
                      {data.funnel.waitlistPurchasers} of {data.funnel.waitlistSubscribers} known
                      update subscribers later purchased.
                    </div>
                    <div className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                      {formatPercent(data.funnel.waitlistConversionRate)}
                    </div>
                  </div>
                  <div className="rounded-[1rem] border border-black/6 bg-neutral-50 px-4 py-4">
                    <div className="text-sm font-medium text-neutral-950">Distinct purchasers</div>
                    <div className="mt-2 text-sm text-neutral-500">
                      Buyers with at least one recorded order in this filter scope.
                    </div>
                    <div className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                      {data.funnel.purchasers}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <MiniBarChart
                label="Daily subscribers"
                colorClass="bg-sky-400"
                data={data.series.subscribers.map((entry) => ({
                  day: entry.day,
                  value: entry.count,
                }))}
              />
              <MiniBarChart
                label="Daily revenue"
                colorClass="bg-emerald-400"
                data={data.series.orders.map((entry) => ({
                  day: entry.day,
                  value: entry.revenue,
                }))}
                valueFormatter={(value) => formatCurrency(value, dominantCurrency)}
              />
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  Product breakdown
                </div>
                <div className="mt-4 space-y-3">
                  {data.products.map((product) => (
                    <div
                      key={product.product}
                      className="rounded-[1rem] border border-black/6 bg-neutral-50 px-4 py-4"
                    >
                      <div className="text-sm font-medium text-neutral-950">{product.product}</div>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-neutral-500">
                        <span>{product.orders} orders</span>
                        <span>{formatCurrency(product.revenue, product.currency)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  Recent subscriber captures
                </div>
                <div className="mt-4 space-y-3">
                  {data.recent.subscribers.map((subscriber) => (
                    <div
                      key={`${subscriber.email}-${subscriber.created_at}`}
                      className="rounded-[1rem] border border-black/6 bg-neutral-50 px-4 py-4"
                    >
                      <div className="text-sm font-medium text-neutral-950">{subscriber.email}</div>
                      <div className="mt-2 text-sm text-neutral-500">
                        {subscriber.source}
                        {subscriber.utm_source ? ` · ${subscriber.utm_source}` : ""}
                        {subscriber.utm_medium ? ` · ${subscriber.utm_medium}` : ""}
                        {subscriber.utm_campaign ? ` · ${subscriber.utm_campaign}` : ""}
                        {subscriber.landing_path ? ` · ${subscriber.landing_path}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Recent attributed orders
              </div>
              <div className="mt-4 grid gap-3">
                {data.recent.orders.map((order) => (
                  <div
                    key={`${order.email}-${order.product}-${order.created_at}`}
                    className="rounded-[1rem] border border-black/6 bg-neutral-50 px-4 py-4"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-sm font-medium text-neutral-950">{order.product}</div>
                        <div className="mt-1 text-sm text-neutral-500">
                          {order.email} · {order.attributed_source ?? "unattributed"}
                          {order.attributed_utm_source ? ` · ${order.attributed_utm_source}` : ""}
                          {order.attributed_utm_medium ? ` · ${order.attributed_utm_medium}` : ""}
                          {order.attributed_utm_campaign ? ` · ${order.attributed_utm_campaign}` : ""}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-neutral-700">
                        {formatCurrency(order.amount, order.currency)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : null}

        {pageviewData ? (
          <>
            <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Page views
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4">
                  <div className="text-2xl font-semibold text-neutral-950">{pageviewData.totalViews.toLocaleString()}</div>
                  <div className="mt-1 text-xs text-neutral-500">Total views ({filters.days}d)</div>
                </div>
                <div className="rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4">
                  <div className="text-2xl font-semibold text-neutral-950">{pageviewData.uniquePaths}</div>
                  <div className="mt-1 text-xs text-neutral-500">Unique pages viewed</div>
                </div>
                <div className="rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4">
                  <div className="text-2xl font-semibold text-neutral-950">
                    {pageviewData.deviceBreakdown.find((d) => d.device === "mobile")?.views ?? 0}
                    {" / "}
                    {pageviewData.deviceBreakdown.find((d) => d.device === "desktop")?.views ?? 0}
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">Mobile / Desktop</div>
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  Top pages
                </div>
                <div className="mt-4 grid gap-2">
                  {pageviewData.topPages.slice(0, 15).map((page) => (
                    <div
                      key={page.path}
                      className="flex items-center justify-between rounded-[1rem] border border-black/6 bg-neutral-50 px-4 py-3"
                    >
                      <span className="truncate text-sm text-neutral-700">{page.path}</span>
                      <span className="ml-3 shrink-0 text-sm font-medium text-neutral-950">{page.views}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  Top referrers
                </div>
                <div className="mt-4 grid gap-2">
                  {pageviewData.topReferrers.length > 0 ? (
                    pageviewData.topReferrers.map((ref) => (
                      <div
                        key={ref.referrer}
                        className="flex items-center justify-between rounded-[1rem] border border-black/6 bg-neutral-50 px-4 py-3"
                      >
                        <span className="truncate text-sm text-neutral-700">{ref.referrer}</span>
                        <span className="ml-3 shrink-0 text-sm font-medium text-neutral-950">{ref.views}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-neutral-400">No referrer data yet</div>
                  )}
                </div>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
