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
        brand: "#000000",
      },
      fontFamily: {
        jakarta: ["var(--font-jakarta)", '"Plus Jakarta Sans"', "sans-serif"],
        serif: ["var(--font-serif)", "Playfair Display", "serif"],
        citadel: ["var(--font-citadel)", "Great Vibes", "cursive"],
      },
    },
  },
  plugins: [],
};
export default config;
