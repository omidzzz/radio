import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getBlogPostBySlug, listPublishedBlogSlugs } from "@/lib/services/blog-service";
import BlogArticle, { blogArticleMetadata } from "@/components/blog/BlogArticle";

export const revalidate = 60;

export function generateStaticParams() {
  return listPublishedBlogSlugs().flatMap((slug) => [{ locale: "fa", slug }, { locale: "en", slug }]);
}

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();
  return blogArticleMetadata(post, locale);
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();
  return <BlogArticle post={post} locale={locale} />;
}