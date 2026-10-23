import { NextRequest, NextResponse } from "next/server";
import { requireAdminWithCsrf } from "@/lib/security/auth";
import { sanitizeContent, sanitizeText } from "@/lib/security/sanitize";
import { createBlogPost, listBlogPosts } from "@/lib/services/blog-service";
import { logger } from "@/lib/core/logger";

export async function GET(request: NextRequest) {
  try {
    // Pagination with sensible defaults
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10) || 10));

    const result = listBlogPosts({ page, limit });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    logger.error("Error fetching blog posts", { error: error });
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

    const post = createBlogPost({
      titleFA: cleanTitleFA,
      titleEN: cleanTitleEN,
      excerptFA: cleanExcerptFA,
      excerptEN: cleanExcerptEN,
      bodyFA: cleanBodyFA,
      bodyEN: cleanBodyEN,
      authorFA: cleanAuthorFA,
      authorEN: cleanAuthorEN,
      categoryFA: cleanCategoryFA,
      categoryEN: cleanCategoryEN,
      image: cleanImage,
      readMinutes,
      isFeatured,
      isPublished,
      publishedAt,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    logger.error("Error creating blog post", { error: error });
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}