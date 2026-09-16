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
        display: ["Instrument Serif", "Georgia", "serif"],
        sans: ["Inter Tight Variable", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono Variable", "ui-monospace", "monospace"]
      },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        rise: { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        blink: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0" } }
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        rise: "rise 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both",
        blink: "blink 1.2s steps(1) infinite"
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};

export default config;
