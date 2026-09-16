import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";
import { BadgeToast } from "@/components/BadgeToast";
import { Hud } from "@/components/Hud";
import { SiteNav } from "@/components/SiteNav";
import { ProgressProvider } from "@/state/ProgressProvider";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const martian = localFont({
  src: [
    { path: "./fonts/MartianMono-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/MartianMono-Bold.woff2", weight: "700", style: "normal" }
  ],
  variable: "--font-mono",
  display: "swap"
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://tanaypatel917-lab.github.io"),
  title: { default: "AI Compass", template: "%s · AI Compass" },
  description: "An interactive AI learning portal for grades 9–12: fundamentals, tools and techniques, and responsible use, with XP, badges, and quizzes.",
  applicationName: "AI Compass",
  keywords: ["AI", "artificial intelligence", "high school", "learning", "ethics", "prompting"],
  manifest: `${basePath}/manifest.webmanifest`,
  icons: {
    icon: [
      { url: `${basePath}/icons/icon.svg`, type: "image/svg+xml" },
      { url: `${basePath}/icons/icon-192.png`, sizes: "192x192", type: "image/png" }
    ],
    apple: `${basePath}/icons/icon-192.png`
  },
  openGraph: {
    type: "website",
    siteName: "AI Compass",
    title: "AI Compass",
    description: "An interactive AI learning portal for grades 9–12: fundamentals, tools and techniques, and responsible use, with XP, badges, and quizzes.",
    url: `${basePath}/`,
    images: [{ url: `${basePath}/icons/og.png`, width: 1200, height: 630, alt: "AI Compass" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Compass",
    description: "An interactive AI learning portal for grades 9–12: fundamentals, tools and techniques, and responsible use, with XP, badges, and quizzes.",
    images: [`${basePath}/icons/og.png`]
  }
};

export const viewport: Viewport = { themeColor: "#0b0b0b", width: "device-width", initialScale: 1 };

const fontVars = {
  "--font-display": '"Helvetica Neue", "Inter", "Arial Black", Arial, sans-serif'
} as React.CSSProperties;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={martian.variable} style={fontVars}><body>
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-signal focus:px-4 focus:py-3 focus:font-mono focus:text-xs focus:uppercase focus:text-ink">Skip to content</a>
    <ProgressProvider>
      <header className="sticky top-0 z-30 border-b border-ink bg-paper/90 backdrop-blur"><div className="shell flex flex-wrap items-center justify-between gap-4 py-4">
        <Link href="/" className="group flex items-center gap-3 font-display text-lg font-black uppercase tracking-[-0.03em]"><span aria-hidden="true" className="block h-3 w-3 bg-signal transition-transform group-hover:rotate-45" /> AI Compass<span className="mono-label ml-2 hidden text-mute sm:inline">/ grades 9–12</span></Link>
        <SiteNav />
      </div></header>
      <main id="main" className="pb-16">{children}</main><BadgeToast /><ServiceWorkerRegister />
      <footer className="border-t border-ink"><div className="shell grid gap-8 py-12 md:grid-cols-[1fr_auto]">
        <p className="display-lg max-w-4xl">Learn with curiosity<span className="text-signal">.</span> Build with care<span className="text-signal">.</span></p>
        <div className="mono-label flex flex-col gap-2 text-mute md:text-right"><span>ai compass © {new Date().getFullYear()}</span><span>no accounts / no tracking</span><span>your progress stays on this device</span><Link href="/sources" className="underline decoration-signal underline-offset-4 hover:text-ink">facts cited on the sources page</Link></div>
      </div></footer>
      <Hud />
    </ProgressProvider>
  </body></html>;
}
