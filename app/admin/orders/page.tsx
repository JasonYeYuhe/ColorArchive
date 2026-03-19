import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { AdminOrdersPage } from "@/src/components/admin-orders-page";

export const metadata: Metadata = {
  title: "Admin Orders",
  description: "Internal ColorArchive order support queue for resend and buyer follow-up.",
  alternates: {
    canonical: "/admin/orders",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminOrdersRoute() {
  return (
    <>
      <SiteHeader currentPath="/analytics" />
      <AdminOrdersPage />
    </>
  );
}
