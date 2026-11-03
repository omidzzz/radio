"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "./providers/LocaleProvider";
import { Locale, LOCALE_COOKIE } from "@/lib/i18n/config";

export default function LanguageToggle() {
  const { locale, setLocale } = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggle = () => {
    const newLocale: Locale = locale === "fa" ? "en" : "fa";

    // pathname always starts with /fa or /en thanks to the [locale] segment.
    // Swap the locale prefix to build the target URL.
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0 && (segments[0] === "fa" || segments[0] === "en")) {
      segments[0] = newLocale;
    } else {
      segments.unshift(newLocale);
    }
    const target = "/" + segments.join("/");

    // Persist cookie for middleware/Accept-Language detection on fresh visits.
    document.cookie = `${LOCALE_COOKIE}=${newLocale}; path=/; max-age=${
      60 * 60 * 24 * 365
    }; samesite=lax${location.protocol === "https:" ? "; secure" : ""}`;

    // Flip the client context (dir/lang) immediately, then navigate.
    setLocale(newLocale);

    // Client-side navigation via Next's App Router — loads the
    // pre-rendered static page for the other locale. ThemeProvider stays
    // mounted so the theme does not flicker.
    router.replace(target);
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