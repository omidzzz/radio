"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}

export default function TiltCard({
  children,
  className = "",
  maxTilt = 7,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0 → 1
    const y = (e.clientY - rect.top) / rect.height; // 0 → 1

    const tiltY = (x - 0.5) * maxTilt * 2;
    const tiltX = (0.5 - y) * maxTilt * 2;

    el.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`tilt-card ${className}`}
    >
      <div className="tilt-card-inner h-full w-full">{children}</div>
    </div>
  );
}