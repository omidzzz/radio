import { NextRequest, NextResponse } from "next/server";
import db, { prepare, syncBlogPostFts } from "@/lib/db";
import { requireAdminWithCsrf } from "@/lib/auth";
import { sanitizeContent, sanitizeText } from "@/lib/sanitize";
import { estimateReadMinutes, formatBlogPost } from "@/lib/services/blog-service";
import { blogCache } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    // Pagination with sensible defaults
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10) || 10));
    const offset = (page - 1) * limit;

    const cacheKey = `blog:list:${page}:${limit}`;
    const cached = blogCache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      });
    }

    // Single query with window function to get count + posts in one DB call
    const rows = prepare(
      `SELECT id, title_fa, title_en, excerpt_fa, excerpt_en, body_fa, body_en,
              author_fa, author_en, category_fa, category_en, image,
              read_minutes, is_featured, is_published, published_at, created_at, updated_at,
              COUNT(*) OVER() AS total_count
       FROM blog_posts 
       WHERE is_published = 1 
       ORDER BY published_at DESC, created_at DESC
       LIMIT ? OFFSET ?`
    ).all(limit, offset) as any[];

    const posts = rows;
    const total = rows.length > 0 ? Number(rows[0].total_count) : 0;

    const formattedPosts = posts.map((post) => formatBlogPost(post));

    const response = {
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    blogCache.set(cacheKey, response);

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminWithCsrf(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const {
      titleFA,
      titleEN,
      excerptFA,
      excerptEN,
      bodyFA,
      bodyEN,
      authorFA,
      authorEN,
      categoryFA,
      categoryEN,
      image,
      readMinutes,
      isFeatured,
      isPublished,
      publishedAt,
    } = body;

    // Validate required fields
    if (!titleFA?.trim() || !bodyFA?.trim()) {
      return NextResponse.json(
        { error: "Title (FA) and body (FA) are required" },
        { status: 400 }
      );
    }

    // Sanitize content
    const cleanTitleFA = sanitizeText(titleFA).slice(0, 300);
    const cleanTitleEN = titleEN ? sanitizeText(titleEN).slice(0, 300) : null;
    const cleanExcerptFA = sanitizeText(excerptFA || "").slice(0, 500);
    const cleanExcerptEN = excerptEN ? sanitizeText(excerptEN).slice(0, 500) : null;
    const cleanBodyFA = sanitizeContent(bodyFA).slice(0, 100000);
    const cleanBodyEN = bodyEN ? sanitizeContent(bodyEN).slice(0, 100000) : null;
    const cleanAuthorFA = sanitizeText(authorFA || "").slice(0, 200);
    const cleanAuthorEN = authorEN ? sanitizeText(authorEN).slice(0, 200) : null;
    const cleanCategoryFA = sanitizeText(categoryFA || "").slice(0, 100);
    const cleanCategoryEN = categoryEN ? sanitizeText(categoryEN).slice(0, 100) : null;
    const cleanImage = image ? sanitizeText(image).slice(0, 500) : null;

    const result = prepare(
      `INSERT INTO blog_posts (
        title_fa, title_en, excerpt_fa, excerpt_en, body_fa, body_en,
        author_fa, author_en, category_fa, category_en, image,
        read_minutes, is_featured, is_published, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      cleanTitleFA,
      cleanTitleEN,
      cleanExcerptFA,
      cleanExcerptEN,
      cleanBodyFA,
      cleanBodyEN,
      cleanAuthorFA,
      cleanAuthorEN,
      cleanCategoryFA,
      cleanCategoryEN,
      cleanImage,
      // Auto-calculate reading time when not explicitly provided
      readMinutes && Number(readMinutes) > 0
        ? Number(readMinutes)
        : estimateReadMinutes(cleanBodyFA),
      isFeatured ? 1 : 0,
      isPublished ? 1 : 0,
      publishedAt || new Date().toISOString()
    );

    // Sync the new post into the FTS5 index so search finds it immediately
    syncBlogPostFts(Number(result.lastInsertRowid));

    // Invalidate blog cache after insert
    blogCache.clear();

    const newPost = prepare("SELECT * FROM blog_posts WHERE id = ?").get(
      result.lastInsertRowid
    ) as any;

    const formattedPost = formatBlogPost(newPost);

    return NextResponse.json(formattedPost, { status: 201 });
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}