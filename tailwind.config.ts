import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#06b6d4", hover: "#22d3ee" },
        highlight: "#22d3ee",
        soft: "#ecfeff",
        deep: "#020617",
        secondary: { DEFAULT: "#14b8a6", hover: "#5eead4" },
      },
      fontFamily: {
        vazir: ["var(--font-vazir)", "system-ui", "sans-serif"],
        outfit: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;