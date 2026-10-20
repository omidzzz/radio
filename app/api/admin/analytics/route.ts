import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/auth";
import { getAdminAnalytics } from "@/lib/services/admin-service";

// GET /api/admin/analytics - Get analytics data for dashboard
export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d";

    const data = getAdminAnalytics(range);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
