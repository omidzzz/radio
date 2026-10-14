"use client";

import { useEffect, useRef, ReactNode } from "react";

/**
 * Wraps the hero section and adds `hero-anim-ready` after the preloader
 * finishes so entrance animations play in sequence rather than being
 * hidden behind the preloader overlay.
 */
export default function HeroEntrance({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Preloader runs ~900ms + 250ms hold + 500ms fade → trigger at ~1.2s
    const t = setTimeout(() => {
      ref.current?.classList.add("hero-anim-ready");
    }, 1200);

    // Respect reduced motion — show immediately
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      clearTimeout(t);
      ref.current?.classList.add("hero-anim-ready");
    }

    return () => clearTimeout(t);
  }, []);

  return (
    <div ref={ref} className="hero-entrance">
      {children}
    </div>
  );
}