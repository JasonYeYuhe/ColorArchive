import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginPage } from "@/src/components/login-page";
import { SiteHeader } from "@/src/components/site-header";

export const metadata: Metadata = {
  title: "Log In",
  description:
    "Sign in with a magic link or Google to sync your ColorArchive favorites, palette, downloads, and purchase history.",
  alternates: {
    canonical: "/login",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginRoute() {
  return (
    <>
      <SiteHeader currentPath="/login" />
      <Suspense fallback={null}>
        <LoginPage />
      </Suspense>
    </>
  );
}
