"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { storeToken, exchangeCodeForToken, consumeReturnPath } from "@/src/lib/pinterest";

/**
 * Pinterest OAuth callback page.
 *
 * After the user authorizes on Pinterest, they are redirected here with
 * ?code=AUTH_CODE in the URL. We exchange the code for an access token
 * via our backend proxy (which holds the app secret), store it in
 * localStorage, and show a success/error message.
 */
export function PinterestCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [returnPath, setReturnPath] = useState("/");

  useEffect(() => {
    // Read return path before anything else (consumeReturnPath clears it)
    setReturnPath(consumeReturnPath());

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");

    // If Pinterest sent back a token directly (e.g. from token generation page)
    const hashParams = new URLSearchParams(window.location.hash.replace("#", ""));
    const directToken = hashParams.get("access_token");

    if (directToken) {
      storeToken(directToken);
      setStatus("success");
      return;
    }

    if (error) {
      setErrorMsg(error === "access_denied" ? "You declined the Pinterest authorization." : error);
      setStatus("error");
      return;
    }

    if (code) {
      exchangeCodeForToken(code)
        .then((accessToken) => {
          storeToken(accessToken);
          setStatus("success");
        })
        .catch((err) => {
          setErrorMsg(err instanceof Error ? err.message : "Token exchange failed.");
          setStatus("error");
        });
      return;
    }

    setErrorMsg("No authorization code received.");
    setStatus("error");
  }, []);

  return (
    <main className="mx-auto max-w-lg px-5 py-24 text-center">
      {status === "loading" && (
        <div className="space-y-4">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-red-600" />
          <p className="text-neutral-500">Connecting to Pinterest…</p>
        </div>
      )}

      {status === "success" && (
        <div className="space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-neutral-950">Pinterest Connected</h1>
          <p className="text-sm text-neutral-500">
            Your Pinterest account is now linked. You can save colors as Pins from any color detail page.
          </p>
          <Link
            href={returnPath}
            className="inline-block rounded-full bg-neutral-950 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Back to ColorArchive
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-neutral-950">Connection Failed</h1>
          <p className="text-sm text-neutral-500">{errorMsg}</p>
          <Link
            href={returnPath}
            className="inline-block rounded-full bg-neutral-950 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Back to ColorArchive
          </Link>
        </div>
      )}
    </main>
  );
}
