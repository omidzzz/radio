import Image from "next/image";
import type { Locale } from "@/lib/i18n/config";
import type { BlogPost } from "@/lib/types/blog";
import { localizeBlogPost } from "@/lib/blog/presentation";

interface ArticleHeaderProps {
  post: BlogPost;
  locale: Locale;
}

export default function ArticleHeader({ post, locale }: ArticleHeaderProps) {
  const fa = locale === "fa";
  const view = localizeBlogPost(post, locale);
  const hasHero = Boolean(view.image);
  const hasReviewDate = Boolean(post.updatedAt && post.updatedAt !== post.publishedAt);

  return (
    <header className="article-header" aria-labelledby="article-title">
      <div className="article-header-inner">
        <div className="article-head">
          <span className="article-eyebrow">{view.category}</span>
          <h1 id="article-title" className="article-title">
            {view.title}
          </h1>
          {view.excerpt && (
            <p className="article-deck">{view.excerpt}</p>
          )}
        </div>

        <div className="article-meta">
          <div className="article-meta-group">
            <span className="article-meta-label">{fa ? "نویسنده" : "Author"}</span>
            <span className="article-meta-value">{view.author}</span>
          </div>
          {post.publishedAt && (
            <div className="article-meta-group">
              <span className="article-meta-label">{fa ? "تاریخ انتشار" : "Published"}</span>
              <time
                className="article-meta-value"
                dateTime={post.publishedAt}
              >
                {new Intl.DateTimeFormat(fa ? "fa-IR" : "en-US", {
                  dateStyle: "long",
                  timeZone: "UTC",
                }).format(new Date(post.publishedAt))}
              </time>
            </div>
          )}
          {hasReviewDate && (
            <div className="article-meta-group">
              <span className="article-meta-label">{fa ? "آخرین بازبینی" : "Last reviewed"}</span>
              <time className="article-meta-value" dateTime={post.updatedAt}>
                {new Intl.DateTimeFormat(fa ? "fa-IR" : "en-US", {
                  dateStyle: "long",
                  timeZone: "UTC",
                }).format(new Date(post.updatedAt))}
              </time>
            </div>
          )}
          <div className="article-meta-group">
            <span className="article-meta-label">{fa ? "زمان مطالعه" : "Read time"}</span>
            <span className="article-meta-value tnum">
              {new Intl.NumberFormat(locale).format(view.readMinutes)}{" "}
              {fa ? "دقیقه" : "min read"}
            </span>
          </div>
          {post.views != null && typeof post.views === "number" && (
            <div className="article-meta-group">
              <span className="article-meta-label">{fa ? "بازدید" : "Views"}</span>
              <span className="article-meta-value tnum">{post.views}</span>
            </div>
          )}
        </div>
      </div>

      {hasHero && (
        <figure className="article-figure article-hero">
          <Image
            src={view.image!}
            alt={view.imageAlt}
            width={1200}
            height={675}
            fetchPriority="high"
            priority
            className="article-hero-image"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 92vw, 840px"
          />
          {view.imageAlt && (
            <figcaption className="article-caption">{view.imageAlt}</figcaption>
          )}
        </figure>
      )}

      {post.document?.demo && (
        <div className="article-demo">
          <strong>{fa ? "نمونه نمایشی — بدون بازبینی پزشک" : "Demonstration — not clinician-reviewed"}</strong>
          <br />
          {fa
            ? "این مطلب برای نمایش قالب و فرایند ورود محتوا تهیه شده است؛ راهنمای تشخیص یا درمان فردی نیست و نباید به پزشک سایت نسبت داده شود."
            : "This sample demonstrates the template and import workflow. It is not personal diagnostic or treatment advice and is not attributed to the site's physician."}
        </div>
      )}
    </header>
  );
}
