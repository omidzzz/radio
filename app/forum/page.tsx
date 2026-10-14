import type { Metadata } from "next";
import Link from "next/link";
import db from "@/lib/db";
import NewPostForm from "@/components/NewPostForm";
import { getServerDictionary, getServerLocale } from "@/lib/i18n/server";
import { getCategoryLabel, formatDate, formatRelativeTime } from "@/lib/i18n";
import { toFarsiDigits } from "@/lib/i18n/numbers";
import { siteConfig } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/json-ld";
import JsonLdScript from "@/components/JsonLd";
import { RadiationIcon } from "@/components/ui/icons";
import PageHero from "@/components/PageHero";
import { getPageItems } from "@/lib/pagination";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getServerDictionary();

  return {
    title: dict.forum.title,
    description: dict.forum.subtitle,
    alternates: {
      canonical: "/forum",
    },
    openGraph: {
      title: `${dict.forum.title} | ${dict.common.clinicName}`,
      description: dict.forum.subtitle,
      type: "website",
      url: `${siteConfig.url}/forum`,
      images: [{ url: siteConfig.defaultOgImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${dict.forum.title} | ${dict.common.clinicName}`,
      description: dict.forum.subtitle,
    },
  };
}

export const revalidate = 60;

const POSTS_PER_PAGE = 10;

const CATEGORIES = ["all", "general", "treatment", "support", "other"] as const;
const SORTS = ["newest", "replies"] as const;
type Sort = (typeof SORTS)[number];

/**
 * Lightweight list projection â€” avoids pulling the full post body for every
 * row when only a two-line excerpt is rendered.
 */
interface ForumPostListItem {
  id: number;
  title: string;
  category: string;
  author_name: string;
  created_at: string;
  excerpt: string;
  reply_count: number;
  total_count: number;
}

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; sort?: string }>;
}) {
  const { dict } = await getServerDictionary();
  const locale = await getServerLocale();
  const isFa = locale === "fa";

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const category = params.category || "all";
  const sort: Sort = SORTS.includes(params.sort as Sort)
    ? (params.sort as Sort)
    : "newest";
  const offset = (page - 1) * POSTS_PER_PAGE;

  // Validate category
  const validCategory = CATEGORIES.includes(category as (typeof CATEGORIES)[number])
    ? category
    : "all";

  const orderBy =
    sort === "replies"
      ? `ORDER BY reply_count DESC, fp.created_at DESC`
      : `ORDER BY fp.created_at DESC`;

  // Query with category filter and pagination â€” selects only the columns the
  // UI renders (plus a short excerpt) instead of the full post body.
  const baseSelect = `
    SELECT fp.id, fp.title, fp.category, fp.author_name, fp.created_at,
           substr(fp.content, 1, 220) AS excerpt,
           COUNT(fr.id) AS reply_count,
           COUNT(*) OVER() AS total_count
    FROM forum_posts fp
    LEFT JOIN forum_replies fr ON fr.post_id = fp.id`;

  const posts = (
    validCategory !== "all"
      ? db
          .prepare(
            `${baseSelect}
             WHERE fp.category = ?
             GROUP BY fp.id
             ${orderBy}
             LIMIT ? OFFSET ?`
          )
          .all(validCategory, POSTS_PER_PAGE, offset)
      : db
          .prepare(
            `${baseSelect}
             GROUP BY fp.id
             ${orderBy}
             LIMIT ? OFFSET ?`
          )
          .all(POSTS_PER_PAGE, offset)
  ) as unknown as ForumPostListItem[];

  const total = posts.length > 0 ? Number(posts[0].total_count) : 0;
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));

  const breadcrumbs = breadcrumbSchema([
    { name: isFa ? "Ø®Ø§Ù†Ù‡" : "Home", path: "/" },
    { name: dict.forum.title, path: "/forum" },
  ]);

  const categoryLabels: Record<string, { fa: string; en: string }> = {
    all: { fa: "Ù‡Ù…Ù‡", en: "All" },
    general: { fa: "Ø³ÙˆØ§Ù„Ø§Øª Ø¹Ù…ÙˆÙ…ÛŒ", en: "General" },
    treatment: { fa: "Ø¯Ø±Ù…Ø§Ù† Ùˆ Ø¹ÙˆØ§Ø±Ø¶", en: "Treatment" },
    support: { fa: "Ø­Ù…Ø§ÛŒØª Ùˆ Ù…Ù‚Ø§Ø¨Ù„Ù‡", en: "Support" },
    other: { fa: "Ø³Ø§ÛŒØ±", en: "Other" },
  };

  /** Build a /forum URL preserving the active category + sort */
  const forumHref = (overrides: { page?: number; category?: string; sort?: string }) => {
    const p = new URLSearchParams();
    const cat = overrides.category ?? validCategory;
    const srt = overrides.sort ?? sort;
    if (cat !== "all") p.set("category", cat);
    if (srt !== "newest") p.set("sort", srt);
    if ((overrides.page ?? page) > 1) p.set("page", String(overrides.page ?? page));
    const qs = p.toString();
    return qs ? `/forum?${qs}` : "/forum";
  };

  const formatCount = (n: number) => (isFa ? toFarsiDigits(n) : String(n));

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <JsonLdScript data={breadcrumbs} />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          GLOBAL AMBIENT FIELD
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-48 top-10 h-[600px] w-[600px] rounded-full bg-primary/[0.07] blur-[140px]" />
        <div className="absolute -right-40 bottom-20 h-[520px] w-[520px] rounded-full bg-secondary/[0.09] blur-[120px]" />
        <div className="absolute left-1/3 top-1/2 h-[280px] w-[280px] -translate-y-1/2 rounded-full bg-primary/[0.04] blur-[90px]" />

      </div>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HERO â€” clean medical-tech hero
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <PageHero
        badge={dict.forum.title}
        title={dict.forum.title}
        subtitle={dict.forum.subtitle}
        emblem={
          <div className="relative mx-auto aspect-square w-full max-w-[340px]">
            <RadiationIcon className="h-full w-full text-primary" />
          </div>
        }
      />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          FORUM CONTENT
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 overflow-hidden py-20 lg:py-24">
        <div className="grain-pattern grain-masked pointer-events-none absolute inset-0 opacity-[0.22]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            {/* Posts List */}
            <div className="lg:col-span-7">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-8 rounded-full bg-gradient-to-r from-primary to-secondary" />
                  <h2 className="text-2xl font-bold tracking-tight text-text-primary">
                    {dict.forum.recentQuestions}
                  </h2>
                </div>

                {/* Mobile CTA â€” jumps to the ask form below the list */}
                <a
                  href="#ask-form"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-deep `shadow-[0_0_16px_-4px_rgba(15,23,42,0.10)] transition hover:bg-primary-hover lg:hidden"
                >
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  {dict.forum.askQuestionCta}
                </a>
              </div>

              {/* Category filter */}
              <div className="mb-4 flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    href={forumHref({ category: cat, page: 1 })}
                    scroll={false}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                      validCategory === cat
                        ? "bg-primary text-deep `shadow-[0_0_16px_-4px_rgba(15,23,42,0.10)]"
                        : "border border-border/70 bg-surface text-text-secondary hover:border-primary/40 hover:text-primary"
                    }`}
                  >
                    {isFa
                      ? categoryLabels[cat].fa
                      : categoryLabels[cat].en}
                  </Link>
                ))}
              </div>

              {/* Sort options */}
              <div className="mb-6 flex items-center gap-2 text-xs">
                <span className="text-muted">{isFa ? "Ù…Ø±ØªØ¨â€ŒØ³Ø§Ø²ÛŒ:" : "Sort:"}</span>
                {SORTS.map((s) => (
                  <Link
                    key={s}
                    href={forumHref({ sort: s, page: 1 })}
                    scroll={false}
                    className={`rounded-full px-3 py-1 font-medium transition ${
                      sort === s
                        ? "bg-soft text-primary ring-1 ring-primary/20"
                        : "text-text-secondary hover:text-primary"
                    }`}
                  >
                    {s === "newest" ? dict.forum.sortNewest : dict.forum.sortMostReplied}
                  </Link>
                ))}
              </div>

              {posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-border/80 bg-surface/90 py-16 text-center shadow-sm">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-soft text-primary ring-1 ring-primary/15">
                    <svg
                      viewBox="0 0 48 48"
                      fill="none"
                      className="h-8 w-8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        d="M10 24c0-7.7 6.3-14 14-14s14 6.3 14 14-6.3 14-14 14c-2.4 0-4.6-.6-6.6-1.6L10 38l2.2-5.8C11 30.2 10 27.2 10 24z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M19 24h.01M24 24h.01M29 24h.01"
                        strokeLinecap="round"
                        strokeWidth="2.2"
                      />
                      <circle cx="24" cy="24" r="16" strokeOpacity="0.15" strokeDasharray="2 4" />
                    </svg>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-text-primary">
                    {dict.forum.noQuestions}
                  </h3>
                  <p className="mt-2 text-text-secondary">
                    {dict.forum.beFirst}
                  </p>
                  {/* Empty-state CTA â€” jump straight to the ask form */}
                  <a
                    href="#ask-form"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-deep `shadow-[0_0_20px_-6px_rgba(15,23,42,0.10)] transition hover:bg-primary-hover lg:hidden"
                  >
                    {dict.forum.askQuestionCta}
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/forum/${post.id}`}
                      className="group relative block overflow-hidden rounded-[1.6rem] border border-border/60 bg-surface/95 p-6 shadow-sm transition-all duration-400 hover:-translate-y-1 hover:border-primary/45 hover:`shadow-[0_18px_40px_-12px_rgba(15,23,42,0.10)]"
                    >
                      {/* Hover energy line */}
                      <div className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-500 group-hover:scale-x-100" />

                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-lg font-semibold text-text-primary transition-colors group-hover:text-primary">
                          {post.title}
                        </h3>
                        <span className="shrink-0 rounded-full bg-soft px-3 py-1 text-xs font-medium text-primary ring-1 ring-primary/10">
                          {getCategoryLabel(post.category, dict)}
                        </span>
                      </div>

                      <p className="mt-2 line-clamp-2 text-text-secondary">
                        {post.excerpt}
                      </p>

                      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
                        <span className="font-medium text-text-primary">
                          {post.author_name}
                        </span>
                        {/* Relative time for scannability; full date on hover */}
                        <span title={formatDate(post.created_at, locale)}>
                          {formatRelativeTime(post.created_at, locale)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg
                            className="h-4 w-4 text-primary/70"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.8}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          {formatCount(post.reply_count ?? 0)} {dict.forum.replies}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination â€” windowed so large result sets stay compact */}
              {totalPages > 1 && (
                <nav
                  className="mt-10 flex flex-wrap items-center justify-center gap-2"
                  aria-label="Forum pagination"
                >
                  {page > 1 && (
                    <Link
                      href={forumHref({ page: page - 1 })}
                      scroll={false}
                      className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition hover:border-primary/40 hover:text-primary"
                    >
                      {isFa ? "Ù‚Ø¨Ù„ÛŒ" : "Previous"}
                    </Link>
                  )}

                  {getPageItems(page, totalPages).map((item, idx) =>
                    typeof item === "number" ? (
                      <Link
                        key={idx}
                        href={forumHref({ page: item })}
                        scroll={false}
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition ${
                          item === page
                            ? "bg-primary text-deep `shadow-[0_0_20px_-4px_rgba(15,23,42,0.10)]"
                            : "border border-border/70 bg-surface text-text-secondary hover:border-primary/40 hover:text-primary"
                        }`}
                        aria-current={item === page ? "page" : undefined}
                      >
                        {formatCount(item)}
                      </Link>
                    ) : (
                      <span
                        key={idx}
                        className="inline-flex h-10 w-6 items-center justify-center text-sm text-muted"
                        aria-hidden="true"
                      >
                        â€¦
                      </span>
                    ),
                  )}

                  {page < totalPages && (
                    <Link
                      href={forumHref({ page: page + 1 })}
                      scroll={false}
                      className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition hover:border-primary/40 hover:text-primary"
                    >
                      {isFa ? "Ø¨Ø¹Ø¯ÛŒ" : "Next"}
                    </Link>
                  )}
                </nav>
              )}
            </div>

            {/* New Post Form */}
            <div className="lg:col-span-5">
              <div id="ask-form" className="scroll-mt-28 lg:sticky lg:top-28">
                <div
                  className="absolute -inset-4 -z-10 hidden rounded-[2rem] bg-gradient-to-br from-primary/[0.08] via-transparent to-secondary/[0.05] lg:block"
                  style={{ clipPath: "polygon(0 0, 100% 3%, 97% 100%, 0 96%)" }}
                />
                <div className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-surface/95 shadow-[0_24px_50px_-18px_rgba(0,0,0,0.12)] backdrop-blur-sm">
                  {/* Static gradient strip (no constant animation) */}
                  <div className="relative h-1.5 overflow-hidden bg-deep">
                    <div className="absolute inset-0 bg-primary" />
                  </div>
                  <div className="p-6">
                    <NewPostForm />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}