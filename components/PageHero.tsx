import React from "react";

interface PageHeroProps {
  /** Small pill badge above the title */
  badge?: string;
  /** Main hero heading */
  title: string;
  /** Subtitle under the heading */
  subtitle?: string;
  /** Right-side visual (emblem, illustration, …) */
  emblem?: React.ReactNode;
  /** Extra content under the subtitle (feature rows, meta, buttons, …) */
  children?: React.ReactNode;
  /** Optional breadcrumb / back-link row above the title */
  breadcrumb?: React.ReactNode;
}

/**
 * Shared inner-page hero.
 *
 * Design: clean dark medical-tech hero with soft ambient glows,
 * a subtle planning grid, diagonal beam accents, and a crisp
 * gradient energy line as the bottom divider (no clipped organic waves).
 */
export default function PageHero({
  badge,
  title,
  subtitle,
  emblem,
  children,
  breadcrumb,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-deep">
      {/* Soft ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-32 -top-24 h-[480px] w-[480px] rounded-full bg-primary/[0.14] blur-[140px]" />
        <div className="absolute -bottom-32 -left-24 h-[400px] w-[400px] rounded-full bg-secondary/[0.1] blur-[120px]" />
      </div>

      {/* Subtle treatment planning grid */}
      <div className="planning-grid pointer-events-none absolute inset-0 opacity-20" />

      {/* Diagonal beam accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[15%] top-0 h-[130%] w-px rotate-[12deg] bg-gradient-to-b from-primary/40 via-primary/10 to-transparent" />
        <div className="absolute right-[20%] top-0 h-[130%] w-px -rotate-[14deg] bg-gradient-to-b from-secondary/30 via-secondary/10 to-transparent" />
      </div>

      {/* Breadcrumb / back link row */}
      {breadcrumb && (
        <div className="relative mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          {breadcrumb}
        </div>
      )}

      {/* Main content */}
      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-12 px-4 pb-16 pt-16 text-center sm:px-6 lg:flex-row lg:justify-between lg:pb-20 lg:pt-20 lg:text-left rtl:lg:text-right">
        <div className="max-w-2xl">
          {badge && (
            <div className="inline-flex items-center gap-2.5 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-55" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="text-sm font-medium tracking-wide text-highlight">
                {badge}
              </span>
            </div>
          )}

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.2rem]">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300/90">
              {subtitle}
            </p>
          )}

          {children}
        </div>

        {emblem && <div className="shrink-0">{emblem}</div>}
      </div>

      {/* Bottom energy divider — clean gradient line */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 -bottom-1 h-3 bg-gradient-to-r from-transparent via-primary/15 to-transparent blur-md" />
    </section>
  );
}