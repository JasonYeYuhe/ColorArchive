import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { AdminAutopilotPage } from "@/src/components/admin-autopilot-page";

export const metadata: Metadata = {
  title: "Admin Autopilot Status",
  description:
    "Internal autopilot health: Pinterest pinning + commerce activity.",
  alternates: {
    canonical: "/admin/autopilot",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminAutopilotRoute() {
  return (
    <>
      <SiteHeader currentPath="/analytics" />
      <AdminAutopilotPage />
    </>
  );
}
