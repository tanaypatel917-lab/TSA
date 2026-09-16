"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { levelFor } from "@/engine/levels";
import { useProgress } from "@/state/ProgressProvider";

const links = [["Dashboard", "/"], ["Modules", "/modules"], ["Badges", "/badges"], ["Glossary", "/glossary"], ["About", "/about"]];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { state, hydrated } = useProgress();
  function closeMenu() {
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    const focusable = menu?.querySelectorAll<HTMLElement>("button, a");
    focusable?.[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { closeMenu(); return; }
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);
  return <header className={`fixed inset-x-0 top-0 z-30 transition-all duration-300 ${scrolled ? "is-scrolled border-b border-line bg-paper/85 backdrop-blur-md" : ""}`}><div className="shell flex h-20 items-center justify-between">
    <Link href="/" className="font-display text-3xl italic leading-none" onClick={closeMenu}>AI Compass</Link>
    <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">{links.map(([label, href], index) => <Link key={href} href={href} className="link-underline font-mono text-[10px] font-bold uppercase tracking-[0.18em]" data-cursor="hover"><span className="mr-2 text-accent">0{index + 1}</span>{label}</Link>)} </nav>
    {hydrated && state.startedAt && <span className="hidden rounded-full border border-line bg-paper/70 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider lg:block">{state.xp} XP · Lvl {levelFor(state.xp).name}</span>}
    <button ref={triggerRef} aria-label={open ? "Close menu" : "Open menu"} aria-controls="mobile-menu" aria-expanded={open} className="relative z-40 flex items-center gap-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[.16em] md:hidden" onClick={() => open ? closeMenu() : setOpen(true)} data-cursor="hover"><span className="relative grid h-5 w-6 place-items-center"><span className={`absolute h-px w-6 bg-ink transition-transform ${open ? "rotate-45" : "-translate-y-1.5"}`} /><span className={`absolute h-px w-6 bg-ink transition-transform ${open ? "-rotate-45" : "translate-y-1.5"}`} /></span><span>Menu</span></button>
  </div>{open && <div id="mobile-menu" ref={menuRef} role="dialog" aria-modal="true" aria-label="Mobile navigation" className="fixed inset-0 z-30 flex min-h-screen flex-col justify-center bg-ink px-5 text-paper md:hidden"><button className="absolute right-5 top-7 font-mono text-[10px] uppercase tracking-[.16em] text-paper/70" onClick={closeMenu}>Close ×</button><p className="eyebrow text-paper/50">Navigation</p><nav className="mt-8 space-y-5">{links.map(([label, href], index) => <Link key={href} href={href} onClick={closeMenu} className="block font-display text-5xl italic" style={{ animation: `reveal .5s ${index * 0.06}s both` }}>{label}<span className="ml-3 font-mono text-sm not-italic text-accent">0{index + 1}</span></Link>)}</nav></div>}</header>;
}
