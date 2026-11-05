export const locales = ["fa", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fa";

export const localeNames: Record<Locale, string> = {
  fa: "فارسی",
  en: "English",
};

export const localeDirs: Record<Locale, "rtl" | "ltr"> = {
  fa: "rtl",
  en: "ltr",
};

export const LOCALE_COOKIE = "locale";

export function isLocale(value: string | undefined): value is Locale {
  return value === "fa" || value === "en";
}