import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/auth";
import { getAdminStats } from "@/lib/services/admin-service";
import { logger } from "@/lib/core/logger";

// GET /api/admin/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const stats = getAdminStats();

    return NextResponse.json({ stats });
  } catch (error) {
    logger.error("Error fetching stats", { error: error });
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}