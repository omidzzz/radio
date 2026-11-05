"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { flushSync } from "react-dom";

export type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

const STORAGE_KEY = "radiotherapy-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  // Apply the theme to <html data-theme="..."> on mount and whenever it changes.
  useEffect(() => {
    const resolved = getInitialTheme();
    setThemeState(resolved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (next: Theme) => setThemeState(next);

  /**
   * Theme switch.
   *
   * Where the View Transitions API is available the whole palette
   * cross-fades in 220ms (see ::view-transition-* rules in globals.css);
   * everywhere else — and for reduced-motion users — it swaps instantly.
   * The document-level transition runs on the compositor, so it costs
   * nothing on the main thread.
   */
  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    const apply = () => setThemeState(next);

    const doc = document as Document & {
      startViewTransition?: (callback: () => void) => unknown;
    };

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (typeof doc.startViewTransition !== "function" || reduceMotion) {
      apply();
      return;
    }

    // flushSync so the data-theme attribute is written inside the
    // transition callback — otherwise the snapshot misses the change.
    doc.startViewTransition(() => {
      flushSync(apply);
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}