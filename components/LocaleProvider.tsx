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
    // Navigate with the router AFTER the cookie write has landed.
    // A real navigation always goes through the middleware, which rewrites
    // /en/* URLs and pins the locale cookie, so server components render
    // the fresh dictionary on the very first swap. (The old approach —
    // history.replaceState + router.refresh() — raced the cookie write
    // and could return stale server-rendered content.)
    if (target) {
      router.replace(target);
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
