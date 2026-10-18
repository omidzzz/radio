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
import ParticleBackground from "@/components/ui/ParticleBackground";

export const revalidate = 60;

const REPLIES_PER_PAGE = 10;

export async function generateStaticParams() {
  const posts = db.prepare("SELECT id FROM forum_posts").all() as {
    id: number;
  }[];

  return posts.map((post) => ({ id: String(post.id) }));
}

/**
 * Cached post lookup — shared between generateMetadata and the page render
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
    return { title: "پست یافت نشد" };
  }

  const url = `/forum/${id}`;

  return {
    title: post.title,
    description: `پرسش و پاسخ درباره: ${post.title}`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${post.title} | دکتر پری غدامگاهی`,
      description: `پرسش و پاسخ درباره: ${post.title}`,
      type: "article",
      url: `${siteConfig.url}${url}`,
      images: [{ url: siteConfig.defaultOgImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | دکتر پری غدامگاهی`,
      description: `پرسش و پاسخ درباره: ${post.title}`,
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

/* Avatar palette — deterministic per-author color derived from a name hash */
const AVATAR_GRADIENTS = [
  "from-cyan-500 to-teal-500",
  "from-sky-500 to-cyan-400",
  "from-teal-500 to-emerald-400",
  "from-indigo-500 to-sky-400",
  "from-cyan-600 to-blue-500",
  "from-emerald-500 to-teal-400",
];

function avatarGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

export default async function ForumPostPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const postId = Number(id);

  // Invalid or missing post → real 404 response (no soft-404 SEO penalty)
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

  // Paginated replies — avoids loading unbounded thread history at once
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
    description: `پرسش و پاسخ درباره: ${post.title}`,
    url: `/forum/${post.id}`,
    author: post.author_name,
    dateCreated: post.created_at,
    content: post.content,
  });
  const breadcrumbs = breadcrumbSchema([
    { name: isFa ? "خانه" : "Home", path: "/" },
    { name: dict.forum.title, path: "/forum" },
    { name: post.title, path: `/forum/${post.id}` },
  ]);

  const replyHref = (p: number) =>
    p > 1 ? `/forum/${post.id}?replyPage=${p}#replies` : `/forum/${post.id}#replies`;

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <JsonLdScript data={[qaJsonLd, breadcrumbs]} />

      {/* ══════════════════════════════════════════════════════════════
          GLOBAL AMBIENT FIELD
      ══════════════════════════════════════════════════════════════ */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-48 top-10 h-[600px] w-[600px] rounded-full bg-primary/[0.07] blur-[140px]" />
        <div className="absolute -right-40 bottom-20 h-[520px] w-[520px] rounded-full bg-secondary/[0.09] blur-[120px]" />
        <div className="absolute left-1/3 top-1/2 h-[280px] w-[280px] -translate-y-1/2 rounded-full bg-primary/[0.04] blur-[90px]" />

        <ParticleBackground id="particles-forumpost" />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10">
        <div
          className="absolute inset-0 bg-deep"
          style={{
            clipPath: "polygon(0 0, 100% 0, 100% 78%, 68% 92%, 0 100%)",
          }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary/18 via-transparent to-secondary/12"
          style={{ clipPath: "polygon(42% 0, 100% 0, 100% 100%, 22% 100%)" }}
        />

        {/* Beam lines */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[14%] top-0 h-[130%] w-px origin-top rotate-[11deg] bg-gradient-to-b from-primary/45 via-primary/12 to-transparent" />
          <div className="absolute right-[20%] top-0 h-[140%] w-px origin-top -rotate-[14deg] bg-gradient-to-b from-secondary/35 via-secondary/10 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 pb-28 pt-24 sm:px-6 lg:pb-36 lg:pt-28">
          {/* Back link — clear separation */}
          <div className="mb-8">
            <Link
              href="/forum"
              className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-white"
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
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-highlight backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              {getCategoryLabel(post.category, dict)}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-[2.6rem]">
            {post.title}
          </h1>

          {/* Meta row */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradient(post.author_name)} text-[11px] font-semibold text-white`}
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

        {/* Bottom energy divider — clean gradient line */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 -bottom-1 h-3 bg-gradient-to-r from-transparent via-primary/15 to-transparent blur-md" />
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CONTENT
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 -mt-4 pb-24">
        <div className="pointer-events-none absolute inset-0 opacity-[0.18] grain-pattern grain-masked" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
          {/* Original post */}
          <div className="relative">
            <div
              className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/[0.07] via-transparent to-secondary/[0.05]"
              style={{ clipPath: "polygon(0 0, 100% 2%, 98% 100%, 0 97%)" }}
            />

            <div className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-surface shadow-[0_24px_50px_-18px_rgba(0,0,0,0.1)]">
              {/* Static gradient strip (no constant animation) */}
              <div className="relative h-1.5 overflow-hidden bg-deep">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-[#c9a24b] to-secondary" />
              </div>

              <div className="relative p-7 sm:p-9">
                <span className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary ring-1 ring-primary/15">
                  {dict.forum.originalPost}
                </span>

                <p className="whitespace-pre-line leading-relaxed text-text-secondary">
                  {post.content}
                </p>
              </div>
            </div>
          </div>

          {/* Replies */}
          <div id="replies" className="mt-14 scroll-mt-28">
            <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-8 rounded-full bg-gradient-to-r from-primary to-secondary" />
                <h2 className="text-2xl font-bold tracking-tight text-text-primary">
                  {totalReplies === 0
                    ? dict.forum.noRepliesYet
                    : `${formatCount(totalReplies)} ${
                        totalReplies === 1
                          ? dict.forum.replyCount
                          : dict.forum.replies
                      }`}
                </h2>
              </div>

              {adminCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/15">
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
              <div className="rounded-[1.6rem] border border-dashed border-border/80 bg-surface/80 py-14 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-soft text-primary ring-1 ring-primary/15">
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
                {/* Empty-state CTA — jump straight to the reply form */}
                <a
                  href="#reply-form"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-deep shadow-[0_0_20px_-6px_rgba(26,115,82,0.6)] transition hover:bg-primary-hover"
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
                        className="group relative scroll-mt-28 rounded-[1.6rem] bg-gradient-to-br from-primary via-secondary to-primary p-[1.5px] shadow-lg shadow-primary/10 transition-transform duration-300 hover:-translate-y-0.5"
                      >
                        <div className="relative overflow-hidden rounded-[calc(1.6rem-1.5px)] bg-gradient-to-br from-soft via-surface to-surface p-6 sm:p-7">
                          <div className="relative flex items-start gap-4">
                            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-sm ring-2 ring-white">
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
                                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-deep">
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
                        className="group flex items-start gap-4 scroll-mt-28 rounded-[1.5rem] border border-border/60 bg-surface p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradient(reply.author_name)} text-sm font-semibold text-white`}
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
                            <span className="mx-2">·</span>
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

                {/* Reply pagination — keeps long threads light */}
                {totalReplyPages > 1 && (
                  <nav
                    className="mt-8 flex items-center justify-center gap-3 text-sm"
                    aria-label="Replies pagination"
                  >
                    {replyPage > 1 && (
                      <Link
                        href={replyHref(replyPage - 1)}
                        scroll={false}
                        className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-surface px-4 py-2 font-medium text-text-secondary transition hover:border-primary/40 hover:text-primary"
                      >
                        ← {dict.forum.previousReplies}
                      </Link>
                    )}
                    <span className="text-muted">
                      {formatCount(replyPage)} / {formatCount(totalReplyPages)}
                    </span>
                    {replyPage < totalReplyPages && (
                      <Link
                        href={replyHref(replyPage + 1)}
                        scroll={false}
                        className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-surface px-4 py-2 font-medium text-text-secondary transition hover:border-primary/40 hover:text-primary"
                      >
                        {dict.forum.loadMoreReplies} →
                      </Link>
                    )}
                  </nav>
                )}
              </>
            )}
          </div>

          {/* Reply form */}
          <div id="reply-form" className="mt-14 scroll-mt-28">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-1.5 w-8 rounded-full bg-gradient-to-r from-primary to-secondary" />
              <h3 className="text-lg font-semibold text-text-primary">
                {dict.forum.leaveReply}
              </h3>
            </div>

            <div className="relative">
              <div
                className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/[0.07] via-transparent to-secondary/[0.05]"
                style={{ clipPath: "polygon(0 0, 100% 2%, 98% 100%, 0 97%)" }}
              />
              <div className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-surface shadow-[0_24px_50px_-18px_rgba(0,0,0,0.1)]">
                {/* Static gradient strip (no constant animation) */}
                <div className="relative h-1.5 overflow-hidden bg-deep">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-[#c9a24b] to-secondary" />
                </div>
                <div className="p-6 sm:p-8">
                  <ReplyForm postId={post.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}