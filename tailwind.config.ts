import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#6e1e2e", hover: "#571725" },
        highlight: "#9a3149",
        soft: "#dcdad7",
        deep: "#1d1a1b",
        secondary: { DEFAULT: "#5c6067", hover: "#494d53" },
      },
      fontFamily: {
        vazir: ["var(--font-vazir)", "system-ui", "sans-serif"],
        outfit: ["var(--font-instrument)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;