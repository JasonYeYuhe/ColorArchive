"use client";

import { useEffect, useMemo, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.colorarchive.me";

interface AnalyticsResponse {
  subscribers: {
    total: number;
    bySource: Array<{ source: string; count: number }>;
  };
  orders: {
    total: number;
    revenue: number;
  };
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
    subscribers: Array<{ email: string; source: string; created_at: string }>;
    orders: Array<{
      email: string;
      product: string;
      amount: number;
      currency: string;
      created_at: string;
    }>;
  };
}

type LoadState = "idle" | "loading" | "success" | "error";

const ZERO_DECIMAL_CURRENCIES = new Set(["JPY", "KRW"]);

function formatCurrency(amount: number, currency: string) {
  const normalizedCurrency = currency.toUpperCase();
  const divisor = ZERO_DECIMAL_CURRENCIES.has(normalizedCurrency) ? 1 : 100;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: normalizedCurrency,
    maximumFractionDigits: ZERO_DECIMAL_CURRENCIES.has(normalizedCurrency) ? 0 : 2,
  }).format(amount / divisor);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
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
      <div className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
        {label}
      </div>
      <div className="mt-4 flex h-40 items-end gap-2">
        {data.map((entry) => (
          <div key={entry.day} className="flex flex-1 flex-col items-center gap-2">
            <div className="text-[10px] text-neutral-400">
              {valueFormatter ? valueFormatter(entry.value) : entry.value}
            </div>
            <div className="flex h-28 w-full items-end">
              <div
                className={`w-full rounded-t-xl ${colorClass}`}
                style={{ height: `${Math.max((entry.value / maxValue) * 100, entry.value > 0 ? 8 : 2)}%` }}
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

export function AnalyticsPage() {
  const [state, setState] = useState<LoadState>("idle");
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState("loading");
      setError("");

      try {
        const response = await fetch(`${API_URL}/analytics`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Analytics request failed with ${response.status}`);
        }

        const payload = (await response.json()) as AnalyticsResponse;
        if (!cancelled) {
          setData(payload);
          setState("success");
        }
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
  }, []);

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
              Subscribers, orders, and recent activity
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600 sm:text-lg">
              This page reads directly from the live API so you can inspect free-pack capture,
              waitlist growth, and purchase activity without leaving the site.
            </p>
          </div>
        </section>

        {state === "loading" || state === "idle" ? (
          <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-6 text-sm text-neutral-500 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            Loading analytics…
          </section>
        ) : null}

        {state === "error" ? (
          <section className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            {error}
          </section>
        ) : null}

        {data ? (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-[1.7rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  Subscribers
                </div>
                <div className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-neutral-950">
                  {data.subscribers.total}
                </div>
                <div className="mt-2 text-sm text-neutral-500">
                  Across free-pack, waitlist, and purchase capture.
                </div>
              </article>

              <article className="rounded-[1.7rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  Orders
                </div>
                <div className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-neutral-950">
                  {data.orders.total}
                </div>
                <div className="mt-2 text-sm text-neutral-500">
                  Live orders processed through Lemon Squeezy.
                </div>
              </article>

              <article className="rounded-[1.7rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  Revenue
                </div>
                <div className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-neutral-950">
                  {formatCurrency(data.orders.revenue, dominantCurrency)}
                </div>
                <div className="mt-2 text-sm text-neutral-500">
                  Based on the order records currently stored in SQLite.
                </div>
              </article>

              <article className="rounded-[1.7rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  Top source
                </div>
                <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                  {topSource?.source ?? "n/a"}
                </div>
                <div className="mt-2 text-sm text-neutral-500">
                  {topSource ? `${topSource.count} subscribers so far.` : "No source data yet."}
                </div>
              </article>
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  Subscriber sources
                </div>
                <div className="mt-4 space-y-3">
                  {data.subscribers.bySource.map((source) => (
                    <div
                      key={source.source}
                      className="flex items-center justify-between rounded-[1rem] border border-black/6 bg-neutral-50 px-4 py-3"
                    >
                      <div className="text-sm font-medium text-neutral-950">{source.source}</div>
                      <div className="text-sm text-neutral-500">{source.count}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  Funnel
                </div>
                <div className="mt-4 grid gap-3">
                  <div className="rounded-[1rem] border border-black/6 bg-neutral-50 px-4 py-4">
                    <div className="text-sm font-medium text-neutral-950">
                      Free pack → purchase
                    </div>
                    <div className="mt-2 text-sm text-neutral-500">
                      {data.funnel.freePackPurchasers} of {data.funnel.freePackSubscribers} known free-pack subscribers later purchased.
                    </div>
                    <div className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                      {formatPercent(data.funnel.freePackConversionRate)}
                    </div>
                  </div>
                  <div className="rounded-[1rem] border border-black/6 bg-neutral-50 px-4 py-4">
                    <div className="text-sm font-medium text-neutral-950">
                      Waitlist → purchase
                    </div>
                    <div className="mt-2 text-sm text-neutral-500">
                      {data.funnel.waitlistPurchasers} of {data.funnel.waitlistSubscribers} known update subscribers later purchased.
                    </div>
                    <div className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                      {formatPercent(data.funnel.waitlistConversionRate)}
                    </div>
                  </div>
                  <div className="rounded-[1rem] border border-black/6 bg-neutral-50 px-4 py-4">
                    <div className="text-sm font-medium text-neutral-950">
                      Distinct purchasers
                    </div>
                    <div className="mt-2 text-sm text-neutral-500">
                      Buyers with at least one recorded order in the current database.
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
                colorClass="bg-neutral-950"
                data={data.series.subscribers.map((entry) => ({ day: entry.day, value: entry.count }))}
              />
              <MiniBarChart
                label="Daily order revenue"
                colorClass="bg-emerald-500"
                data={data.series.orders.map((entry) => ({ day: entry.day, value: entry.revenue }))}
                valueFormatter={(value) => formatCurrency(value, dominantCurrency)}
              />
            </section>

            <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Product performance
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-neutral-600">
                  <thead>
                    <tr>
                      <th className="rounded-l-[1rem] border border-black/6 bg-neutral-50 px-4 py-3 font-medium text-neutral-500">
                        Product
                      </th>
                      <th className="border border-black/6 bg-neutral-50 px-4 py-3 font-medium text-neutral-500">
                        Orders
                      </th>
                      <th className="rounded-r-[1rem] border border-black/6 bg-neutral-50 px-4 py-3 font-medium text-neutral-500">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.products.map((product) => (
                      <tr key={product.product}>
                        <td className="border border-black/6 bg-white px-4 py-4 align-top">
                          {product.product}
                        </td>
                        <td className="border border-black/6 bg-white px-4 py-4 align-top">
                          {product.orders}
                        </td>
                        <td className="border border-black/6 bg-white px-4 py-4 align-top">
                          {formatCurrency(product.revenue, product.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  Recent subscribers
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-neutral-600">
                    <thead>
                      <tr>
                        <th className="rounded-l-[1rem] border border-black/6 bg-neutral-50 px-4 py-3 font-medium text-neutral-500">
                          Email
                        </th>
                        <th className="border border-black/6 bg-neutral-50 px-4 py-3 font-medium text-neutral-500">
                          Source
                        </th>
                        <th className="rounded-r-[1rem] border border-black/6 bg-neutral-50 px-4 py-3 font-medium text-neutral-500">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent.subscribers.map((subscriber) => (
                        <tr key={`${subscriber.email}-${subscriber.created_at}`}>
                          <td className="border border-black/6 bg-white px-4 py-4 align-top">
                            {subscriber.email}
                          </td>
                          <td className="border border-black/6 bg-white px-4 py-4 align-top">
                            {subscriber.source}
                          </td>
                          <td className="border border-black/6 bg-white px-4 py-4 align-top">
                            {formatDate(subscriber.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  Recent orders
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-neutral-600">
                    <thead>
                      <tr>
                        <th className="rounded-l-[1rem] border border-black/6 bg-neutral-50 px-4 py-3 font-medium text-neutral-500">
                          Product
                        </th>
                        <th className="border border-black/6 bg-neutral-50 px-4 py-3 font-medium text-neutral-500">
                          Buyer
                        </th>
                        <th className="border border-black/6 bg-neutral-50 px-4 py-3 font-medium text-neutral-500">
                          Amount
                        </th>
                        <th className="rounded-r-[1rem] border border-black/6 bg-neutral-50 px-4 py-3 font-medium text-neutral-500">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent.orders.map((order) => (
                        <tr key={`${order.email}-${order.product}-${order.created_at}`}>
                          <td className="border border-black/6 bg-white px-4 py-4 align-top">
                            {order.product}
                          </td>
                          <td className="border border-black/6 bg-white px-4 py-4 align-top">
                            {order.email}
                          </td>
                          <td className="border border-black/6 bg-white px-4 py-4 align-top">
                            {formatCurrency(order.amount, order.currency)}
                          </td>
                          <td className="border border-black/6 bg-white px-4 py-4 align-top">
                            {formatDate(order.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
