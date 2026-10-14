import { NextRequest, NextResponse } from "next/server";
import { rateLimitByIp, getClientIp } from "@/lib/rate-limit";
import { sanitizeContent, sanitizeText } from "@/lib/sanitize";
import { validateForumPost } from "@/lib/validation/forum";
import { getForumPosts, createForumPost } from "@/lib/services/forum-service";
import { ApiError, withErrorHandling } from "@/lib/api-error";

// GET /api/forum/posts - List posts with pagination (optionally filter by category)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category") || undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("limit") || "20", 10))
  );

  try {
    const result = getForumPosts({ category, page, limit });

    return NextResponse.json(
      {
        posts: result.posts,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch forum posts" },
      { status: 500 }
    );
  }
}

// POST /api/forum/posts - Create a new post
export const POST = withErrorHandling(async (request: NextRequest) => {
  // Rate limit: 3 posts per 10 minutes per IP
  const ip = getClientIp(request);
  const rateLimit = rateLimitByIp(ip, { windowMs: 10 * 60_000, max: 3 });
  if (!rateLimit.success) {
    throw ApiError.tooManyRequests(
      "Too many requests. Please try again later.",
      rateLimit.retryAfterSeconds
    );
  }

  const body = await request.json();

  // Honeypot check - silently reject spam submissions
  if (body.website_field) {
    return NextResponse.json(
      { message: "Post created successfully" },
      { status: 201 }
    );
  }

  // Validate with Zod
  const validation = validateForumPost(body);
  if (!validation.success) {
    throw ApiError.badRequest(validation.errors.join(", "));
  }

  // Sanitize inputs to prevent XSS
  const input = {
    author_name: sanitizeText(validation.data.author_name).slice(0, 100),
    title: sanitizeText(validation.data.title).slice(0, 300),
    content: sanitizeContent(validation.data.content).slice(0, 10000),
    category: validation.data.category,
  };

  const post = createForumPost(input);

  return NextResponse.json({ post }, { status: 201 });
});