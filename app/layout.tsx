import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/src/components/auth-provider";
import { ThemeProvider } from "@/src/components/theme-provider";
import { SiteFooter } from "@/src/components/site-footer";
import { PageTracker } from "@/src/components/page-tracker";
import { PaletteBuilderTray } from "@/src/components/palette-builder-tray";
import { LocaleProvider } from "@/src/components/locale-provider";
import { PHLaunchBanner } from "@/src/components/ph-launch-banner";
import { BackToTop } from "@/src/components/back-to-top";
import { KeyboardShortcuts } from "@/src/components/keyboard-shortcuts";
import { CopyUpsellToast } from "@/src/components/copy-upsell-toast";
import { ErrorBoundary } from "@/src/components/error-boundary";
import Script from "next/script";
import { SITE_URL } from "@/src/lib/site-config";
import { API_URL } from "@/src/lib/api-config";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

// Editorial type system: Inter for UI/body, Fraunces (serif display) for headings.
const sans = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const serif = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });

const siteTitle = "ColorArchive";
const siteDescription =
  "ColorArchive — 5,400+ curated hex color codes organized by family and hue. Search, copy, build palettes, and export design tokens for Figma, CSS, and Tailwind.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  category: "design",
  title: {
    default: siteTitle,
    template: `%s · ${siteTitle}`,
  },
  description: siteDescription,
  applicationName: siteTitle,
  keywords: [
    "hex color codes",
    "color palette generator",
    "design color library",
    "color archive",
    "Figma color tokens",
    "CSS color variables",
    "Tailwind color palette",
    "color inspiration",
    "hex color picker",
    "design tokens",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: SITE_URL,
    siteName: siteTitle,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-image-v1.png`,
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
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f4ef" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('colorarchive-theme');
    if (!["light","dark","system"].includes(t)) t = "system";
    var d = (!t || t === 'system')
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : t === 'dark';
    if (d) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.style.colorScheme = 'light';
    }
  } catch(e) {}
})();
if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(function(){});}
`;

const localeScript = `
(function(){
  try {
    var l = localStorage.getItem('colorarchive-locale');
    if (!["en","zh"].includes(l)) l = "en";
    if (l === 'zh') document.documentElement.lang = 'zh';
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="QMvWjTTdo973FLMy5VZMA4lDZcirOQK8LUjLAHFD5eo" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href={API_URL} />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href={API_URL} />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-11416473237"
          strategy="afterInteractive"
        />
        <Script id="google-ads-gtag" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'AW-11416473237');`}
        </Script>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: localeScript }} />
      </head>
      <body>
        <ThemeProvider>
          <LocaleProvider>
            <AuthProvider>
              <PHLaunchBanner />
              <ErrorBoundary>
                <div id="main-content">{children}</div>
              </ErrorBoundary>
              <SiteFooter />
              <PaletteBuilderTray />
              <BackToTop />
              <CopyUpsellToast />
              <KeyboardShortcuts />
              <PageTracker />
            </AuthProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
