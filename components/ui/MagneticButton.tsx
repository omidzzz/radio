"use client";

import { useRef, type ReactNode, type MouseEvent, type ElementType } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  as?: ElementType;
  href?: string;
  className?: string;
  strength?: number;
  [key: string]: unknown;
}

export default function MagneticButton({
  children,
  as: Tag = "span",
  href,
  className = "",
  strength = 0.25,
  ...rest
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement | null>(null);

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    // Touch devices have no hover — magnetic pull would feel stuck.
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    el.style.transition = "transform 0.15s ease-out";
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
    el.style.transform = "translate(0, 0)";
  };

  return (
    <Tag
      ref={ref as never}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}