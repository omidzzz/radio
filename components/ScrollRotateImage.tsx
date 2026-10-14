"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface ScrollRotateImageProps {
  src: string;
  alt: string;
  side?: "left" | "right";
  className?: string;
}

export default function ScrollRotateImage({
  src,
  alt,
  side = "left",
  className = "",
}: ScrollRotateImageProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [visible, setVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced-motion users: show immediately, no animation
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hidden =
    side === "left"
      ? "-translate-x-28 -rotate-[18deg] opacity-0"
      : "translate-x-28 rotate-[18deg] opacity-0";

  // Hover state: subtle zoom + rotation, GPU-accelerated
  const hoverTransform = isHovered ? "scale-110 rotate-3" : "scale-100 rotate-0";

  return (
    <Image
      ref={ref}
      src={src}
      alt={alt}
      width={280}
      height={280}
      placeholder="blur"
      blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyODAiIGhlaWdodD0iMjgwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTNlOGVjIi8+PC9zdmc+"
      className={`transition-[transform,opacity] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform will-change-opacity ${
        visible ? "translate-x-0 rotate-0 opacity-100" : hidden
      } ${hoverTransform} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    />
  );
}