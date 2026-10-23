import { NextRequest, NextResponse } from "next/server";
import { rateLimitByIp, getClientIp } from "@/lib/http/rate-limit";
import { sanitizeContent, sanitizeText } from "@/lib/security/sanitize";
import { validateForumReply } from "@/lib/validation/forum";
import { getForumReplies, createForumReply } from "@/lib/services/forum-service";
import { ApiError, withErrorHandling } from "@/lib/http/api-error";
import { logger } from "@/lib/core/logger";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/forum/posts/[id]/replies - Get all replies for a post
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const postId = Number(id);
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    const replies = getForumReplies(postId);

    return NextResponse.json({ replies });
  } catch (error) {
    logger.error("Error fetching forum replies", { error: error });
    return NextResponse.json(
      { error: "Failed to fetch replies" },
      { status: 500 }
    );
  }
}

// POST /api/forum/posts/[id]/replies - Add a new reply
export const POST = withErrorHandling(
  async (request: NextRequest, { params }: RouteContext) => {
    const { id } = await params;
    const postId = Number(id);
    if (isNaN(postId)) {
      throw ApiError.badRequest("Invalid post ID");
    }

    // Rate limit: 10 replies per 10 minutes per IP
    const ip = getClientIp(request);
    const rateLimit = rateLimitByIp(ip, { windowMs: 10 * 60_000, max: 10 });
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
        { message: "Reply posted successfully" },
        { status: 201 }
      );
    }

    // Validate with Zod
    const validation = validateForumReply({ post_id: postId, ...body });
    if (!validation.success) {
      throw ApiError.badRequest(validation.errors.join(", "));
    }

    // Sanitize inputs
    const input = {
      post_id: postId,
      author_name: sanitizeText(validation.data.author_name).slice(0, 100),
      content: sanitizeContent(validation.data.content).slice(0, 5000),
    };

    const reply = createForumReply(input);

    return NextResponse.json({ reply }, { status: 201 });
  }
);