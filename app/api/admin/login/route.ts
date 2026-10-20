import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  getAdminPassword,
  getAdminTotpSecret,
  signSession,
  setSessionCookie,
} from "@/lib/security/auth";
import { verifyTotp } from "@/lib/security/totp";
import { rateLimitByIp, getClientIp } from "@/lib/http/rate-limit";

// POST /api/admin/login - Authenticate admin
export async function POST(request: NextRequest) {
  try {
    // Rate limit: max 5 attempts per minute per IP
    const ip = getClientIp(request);
    const rateLimit = rateLimitByIp(ip, { windowMs: 60_000, max: 5 });

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Too many login attempts. Please try again later.",
          retryAfter: rateLimit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds || 60),
          },
        }
      );
    }

    const body = (await request.json()) as {
      password?: string;
      totpCode?: string;
    };

    if (!body.password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // Two-factor authentication (optional — enabled by setting ADMIN_TOTP_SECRET)
    const totpSecret = getAdminTotpSecret();
    if (totpSecret && !verifyTotp(totpSecret, body.totpCode ?? "")) {
      return NextResponse.json(
        { error: "Invalid or missing two-factor code", requires2fa: true },
        { status: 401 }
      );
    }

    const adminPassword = getAdminPassword();
    const providedHash = crypto
      .createHash("sha256")
      .update(body.password)
      .digest("hex");
    const expectedHash = crypto
      .createHash("sha256")
      .update(adminPassword)
      .digest("hex");

    // Constant-time comparison
    const a = Buffer.from(providedHash);
    const b = Buffer.from(expectedHash);
    const passwordsMatch =
      a.length === b.length && crypto.timingSafeEqual(a, b);

    if (!passwordsMatch) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    const token = signSession();
    const response = NextResponse.json({ success: true });
    setSessionCookie(response, token);

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    const status = message.includes("required") ? 500 : 401;
    console.error("Error during admin login:", error);
    return NextResponse.json({ error: message }, { status });
  }
}