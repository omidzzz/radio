import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { rateLimitByIp, getClientIp } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";

// GET /api/blog/[id]/comments - List comments for a blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Only show approved comments publicly
    const comments = db
      .prepare(
        `SELECT id, author_name, content, created_at 
         FROM blog_comments 
         WHERE post_id = ? AND is_approved = 1
         ORDER BY created_at ASC`
      )
      .all(Number(id));

    return NextResponse.json({ comments }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
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
    const post = db
      .prepare("SELECT id FROM blog_posts WHERE id = ? AND is_published = 1")
      .get(Number(id));

    if (!post) {
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
    const result = db
      .prepare(
        `INSERT INTO blog_comments (post_id, author_name, content, is_approved) 
         VALUES (?, ?, ?, 0)`
      )
      .run(Number(id), authorName, content);

    const newComment = db
      .prepare("SELECT * FROM blog_comments WHERE id = ?")
      .get(result.lastInsertRowid);

    return NextResponse.json(
      {
        comment: newComment,
        message:
          "Your comment has been submitted and will appear after moderation.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}