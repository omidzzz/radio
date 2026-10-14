import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const posts = db
      .prepare("SELECT * FROM blog_posts ORDER BY created_at DESC")
      .all() as any[];

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title_fa: post.title_fa,
      title_en: post.title_en,
      excerpt_fa: post.excerpt_fa,
      author_fa: post.author_fa,
      category_fa: post.category_fa,
      is_published: post.is_published,
      published_at: post.published_at,
      created_at: post.created_at,
    }));

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}