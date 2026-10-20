import { NextRequest, NextResponse } from "next/server";
import { rateLimitByIp, getClientIp } from "@/lib/http/rate-limit";
import {
  ensureWebVitalsTable,
  isValidWebVital,
  recordWebVital,
} from "@/lib/services/system-service";

// Ensure the metrics table exists
ensureWebVitalsTable();

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

    if (process.env.NODE_ENV === "development") {
      console.debug("[WebVitals API] beacon:", JSON.stringify(body));
    }

    if (!isValidWebVital(body)) {
      if (process.env.NODE_ENV === "development") {
        console.debug(
          "[WebVitals API] validation failed:",
          JSON.stringify(body)
        );
      }
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    recordWebVital({
      name: body.name ?? "",
      value: typeof body.value === "number" ? body.value : 0,
      rating: body.rating,
      path: body.path,
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Never surface errors for telemetry
    return NextResponse.json({ ok: true }, { status: 202 });
  }
}