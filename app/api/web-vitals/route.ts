import { NextRequest, NextResponse } from "next/server";
import { rateLimitByIp, getClientIp } from "@/lib/rate-limit";
import db from "@/lib/db";

// Ensure the metrics table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS web_vitals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    value REAL NOT NULL,
    rating TEXT NOT NULL,
    path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_web_vitals_name ON web_vitals(name, created_at DESC);
`);

const ALLOWED_METRICS = new Set(["LCP", "INP", "CLS", "FCP", "TTFB", "Next.js-hydration", "Next.js-route-change-to-render", "Next.js-render"]);

/**
 * POST /api/web-vitals — receive Core Web Vitals beacons from the client.
 * Metrics are persisted in SQLite for later analysis (p75 dashboards etc.).
 */
export async function POST(request: NextRequest) {
  try {
    // Light rate limiting: 60 beacons per minute per IP
    const ip = getClientIp(request);
    const rateLimit = rateLimitByIp(`vitals:${ip}`, {
      windowMs: 60_000,
      max: 60,
    });
    if (!rateLimit.success) {
      return NextResponse.json({ ok: true }, { status: 202 });
    }

    const body = (await request.json()) as {
      name?: string;
      value?: number;
      rating?: string;
      path?: string;
    };

    if (
      !body.name ||
      !ALLOWED_METRICS.has(body.name) ||
      typeof body.value !== "number" ||
      !Number.isFinite(body.value)
    ) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    db.prepare(
      "INSERT INTO web_vitals (name, value, rating, path) VALUES (?, ?, ?, ?)"
    ).run(
      body.name,
      body.value,
      body.rating === "good" || body.rating === "needs-improvement" || body.rating === "poor"
        ? body.rating
        : "unknown",
      typeof body.path === "string" ? body.path.slice(0, 300) : null
    );

    return NextResponse.json({ ok: true });
  } catch {
    // Never surface errors for telemetry
    return NextResponse.json({ ok: true }, { status: 202 });
  }
}