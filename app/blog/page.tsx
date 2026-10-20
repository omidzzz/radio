import type { Metadata } from "next";
import Link from "next/link";
import { getServerDictionary } from "@/lib/i18n/server";
import { toFarsiDigits } from "@/lib/i18n/numbers";
import {
  listBlogCategories,
  listBlogPostSummaries,
} from "@/lib/services/blog-service";
import { siteConfig, localizedAlternates } from "@/lib/seo/seo";
import { breadcrumbSchema } from "@/lib/seo/json-ld";
import JsonLdScript from "@/components/feedback/JsonLd";
import RadiationEmblem from "@/components/ui/RadiationEmblem";
import ParticleBackground from "@/components/ui/ParticleBackground";
import PageHero from "@/components/ui/PageHero";
import BlogPostCard from "@/components/blog/BlogPostCard";
import CategoryFilter from "@/components/blog/CategoryFilter";

export const revalidate = 60;

const POSTS_PER_PAGE = 6;

/** Build a windowed page list, e.g. [1, "…", 4, 5, 6, "…", 20] */
function getPageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const result: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("…");
    result.push(p);
    prev = p;
  }
  return result;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page || "1", 10));
  const category = params.category;

  const title = category
    ? `${category} — مقالات تخصصی`
    : "مقالات تخصصی";
  const description =
    "دانش و تجربه در زمینه پرتودرمانی و تصویربرداری پزشکی. مقالات تخصصی درباره تشخیص و درمان سرطان.";

  // Canonical points to the clean URL for page 1 without filters;
  // deeper pages/filters get their own canonical to avoid duplicate content.
  const canonicalParams: string[] = [];
  if (category) canonicalParams.push(`category=${encodeURIComponent(category)}`);
  if (page > 1) canonicalParams.push(`page=${page}`);
  const canonical = canonicalParams.length > 0 ? `/blog?${canonicalParams.join("&")}` : "/blog";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} | دکتر پری قدمگاهی`,
      description,
      type: "website",
      url: `${siteConfig.url}${canonical}`,
      images: [{ url: siteConfig.defaultOgImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | دکتر پری قدمگاهی`,
      description,
    },
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const { dict, locale } = await getServerDictionary();
  const isFa = locale === "fa";

  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page || "1", 10));
  const category = params.category || "all";

  // Get all unique categories for the filter
  const categories = listBlogCategories();

  // Single query with window function to get count + posts in one DB call
  const { posts, pagination } = listBlogPostSummaries({
    category,
    page,
    limit: POSTS_PER_PAGE,
  });
  const total = pagination.total;
  const totalPages = Math.max(1, pagination.totalPages);

  const breadcrumbs = breadcrumbSchema([
    { name: "خانه", path: "/" },
    { name: "مقالات تخصصی", path: "/blog" },
  ]);

  const pageHref = (pageNum: number) =>
    `/blog?page=${pageNum}${category !== "all" ? `&category=${encodeURIComponent(category)}` : ""}`;

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <JsonLdScript data={breadcrumbs} />

      {/* ══════════════════════════════════════════════════════════════
          GLOBAL AMBIENT FIELD
      ══════════════════════════════════════════════════════════════ */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-48 top-10 h-[600px] w-[600px] rounded-full bg-primary/[0.07] blur-[140px]" />
        <div className="absolute -right-40 bottom-20 h-[520px] w-[520px] rounded-full bg-secondary/[0.09] blur-[120px]" />
        <div className="absolute left-1/3 top-1/2 h-[280px] w-[280px] -translate-y-1/2 rounded-full bg-primary/[0.04] blur-[90px]" />

        <ParticleBackground id="particles-blog" className="text-muted" />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          HERO — clean medical-tech hero
      ══════════════════════════════════════════════════════════════ */}
      <PageHero
        badge={isFa ? "بلاگ پزشکی" : "Medical Blog"}
        title={isFa ? "مقالات تخصصی" : "Medical Articles"}
        subtitle={
          isFa
            ? "دانش و تجربه در زمینه پرتودرمانی و تصویربرداری پزشکی"
            : "Knowledge and expertise in radiotherapy and medical imaging"
        }
        emblem={
          <div className="relative mx-auto aspect-square w-full max-w-[340px]">
            <div className="absolute inset-[10%] rounded-full bg-primary/20 blur-3xl animate-pulse" />
            <RadiationEmblem variant="constellation" />
          </div>
        }
      />

      {/* ══════════════════════════════════════════════════════════════
          BLOG POSTS
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 overflow-hidden py-20 lg:py-24">
        <div className="grain-pattern grain-masked pointer-events-none absolute inset-0 opacity-[0.22]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-8 rounded-full bg-gradient-to-r from-primary to-secondary" />
              <h2 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                {isFa ? "آخرین مقالات" : "Latest Articles"}
              </h2>
            </div>

            {/* Result count */}
            {total > 0 && (
              <p className="text-sm text-muted">
                {isFa
                  ? `${toFarsiDigits(total)} مقاله${category !== "all" ? ` در دستهٔ «${category}»` : ""}`
                  : `${total} article${total === 1 ? "" : "s"}${category !== "all" ? ` in “${category}”` : ""}`}
              </p>
            )}
          </div>

          {/* Category filter */}
          {categories.length > 0 && (
            <CategoryFilter
              active={category}
              categories={categories.map((cat) => ({
                value: cat.categoryFA,
                label: isFa ? cat.categoryFA : cat.categoryEN || cat.categoryFA,
              }))}
            />
          )}

          {/* Empty state */}
          {posts.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-border/80 bg-surface/90 py-24 text-center shadow-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-soft text-primary ring-1 ring-primary/15">
                <svg
                  viewBox="0 0 48 48"
                  fill="none"
                  className="h-8 w-8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path
                    d="M14 10h16l8 8v20a4 4 0 01-4 4H14a4 4 0 01-4-4V14a4 4 0 014-4z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M30 10v8h8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M18 26h12M18 32h12M18 38h8"
                    strokeLinecap="round"
                    strokeOpacity="0.5"
                  />
                </svg>
              </div>
              <p className="mt-6 text-base text-muted">
                {isFa
                  ? "هنوز مقاله‌ای منتشر نشده است"
                  : "No articles published yet"}
              </p>
            </div>
          )}

          {/* Posts grid — first post on page 1 is featured full-width */}
          {posts.length > 0 && (
            <div className="grid gap-7 md:grid-cols-2">
              {posts.map((post, i) => (
                <div
                  key={post.id}
                  className={page === 1 && i === 0 ? "md:col-span-2" : undefined}
                >
                  <BlogPostCard
                    post={post}
                    isFa={isFa}
                    index={i}
                    eager={i <= 1}
                    featured={page === 1 && i === 0}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              className="mt-14 flex items-center justify-center gap-2"
              aria-label="Pagination"
            >
              {page > 1 && (
                <Link
                  href={pageHref(page - 1)}
                  className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition hover:border-primary/40 hover:text-primary"
                >
                  {isFa ? "قبلی" : "Previous"}
                </Link>
              )}

              {getPageRange(page, totalPages).map((item, i) =>
                item === "…" ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="inline-flex h-10 items-center px-1 text-sm text-muted"
                    aria-hidden="true"
                  >
                    …
                  </span>
                ) : (
                  <Link
                    key={item}
                    href={pageHref(item)}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition ${
                      item === page
                        ? "bg-primary-fill text-on-primary shadow-[0_0_20px_-4px_rgba(26,115,82,0.5)]"
                        : "border border-border/70 bg-surface text-text-secondary hover:border-primary/40 hover:text-primary"
                    }`}
                    aria-current={item === page ? "page" : undefined}
                  >
                    {isFa ? toFarsiDigits(item) : item}
                  </Link>
                ),
              )}

              {page < totalPages && (
                <Link
                  href={pageHref(page + 1)}
                  className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition hover:border-primary/40 hover:text-primary"
                >
                  {isFa ? "بعدی" : "Next"}
                </Link>
              )}
            </nav>
          )}
        </div>
      </section>
    </div>
  );
}