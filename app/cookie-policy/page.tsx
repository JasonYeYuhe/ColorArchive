import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { CookiePolicyPage } from "@/src/components/cookie-policy-page";

export const metadata: Metadata = {
  title: "Cookie Policy — ColorArchive",
  description:
    "Cookie Policy for ColorArchive. Learn how we use cookies and local storage on our website.",
  alternates: {
    canonical: "/cookie-policy/",
  },
};

export default function CookiePolicyRoute() {
  return (
    <>
      <SiteHeader currentPath="/about" />
      <CookiePolicyPage />
    </>
  );
}
