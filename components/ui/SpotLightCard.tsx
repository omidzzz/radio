"use client";

import {
  useRef,
  useState,
  type ReactNode,
  type MouseEvent,
  type CSSProperties,
} from "react";

interface SpotLightCardProps {
  children: ReactNode;
  className?: string;
  /** Soft spotlight color. Defaults to a refined primary green. */
  spotlightColor?: string;
  /** Border radius. Defaults to your --radius-card token. */
  rounded?: string;
  /** Horizontally center content. Default: true */
  center?: boolean;
}

export default function SpotLightCard({
  children,
  className = "",
  spotlightColor,
  rounded = "var(--radius-card)",
  center = true,
}: SpotLightCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;

    if (
      window.matchMedia("(hover: none)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`spotlight-card group relative overflow-hidden ${className}`}
      style={
        {
          "--spot-color":
            spotlightColor ??
            "color-mix(in srgb, var(--color-primary) 18%, transparent)",
          borderRadius: rounded,
        } as CSSProperties
      }
    >
      {/* Soft brand spotlight */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 ease-[var(--ease-brand)]"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(
            620px circle at var(--spot-x, 50%) var(--spot-y, 50%),
            var(--spot-color),
            transparent 48%
          )`,
        }}
      />

      {/* Subtle inner gold-tinted edge on hover */}
      <div
        className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] transition-opacity duration-500 ease-[var(--ease-brand)]"
        style={{
          opacity: isHovered ? 1 : 0,
          boxShadow:
            "inset 0 0 0 1px color-mix(in srgb, var(--color-gold) 35%, transparent)",
        }}
      />

      {/* Content */}
      <div
        className={`relative z-10 h-full flex flex-col ${
          center ? "items-center text-center" : "items-start text-left"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
