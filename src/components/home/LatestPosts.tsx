import Link from "next/link";
import Image from "next/image";
import { toFarsiDigits } from "@/lib/i18n/numbers";
import { listAllBlogPostSummaries } from "@/lib/services/blog-service";
import type { Locale } from "@/lib/i18n/config";
import type { BlogPostSummary } from "@/lib/types/blog";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";

interface LatestPostsProps {
  dict: { home: { latestPostsTitle?: string; viewAll?: string } };
  isFa: boolean;
}

/**
 * Latest Posts — minimal, well-designed section showing the 3 most recent
 * published blog posts on the homepage. Server component — no client JS.
 */
export default async function LatestPosts({
  dict,
  isFa,
}: LatestPostsProps) {
  const locale: Locale = isFa ? "fa" : "en";
  const allPosts = listAllBlogPostSummaries();
  const posts = allPosts.slice(0, 3);
  const lp = dict.home;

  const title = isFa ? lp.latestPostsTitle ?? "آخرین مطالب" : lp.latestPostsTitle ?? "Latest posts";
  const viewAll = isFa ? lp.viewAll ?? "مشاهده همه" : lp.viewAll ?? "View all";

  if (posts.length === 0) return null;

  return (
    <section
      dir={isFa ? "rtl" : "ltr"}
      className="content-visibility relative overflow-hidden bg-soft section-pad"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <SectionHeader
              eyebrow={isFa ? "نوشته‌های تازه" : "Latest articles"}
              title={title}
              as="h2"
              className="!mb-0"
              goldRule
            />
            <Link
              href={`/${locale}/blog`}
              className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              {viewAll}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`h-3.5 w-3.5 ${isFa ? "-rotate-180" : ""} transition-transform duration-300 group-hover:translate-x-0.5 group-hover:${isFa ? "-translate-x-0.5" : "translate-x-0.5"}`}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={isFa ? "M9 5l7 7-7 7" : "M5 19l14-14M5 5l14 14"}
                />
              </svg>
            </Link>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => {
              const titleText = isFa ? post.titleFA : post.titleEN || post.titleFA;
              const category = isFa ? post.categoryFA : post.categoryEN || post.categoryFA;
              const date = post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString(
                    isFa ? "fa-IR" : "en-US",
                    {
                      year: "numeric",
                      month: isFa ? "long" : "short",
                      day: "numeric",
                    },
                  )
                : null;
              const readTime = isFa
                ? `${toFarsiDigits(post.readMinutes)} دقیقه`
                : `${post.readMinutes} min`;

              return (
                <article
                  key={post.id}
                  className={`surface-panel overflow-hidden flex flex-col h-full border border-border rounded-xl transition-colors duration-300 hover:border-primary/50`}
                >
                  <div className="relative h-48 w-full overflow-hidden shrink-0">
                    <Image
                      src={post.image || "/images/blog-default.webp"}
                      alt={titleText}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      priority={index === 0}
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="inline-flex rounded-full border border-white/20 bg-deep/75 px-3 py-1 text-xs font-medium text-gold backdrop-blur-sm">
                        {category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <a
                      href={`/${locale}/blog/${post.slug || post.id}/`}
                      className="group block"
                    >
                      <h3 className="font-semibold leading-snug text-text-primary transition-colors duration-300 group-hover:text-primary line-clamp-2 text-base">
                        {titleText}
                      </h3>

                      <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs text-muted">
                        {date && <span>{date}</span>}
                        <span className="h-1 w-1 rounded-full bg-border" />
                        <span>{readTime}</span>
                      </div>
                    </a>

                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary opacity-0 transition-all duration-300 group-hover:opacity-100">
                      {isFa ? "مطالعه مقاله" : "Read article"}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
