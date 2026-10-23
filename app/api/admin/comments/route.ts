import { NextRequest, NextResponse } from "next/server";
import { requireAdminWithCsrf, requireAdmin } from "@/lib/security/auth";
import {
  approveComment,
  deleteComment,
  getPendingComments,
} from "@/lib/services/admin-service";
import { logger } from "@/lib/core/logger";

/**
 * GET /api/admin/comments — list comments pending moderation
 * (with post titles for context).
 */
export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const pending = getPendingComments();

    return NextResponse.json({ comments: pending });
  } catch (error) {
    logger.error("Error fetching pending comments", { error: error });
    return NextResponse.json(
      { error: "Failed to fetch pending comments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/comments — approve a comment
 * Body: { id: number }
 */
export async function POST(request: NextRequest) {
  const unauthorized = requireAdminWithCsrf(request);
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as { id?: number };
    if (!body.id) {
      return NextResponse.json({ error: "Comment id required" }, { status: 400 });
    }

    approveComment(body.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error approving comment", { error: error });
    return NextResponse.json(
      { error: "Failed to approve comment" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/comments?id=123 — reject (delete) a comment
 */
export async function DELETE(request: NextRequest) {
  const unauthorized = requireAdminWithCsrf(request);
  if (unauthorized) return unauthorized;

  try {
    const id = Number(request.nextUrl.searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ error: "Comment id required" }, { status: 400 });
    }

    deleteComment(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error deleting comment", { error: error });
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}