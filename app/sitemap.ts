import type { MetadataRoute } from "next";
import db from "@/lib/db";
import { siteConfig } from "@/lib/seo";

export const dynamic = "force-dynamic";

/**
 * Sitemap with per-URL hreflang alternates:
 * every Persian URL lists its /en counterpart (and vice versa), matching
 * the middleware's path-based locale routing.
 */
function withAlternates(
  path: string,
  lastModified: Date,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number
): MetadataRoute.Sitemap {
  const faUrl = `${siteConfig.url}${path}`;
  const enUrl = `${siteConfig.url}/en${path === "/" ? "" : path}`;
  const languages = {
    "fa-IR": faUrl,
    "en-US": enUrl,
    "x-default": faUrl,
  };
  return [
    { url: faUrl, lastModified, changeFrequency, priority, alternates: { languages } },
    { url: enUrl, lastModified, changeFrequency, priority: priority * 0.9, alternates: { languages } },
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    ...withAlternates("/", now, "weekly", 1),
    ...withAlternates("/about", now, "monthly", 0.8),
    ...withAlternates("/services", now, "monthly", 0.8),
    ...withAlternates("/blog", now, "weekly", 0.9),
    ...withAlternates("/forum", now, "daily", 0.9),
    ...withAlternates("/booking", now, "monthly", 0.7),
    ...withAlternates("/contact", now, "yearly", 0.6),
  ];

  // Blog posts
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const posts = db
      .prepare(
        `SELECT id, published_at, updated_at FROM blog_posts WHERE is_published = 1`
      )
      .all() as { id: number; published_at?: string; updated_at?: string }[];

    for (const post of posts) {
      const lastModified = new Date(
        post.updated_at || post.published_at || Date.now()
      );
      blogPages.push(
        ...withAlternates(`/blog/${post.id}`, lastModified, "monthly", 0.7)
      );
    }
  } catch {
    // DB might not be ready during build
  }

  // Forum posts
  let forumPages: MetadataRoute.Sitemap = [];
  try {
    const posts = db
      .prepare(`SELECT id, created_at FROM forum_posts`)
      .all() as { id: number; created_at: string }[];

    for (const post of posts) {
      forumPages.push(
        ...withAlternates(
          `/forum/${post.id}`,
          new Date(post.created_at + "Z"),
          "daily",
          0.6
        )
      );
    }
  } catch {
    // DB might not be ready during build
  }

  return [...staticPages, ...blogPages, ...forumPages];
}