import type { Metadata } from "next";
import { Instrument_Serif, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { BadgeToast } from "@/components/BadgeToast";
import { Cursor } from "@/components/motion/Cursor";
import { Nav } from "@/components/Nav";
import { ProgressProvider } from "@/state/ProgressProvider";

export const metadata: Metadata = { title: "AI Compass", description: "An interactive AI learning portal for grades 9–12." };
const display = Instrument_Serif({ subsets: ["latin"], variable: "--font-display", style: "italic", weight: "400" });
const sans = Inter_Tight({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}><body>
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-4 focus:py-3 focus:font-mono focus:text-xs focus:uppercase focus:tracking-wider">Skip to content</a>
    <ProgressProvider>
      <Nav /><Cursor /><main id="main">{children}</main><BadgeToast />
      <footer className="mt-24 border-t border-line bg-paper"><div className="shell pt-16"><p className="font-display text-[14vw] leading-[.7] tracking-[-.05em] text-ink/10">AI Compass</p><div className="mt-12 flex flex-col gap-3 border-t border-line py-6 font-mono text-[10px] uppercase tracking-[0.16em] text-ink/60 sm:flex-row sm:justify-between"><span>Learn with curiosity and care.</span><span>Local-first · No tracking · Grades 9–12</span></div></div></footer>
    </ProgressProvider>
  </body></html>;
}
