import { NextRequest, NextResponse } from "next/server";
import { LOCALE_COOKIE, Locale, isLocale } from "@/lib/i18n/config";

// GET /api/locale - Get current locale
export async function GET(request: NextRequest) {
  const locale = request.cookies.get(LOCALE_COOKIE)?.value;
  return NextResponse.json({ locale: isLocale(locale) ? locale : null });
}

// POST /api/locale - Set locale
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { locale?: string };

    if (!isLocale(body.locale)) {
      return NextResponse.json(
        { error: "Invalid locale. Must be 'fa' or 'en'." },
        { status: 400 }
      );
    }

    const locale: Locale = body.locale;
    const response = NextResponse.json({ locale });
    response.cookies.set(LOCALE_COOKIE, locale, {
      // Not httpOnly: the middleware already sets this cookie
      // JS-readably, and the client writes it directly on language
      // toggle so the router refresh can skip a blocking round-trip.
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    console.error("Error setting locale:", error);
    return NextResponse.json(
      { error: "Failed to set locale" },
      { status: 500 }
    );
  }
}