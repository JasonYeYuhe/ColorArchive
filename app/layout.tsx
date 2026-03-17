import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";

const siteTitle = "ColorArchive";
const siteDescription =
  "A calm, searchable archive of curated colors with copyable hex codes and elegant visual sorting.";

export const metadata: Metadata = {
  metadataBase: new URL("https://colorarchive.me"),
  title: {
    default: siteTitle,
    template: `%s · ${siteTitle}`,
  },
  description: siteDescription,
  applicationName: siteTitle,
  keywords: [
    "ColorArchive",
    "color library",
    "color archive",
    "hex colors",
    "design palette",
    "color inspiration",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "https://colorarchive.me",
    siteName: siteTitle,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
