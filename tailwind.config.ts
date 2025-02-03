import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      screens: {
        'sm': { max: '639px' },
        // => @media (max-width: 639px) { ... }

        'md': { max: '767px' },
        // => @media (max-width: 767px) { ... }

        'lg': { max: '1023px' },
        // => @media (max-width: 1023px) { ... }

        'lgi': { min: '1023px' },
        // => @media (max-width: 1023px) { ... }

        'xl': { max: '1279px' },
        // => @media (max-width: 1279px) { ... }

        '2xl': { max: '1535px' },
        // => @media (max-width: 1535px) { ... }
      }
    },
  },
  plugins: [],
};
export default config;
