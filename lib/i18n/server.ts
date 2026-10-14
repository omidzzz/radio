import "server-only";
import { cookies } from "next/headers";
import { defaultLocale, isLocale, Locale, LOCALE_COOKIE } from "./config";
import { getDictionary } from "./index";
import { toFarsiDigits } from "./numbers";

export async function getServerLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const locale = cookieStore.get(LOCALE_COOKIE)?.value;
    return isLocale(locale) ? locale : defaultLocale;
  } catch {
    // During static generation, cookies() may not be available.
    // Fall back to default locale.
    return defaultLocale;
  }
}

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