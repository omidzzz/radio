import Link from "next/link";
import Image from "next/image";
import LatestPostsLiveRefresh from "./LatestPostsLiveRefresh";
import { listAllBlogPostSummaries } from "@/lib/services/blog-service";
import type { Locale } from "@/lib/i18n/config";
import { toFarsiDigits } from "@/lib/i18n/numbers";
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

        <LatestPostsLiveRefresh initialPosts={posts} locale={locale}>
          <Reveal delay={100}>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, index) => {
                const titleText = isFa ? post.titleFA : post.titleEN || post.titleFA;
                const category = isFa ? post.categoryFA : post.categoryEN || post.categoryFA;
                const date = post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString(isFa ? "fa-IR" : "en-US", {
                      year: "numeric",
                      month: isFa ? "long" : "short",
                      day: "numeric",
                      timeZone: "UTC",
                    })
                  : null;
                const readTime = isFa
                  ? `${toFarsiDigits(post.readMinutes)} دقیقه`
                  : `${post.readMinutes} min`;

                return (
                  <article
                    key={post.id}
                    className="surface-panel flex h-full flex-col overflow-hidden rounded-xl border border-border transition-colors duration-300 hover:border-primary/50"
                  >
                    <div className="relative h-48 w-full shrink-0 overflow-hidden bg-surface">
                      <Image
                        src={post.image || "/images/blog-default.webp"}
                        alt={titleText}
                        fill
                        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 hover:scale-[1.03]"
                        priority={index === 0}
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-deep/60 via-transparent to-transparent" />
                      <div className="absolute inset-x-4 bottom-4">
                        <span className="inline-flex max-w-full rounded-full border border-white/20 bg-deep/75 px-3 py-1 text-xs font-medium text-gold backdrop-blur-sm">
                          <span className="truncate">{category}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex min-h-36 flex-col p-5">
                      <Link
                        href={`/${locale}/blog/${post.slug || post.id}/`}
                        prefetch={false}
                        className="group block"
                      >
                        <h3 className="line-clamp-2 text-base font-semibold leading-relaxed text-text-primary transition-colors duration-300 group-hover:text-primary">
                          {titleText}
                        </h3>
                        <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs text-muted">
                          {date && <time dateTime={post.publishedAt}>{date}</time>}
                          <span className="h-1 w-1 rounded-full bg-border" aria-hidden="true" />
                          <span>{readTime}</span>
                        </div>
                      </Link>
                      <span className="mt-auto pt-4 text-sm font-medium text-primary">
                        {isFa ? "مطالعه مقاله" : "Read article"}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </Reveal>
        </LatestPostsLiveRefresh>
      </div>
    </section>
  );
}
