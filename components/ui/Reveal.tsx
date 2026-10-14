"use client";

import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";

type RevealVariant = "up" | "left" | "right" | "scale";

interface RevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  /** ms — staggered via --reveal-delay */
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

const variantClass: Record<RevealVariant, string> = {
  up: "reveal",
  left: "reveal-from-left",
  right: "reveal-from-right",
  scale: "reveal-scale",
};

/**
 * Scroll-reveal wrapper — the single motion primitive for the whole site.
 *
 * Adds `.is-revealed` once (unobserves immediately) when the element scrolls
 * into view. Respects prefers-reduced-motion by revealing instantly. The CSS
 * classes live in globals.css and are fully gated by the global reduced-motion
 * block, so this stays the only place that owns reveal timing.
 */
export default function Reveal({
  children,
  variant = "up",
  delay = 0,
  className = "",
  style,
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-revealed");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("is-revealed");
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const combinedStyle: CSSProperties = {
    ...style,
    "--reveal-delay": `${delay}ms`,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      className={`${variantClass[variant]} ${className}`}
      style={combinedStyle}
    >
      {children}
    </div>
  );
}
