import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        paper: "#f8fafc",
        accent: "#6366f1",
        glow: "#f59e0b"
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};

export default config;
