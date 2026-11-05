import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import db from "@/lib/db/db";
import ReplyForm from "@/components/forms/ReplyForm";
import {
  getCachedForumPost,
  listCachedRepliesForPost,
} from "@/lib/services/forum-service";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { getCategoryLabel, formatDate, formatRelativeTime } from "@/lib/i18n";
import { toFarsiDigits } from "@/lib/i18n/numbers";
import { siteConfig } from "@/lib/seo/seo";
import { qaPageSchema, breadcrumbSchema } from "@/lib/seo/json-ld";
import JsonLdScript from "@/components/feedback/JsonLd";
import ParticleBackground from "@/components/ui/ParticleBackground";

export const revalidate = 60;

const REPLIES_PER_PAGE = 10;

export function generateStaticParams() {
  const posts = db.prepare("SELECT id FROM forum_posts").all() as {
    id: number;
  }[];

  return posts.flatMap((post) => [
    { locale: "fa" as const, id: String(post.id) },
    { locale: "en" as const, id: String(post.id) },
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const postId = Number(id);
  const post = Number.isInteger(postId)
    ? getCachedForumPost(postId)
    : undefined;

  if (!post) {
    return { title: "پست یافت نشد" };
  }

  const url = `/${locale}/forum/${id}`;

  return {
    title: post.title,
    description: `پرسش و پاسخ درباره: ${post.title}`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${post.title} | دکتر پری قدمگاهی`,
      description: `پرسش و پاسخ درباره: ${post.title}`,
      type: "article",
      url: `${siteConfig.url}${url}`,
      images: [{ url: siteConfig.defaultOgImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | دکتر پری قدمگاهی`,
      description: `پرسش و پاسخ درباره: ${post.title}`,
    },
  };
}

interface PageProps {
  params: Promise<{ locale: Locale; id: string }>;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

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

export default async function ForumPostPage({ params }: PageProps) {
  const { locale, id } = await params;
  const postId = Number(id);

  if (!Number.isInteger(postId)) {
    notFound();
  }

  const dict = getDictionary(locale as Locale);
  const isFa = locale === "fa";
  const formatCount = (n: number) => (isFa ? toFarsiDigits(n) : String(n));

  const post = getCachedForumPost(postId);

  if (!post) {
    notFound();
  }

  const repliesResult = listCachedRepliesForPost(postId, 10, 0);
  const replies = repliesResult.replies;

  const replyHref = (p: number) => {
    const qs = p > 1 ? `?page=${p}` : "";
    return `/${locale}/forum/${id}${qs}`;
  };

  const breadcrumbs = breadcrumbSchema([
    { name: isFa ? "خانه" : "Home", path: `/${locale}` },
    { name: dict.forum.title, path: `/${locale}/forum` },
    { name: post.title, path: `/${locale}/forum/${id}` },
  ]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <JsonLdScript data={breadcrumbs} />

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-48 top-10 h-[600px] w-[600px] rounded-full bg-primary/[0.07] blur-[140px]" />
        <div className="absolute -right-40 bottom-20 h-[520px] w-[520px] rounded-full bg-secondary/[0.09] blur-[120px]" />
        <ParticleBackground id="particles-forum-post" className="text-muted" />
      </div>

      <section className="relative z-10 py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-3" dir={isFa ? "rtl" : "ltr"}>
            <Link
              href={`/${locale}/forum`}
              className="inline-flex items-center gap-1 text-sm font-medium text-text-secondary transition hover:text-primary"
            >
              ← {dict.forum.title}
            </Link>
          </div>

          <div className="page-surface rounded-[1.75rem] p-6 sm:p-8">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              {post.title}
            </h1>
            <div className="mt-4 flex items-center gap-3 text-sm text-text-secondary">
              <span className="font-medium text-text-primary">{post.author_name}</span>
              <span>·</span>
              <time>{formatDate(post.created_at, locale as Locale)}</time>
              <span>·</span>
              <span>
                {formatCount(post.reply_count ?? 0)}{" "}
                {isFa ? "پاسخ" : "replies"}
              </span>
            </div>
            <div className="mt-6 text-base leading-relaxed text-text-secondary">
              {post.content}
            </div>
          </div>

          {/* Replies */}
          <div className="mt-10 space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-text-primary">
              {isFa ? "پاسخ‌ها" : "Replies"}
            </h2>
            {replies.length > 0 ? (
              replies.map((reply) => (
                <div
                  key={reply.id}
                  className="page-surface rounded-2xl p-5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradient(reply.author_name)} text-sm font-bold text-white`}
                    >
                      {getInitials(reply.author_name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        {reply.author_name}
                      </p>
                      <p className="text-xs text-muted">
                        {formatDate(reply.created_at, locale as Locale)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-base leading-relaxed text-text-secondary">
                    {reply.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
                <p className="text-lg text-text-secondary">
                  {isFa ? "هنوز پاسخی ثبت نشده است" : "No replies yet"}
                </p>
              </div>
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
              <div className="page-surface overflow-hidden rounded-[1.75rem]">
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

