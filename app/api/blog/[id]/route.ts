import { NextRequest, NextResponse } from "next/server";
import { requireAdminWithCsrf } from "@/lib/security/auth";
import {
  deleteBlogPost,
  getBlogPostById,
  updateBlogPost,
} from "@/lib/services/blog-service";
import { sanitizeContent, sanitizeText } from "@/lib/security/sanitize";
import { logger } from "@/lib/core/logger";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = getBlogPostById(Number(id));

    if (!post || !post.isPublished) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(post, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    logger.error("Error fetching blog post", { error: error });
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAdminWithCsrf(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
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

    // Sanitize content
    const cleanTitleFA = titleFA ? sanitizeText(titleFA).slice(0, 300) : undefined;
    const cleanTitleEN = titleEN ? sanitizeText(titleEN).slice(0, 300) : null;
    const cleanExcerptFA = excerptFA ? sanitizeText(excerptFA).slice(0, 500) : undefined;
    const cleanExcerptEN = excerptEN ? sanitizeText(excerptEN).slice(0, 500) : null;
    const cleanBodyFA = bodyFA ? sanitizeContent(bodyFA).slice(0, 100000) : undefined;
    const cleanBodyEN = bodyEN ? sanitizeContent(bodyEN).slice(0, 100000) : null;
    const cleanAuthorFA = authorFA ? sanitizeText(authorFA).slice(0, 200) : undefined;
    const cleanAuthorEN = authorEN ? sanitizeText(authorEN).slice(0, 200) : null;
    const cleanCategoryFA = categoryFA ? sanitizeText(categoryFA).slice(0, 100) : undefined;
    const cleanCategoryEN = categoryEN ? sanitizeText(categoryEN).slice(0, 100) : null;
    const cleanImage = image ? sanitizeText(image).slice(0, 500) : null;

    const result = updateBlogPost(Number(id), {
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

    if (!result) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    logger.error("Error updating blog post", { error: error });
    return NextResponse.json(
      { error: "Failed to update blog post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAdminWithCsrf(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const deleted = deleteBlogPost(Number(id));

    if (!deleted) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error deleting blog post", { error: error });
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
}