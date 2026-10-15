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
    return { title: "Ù…Ù‚Ø§Ù„Ù‡ ÛŒØ§ÙØª Ù†Ø´Ø¯" };
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
      title: `${title} | Ú©Ù„ÛŒÙ†ÛŒÚ© Ù¾Ø±ØªÙˆØ¯Ø±Ù…Ø§Ù†ÛŒ`,
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
      title: `${title} | Ú©Ù„ÛŒÙ†ÛŒÚ© Ù¾Ø±ØªÙˆØ¯Ø±Ù…Ø§Ù†ÛŒ`,
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
    { name: "Ø®Ø§Ù†Ù‡", path: "/" },
    { name: "Ù…Ù‚Ø§Ù„Ø§Øª ØªØ®ØµØµÛŒ", path: "/blog" },
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


      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HERO
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 bg-deep">
        <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-20 sm:px-6 lg:px-8 lg:pb-20 lg:pt-24">
          {/* Featured image card */}
          <div className="relative overflow-hidden border border-white/15">
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
            </div>

            {/* Overlay content */}
            <div
              className="absolute inset-x-0 bottom-0 z-20 p-6 sm:p-8 md:p-10"
              dir={isFa ? "rtl" : "ltr"}
            >
              <span className="chip border-highlight/30 text-highlight backdrop-blur-md">
                <span aria-hidden="true" className="h-1 w-1 bg-primary" />
                {isFa ? post.category_fa : post.category_en || post.category_fa}
              </span>

              <h1 className="mt-4 max-w-3xl text-3xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-4xl md:text-[2.75rem]">
                {isFa ? post.title_fa : post.title_en || post.title_fa}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-300">
                <span className="font-medium text-white">{authorName}</span>
                <span className="h-1 w-1 bg-white/40" />
                <span>
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString(
                        isFa ? "fa-IR" : "en-US",
                      )
                    : ""}
                </span>
                <span className="h-1 w-1 bg-white/40" />
                <span>
                  {isFa
                    ? `${toFarsiDigits(post.read_minutes)} Ø¯Ù‚ÛŒÙ‚Ù‡ Ù…Ø·Ø§Ù„Ø¹Ù‡`
                    : `${post.read_minutes} min read`}
                </span>
                <span className="h-1 w-1 bg-white/40" />
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

        {/* Bottom rule */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/10" />
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          ARTICLE CONTENT
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 -mt-6 pb-24">
        <div className="grain-pattern pointer-events-none absolute inset-0" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
            {/* Main column */}
            <div className="min-w-0">
              {/* Mobile TOC */}
              {toc.length > 0 && (
                <details className="mb-6 border border-border bg-surface px-5 py-4 lg:hidden">
                  <summary className="cursor-pointer text-sm font-semibold text-text-primary">
                    {isFa ? "ÙÙ‡Ø±Ø³Øª Ù…Ø·Ø§Ù„Ø¨" : "On this page"}
                  </summary>
                  <div className="mt-4">
                    <TableOfContents items={toc} isFa={isFa} />
                  </div>
                </details>
              )}

              {/* Article card — light & readable */}
              <div className="surface-card">
                <article
                  className="p-7 sm:p-9 md:p-11"
                  dir={isFa ? "rtl" : "ltr"}
                >
                  <div>
                    {/* Body â€” typography comes from the .article-prose
                        block in globals.css (no Typography plugin here) */}
                    <div
                      className="article-prose max-w-none text-[15.5px] text-text-secondary
                        [&_img]:my-8 [&_img]:border [&_img]:border-border
                        [&_img]:max-w-full [&_img]:h-auto
                        [&_img.align-left]:float-left [&_img.align-left]:mr-6 [&_img.align-left]:my-4 [&_img.align-left]:max-w-[50%]
                        [&_img.align-right]:float-right [&_img.align-right]:ml-6 [&_img.align-right]:my-4 [&_img.align-right]:max-w-[50%]
                        [&_img.align-center]:mx-auto [&_img.align-center]:block"
                      dangerouslySetInnerHTML={{ __html: articleHtml }}
                    />

                    {/* Author box */}
                    <div className="mt-12 flex flex-wrap items-center gap-5 border border-border bg-soft/40 p-5 sm:p-6">
                      <div className="mono flex h-14 w-14 shrink-0 items-center justify-center border border-primary/30 bg-soft text-xl font-bold text-primary">
                        {authorInitial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-text-primary">
                          {authorName}
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                          {isFa
                            ? "Ù…ØªØ®ØµØµ Ù¾Ø±ØªÙˆØ¯Ø±Ù…Ø§Ù†ÛŒ Ùˆ ØªØµÙˆÛŒØ±Ø¨Ø±Ø¯Ø§Ø±ÛŒ Ù¾Ø²Ø´Ú©ÛŒ"
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
                    <div className="h-px w-8 bg-primary" />
                    <h2 className="mono text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted">
                      {isFa ? "Ù…Ù‚Ø§Ù„Ø§Øª Ù…Ø±ØªØ¨Ø·" : "Related Articles"}
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

              {/* Comments â€” light readable card */}
              <div className="mt-16">
                <div
                  className="mb-6 flex items-center gap-3"
                  dir={isFa ? "rtl" : "ltr"}
                >
                  <div className="h-px w-8 bg-primary" />
                  <h2 className="mono text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted">
                    {isFa ? "Ù†Ø¸Ø±Ø§Øª" : "Comments"}
                  </h2>
                </div>

                <div className="surface-card">
                  <div className="p-6 sm:p-8">
                    <LazyComments postId={post.id} initialComments={comments} />
                  </div>
                </div>
              </div>

              {/* Back link */}
              <div className="mt-12 flex justify-center">
                <Link
                  href="/blog"
                  className="group inline-flex items-center gap-2 border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-primary/40 hover:text-primary"
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
                  {isFa ? "Ø¨Ø§Ø²Ú¯Ø´Øª Ø¨Ù‡ Ù…Ù‚Ø§Ù„Ø§Øª" : "Back to Articles"}
                </Link>
              </div>
            </div>

            {/* â”€â”€ Sidebar: sticky TOC (desktop) â”€â”€ */}
            {toc.length > 0 && (
              <aside className="hidden self-start lg:sticky lg:top-24 min-[1220px]:lg:top-28 lg:block">
                <div className="border border-border bg-surface p-5">
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
