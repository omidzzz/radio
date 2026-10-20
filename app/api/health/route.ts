import { NextResponse } from "next/server";
import { pingDatabase } from "@/lib/services/system-service";

// GET /api/health - Health check endpoint for uptime monitoring
export async function GET() {
  const status: {
    status: string;
    timestamp: string;
    uptime: number;
    database: string;
  } = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: "ok",
  };

  // Verify database connectivity
  if (!pingDatabase()) {
    status.status = "degraded";
    status.database = "error";
    return NextResponse.json(status, { status: 503 });
  }

  return NextResponse.json(status, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}