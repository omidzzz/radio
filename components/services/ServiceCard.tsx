"use client";

import Link from "next/link";
import { useRef, type MouseEvent, type ReactNode } from "react";

export type CardAccent = "primary" | "secondary";

interface ServiceCardProps {
  title: string;
  features: string[];
  icon: ReactNode;
  /** Zero-based position in the grid — drives accent rotation */
  index: number;
  /** Pre-formatted ordinal label (e.g. "۰۱" / "01") shown as a ghost number */
  numberLabel: string;
  ctaLabel: string;
  featured?: boolean;
}

/**
 * Per-accent styling tokens. Only theme colors are used so light/dark
 * themes stay consistent (no hardcoded rgba shadows).
 */
const accents: Record<
  CardAccent,
  {
    iconBox: string;
    iconHoverShadow: string;
    titleHover: string;
    checkBadge: string;
    cornerGlow: string;
    barGradient: string;
    spotlightColor: string;
    hoverBorder: string;
  }
> = {
  primary: {
    iconBox:
      "bg-gradient-to-br from-primary/20 to-secondary/10 text-primary ring-primary/25 group-hover:from-primary group-hover:to-secondary group-hover:text-white",
    iconHoverShadow: "group-hover:shadow-primary/40",
    titleHover: "group-hover:text-primary",
    checkBadge: "bg-soft text-primary ring-primary/20",
    cornerGlow: "bg-primary/15",
    barGradient: "from-primary via-[#c9a24b] to-secondary",
    spotlightColor: "rgba(26,115,82,0.08)",
    hoverBorder: "hover:border-primary/40",
  },
  secondary: {
    iconBox:
      "bg-gradient-to-br from-secondary/20 to-primary/10 text-secondary ring-secondary/25 group-hover:from-secondary group-hover:to-primary group-hover:text-white",
    iconHoverShadow: "group-hover:shadow-secondary/40",
    titleHover: "group-hover:text-secondary",
    checkBadge: "bg-soft text-secondary ring-secondary/20",
    cornerGlow: "bg-secondary/15",
    barGradient: "from-secondary via-gold to-primary",
    spotlightColor: "rgba(201,162,75,0.12)",
    hoverBorder: "hover:border-secondary/40",
  },
};

export default function ServiceCard({
  title,
  features,
  icon,
  index,
  numberLabel,
  ctaLabel,
  featured = false,
}: ServiceCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const accent = accents[index % 2 === 0 ? "primary" : "secondary"];

  /** Spotlight follows the cursor via CSS variables — no re-render */
  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  return (
    <article className={featured ? "lg:col-span-2" : undefined}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className={`group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border bg-surface p-6 shadow-sm transition-all duration-500 hover:-translate-y-2.5 hover:shadow-xl sm:p-8 ${accent.hoverBorder}`}
      >
        {/* Cursor spotlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(280px circle at var(--mx, 50%) var(--my, 50%), ${accent.spotlightColor}, transparent 70%)`,
          }}
        />

        {/* Energy bar — transparent at rest, gradient sweep on hover */}
        <div className="absolute inset-x-0 top-0 h-1.5 overflow-hidden">
          <div
            className={`absolute inset-0 bg-gradient-to-r ${accent.barGradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
          />
          <div className="absolute inset-y-0 left-0 w-0 bg-white/30 transition-all duration-700 group-hover:w-2/5 rtl:right-0 rtl:left-auto" />
        </div>

        {/* Soft corner glow on hover */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full ${accent.cornerGlow} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`}
        />

        {/* Ghost ordinal number */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute end-6 top-4 select-none text-5xl font-extrabold leading-none text-text-primary/[0.06] transition-colors duration-500 group-hover:text-primary/10 sm:end-8"
        >
          {numberLabel}
        </span>

        {/* Icon */}
        <div
          className={`relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ring-1 shadow-lg shadow-primary/10 transition-all duration-500 ${accent.iconBox} ${accent.iconHoverShadow}`}
        >
          {icon}
        </div>

        {/* min-height reserves two title lines so cards in a row stay aligned */}
        <h2
          className={`mt-6 min-h-[3.5rem] text-xl font-semibold leading-snug text-text-primary transition-colors duration-300 ${accent.titleHover}`}
        >
          {title}
        </h2>

        <ul className="mt-6 flex-1 space-y-2.5">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2.5 text-sm text-text-secondary"
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-1 ${accent.checkBadge}`}
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                  className="h-3 w-3"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path
                    d="M3.5 8.5l3 3 6-6.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 border-t border-border pt-5">
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-primary outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface hover:text-primary-hover"
          >
            <span>{ctaLabel}</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="h-4 w-4 rtl:-scale-x-100"
              stroke="currentColor"
              strokeWidth={2.2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}