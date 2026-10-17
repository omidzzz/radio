"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Locale } from "@/lib/i18n/config";

interface LocaleContextValue {
  locale: Locale;
  dir: "rtl" | "ltr";
  setLocale: (locale: Locale, target?: string) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "fa",
  dir: "rtl",
  setLocale: () => {},
});

export function useLocale() {
  return useContext(LocaleContext);
}

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // Apply dir to document on locale change
  useEffect(() => {
    document.documentElement.dir = locale === "fa" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = async (newLocale: Locale, target?: string) => {
    setLocaleState(newLocale);
    try {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: newLocale }),
      });
    } catch {
      // Ignore errors — locale is still applied client-side
    }
    // Full page navigation. Client-side RSC navigations (router.replace)
    // can serve stale payloads from the router cache — Link prefetching
    // populates that cache with pages rendered under the OLD locale cookie,
    // so the toggle would flip direction but keep the old language until a
    // manual refresh. A hard navigation always passes through the
    // middleware, rewrites /en/*, and server-renders the new dictionary on
    // the very first swap.
    if (target) {
      window.location.assign(target);
    } else {
      router.refresh();
    }
  };

  const dir = locale === "fa" ? "rtl" : "ltr";

  return (
    <LocaleContext.Provider value={{ locale, dir, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}
