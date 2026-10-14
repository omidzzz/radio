import { NextRequest, NextResponse } from "next/server";
import { LOCALE_COOKIE, defaultLocale, isLocale } from "@/lib/i18n/config";

const COOKIE_OPTS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365, // 1 year
  httpOnly: false,
  sameSite: "lax" as const,
};

/**
 * Path-based locale routing:
 *
 *   /en        → serves "/" rendered in English
 *   /en/blog/3 → serves "/blog/3" rendered in English
 *
 * The /en prefix gives each language distinct, crawlable URLs (proper
 * hreflang targets) while the app itself stays single-segment — the
 * middleware rewrites internally and pins the locale cookie so server
 * components render the right dictionary.
 */
function handlePrefixedLocale(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Strip the /en prefix to find the inner route ("/en" → "/")
  const innerPath = pathname === "/en" ? "/" : pathname.slice(3);

  // Pin the locale on BOTH the incoming request (so SSR renders English
  // for this very request) and the response (so it persists).
  request.cookies.set(LOCALE_COOKIE, "en");
  const response = NextResponse.rewrite(new URL(innerPath, request.url));
  response.cookies.set(LOCALE_COOKIE, "en", COOKIE_OPTS);
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // English-prefixed URLs always render in English
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    return handlePrefixedLocale(request);
  }

  const response = NextResponse.next();

  // If no locale cookie is set, detect from Accept-Language header.
  // English browsers land on the Persian default but can switch via the
  // toggle or by visiting /en directly.
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (!isLocale(cookieLocale)) {
    const acceptLanguage = request.headers.get("accept-language") || "";
    const detected = acceptLanguage
      .split(",")
      .map((lang) => lang.split(";")[0].trim().toLowerCase())
      .find((lang) => lang.startsWith("fa") || lang.startsWith("en"));

    const locale = isLocale(detected) ? detected : defaultLocale;
    response.cookies.set(LOCALE_COOKIE, locale, COOKIE_OPTS);
  }

  // NOTE: No Cache-Control headers are set here. HTML pages use ISR
  // (`export const revalidate`) and depend on the locale cookie, so caching
  // them at the edge with s-maxage caused stale-locale responses. Static
  // assets (/images, /uploads) are excluded by the matcher below and get
  // long-lived immutable headers from next.config.ts instead.

  return response;
}

export const config = {
  matcher: [
    // Run on all routes except static files, API routes, and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|images/|uploads/|api/|sw.js|offline.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot|xml|txt)$).*)",
  ],
};