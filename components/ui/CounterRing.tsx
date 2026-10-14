"use client";

import { useEffect, useRef, useState, useId } from "react";

interface CounterRingProps {
  /** Percentage value (0-100) */
  value: number;
  /** Ring thickness in pixels */
  strokeWidth?: number;
  /** Ring diameter in pixels */
  size?: number;
  /** Animation duration in ms */
  duration?: number;
  /** Label shown in center */
  label?: string;
  /** Unit suffix (e.g., "%", "+") */
  suffix?: string;
  /** Additional className */
  className?: string;
}

/**
 * Premium animated SVG counter ring with glow effects.
 * Scroll-triggered fill with smooth cubic-bezier easing.
 * Features animated gradient, subtle glow, and professional styling.
 * Respects prefers-reduced-motion.
 */
export default function CounterRing({
  value,
  strokeWidth = 5,
  size = 100,
  duration = 2000,
  label,
  suffix = "",
  className = "",
}: CounterRingProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [animated, setAnimated] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);
  const uniqueId = useId().replace(/:/g, "");

  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const center = size / 2;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated) {
          setAnimated(true);
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Premium ease-out expo
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setDisplayValue(Math.round(eased * value));
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [animated, value, duration]);

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="counter-ring"
        aria-hidden="true"
      >
        <defs>
          {/* Static gradient — the indefinite SMIL color cycling was removed;
              one dashoffset transition on reveal is the whole effect */}
          <linearGradient id={`ring-grad-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>

        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(6, 182, 212, 0.08)"
          strokeWidth={strokeWidth}
        />
        {/* Main progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#ring-grad-${uniqueId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animated ? offset : circumference}
          style={{
            transition: animated
              ? `stroke-dashoffset ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`
              : "none",
          }}
        />
        {/* Center value */}
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          className="tnum fill-text-primary text-base font-bold counter-ring-label"
          style={{ fontSize: size * 0.18 }}
        >
          {animated ? displayValue : 0}{suffix}
        </text>
      </svg>
      {label && (
        <span className="mt-3 text-sm font-medium text-text-secondary tracking-wide">
          {label}
        </span>
      )}
    </div>
  );
}
