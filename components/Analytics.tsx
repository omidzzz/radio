"use client";

import { useEffect } from "react";

/**
 * Analytics component - supports Google Analytics 4, Plausible, and Umami.
 * Configure via environment variables:
 * - NEXT_PUBLIC_GA_ID: Google Analytics 4 Measurement ID (G-XXXXXXX)
 * - NEXT_PUBLIC_PLAUSIBLE_DOMAIN: Plausible Analytics domain
 * - NEXT_PUBLIC_UMAMI_WEBSITE_ID: Umami Analytics website ID
 * - NEXT_PUBLIC_UMAMI_URL: Umami Analytics script URL
 *
 * Scripts are injected lazily via requestIdleCallback (or a timeout fallback)
 * so they never block the main thread during initial render/hydration.
 */
export default function Analytics() {
  useEffect(() => {
    const inject = () => {
      // Google Analytics 4
      const gaId = process.env.NEXT_PUBLIC_GA_ID;
      if (gaId) {
        const script = document.createElement("script");
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(script);

        const w = window as unknown as { dataLayer: unknown[] };
        w.dataLayer = w.dataLayer || [];
        function gtag(...args: unknown[]) {
          w.dataLayer.push(args);
        }
        gtag("js", new Date());
        gtag("config", gaId);
      }

      // Plausible Analytics
      const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
      if (plausibleDomain) {
        const script = document.createElement("script");
        script.defer = true;
        script.src = "https://plausible.io/js/script.js";
        script.setAttribute("data-domain", plausibleDomain);
        document.head.appendChild(script);
      }

      // Umami Analytics
      const umamiId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
      const umamiUrl = process.env.NEXT_PUBLIC_UMAMI_URL;
      if (umamiId && umamiUrl) {
        const script = document.createElement("script");
        script.defer = true;
        script.src = umamiUrl;
        script.setAttribute("data-website-id", umamiId);
        document.head.appendChild(script);
      }
    };

    // Defer analytics until the browser is idle (after first paint/hydration).
    // Fall back to a short timeout if requestIdleCallback is unavailable.
    if ("requestIdleCallback" in window) {
      const id = (window as unknown as {
        requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number;
      }).requestIdleCallback(inject, { timeout: 2000 });
      return () => {
        (window as unknown as {
          cancelIdleCallback: (id: number) => void;
        }).cancelIdleCallback(id);
      };
    }

    const timeoutId = globalThis.setTimeout(inject, 1000);
    return () => globalThis.clearTimeout(timeoutId);
  }, []);

  return null;
}
