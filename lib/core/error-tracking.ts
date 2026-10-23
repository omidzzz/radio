import { logger } from "@/lib/core/logger";

/**
 * Lightweight error tracking utility.
 * Logs errors to console in development and can be extended
 * to send to Sentry or other services in production.
 */

interface ErrorContext {
  [key: string]: unknown;
}

/**
 * Track an error with context.
 * In production, this can be extended to send to Sentry, Datadog, etc.
 */
export function trackError(error: unknown, context?: ErrorContext): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  // Always log to console for debugging
  logger.error(message, { context, stack });

  // In production, send to error tracking service
  if (process.env.NODE_ENV === "production") {
    // TODO: Integrate with Sentry or similar
    // Sentry.captureException(error, { extra: context });
  }
}

/**
 * Track a user-facing event (e.g., form submission, booking).
 */
export function trackEvent(name: string, data?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "development") {
    console.debug("[Event]", name, data);
  }
  // TODO: Send to analytics service
}

/**
 * Track a performance metric (Web Vitals).
 * Reports to /api/web-vitals where metrics are persisted for analysis.
 */
export function trackWebVital(
  name: string,
  value: number,
  rating: "good" | "needs-improvement" | "poor"
): void {
  if (process.env.NODE_ENV === "development") {
    console.debug(`[WebVital] ${name}: ${value} (${rating})`);
  }

  const payload = JSON.stringify({ name, value, rating, path: location.pathname });
  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/web-vitals",
        new Blob([payload], { type: "application/json" })
      );
    } else {
      void fetch("/api/web-vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      });
    }
  } catch {
    // Reporting must never break the page
  }
}
