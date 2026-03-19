"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchAdminOrders, resendAdminOrderEmail, type AdminOrder } from "@/src/lib/auth-client";
import { useAuth } from "@/src/components/auth-provider";

type LoadState = "idle" | "loading" | "success" | "error";

function formatCurrency(amount: number, currency: string) {
  const normalizedCurrency = currency.toUpperCase();
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: normalizedCurrency,
    maximumFractionDigits: normalizedCurrency === "JPY" ? 0 : 2,
  }).format(normalizedCurrency === "JPY" ? amount : amount / 100);
}

export function AdminOrdersPage() {
  const { analyticsAccess, status } = useAuth();
  const [state, setState] = useState<LoadState>("idle");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState("");
  const [resendState, setResendState] = useState<Record<string, "idle" | "sending" | "sent">>({});

  useEffect(() => {
    if (!analyticsAccess) {
      return;
    }

    let cancelled = false;

    async function load() {
      setState("loading");
      setError("");

      try {
        const payload = await fetchAdminOrders();
        if (cancelled) {
          return;
        }

        setOrders(payload.orders);
        setState("success");
      } catch (err) {
        if (cancelled) {
          return;
        }

        setState("error");
        setError(err instanceof Error ? err.message : "Could not load admin orders");
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [analyticsAccess]);

  async function handleResend(orderId: string) {
    try {
      setResendState((current) => ({ ...current, [orderId]: "sending" }));
      await resendAdminOrderEmail(orderId);
      setResendState((current) => ({ ...current, [orderId]: "sent" }));
      window.setTimeout(() => {
        setResendState((current) => ({ ...current, [orderId]: "idle" }));
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend admin order email");
      setResendState((current) => ({ ...current, [orderId]: "idle" }));
    }
  }

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="rounded-[2rem] border border-black/6 bg-white/80 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-10 sm:py-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/90 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-neutral-500">
            <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
            Admin actions
          </div>
          <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
            Order resend and buyer support queue
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600 sm:text-lg">
            Lightweight admin surface for order follow-up. Use this to resend downloads, open pack
            pages, or jump straight into buyer support without digging through email.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/analytics"
              className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Back to analytics
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Account page
            </Link>
          </div>
        </section>

        {status !== "authenticated" ? (
          <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            Sign in with an allowlisted admin account to view this page.
          </section>
        ) : null}

        {status === "authenticated" && !analyticsAccess ? (
          <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            This signed-in account does not have admin order access.
          </section>
        ) : null}

        {analyticsAccess ? (
          <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            {state === "loading" || state === "idle" ? (
              <div className="text-sm text-neutral-500">Loading admin queue…</div>
            ) : null}

            {state === "error" ? <div className="text-sm text-red-600">{error}</div> : null}

            {state === "success" ? (
              <div className="grid gap-3">
                {orders.map((order) => (
                  <article
                    key={`admin-order-${order.orderId}`}
                    className="rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="text-lg font-semibold tracking-[-0.02em] text-neutral-950">
                          {order.product}
                        </div>
                        <div className="mt-2 text-sm text-neutral-500">
                          {order.email} · {formatCurrency(order.amount, order.currency)}
                        </div>
                        <div className="mt-1 text-xs uppercase tracking-[0.14em] text-neutral-400">
                          Order {order.orderId}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void handleResend(order.orderId)}
                          disabled={resendState[order.orderId] === "sending"}
                          className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
                        >
                          {resendState[order.orderId] === "sending"
                            ? "Sending…"
                            : resendState[order.orderId] === "sent"
                              ? "Sent"
                              : "Resend email"}
                        </button>
                        <a
                          href={`mailto:${order.email}?subject=${encodeURIComponent(`ColorArchive support · ${order.product}`)}`}
                          className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                        >
                          Email buyer
                        </a>
                        {order.packUrl ? (
                          <a
                            href={order.packUrl}
                            className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                          >
                            Pack page
                          </a>
                        ) : null}
                        {order.downloadUrl ? (
                          <a
                            href={order.downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                          >
                            Download ZIP
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </main>
  );
}
