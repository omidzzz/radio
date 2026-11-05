import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import BlogIndex, { blogIndexMetadata } from "@/components/blog/BlogIndex";

export const dynamicParams = false;
export function generateStaticParams() { return [{ locale: "fa" }, { locale: "en" }]; }
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return blogIndexMetadata(locale);
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <BlogIndex locale={locale} />;
}