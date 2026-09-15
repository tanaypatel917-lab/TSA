"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { levelFor } from "@/engine/levels";
import { useProgress } from "@/state/ProgressProvider";

const links = [["Dashboard", "/"], ["Modules", "/modules"], ["Badges", "/badges"], ["Glossary", "/glossary"], ["About", "/about"]];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { state, hydrated } = useProgress();
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 24); window.addEventListener("scroll", onScroll, { passive: true }); onScroll(); return () => window.removeEventListener("scroll", onScroll); }, []);
  return <header className={`fixed inset-x-0 top-0 z-30 transition-all duration-300 ${scrolled ? "is-scrolled border-b border-line bg-paper/85 backdrop-blur-md" : ""}`}><div className="shell flex h-20 items-center justify-between">
    <Link href="/" className="font-display text-3xl italic leading-none" onClick={() => setOpen(false)}>AI Compass</Link>
    <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">{links.map(([label, href], index) => <Link key={href} href={href} className="link-underline font-mono text-[10px] font-bold uppercase tracking-[0.18em]" data-cursor="hover"><span className="mr-2 text-accent">0{index + 1}</span>{label}</Link>)} </nav>
    {hydrated && state.startedAt && <span className="hidden rounded-full border border-line bg-paper/70 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider lg:block">{state.xp} XP · Lvl {levelFor(state.xp).name}</span>}
    <button aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} className="relative z-40 grid h-10 w-10 place-items-center md:hidden" onClick={() => setOpen(!open)}><span className={`absolute h-px w-6 bg-ink transition-transform ${open ? "rotate-45" : "-translate-y-1.5"}`} /><span className={`absolute h-px w-6 bg-ink transition-transform ${open ? "-rotate-45" : "translate-y-1.5"}`} /></button>
  </div>{open && <div className="fixed inset-0 z-30 flex min-h-screen flex-col justify-center bg-ink px-5 text-paper md:hidden"><p className="eyebrow text-paper/50">Navigation</p><nav className="mt-8 space-y-5">{links.map(([label, href], index) => <Link key={href} href={href} onClick={() => setOpen(false)} className="block font-display text-5xl italic" style={{ animation: `reveal .5s ${index * 0.06}s both` }}>{label}<span className="ml-3 font-mono text-sm not-italic text-accent">0{index + 1}</span></Link>)}</nav></div>}</header>;
}
