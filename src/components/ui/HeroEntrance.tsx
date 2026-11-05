"use client";

import { useEffect, useRef, ReactNode } from "react";

/**
 * Wraps the hero section and adds `hero-anim-ready` so entrance animations
 * play. Triggering immediately (instead of waiting for a preloader that is
 * not mounted) keeps the hero text visible for LCP.
 */
export default function HeroEntrance({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Respect reduced motion — show immediately
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.classList.add("hero-anim-ready");
      return;
    }

    // Play entrance animations on the next frame so the initial paint
    // (and LCP candidate) is not blocked by a long delay.
    const id = requestAnimationFrame(() => {
      node.classList.add("hero-anim-ready");
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div ref={ref} className="hero-entrance">
      {children}
    </div>
  );
}