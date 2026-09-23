import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#351B2B",
        paper: "#F9F2E9",
        accent: "#351B2B",
        rose: "#EF99AC",
        citron: "#D8E96B",
        glow: "#D8E96B"
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};

export default config;
