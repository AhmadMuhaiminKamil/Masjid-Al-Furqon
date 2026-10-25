import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          DEFAULT: "#0b3d2c",
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#1a7f4f",
          600: "#0f5132",
          700: "#0b3d2c",
          900: "#052016",
        },
        gold: {
          DEFAULT: "#c9a227",
          light: "#d4af37",
          dark: "#a8861f",
        },
        cream: "#f7f4ec",
        ink: "#1a1f1c",
        muted: "#6b746f",
        lines: "#e4e6e3",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
