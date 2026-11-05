import type { MetadataRoute } from "next";
import { listBlogPostsForSitemap } from "@/lib/services/blog-service";
import { blogPostPath } from "@/lib/blog/presentation";
import { normalizePostDate } from "@/lib/blog/schema";
import { siteConfig } from "@/lib/seo/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/about", "/services", "/blog", "/booking", "/contact", "/privacy", "/terms"];
  const posts = listBlogPostsForSitemap();
  return (["fa", "en"] as const).flatMap((locale) => [
    ...pages.map((path) => ({ url: new URL(`/${locale}${path}/`, siteConfig.url).href, alternates: { languages: { "fa-IR": `${siteConfig.url}/fa${path}/`, "en-US": `${siteConfig.url}/en${path}/` } } })),
    ...posts.map((post) => ({
      url: new URL(`${blogPostPath(post, locale)}/`, siteConfig.url).href,
      lastModified: post.updated_at || post.published_at ? normalizePostDate((post.updated_at || post.published_at)!) : undefined,
      alternates: { languages: { "fa-IR": `${siteConfig.url}${blogPostPath(post, "fa")}/`, "en-US": `${siteConfig.url}${blogPostPath(post, "en")}/` } },
    })),
  ]);
}