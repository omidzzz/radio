import { NextRequest, NextResponse } from "next/server";
import db, { syncBlogPostFts } from "@/lib/db";
import { requireAdminWithCsrf } from "@/lib/auth";
import { BlogPost } from "@/lib/types/blog";
import { sanitizeContent, sanitizeText } from "@/lib/sanitize";
import { blogCache } from "@/lib/cache";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = db
      .prepare("SELECT * FROM blog_posts WHERE id = ? AND is_published = 1")
      .get(id) as any;

    if (!post) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    const formattedPost: BlogPost = {
      id: post.id,
      titleFA: post.title_fa,
      titleEN: post.title_en,
      excerptFA: post.excerpt_fa,
      excerptEN: post.excerpt_en,
      bodyFA: post.body_fa,
      bodyEN: post.body_en,
      authorFA: post.author_fa,
      authorEN: post.author_en,
      categoryFA: post.category_fa,
      categoryEN: post.category_en,
      image: post.image,
      readMinutes: post.read_minutes,
      isFeatured: Boolean(post.is_featured),
      isPublished: Boolean(post.is_published),
      publishedAt: post.published_at,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
    };

    return NextResponse.json(formattedPost, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching blog post:", error);
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

    const result = db
      .prepare(
        `UPDATE blog_posts SET 
          title_fa = ?, title_en = ?, excerpt_fa = ?, excerpt_en = ?,
          body_fa = ?, body_en = ?, author_fa = ?, author_en = ?,
          category_fa = ?, category_en = ?, image = ?,
          read_minutes = ?, is_featured = ?, is_published = ?, 
          published_at = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      )
      .run(
        cleanTitleFA ?? "",
        cleanTitleEN,
        cleanExcerptFA ?? "",
        cleanExcerptEN,
        cleanBodyFA ?? "",
        cleanBodyEN,
        cleanAuthorFA ?? "",
        cleanAuthorEN,
        cleanCategoryFA ?? "",
        cleanCategoryEN,
        cleanImage,
        readMinutes || 5,
        isFeatured ? 1 : 0,
        isPublished ? 1 : 0,
        publishedAt,
        id
      );

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    // Sync the updated post into the FTS5 index
    syncBlogPostFts(Number(id));

    // Invalidate blog cache after update
    blogCache.clear();

    const updatedPost = db
      .prepare("SELECT * FROM blog_posts WHERE id = ?")
      .get(id) as any;

    const formattedPost: BlogPost = {
      id: updatedPost.id,
      titleFA: updatedPost.title_fa,
      titleEN: updatedPost.title_en,
      excerptFA: updatedPost.excerpt_fa,
      excerptEN: updatedPost.excerpt_en,
      bodyFA: updatedPost.body_fa,
      bodyEN: updatedPost.body_en,
      authorFA: updatedPost.author_fa,
      authorEN: updatedPost.author_en,
      categoryFA: updatedPost.category_fa,
      categoryEN: updatedPost.category_en,
      image: updatedPost.image,
      readMinutes: updatedPost.read_minutes,
      isFeatured: Boolean(updatedPost.is_featured),
      isPublished: Boolean(updatedPost.is_published),
      publishedAt: updatedPost.published_at,
      createdAt: updatedPost.created_at,
      updatedAt: updatedPost.updated_at,
    };

    return NextResponse.json(formattedPost);
  } catch (error) {
    console.error("Error updating blog post:", error);
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
    const result = db
      .prepare("DELETE FROM blog_posts WHERE id = ?")
      .run(id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    // Invalidate blog cache after delete
    blogCache.clear();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
}