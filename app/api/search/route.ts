import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchAll } from "@/lib/services/search-service";
import { getServerLocale } from "@/lib/i18n/server";
import { rateLimitByIp, getClientIp } from "@/lib/rate-limit";

// Input validation schema
const SearchQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(2, "Search term must be at least 2 characters")
    .max(200, "Search term must be at most 200 characters")
    .regex(
      /^[\u0600-\u06FF\u0750-\u077Fa-zA-Z0-9\s\-_.@+]+$/,
      "Search term contains invalid characters"
    ),
  limit: z.coerce.number().int().min(1).max(50).optional().default(8),
  pages: z.enum(["true", "false"]).optional().default("true"),
});

// GET /api/search?q=... - Unified search across blog, forum, and pages
export async function GET(request: NextRequest) {
  // Rate limit: 30 searches per minute per IP
  const ip = getClientIp(request);
  const rateLimit = rateLimitByIp(ip, { windowMs: 60_000, max: 30 });
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many search requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q") || "";
  const limitParam = searchParams.get("limit") || "8";
  const pagesParam = searchParams.get("pages") || "true";

  // Validate input with Zod
  const parsed = SearchQuerySchema.safeParse({ q, limit: limitParam, pages: pagesParam });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid search query" },
      { status: 400 }
    );
  }

  const { q: validQ, limit, pages } = parsed.data;

  try {
    const locale = await getServerLocale();
    const response = searchAll(validQ, {
      locale,
      limit,
      includePages: pages === "true",
    });

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json({
      query: q,
      results: [],
      grouped: { blog: [], forum: [], page: [] },
      total: 0,
    });
  }
}
