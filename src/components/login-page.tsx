"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/src/components/auth-provider";

type FormState = "idle" | "loading" | "success" | "error";
type VerifyState = "idle" | "loading" | "success" | "error";

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
  const { lastSyncAt, logout, requestMagicLink, status, user, verifyMagicLink } = useAuth();
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [verifyState, setVerifyState] = useState<VerifyState>("idle");
  const [error, setError] = useState("");

  const token = searchParams.get("token");
  const nextPath = useMemo(() => searchParams.get("next") || "/favorites", [searchParams]);

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
            ColorArchive now supports passwordless sign-in. One email link is enough to keep your
            saved colors and working palettes in sync.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              "No password to remember",
              "Favorites sync automatically",
              "Palette builder follows your account",
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

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
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
                  Your local favorites and palette are now tied to this account.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/favorites"
                    className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    Open favorites
                  </Link>
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
                  Request a magic link
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
                <p className="mt-4 text-sm leading-6 text-neutral-600">
                  No password. One link. Favorites and palette builder sync automatically after you
                  sign in.
                </p>
              </>
            )}

            {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
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
                Downloads and deeper account history can be added later without replacing this login
                flow.
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
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
