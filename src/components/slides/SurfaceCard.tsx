/**
 * SurfaceCard — theme-aware content block for slide backgrounds.
 *
 * A raised card that sits on top of the slide base layer. Uses theme tokens
 * so it flips automatically between light and dark modes:
 *   Light: ivory surface + soft hairline border + paper-like elevation
 *   Dark:  deep surface + glow hairline + dark elevation
 *
 * RTL-safe: no directional positioning inside; consumers place it with
 * logical classes (start/end) where needed.
 */
export default function SurfaceCard({
  children,
  className = "",
  padding = "p-6 sm:p-8",
  radius = "rounded-[var(--radius-panel)]",
  border = "border border-border",
  shadow = "shadow-[var(--elevation-card)]",
  hover = "hover:shadow-[var(--elevation-card-hover)] transition-shadow duration-300",
}: {
  children: React.ReactNode;
  className?: string;
  padding?: string;
  radius?: string;
  border?: string;
  shadow?: string;
  hover?: string;
}) {
  return (
    <section
      className={`bg-surface ${border} ${radius} ${shadow} ${hover} ${padding} ${className}`.trim()}
    >
      {children}
    </section>
  );
}
