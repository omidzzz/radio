// Rate limiter backed by SQLite for multi-instance support
import db from "@/lib/db/db";
import { logger } from "@/lib/core/logger";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Ensure rate_limit table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS rate_limits (
    key TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 0,
    reset_at INTEGER NOT NULL
  );
`);

// Clean up expired entries periodically
const CLEANUP_INTERVAL = 10 * 60 * 1000;
setInterval(() => {
  try {
    db.prepare("DELETE FROM rate_limits WHERE reset_at <= ?").run(Date.now());
  } catch {
    // Ignore cleanup errors
  }
}, CLEANUP_INTERVAL).unref?.();

export interface RateLimitOptions {
  windowMs?: number;
  max?: number;
}

/**
 * Rate limit by IP address using SQLite-backed storage.
 * Works across multiple serverless instances.
 */
export function rateLimitByIp(
  ip: string | null,
  options: RateLimitOptions = {}
): { success: boolean; retryAfterSeconds?: number } {
  const windowMs = options.windowMs ?? 60_000; // 1 minute default
  const max = options.max ?? 5; // 5 requests per window default

  const key = `ip:${ip || "unknown"}`;
  const now = Date.now();

  try {
    const entry = db
      .prepare("SELECT count, reset_at FROM rate_limits WHERE key = ?")
      .get(key) as RateLimitEntry | undefined;

    if (!entry || entry.resetAt <= now) {
      // New window
      db.prepare(
        "INSERT INTO rate_limits (key, count, reset_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = 1, reset_at = ?"
      ).run(key, now + windowMs, now + windowMs);
      return { success: true };
    }

    const newCount = entry.count + 1;
    db.prepare("UPDATE rate_limits SET count = ? WHERE key = ?").run(
      newCount,
      key
    );

    if (newCount > max) {
      const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
      return { success: false, retryAfterSeconds };
    }

    return { success: true };
  } catch (error) {
    // If DB fails, fail open to avoid blocking legitimate requests
    logger.error("Rate limit DB error", { error: error });
    return { success: true };
  }
}

/**
 * Get IP from request headers (handles proxies).
 */
export function getClientIp(request: Request): string | null {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    return xff.split(",")[0].trim();
  }
  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) {
    return xRealIp.trim();
  }
  return null;
}