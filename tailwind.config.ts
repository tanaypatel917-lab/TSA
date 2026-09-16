import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        paper: "#f8fafc",
        accent: "#4f46e5",
        glow: "#f59e0b"
      },
      fontFamily: {
        sans: ["var(--font-karrik)", "system-ui", "sans-serif"],
        mono: ["var(--font-martian)", "ui-monospace", "monospace"],
        pixel: ["var(--font-departure)", "var(--font-martian)", "monospace"]
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};

export default config;
