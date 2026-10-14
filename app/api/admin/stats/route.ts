import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    // Single query with subqueries to avoid 6 separate DB round-trips
    const row = db
      .prepare(
        `SELECT
           (SELECT COUNT(*) FROM bookings) as totalBookings,
           (SELECT COUNT(*) FROM bookings WHERE status = 'pending') as pendingBookings,
           (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed') as confirmedBookings,
           (SELECT COUNT(*) FROM forum_posts) as totalForumPosts,
           (SELECT COUNT(*) FROM forum_replies) as totalForumReplies,
           (SELECT COUNT(*) FROM contact_messages) as totalMessages`
      )
      .get() as {
      totalBookings: number;
      pendingBookings: number;
      confirmedBookings: number;
      totalForumPosts: number;
      totalForumReplies: number;
      totalMessages: number;
    };

    return NextResponse.json({
      stats: {
        totalBookings: row.totalBookings,
        pendingBookings: row.pendingBookings,
        confirmedBookings: row.confirmedBookings,
        totalForumPosts: row.totalForumPosts,
        totalForumReplies: row.totalForumReplies,
        totalMessages: row.totalMessages,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}