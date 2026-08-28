import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Geist", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        surface: {
          DEFAULT: "#131315",
          dim: "#131315",
          variant: "#353437",
          high: "#2a2a2c",
          lowest: "#0e0e10",
          card: "#09090B",
        },
        border: {
          highlight: "#27272A",
          hover: "#A1A1AA",
        },
        text: {
          muted: "#656467",
          variant: "#c4c7c8",
        }
      },
    },
  },
  plugins: [],
};

export default config;
