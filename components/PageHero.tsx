import React from "react";
import { RadiationIcon } from "@/components/ui/icons";

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
 * Design: Clinical Dossier "case-file cover" — a deep band with a faint
 * planning grid and one oversized trefoil watermark, closed by a solid
 * rule. No glows, gradients, or animated accents.
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
    <section className="mod-page-hero mod-frame-casefile relative overflow-hidden bg-deep text-text-on-dark">
      {/* Faint planning grid + a single oversized trefoil watermark —
          dossier "case file cover", no glows or gradient energy lines. */}
      <div className="planning-grid pointer-events-none absolute inset-0 opacity-[0.12]" />

      <div className="pointer-events-none absolute -end-24 -top-28 hidden opacity-[0.05] lg:block">
        <RadiationIcon className="h-72 w-72 text-highlight" />
      </div>

      {/* DICOM frame annotations — corners of the case-file viewport */}
      <span className="annot top-3 left-3 hidden sm:block">
        {badge ? badge.toUpperCase() : "CASE FILE"} · SR
      </span>
      <span className="annot top-3 right-3 hidden sm:block">FOV: 256</span>
      <span className="annot bottom-3 left-3 hidden sm:block">
        SE: 01 / IM: 01
      </span>
      <span className="annot bottom-3 right-3 hidden sm:block">
        TE: 80 MS · TR: 600
      </span>

      {/* Top hairline + bottom scale rule */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[var(--color-rule-strong)]"
      />
      <div className="scale-rule pointer-events-none absolute inset-x-0 bottom-0 opacity-70" aria-hidden="true" />

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
            <span className="chip chip-ghost mono">
              <span
                aria-hidden="true"
                className="inline-block h-1.5 w-1.5 bg-primary"
              />
              {badge}
            </span>
          )}

          <h1 className="type-h1 mt-5 font-bold text-text-on-dark">
            {title}
          </h1>

          {subtitle && (
            <p className="section-lead mt-5 max-w-xl text-text-secondary">
              {subtitle}
            </p>
          )}

          {children}
        </div>

        {emblem && <div className="shrink-0">{emblem}</div>}
      </div>
    </section>
  );
}