import Link from "next/link";
import Breadcrumbs from "@/components/breadcrumbs/Breadcrumbs";
import type { Metadata } from "next";
import type { BlogPost } from "@/lib/types/blog";
import type { Locale } from "@/lib/i18n/config";
import { getRelatedBlogPosts, listBlogComments } from "@/lib/services/blog-service";
import { getBlockToc } from "@/lib/blog/schema";
import { absoluteBlogUrl, blogPostPath, localizeBlogPost } from "@/lib/blog/presentation";
import { processArticleHtml } from "@/lib/utils/blog-html";
import { siteConfig } from "@/lib/seo/seo";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/seo/json-ld";
import JsonLdScript from "@/components/feedback/JsonLd";
import BlogReadingProgress from "@/components/ui/BlogReadingProgress";
import BlogBlocks from "./BlogBlocks";
import TableOfContents from "./TableOfContents";
import LazyComments from "./LazyComments";
import ArticleHeader from "./ArticleHeader";
import {
  FAQSection,
  AuthorProfile,
  RelatedArticles,
  ConsultationCTA,
  MedicalCallout,
} from "./EditorialComponents";
import "./article.css";

export function blogArticleMetadata(post: BlogPost, locale: Locale): Metadata {
  const view = localizeBlogPost(post, locale);
  const seo = view.translation?.seo;
  const title = seo?.title ?? view.title;
  const description = seo?.metaDescription ?? view.excerpt;
  const canonical = seo?.canonical ?? view.path;
  const image = absoluteBlogUrl(view.image ?? siteConfig.defaultOgImage, siteConfig.url);
  return {
    title, description, keywords: seo?.keywords ?? post.document?.tags,
    robots: post.document?.demo ? { index: false, follow: true } : undefined,
    alternates: { canonical, languages: { "fa-IR": blogPostPath(post, "fa"), "en-US": blogPostPath(post, "en"), "x-default": blogPostPath(post, "fa") } },
    openGraph: {
      title: seo?.openGraph?.title ?? title, description: seo?.openGraph?.description ?? description,
      type: "article", url: absoluteBlogUrl(canonical, siteConfig.url),
      locale: locale === "fa" ? "fa_IR" : "en_US", alternateLocale: locale === "fa" ? "en_US" : "fa_IR",
      images: [{ url: seo?.openGraph?.image ? absoluteBlogUrl(seo.openGraph.image, siteConfig.url) : image, alt: view.imageAlt }],
      publishedTime: post.publishedAt, modifiedTime: post.updatedAt, authors: [view.author],
    },
    twitter: {
      card: "summary_large_image", title: seo?.twitter?.title ?? title, description: seo?.twitter?.description ?? description,
      images: [seo?.twitter?.image ? absoluteBlogUrl(seo.twitter.image, siteConfig.url) : image],
    },
  };
}

export default function BlogArticle({ post, locale }: { post: BlogPost; locale: Locale }) {
  const fa = locale === "fa";
  const view = localizeBlogPost(post, locale);
  const legacy = view.translation ? undefined : processArticleHtml(view.body);
  const toc = view.translation ? getBlockToc(view.translation.content, view.title) : legacy!.toc;
  const faqs = view.translation?.faq ?? [];
  const related = getRelatedBlogPosts(post.id, post.categoryFA, 2);
  const comments = listBlogComments(post.id);
  const schema = articleSchema({ title: view.title, description: view.excerpt, url: view.path, image: view.image, author: view.author,
    datePublished: post.publishedAt, dateModified: post.updatedAt, wordCount: view.plainText.split(/\s+/u).filter(Boolean).length, locale, readMinutes: view.readMinutes });
  if (post.document?.demo) delete schema.publisher;

  const breadcrumbItems = [
    { label: fa ? "خانه" : "Home", href: `/${locale}` },
    { label: fa ? "مقالات" : "Articles", href: `/${locale}/blog` },
    { label: view.title, href: view.path, isCurrent: true },
  ];

  const demoNotice = post.document?.demo && (
    <MedicalCallout tone="warning" title={fa ? "نمونه نمایشی — بدون بازبینی پزشک" : "Demonstration — not clinician-reviewed"}>
      {fa
        ? "این مطلب برای نمایش قالب و فرآیند ورود محتوا تهیه شده است؛ راهنمای تشخیص یا درمان فردی نیست و نباید به پزشک سایت نسبت داده شود."
        : "This sample demonstrates the template and import workflow. It is not personal diagnostic or treatment advice and is not attributed to the site's physician."}
    </MedicalCallout>
  );

  return (
    <div className="blog-article" dir={fa ? "rtl" : "ltr"} lang={locale}>
    <JsonLdScript data={[schema, breadcrumbSchema([{ name: fa ? "خانه" : "Home", path: `/${locale}` }, { name: fa ? "مقالات" : "Articles", path: `/${locale}/blog` }, { name: view.title, path: view.path }]), ...(faqs.length ? [faqSchema(faqs)] : [])]} />
    <BlogReadingProgress title={view.title} url={view.path} isRtl={fa} />
    <div className="blog-header">
      <div className="blog-shell article-header-inner">
        <Breadcrumbs items={breadcrumbItems} separator={<span aria-hidden="true">/</span>} />
        <ArticleHeader post={post} locale={locale} />
        {demoNotice}
      </div>
    </div>
    <div className="blog-shell article-layout">
      <div className="article-main">
          {toc.length > 0 && (
            <details className="article-toc">
              <summary>{fa ? "فهرست مطالب" : "On this page"}</summary>
              <TableOfContents items={toc} isFa={fa} />
            </details>
          )}
          <article className="blog-content article-content" aria-label={view.title}>
            {view.translation ? (
              <BlogBlocks blocks={view.translation.content} title={view.title} locale={locale} />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: legacy!.html }} />
            )}
            {faqs.length > 0 && (
              <FAQSection title={fa ? "پرسش‌های متداول" : "Frequently asked questions"} items={faqs} />
            )}
            <AuthorProfile name={view.author} specialty={view.category} locale={locale} />
            <RelatedArticles posts={related} isFa={fa} />
            <section className="blog-after blog-comments">
              <h2>{fa ? "نظرات" : "Comments"}</h2>
              <LazyComments postId={post.id} initialComments={comments} />
            </section>
            <ConsultationCTA
              title={fa ? "مشاوره رزرو کنید" : "Book a consultation"}
              text={fa ? "برای رزرو مشاوره یا دریافت اطلاعات بیشتر، با ما در ارتباط باشید." : "To book a consultation or request more information, get in touch."}
              buttonText={fa ? "رزرو مشاوره" : "Book consultation"}
              buttonHref={`/${locale}/booking`}
              phone={siteConfig.mobileHref}
              locale={locale}
            />
            <div className="blog-after">
              <Link href={`/${locale}/blog`} className="ui-button ui-button-ghost">
                {fa ? "بازگشت به مقالات" : "Back to articles"}
              </Link>
            </div>
          </article>
        </div>
        <aside className="article-sidebar">
          {toc.length > 0 && <TableOfContents items={toc} isFa={fa} />}
        </aside>
      </div>
    </div>
  );
}