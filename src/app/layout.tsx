import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";
import { BadgeToast } from "@/components/BadgeToast";
import { ProgressProvider } from "@/state/ProgressProvider";

const karrik = localFont({
  src: [
    { path: "./fonts/Karrik-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Karrik-Italic.woff2", weight: "400", style: "italic" }
  ],
  variable: "--font-karrik",
  display: "swap"
});

const departure = localFont({
  src: "./fonts/DepartureMono-Regular.woff2",
  variable: "--font-departure",
  display: "swap"
});

const martian = localFont({
  src: [
    { path: "./fonts/MartianMono-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/MartianMono-Bold.woff2", weight: "700", style: "normal" }
  ],
  variable: "--font-martian",
  display: "swap"
});

export const metadata: Metadata = { title: "AI Compass", description: "An interactive AI learning portal for grades 9–12." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${karrik.variable} ${departure.variable} ${martian.variable}`}><body className="font-sans">
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:shadow">Skip to content</a>
    <ProgressProvider>
      <header className="border-b border-slate-200 bg-white"><div className="shell flex flex-wrap items-center justify-between gap-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-black tracking-tight"><span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-100">🧭</span> AI Compass</Link>
        <nav aria-label="Main navigation" className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-slate-600"><Link className="hover:text-accent" href="/">Dashboard</Link><Link className="hover:text-accent" href="/modules">Modules</Link><Link className="hover:text-accent" href="/badges">Badges</Link><Link className="hover:text-accent" href="/glossary">Glossary</Link><Link className="hover:text-accent" href="/sources">Sources</Link><Link className="hover:text-accent" href="/about">About</Link></nav>
      </div></header>
      <main id="main">{children}</main><BadgeToast />
      <footer className="mt-20 border-t border-slate-200 bg-white"><div className="shell flex flex-col gap-2 py-8 text-sm text-slate-500 sm:flex-row sm:justify-between"><span>AI Compass · Learn with curiosity and care. Facts are cited on the <Link className="underline hover:text-accent" href="/sources">Sources</Link> page.</span><span>Your progress stays on this device.</span></div></footer>
    </ProgressProvider>
  </body></html>;
}
