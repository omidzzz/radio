export type ThemeMode = "light" | "dark";

export interface ThemePalette {
  deep: string;
  bg: string;
  surface: string;
  primary: string;
  "primary-hover": string;
  highlight: string;
  gold: string;
  goldSoft: string;
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
    deep: "#0b2e22",
    bg: "#f8f5ee",
    surface: "#fffdf9",
    primary: "#145c41",
    "primary-hover": "#1a7352",
    highlight: "#82621f",
    gold: "#c9a24b",
    goldSoft: "#e9d4a3",
    soft: "#efeadb",
    "text-primary": "#16281f",
    "text-secondary": "#3d5248",
    "text-on-dark": "#fffbf2",
    muted: "#5d6f65",
    border: "#ddd2b8",
    success: "#16a34a",
    secondary: "#2e7d5b",
    "secondary-hover": "#3e9a74",
    "blog-dark": "#07211a",
  },
  dark: {
    deep: "#04120d",
    bg: "#071a13",
    surface: "#0e2a1f",
    primary: "#3dbe8b",
    "primary-hover": "#5fd3a6",
    highlight: "#e3c67e",
    gold: "#d9b967",
    goldSoft: "#2b2413",
    soft: "#0f2c21",
    "text-primary": "#eaf3ee",
    "text-secondary": "#a4bcb0",
    "text-on-dark": "#fffbf2",
    muted: "#7e9689",
    border: "#234434",
    success: "#3dbe8b",
    secondary: "#2dd4bf",
    "secondary-hover": "#7bc9a9",
    "blog-dark": "#07211a",
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
    heroHex: ["#145c41", "#3e9a74", "#c9a24b"],
    bg: "from-bg via-surface to-soft",
    bgHex: ["#ffffff", "#ffffff", "#efeadb"],
  },
  shadows: {
    glow: "shadow-primary/20",
    glowStrong: "shadow-primary/70",
  },
} as const;

export type Theme = typeof theme;