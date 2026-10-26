"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  startTransition,
  ReactNode,
} from "react";
import { Locale, LOCALE_COOKIE, isLocale } from "@/lib/i18n/config";

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

  // On first load, detect locale from URL path prefix (/en or /fa) when no
  // cookie is set. Static export has no middleware to strip the prefix, so
  // the client handles it so the right dictionary renders.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasCookie = document.cookie
      .split(";")
      .some((c) => c.trim().startsWith(`${LOCALE_COOKIE}=`));
    if (!hasCookie) {
      const match = window.location.pathname.match(/^\/([a-z]{2})(\/|$)/);
      const urlLocale = match && isLocale(match[1]) ? match[1] : undefined;
      if (urlLocale && urlLocale !== initialLocale) {
        document.cookie = `${LOCALE_COOKIE}=${urlLocale}; path=/; max-age=${
          60 * 60 * 24 * 365
        }; samesite=lax${location.protocol === "https:" ? "; secure" : ""}`;
        setLocaleState(urlLocale);
      }
    }
    // Apply dir to document
    document.documentElement.dir = locale === "fa" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
  }, []);

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
