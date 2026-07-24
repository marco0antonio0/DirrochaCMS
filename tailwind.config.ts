import {heroui} from '@heroui/theme';
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      screens: {
        'sm': { max: '639px' },
        // => @media (max-width: 639px) { ... }

        'md': { max: '767px' },
        // => @media (max-width: 767px) { ... }

        'lg': { max: '1023px' },
        // => @media (max-width: 1023px) { ... }

        'xl': { max: '1279px' },
        // => @media (max-width: 1279px) { ... }

        '2xl': { max: '1535px' },
        // => @media (max-width: 1535px) { ... }
        // =========================================================================================
        // =========================================================================================
        'smi': { min: '639px' },
        // => @media (min-width: 639px) { ... }

        'mdi': { min: '767px' },
        // => @media (min-width: 767px) { ... }

        'lgi': { min: '1023px' },
        // => @media (min-width: 1023px) { ... }

        'xil': { min: '1279px' },
        // => @media (min-width: 1279px) { ... }

        '2xli': { min: '1535px' },
        // => @media (min-width: 1535px) { ... }
      }
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};
export default config;
