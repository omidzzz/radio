import { NextResponse } from "next/server";
import db from "@/lib/db";
import { siteConfig } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = siteConfig.url;

  let posts: {
    id: number;
    title_fa: string;
    title_en?: string;
    excerpt_fa: string;
    excerpt_en?: string;
    author_fa: string;
    author_en?: string;
    image?: string;
    published_at?: string;
  }[] = [];

  try {
    posts = db
      .prepare(
        `SELECT id, title_fa, title_en, excerpt_fa, excerpt_en, author_fa, author_en, image, published_at
         FROM blog_posts 
         WHERE is_published = 1 
         ORDER BY published_at DESC
         LIMIT 50`
      )
      .all() as typeof posts;
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