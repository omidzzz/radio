import { NextResponse } from "next/server";
import { listBlogPostsForRss } from "@/lib/services/blog-service";
import { siteConfig } from "@/lib/seo/seo";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = siteConfig.url;

  let posts: Awaited<ReturnType<typeof listBlogPostsForRss>> = [];

  try {
    posts = listBlogPostsForRss(50);
  } catch {
    // DB might not be ready
  }

  const items = posts
    .map((post) => {
      const title = post.title_fa;
      const description = post.excerpt_fa;
      const author = post.author_fa;
      const pubDate = post.published_at
        ? new Date(post.published_at).toUTCString()
        : new Date().toUTCString();
      const link = `${baseUrl}/blog/${post.id}`;
      const image = post.image
        ? `<![CDATA[<img src="${baseUrl}${post.image}" alt="${title}" />]]>`
        : "";

      return `
    <item>
      <title><![CDATA[${title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description><![CDATA[${description}]]></description>
      <author><![CDATA[${author}]]></author>
      <pubDate>${pubDate}</pubDate>
      ${image}
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title><![CDATA[${siteConfig.name} - Blog]]></title>
    <link>${baseUrl}/blog</link>
    <description><![CDATA[${siteConfig.description.fa}]]></description>
    <language>fa-ir</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${baseUrl}/images/icon-192.png</url>
      <title><![CDATA[${siteConfig.name}]]></title>
      <link>${baseUrl}</link>
    </image>
${items}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}