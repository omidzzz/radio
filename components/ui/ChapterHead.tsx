import type { ReactNode } from "react";

interface ChapterHeadProps {
  /** Small mono index + label, e.g. index="01" label="Services" */
  index?: string;
  /** Eyebrow label rendered next to the index (defaults to nothing) */
  label?: string;
  /** Section heading — the display voice */
  title: string;
  /** Supporting lede under the heading */
  lede?: string;
  /** Center (default) or start-aligned */
  align?: "center" | "start";
  /** Heading level — defaults to h2. Inner pages use h1. */
  as?: "h1" | "h2" | "h3";
  /** "dark" renders the light-on-ink variant for dark bands */
  tone?: "light" | "dark";
  /**
   * "editorial" (default) keeps the original print-journal chapter opener.
   * "panel" switches to the console instrument-panel treatment: a mono
   * chapter index on the inline-start rule above an editorial title.
   */
  variant?: "editorial" | "panel";
  className?: string;
  /** Extra content under the lede (buttons, meta rows, …) */
  children?: ReactNode;
}

/**
 * The chapter opener — the single editorial "chapter header" used across
 * every page. A server component with zero runtime JS.
 *
 * Structure: a mono index + label rule, an oversized display title, a
 * lede, and a full-bleed hairline. One consistent print-journal rhythm.
 */
export default function ChapterHead({
  index,
  label,
  title,
  lede,
  align = "center",
  as: Heading = "h2",
  tone = "light",
  variant = "editorial",
  className = "",
  children,
}: ChapterHeadProps) {
  const isDark = tone === "dark";
  const centered = align === "center";

  // Console instrument-panel variant — a mono chapter index on a
  // start-edge rule, an editorial title, and an optional lede.
  if (variant === "panel") {
    return (
      <div className={`${centered ? "text-center" : ""} ${className}`}>
        <div className="panel-head">
          {(index || label) && (
            <span className="panel-head__idx">
              {index}
              {index && label && " — "}
              {label}
            </span>
          )}
          <Heading
            className={`type-section font-bold ${
              isDark ? "text-text-on-dark" : "text-text-primary"
            }`}
          >
            {title}
          </Heading>
          {lede && (
            <p
              className={`type-lede mt-4 max-w-2xl ${
                centered ? "mx-auto" : ""
              } text-text-secondary`}
            >
              {lede}
            </p>
          )}
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className={`${centered ? "text-center" : "text-start"} ${className}`}>
      {(index || label) && (
        <div
          className={`mono flex items-center text-[0.7rem] font-medium uppercase tracking-[0.22em] ${
            centered ? "justify-center" : "justify-start"
          } ${isDark ? "text-highlight" : "text-primary"}`}
        >
          {index && <span className="tnum">{index}</span>}
          {index && label && (
            <span
              aria-hidden="true"
              className={`mx-2 inline-block h-3 w-px ${
                isDark ? "bg-highlight/40" : "bg-primary/40"
              }`}
            />
          )}
          {label && <span>{label}</span>}
        </div>
      )}

      <Heading
        className={`type-section font-bold ${
          index || label ? "mt-4" : ""
        } ${isDark ? "text-text-on-dark" : "text-text-primary"}`}
      >
        {title}
      </Heading>

      {lede && (
        <p
          className={`type-lede mt-4 ${
            centered ? "mx-auto max-w-2xl" : "max-w-xl"
          } ${isDark ? "text-text-secondary" : "color-[var(--color-text-secondary)]"}`}
        >
          {lede}
        </p>
      )}

      {/* Full-bleed hairline that anchors each chapter */}
      <div
        aria-hidden="true"
        className={`mt-8 h-px w-full ${
          isDark ? "bg-[var(--color-rule-strong)]" : "bg-[var(--color-border)]"
        }`}
      />

      {children}
    </div>
  );
}
