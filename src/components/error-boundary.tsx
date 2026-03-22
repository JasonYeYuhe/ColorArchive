"use client";

import { Component, type ReactNode } from "react";
import Link from "next/link";
import { useLocale } from "@/src/components/locale-provider";

function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const { t } = useLocale();

  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center">
      <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">
        {t("error.title")}
      </h2>
      <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
        {t("error.description")}
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
        >
          {t("error.tryAgain")}
        </button>
        <Link
          href="/"
          className="rounded-full border border-black/8 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white/14"
        >
          {t("error.goHome")}
        </Link>
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return <ErrorFallback onRetry={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}
