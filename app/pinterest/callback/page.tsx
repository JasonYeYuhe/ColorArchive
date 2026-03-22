import type { Metadata } from "next";
import { PinterestCallbackPage } from "@/src/components/pinterest-callback-page";

export const metadata: Metadata = {
  title: "Pinterest Connected — ColorArchive",
  robots: { index: false },
};

export default function Page() {
  return <PinterestCallbackPage />;
}
