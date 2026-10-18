import type { ReactNode } from "react";

interface SectionHeaderProps {
  /** Small uppercase pill above the title (omitted when not provided) */
  eyebrow?: string;
  /** Section heading */
  title: string;
  /** Supporting copy under the heading */
  subtitle?: string;
  /** Center (default) or start-aligned */
  align?: "center" | "start";
  /** "dark" renders the light-on-deep variant for dark bands */
  tone?: "light" | "dark";
  /** Heading level — defaults to h2. Blog/services index pages use h1. */
  as?: "h1" | "h2" | "h3";
  className?: string;
  /** Show the thin gold rule under the heading (visit-card motif) */
  goldRule?: boolean;
  /** Extra content under the subtitle (buttons, meta rows, …) */
  children?: ReactNode;
}

/**
 * Shared section header — eyebrow pill + fluid heading + lede.
 *
 * Server component, zero runtime JS. Using it everywhere keeps the
 * vertical rhythm and type scale identical across pages, and makes a
 * global restyle a one-file change.
 */
export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
  tone = "light",
  as: Heading = "h2",
  className = "",
  goldRule = false,
  children,
}: SectionHeaderProps) {
  const isDark = tone === "dark";
  const centered = align === "center";

  return (
    <div className={`${centered ? "text-center" : "text-start"} ${className}`}>
      {eyebrow && (
        <span className={isDark ? "eyebrow eyebrow-on-dark" : "eyebrow"}>
          {eyebrow}
        </span>
      )}

      <Heading
        className={`type-section font-extrabold ${
          eyebrow ? "mt-4" : ""
        } ${isDark ? "text-white" : "text-text-primary"}`}
      >
        {title}
      </Heading>

      {goldRule && (
        <span
          aria-hidden="true"
          className={`gold-rule mt-5 ${centered ? "mx-auto" : ""}`}
        />
      )}

      {subtitle && (
        <p
          className={`type-lede mt-4 ${
            centered ? "mx-auto max-w-2xl" : "max-w-xl"
          } ${isDark ? "text-muted" : "text-text-secondary"}`}
        >
          {subtitle}
        </p>
      )}

      {children}
    </div>
  );
}
