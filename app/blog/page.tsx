import type { Metadata } from "next";
import Link from "next/link";
import db from "@/lib/db";
import { getServerDictionary } from "@/lib/i18n/server";
import { toFarsiDigits } from "@/lib/i18n/numbers";
import { siteConfig } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/json-ld";
import JsonLdScript from "@/components/JsonLd";
import { RadiationIcon } from "@/components/ui/icons";
import PageHero from "@/components/PageHero";
import BlogPostCard from "@/components/blog/BlogPostCard";
import CategoryFilter from "@/components/blog/CategoryFilter";

interface BlogPost {
  id: number;
  title_fa: string;
  title_en?: string;
  excerpt_fa: string;
  excerpt_en?: string;
  author_fa: string;
  author_en?: string;
  category_fa: string;
  category_en?: string;
  image?: string;
  read_minutes: number;
  published_at?: string;
  views?: number | null;
}

export const revalidate = 60;

const POSTS_PER_PAGE = 6;

/** Build a windowed page list, e.g. [1, "â€¦", 4, 5, 6, "â€¦", 20] */
function getPageRange(current: number, total: number): (number | "â€¦")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const result: (number | "â€¦")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("â€¦");
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
    ? `${category} â€” Ù…Ù‚Ø§Ù„Ø§Øª ØªØ®ØµØµÛŒ`
    : "Ù…Ù‚Ø§Ù„Ø§Øª ØªØ®ØµØµÛŒ";
  const description =
    "Ø¯Ø§Ù†Ø´ Ùˆ ØªØ¬Ø±Ø¨Ù‡ Ø¯Ø± Ø²Ù…ÛŒÙ†Ù‡ Ù¾Ø±ØªÙˆØ¯Ø±Ù…Ø§Ù†ÛŒ Ùˆ ØªØµÙˆÛŒØ±Ø¨Ø±Ø¯Ø§Ø±ÛŒ Ù¾Ø²Ø´Ú©ÛŒ. Ù…Ù‚Ø§Ù„Ø§Øª ØªØ®ØµØµÛŒ Ø¯Ø±Ø¨Ø§Ø±Ù‡ ØªØ´Ø®ÛŒØµ Ùˆ Ø¯Ø±Ù…Ø§Ù† Ø³Ø±Ø·Ø§Ù†.";

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
      title: `${title} | Ú©Ù„ÛŒÙ†ÛŒÚ© Ù¾Ø±ØªÙˆØ¯Ø±Ù…Ø§Ù†ÛŒ`,
      description,
      type: "website",
      url: `${siteConfig.url}${canonical}`,
      images: [{ url: siteConfig.defaultOgImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Ú©Ù„ÛŒÙ†ÛŒÚ© Ù¾Ø±ØªÙˆØ¯Ø±Ù…Ø§Ù†ÛŒ`,
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
  const offset = (page - 1) * POSTS_PER_PAGE;

  // Get all unique categories for the filter
  const categories = db
    .prepare(
      `SELECT DISTINCT category_fa, category_en FROM blog_posts WHERE is_published = 1 ORDER BY category_fa`,
    )
    .all() as { category_fa: string; category_en: string | null }[];

  // Single query with window function to get count + posts in one DB call
  const rows = (category !== "all"
    ? db
        .prepare(
          `SELECT id, title_fa, title_en, excerpt_fa, excerpt_en, author_fa, author_en,
                  category_fa, category_en, image, read_minutes, published_at, views,
                  COUNT(*) OVER() AS total_count
           FROM blog_posts
           WHERE is_published = 1 AND category_fa = ?
           ORDER BY published_at DESC, created_at DESC
           LIMIT ? OFFSET ?`,
        )
        .all(category, POSTS_PER_PAGE, offset)
    : db
        .prepare(
          `SELECT id, title_fa, title_en, excerpt_fa, excerpt_en, author_fa, author_en,
                  category_fa, category_en, image, read_minutes, published_at, views,
                  COUNT(*) OVER() AS total_count
           FROM blog_posts
           WHERE is_published = 1
           ORDER BY published_at DESC, created_at DESC
           LIMIT ? OFFSET ?`,
        )
        .all(POSTS_PER_PAGE, offset)) as (BlogPost & { total_count: number })[];

  const posts = rows;
  const total = rows.length > 0 ? rows[0].total_count : 0;
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));

  const breadcrumbs = breadcrumbSchema([
    { name: "Ø®Ø§Ù†Ù‡", path: "/" },
    { name: "Ù…Ù‚Ø§Ù„Ø§Øª ØªØ®ØµØµÛŒ", path: "/blog" },
  ]);

  const pageHref = (pageNum: number) =>
    `/blog?page=${pageNum}${category !== "all" ? `&category=${encodeURIComponent(category)}` : ""}`;

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <JsonLdScript data={breadcrumbs} />


      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HERO â€” clean medical-tech hero
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <PageHero
        badge={isFa ? "Ø¨Ù„Ø§Ú¯ Ù¾Ø²Ø´Ú©ÛŒ" : "Medical Blog"}
        title={isFa ? "Ù…Ù‚Ø§Ù„Ø§Øª ØªØ®ØµØµÛŒ" : "Medical Articles"}
        subtitle={
          isFa
            ? "Ø¯Ø§Ù†Ø´ Ùˆ ØªØ¬Ø±Ø¨Ù‡ Ø¯Ø± Ø²Ù…ÛŒÙ†Ù‡ Ù¾Ø±ØªÙˆØ¯Ø±Ù…Ø§Ù†ÛŒ Ùˆ ØªØµÙˆÛŒØ±Ø¨Ø±Ø¯Ø§Ø±ÛŒ Ù¾Ø²Ø´Ú©ÛŒ"
            : "Knowledge and expertise in radiotherapy and medical imaging"
        }
        emblem={
          <div className="relative mx-auto aspect-square w-full max-w-[340px]">
            <RadiationIcon className="h-full w-full text-primary" />
          </div>
        }
      />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          BLOG POSTS
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="mod-blog section-pad">
        <div className="grain-pattern pointer-events-none absolute inset-0" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h2 className="mono text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted">
              {isFa ? "Ø¢Ø®Ø±ÛŒÙ† Ù…Ù‚Ø§Ù„Ø§Øª" : "Latest Articles"}
            </h2>

            {/* Result count */}
            {total > 0 && (
              <p className="text-sm text-muted">
                {isFa
                  ? `${toFarsiDigits(total)} Ù…Ù‚Ø§Ù„Ù‡${category !== "all" ? ` Ø¯Ø± Ø¯Ø³ØªÙ‡Ù” Â«${category}Â»` : ""}`
                  : `${total} article${total === 1 ? "" : "s"}${category !== "all" ? ` in â€œ${category}â€` : ""}`}
              </p>
            )}
          </div>

          {/* Category filter */}
          {categories.length > 0 && (
            <CategoryFilter
              active={category}
              categories={categories.map((cat) => ({
                value: cat.category_fa,
                label: isFa ? cat.category_fa : cat.category_en || cat.category_fa,
              }))}
            />
          )}

          {/* Empty state */}
          {posts.length === 0 && (
            <div className="flex flex-col items-center justify-center border border-dashed border-border/80 bg-surface/90 py-24 text-center">
              <div className="flex h-16 w-16 items-center justify-center border border-border bg-soft text-primary">
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
                  ? "Ù‡Ù†ÙˆØ² Ù…Ù‚Ø§Ù„Ù‡â€ŒØ§ÛŒ Ù…Ù†ØªØ´Ø± Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª"
                  : "No articles published yet"}
              </p>
            </div>
          )}

          {/* Posts grid â€” first post on page 1 is featured full-width */}
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
                  className="inline-flex items-center gap-1 border border-border/70 bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition hover:border-primary/40 hover:text-primary"
                >
                  {isFa ? "Ù‚Ø¨Ù„ÛŒ" : "Previous"}
                </Link>
              )}

              {getPageRange(page, totalPages).map((item, i) =>
                item === "â€¦" ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="inline-flex h-10 items-center px-1 text-sm text-muted"
                    aria-hidden="true"
                  >
                    â€¦
                  </span>
                ) : (
                  <Link
                    key={item}
                    href={pageHref(item)}
                    className={`mono tnum inline-flex h-10 w-10 items-center justify-center border text-sm font-semibold transition ${
                      item === page
                        ? "border-primary bg-primary text-white"
                        : "border-border/70 bg-surface text-text-secondary hover:border-primary/40 hover:text-primary"
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
                  className="inline-flex items-center gap-1 border border-border/70 bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition hover:border-primary/40 hover:text-primary"
                >
                  {isFa ? "Ø¨Ø¹Ø¯ÛŒ" : "Next"}
                </Link>
              )}
            </nav>
          )}
        </div>
      </section>
    </div>
  );
}
