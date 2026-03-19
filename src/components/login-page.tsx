"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { API_URL, fetchOrders, type AccountOrder } from "@/src/lib/auth-client";
import { useAuth } from "@/src/components/auth-provider";

type FormState = "idle" | "loading" | "success" | "error";
type VerifyState = "idle" | "loading" | "success" | "error";
type OrdersState = "idle" | "loading" | "success" | "error";

function formatSyncTime(timestamp: number | null) {
  if (!timestamp) {
    return "Not synced yet";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  }).format(timestamp);
}

export function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    analyticsAccess,
    googleEnabled,
    lastSyncAt,
    logout,
    requestMagicLink,
    status,
    user,
    verifyMagicLink,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [verifyState, setVerifyState] = useState<VerifyState>("idle");
  const [ordersState, setOrdersState] = useState<OrdersState>("idle");
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [error, setError] = useState("");
  const [ordersError, setOrdersError] = useState("");

  const token = searchParams.get("token");
  const loginError = searchParams.get("error");
  const nextPath = useMemo(() => searchParams.get("next") || "/favorites", [searchParams]);

  useEffect(() => {
    if (!loginError) {
      return;
    }

    const messages: Record<string, string> = {
      "google-failed": "Google sign-in could not be completed.",
      "google-invalid": "Google sign-in returned an invalid response.",
      "google-not-configured": "Google sign-in is not configured yet.",
      "google-state": "Google sign-in expired. Please try again.",
    };

    setError(messages[loginError] ?? "Could not complete sign-in.");
  }, [loginError]);

  useEffect(() => {
    if (!token || verifyState !== "idle" || status === "loading") {
      return;
    }

    const loginToken = token;

    if (user) {
      setVerifyState("success");
      window.setTimeout(() => {
        router.replace(nextPath);
      }, 300);
      return;
    }

    let cancelled = false;

    async function handleToken() {
      setVerifyState("loading");
      setError("");

      try {
        await verifyMagicLink(loginToken);
        if (cancelled) {
          return;
        }

        setVerifyState("success");
        window.setTimeout(() => {
          router.replace(nextPath);
        }, 900);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(err instanceof Error ? err.message : "Could not verify link");
        setVerifyState("error");
      }
    }

    void handleToken();

    return () => {
      cancelled = true;
    };
  }, [nextPath, router, status, token, user, verifyMagicLink, verifyState]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) {
      return;
    }

    setFormState("loading");
    setError("");

    try {
      await requestMagicLink(email);
      setFormState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send link");
      setFormState("error");
    }
  }

  async function handleLogout() {
    try {
      await logout();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log out");
    }
  }

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setOrdersState("idle");
      setOrdersError("");
      return;
    }

    let cancelled = false;

    async function loadOrders() {
      setOrdersState("loading");
      setOrdersError("");

      try {
        const payload = await fetchOrders();
        if (cancelled) {
          return;
        }

        setOrders(payload.orders);
        setOrdersState("success");
      } catch (err) {
        if (cancelled) {
          return;
        }

        setOrdersState("error");
        setOrdersError(err instanceof Error ? err.message : "Could not load orders");
      }
    }

    void loadOrders();

    return () => {
      cancelled = true;
    };
  }, [user]);

  function handleGoogleLogin() {
    window.location.assign(
      `${API_URL}/auth/google/start?next=${encodeURIComponent(nextPath)}`,
    );
  }

  if (token && (verifyState === "loading" || verifyState === "success")) {
    return (
      <main className="px-4 py-4 sm:px-6 sm:py-6">
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-black/6 bg-white/80 px-6 py-12 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/90 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-neutral-500">
            <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
            Account sync
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-5xl">
            {verifyState === "loading" ? "Signing you in" : "Login complete"}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">
            {verifyState === "loading"
              ? "We are verifying your email link and loading your saved colors."
              : "Your favorites and palette are synced. Redirecting now."}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="rounded-[2rem] border border-black/6 bg-white/80 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-10 sm:py-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/90 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-neutral-500">
            <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
            Account sync
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
            Sync favorites and palettes across devices
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg">
            ColorArchive now supports account sync. Use a magic link today, or Google sign-in when
            configured, to keep favorites, palettes, and downloads tied to one account.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              "No password to remember",
              "Favorites sync automatically",
              "Palette builder and downloads follow your account",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.4rem] border border-black/6 bg-neutral-50/90 px-4 py-4 text-sm font-medium text-neutral-700"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-black/6 bg-white/82 px-6 py-8 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            {user ? (
              <>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Signed in
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                  {user.email}
                </h2>
                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  Your local favorites and palette are now tied to this account. Purchased packs
                  also appear below as a lightweight account history.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/favorites"
                    className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    Open favorites
                  </Link>
                  <Link
                    href="/packs"
                    className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                  >
                    Browse packs
                  </Link>
                  {analyticsAccess ? (
                    <Link
                      href="/analytics"
                      className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                    >
                      Open analytics
                    </Link>
                  ) : null}
                  <Link
                    href="/palette"
                    className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                  >
                    Open palette
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                  >
                    Log out
                  </button>
                </div>
                <p className="mt-5 text-xs uppercase tracking-[0.16em] text-neutral-400">
                  Last sync {formatSyncTime(lastSyncAt)}
                </p>
              </>
            ) : formState === "success" ? (
              <>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                  Email sent
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                  Check your inbox
                </h2>
                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  We sent a one-time sign-in link. It stays valid for 30 minutes and signs you in
                  on the device where you open it.
                </p>
                <button
                  type="button"
                  onClick={() => setFormState("idle")}
                  className="mt-6 rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  Send another link
                </button>
              </>
            ) : (
              <>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Sign in
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                  Request a sign-in link
                </h2>
                <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="h-12 rounded-full border border-black/10 bg-white px-4 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                  />
                  <button
                    type="submit"
                    disabled={formState === "loading"}
                    className="rounded-full border border-black/8 bg-neutral-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
                  >
                    {formState === "loading" ? "Sending link…" : "Email me a login link"}
                  </button>
                </form>
                {googleEnabled ? (
                  <>
                    <div className="my-4 flex items-center gap-3">
                      <div className="h-px flex-1 bg-black/8" />
                      <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                        or
                      </div>
                      <div className="h-px flex-1 bg-black/8" />
                    </div>
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="rounded-full border border-black/8 bg-white px-4 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                    >
                      Continue with Google
                    </button>
                  </>
                ) : null}
                <p className="mt-4 text-sm leading-6 text-neutral-600">
                  No password. One link. Favorites, palette builder, and account history sync after
                  you sign in.
                </p>
              </>
            )}

            {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
            </div>

            {user ? (
              <div className="rounded-[1.75rem] border border-black/6 bg-white/82 px-6 py-8 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                      Orders & downloads
                    </div>
                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                      Your pack history
                    </h3>
                  </div>
                  <div className="rounded-full border border-black/8 bg-neutral-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-neutral-500">
                    {orders.length} orders
                  </div>
                </div>

                {ordersState === "loading" || ordersState === "idle" ? (
                  <p className="mt-5 text-sm text-neutral-500">Loading your orders…</p>
                ) : null}

                {ordersState === "error" ? (
                  <p className="mt-5 text-sm text-red-600">{ordersError}</p>
                ) : null}

                {ordersState === "success" && orders.length === 0 ? (
                  <p className="mt-5 text-sm leading-6 text-neutral-600">
                    No purchases are tied to this email yet. Once you buy a pack with the same
                    address, it will appear here with direct download links.
                  </p>
                ) : null}

                {orders.length > 0 ? (
                  <div className="mt-5 grid gap-3">
                    {orders.map((order) => (
                      <article
                        key={`${order.orderId}-${order.created_at}`}
                        className="rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="text-lg font-semibold tracking-[-0.02em] text-neutral-950">
                              {order.product}
                            </div>
                            <div className="mt-2 text-sm leading-6 text-neutral-600">
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: order.currency,
                                maximumFractionDigits: order.currency === "JPY" ? 0 : 2,
                              }).format(order.currency === "JPY" ? order.amount : order.amount / 100)}
                              {" · "}
                              {new Intl.DateTimeFormat("en-US", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }).format(new Date(order.created_at))}
                            </div>
                            <div className="mt-1 text-xs uppercase tracking-[0.14em] text-neutral-400">
                              Order {order.orderId}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {order.downloadUrl ? (
                              <a
                                href={order.downloadUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                              >
                                Download ZIP
                              </a>
                            ) : null}
                            {order.packUrl ? (
                              <a
                                href={order.packUrl}
                                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                              >
                                Pack page
                              </a>
                            ) : null}
                            {order.receiptUrl ? (
                              <a
                                href={order.receiptUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                              >
                                Receipt
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <aside className="rounded-[1.75rem] border border-black/6 bg-white/78 px-6 py-8 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
              What syncs
            </div>
            <div className="mt-5 space-y-4 text-sm leading-6 text-neutral-600">
              <p>
                <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-700">Favorites</code>{" "}
                are stored under your account so the same saved shelf follows you on a new browser
                or laptop.
              </p>
              <p>
                <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-700">
                  Palette builder
                </code>{" "}
                choices are merged with whatever you already had locally, then synced back to the
                account.
              </p>
              <p>
                Purchased packs are now shown on this page as a lightweight order and download
                history.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/favorites"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Favorites
              </Link>
              <Link
                href="/palette"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Palette builder
              </Link>
              <Link
                href="/packs"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Packs
              </Link>
              {analyticsAccess ? (
                <Link
                  href="/analytics"
                  className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  Analytics
                </Link>
              ) : null}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
