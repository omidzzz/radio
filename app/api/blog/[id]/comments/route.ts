import { NextRequest, NextResponse } from "next/server";
import { rateLimitByIp, getClientIp } from "@/lib/http/rate-limit";
import { sanitizeText } from "@/lib/security/sanitize";
import {
  blogPostExists,
  createBlogComment,
  listBlogComments,
} from "@/lib/services/blog-service";
import { logger } from "@/lib/core/logger";

// GET /api/blog/[id]/comments - List comments for a blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Only show approved comments publicly
    const comments = listBlogComments(Number(id));

    return NextResponse.json({ comments }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    logger.error("Error fetching comments", { error: error });
    return NextResponse.json({ comments: [] });
  }
}

// POST /api/blog/[id]/comments - Add a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Rate limit: 3 comments per 10 minutes per IP
  const ip = getClientIp(request);
  const rateLimit = rateLimitByIp(ip, { windowMs: 10 * 60_000, max: 3 });
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many comments. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  try {
    const { id } = await params;
    const body = (await request.json()) as {
      author_name?: string;
      content?: string;
    };

    if (!body.author_name?.trim() || !body.content?.trim()) {
      return NextResponse.json(
        { error: "Name and comment are required" },
        { status: 400 }
      );
    }

    // Check if post exists
    if (!blogPostExists(Number(id))) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Sanitize inputs
    const authorName = sanitizeText(body.author_name).slice(0, 100);
    const content = sanitizeText(body.content).slice(0, 2000);

    if (!authorName || !content) {
      return NextResponse.json(
        { error: "Invalid input content" },
        { status: 400 }
      );
    }

    // Comments are held for moderation before appearing publicly
    const newComment = createBlogComment({
      postId: Number(id),
      authorName,
      content,
    });

    return NextResponse.json(
      {
        comment: newComment,
        message:
          "Your comment has been submitted and will appear after moderation.",
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Error creating comment", { error: error });
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}