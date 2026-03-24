import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { AccountPage } from "@/src/components/account-page";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your ColorArchive account, subscription, and usage.",
  alternates: { canonical: "/account/" },
  robots: { index: false },
};

export default function AccountRoute() {
  return (
    <>
      <SiteHeader currentPath="/login" />
      <AccountPage />
    </>
  );
}
