"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface PowerOnGantryProps {
  children: ReactNode;
  className?: string;
}

export default function PowerOnGantry({ children, className = "" }: PowerOnGantryProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const powered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("powered-on");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !powered.current) {
            powered.current = true;
            el.classList.add("powered-on");
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`power-on-gantry ${className}`}>
      {children}
    </div>
  );
}
