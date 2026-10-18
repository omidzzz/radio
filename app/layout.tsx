import type { Metadata, Viewport } from "next";
import { Vazirmatn, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RootErrorBoundary from "@/components/RootErrorBoundary";
import { LocaleProvider } from "@/components/LocaleProvider";
import { getServerLocale, getDictionary } from "@/lib/i18n/server";
import { localeDirs } from "@/lib/i18n/config";
import { siteConfig } from "@/lib/seo";
import {
  websiteSchema,
  medicalClinicSchema,
  sitePhysicianSchema,
  treatmentProcessSchema,
  conversationalContentSchema,
  authoritativeSourceSchema,
  reviewSchema,
} from "@/lib/json-ld";
import JsonLdScript from "@/components/JsonLd";
import Analytics from "@/components/Analytics";
import ScrollProgress from "@/components/ui/ScrollProgress";
import FloatingContactLazy from "@/components/FloatingContactLazy";
import StickyBookingBar from "@/components/StickyBookingBar";
import Preloader from "@/components/ui/Preloader";
import { BookingModalProvider } from "@/components/BookingModalProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import WebVitals from "@/components/WebVitals";
import PWARegister from "@/components/PWARegister";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazirmatn",
  display: "swap",
  // Full range: body 400-500, ledes 500-600, headings up to 900
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  // 700/800 give latin headings and display numerals real weight
  weight: ["400", "500", "600", "700", "800"],
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title.fa,
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description.fa,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  alternates: {
    canonical: "/",
    languages: {
      "fa-IR": "/",
      "en-US": "/en",
      "x-default": "/",
    },
  },
  openGraph: {
    title: siteConfig.title.fa,
    description: siteConfig.description.fa,
    type: "website",
    locale: siteConfig.locale,
    alternateLocale: siteConfig.alternateLocale,
    siteName: siteConfig.name,
    url: siteConfig.url,
    images: [
      {
        url: siteConfig.defaultOgImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title.fa,
    description: siteConfig.description.fa,
    images: [siteConfig.defaultOgImage],
    creator: siteConfig.twitterHandle,
    site: siteConfig.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/images/icon.svg", type: "image/svg+xml" },
      { url: "/images/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/images/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    // iOS cannot read SVG apple-touch-icons — PNG required here
    apple: [
      {
        url: "/images/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: "/images/icon.svg",
  },
  appleWebApp: {
    capable: true,
    title: siteConfig.shortName,
    statusBarStyle: "black-translucent",
  },
  category: "medical",
  verification: {
    // Add your Google Search Console verification code here
    // google: "your-google-verification-code",
    // Add your Bing Webmaster Tools verification code here
    // bing: "your-bing-verification-code",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#145c41" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();
  const dir = localeDirs[locale];
  const dict = getDictionary(locale);

  const navbarStrings = {
    doctorName: dict.common.doctorName,
    bookNow: dict.common.bookNow,
    toggleMenu: dict.nav.toggleMenu,
    nav: {
      home: dict.nav.home,
      about: dict.nav.about,
      services: dict.nav.services,
      blog: dict.nav.blog,
      forum: dict.nav.forum,
      bookSession: dict.nav.bookSession,
      contact: dict.nav.contact,
      search: dict.nav.search,
    },
  };

  const jsonLd = [
    websiteSchema(),
    sitePhysicianSchema(),
    medicalClinicSchema(),
    treatmentProcessSchema(),
    conversationalContentSchema(),
    authoritativeSourceSchema(),
    reviewSchema(),
  ];

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${vazirmatn.variable} ${outfit.variable}`}
    >
      <head>
        <JsonLdScript data={jsonLd} />
        {/* RSS feed */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="RSS Feed"
          href="/rss.xml"
        />
        {/* llms.txt for AI crawlers */}
        <link rel="llms" href="/llms.txt" />
      </head>
      <body
        id="top"
        className="font-vazir antialiased"
        suppressHydrationWarning
      >
        {/* Skip-to-content link for keyboard/screen-reader users */}
        <a
          href="#main-content"
          className="sr-only z-[100] rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-deep focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          {locale === "fa" ? "پرش به محتوای اصلی" : "Skip to main content"}
        </a>
        <Analytics />
        <WebVitals />
        <PWARegister />
        <Preloader />
        <ScrollProgress />
        <ThemeProvider>
          <LocaleProvider initialLocale={locale}>
            <BookingModalProvider>
              <Navbar strings={navbarStrings} isFa={locale === "fa"} />
              <RootErrorBoundary>
                <main id="main-content" className="flex-1">
                  {children}
                </main>
              </RootErrorBoundary>
              <Footer />
              <StickyBookingBar
                label={dict.common.bookNow}
                isFa={locale === "fa"}
              />
              <FloatingContactLazy labels={dict.floating} />
            </BookingModalProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}