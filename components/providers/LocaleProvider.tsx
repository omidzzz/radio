"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  startTransition,
  ReactNode,
} from "react";
import { Locale, LOCALE_COOKIE } from "@/lib/i18n/config";

interface LocaleContextValue {
  locale: Locale;
  dir: "rtl" | "ltr";
  setLocale: (locale: Locale) => void;
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
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // Apply dir to document on locale change
  useEffect(() => {
    document.documentElement.dir = locale === "fa" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    // Persist the cookie client-side so the server/middleware render the
    // right language on the next navigation. The cookie is not httpOnly —
    // both the middleware and /api/locale set it JS-readably.
    document.cookie = `${LOCALE_COOKIE}=${newLocale}; path=/; max-age=${
      60 * 60 * 24 * 365
    }; samesite=lax${location.protocol === "https:" ? "; secure" : ""}`;
    // Flip the context (dir/lang follow via useEffect) so client
    // components read the new dictionary immediately.
    startTransition(() => {
      setLocaleState(newLocale);
    });
  };

  const dir = locale === "fa" ? "rtl" : "ltr";

  return (
    <LocaleContext.Provider value={{ locale, dir, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}
