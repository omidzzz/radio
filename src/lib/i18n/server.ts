import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { defaultLocale, isLocale, Locale, LOCALE_COOKIE } from "./config";
import { getDictionary } from "./index";
import { toFarsiDigits } from "./numbers";

/**
 * Resolve the active locale from the request cookie.
 *
 * Wrapped in React's `cache()` so that within a single RSC request the cookie
 * is read at most once. Every subsequent call — from the root layout, from a
 * page body via `getServerDictionary()`, and from `generateMetadata` for the
 * same route — shares the same resolved promise. This removes the redundant
 * per-page `cookies()` reads that previously ran for every forum/blog route
 * and lets each page obtain `{ dict, locale }` without extra I/O.
 */
export const getServerLocale = cache(async (): Promise<Locale> => {
  try {
    const cookieStore = await cookies();
    const locale = cookieStore.get(LOCALE_COOKIE)?.value;
    return isLocale(locale) ? locale : defaultLocale;
  } catch {
    // During static generation, cookies() may not be available.
    // Fall back to default locale.
    return defaultLocale;
  }
});

export async function getServerDictionary() {
  const locale = await getServerLocale();
  return {
    locale,
    dir: locale === "fa" ? ("rtl" as const) : ("ltr" as const),
    dict: getDictionary(locale),
    toFarsiDigits: (value: string | number) =>
      locale === "fa" ? toFarsiDigits(value) : String(value),
  };
}

export { getDictionary, defaultLocale, isLocale };
export type { Locale };