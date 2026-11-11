import type { Metadata, Viewport } from "next";
import { Vazirmatn, Outfit } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { BookingModalProvider } from "@/components/forms/BookingModalProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingContactLazy from "@/components/feedback/FloatingContactLazy";
import { siteConfig } from "@/lib/seo/seo";
import {
  websiteSchema,
  medicalClinicSchema,
  sitePhysicianSchema,
  treatmentProcessSchema,
  conversationalContentSchema,
  authoritativeSourceSchema,
  reviewSchema,
} from "@/lib/seo/json-ld";
import JsonLdScript from "@/components/feedback/JsonLd";
import ScrollProgress from "@/components/ui/ScrollProgress";
import PWARegister from "@/components/ui/PWARegister";
import { defaultLocale, localeDirs } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n";
import { LocaleProvider } from "@/components/providers/LocaleProvider";

const Analytics = process.env.NEXT_PUBLIC_GA_ID
  ? dynamic(() => import("@/components/ui/Analytics"))
  : null;
const WebVitals = dynamic(() => import("@/components/ui/WebVitals"));

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazirmatn-next",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  preload: true,
  adjustFontFallback: true,
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit-next",
  display: "optional",
  weight: ["400", "500", "600", "700"],
  // Preload the font for better LCP on first paint
  // Only preload on first visit, swap on subsequent visits
  preload: true,
});

const jsonLd = [
  websiteSchema(),
  sitePhysicianSchema(),
  medicalClinicSchema(),
  treatmentProcessSchema(),
  conversationalContentSchema(),
  authoritativeSourceSchema(),
  reviewSchema(),
];

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
    canonical: "/fa",
    languages: {
      "fa-IR": `${siteConfig.url}/fa`,
      "en-US": `${siteConfig.url}/en`,
      "x-default": `${siteConfig.url}/fa`,
    },
  },
  openGraph: {
    title: siteConfig.title.fa,
    description: siteConfig.description.fa,
    type: "website",
    locale: siteConfig.locale,
    alternateLocale: siteConfig.alternateLocale,
    siteName: siteConfig.name,
    url: `${siteConfig.url}/fa`,
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
    },
  },
  icons: {
    icon: [{ url: "/images/icon-512.png" }],
  },
  appleWebApp: {
    capable: true,
    title: siteConfig.shortName,
    statusBarStyle: "black-translucent",
  },
  category: "medical",
  verification: {},
  // Web performance optimizations
  // prefetch controls lazy-loaded below
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

/** Root layout — renders the HTML shell, fonts, and non-locale-specific
 * providers. Locale-aware components (Navbar, Footer, Preloader, etc.)
 * live in app/[locale]/layout.tsx so every pre-rendered static page
 * gets its own translated version.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dict = getDictionary("fa");
  const hourParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tehran",
    weekday: "long",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const weekday = hourParts.find((part) => part.type === "weekday")?.value;
  const hour = Number(hourParts.find((part) => part.type === "hour")?.value ?? -1);
  const isOpen = weekday !== "Friday" && hour >= 8 && hour < 17;
  const workingHours = [
    {
      label: dict.contact.saturdayThursday,
      hours: "۰۸:۰۰ تا ۱۷:۰۰",
      isClosed: false,
    },
    {
      label: dict.contact.friday,
      hours: dict.contact.fridayHours,
      isClosed: true,
    },
  ];

  return (
    <LocaleProvider initialLocale="fa">
      <html
        lang={defaultLocale}
        dir={defaultLocale === "fa" ? "rtl" : "ltr"}
        suppressHydrationWarning
        className={`${vazirmatn.variable} ${outfit.variable}`}
        data-scroll-behavior="smooth"
      >
      <head>
        <JsonLdScript data={jsonLd} />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="RSS Feed"
          href="/rss.xml"
        />
        <link rel="llms" href="/llms.txt" />
        {/* Set lang/dir based on URL locale */}
        <script
          dangerouslySetInnerHTML={{
            __html: "(function() { var locale = window.location.pathname.split('/')[1]; if (locale === 'fa' || locale === 'en') { document.documentElement.lang = locale; document.documentElement.dir = locale === 'fa' ? 'rtl' : 'ltr'; } })();",
          }}
        />
      </head>
      <body
        id="top"
        className="font-vazir antialiased"
        suppressHydrationWarning
      >
        {Analytics && <Analytics />}
        <WebVitals />
        <PWARegister />
        <ScrollProgress />
        <ThemeProvider>
          <Navbar />
          <BookingModalProvider>{children}</BookingModalProvider>
        </ThemeProvider>
        <Footer
          workingHours={workingHours}
          isOpen={isOpen}
        />
        <FloatingContactLazy
          labels={{
            telegram: "Telegram",
            whatsapp: "WhatsApp",
            backToTop: "بازگشت به بالا",
            officeHours: dict.contact.officeHours,
            workingDays: dict.contact.saturdayThursday,
            friday: dict.contact.friday,
            fridayHours: dict.contact.fridayHours,
            openNow: dict.contact.openNow,
            closedNow: dict.contact.closedNow,
          }}
        />
      </body>
    </html>
  </LocaleProvider>
);
}
