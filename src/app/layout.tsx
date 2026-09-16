import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";
import { BadgeToast } from "@/components/BadgeToast";
import { Cursor } from "@/components/motion/Cursor";
import { PageTransition } from "@/components/motion/PageTransition";
import { Preloader } from "@/components/motion/Preloader";
import { Nav } from "@/components/Nav";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { Parallax } from "@/components/motion/Parallax";
import { AuthProvider } from "@/state/AuthProvider";
import { ProgressProvider } from "@/state/ProgressProvider";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { Celebration } from "@/components/Celebration";
import { Hud } from "@/components/Hud";
import { ProgressIsland } from "@/components/ProgressIsland";

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

export const viewport: Viewport = { themeColor: "#e9e7e1", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${karrik.variable} ${departure.variable} ${martian.variable}`}><body>
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-4 focus:py-3 focus:font-mono focus:text-xs focus:uppercase focus:tracking-wider">Skip to content</a>
      <AuthProvider>
      <ProgressProvider>
        <Preloader /><Nav /><ScrollProgress /><Cursor /><main id="main"><PageTransition>{children}</PageTransition></main><BadgeToast /><Celebration /><Hud /><ProgressIsland /><ServiceWorkerRegister />
        <footer className="mt-24 border-t border-line bg-paper pb-10"><div className="shell pt-16"><Parallax speed={-.15}><p className="font-display text-[14vw] leading-[.7] tracking-[-.05em] text-ink/75">AI Compass</p></Parallax><div className="mt-12 flex flex-col gap-3 border-t border-line py-6 font-mono text-[10px] uppercase tracking-[0.16em] text-ink/75 sm:flex-row sm:justify-between"><span>Learn with curiosity and care.</span><span className="flex flex-wrap gap-x-4 gap-y-2"><span>Local-first · No tracking · Grades 9–12</span><Link href="/sources" className="link-underline">Facts cited on the Sources page</Link></span></div></div></footer>
      </ProgressProvider>
    </AuthProvider>
  </body></html>;
}
