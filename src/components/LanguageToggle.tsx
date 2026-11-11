"use client";

import { useRouter, usePathname } from "next/navigation";
import { Locale, LOCALE_COOKIE } from "@/lib/i18n/config";

export default function LanguageToggle() {
  const router = useRouter();
  // Derive locale from URL — the root LocaleProvider is always initialized
  // as "fa", so useLocale() would return the wrong locale on /en pages.
  const pathname = usePathname();
  const locale = (pathname.split("/")[1] === "en" ? "en" : "fa") as Locale;

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

    // Navigate to the localized URL. Navbar/Footer re-render via usePathname().
    router.replace(target);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="ui-icon-button h-8 w-8 text-[10px]"
      aria-label={locale === "fa" ? "Switch to English" : "تغییر به فارسی"}
      title={locale === "fa" ? "Switch to English" : "تغییر به فارسی"}
    >
      {locale === "fa" ? "EN" : "فا"}
    </button>
  );
}