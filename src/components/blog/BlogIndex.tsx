import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { listAllBlogPostSummaries } from "@/lib/services/blog-service";
import BlogListing from "./BlogListing";
import PageHero from "@/components/ui/PageHero";
import Breadcrumbs from "@/components/breadcrumbs/Breadcrumbs";
import "./article.css";

export function blogIndexMetadata(locale: Locale): Metadata {
  const fa = locale === "fa";
  return {
    title: fa ? "مقالات آموزشی" : "Educational articles",
    description: fa ? "مقالات آموزشی درباره پرتودرمانی، آنکولوژی و مسیر مراقبت." : "Educational articles about radiation therapy, oncology and the care journey.",
    alternates: { canonical: `/${locale}/blog`, languages: { "fa-IR": "/fa/blog", "en-US": "/en/blog", "x-default": "/fa/blog" } },
  };
}

export default function BlogIndex({ locale }: { locale: Locale }) {
  const fa = locale === "fa";
  return <div className="blog-article" dir={fa ? "rtl" : "ltr"} lang={locale}>
    <PageHero
      badge={fa ? "دانش و مراقبت" : "Knowledge & care"}
      title={fa ? "مقالات آموزشی" : "Educational articles"}
      subtitle={fa ? "شناخت بهتر، پرسش‌های روشن‌تر و گفت‌وگوی آگاهانه با تیم درمان." : "A clearer understanding, better questions and informed conversations with your care team."}
      breadcrumb={
        <Breadcrumbs
          onDark
          items={[
            { label: fa ? "خانه" : "Home", href: `/${locale}` },
            { label: fa ? "مقالات" : "Articles", href: `/${locale}/blog` },
            { label: fa ? "مقالات آموزشی" : "Educational articles", href: `/${locale}` }
          ]}
        />
      }
    />
    <section className="blog-shell py-12" aria-label={fa ? "فهرست مقالات" : "Article listing"}><BlogListing posts={listAllBlogPostSummaries()} locale={locale} /></section>
  </div>;
}