import Link from "next/link";
import type { ReactNode } from "react";

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

/** Per-accent tokens — theme colors only so light/dark stay consistent. */
const accents = {
  primary: {
    iconBox: "border-primary/30 bg-soft text-primary",
    checkBadge: "border-primary/30 bg-soft text-primary",
    titleHover: "group-hover:text-primary",
    hoverBorder: "hover:border-primary/40",
  },
  secondary: {
    iconBox: "border-secondary/30 bg-soft text-secondary",
    checkBadge: "border-secondary/30 bg-soft text-secondary",
    titleHover: "group-hover:text-secondary",
    hoverBorder: "hover:border-secondary/40",
  },
} as const;

/**
 * Dossier service card — squared surface with a ghost ordinal, mono
 * checkmarks, and a ruled footer link. No spotlight, no energy bar.
 */
export default function ServiceCard({
  title,
  features,
  icon,
  index,
  numberLabel,
  ctaLabel,
  featured = false,
}: ServiceCardProps) {
  const accent = accents[index % 2 === 0 ? "primary" : "secondary"];

  return (
    <article className={featured ? "lg:col-span-2" : undefined}>
      <div
        className={`surface-card group relative flex h-full flex-col p-6 transition-colors duration-300 sm:p-8 ${accent.hoverBorder}`}
      >
        {/* Ghost ordinal number */}
        <span
          aria-hidden="true"
          className="mono tnum pointer-events-none absolute end-6 top-4 select-none text-5xl font-extrabold leading-none text-text-primary/[0.06] sm:end-8"
        >
          {numberLabel}
        </span>

        {/* Icon */}
        <div
          className={`relative flex h-16 w-16 items-center justify-center border ${accent.iconBox}`}
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
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border ${accent.checkBadge}`}
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
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface hover:text-highlight"
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