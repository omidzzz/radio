export type ThemeMode = "light" | "dark";

export interface ThemePalette {
  deep: string;
  bg: string;
  surface: string;
  primary: string;
  "primary-hover": string;
  highlight: string;
  soft: string;
  "text-primary": string;
  "text-secondary": string;
  "text-on-dark": string;
  muted: string;
  border: string;
  success: string;
  secondary: string;
  "secondary-hover": string;
  "blog-dark": string;
}

/**
 * Central theme palette definitions.
 *
 * These hex values are the single source of truth for both the
 * CSS custom properties in `app/globals.css` and the Tailwind
 * utility classes. To change a theme's color palette, edit the
 * hex values here (and keep `app/globals.css` in sync).
 */
export const themePalettes: Record<ThemeMode, ThemePalette> = {
  light: {
    deep: "#020617",
    bg: "#ffffff",
    surface: "#ffffff",
    primary: "#06b6d4",
    "primary-hover": "#22d3ee",
    highlight: "#22d3ee",
    soft: "#ecfeff",
    "text-primary": "#0f172a",
    "text-secondary": "#475569",
    "text-on-dark": "#ffffff",
    muted: "#94a3b8",
    border: "#e2e8f0",
    success: "#67e8f9",
    secondary: "#14b8a6",
    "secondary-hover": "#5eead4",
    "blog-dark": "#05040f",
  },
  dark: {
    deep: "#020617",
    bg: "#0b1120",
    surface: "#111a2e",
    primary: "#22d3ee",
    "primary-hover": "#67e8f9",
    highlight: "#67e8f9",
    soft: "#0f1a2e",
    "text-primary": "#f1f5f9",
    "text-secondary": "#94a3b8",
    "text-on-dark": "#ffffff",
    muted: "#64748b",
    border: "#1e293b",
    success: "#22d3ee",
    secondary: "#2dd4bf",
    "secondary-hover": "#5eead4",
    "blog-dark": "#05040f",
  },
};

/**
 * Tailwind class-name tokens for use in `className` strings.
 * These map to the CSS custom properties defined in globals.css.
 */
export const theme = {
  colors: {
    deep: "deep",
    deepHex: themePalettes.light.deep,
    bg: "bg",
    bgHex: themePalettes.light.bg,
    surface: "surface",
    surfaceHex: themePalettes.light.surface,
    primary: "primary",
    primaryHex: themePalettes.light.primary,
    "primary-hover": "primary-hover",
    "primary-hoverHex": themePalettes.light["primary-hover"],
    highlight: "highlight",
    highlightHex: themePalettes.light.highlight,
    soft: "soft",
    softHex: themePalettes.light.soft,
    "text-primary": "text-primary",
    "text-primaryHex": themePalettes.light["text-primary"],
    "text-secondary": "text-secondary",
    "text-secondaryHex": themePalettes.light["text-secondary"],
    "text-on-dark": "text-on-dark",
    "text-on-darkHex": themePalettes.light["text-on-dark"],
    muted: "muted",
    mutedHex: themePalettes.light.muted,
    border: "border",
    borderHex: themePalettes.light.border,
    success: "success",
    successHex: themePalettes.light.success,
    secondary: "secondary",
    secondaryHex: themePalettes.light.secondary,
    "secondary-hover": "secondary-hover",
    "secondary-hoverHex": themePalettes.light["secondary-hover"],
    "blog-dark": "blog-dark",
    "blog-darkHex": themePalettes.light["blog-dark"],
  },
  gradients: {
    hero: "from-primary via-secondary-hover to-primary",
    heroHex: ["#22d3ee", "#5eead4", "#a5f3fc"],
    bg: "from-bg via-surface to-soft",
    bgHex: ["#ffffff", "#ffffff", "#ecfeff"],
  },
  shadows: {
    glow: "shadow-primary/20",
    glowStrong: "shadow-primary/70",
  },
} as const;

export type Theme = typeof theme;