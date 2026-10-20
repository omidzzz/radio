"use client";

import { usePathname } from "next/navigation";
import { useLocale } from "./providers/LocaleProvider";
import { Locale } from "@/lib/i18n/config";

export default function LanguageToggle() {
  const { locale, setLocale } = useLocale();
  const pathname = usePathname();

  const toggle = () => {
    const newLocale: Locale = locale === "fa" ? "en" : "fa";
    setLocale(newLocale);

    // Reflect the locale in the URL so each language has a distinct,
    // shareable address (/en/... for English). The middleware rewrites
    // /en/* internally and pins the locale cookie.
    const isPrefixed = pathname === "/en" || pathname.startsWith("/en/");
    let target: string;
    if (newLocale === "en") {
      target = isPrefixed ? pathname : `/en${pathname === "/" ? "" : pathname}`;
    } else {
      target = isPrefixed ? pathname.slice(3) || "/" : pathname;
    }
    window.history.replaceState(null, "", target);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-[10px] font-bold text-text-secondary transition hover:border-primary hover:text-primary"
      aria-label={locale === "fa" ? "Switch to English" : "تغییر به فارسی"}
      title={locale === "fa" ? "Switch to English" : "تغییر به فارسی"}
    >
      {locale === "fa" ? "EN" : "فا"}
    </button>
  );
}