"use client";

import { useEffect } from "react";
import { logger } from "@/lib/core/logger";

/**
 * Registers the service worker in production only.
 * Dev is excluded so HMR and cache-busting are never interfered with.
 */
export default function PWARegister() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      typeof window === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        logger.warn("Service worker registration failed", { error: error });
      });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}