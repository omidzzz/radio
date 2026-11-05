"use client";

const CSRF_COOKIE = "csrf_token";
const CSRF_STORAGE_KEY = "admin_csrf_token";

/**
 * Get the CSRF token.
 * Primary source: sessionStorage (set from X-CSRF-Token response header on login).
 * Fallback: cookie (for backward compatibility with non-httpOnly cookies).
 */
export function getCsrfToken(): string {
  if (typeof window === "undefined") return "";

  // Primary: sessionStorage (set from X-CSRF-Token response header)
  try {
    const stored = sessionStorage.getItem(CSRF_STORAGE_KEY);
    if (stored) return stored;
  } catch {
    // sessionStorage might be unavailable
  }

  // Fallback: cookie (for backward compatibility)
  if (typeof document === "undefined") return "";
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.trim().split("=");
    if (name === CSRF_COOKIE) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return "";
}

/**
 * Build headers object with CSRF token for mutating requests.
 */
export function csrfHeaders(
  extraHeaders: Record<string, string> = {}
): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-csrf-token": getCsrfToken(),
    ...extraHeaders,
  };
}