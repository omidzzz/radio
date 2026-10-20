import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#145c41", hover: "#1a7352" },
        highlight: "#82621f",
        gold: "#c9a24b",
        goldSoft: "#f3e4ac",
        soft: "#efeadb",
        deep: "#0b2e22",
        secondary: { DEFAULT: "#2e7d5b", hover: "#3e9a74" },
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