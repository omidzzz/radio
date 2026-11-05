import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/lib/i18n/config";
import LiveBlogPost from "@/components/blog/LiveBlogPost";

export const metadata: Metadata = {
  title: "Blog article",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Props = { params: Promise<{ locale: string }> };

export default async function LiveBlogPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LiveBlogPost locale={locale} />;
}