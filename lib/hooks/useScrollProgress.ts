"use client";

import { useEffect, useRef } from "react";

export interface ScrollProgressInfo {
  /** Current vertical scroll position in pixels */
  scrollTop: number;
  /** Page scroll progress clamped to [0, 1] */
  progress: number;
}

/**
 * Shared rAF-throttled scroll/resize listener that reports page
 * scroll progress.
 *
 * Performance notes:
 * - At most one update per animation frame (rAF-throttled).
 * - The callback is invoked outside React's render cycle — write to
 *   the DOM via refs inside it; avoid calling setState per frame.
 * - The latest callback is always used (stored in a ref), so the
 *   effect never needs to re-subscribe.
 */
export function useScrollProgress(callback: (info: ScrollProgressInfo) => void) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    let rafId = 0;

    const update = () => {
      rafId = 0;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        docHeight > 0
          ? Math.min(1, Math.max(0, window.scrollY / docHeight))
          : 0;
      cbRef.current({ scrollTop: window.scrollY, progress });
    };

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
}