import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // 1. Defina suas cores customizadas
      colors: {
        // Isso permite usar 'text-primary', 'border-primary', etc.
        primary: "rgb(var(--color-primary) / <alpha-value>)",

        // Isso permite usar 'bg-button', 'text-button-foreground', etc.
        button: {
          DEFAULT: "rgb(var(--color-button) / <alpha-value>)",
          foreground: "rgb(var(--color-button-foreground) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
