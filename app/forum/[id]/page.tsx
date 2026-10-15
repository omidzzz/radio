import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import db from "@/lib/db";
import ReplyForm from "@/components/ReplyForm";
import { ForumPost, ForumReply } from "@/lib/types";
import { getServerDictionary } from "@/lib/i18n/server";
import { getCategoryLabel, formatDate, formatRelativeTime } from "@/lib/i18n";
import { toFarsiDigits } from "@/lib/i18n/numbers";
import { siteConfig } from "@/lib/seo";
import { qaPageSchema, breadcrumbSchema } from "@/lib/json-ld";
import JsonLdScript from "@/components/JsonLd";

export const revalidate = 60;

const REPLIES_PER_PAGE = 10;

export async function generateStaticParams() {
  const posts = db.prepare("SELECT id FROM forum_posts").all() as {
    id: number;
  }[];

  return posts.map((post) => ({ id: String(post.id) }));
}

/**
 * Cached post lookup â€” shared between generateMetadata and the page render
 * so the row is fetched from SQLite only once per request.
 */
const getPostById = cache(async (postId: number): Promise<ForumPost | undefined> => {
  return db
    .prepare("SELECT * FROM forum_posts WHERE id = ?")
    .get(postId) as ForumPost | undefined;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const postId = Number(id);
  const post = Number.isInteger(postId) ? await getPostById(postId) : undefined;

  if (!post) {
    return { title: "Ù¾Ø³Øª ÛŒØ§ÙØª Ù†Ø´Ø¯" };
  }

  const url = `/forum/${id}`;

  return {
    title: post.title,
    description: `Ù¾Ø±Ø³Ø´ Ùˆ Ù¾Ø§Ø³Ø® Ø¯Ø±Ø¨Ø§Ø±Ù‡: ${post.title}`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${post.title} | Ú©Ù„ÛŒÙ†ÛŒÚ© Ù¾Ø±ØªÙˆØ¯Ø±Ù…Ø§Ù†ÛŒ`,
      description: `Ù¾Ø±Ø³Ø´ Ùˆ Ù¾Ø§Ø³Ø® Ø¯Ø±Ø¨Ø§Ø±Ù‡: ${post.title}`,
      type: "article",
      url: `${siteConfig.url}${url}`,
      images: [{ url: siteConfig.defaultOgImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | Ú©Ù„ÛŒÙ†ÛŒÚ© Ù¾Ø±ØªÙˆØ¯Ø±Ù…Ø§Ù†ÛŒ`,
      description: `Ù¾Ø±Ø³Ø´ Ùˆ Ù¾Ø§Ø³Ø® Ø¯Ø±Ø¨Ø§Ø±Ù‡: ${post.title}`,
    },
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ replyPage?: string }>;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function ForumPostPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const postId = Number(id);

  // Invalid or missing post â†’ real 404 response (no soft-404 SEO penalty)
  if (!Number.isInteger(postId)) {
    notFound();
  }

  const { dict, locale } = await getServerDictionary();
  const isFa = locale === "fa";
  const formatCount = (n: number) => (isFa ? toFarsiDigits(n) : String(n));

  const post = await getPostById(postId);

  if (!post) {
    notFound();
  }

  // Paginated replies â€” avoids loading unbounded thread history at once
  const replyParams = await searchParams;
  const replyPage = Math.max(1, parseInt(replyParams.replyPage || "1", 10) || 1);
  const replyOffset = (replyPage - 1) * REPLIES_PER_PAGE;

  const totalReplies = (
    db.prepare("SELECT COUNT(*) AS c FROM forum_replies WHERE post_id = ?").get(
      postId
    ) as { c: number }
  ).c;
  const totalReplyPages = Math.max(1, Math.ceil(totalReplies / REPLIES_PER_PAGE));

  const replies = db
    .prepare(
      "SELECT * FROM forum_replies WHERE post_id = ? ORDER BY created_at ASC LIMIT ? OFFSET ?"
    )
    .all(postId, REPLIES_PER_PAGE, replyOffset) as ForumReply[];

  const adminCount = (
    db
      .prepare("SELECT COUNT(*) AS c FROM forum_replies WHERE post_id = ? AND is_admin = 1")
      .get(postId) as { c: number }
  ).c;

  const qaJsonLd = qaPageSchema({
    title: post.title,
    description: `Ù¾Ø±Ø³Ø´ Ùˆ Ù¾Ø§Ø³Ø® Ø¯Ø±Ø¨Ø§Ø±Ù‡: ${post.title}`,
    url: `/forum/${post.id}`,
    author: post.author_name,
    dateCreated: post.created_at,
    content: post.content,
  });
  const breadcrumbs = breadcrumbSchema([
    { name: isFa ? "Ø®Ø§Ù†Ù‡" : "Home", path: "/" },
    { name: dict.forum.title, path: "/forum" },
    { name: post.title, path: `/forum/${post.id}` },
  ]);

  const replyHref = (p: number) =>
    p > 1 ? `/forum/${post.id}?replyPage=${p}#replies` : `/forum/${post.id}#replies`;

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <JsonLdScript data={[qaJsonLd, breadcrumbs]} />


      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HERO
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 bg-deep">
        <div className="relative mx-auto max-w-4xl px-4 pb-16 pt-20 sm:px-6 lg:pb-20 lg:pt-24">
          {/* Back link */}
          <div className="mb-8">
            <Link
              href="/forum"
              className="group inline-flex items-center gap-2 border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-white"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              {dict.forum.backToForum}
            </Link>
          </div>

          {/* Category badge — separate from back link */}
          <div className="mb-5">
            <span className="chip border-highlight/30 text-highlight">
              <span aria-hidden="true" className="h-1 w-1 bg-primary" />
              {getCategoryLabel(post.category, dict)}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-[2.6rem]">
            {post.title}
          </h1>

          {/* Meta row */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 border border-white/15 bg-white/5 px-3 py-1.5">
              <span
                className={`flex h-6 w-6 items-center justify-center border border-white/15 bg-white/5 mono text-[11px] font-semibold text-highlight`}
              >
                {getInitials(post.author_name)}
              </span>
              <span className="text-sm font-medium text-white">
                {post.author_name}
              </span>
            </span>

            <span className="flex items-center gap-1.5 text-sm text-slate-300">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span title={formatDate(post.created_at, locale)}>
                {formatRelativeTime(post.created_at, locale)}
              </span>
            </span>

            <span className="flex items-center gap-1.5 text-sm text-slate-300">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8L3 20l1.3-3.9A7.86 7.86 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {formatCount(totalReplies)}{" "}
              {totalReplies === 1 ? dict.forum.replyCount : dict.forum.replies}
            </span>
          </div>
        </div>

        {/* Bottom rule */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/10" />
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          CONTENT
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 -mt-4 pb-24">
        <div className="grain-pattern pointer-events-none absolute inset-0" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
          {/* Original post */}
          <div className="surface-card p-7 sm:p-9">
            <span className="chip mb-5">
              {dict.forum.originalPost}
            </span>

            <p className="whitespace-pre-line leading-relaxed text-text-secondary">
              {post.content}
            </p>
          </div>

          {/* Replies */}
          <div id="replies" className="mt-14 scroll-mt-28">
            <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
              <h2 className="mono text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted">
                {totalReplies === 0
                  ? dict.forum.noRepliesYet
                  : `${formatCount(totalReplies)} ${
                      totalReplies === 1
                        ? dict.forum.replyCount
                        : dict.forum.replies
                    }`}
              </h2>

              {adminCount > 0 && (
                <span className="chip border-primary/30 bg-primary/10 text-primary">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {formatCount(adminCount)}{" "}
                  {adminCount === 1
                    ? dict.forum.officialResponse
                    : dict.forum.officialResponses}
                </span>
              )}
            </div>

            {replies.length === 0 ? (
              <div className="border border-dashed border-border/80 bg-surface/80 py-14 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center border border-border bg-soft text-primary">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.6}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8L3 20l1.3-3.9A7.86 7.86 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <p className="mt-4 text-text-secondary">
                  {dict.forum.beFirstReply}
                </p>
                {/* Empty-state CTA â€” jump straight to the reply form */}
                <a
                  href="#reply-form"
                  className="btn btn-primary mt-6 px-5 py-2.5 text-sm"
                >
                  {dict.forum.postReply}
                </a>
              </div>
            ) : (
              <>
                <div className="space-y-5">
                  {replies.map((reply) =>
                    reply.is_admin ? (
                      <div
                        key={reply.id}
                        id={`reply-${reply.id}`}
                        className="group relative scroll-mt-28 border-l-2 border-primary bg-surface"
                      >
                        <div className="relative p-6 sm:p-7">
                          <div className="relative flex items-start gap-4">
                            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center border border-primary/30 bg-soft text-primary">
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.8}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 3l7 3v6c0 5-3.5 8.5-7 9.5-3.5-1-7-4.5-7-9.5V6l7-3z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9.5 12l1.8 1.8L14.5 10"
                                />
                              </svg>
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="chip border-primary bg-primary text-white">
                                  {dict.forum.officialResponse}
                                </span>
                                <span className="font-semibold text-text-primary">
                                  {reply.author_name}
                                </span>
                              </div>

                              <p className="mt-3 whitespace-pre-line leading-relaxed text-text-primary">
                                {reply.content}
                              </p>

                              <div className="mt-4 border-t border-primary/15 pt-3 text-xs text-text-secondary">
                                <span title={formatDate(reply.created_at, locale)}>
                                  {formatRelativeTime(reply.created_at, locale)}
                                </span>
                                {/* Permalink to this reply */}
                                <a
                                  href={`#reply-${reply.id}`}
                                  className="ms-3 inline-flex items-center gap-1 text-muted opacity-0 transition-opacity hover:text-primary focus-visible:opacity-100 group-hover:opacity-100"
                                  aria-label={`Permalink to reply by ${reply.author_name}`}
                                >
                                  <svg
                                    className="h-3 w-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5m8-3l1.5-1.5a4 4 0 015.656 5.656l-3 3a4 4 0 01-5.656 0"
                                    />
                                  </svg>
                                  #
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        key={reply.id}
                        id={`reply-${reply.id}`}
                        className="group surface-card flex items-start gap-4 scroll-mt-28 p-5 transition-colors duration-300 hover:border-primary/30 sm:p-6"
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-soft mono text-sm font-semibold text-primary`}
                        >
                          {getInitials(reply.author_name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="whitespace-pre-line leading-relaxed text-text-secondary">
                            {reply.content}
                          </p>
                          <div className="mt-4 border-t border-border/60 pt-3 text-sm text-muted">
                            <span className="font-medium text-text-primary">
                              {reply.author_name}
                            </span>
                            <span className="mx-2">Â·</span>
                            <span title={formatDate(reply.created_at, locale)}>
                              {formatRelativeTime(reply.created_at, locale)}
                            </span>
                            {/* Permalink to this reply */}
                            <a
                              href={`#reply-${reply.id}`}
                              className="ms-3 inline-flex items-center gap-1 opacity-0 transition-opacity hover:text-primary focus-visible:opacity-100 group-hover:opacity-100"
                              aria-label={`Permalink to reply by ${reply.author_name}`}
                            >
                              <svg
                                className="h-3 w-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5m8-3l1.5-1.5a4 4 0 015.656 5.656l-3 3a4 4 0 01-5.656 0"
                                />
                              </svg>
                              #
                            </a>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>

                {/* Reply pagination â€” keeps long threads light */}
                {totalReplyPages > 1 && (
                  <nav
                    className="mt-8 flex items-center justify-center gap-3 text-sm"
                    aria-label="Replies pagination"
                  >
                    {replyPage > 1 && (
                      <Link
                        href={replyHref(replyPage - 1)}
                        scroll={false}
                        className="inline-flex items-center gap-1 border border-border/70 bg-surface px-4 py-2 font-medium text-text-secondary transition hover:border-primary/40 hover:text-primary"
                      >
                        â† {dict.forum.previousReplies}
                      </Link>
                    )}
                    <span className="text-muted">
                      {formatCount(replyPage)} / {formatCount(totalReplyPages)}
                    </span>
                    {replyPage < totalReplyPages && (
                      <Link
                        href={replyHref(replyPage + 1)}
                        scroll={false}
                        className="inline-flex items-center gap-1 border border-border/70 bg-surface px-4 py-2 font-medium text-text-secondary transition hover:border-primary/40 hover:text-primary"
                      >
                        {dict.forum.loadMoreReplies} â†’
                      </Link>
                    )}
                  </nav>
                )}
              </>
            )}
          </div>

          {/* Reply form */}
          <div id="reply-form" className="mt-14 scroll-mt-28">
            <div className="mb-5">
              <h3 className="mono text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted">
                {dict.forum.leaveReply}
              </h3>
            </div>

            <div className="surface-card overflow-hidden">
              <div className="p-6 sm:p-8">
                <ReplyForm postId={post.id} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
