import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { TikTokAdminPage } from "@/src/components/tiktok-admin-page";

export const metadata: Metadata = {
  title: "TikTok Publishing — ColorArchive Admin",
};

export default function TikTokAdminRoute() {
  return (
    <>
      <SiteHeader currentPath="/about" />
      <TikTokAdminPage />
    </>
  );
}
