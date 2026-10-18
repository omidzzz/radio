"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";

interface SpotLightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}

export default function SpotLightCard({
  children,
  className = "",
  spotlightColor = "rgba(26, 115, 82, 0.14)",
}: SpotLightCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    // Touch devices have no hover — skip style writes entirely.
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty("--spot-x", `${x}px`);
    el.style.setProperty("--spot-y", `${y}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`spotlight-card ${className}`}
      style={{ "--spot-color": spotlightColor } as React.CSSProperties}
    >
      {children}
    </div>
  );
}