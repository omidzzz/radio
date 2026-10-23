"use client";

import { usePathname } from "next/navigation";
import { useLocale } from "./providers/LocaleProvider";
import { Locale, LOCALE_COOKIE } from "@/lib/i18n/config";

export default function LanguageToggle() {
  const { locale, setLocale } = useLocale();
  const pathname = usePathname();

  const toggle = () => {
    const newLocale: Locale = locale === "fa" ? "en" : "fa";

    const isPrefixed = pathname === "/en" || pathname.startsWith("/en/");
    let target: string;
    if (newLocale === "en") {
      target = isPrefixed ? pathname : `/en${pathname === "/" ? "" : pathname}`;
    } else {
      target = isPrefixed ? pathname.slice(3) || "/" : pathname;
    }

    // Persist cookie so SSR/middleware render the right language, and flip
    // the client context (dir/lang) immediately.
    document.cookie = `${LOCALE_COOKIE}=${newLocale}; path=/; max-age=${
      60 * 60 * 24 * 365
    }; samesite=lax${location.protocol === "https:" ? "; secure" : ""}`;
    setLocale(newLocale);

    // Client-side navigation via Next's router — fast, no reload, and
    // ThemeProvider stays mounted so the theme does not flicker. Defer to a
    // separate tick: calling replace() directly inside React's discrete
    // onClick event is swallowed by Next (the original bug). A brief delay
    // lets the router settle so the navigation fires on the first try.
    setTimeout(() => {
      const router = (window as unknown as { next?: { router?: { replace: (href: string) => Promise<boolean> } } }).next?.router;
      if (router?.replace) router.replace(target);
    }, 150);
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