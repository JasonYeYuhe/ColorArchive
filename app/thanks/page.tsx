import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { ThanksPage } from "@/src/components/thanks-page";

export const metadata: Metadata = {
  title: "Welcome to Pro",
  description: "Your ColorArchive Pro access is now active.",
  robots: { index: false, follow: false },
};

export default function ThanksRoute() {
  return (
    <>
      <SiteHeader currentPath="/support" />
      <ThanksPage />
    </>
  );
}
