import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import db from "@/lib/db";
import { getServerDictionary } from "@/lib/i18n/server";
import { toFarsiDigits } from "@/lib/i18n/numbers";
import { siteConfig } from "@/lib/seo";
import { articleSchema, breadcrumbSchema } from "@/lib/json-ld";
import { processArticleHtml } from "@/lib/blog-html";
import JsonLdScript from "@/components/JsonLd";
import ShareButtons from "@/components/ShareButtons";
import ParticleBackground from "@/components/ui/ParticleBackground";
import BlogReadingProgress from "@/components/BlogReadingProgress";
import BlogPostCard from "@/components/blog/BlogPostCard";
import LazyComments from "@/components/blog/LazyComments";
import TableOfContents from "@/components/blog/TableOfContents";
import ViewCounter from "@/components/blog/ViewCounter";

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = db
    .prepare("SELECT id FROM blog_posts WHERE is_published = 1")
    .all() as { id: number }[];

  return posts.map((post) => ({ slug: String(post.id) }));
}

const getPost = cache((slug: string) => {
  return db
    .prepare(
      `SELECT * FROM blog_posts
       WHERE (id = ? OR CAST(id AS TEXT) = ?) AND is_published = 1`,
    )
    .get(slug, slug) as BlogPost | undefined;
});

const getRelatedPosts = cache((postId: number, category: string) => {
  const sameCategory = db
    .prepare(
      `SELECT id, title_fa, title_en, excerpt_fa, excerpt_en, author_fa, author_en, category_fa, category_en,
              image, read_minutes, published_at, views
       FROM blog_posts
       WHERE is_published = 1 AND id != ? AND category_fa = ?
       ORDER BY published_at DESC
       LIMIT 2`,
    )
    .all(postId, category) as BlogPost[];

  // Backfill with latest posts from other categories so the section
  // never looks empty on small blogs.
  if (sameCategory.length < 2) {
    const excludeIds = [postId, ...sameCategory.map((p) => p.id)];
    const placeholders = excludeIds.map(() => "?").join(", ");
    const fillers = db
      .prepare(
        `SELECT id, title_fa, title_en, excerpt_fa, excerpt_en, author_fa, author_en, category_fa, category_en,
                image, read_minutes, published_at, views
         FROM blog_posts
         WHERE is_published = 1 AND id NOT IN (${placeholders})
         ORDER BY published_at DESC
         LIMIT ?`,
      )
      .all(...excludeIds, 2 - sameCategory.length) as BlogPost[];
    return [...sameCategory, ...fillers];
  }

  return sameCategory;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    return { title: "مقاله یافت نشد" };
  }

  const url = `/blog/${post.id}`;
  const title = post.title_fa;
  const description = post.excerpt_fa;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | کلینیک پرتودرمانی`,
      description,
      type: "article",
      url: `${siteConfig.url}${url}`,
      images: [
        {
          url: post.image
            ? `${siteConfig.url}${post.image}`
            : siteConfig.defaultOgImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      publishedTime: post.published_at,
      authors: [post.author_fa],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | کلینیک پرتودرمانی`,
      description,
      images: [
        post.image
          ? `${siteConfig.url}${post.image}`
          : siteConfig.defaultOgImage,
      ],
    },
  };
}

interface BlogPost {
  id: number;
  title_fa: string;
  title_en?: string;
  excerpt_fa: string;
  excerpt_en?: string;
  body_fa: string;
  body_en?: string;
  author_fa: string;
  author_en?: string;
  category_fa: string;
  category_en?: string;
  image?: string;
  read_minutes: number;
  published_at?: string;
  views?: number | null;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { dict, locale } = await getServerDictionary();
  const isFa = locale === "fa";

  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post.id, post.category_fa);

  const comments = db
    .prepare(
      `SELECT id, author_name, content, created_at
       FROM blog_comments
       WHERE post_id = ? AND is_approved = 1
       ORDER BY created_at ASC`,
    )
    .all(post.id) as {
    id: number;
    author_name: string;
    content: string;
    created_at: string;
  }[];

  // Sanitize + enrich the article body (heading anchors, lazy images)
  // and extract the table of contents.
  const { html: articleHtml, toc } = processArticleHtml(
    isFa ? post.body_fa : post.body_en || post.body_fa,
  );

  const articleJsonLd = articleSchema({
    title: isFa ? post.title_fa : post.title_en || post.title_fa,
    description: isFa ? post.excerpt_fa : post.excerpt_en || post.excerpt_fa,
    url: `/blog/${post.id}`,
    image: post.image,
    author: isFa ? post.author_fa : post.author_en || post.author_fa,
    datePublished: post.published_at,
  });
  const breadcrumbs = breadcrumbSchema([
    { name: "خانه", path: "/" },
    { name: "مقالات تخصصی", path: "/blog" },
    { name: post.title_fa, path: `/blog/${post.id}` },
  ]);

  const authorName = isFa ? post.author_fa : post.author_en || post.author_fa;
  const authorInitial = authorName.trim().charAt(0);

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <JsonLdScript data={[articleJsonLd, breadcrumbs]} />
      <BlogReadingProgress
        title={isFa ? post.title_fa : post.title_en || post.title_fa}
        url={`/blog/${post.id}`}
        isRtl={isFa}
      />

      {/* ══════════════════════════════════════════════════════════════
          GLOBAL AMBIENT FIELD
      ══════════════════════════════════════════════════════════════ */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-48 top-10 h-[600px] w-[600px] rounded-full bg-primary/[0.07] blur-[140px]" />
        <div className="absolute -right-40 bottom-20 h-[520px] w-[520px] rounded-full bg-secondary/[0.09] blur-[120px]" />
        <div className="absolute left-1/3 top-1/2 h-[280px] w-[280px] -translate-y-1/2 rounded-full bg-cyan-400/[0.04] blur-[90px]" />

        <ParticleBackground id="particles-blogpost" />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10">
        {/* Dark base with asymmetric cut */}
        <div
          className="absolute inset-0 bg-deep"
          style={{
            clipPath: "polygon(0 0, 100% 0, 100% 82%, 70% 95%, 0 100%)",
          }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-secondary/10"
          style={{
            clipPath: "polygon(40% 0, 100% 0, 100% 100%, 20% 100%)",
          }}
        />

        {/* Beam lines */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[12%] top-0 h-[120%] w-px origin-top rotate-[12deg] bg-gradient-to-b from-primary/40 via-primary/10 to-transparent" />
          <div className="absolute right-[18%] top-0 h-[130%] w-px origin-top -rotate-[14deg] bg-gradient-to-b from-secondary/30 via-secondary/10 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 pb-28 pt-24 sm:px-6 lg:px-8 lg:pb-36 lg:pt-28">
          {/* Featured image card */}
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/15 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)]">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={post.image || "/images/blog/default.jpg"}
                alt={isFa ? post.title_fa : post.title_en || post.title_fa}
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover brightness-[0.75]"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/40 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12)_0%,transparent_65%)]" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            </div>

            {/* Overlay content */}
            <div
              className="absolute inset-x-0 bottom-0 z-20 p-6 sm:p-8 md:p-10"
              dir={isFa ? "rtl" : "ltr"}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-3.5 py-1 text-xs font-medium text-highlight backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                {isFa ? post.category_fa : post.category_en || post.category_fa}
              </span>

              <h1 className="mt-4 max-w-3xl text-3xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-4xl md:text-[2.75rem]">
                {isFa ? post.title_fa : post.title_en || post.title_fa}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-300">
                <span className="font-medium text-white">{authorName}</span>
                <span className="h-1 w-1 rounded-full bg-white/40" />
                <span>
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString(
                        isFa ? "fa-IR" : "en-US",
                      )
                    : ""}
                </span>
                <span className="h-1 w-1 rounded-full bg-white/40" />
                <span>
                  {isFa
                    ? `${toFarsiDigits(post.read_minutes)} دقیقه مطالعه`
                    : `${post.read_minutes} min read`}
                </span>
                <span className="h-1 w-1 rounded-full bg-white/40" />
                <ViewCounter
                  postId={post.id}
                  initialViews={post.views ?? 0}
                  isFa={isFa}
                  className="text-slate-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom energy divider — clean gradient line */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 -bottom-1 h-3 bg-gradient-to-r from-transparent via-primary/15 to-transparent blur-md" />
      </section>

      {/* ══════════════════════════════════════════════════════════════
          ARTICLE CONTENT
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 -mt-6 pb-24">
        <div className="pointer-events-none absolute inset-0 opacity-[0.18] grain-pattern grain-masked" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
            {/* ── Main column ── */}
            <div className="min-w-0">
              {/* Mobile TOC */}
              {toc.length > 0 && (
                <details className="mb-6 rounded-2xl border border-border/60 bg-surface/90 px-5 py-4 shadow-sm lg:hidden">
                  <summary className="cursor-pointer text-sm font-semibold text-text-primary">
                    {isFa ? "فهرست مطالب" : "On this page"}
                  </summary>
                  <div className="mt-4">
                    <TableOfContents items={toc} isFa={isFa} />
                  </div>
                </details>
              )}

              {/* Article card — light & readable */}
              <div className="relative">
                <div
                  className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/[0.08] via-transparent to-secondary/[0.05]"
                  style={{ clipPath: "polygon(0 0, 100% 2%, 98% 100%, 0 97%)" }}
                />

                <article
                  className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-surface shadow-[0_28px_60px_-22px_rgba(0,0,0,0.12)]"
                  dir={isFa ? "rtl" : "ltr"}
                >
                  {/* Energy bar */}
                  <div className="relative h-1.5 overflow-hidden bg-deep">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-cyan-300 to-secondary" />
                    <div className="absolute inset-y-0 left-0 w-2/5 animate-pulse bg-white/25" />
                  </div>

                  <div className="p-7 sm:p-9 md:p-11">
                    {/* Body — typography comes from the .article-prose
                        block in globals.css (no Typography plugin here) */}
                    <div
                      className="article-prose max-w-none text-[15.5px] text-text-secondary
                        [&_img]:my-8 [&_img]:rounded-xl [&_img]:shadow-md
                        [&_img]:max-w-full [&_img]:h-auto
                        [&_img.align-left]:float-left [&_img.align-left]:mr-6 [&_img.align-left]:my-4 [&_img.align-left]:max-w-[50%]
                        [&_img.align-right]:float-right [&_img.align-right]:ml-6 [&_img.align-right]:my-4 [&_img.align-right]:max-w-[50%]
                        [&_img.align-center]:mx-auto [&_img.align-center]:block"
                      dangerouslySetInnerHTML={{ __html: articleHtml }}
                    />

                    {/* Author box */}
                    <div className="mt-12 flex flex-wrap items-center gap-5 rounded-2xl border border-border/60 bg-soft/40 p-5 sm:p-6">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/25 to-secondary/20 text-xl font-bold text-primary ring-1 ring-primary/25">
                        {authorInitial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-text-primary">
                          {authorName}
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                          {isFa
                            ? "متخصص پرتودرمانی و تصویربرداری پزشکی"
                            : "Radiotherapy & Medical Imaging Specialist"}
                        </p>
                      </div>
                      <ShareButtons
                        title={
                          isFa ? post.title_fa : post.title_en || post.title_fa
                        }
                        url={`/blog/${post.id}`}
                      />
                    </div>
                  </div>
                </article>
              </div>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="mt-16">
                  <div
                    className="mb-8 flex items-center gap-3"
                    dir={isFa ? "rtl" : "ltr"}
                  >
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
              )}

              {/* Comments — light readable card */}
              <div className="mt-16">
                <div
                  className="mb-6 flex items-center gap-3"
                  dir={isFa ? "rtl" : "ltr"}
                >
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
                    {/* Energy bar */}
                    <div className="relative h-1.5 overflow-hidden bg-deep">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary via-cyan-300 to-secondary" />
                      <div className="absolute inset-y-0 left-0 w-2/5 animate-pulse bg-white/25" />
                    </div>

                    <div className="p-6 sm:p-8">
                      <LazyComments postId={post.id} initialComments={comments} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Back link */}
              <div className="mt-12 flex justify-center">
                <Link
                  href="/blog"
                  className="group inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text-secondary shadow-sm transition-all hover:border-primary/40 hover:text-primary hover:shadow-md"
                >
                  <svg
                    className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 rtl:rotate-180 rtl:group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  {isFa ? "بازگشت به مقالات" : "Back to Articles"}
                </Link>
              </div>
            </div>

            {/* ── Sidebar: sticky TOC (desktop) ── */}
            {toc.length > 0 && (
              <aside className="hidden self-start lg:sticky lg:top-24 min-[1220px]:lg:top-28 lg:block">
                <div className="rounded-2xl border border-border/60 bg-surface/90 p-5 shadow-sm backdrop-blur-sm">
                  <TableOfContents items={toc} isFa={isFa} />
                </div>
              </aside>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}