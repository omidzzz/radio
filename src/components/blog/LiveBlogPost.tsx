"use client";

import { useEffect, useState } from "react";
import { isSafeBlogUrl, localizeBlogText, type BlogDocument, type BlogBlock } from "@/lib/blog/schema";
import type { BlogPost } from "@/lib/types/blog";
import type { Locale } from "@/lib/i18n/config";
import Image from "next/image";
import Link from "next/link";
import BlogBlocks from "./BlogBlocks";
import Breadcrumbs from "@/components/breadcrumbs/Breadcrumbs";
import { processArticleHtml } from "@/lib/utils/blog-html";
import { siteConfig } from "@/lib/seo/seo";
import "./article.css";

type ApiPost = {
  id?: number;
  slug: string;
  kind?: string;
  status?: string;
  title?: string;
  date?: string;
  tags?: string[];
  featuredImage?: { src?: string; alt?: { fa?: string; en?: string } };
  translations?: Record<string, Record<string, any>>;
};

function normalizeBlock(block: Record<string, any>): BlogBlock | null {
  if (block.type === "alert" || block.type === "highlight") {
    const tone = block.alertStyle === "danger" ? "danger" : block.alertStyle === "warning" ? "warning" : "info";
    return { type: "callout", tone, ...(block.title || block.label ? { title: block.title || block.label } : {}), text: block.text || "" } as BlogBlock;
  }
  if (block.type === "quote") {
    return { type: "quote", text: block.text || "", ...(block.attribution || block.author ? { attribution: block.attribution || block.author } : {}), ...(typeof block.sourceUrl === "string" && isSafeBlogUrl(block.sourceUrl) ? { sourceUrl: block.sourceUrl } : {}) } as BlogBlock;
  }
  if (block.type === "paragraph") {
    return { type: "paragraph", text: block.text || "", ...(block.style === "lead" ? { style: "lead" } : {}) };
  }
  if (block.type === "list") {
    return { type: "list", items: Array.isArray(block.items) ? block.items : [], style: block.style === "ordered" || block.style === "numbered" ? block.style : "bullet" };
  }
  if (block.type === "heading") return { type: "heading", level: Number(block.level) || 2, text: block.text || "" };
  if (block.type === "image") return typeof block.src === "string" && isSafeBlogUrl(block.src) ? { type: "image", src: block.src, alt: block.alt || "", ...(block.caption ? { caption: block.caption } : {}), ...(block.width ? { width: Number(block.width) } : {}), ...(block.height ? { height: Number(block.height) } : {}) } as BlogBlock : null;
  if (block.type === "code") return { type: "code", code: block.code || "", language: block.language || "text", ...(block.caption ? { caption: block.caption } : {}) } as BlogBlock;
  if (block.type === "stats") return { type: "stats", items: block.items || [] };
  if (block.type === "cta") return typeof block.buttonUrl === "string" && isSafeBlogUrl(block.buttonUrl) ? { type: "cta", title: block.title || "", text: block.text || "", buttonText: block.buttonText || "", buttonUrl: block.buttonUrl } : null;
  if (block.type === "references") {
    const items = (Array.isArray(block.items) ? block.items : []).filter((item: Record<string, unknown>) => typeof item.url === "string" && isSafeBlogUrl(item.url));
    return items.length ? { type: "references", ...(block.title ? { title: block.title } : {}), items } as BlogBlock : null;
  }
  if (["callout", "table", "timeline", "checklist", "accordion", "glossary", "divider"].includes(block.type)) return block as BlogBlock;
  return null;
}

function toBlogPost(api: ApiPost): BlogPost {
  const translations = api.translations || {};
  const localized = (locale: "fa" | "en") => {
    const source = translations[locale] || {};
    return {
      title: String(source.title || api.title || ""),
      excerpt: String(source.excerpt || ""),
      content: Array.isArray(source.content) ? source.content.map(normalizeBlock).filter(Boolean) : [],
      html: "" as const,
      css: "" as const,
      faq: Array.isArray(source.faq) ? source.faq : [],
      seo: source.seo || {},
    };
  };
  const fa = localized("fa");
  const en = localized("en");
  const date = api.date || new Date().toISOString();
  const document = api.kind === "personal" ? undefined : {
    slug: api.slug,
    title: api.title || fa.title,
    date,
    tags: Array.isArray(api.tags) ? api.tags : [],
    status: api.status === "draft" ? "draft" : "published",
    kind: "article",
    featuredImage: api.featuredImage?.src ? { src: api.featuredImage.src, alt: api.featuredImage.alt || { fa: "", en: "" } } : undefined,
    translations: { fa, en },
  } as unknown as BlogDocument | undefined;
  const bodyFa = String(translations.fa?.html || "");
  const bodyEn = String(translations.en?.html || "");
  const wordCount = (html: string) => html.replace(/<[^>]*>/g, " ").split(/\s+/u).filter(Boolean).length;
  return {
    id: Number(api.id) || 0,
    slug: api.slug,
    document: bodyFa || bodyEn ? undefined : document,
    titleFA: fa.title,
    titleEN: en.title,
    excerptFA: fa.excerpt,
    excerptEN: en.excerpt,
    bodyFA: bodyFa,
    bodyEN: bodyEn,
    authorFA: "تحریریه",
    authorEN: "Editorial team",
    categoryFA: "مقالات آموزشی",
    categoryEN: "Educational articles",
    image: api.featuredImage?.src,
    readMinutes: Math.max(1, Math.ceil(Math.max(wordCount(bodyFa), wordCount(bodyEn)) / 200)),
    isFeatured: false,
    isPublished: api.status !== "draft",
    publishedAt: date,
    createdAt: date,
    updatedAt: date,
  };
}

export default function LiveBlogPost({ locale }: { locale: Locale }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!post) return;
    const title = locale === "fa" ? post.titleFA : post.titleEN || post.titleFA;
    document.title = `${title} | ${siteConfig.shortName}`;
  }, [locale, post]);

  useEffect(() => {
    const slug = decodeURIComponent(window.location.pathname.split("/").filter(Boolean).at(-1) || "");
    const controller = new AbortController();
    fetch(`/api/get_post.php?slug=${encodeURIComponent(slug)}`, { cache: "no-store", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Post not found");
        return response.json() as Promise<ApiPost>;
      })
      .then((data) => setPost(toBlogPost(data)))
      .catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, []);

  if (post) {
    const fa = locale === "fa";
    const title = fa ? post.titleFA : post.titleEN || post.titleFA;
    const excerpt = fa ? post.excerptFA : post.excerptEN || post.excerptFA;
    const translation = post.document?.translations[locale];
    const content = translation?.content || [];
    const legacyHtml = processArticleHtml(fa ? post.bodyFA : post.bodyEN || post.bodyFA);
    return <div className="blog-article" dir={fa ? "rtl" : "ltr"} lang={locale}>
      <header className="blog-header"><div className="blog-shell">
        <nav className="blog-breadcrumb" aria-label={fa ? "مسیر صفحه" : "Breadcrumb"}><Breadcrumbs items={[
          { label: fa ? "خانه" : "Home", href: `/${locale}/` },
          { label: fa ? "مقالات" : "Articles", href: `/${locale}/blog/` },
          { label: title, href: `/${locale}/blog/${post.slug}/`, isCurrent: true },
        ]} /></nav>
        <span className="blog-eyebrow">{fa ? post.categoryFA : post.categoryEN || post.categoryFA}</span>
        <h1 className="article-title">{title}</h1>
        <p className="blog-deck">{excerpt}</p>
        <div className="blog-meta"><span>{fa ? post.authorFA : post.authorEN || post.authorFA}</span>{post.publishedAt && <time dateTime={post.publishedAt}>{new Intl.DateTimeFormat(fa ? "fa-IR" : "en-US", { dateStyle: "long", timeZone: "UTC" }).format(new Date(post.publishedAt))}</time>}</div>
        {post.image && <figure className="blog-cover">
        <Image
          src={post.image}
          alt={localizeBlogText(post.document?.featuredImage?.alt, locale, title)}
          width={1200}
          height={675}
          loading="lazy"
          priority={false}
        />
      </figure>
}
      </div></header>
      <div className="blog-shell blog-layout"><article className="blog-content article-content" aria-label={title}>
        {translation ? <BlogBlocks blocks={content} title={title} locale={locale} /> : <div dangerouslySetInnerHTML={{ __html: legacyHtml.html }} />}
        {!!translation?.faq.length && <section className="blog-accordion"><h2>{fa ? "پرسش‌های متداول" : "Frequently asked questions"}</h2>{translation.faq.map((item, index) => <details key={index}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</section>}
        <div className="blog-after"><Link href={`/${locale}/blog/`} className="ui-button ui-button-ghost">{fa ? "بازگشت به مقالات" : "Back to articles"}</Link></div>
      </article></div>
    </div>;
  }
  return <main className="blog-article blog-shell min-h-[50vh] py-20 text-center text-muted">{failed ? (locale === "fa" ? "مقاله پیدا نشد." : "Article not found.") : (locale === "fa" ? "در حال بارگذاری مقاله…" : "Loading article…")}</main>;
}