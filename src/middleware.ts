import { NextRequest, NextResponse } from "next/server";

/**
 * Path-based locale routing for static export:
 *
 *   /fa        → serves /fa/ (Persian, default)
 *   /en        → serves /en/ (English)
 *
 * Both locales are now pre-rendered as static pages via the [locale]
 * segment + generateStaticParams. No cookie-based locale detection
 * is needed — the locale is always derived from the URL path.
 *
 * This middleware is only active in development (`next dev`).
 * For production static exports, Next.js generates static HTML at
 * build time and the middleware does not run.
 */
function handleTrailingSlash(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  // Redirect /fa and /en without trailing slash to their slashed versions
  // Only redirect if not already has a trailing slash to avoid redirect loop
  if ((pathname === "/fa" || pathname === "/en") && !pathname.endsWith("/")) {
    return NextResponse.redirect(new URL(`${pathname}/`, request.url), 308);
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect root path to default locale
  if (pathname === "/" || pathname === "") {
    return NextResponse.redirect(new URL("/fa/", request.url), 308);
  }

  // Trailing slash redirects are now handled by Next.js (trailingSlash: true).
  // This middleware only handles the root path redirect to the default locale.
  const slashRedirect = handleTrailingSlash(request);
  if (slashRedirect) return slashRedirect;

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on all routes except static files, API routes, and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|images/|uploads/|api/|sw.js|offline.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot|xml|txt)$).*)",
  ],
};