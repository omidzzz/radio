import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/analytics - Get analytics data for dashboard
export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d";

    // Determine date filter
    let dateFilter = "";
    switch (range) {
      case "7d":
        dateFilter = "AND created_at >= date('now', '-7 days')";
        break;
      case "30d":
        dateFilter = "AND created_at >= date('now', '-30 days')";
        break;
      case "90d":
        dateFilter = "AND created_at >= date('now', '-90 days')";
        break;
      default:
        dateFilter = "AND created_at >= date('now', '-30 days')";
    }

    // Bookings over time (daily counts)
    const bookingsOverTime = db
      .prepare(
        `SELECT 
           date(created_at) as day,
           COUNT(*) as count
         FROM bookings
         WHERE created_at >= date('now', '-30 days')
         GROUP BY date(created_at)
         ORDER BY day ASC`
      )
      .all() as { day: string; count: number }[];

    // Messages over time
    const messagesOverTime = db
      .prepare(
        `SELECT 
           date(created_at) as day,
           COUNT(*) as count
         FROM contact_messages
         WHERE created_at >= date('now', '-30 days')
         GROUP BY date(created_at)
         ORDER BY day ASC`
      )
      .all() as { day: string; count: number }[];

    // Forum posts over time
    const postsOverTime = db
      .prepare(
        `SELECT 
           date(created_at) as day,
           COUNT(*) as count
         FROM forum_posts
         WHERE created_at >= date('now', '-30 days')
         GROUP BY date(created_at)
         ORDER BY day ASC`
      )
      .all() as { day: string; count: number }[];

    // Booking status breakdown
    const statusBreakdown = db
      .prepare(
        `SELECT 
           status,
           COUNT(*) as count
         FROM bookings
         GROUP BY status
         ORDER BY count DESC`
      )
      .all() as { status: string; count: number }[];

    // Session type breakdown
    const sessionTypeBreakdown = db
      .prepare(
        `SELECT 
           session_type,
           COUNT(*) as count
         FROM bookings
         GROUP BY session_type
         ORDER BY count DESC`
      )
      .all() as { session_type: string; count: number }[];

    // Recent activity (last 10 bookings + messages)
    const recentActivity = db
      .prepare(
        `SELECT 'booking' as type, id, full_name as title, created_at FROM bookings
         UNION ALL
         SELECT 'message' as type, id, subject as title, created_at FROM contact_messages
         ORDER BY created_at DESC
         LIMIT 10`
      )
      .all() as { type: string; id: number; title: string; created_at: string }[];

    return NextResponse.json({
      bookingsOverTime,
      messagesOverTime,
      postsOverTime,
      statusBreakdown,
      sessionTypeBreakdown,
      recentActivity,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
