import LiveSearch from "@/components/forms/LiveSearch";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { breadcrumbSchema } from "@/lib/seo/json-ld";
import JsonLdScript from "@/components/feedback/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageHero from "@/components/ui/PageHero";

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { locale: "fa" as const },
    { locale: "en" as const },
  ];
}

export const metadata: Metadata = {
  title: "جستجو",
  description:
    "جستجو در مقالات تخصصی و انجمن گفتگوی دکتر پری قدمگاهی درباره پرتودرمانی، درمان سرطان و تصویربرداری پزشکی.",
  alternates: {
    canonical: "/fa/search",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export const revalidate = 3600;

export default async function SearchPage({ params }: { params: Promise<{ locale: Locale }>; searchParams?: Promise<{ q?: string }> }) {
  const { locale }: { locale: Locale } = await params;
  const dict = getDictionary(locale);
  const isFa = locale === "fa";
  const breadcrumbs = breadcrumbSchema([
    { name: "خانه", path: `/${locale}` },
    { name: isFa ? "جستجو" : "Search", path: `/${locale}/search` },
  ]);

  return (
    <div className="min-h-screen bg-bg">
      <JsonLdScript data={breadcrumbs} />
      <Breadcrumbs
        items={[
          { name: "خانه", path: `/${locale}` },
          { name: isFa ? "جستجو" : "Search", path: `/${locale}/search` },
        ]}
      />

      {/* Header — clean medical-tech hero */}
      <PageHero
        badge={isFa ? "جستجو" : "Search"}
        title={isFa ? "جستجو" : "Search"}
        subtitle={
          isFa
            ? "جستجو در مقالات، انجمن گفتگو و صفحات"
            : "Search articles, forum discussions, and pages"
        }
      >
        <form action={`/${locale}/search`} method="GET" className="mt-8 max-w-xl">
          <div className="flex gap-3">
            <input
              type="search"
              name="q"
              placeholder={isFa ? "جستجو..." : "Search..."}
              className="flex-1 rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-white placeholder-muted backdrop-blur-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              dir={isFa ? "rtl" : "ltr"}
            />
            <button
              type="submit"
              className="ui-button ui-button-primary px-8 py-3.5"
            >
              {isFa ? "جستجو" : "Search"}
            </button>
          </div>
        </form>
      </PageHero>
      <LiveSearch locale={locale} />
    </div>
  );
}
