"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  startTransition,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // Apply dir to document on locale change
  useEffect(() => {
    document.documentElement.dir = locale === "fa" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    // Write the cookie client-side FIRST so the router refresh below
    // already carries the new locale. This removes the POST round-trip
    // that used to block the UI (two sequential network waits → one
    // immediate refresh). The cookie is not httpOnly — both the
    // middleware and /api/locale set it JS-readably.
    document.cookie = `${LOCALE_COOKIE}=${newLocale}; path=/; max-age=${
      60 * 60 * 24 * 365
    }; samesite=lax${location.protocol === "https:" ? "; secure" : ""}`;
    const cookieApplied = document.cookie.includes(
      `${LOCALE_COOKIE}=${newLocale}`,
    );

    // Batch the dir/lang flip with the refresh in one transition so the
    // screen swaps once, atomically, when the new content is ready —
    // instead of flipping direction first and jumping again on update.
    const apply = () => {
      setLocaleState(newLocale);
      router.refresh();
    };

    if (cookieApplied) {
      startTransition(apply);
      return;
    }

    // Legacy fallback: an older httpOnly cookie can't be overwritten
    // from JS — wait for the API to rotate it (now JS-writable too),
    // then apply. Only this first switch pays the round-trip.
    void (async () => {
      try {
        await fetch("/api/locale", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale: newLocale }),
        });
      } catch {
        // Ignore errors — locale is still applied client-side
      }
      startTransition(apply);
    })();
  };

  const dir = locale === "fa" ? "rtl" : "ltr";

  return (
    <LocaleContext.Provider value={{ locale, dir, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}
