import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/security/auth";

// POST /api/admin/logout - Revoke the session server-side and clear cookies
export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  clearSessionCookie(response, request);
  return response;
}