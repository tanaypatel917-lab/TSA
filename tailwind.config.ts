import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0b0b",
        paper: "#e9e7e1",
        line: "#cfccc3",
        accent: "#b02a08",
        signal: "#b02a08",
        signalBright: "#ff4f1f",
        mute: "#5c5c57",
        lime: "#c8f560",
        dark: "#141414"
      },
      fontFamily: {
        display: ["var(--font-karrik)", "system-ui", "sans-serif"],
        sans: ["var(--font-karrik)", "system-ui", "sans-serif"],
        mono: ["var(--font-martian)", "ui-monospace", "monospace"],
        pixel: ["var(--font-departure)", "var(--font-martian)", "monospace"]
      },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(calc(-100% - var(--gap)))" } },
        "marquee-vertical": { from: { transform: "translateY(0)" }, to: { transform: "translateY(calc(-100% - var(--gap)))" } },
        ripple: { "0%, 100%": { transform: "translate(-50%, -50%) scale(1)", opacity: "0.2" }, "50%": { transform: "translate(-50%, -50%) scale(1.08)", opacity: "0.05" } },
        shiny: { from: { backgroundPosition: "100% 0" }, to: { backgroundPosition: "-100% 0" } },
        rise: { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        blink: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0" } }
      },
      animation: {
        marquee: "marquee var(--duration) linear infinite",
        "marquee-vertical": "marquee-vertical var(--duration) linear infinite",
        ripple: "ripple 3s ease-out infinite",
        shiny: "shiny 2.5s ease-in-out infinite",
        rise: "rise 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both",
        blink: "blink 1.2s steps(1) infinite"
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};

export default config;
