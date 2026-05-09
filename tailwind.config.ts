import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#15231f",
        moss: "#17483f",
        jade: "#0d766c",
        brass: "#b5863b",
        pearl: "#f7f2e8",
        porcelain: "#fbfaf6",
        smoke: "#e6e0d4",
        graphite: "#293532"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(21, 35, 31, 0.12)",
        insetSoft: "inset 0 1px 0 rgba(255,255,255,0.55)"
      },
      fontFamily: {
        display: ["Aptos Display", "Manrope", "Trebuchet MS", "sans-serif"],
        body: ["Aptos", "Manrope", "Segoe UI", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
