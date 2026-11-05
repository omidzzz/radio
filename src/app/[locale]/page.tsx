import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { siteConfig } from "@/lib/seo/seo";
import StickyBookingBar from "@/components/forms/StickyBookingBar";
const HeroSlider = dynamic(() => import("@/components/home/HeroSlider"), { ssr: true });
const HeroMobile = dynamic(() => import("@/components/home/HeroMobile"), { ssr: true });

// Lazy-load below-the-fold sections to reduce initial bundle
const Precision = dynamic(() => import("@/components/home/Precision"), { ssr: true });
const Equipment = dynamic(() => import("@/components/home/Equipment"), { ssr: true });
const CTA = dynamic(() => import("@/components/home/CTA"), { ssr: true });
const AchievementsOverview = dynamic(() => import("@/components/home/AchievementsOverview"), { ssr: true });
const LatestPosts = dynamic(() => import("@/components/home/LatestPosts"), { ssr: true });

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { locale: "fa" as const },
    { locale: "en" as const },
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale }: { locale: Locale } = (await params) as { locale: Locale };
  const dict = getDictionary(locale);

  return {
    title: dict.home.heroTitle1 || siteConfig.title.fa,
    description: dict.home.heroSubtitle || siteConfig.description.fa,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        "fa-IR": `${siteConfig.url}/fa`,
        "en-US": `${siteConfig.url}/en`,
        "x-default": `${siteConfig.url}/fa`,
      },
    },
    openGraph: {
      title: dict.home.heroTitle1 || siteConfig.title.fa,
      description: dict.home.heroSubtitle || siteConfig.description.fa,
      type: "website",
      locale: locale,
      alternateLocale: locale === "fa" ? siteConfig.alternateLocale : undefined,
      siteName: siteConfig.name,
      url: `${siteConfig.url}/${locale}`,
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
      title: dict.home.heroTitle1 || siteConfig.title.fa,
      description: dict.home.heroSubtitle || siteConfig.description.fa,
      images: [siteConfig.defaultOgImage],
      creator: siteConfig.twitterHandle,
      site: siteConfig.twitterHandle,
    },
  };
}

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale }: { locale: Locale } = (await params) as { locale: Locale };
  const dict = getDictionary(locale);
  const isFa = locale === "fa";

  return (
    <div className="min-h-screen flex flex-col">
      <div className="hidden sm:block">
        <HeroSlider dict={dict} isFa={isFa} />
      </div>
      <div className="block sm:hidden">
        <HeroMobile dict={dict} isFa={isFa} />
      </div>
      <div className="home-page-bridge home-page-bridge-soft" aria-hidden="true">
        <span />
      </div>
      <div className="home-page-sections">
        <AchievementsOverview isFa={isFa} />
        <LatestPosts dict={dict} isFa={isFa} />
        <Precision isFa={isFa} />
        <Equipment isFa={isFa} />
        <CTA dict={dict} isFa={isFa} />
      </div>
      <StickyBookingBar label={dict.home.bookConsultation} isFa={isFa} />
    </div>
  );
}