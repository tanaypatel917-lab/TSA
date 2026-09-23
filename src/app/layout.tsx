import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { BadgeToast } from "@/components/BadgeToast";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { MotionProvider } from "@/components/MotionPreferences";
import { IntroGate } from "@/components/IntroGate";
import { RevealObserver } from "@/components/RevealObserver";
import { PageTransitions } from "@/components/PageTransitions";
import { TypeField } from "@/components/TypeField";
import { TourGuide } from "@/components/TourGuide";
import { ProgressProvider } from "@/state/ProgressProvider";

const clash = localFont({ src: "../../public/fonts/clash-display-variable.woff2", variable: "--font-display", weight: "200 700", style: "normal", display: "swap" });
const uncut = localFont({ src: "../../public/fonts/uncut-sans-variable.woff2", variable: "--font-body", weight: "300 700", style: "normal", display: "swap" });

export const metadata: Metadata = { title: "Wordplay — Hands-on AI literacy", description: "Learn how AI works, test its answers, and make decisions you can explain. Hands-on AI literacy for grades 9–12." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${clash.variable} ${uncut.variable}`}><body><a href="#main" className="skip-link">Skip to content</a><MotionProvider><RevealObserver /><TypeField /><PageTransitions /><ProgressProvider><SiteNav /><IntroGate /><main id="main" tabIndex={-1}>{children}</main><BadgeToast /><TourGuide /><SiteFooter /></ProgressProvider></MotionProvider></body></html>;
}
