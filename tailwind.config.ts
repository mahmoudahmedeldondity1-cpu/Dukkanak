import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fef6ee",
          100: "#fce9d5",
          400: "#f0924a",
          500: "#e8752c",
          600: "#d65d1c",
          700: "#b04616",
          900: "#5c2409",
        },
        ink: "#1a1a1a",
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
      },
    },
  },
  plugins: [],
};

export default config;
