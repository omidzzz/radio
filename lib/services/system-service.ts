import db, { prepare } from "@/lib/db/db";

/** Web-vital beacon accepted by the telemetry endpoint. */
export interface WebVitalInput {
  name: string;
  value: number;
  rating?: string;
  path?: string | null;
}

const ALLOWED_METRICS = new Set([
  "LCP",
  "INP",
  "CLS",
  "FCP",
  "TTFB",
  "FID",
  "Next.js-hydration",
  "Next.js-route-change-to-render",
  "Next.js-render",
]);

/** Ensure the telemetry table exists (runs once per server start). */
export function ensureWebVitalsTable(): void {
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
}

/** Validate a web-vital beacon payload. */
export function isValidWebVital(input: unknown): input is WebVitalInput {
  if (!input || typeof input !== "object") return false;
  const body = input as Record<string, unknown>;
  return (
    typeof body.name === "string" &&
    ALLOWED_METRICS.has(body.name) &&
    typeof body.value === "number" &&
    Number.isFinite(body.value)
  );
}

/** Persist a sanitized web-vital beacon. */
export function recordWebVital(input: WebVitalInput): void {
  const rating =
    input.rating === "good" ||
    input.rating === "needs-improvement" ||
    input.rating === "poor"
      ? input.rating
      : "unknown";

  prepare(
    "INSERT INTO web_vitals (name, value, rating, path) VALUES (?, ?, ?, ?)"
  ).run(
    input.name,
    input.value,
    rating,
    typeof input.path === "string" ? input.path.slice(0, 300) : null
  );
}

/** Lightweight DB ping used by the health endpoint. */
export function pingDatabase(): boolean {
  try {
    prepare("SELECT 1").get();
    return true;
  } catch {
    return false;
  }
}
