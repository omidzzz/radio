import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogPostBySlug, listPublishedBlogSlugs } from "@/lib/services/blog-service";
import BlogArticle, { blogArticleMetadata } from "@/components/blog/BlogArticle";

export const revalidate = 60;

export function generateStaticParams() {
  return listPublishedBlogSlugs().map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getBlogPostBySlug((await params).slug);
  if (!post) notFound();
  return blogArticleMetadata(post, "fa");
}

/** Preserve unprefixed bookmarks; canonical metadata points to /fa/blog/. */
export default async function LegacyBlogPostPage({ params }: Props) {
  const post = getBlogPostBySlug((await params).slug);
  if (!post) notFound();
  return <BlogArticle post={post} locale="fa" />;
}