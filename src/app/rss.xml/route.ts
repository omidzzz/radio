import { listBlogPostsForRss } from "@/lib/services/blog-service";
import { blogPostPath } from "@/lib/blog/presentation";
import { normalizePostDate } from "@/lib/blog/schema";
import { siteConfig } from "@/lib/seo/seo";

export const dynamic = "force-static";
const xml = (value: string) => value.replace(/[<>&"']/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[char]!);

export function GET() {
  const items = listBlogPostsForRss().flatMap((post) => (["fa", "en"] as const).map((locale) => {
    const link = new URL(`${blogPostPath(post, locale)}/`, siteConfig.url).href;
    const title = locale === "en" ? post.title_en || post.title_fa : post.title_fa;
    const excerpt = locale === "en" ? post.excerpt_en || post.excerpt_fa : post.excerpt_fa;
    return `<item><title>${xml(title)}</title><link>${xml(link)}</link><guid isPermaLink="true">${xml(link)}</guid><description>${xml(excerpt)}</description><dc:language>${locale}</dc:language>${post.published_at ? `<pubDate>${new Date(normalizePostDate(post.published_at)).toUTCString()}</pubDate>` : ""}</item>`;
  })).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/"><channel><title>${xml(siteConfig.shortName)} — Articles</title><link>${xml(siteConfig.url)}/fa/blog/</link><description>Bilingual health education / آموزش سلامت</description>${items}</channel></rss>`, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}