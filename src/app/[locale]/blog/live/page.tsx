import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/lib/i18n/config";
import LiveBlogPost from "@/components/blog/LiveBlogPost";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  // The PHP pretty-URL handler changes the existing title element before
  // serving a post shell. Keep a real localized fallback for direct shell use.
  return {
    title: locale === "fa" ? "مقاله" : "Article",
    robots: { index: false, follow: true },
    openGraph: {
      title: locale === "fa" ? "مقاله" : "Article",
      type: "article",
    },
  };
}

export default async function LiveBlogPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LiveBlogPost locale={locale} />;
}