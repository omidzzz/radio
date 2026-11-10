"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { BlogPostSummary } from "@/lib/types/blog";
import type { Locale } from "@/lib/i18n/config";
import { toFarsiDigits } from "@/lib/i18n/numbers";

interface LivePostRow {
  id?: unknown;
  slug?: unknown;
  kind?: unknown;
  status?: unknown;
  title?: unknown;
  date?: unknown;
  tags?: unknown;
  featuredImage?: { src?: unknown } | null;
  translations?: Record<string, {
    title?: unknown;
    excerpt?: unknown;
    author?: unknown;
    category?: unknown;
  }> | null;
}

/**
 * Keep the statically rendered cards as an instant/export-safe fallback, then
 * replace them with the same live MySQL summaries used by the hosted blog.
 */
export default function LatestPostsLiveRefresh({
  initialPosts,
  locale,
  children,
}: {
  initialPosts: BlogPostSummary[];
  locale: Locale;
  children: React.ReactNode;
}) {
  const [posts, setPosts] = useState<BlogPostSummary[] | null>(null);
  const isFa = locale === "fa";

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/get_posts.php?limit=50", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Live blog index unavailable");
        return response.json() as Promise<unknown>;
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Invalid live blog index");

        const livePosts = data
          .map((row, index) => mapLivePost(row as LivePostRow, locale, index))
          .filter((post): post is BlogPostSummary => post !== null)
          .slice(0, 3);

        // An empty live response is not allowed to erase valid exported cards.
        setPosts(livePosts.length ? livePosts : initialPosts);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        // Keep the static summaries when the PHP API is unavailable locally.
        setPosts(initialPosts);
      });

    return () => controller.abort();
  }, [initialPosts, locale]);

  if (posts === null) return <>{children}</>;
  if (!posts.length) return <>{children}</>;

  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post, index) => {
        const title = isFa ? post.titleFA : post.titleEN || post.titleFA;
        const category = isFa ? post.categoryFA : post.categoryEN || post.categoryFA;
        const date = post.publishedAt
          ? new Date(post.publishedAt).toLocaleDateString(isFa ? "fa-IR" : "en-US", {
              year: "numeric",
              month: isFa ? "long" : "short",
              day: "numeric",
              timeZone: "UTC",
            })
          : null;

        return (
          <article
            key={`${post.id}-${post.slug ?? ""}`}
            className="surface-panel flex h-full flex-col overflow-hidden rounded-xl border border-border transition-colors duration-300 hover:border-primary/50"
          >
            <a
              href={`/${locale}/blog/${post.slug || post.id}/`}
              className="group block"
              aria-label={title}
            >
              <div className="relative h-48 w-full shrink-0 overflow-hidden bg-surface">
                <Image
                  src={post.image || "/images/blog-default.webp"}
                  alt={title}
                  fill
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
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
                <h3 className="line-clamp-2 text-base font-semibold leading-relaxed text-text-primary transition-colors duration-300 group-hover:text-primary">
                  {title}
                </h3>
                <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-4 text-xs text-muted">
                  {date && <time dateTime={post.publishedAt}>{date}</time>}
                  <span className="h-1 w-1 rounded-full bg-border" aria-hidden="true" />
                  <span>{isFa ? `${toFarsiDigits(post.readMinutes)} دقیقه` : `${post.readMinutes} min`}</span>
                  <span className="ms-auto font-medium text-primary">{isFa ? "مطالعه مقاله" : "Read article"}</span>
                </div>
              </div>
            </a>
          </article>
        );
      })}
    </div>
  );
}

function mapLivePost(row: LivePostRow, locale: Locale, index: number): BlogPostSummary | null {
  if (row.kind === "personal" || row.status === "draft") return null;

  const id = Number(row.id);
  if (!Number.isSafeInteger(id) || id <= 0) return null;

  const translations = row.translations ?? {};
  const fa = translations.fa ?? {};
  const en = translations.en ?? {};
  const titleFA = stringValue(fa.title) || stringValue(row.title);
  const titleEN = stringValue(en.title) || titleFA;
  if (!titleFA) return null;

  const excerptFA = stringValue(fa.excerpt);
  const excerptEN = stringValue(en.excerpt);
  const dateValue = stringValue(row.date);
  const date = dateValue ? new Date(dateValue.replace(" ", "T") + (/[zZ]|[+-]\d\d:\d\d$/.test(dateValue) ? "" : "Z")) : null;
  const publishedAt = date && Number.isFinite(date.getTime()) ? date.toISOString() : undefined;
  const categoryFA = stringValue(fa.category) || stringValue((row.tags as unknown[])?.[0]) || "مقالات آموزشی";
  const categoryEN = stringValue(en.category) || categoryFA;
  const excerpt = locale === "fa" ? excerptFA : excerptEN || excerptFA;
  const words = excerpt.trim().split(/\s+/u).filter(Boolean).length;

  return {
    id,
    slug: stringValue(row.slug) || String(id || index + 1),
    titleFA,
    titleEN,
    excerptFA,
    excerptEN,
    authorFA: stringValue(fa.author) || "تحریریه",
    authorEN: stringValue(en.author) || "Editorial team",
    categoryFA,
    categoryEN,
    image: stringValue(row.featuredImage?.src) || undefined,
    readMinutes: Math.max(1, Math.ceil(words / 200)),
    publishedAt,
    views: null,
  };
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}