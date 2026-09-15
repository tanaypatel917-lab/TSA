import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { BadgeToast } from "@/components/BadgeToast";
import { Hud } from "@/components/Hud";
import { SiteNav } from "@/components/SiteNav";
import { ProgressProvider } from "@/state/ProgressProvider";

export const metadata: Metadata = { title: "AI Compass", description: "An interactive AI learning portal for grades 9–12." };

const fontVars = {
  "--font-display": '"Helvetica Neue", "Inter", "Arial Black", Arial, sans-serif',
  "--font-mono": '"JetBrains Mono", "SF Mono", Menlo, Consolas, monospace'
} as React.CSSProperties;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" style={fontVars}><body>
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-signal focus:px-4 focus:py-3 focus:font-mono focus:text-xs focus:uppercase focus:text-ink">Skip to content</a>
    <ProgressProvider>
      <header className="sticky top-0 z-30 border-b border-ink bg-paper/90 backdrop-blur"><div className="shell flex flex-wrap items-center justify-between gap-4 py-4">
        <Link href="/" className="group flex items-center gap-3 font-display text-lg font-black uppercase tracking-[-0.03em]"><span aria-hidden="true" className="block h-3 w-3 bg-signal transition-transform group-hover:rotate-45" /> AI Compass<span className="mono-label ml-2 hidden text-mute sm:inline">/ grades 9–12</span></Link>
        <SiteNav />
      </div></header>
      <main id="main" className="pb-16">{children}</main><BadgeToast />
      <footer className="border-t border-ink"><div className="shell grid gap-8 py-12 md:grid-cols-[1fr_auto]">
        <p className="display-lg max-w-4xl">Learn with curiosity<span className="text-signal">.</span> Build with care<span className="text-signal">.</span></p>
        <div className="mono-label flex flex-col gap-2 text-mute md:text-right"><span>ai compass © {new Date().getFullYear()}</span><span>no accounts / no tracking</span><span>your progress stays on this device</span></div>
      </div></footer>
      <Hud />
    </ProgressProvider>
  </body></html>;
}
