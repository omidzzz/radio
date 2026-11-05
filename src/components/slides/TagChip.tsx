/**
 * TagChip — small rounded semantic tag for slide corners.
 *
 * Theme-aware fill and border. Default sits in the top-start corner but
 * consumers override with absolute positioning classes.
 *
 * Variants:
 *   "gold"   — warm gold accent (light: bg-gold/15, dark: bg-gold/20)
 *   "primary" — forest green accent (light: bg-primary/10, dark: bg-primary/20)
 *   "surface" — subtle surface tint (light: bg-surface, dark: bg-surface)
 */
interface TagChipProps {
  children: React.ReactNode;
  variant?: "gold" | "primary" | "surface";
  className?: string;
  size?: "sm" | "md" | "lg";
}

const VARIANT_CLASSES: Record<string, string> = {
  gold: "bg-gold/15 dark:bg-gold/20 border border-gold/30 dark:border-gold/40 text-deep dark:text-highlight",
  primary: "bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 text-primary dark:text-primary",
  surface: "bg-surface/80 dark:bg-surface/80 border border-border text-text-primary dark:text-text-primary",
};

const SIZE_CLASSES: Record<string, string> = {
  sm: "px-2 py-0.5 text-[10px] leading-none",
  md: "px-3 py-1 text-[11px] leading-none",
  lg: "px-4 py-1.5 text-sm leading-none",
};

export default function TagChip({
  children,
  variant = "gold",
  className = "",
  size = "md",
}: TagChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 ${VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.gold} rounded-full ${SIZE_CLASSES[size]} font-mono font-medium ${className}`.trim()}
    >
      {children}
    </span>
  );
}
