import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/db/db";

const SESSION_COOKIE = "admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8; // 8 hours
const CSRF_COOKIE = "csrf_token";

// ---------------------------------------------------------------------------
// Server-side session store
// ---------------------------------------------------------------------------
// Sessions embed a random ID (jti) that is persisted (hashed) in SQLite so
// they can be revoked individually (logout) or globally (password change).
// The cookie signature alone is no longer sufficient — a stolen/expired/
// revoked token is rejected even if its HMAC is valid.

// Ensure the session store table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_sessions (
    token_id TEXT PRIMARY KEY,
    expires_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
`);

// Periodically purge expired rows
const CLEANUP_INTERVAL = 60 * 60 * 1000;
setInterval(() => {
  try {
    db.prepare("DELETE FROM admin_sessions WHERE expires_at <= ?").run(
      Date.now()
    );
  } catch {
    // Ignore cleanup errors
  }
}, CLEANUP_INTERVAL).unref?.();

function hashTokenId(jti: string): string {
  return crypto.createHash("sha256").update(jti).digest("hex");
}

/**
 * Get the session secret from env.
 * Uses a separate secret from the admin password to prevent session forgery
 * if the password is ever compromised.
 */
export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET environment variable is required. Set it to a random string of at least 32 characters."
    );
  }
  return secret;
}

/**
 * Create a signed session token using HMAC.
 * The token embeds a random ID (jti) and expiry timestamp so it is both
 * tamper-evident and revocable via the server-side session store.
 */
export function signSession(): string {
  const secret = getSessionSecret();
  const payload = JSON.stringify({
    jti: crypto.randomBytes(16).toString("base64url"),
    exp: Date.now() + SESSION_DURATION_SECONDS * 1000,
  });
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  // Persist the hashed jti so this specific session can be revoked later
  const parsed = JSON.parse(payload) as { jti: string; exp: number };
  try {
    db.prepare(
      "INSERT INTO admin_sessions (token_id, expires_at) VALUES (?, ?)"
    ).run(hashTokenId(parsed.jti), parsed.exp);
  } catch (error) {
    console.error("Failed to persist admin session:", error);
  }

  return `${Buffer.from(payload).toString("base64url")}.${signature}`;
}

/**
 * Verify a session token: signature, expiry, and presence in the
 * server-side session store (i.e., not revoked).
 */
export function verifySession(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  try {
    const secret = getSessionSecret();
    const payload = Buffer.from(parts[0], "base64url").toString();
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    // Constant-time compare
    const a = Buffer.from(parts[1]);
    const b = Buffer.from(expectedSignature);
    if (a.length !== b.length) return false;
    if (!crypto.timingSafeEqual(a, b)) return false;

    const data = JSON.parse(payload) as { jti?: string; exp: number };
    if (!data.jti || data.exp <= Date.now()) return false;

    // Must exist in the session store (not revoked / not purged)
    const row = db
      .prepare(
        "SELECT 1 FROM admin_sessions WHERE token_id = ? AND expires_at > ?"
      )
      .get(hashTokenId(data.jti), Date.now());
    return row !== undefined;
  } catch {
    return false;
  }
}

/**
 * Revoke a single session (used on logout).
 */
export function revokeSession(token: string | undefined): void {
  if (!token) return;
  const parts = token.split(".");
  if (parts.length !== 2) return;
  try {
    const payload = Buffer.from(parts[0], "base64url").toString();
    const data = JSON.parse(payload) as { jti?: string };
    if (!data.jti) return;
    db.prepare("DELETE FROM admin_sessions WHERE token_id = ?").run(
      hashTokenId(data.jti)
    );
  } catch {
    // Ignore malformed tokens
  }
}

/**
 * Revoke ALL active sessions (e.g., after a password change).
 */
export function revokeAllSessions(): void {
  try {
    db.prepare("DELETE FROM admin_sessions").run();
  } catch (error) {
    console.error("Failed to revoke all admin sessions:", error);
  }
}

/**
 * Get the configured admin password from env.
 * Fails closed if not set — no default password!
 */
export function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error(
      "ADMIN_PASSWORD environment variable is required. Set it before starting the server."
    );
  }
  return password;
}

/**
 * Get the optional TOTP secret for 2FA from env.
 * Returns null when 2FA is not enabled.
 */
export function getAdminTotpSecret(): string | null {
  const secret = process.env.ADMIN_TOTP_SECRET;
  return secret && secret.trim().length > 0 ? secret.trim() : null;
}

/**
 * Generate a CSRF token (random 32-byte value).
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * Set the session cookie on a response.
 * CSRF token is stored in an httpOnly cookie AND returned in the response
 * so the client can send it back in a custom header (Double Submit Cookie pattern).
 */
export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });

  // CSRF token cookie - httpOnly so XSS cannot read it
  const csrfToken = generateCsrfToken();
  response.cookies.set(CSRF_COOKIE, csrfToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });

  // Also expose the CSRF token in a response header so the client can read it
  // and send it back in the X-CSRF-Token header (Double Submit Cookie pattern)
  response.headers.set("X-CSRF-Token", csrfToken);
}

/**
 * Clear the session cookie and revoke the session server-side.
 */
export function clearSessionCookie(
  response: NextResponse,
  request?: NextRequest
) {
  if (request) {
    revokeSession(request.cookies.get(SESSION_COOKIE)?.value);
  }
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(CSRF_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Check if the request has a valid admin session.
 */
export function isAdminRequest(request: NextRequest): boolean {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

/**
 * Validate CSRF token from request against cookie.
 * Uses the Double Submit Cookie pattern:
 * - The CSRF token is stored in an httpOnly cookie
 * - The client must send the same token in the X-CSRF-Token header
 * - Both values must match
 */
export function isValidCsrf(request: NextRequest): boolean {
  const headerToken = request.headers.get("x-csrf-token");
  const cookieToken = request.cookies.get(CSRF_COOKIE)?.value;
  if (!headerToken || !cookieToken) return false;

  // Constant-time comparison
  const a = Buffer.from(headerToken);
  const b = Buffer.from(cookieToken);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Helper for admin API routes: returns a 401 response if not authorized.
 */
export function requireAdmin(request: NextRequest): NextResponse | null {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/**
 * Helper for admin mutating API routes: checks auth + CSRF.
 */
export function requireAdminWithCsrf(
  request: NextRequest
): NextResponse | null {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  if (!isValidCsrf(request)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }
  return null;
}