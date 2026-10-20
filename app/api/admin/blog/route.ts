import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/auth";
import { getAdminBlogPosts } from "@/lib/services/admin-service";

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const posts = getAdminBlogPosts();

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}