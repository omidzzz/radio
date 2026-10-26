"use client";

import { useState } from "react";
import { featureSvgs } from "./FeatureIcons";
import type { Feature } from "./Features";

interface FeatureCardProps {
  feature: Feature;
  accent: 0 | 1 | 2;
  isFa: boolean;
}

/**
 * Per-card accent tokens. Only theme colors so both light and dark modes
 * stay consistent (no hardcoded rgba shadows).
 */
const accentStyles = [
  {
    gradient: "from-primary/15 via-primary/10 to-secondary/10",
    glow: "shadow-primary/15",
  },
  {
    gradient: "from-secondary/15 via-secondary/10 to-primary/10",
    glow: "shadow-secondary/15",
  },
  {
    gradient: "from-gold/15 via-gold/10 to-primary/10",
    glow: "shadow-primary/10",
  },
];

export default function FeatureCard({
  feature,
  accent,
  isFa,
}: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const style = accentStyles[accent];

  return (
    <div
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cursor spotlight — follows the pointer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-500 opacity-0 group-hover:opacity-100"
        style={{
          background: `radial-gradient(360px circle at var(--spot-x, 50%) var(--spot-y, 50%), ${style.glow}, transparent 55%)`,
        }}
      />

      {/* Gold-tinted edge on hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-500 opacity-0 group-hover:opacity-100"
        style={{
          background: "inset 0 0 0 1px color-mix(in srgb, var(--color-gold) 25%, transparent)",
        }}
      />

      <div className="relative z-10 flex h-full flex-col p-5 sm:p-6 lg:p-7">
        {/* Modality code badge */}
        <div className="flex items-center gap-2.5">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            {feature.code}
          </span>
          <span className="text-xs text-muted">
            {isFa ? "تکنولوژی" : "Technology"}
          </span>
        </div>

        {/* Icon in a soft gradient tile that lifts on hover */}
        <div
          className={`relative mx-auto mt-5 flex h-18 w-18 items-center justify-center rounded-2xl bg-gradient-to-br text-primary shadow-lg shadow-primary/15 transition-all duration-500 group-hover:-translate-y-1 group-hover:scale-105 group-hover:${style.glow} ${style.gradient}`}
        >
          {featureSvgs[feature.code as keyof typeof featureSvgs]}
        </div>

        <h3 className="relative mt-4.5 text-base font-semibold leading-snug text-text-primary transition-colors duration-300 group-hover:text-primary">
          {feature.title}
        </h3>

        <p className="relative mt-2.5 text-sm leading-relaxed text-text-secondary">
          {feature.desc}
        </p>

        {/* Bottom gold rule that sweeps in on hover */}
        <div className="relative mt-5 h-px w-full bg-gradient-to-r from-transparent via-gold to-transparent opacity-50 transition-all duration-500 group-hover:opacity-100" />
      </div>
    </div>
  );
}
