import type { ReactNode } from "react";
import type { Metadata } from "next";
import { SiteFooter } from "@/src/components/site-footer";
import "./globals.css";

const siteTitle = "ColorArchive";
const siteDescription =
  "A calm, searchable archive of curated colors with copyable hex codes and elegant visual sorting.";

export const metadata: Metadata = {
  metadataBase: new URL("https://colorarchive.me"),
  category: "design",
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
    images: [
      {
        url: "https://colorarchive.me/og-image-v1.png",
        width: 1200,
        height: 630,
        alt: "ColorArchive logo and social preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "theme-color": "#f6f4ef",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
