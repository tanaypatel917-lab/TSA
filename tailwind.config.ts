import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        paper: "#f4f1ea",
        line: "#d9d4c7",
        accent: "#c0300a",
        lime: "#c8f560",
        dark: "#141414"
      },
      fontFamily: {
        display: ["Instrument Serif", "Georgia", "serif"],
        sans: ["Inter Tight Variable", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono Variable", "ui-monospace", "monospace"]
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};

export default config;
