import { useId } from "react";

interface MorphingBlobProps {
  /** Color of the blob (any CSS color value) */
  color?: string;
  /** Secondary color for gradient effect */
  colorSecondary?: string;
  /** Size (width and height) — single value for square */
  size?: number;
  /** Blur amount in pixels */
  blur?: number;
  /** Animation speed variant */
  speed?: "slow" | "medium" | "fast";
  /** Additional className for positioning */
  className?: string;
  /** Opacity of the blob */
  opacity?: number;
  /** Enable gradient overlay */
  gradient?: boolean;
}

/**
 * Premium morphing organic blob — multi-layer with gradient effects.
 * Features subtle glow, depth, and sophisticated color transitions.
 * Pure CSS animation, GPU-accelerated.
 * Respects prefers-reduced-motion.
 */
export default function MorphingBlob({
  color = "rgba(26, 115, 82, 0.06)",
  colorSecondary = "rgba(46, 125, 91, 0.04)",
  size = 300,
  blur = 80,
  speed = "slow",
  className = "",
  opacity = 1,
  gradient = true,
}: MorphingBlobProps) {
  const uniqueId = useId().replace(/:/g, "");

  return (
    <div className={`relative ${className}`} aria-hidden="true">
      {/* Primary morphing layer */}
      <div
        className={`morphing-blob ${speed === "fast" ? "morphing-blob-fast" : speed === "medium" ? "morphing-blob-medium" : ""}`}
        style={{
          width: size,
          height: size,
          background: gradient
            ? `radial-gradient(ellipse at 30% 30%, ${color}, ${colorSecondary})`
            : color,
          filter: `blur(${blur}px)`,
          opacity,
        }}
      />
      {/* Secondary depth layer — offset and smaller */}
      <div
        className={`morphing-blob ${speed === "fast" ? "morphing-blob-fast" : speed === "medium" ? "morphing-blob-medium" : ""} absolute`}
        style={{
          width: size * 0.6,
          height: size * 0.6,
          top: "20%",
          left: "20%",
          background: `radial-gradient(ellipse at 70% 70%, ${colorSecondary}, transparent)`,
          filter: `blur(${blur * 0.7}px)`,
          opacity: opacity * 0.7,
          animationDelay: "-7s",
        }}
      />
      {/* Subtle glow accent */}
      <div
        className="morphing-blob absolute"
        style={{
          width: size * 0.3,
          height: size * 0.3,
          top: "40%",
          left: "40%",
          background: `radial-gradient(circle, ${color}, transparent)`,
          filter: `blur(${blur * 0.5}px)`,
          opacity: opacity * 0.5,
          animationDelay: "-3s",
        }}
      />
    </div>
  );
}
