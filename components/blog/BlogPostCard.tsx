import Image from "next/image";
import Link from "next/link";
import { toFarsiDigits } from "@/lib/i18n/numbers";
import ViewCounter from "./ViewCounter";

export interface BlogPostCardData {
  id: number;
  title_fa: string;
  title_en?: string;
  excerpt_fa?: string;
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

interface BlogPostCardProps {
  post: BlogPostCardData;
  isFa: boolean;
  /** Eager-load the image (above the fold) */
  eager?: boolean;
  /** Index used for staggered entrance animation */
  index?: number;
  /** Full-width featured layout for the newest post */
  featured?: boolean;
}

/**
 * Shared blog card used on the blog list page and the related-posts
 * section of the article page. Server component — no client JS.
 */
export default function BlogPostCard({
  post,
  isFa,
  eager = false,
  index = 0,
  featured = false,
}: BlogPostCardProps) {
  const title = isFa ? post.title_fa : post.title_en || post.title_fa;
  const excerpt = isFa
    ? post.excerpt_fa
    : post.excerpt_en || post.excerpt_fa;
  const author = isFa ? post.author_fa : post.author_en || post.author_fa;
  const category = isFa
    ? post.category_fa
    : post.category_en || post.category_fa;

  return (
    <Link
      href={`/blog/${post.id}`}
      className="group block h-full"
      style={{ animationDelay: `${Math.min(index, 8) * 90}ms` }}
    >
      <article
        className={`blog-card-enter blog-card surface-card surface-panel relative flex h-full overflow-hidden ${
          featured ? "flex-col lg:flex-row" : "flex-col"
        }`}
      >
        {/* Thumbnail */}
        <div
          className={`relative w-full shrink-0 overflow-hidden ${
            featured ? "h-60 lg:h-auto lg:w-[46%]" : "h-52 sm:h-56"
          }`}
        >
          <Image
            src={post.image || "/images/blog-default.webp"}
            alt={title}
            fill
            sizes={featured ? "(max-width: 1024px) 100vw, 46vw" : "(max-width: 768px) 100vw, 50vw"}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority={eager}
            loading={eager ? "eager" : "lazy"}
            placeholder={eager ? undefined : "blur"}
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlOGYwIi8+PC9zdmc+"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-deep/55 via-transparent to-transparent" />

          {/* Category badge */}
          <div className="absolute bottom-4 left-4 right-4">
            <span className="chip border-white/20 bg-deep/75 text-highlight backdrop-blur-sm">
              {category}
            </span>
          </div>

          {featured && (
            <span className="chip absolute top-4 left-4 border-primary bg-primary text-white">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M12 2l2.9 6.26L21.5 9.27l-5 4.87L17.8 21 12 17.77 6.2 21l1.3-6.86-5-4.87 6.6-1.01L12 2z" />
              </svg>
              {isFa ? "جدیدترین مقاله" : "Latest"}
            </span>
          )}
        </div>

        {/* Body */}
        <div className={`flex flex-1 flex-col ${featured ? "p-6 sm:p-8 lg:p-10" : "p-6"}`}>
          <h3
            className={`font-semibold leading-snug text-text-primary transition-colors duration-300 group-hover:text-primary line-clamp-2 ${
              featured ? "text-xl sm:text-2xl" : "text-lg"
            }`}
          >
            {title}
          </h3>

          {excerpt && (
            <p
              className={`mt-3 leading-relaxed text-muted ${
                featured ? "line-clamp-3 text-sm sm:text-base" : "line-clamp-2 text-sm"
              }`}
            >
              {excerpt}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between gap-3 pt-6 text-xs text-muted">
            <span className="truncate">{author}</span>
            <span className="flex shrink-0 items-center gap-3">
              {post.published_at && (
                <span>
                  {new Date(post.published_at).toLocaleDateString(
                    isFa ? "fa-IR" : "en-US",
                  )}
                </span>
              )}
              <span className="h-1 w-1 bg-border" />
              <span>
                {isFa
                  ? `${toFarsiDigits(post.read_minutes)} دقیقه`
                  : `${post.read_minutes} min`}
              </span>
              {typeof post.views === "number" && (
                <>
                  <span className="h-1 w-1 bg-border" />
                  <ViewCounter
                    postId={post.id}
                    initialViews={post.views}
                    isFa={isFa}
                  />
                </>
              )}
            </span>
          </div>

          {/* Hover CTA */}
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary opacity-0 transition-all duration-300 group-hover:opacity-100">
            {isFa ? "مطالعه مقاله" : "Read article"}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className={`h-4 w-4 transition-transform duration-300 ${
                isFa
                  ? "rotate-180 group-hover:-translate-x-1"
                  : "group-hover:translate-x-1"
              }`}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </div>
      </article>
    </Link>
  );
}