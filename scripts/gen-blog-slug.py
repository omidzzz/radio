
      <div className="mt-16">
        <div className="mb-6 flex items-center gap-3" dir={isFa ? "rtl" : "ltr"}>
          <div className="h-1.5 w-8 rounded-full bg-gradient-to-r from-primary to-secondary" />
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">
            {isFa ? "مقالات مرتبط" : "Related Articles"}
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {relatedPosts.map((relatedPost, i) => (
            <BlogPostCard
              key={relatedPost.id}
              post={relatedPost}
              isFa={isFa}
              index={i}
            />
          ))}
        </div>
      </div>

      <div className="mt-16">
        <div className="mb-6 flex items-center gap-3" dir={isFa ? "rtl" : "ltr"}>
          <div className="h-1.5 w-8 rounded-full bg-gradient-to-r from-primary to-secondary" />
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">
            {isFa ? "نظرات" : "Comments"}
          </h2>
        </div>
        <div className="relative">
          <div
            className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/[0.07] via-transparent to-secondary/[0.05]"
            style={{ clipPath: "polygon(0 0, 100% 2%, 98% 100%, 0 97%)" }}
          />
          <div className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-surface shadow-[0_24px_50px_-18px_rgba(0,0,0,0.1)]">
            <div className="relative h-1.5 overflow-hidden bg-deep">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-[#c9a24b] to-secondary" />
              <div className="absolute inset-y-0 left-0 w-2/5 animate-pulse bg-white/25" />
            </div>
            <div className="p-6 sm:p-8">
              <LazyComments postId={post.id} initialComments={comments} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 flex justify-center">
        <Link
          href={`/${locale}/blog`}
          className="group inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text-secondary shadow-sm transition-all hover:border-primary/40 hover:text-primary hover:shadow-md"
        >
          {isFa ? "بازگشت به مقالات" : "Back to Articles"}
        </Link>
      </div>
    </section>
  </div>
  );
}
'''

(ps1 = "import textwrap\ncontent = textwrap.dedent(P).lstrip()\nopen(r\"c:\\Users\\ghada\\Desktop\\Projects\\radiotherapist-website\\app\\[locale]\\blog\\[slug]\\page.tsx\", \"w\", encoding=\"utf-8\").write(content)\nprint(\"wrote\", len(content), \"chars\")")

P = r'''import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { toFarsiDigits } from "@/lib/i18n/numbers";
import {
  getBlogPostBySlug,
  getRelatedBlogPosts,
  listBlogComments,
} from "@/lib/services/blog-service";
import { blogCache } from "@/lib/db/cache";
import { siteConfig } from "@/lib/seo/seo";
import { articleSchema, breadcrumbSchema } from "@/lib/seo/json-ld";
import { processArticleHtml } from "@/lib/utils/blog-html";
import JsonLdScript from "@/components/feedback/JsonLd";
import PageHero from "@/components/ui/PageHero";
import ParticleBackground from "@/components/ui/ParticleBackground";
import BlogReadingProgress from "@/components/ui/BlogReadingProgress";
import BlogPostCard from "@/components/blog/BlogPostCard";
import LazyComments from "@/components/blog/LazyComments";
import ViewCounter from "@/components/blog/ViewCounter";
const ShareButtons = dynamic(() => import("@/components/feedback/ShareButtons"));

export const revalidate = 60;

export function generateStaticParams() {
  return listPublishedBlogIds().flatMap((id) => [
    { locale: "fa" as const, slug: String(id) },
    { locale: "en" as const, slug: String(id) },
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const dict = getDictionary(locale);
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return { title: dict.common.notFound || "مقاله یافت نشد" };
  }

  const url = `/${locale}/blog/${post.id}`;
  const authorName = post.authorFA;
  const datePublished = post.publishedAt ?? new Date().toISOString();

  return {
    title: post.titleFA,
    description: post.excerptFA,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${post.titleFA} | دکتر پری قدمگاهی`,
      description: post.excerptFA,
      type: "article",
      url: `${siteConfig.url}${url}`,
      images: [
        post.image
          ? `${siteConfig.url}${post.image}`
          : siteConfig.defaultOgImage,
      ],
      publishedTime: datePublished,
      authors: [authorName],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.titleFA} | دکتر پری قدمگاهی`,
      description: post.excerptFA,
      images: [
        post.image
          ? `${siteConfig.url}${post.image}`
          : siteConfig.defaultOgImage,
      ],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const dict = getDictionary(locale);
  const isFa = locale === "fa";

  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const urlCanonical = `/${locale}/blog/${post.id}`;

  let html = blogCache.get(`blog:html:${post.id}`) as string | undefined;
  if (!html) {
    const processed = processArticleHtml(post.bodyFA);
    html = processed.html;
    blogCache.set(`blog:html:${post.id}`, html, 60_000);
  }

  const toc = processArticleHtml(post.bodyFA).toc;

  const comments = listBlogComments(post.id);

  const relatedPosts = getRelatedBlogPosts(post.id, post.categoryFA);

  const breadcrumbs = breadcrumbSchema([
    { name: isFa ? "خانه" : "Home", path: `/${locale}` },
    { name: dict.blog?.title || "مقالات", path: `/${locale}/blog` },
    { name: post.titleFA, path: urlCanonical },
  ]);

  return (
    <div className="min-h-screen bg-bg">
      <JsonLdScript
        data={[
          articleSchema({
            title: post.titleFA,
            description: post.excerptFA,
            url: urlCanonical,
            image: post.image,
            author: post.authorFA,
            datePublished: post.publishedAt,
            dateModified: post.publishedAt,
            wordCount: post.readMinutes,
          }),
          breadcrumbs,
        ]}
      />

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-48 top-10 h-[600px] w-[600px] rounded-full bg-primary/[0.07] blur-[140px]" />
        <div className="absolute -right-40 bottom-20 h-[520px] w-[520px] rounded-full bg-secondary/[0.09] blur-[120px]" />
        <ParticleBackground id="particles-blog-post" className="text-muted" />
      </div>

      <PageHero
        badge={dict.blog?.title || "مقالات"}
        title={post.titleFA}
        subtitle={post.excerptFA}
        emblem={
          <div className="relative mx-auto aspect-square w-full max-w-[440px]">
            <div className="absolute inset-[8%] rounded-full bg-primary/25 blur-3xl animate-pulse" />
            <div className="absolute inset-[8%] rounded-full bg-primary/10 blur-2xl" />
          </div>
        }
      >
