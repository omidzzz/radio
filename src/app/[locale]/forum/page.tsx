import type { Metadata } from "next";
import Link from "next/link";
import NewPostForm from "@/components/forms/NewPostForm";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { getCategoryLabel, formatDate, formatRelativeTime } from "@/lib/i18n";
import { toFarsiDigits } from "@/lib/i18n/numbers";
import { siteConfig } from "@/lib/seo/seo";
import { breadcrumbSchema } from "@/lib/seo/json-ld";
import JsonLdScript from "@/components/feedback/JsonLd";
import RadiationEmblem from "@/components/ui/RadiationEmblem";
import ParticleBackground from "@/components/ui/ParticleBackground";
import PageHero from "@/components/ui/PageHero";
import { getPageItems } from "@/lib/http/pagination";
import { listForumPostSummaries } from "@/lib/services/forum-service";

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { locale: "fa" as const },
    { locale: "en" as const },
  ];
}

export const revalidate = 60;

const POSTS_PER_PAGE = 10;

const CATEGORIES = ["all", "general", "treatment", "support", "other"] as const;
const SORTS = ["newest", "replies"] as const;
type Sort = (typeof SORTS)[number];

export default async function ForumPage({ params }: { params: Promise<{ locale: Locale }>; searchParams?: Promise<{ page?: string; category?: string; sort?: string }> }) {
  const { locale }: { locale: Locale } = await params;
  const dict = getDictionary(locale);
  const isFa = locale === "fa";

  const page = 1;
  const category = "all";
  const sort: Sort = "newest";
  const validCategory = "all";

  const { posts, totalPages } = listForumPostSummaries({
    category: validCategory,
    page,
    limit: POSTS_PER_PAGE,
    sort,
  });

  const breadcrumbs = breadcrumbSchema([
    { name: isFa ? "خانه" : "Home", path: `/${locale}` },
    { name: dict.forum.title, path: `/${locale}/forum` },
  ]);

  const categoryLabels: Record<string, { fa: string; en: string }> = {
    all: { fa: "همه", en: "All" },
    general: { fa: "سوالات عمومی", en: "General" },
    treatment: { fa: "درمان و عوارض", en: "Treatment" },
    support: { fa: "حمایت و مقابله", en: "Support" },
    other: { fa: "سایر", en: "Other" },
  };

  const forumHref = (overrides: { page?: number; category?: string; sort?: string }) => {
    const p = new URLSearchParams();
    const cat = overrides.category ?? validCategory;
    const srt = overrides.sort ?? sort;
    if (cat !== "all") p.set("category", cat);
    if (srt !== "newest") p.set("sort", srt);
    if ((overrides.page ?? page) > 1) p.set("page", String(overrides.page ?? page));
    const qs = p.toString();
    return qs ? `/${locale}/forum?${qs}` : `/${locale}/forum`;
  };

  const formatCount = (n: number) => (isFa ? toFarsiDigits(n) : String(n));

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <JsonLdScript data={breadcrumbs} />

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-48 top-10 h-[600px] w-[600px] rounded-full bg-primary/[0.07] blur-[140px]" />
        <div className="absolute -right-40 bottom-20 h-[520px] w-[520px] rounded-full bg-secondary/[0.09] blur-[120px]" />
        <ParticleBackground id="particles-forum" className="text-muted" />
      </div>

      <PageHero
        badge={dict.forum.title}
        title={dict.forum.title}
        subtitle={dict.forum.subtitle}
        emblem={
          <div className="relative mx-auto aspect-square w-full max-w-[440px]">
            <div className="absolute inset-[8%] rounded-full bg-primary/25 blur-3xl animate-pulse" />
            <RadiationEmblem variant="atom" />
          </div>
        }
      />

      <section className="relative z-10 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
                  <div className="flex items-center gap-2">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-5 w-5 text-primary"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <path
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-21 9h-3m3 0h3m-3-3v-3m3 3v-3M3 16l3-3m0 0l3 3m-3-3l-3 3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <h2 className="text-lg font-semibold text-text-primary">
                      {dict.forum.recentQuestions}
                    </h2>
                  </div>
                </div>

                {posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.map((post) => {
                      const categoryLabel =
                        categoryLabels[post.category]?.[isFa ? "fa" : "en"] ??
                        post.category;
                      return (
                        <Link
                          key={post.id}
                          href={`/${locale}/forum/${post.id}`}
                          className="site-card group flex items-start gap-4 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5"
                        >
                          <div className="flex shrink-0 items-center gap-2.5">
                            <span
                              className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${post.category === "general" ? "bg-primary-fill text-on-primary" : "bg-surface text-text-primary border border-border"}`}
                            >
                              {formatCount(post.reply_count)}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${post.category === "general" ? "bg-primary-fill text-on-primary" : "bg-surface text-text-primary border border-border"}`}
                            >
                              {categoryLabel}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base font-semibold text-text-primary group-hover:text-primary">
                              {post.title}
                            </h3>
                            <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
                              {post.excerpt}
                            </p>
                            <div className="mt-3 flex items-center gap-3 text-xs text-muted">
                              <time>{formatDate(post.created_at, locale as Locale)}</time>
                              <span>·</span>
                              <span>{post.author_name}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="page-empty-state rounded-2xl p-12 text-center">
                    <p className="text-lg text-text-secondary">
                      {isFa
                        ? "هنوز پستی در انجمن منتشر نشده است"
                        : "No forum posts yet"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div id="ask-form" className="scroll-mt-28 lg:sticky lg:top-28">
                <div
                  className="absolute -inset-4 -z-10 hidden rounded-[2rem] bg-gradient-to-br from-primary/[0.08] via-transparent to-secondary/[0.05] lg:block"
                  style={{ clipPath: "polygon(0 0, 100% 3%, 97% 100%, 0 96%)" }}
                />
                <div className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-surface/95 shadow-[0_24px_50px_-18px_rgba(0,0,0,0.12)] backdrop-blur-sm">
                  <div className="relative h-1.5 overflow-hidden bg-deep">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-[#c9a24b] to-secondary" />
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

      {totalPages > 1 && (
        <nav
          className="mt-14 flex items-center justify-center gap-2"
          aria-label="Forum pagination"
        >
          {page > 1 && (
            <Link
              href={forumHref({ page: page - 1 })}
              scroll={false}
              className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition hover:border-primary/40 hover:text-primary"
            >
              {isFa ? "قبلی" : "Previous"}
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
                    ? "bg-primary-fill text-on-primary shadow-[0_0_20px_-4px_rgba(26,115,82,0.5)]"
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
                …
              </span>
            ),
          )}

          {page < totalPages && (
            <Link
              href={forumHref({ page: page + 1 })}
              scroll={false}
              className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition hover:border-primary/40 hover:text-primary"
            >
              {isFa ? "بعدی" : "Next"}
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}

